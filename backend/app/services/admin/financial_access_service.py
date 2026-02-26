"""
Financial Access Service

Business logic for managing financial permission grants/revocations.
Used by the Super Admin to control who can access financial data.
"""

import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, and_, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.admin.permission import Permission, UserPermissionOverride
from app.models.user import User

logger = logging.getLogger(__name__)

FINANCIAL_PERMISSION_PREFIX = "finance."


class FinancialAccessService:
    """Manage per-user financial permission grants."""

    @staticmethod
    async def list_users_with_financial_access(
        db: AsyncSession,
    ) -> List[Dict[str, Any]]:
        """
        List all admins and staff with their financial permission status.

        Returns a list of user dicts, each containing:
        - user info (id, email, role, full_name, is_super_admin)
        - granted_permissions: list of financial permission names explicitly granted
        """
        # Get all financial permissions
        perms_result = await db.execute(
            select(Permission).where(
                Permission.name.like(f"{FINANCIAL_PERMISSION_PREFIX}%"),
                Permission.is_active == True,
            )
        )
        financial_perms = perms_result.scalars().all()
        perm_map = {p.id: p.name for p in financial_perms}

        # Get all admins and staff
        users_result = await db.execute(
            select(User).where(
                User.role.in_(["admin", "staff"]),
                User.is_active == True,
                User.is_deleted == False,
            ).order_by(User.role, User.created_at)
        )
        users = users_result.scalars().all()

        result = []
        for user in users:
            # Get user's financial permission overrides
            overrides_result = await db.execute(
                select(UserPermissionOverride).where(
                    UserPermissionOverride.user_id == user.id,
                    UserPermissionOverride.permission_id.in_(list(perm_map.keys())),
                    UserPermissionOverride.granted == True,
                )
            )
            overrides = overrides_result.scalars().all()
            granted_names = [perm_map[o.permission_id] for o in overrides if o.permission_id in perm_map]

            full_name = user.profile_data.get("full_name", "") if user.profile_data else ""

            result.append({
                "id": str(user.id),
                "email": user.email,
                "role": user.role,
                "full_name": full_name,
                "is_super_admin": user.is_super_admin,
                "granted_permissions": granted_names,
            })

        return result

    @staticmethod
    async def grant_financial_permissions(
        db: AsyncSession,
        user_id: UUID,
        permission_names: List[str],
        granted_by: UUID,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Grant one or more financial permissions to a user.

        Creates UserPermissionOverride records for each permission.
        """
        # Verify target user exists and is admin/staff
        user_result = await db.execute(
            select(User).where(User.id == user_id, User.is_active == True)
        )
        target_user = user_result.scalar_one_or_none()
        if not target_user:
            raise ValueError("User not found")
        if target_user.role not in ("admin", "staff"):
            raise ValueError("Financial access can only be granted to admin or staff users")

        granted = []
        for perm_name in permission_names:
            if not perm_name.startswith(FINANCIAL_PERMISSION_PREFIX):
                continue

            # Find the permission
            perm_result = await db.execute(
                select(Permission).where(
                    Permission.name == perm_name,
                    Permission.is_active == True,
                )
            )
            perm = perm_result.scalar_one_or_none()
            if not perm:
                continue

            # Check if override already exists
            existing = await db.execute(
                select(UserPermissionOverride).where(
                    UserPermissionOverride.user_id == user_id,
                    UserPermissionOverride.permission_id == perm.id,
                )
            )
            override = existing.scalar_one_or_none()

            if override:
                # Update existing override to granted
                override.granted = True
                override.granted_by = granted_by
                override.reason = reason
            else:
                # Create new override
                override = UserPermissionOverride(
                    user_id=user_id,
                    permission_id=perm.id,
                    granted=True,
                    granted_by=granted_by,
                    reason=reason or "Financial access granted by Super Admin",
                )
                db.add(override)

            granted.append(perm_name)

        await db.commit()

        full_name = target_user.profile_data.get("full_name", "") if target_user.profile_data else ""
        logger.info(
            "Granted financial permissions %s to user %s (%s)",
            granted, user_id, full_name,
        )

        return {
            "user_id": str(user_id),
            "granted_permissions": granted,
        }

    @staticmethod
    async def revoke_financial_permission(
        db: AsyncSession,
        user_id: UUID,
        permission_name: str,
    ) -> Dict[str, Any]:
        """Revoke a specific financial permission from a user."""
        if not permission_name.startswith(FINANCIAL_PERMISSION_PREFIX):
            raise ValueError("Not a financial permission")

        perm_result = await db.execute(
            select(Permission).where(Permission.name == permission_name)
        )
        perm = perm_result.scalar_one_or_none()
        if not perm:
            raise ValueError(f"Permission '{permission_name}' not found")

        # Find and remove/deny the override
        existing = await db.execute(
            select(UserPermissionOverride).where(
                UserPermissionOverride.user_id == user_id,
                UserPermissionOverride.permission_id == perm.id,
            )
        )
        override = existing.scalar_one_or_none()

        if override:
            # Set to denied instead of deleting — explicit deny
            override.granted = False
            override.reason = "Financial access revoked by Super Admin"
        else:
            # Create an explicit denial
            override = UserPermissionOverride(
                user_id=user_id,
                permission_id=perm.id,
                granted=False,
                reason="Financial access denied by Super Admin",
            )
            db.add(override)

        await db.commit()

        logger.info("Revoked permission %s from user %s", permission_name, user_id)

        return {
            "user_id": str(user_id),
            "revoked_permission": permission_name,
        }
