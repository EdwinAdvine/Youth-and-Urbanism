"""
Staff Notifications API Endpoints

Provides REST endpoints for managing staff notifications:
- Paginated notification listing
- Mark individual or all notifications as read
- Push notification subscription management
- Notification deletion

All endpoints require staff or admin role access.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_staff_or_admin_access

from app.services.staff.notification_service import NotificationService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Staff Notifications"])


# ------------------------------------------------------------------
# Pydantic request models
# ------------------------------------------------------------------
class MarkReadRequest(BaseModel):
    """Payload for marking specific notifications as read."""
    notification_ids: List[str]


class PushSubscribeRequest(BaseModel):
    """Payload for subscribing to push notifications."""
    endpoint: str
    keys: Dict[str, str]
    device_name: Optional[str] = None


class PushUnsubscribeRequest(BaseModel):
    """Payload for unsubscribing from push notifications."""
    endpoint: str


# ------------------------------------------------------------------
# GET /
# ------------------------------------------------------------------
@router.get("/")
async def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_read: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated list of notifications for the authenticated staff member.

    Supports filtering by read status and category.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await NotificationService.list_notifications(
            db,
            user_id=user_id,
            page=page,
            page_size=page_size,
            is_read=is_read,
            category=category,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list notifications")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list notifications.",
        ) from exc


# ------------------------------------------------------------------
# POST /mark-read
# ------------------------------------------------------------------
@router.post("/mark-read")
async def mark_notifications_read(
    body: MarkReadRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Mark specific notifications as read."""
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await NotificationService.mark_read(
            db, user_id=user_id, notification_ids=body.notification_ids
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to mark notifications as read")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notifications as read.",
        ) from exc


# ------------------------------------------------------------------
# POST /mark-all-read
# ------------------------------------------------------------------
@router.post("/mark-all-read")
async def mark_all_read(
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Mark all notifications as read for the authenticated user."""
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await NotificationService.mark_all_read(db, user_id=user_id)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to mark all notifications as read")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark all notifications as read.",
        ) from exc


# ------------------------------------------------------------------
# POST /push/subscribe
# ------------------------------------------------------------------
@router.post("/push/subscribe")
async def push_subscribe(
    body: PushSubscribeRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Subscribe to push notifications.

    Registers the browser / device push endpoint and encryption keys
    for Web Push.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await NotificationService.push_subscribe(
            db,
            user_id=user_id,
            endpoint=body.endpoint,
            keys=body.keys,
            device_name=body.device_name,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to subscribe to push notifications")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to subscribe to push notifications.",
        ) from exc


# ------------------------------------------------------------------
# POST /push/unsubscribe
# ------------------------------------------------------------------
@router.post("/push/unsubscribe")
async def push_unsubscribe(
    body: PushUnsubscribeRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Unsubscribe from push notifications.

    Removes the push endpoint registration.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await NotificationService.push_unsubscribe(
            db, user_id=user_id, endpoint=body.endpoint
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to unsubscribe from push notifications")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unsubscribe from push notifications.",
        ) from exc


# ------------------------------------------------------------------
# DELETE /{notification_id}
# ------------------------------------------------------------------
@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Delete a single notification."""
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        success = await NotificationService.delete_notification(
            db, user_id=user_id, notification_id=notification_id
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found.",
            )
        return {"status": "success", "message": "Notification deleted."}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to delete notification %s", notification_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notification.",
        ) from exc
