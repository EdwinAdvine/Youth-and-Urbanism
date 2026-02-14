"""
Permission System Utilities

Provides FastAPI dependencies for checking fine-grained permissions
against the permission matrix (role_permissions + user_permission_overrides).
"""

import logging
from typing import Optional, List, Dict, Any
from functools import lru_cache

from fastapi import Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.admin.permission import Permission, RolePermission, UserPermissionOverride
from app.utils.security import get_current_active_user

logger = logging.getLogger(__name__)


async def _check_permission(
    db: AsyncSession,
    user_id: str,
    user_role: str,
    permission_name: str,
) -> bool:
    """
    Check if a user has a specific permission.

    Resolution order:
    1. Check user-level overrides (explicit grant/deny per user)
    2. Check role-level permissions
    3. Default: deny
    """
    from datetime import datetime

    now = datetime.utcnow()

    # 1. Check user-specific overrides first
    override_query = (
        select(UserPermissionOverride)
        .join(Permission, Permission.id == UserPermissionOverride.permission_id)
        .where(
            and_(
                UserPermissionOverride.user_id == user_id,
                Permission.name == permission_name,
                Permission.is_active == True,
            )
        )
    )

    result = await db.execute(override_query)
    override = result.scalar_one_or_none()

    if override:
        # Check expiration
        if override.expires_at and override.expires_at < now:
            return False  # Expired override, treat as no override
        return override.granted

    # 2. Check role-level permissions
    role_query = (
        select(RolePermission)
        .join(Permission, Permission.id == RolePermission.permission_id)
        .where(
            and_(
                RolePermission.role == user_role,
                Permission.name == permission_name,
                Permission.is_active == True,
            )
        )
    )

    result = await db.execute(role_query)
    role_perm = result.scalar_one_or_none()

    if role_perm:
        # Check expiration for temporary role permissions
        if role_perm.expires_at and role_perm.expires_at < now:
            return False
        return True

    # 3. Default: admin role always has access, others denied
    if user_role == "admin":
        return True

    return False


async def get_user_permissions(
    db: AsyncSession,
    user_id: str,
    user_role: str,
) -> List[Dict[str, Any]]:
    """Get all active permissions for a user (combined role + overrides)."""
    from datetime import datetime

    now = datetime.utcnow()

    # Get all active permissions
    all_perms_query = select(Permission).where(Permission.is_active == True)
    result = await db.execute(all_perms_query)
    all_permissions = result.scalars().all()

    # Get role permissions
    role_perms_query = (
        select(RolePermission.permission_id)
        .where(
            and_(
                RolePermission.role == user_role,
                (RolePermission.expires_at == None) | (RolePermission.expires_at > now),
            )
        )
    )
    result = await db.execute(role_perms_query)
    role_perm_ids = {row[0] for row in result.all()}

    # Get user overrides
    override_query = (
        select(UserPermissionOverride)
        .where(
            and_(
                UserPermissionOverride.user_id == user_id,
                (UserPermissionOverride.expires_at == None) | (UserPermissionOverride.expires_at > now),
            )
        )
    )
    result = await db.execute(override_query)
    overrides = {o.permission_id: o.granted for o in result.scalars().all()}

    # Build permission list
    user_perms = []
    for perm in all_permissions:
        # Check override first, then role permission
        if perm.id in overrides:
            granted = overrides[perm.id]
        elif perm.id in role_perm_ids:
            granted = True
        elif user_role == "admin":
            granted = True  # Admin has all permissions by default
        else:
            granted = False

        user_perms.append({
            "id": str(perm.id),
            "name": perm.name,
            "resource": perm.resource,
            "action": perm.action,
            "granted": granted,
            "field_restrictions": perm.field_restrictions,
        })

    return user_perms


def require_permission(permission_name: str):
    """
    FastAPI dependency that checks if the current user has a specific permission.

    Usage:
        @router.get("/users")
        async def list_users(
            current_user: dict = Depends(require_permission("users.read"))
        ):
            ...
    """

    async def permission_checker(
        current_user: dict = Depends(get_current_active_user),
        db: AsyncSession = Depends(get_db),
    ) -> dict:
        user_id = current_user.get("id") or current_user.get("user_id")
        user_role = current_user.get("role", "")

        # Quick check: admin role bypasses permission check
        if user_role == "admin":
            return current_user

        # Staff and other roles need explicit permission check
        has_perm = await _check_permission(db, user_id, user_role, permission_name)

        if not has_perm:
            logger.warning(
                f"Permission denied: user={user_id}, role={user_role}, "
                f"permission={permission_name}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission_name}",
            )

        return current_user

    return permission_checker


def verify_staff_access():
    """
    FastAPI dependency to verify staff role access.
    Only allows users with the 'staff' role (not admin).

    Usage:
        @router.get("/staff/something")
        async def staff_endpoint(
            current_user: dict = Depends(verify_staff_access())
        ):
            ...
    """

    async def staff_checker(
        current_user: dict = Depends(get_current_active_user),
    ) -> dict:
        role = current_user.get("role", "")
        if role != "staff":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Staff role required.",
            )
        return current_user

    return staff_checker


def verify_staff_or_admin_access():
    """
    FastAPI dependency to verify staff or admin role access.
    Allows both staff and admin roles.
    """

    async def checker(
        current_user: dict = Depends(get_current_active_user),
    ) -> dict:
        role = current_user.get("role", "")
        if role not in ("admin", "staff"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Staff or admin role required.",
            )
        return current_user

    return checker


def verify_team_lead():
    """
    FastAPI dependency to verify the current user is a department lead.
    Used for team pulse / workload distribution endpoints.
    """

    async def team_lead_checker(
        current_user: dict = Depends(get_current_active_user),
        db: AsyncSession = Depends(get_db),
    ) -> dict:
        role = current_user.get("role", "")

        # Admins bypass team lead check
        if role == "admin":
            return current_user

        if role != "staff":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Staff role required.",
            )

        user_id = current_user.get("id") or current_user.get("user_id")

        # Check if user is a department lead
        from app.models.staff.staff_profile import StaffProfile
        result = await db.execute(
            select(StaffProfile).where(
                StaffProfile.user_id == user_id,
                StaffProfile.is_department_lead == True,
            )
        )
        profile = result.scalar_one_or_none()

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Department lead privileges required.",
            )

        return current_user

    return team_lead_checker


def verify_partner_or_admin_access():
    """
    FastAPI dependency to verify partner or admin role access.
    Allows both partner and admin roles.

    Usage:
        @router.get("/partner/something")
        async def partner_endpoint(
            current_user: dict = Depends(verify_partner_or_admin_access())
        ):
            ...
    """

    async def checker(
        current_user: dict = Depends(get_current_active_user),
    ) -> dict:
        role = current_user.get("role", "")
        if role not in ("admin", "partner"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Partner or admin role required.",
            )
        return current_user

    return checker


def verify_admin_access():
    """
    FastAPI dependency to verify admin role access.
    Reusable across all admin endpoints.

    Usage:
        @router.get("/admin/something")
        async def admin_endpoint(
            current_user: dict = Depends(verify_admin_access())
        ):
            ...
    """

    async def admin_checker(
        current_user: dict = Depends(get_current_active_user),
    ) -> dict:
        role = current_user.get("role", "")
        if role not in ("admin", "staff"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin or staff role required.",
            )
        return current_user

    return admin_checker
