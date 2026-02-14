"""
Admin Permissions API Endpoint

Provides a lightweight endpoint for the frontend to load the current
user's resolved permission set (role permissions + user-level overrides).

The frontend `useAdminPermissions` hook calls GET /permissions/me on
mount to hydrate the client-side permission cache.
"""

import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_admin_access, get_user_permissions

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/permissions", tags=["Admin - Permissions"])


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
