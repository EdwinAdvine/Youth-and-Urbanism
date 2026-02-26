"""
Admin Account API Endpoints

Provides REST endpoints for admin account management:
- Admin profile retrieval and update
- Preferences retrieval and update
- Admin notification listing and read status management

All endpoints require admin or staff role access.
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_admin_access

logger = logging.getLogger(__name__)

router = APIRouter()


# ------------------------------------------------------------------
# Pydantic request models
# ------------------------------------------------------------------

class ProfileUpdateRequest(BaseModel):
    """Request body for updating admin profile."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class PreferencesUpdateRequest(BaseModel):
    """Request body for updating admin preferences."""
    theme: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    dashboard_layout: Optional[str] = None
    items_per_page: Optional[int] = None


# ------------------------------------------------------------------
# Mock data helpers
# ------------------------------------------------------------------

def _mock_admin_profile(current_user: dict) -> Dict[str, Any]:
    """Generate mock admin profile data."""
    return {
        "id": current_user.get("id") or current_user.get("user_id") or str(uuid4()),
        "email": current_user.get("email", "admin@urbanhomeschool.co.ke"),
        "first_name": "Edwin",
        "last_name": "Odhiambo",
        "role": current_user.get("role", "admin"),
        "phone_number": "+254712345678",
        "avatar_url": None,
        "bio": "Platform administrator for Urban Home School Kenya.",
        "is_active": True,
        "last_login": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
        "created_at": "2025-06-15T09:00:00",
        "updated_at": datetime.utcnow().isoformat(),
        "stats": {
            "total_logins": 342,
            "actions_today": 28,
            "tickets_resolved_this_week": 12,
        },
    }


def _mock_preferences() -> Dict[str, Any]:
    """Generate mock admin preferences."""
    return {
        "theme": "system",
        "language": "en",
        "timezone": "Africa/Nairobi",
        "email_notifications": True,
        "push_notifications": True,
        "dashboard_layout": "default",
        "items_per_page": 20,
        "sidebar_collapsed": False,
        "show_welcome_widget": True,
        "date_format": "DD/MM/YYYY",
        "currency_display": "KES",
    }


def _mock_notifications() -> list:
    """Generate mock admin notifications."""
    now = datetime.utcnow()
    return [
        {
            "id": str(uuid4()),
            "type": "critical_alert",
            "title": "Payment gateway degraded performance",
            "message": "M-Pesa API response times have increased by 300%. 12 transactions pending.",
            "severity": "critical",
            "is_read": False,
            "action_url": "/admin/operations/tickets",
            "created_at": (now - timedelta(minutes=15)).isoformat(),
        },
        {
            "id": str(uuid4()),
            "type": "moderation",
            "title": "3 new items in moderation queue",
            "message": "AI filter flagged 3 new content items requiring manual review.",
            "severity": "high",
            "is_read": False,
            "action_url": "/admin/operations/moderation",
            "created_at": (now - timedelta(hours=1)).isoformat(),
        },
        {
            "id": str(uuid4()),
            "type": "user_report",
            "title": "New escalated support ticket",
            "message": "Ticket TKT-003 has been escalated: M-Pesa payment issue from Fatuma Ali.",
            "severity": "high",
            "is_read": False,
            "action_url": "/admin/operations/tickets/TKT-003",
            "created_at": (now - timedelta(hours=2)).isoformat(),
        },
        {
            "id": str(uuid4()),
            "type": "system",
            "title": "Database backup completed",
            "message": "Daily automated backup completed successfully. Size: 2.3 GB.",
            "severity": "info",
            "is_read": True,
            "action_url": None,
            "created_at": (now - timedelta(hours=6)).isoformat(),
        },
        {
            "id": str(uuid4()),
            "type": "enrollment",
            "title": "5 pending enrollment approvals",
            "message": "There are 5 student enrollment requests awaiting admin approval.",
            "severity": "medium",
            "is_read": True,
            "action_url": "/admin/families/enrollments/pending",
            "created_at": (now - timedelta(hours=8)).isoformat(),
        },
        {
            "id": str(uuid4()),
            "type": "system",
            "title": "Weekly analytics report ready",
            "message": "Platform usage report for the week of Feb 3-9, 2026 is now available.",
            "severity": "info",
            "is_read": True,
            "action_url": "/admin/pulse",
            "created_at": (now - timedelta(days=1)).isoformat(),
        },
    ]


