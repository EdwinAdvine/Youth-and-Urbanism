"""
Admin User Management API Endpoints - Phase 3 (People & Access)

Provides REST endpoints for managing platform users:
- Paginated user listing with search, filter, and sort
- User detail retrieval
- Deactivate / Reactivate users
- Update user role
- Activity timeline from audit logs
- Bulk actions (deactivate / reactivate)
- Export users as CSV

All endpoints require admin or staff role access.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_admin_access
from app.services.admin.user_management_service import user_management_service
from app.services.admin.audit_service import audit_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Admin - Users"])


# ------------------------------------------------------------------
# Pydantic request models
# ------------------------------------------------------------------
class BulkActionRequest(BaseModel):
    user_ids: List[str]
    action: str  # 'deactivate' | 'reactivate'


class UpdateRoleRequest(BaseModel):
    role: str


# ------------------------------------------------------------------
# GET / - list users (paginated, searchable, filterable)
# ------------------------------------------------------------------
@router.get("/")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    sort_by: str = Query("created_at"),
    sort_dir: str = Query("desc"),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated user list with search, role filter, status filter, and sorting.
    """
    try:
        data = await user_management_service.list_users(
            db,
            page=page,
            page_size=page_size,
            search=search,
            role_filter=role,
            status_filter=status_filter,
            sort_by=sort_by,
            sort_dir=sort_dir,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list users")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list users.",
        ) from exc


# ------------------------------------------------------------------
# GET /export - export users CSV
# ------------------------------------------------------------------
@router.get("/export")
async def export_users(
    role: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
):
    """Export users as CSV download."""
    try:
        csv_string = await user_management_service.export_users(
            db,
            role_filter=role,
            status_filter=status_filter,
            search=search,
        )

        # Log the export action
        actor_id = current_user.get("id") or current_user.get("user_id")
        await audit_service.log_action(
            db,
            actor_id=actor_id,
            actor_email=current_user.get("email", ""),
            actor_role=current_user.get("role", ""),
            action="export_users",
            resource_type="user",
            details={"role": role, "status": status_filter, "search": search},
        )

        import io
        buffer = io.BytesIO(csv_string.encode("utf-8"))
        return StreamingResponse(
            buffer,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=users_export.csv"},
        )
    except Exception as exc:
        logger.exception("Failed to export users")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export users.",
        ) from exc


# ------------------------------------------------------------------
# POST /bulk - bulk actions
# ------------------------------------------------------------------
@router.post("/bulk")
async def bulk_action(
    body: BulkActionRequest,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Perform bulk deactivate/reactivate on multiple users."""
    try:
        result = await user_management_service.bulk_action(
            db,
            user_ids=body.user_ids,
            action=body.action,
        )

        # Log the bulk action
        actor_id = current_user.get("id") or current_user.get("user_id")
        await audit_service.log_action(
            db,
            actor_id=actor_id,
            actor_email=current_user.get("email", ""),
            actor_role=current_user.get("role", ""),
            action=f"bulk_{body.action}",
            resource_type="user",
            details={"user_ids": body.user_ids, "affected": result["affected"]},
        )

        return {"status": "success", "data": result}
    except Exception as exc:
        logger.exception("Failed to perform bulk action")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform bulk action.",
        ) from exc


# ------------------------------------------------------------------
# GET /{user_id} - user detail
# ------------------------------------------------------------------
@router.get("/{user_id}")
async def get_user_detail(
    user_id: str,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get detailed user profile."""
    try:
        data = await user_management_service.get_user_detail(db, user_id)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to get user detail")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user detail.",
        ) from exc


# ------------------------------------------------------------------
# PUT /{user_id}/deactivate
# ------------------------------------------------------------------
@router.put("/{user_id}/deactivate")
async def deactivate_user(
    user_id: str,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Deactivate a user account."""
    try:
        data = await user_management_service.deactivate_user(db, user_id)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        # Log the action
        actor_id = current_user.get("id") or current_user.get("user_id")
        await audit_service.log_action(
            db,
            actor_id=actor_id,
            actor_email=current_user.get("email", ""),
            actor_role=current_user.get("role", ""),
            action="deactivate_user",
            resource_type="user",
            resource_id=user_id,
        )

        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to deactivate user")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate user.",
        ) from exc


# ------------------------------------------------------------------
# PUT /{user_id}/reactivate
# ------------------------------------------------------------------
@router.put("/{user_id}/reactivate")
async def reactivate_user(
    user_id: str,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Reactivate a user account."""
    try:
        data = await user_management_service.reactivate_user(db, user_id)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        # Log the action
        actor_id = current_user.get("id") or current_user.get("user_id")
        await audit_service.log_action(
            db,
            actor_id=actor_id,
            actor_email=current_user.get("email", ""),
            actor_role=current_user.get("role", ""),
            action="reactivate_user",
            resource_type="user",
            resource_id=user_id,
        )

        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to reactivate user")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reactivate user.",
        ) from exc


# ------------------------------------------------------------------
# PUT /{user_id}/role - update user role
# ------------------------------------------------------------------
@router.put("/{user_id}/role")
async def update_user_role(
    user_id: str,
    body: UpdateRoleRequest,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Change a user's role."""
    try:
        data = await user_management_service.update_user_role(db, user_id, body.role)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found or invalid role.",
            )

        # Log the action
        actor_id = current_user.get("id") or current_user.get("user_id")
        await audit_service.log_action(
            db,
            actor_id=actor_id,
            actor_email=current_user.get("email", ""),
            actor_role=current_user.get("role", ""),
            action="update_user_role",
            resource_type="user",
            resource_id=user_id,
            details={"new_role": body.role},
        )

        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update user role")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user role.",
        ) from exc


# ------------------------------------------------------------------
# GET /{user_id}/activity - user activity timeline
# ------------------------------------------------------------------
@router.get("/{user_id}/activity")
async def get_user_activity(
    user_id: str,
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get activity timeline for a user from audit logs."""
    try:
        data = await user_management_service.get_user_activity(
            db, user_id, limit=limit
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to get user activity")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user activity.",
        ) from exc
