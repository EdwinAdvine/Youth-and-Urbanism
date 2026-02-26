"""
Permission Service — Phase 3 (People & Access)

Manages the permission matrix: list permissions, grant/revoke role
permissions, and user-level overrides.
"""

import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, and_, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin.permission import Permission, RolePermission, UserPermissionOverride

logger = logging.getLogger(__name__)

ROLES = ["admin", "staff", "instructor", "parent", "partner", "student"]


class PermissionService:

    @staticmethod
    async def list_permissions(db: AsyncSession) -> List[Dict[str, Any]]:
        """Return all defined permissions."""
        q = select(Permission).where(Permission.is_active == True).order_by(Permission.resource, Permission.action)
        result = await db.execute(q)
        rows = result.scalars().all()
        return [
            {
                "id": str(r.id),
                "name": r.name,
                "description": r.description,
                "resource": r.resource,
                "action": r.action,
                "field_restrictions": r.field_restrictions,
                "is_active": r.is_active,
            }
            for r in rows
        ]

    @staticmethod
    async def get_permission_matrix(db: AsyncSession) -> Dict[str, List[Dict[str, Any]]]:
        """Build full matrix: { role: [ { permission_id, name, granted, expires_at } ] }."""
        perms_q = select(Permission).where(Permission.is_active == True)
        perms_result = await db.execute(perms_q)
        all_perms = perms_result.scalars().all()

        matrix: Dict[str, List[Dict[str, Any]]] = {}
        for role in ROLES:
            rp_q = select(RolePermission).where(RolePermission.role == role)
            rp_result = await db.execute(rp_q)
            granted_ids = {rp.permission_id for rp in rp_result.scalars().all()}

            matrix[role] = [
                {
                    "permission_id": str(p.id),
                    "permission_name": p.name,
                    "granted": p.id in granted_ids,
                    "expires_at": None,
                }
                for p in all_perms
            ]
        return matrix

    @staticmethod
    async def grant_role_permission(
        db: AsyncSession, role: str, permission_id: UUID, granted_by: UUID
    ) -> None:
        existing = await db.execute(
            select(RolePermission).where(
                and_(RolePermission.role == role, RolePermission.permission_id == permission_id)
            )
        )
        if existing.scalar_one_or_none():
            return  # already granted
        rp = RolePermission(role=role, permission_id=permission_id, granted_by=granted_by)
        db.add(rp)
        await db.commit()

    @staticmethod
    async def revoke_role_permission(db: AsyncSession, role: str, permission_id: UUID) -> None:
        await db.execute(
            delete(RolePermission).where(
                and_(RolePermission.role == role, RolePermission.permission_id == permission_id)
            )
        )
        await db.commit()

    @staticmethod
    async def set_user_override(
        db: AsyncSession, user_id: UUID, permission_id: UUID,
        granted: bool, reason: Optional[str], granted_by: UUID,
        expires_at=None,
    ) -> None:
        existing_q = select(UserPermissionOverride).where(
            and_(
                UserPermissionOverride.user_id == user_id,
                UserPermissionOverride.permission_id == permission_id,
            )
        )
        result = await db.execute(existing_q)
        override = result.scalar_one_or_none()

        if override:
            override.granted = granted
            override.reason = reason
            override.expires_at = expires_at
        else:
            override = UserPermissionOverride(
                user_id=user_id,
                permission_id=permission_id,
                granted=granted,
                granted_by=granted_by,
                reason=reason,
                expires_at=expires_at,
            )
            db.add(override)
        await db.commit()

    @staticmethod
    async def get_user_permissions(db: AsyncSession, user_id: UUID, role: str) -> List[str]:
        """Return effective permission names for a user (role + overrides)."""
        # Role permissions
        rp_q = (
            select(Permission.name)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .where(RolePermission.role == role)
        )
        rp_result = await db.execute(rp_q)
        granted = set(rp_result.scalars().all())

        # User overrides
        uo_q = (
            select(UserPermissionOverride, Permission.name)
            .join(Permission, Permission.id == UserPermissionOverride.permission_id)
            .where(UserPermissionOverride.user_id == user_id)
        )
        uo_result = await db.execute(uo_q)
        for override, perm_name in uo_result.all():
            if override.granted:
                granted.add(perm_name)
            else:
                granted.discard(perm_name)

        return sorted(granted)