# ------------------------------------------------------------------
# GET /account/profile - admin profile
# ------------------------------------------------------------------
@router.get("/account/profile")
async def get_admin_profile(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Retrieve the current admin user's profile.

    Returns profile details, last login time, and summary activity stats.
    """
    try:
        data = _mock_admin_profile(current_user)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to get admin profile")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get admin profile.",
        ) from exc


# ------------------------------------------------------------------
# PUT /account/profile - update admin profile
# ------------------------------------------------------------------
@router.put("/account/profile")
async def update_admin_profile(
    body: ProfileUpdateRequest,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Update the current admin user's profile.

    Accepts partial updates for name, phone, avatar, and bio fields.
    """
    try:
        profile = _mock_admin_profile(current_user)

        # Apply partial updates from the request body
        updates = body.model_dump(exclude_none=True)
        profile.update(updates)
        profile["updated_at"] = datetime.utcnow().isoformat()

        return {"status": "success", "data": profile}
    except Exception as exc:
        logger.exception("Failed to update admin profile")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update admin profile.",
        ) from exc


# ------------------------------------------------------------------
# GET /account/preferences - admin preferences
# ------------------------------------------------------------------
@router.get("/account/preferences")
async def get_admin_preferences(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Retrieve the current admin user's preferences.

    Returns theme, language, timezone, notification settings, and UI preferences.
    """
    try:
        data = _mock_preferences()
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to get admin preferences")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get admin preferences.",
        ) from exc


# ------------------------------------------------------------------
# PUT /account/preferences - update admin preferences
# ------------------------------------------------------------------
@router.put("/account/preferences")
async def update_admin_preferences(
    body: PreferencesUpdateRequest,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Update the current admin user's preferences.

    Accepts partial updates for theme, language, timezone, and notification settings.
    """
    try:
        preferences = _mock_preferences()

        # Apply partial updates from the request body
        updates = body.model_dump(exclude_none=True)
        preferences.update(updates)

        return {"status": "success", "data": preferences}
    except Exception as exc:
        logger.exception("Failed to update admin preferences")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update admin preferences.",
        ) from exc


# ------------------------------------------------------------------
# GET /account/notifications - admin notifications
# ------------------------------------------------------------------
@router.get("/account/notifications")
async def list_admin_notifications(
    unread_only: bool = Query(False),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List admin notifications.

    Returns notifications sorted by most recent, with optional filter for unread only.
    """
    try:
        notifications = _mock_notifications()

        if unread_only:
            notifications = [n for n in notifications if not n["is_read"]]

        unread_count = sum(1 for n in _mock_notifications() if not n["is_read"])

        return {
            "status": "success",
            "data": {
                "items": notifications,
                "total": len(notifications),
                "unread_count": unread_count,
            },
        }
    except Exception as exc:
        logger.exception("Failed to list admin notifications")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list admin notifications.",
        ) from exc


# ------------------------------------------------------------------
# PUT /account/notifications/{notification_id}/read - mark single read
# ------------------------------------------------------------------
@router.put("/account/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Mark a single notification as read.

    Sets is_read to True for the specified notification.
    """
    try:
        return {
            "status": "success",
            "data": {
                "notification_id": notification_id,
                "is_read": True,
                "updated_at": datetime.utcnow().isoformat(),
            },
        }
    except Exception as exc:
        logger.exception("Failed to mark notification as read")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notification as read.",
        ) from exc


# ------------------------------------------------------------------
# PUT /account/notifications/read-all - mark all read
# ------------------------------------------------------------------
@router.put("/account/notifications/read-all")
async def mark_all_notifications_read(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Mark all notifications as read for the current admin user.

    Bulk operation that sets is_read to True on all unread notifications.
    """
    try:
        unread_count = sum(1 for n in _mock_notifications() if not n["is_read"])
        return {
            "status": "success",
            "data": {
                "marked_read": unread_count,
                "updated_at": datetime.utcnow().isoformat(),
            },
        }
    except Exception as exc:
        logger.exception("Failed to mark all notifications as read")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark all notifications as read.",
        ) from exc
