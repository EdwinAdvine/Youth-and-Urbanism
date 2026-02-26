"""
Admin Permissions API Endpoints

Provides CRUD endpoints for the RBAC (Role-Based Access Control) system.

Endpoints:
  GET  /permissions/me                      - Current user's resolved permissions
  GET  /permissions                         - List all defined permissions (admin only)
  GET  /permissions/matrix                  - Full permission matrix (role -> permissions)
  PUT  /permissions/roles/{role_name}       - Grant or revoke a permission for a role
  POST /permissions/users/{user_id}/overrides - Create/update a user-level permission override
  GET  /permissions/users/{user_id}         - Effective permissions for a specific user

The frontend `useAdminPermissions` hook calls GET /permissions/me on
mount to hydrate the client-side permission cache.
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.admin.permissions import (
    PermissionMatrixResponse,
    RolePermissionUpdate,
    UserOverrideRequest,
)
from app.services.admin.permission_service import PermissionService, ROLES
from app.utils.permissions import verify_admin_access, get_user_permissions

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/permissions", tags=["Admin - Permissions"])


# ---------------------------------------------------------------------------
# GET /permissions/me  (existing endpoint)
# ---------------------------------------------------------------------------

@router.get("/me")
async def get_my_permissions(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get all resolved permissions for the currently authenticated user.

    The response includes every permission in the system together with
    a ``granted`` boolean that accounts for role-level defaults and
    any user-specific overrides.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        user_role = current_user.get("role", "")

        perms = await get_user_permissions(db, user_id, user_role)

        return {
            "status": "success",
            "data": {
                "user_id": user_id,
                "role": user_role,
                "permissions": perms,
            },
        }
    except Exception as exc:
        logger.exception("Failed to fetch user permissions")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user permissions.",
        ) from exc


# ---------------------------------------------------------------------------
# GET /permissions  (list all permissions -- admin only)
# ---------------------------------------------------------------------------

@router.get("")
async def list_permissions(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List every defined permission in the system.

    Only administrators and staff members with admin access may call this
    endpoint.  The result is an array of permission objects sorted by
    resource and action.
    """
    try:
        permissions = await PermissionService.list_permissions(db)
        return {
            "status": "success",
            "data": {
                "permissions": permissions,
                "total": len(permissions),
            },
        }
    except Exception as exc:
        logger.exception("Failed to list permissions")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list permissions.",
        ) from exc


# ---------------------------------------------------------------------------
# GET /permissions/matrix  (full role -> permissions grid)
# ---------------------------------------------------------------------------

@router.get("/matrix")
async def get_permission_matrix(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Return the full permission matrix mapping each role to its list of
    permissions with a ``granted`` flag.

    This powers the admin Roles & Permissions page where admins can
    toggle individual permissions per role.
    """
    try:
        matrix = await PermissionService.get_permission_matrix(db)
        return {
            "status": "success",
            "data": {
                "roles": matrix,
                "available_roles": ROLES,
            },
        }
    except Exception as exc:
        logger.exception("Failed to fetch permission matrix")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch permission matrix.",
        ) from exc


# ---------------------------------------------------------------------------
# PUT /permissions/roles/{role_name}  (grant / revoke a role permission)
# ---------------------------------------------------------------------------

@router.put("/roles/{role_name}")
async def update_role_permission(
    role_name: str,
    body: RolePermissionUpdate,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Grant or revoke a single permission for a given role.

    Path parameters:
        role_name -- one of: admin, staff, instructor, parent, partner, student

    Body:
        permission_id -- UUID of the permission to grant/revoke
        granted       -- ``true`` to grant, ``false`` to revoke
    """
    # Validate role name
    if role_name not in ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{role_name}'. Must be one of: {', '.join(ROLES)}",
        )

    admin_id = current_user.get("id") or current_user.get("user_id")

    try:
        if body.granted:
            await PermissionService.grant_role_permission(
                db,
                role=role_name,
                permission_id=body.permission_id,
                granted_by=admin_id,
            )
            action = "granted"
        else:
            await PermissionService.revoke_role_permission(
                db,
                role=role_name,
                permission_id=body.permission_id,
            )
            action = "revoked"

        logger.info(
            "Permission %s %s for role '%s' by admin %s",
            body.permission_id,
            action,
            role_name,
            admin_id,
        )

        return {
            "status": "success",
            "message": f"Permission {action} for role '{role_name}'.",
            "data": {
                "role": role_name,
                "permission_id": str(body.permission_id),
                "granted": body.granted,
            },
        }
    except Exception as exc:
        logger.exception("Failed to update role permission")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update role permission.",
        ) from exc


# ---------------------------------------------------------------------------
# POST /permissions/users/{user_id}/overrides  (create user override)
# ---------------------------------------------------------------------------

@router.post("/users/{user_id}/overrides", status_code=status.HTTP_201_CREATED)
async def create_user_permission_override(
    user_id: UUID,
    body: UserOverrideRequest,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Create or update a user-level permission override.

    Overrides take precedence over role-level permissions during
    permission resolution.  Use ``granted=true`` to explicitly grant
    a permission that the user's role would not normally have, or
    ``granted=false`` to deny a permission that the role normally allows.

    An optional ``expires_in_days`` field makes the override temporary.
    """
    # Verify target user exists
    result = await db.execute(
        select(User).where(User.id == user_id, User.is_deleted == False)
    )
    target_user = result.scalar_one_or_none()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id '{user_id}' not found.",
        )

    admin_id = current_user.get("id") or current_user.get("user_id")

    # Compute optional expiration date
    expires_at = None
    if body.expires_in_days is not None and body.expires_in_days > 0:
        expires_at = datetime.utcnow() + timedelta(days=body.expires_in_days)

    try:
        await PermissionService.set_user_override(
            db,
            user_id=user_id,
            permission_id=body.permission_id,
            granted=body.granted,
            reason=body.reason,
            granted_by=admin_id,
            expires_at=expires_at,
        )

        logger.info(
            "User override set for user %s, permission %s, granted=%s by admin %s",
            user_id,
            body.permission_id,
            body.granted,
            admin_id,
        )

        return {
            "status": "success",
            "message": "User permission override saved.",
            "data": {
                "user_id": str(user_id),
                "permission_id": str(body.permission_id),
                "granted": body.granted,
                "reason": body.reason,
                "expires_at": expires_at.isoformat() if expires_at else None,
            },
        }
    except Exception as exc:
        logger.exception("Failed to set user permission override")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to set user permission override.",
        ) from exc


# ---------------------------------------------------------------------------
# GET /permissions/users/{user_id}  (effective permissions for a user)
# ---------------------------------------------------------------------------

@router.get("/users/{user_id}")
async def get_user_effective_permissions(
    user_id: UUID,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Return the effective (resolved) permissions for a specific user.

    This combines the user's role-level permissions with any user-level
    overrides that are currently active.  Useful for the admin UI when
    inspecting or troubleshooting a particular user's access.
    """
    # Look up the target user to get their role
    result = await db.execute(
        select(User).where(User.id == user_id, User.is_deleted == False)
    )
    target_user = result.scalar_one_or_none()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id '{user_id}' not found.",
        )

    try:
        perms = await get_user_permissions(db, str(target_user.id), target_user.role)

        return {
            "status": "success",
            "data": {
                "user_id": str(target_user.id),
                "email": target_user.email,
                "role": target_user.role,
                "permissions": perms,
                "total": len(perms),
                "granted_count": sum(1 for p in perms if p.get("granted")),
            },
        }
    except Exception as exc:
        logger.exception("Failed to fetch permissions for user %s", user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user permissions.",
        ) from exc
