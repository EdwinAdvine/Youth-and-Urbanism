"""
Staff Account API Endpoints

Provides REST endpoints for staff account self-service:
- Profile retrieval and update
- Preferences management (view mode, theme, layout)
- Notification preference management
- Security operations (password change, session listing)
- Personal audit log

All endpoints require staff or admin role access.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_staff_or_admin_access

from app.services.staff.account_service import AccountService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Staff Account"])


# ------------------------------------------------------------------
# Pydantic request models
# ------------------------------------------------------------------
class UpdateProfileRequest(BaseModel):
    """Payload for updating the staff member's profile."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    department: Optional[str] = None


class UpdatePreferencesRequest(BaseModel):
    """Payload for updating display preferences."""
    view_mode: Optional[str] = None  # 'compact' | 'comfortable' | 'spacious'
    theme: Optional[str] = None  # 'light' | 'dark' | 'system'
    layout: Optional[str] = None  # 'sidebar' | 'topbar'
    language: Optional[str] = None
    timezone: Optional[str] = None


class UpdateNotificationPrefsRequest(BaseModel):
    """Payload for updating notification preferences."""
    email_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    sms_enabled: Optional[bool] = None
    digest_frequency: Optional[str] = None  # 'realtime' | 'hourly' | 'daily'
    categories: Optional[Dict[str, bool]] = None


class ChangePasswordRequest(BaseModel):
    """Payload for changing the account password."""
    current_password: str
    new_password: str


# ------------------------------------------------------------------
# GET /profile
# ------------------------------------------------------------------
@router.get("/profile")
async def get_profile(
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve the authenticated staff member's profile."""
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await AccountService.get_profile(db, user_id=user_id)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch staff profile")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile.",
        ) from exc


# ------------------------------------------------------------------
# PATCH /profile
# ------------------------------------------------------------------
@router.patch("/profile")
async def update_profile(
    body: UpdateProfileRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Update the authenticated staff member's profile fields."""
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        updates = body.model_dump(exclude_unset=True)
        data = await AccountService.update_profile(
            db, user_id=user_id, updates=updates
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update staff profile")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile.",
        ) from exc


# ------------------------------------------------------------------
# PATCH /preferences
# ------------------------------------------------------------------
@router.patch("/preferences")
async def update_preferences(
    body: UpdatePreferencesRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Update display preferences (view mode, theme, layout, etc.)."""
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        updates = body.model_dump(exclude_unset=True)
        data = await AccountService.update_preferences(
            db, user_id=user_id, updates=updates
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to update preferences")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update preferences.",
        ) from exc


# ------------------------------------------------------------------
# GET /notifications/preferences
# ------------------------------------------------------------------
@router.get("/notifications/preferences")
async def get_notification_preferences(
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve the current notification preferences."""
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await AccountService.get_notification_preferences(
            db, user_id=user_id
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch notification preferences")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch notification preferences.",
        ) from exc


# ------------------------------------------------------------------
# PATCH /notifications/preferences
# ------------------------------------------------------------------
@router.patch("/notifications/preferences")
async def update_notification_preferences(
    body: UpdateNotificationPrefsRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Update notification preferences."""
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        updates = body.model_dump(exclude_unset=True)
        data = await AccountService.update_notification_preferences(
            db, user_id=user_id, updates=updates
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to update notification preferences")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification preferences.",
        ) from exc


# ------------------------------------------------------------------
# POST /security/change-password
# ------------------------------------------------------------------
@router.post("/security/change-password")
async def change_password(
    body: ChangePasswordRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Change the account password.

    Requires the current password for verification and validates
    the new password against security requirements.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        result = await AccountService.change_password(
            db,
            user_id=user_id,
            current_password=body.current_password,
            new_password=body.new_password,
        )
        if result is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect.",
            )
        return {"status": "success", "message": "Password changed successfully."}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to change password")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password.",
        ) from exc


# ------------------------------------------------------------------
# GET /security/sessions
# ------------------------------------------------------------------
@router.get("/security/sessions")
async def list_active_sessions(
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List active login sessions for the authenticated staff member.

    Returns device info, IP address, last active timestamp, and
    session age.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await AccountService.list_active_sessions(db, user_id=user_id)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list active sessions")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list active sessions.",
        ) from exc


# ------------------------------------------------------------------
# GET /audit-log
# ------------------------------------------------------------------
@router.get("/audit-log")
async def get_own_audit_log(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated audit log of the authenticated staff member's own actions.

    Returns action type, resource, timestamp, and details.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await AccountService.get_audit_log(
            db, user_id=user_id, page=page, page_size=page_size
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch audit log")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch audit log.",
        ) from exc
