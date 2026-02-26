"""
Notification Service

In-app notifications, Web Push delivery, bulk notification creation,
and push subscription management for staff members.
"""

import json
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.models.staff.notification_preference import PushSubscription
from app.config import settings

# Web Push placeholder
try:
    from pywebpush import webpush
except ImportError:
    webpush = None

logger = logging.getLogger(__name__)

# VAPID keys for Web Push (loaded from settings in production)
VAPID_PRIVATE_KEY = getattr(settings, "vapid_private_key", "")
VAPID_CLAIMS = {"sub": f"mailto:{getattr(settings, 'from_email', 'admin@urbanhomeschool.co.ke')}"}


class NotificationService:
    """Facade used by route handlers to access notification service functions."""

    @staticmethod
    async def list_notifications(
        db: AsyncSession,
        *,
        user_id: str,
        page: int = 1,
        page_size: int = 20,
        is_read: Optional[bool] = None,
        category: Optional[str] = None,
    ) -> Dict[str, Any]:
        return await list_notifications(db, user_id, page, page_size)

    @staticmethod
    async def mark_read(
        db: AsyncSession,
        *,
        user_id: str,
        notification_ids: List[str],
    ) -> Dict[str, Any]:
        return await mark_read(db, user_id, notification_ids)

    @staticmethod
    async def mark_all_read(db: AsyncSession, *, user_id: str) -> Dict[str, Any]:
        return await mark_all_read(db, user_id)

    @staticmethod
    async def push_subscribe(
        db: AsyncSession,
        *,
        user_id: str,
        endpoint: str,
        keys: Dict[str, str],
        device_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        subscription_data = {
            "endpoint": endpoint,
            "p256dh_key": keys.get("p256dh", ""),
            "auth_key": keys.get("auth", ""),
            "user_agent": device_name,
        }
        return await subscribe_push(db, user_id, subscription_data)

    @staticmethod
    async def push_unsubscribe(
        db: AsyncSession,
        *,
        user_id: str,
        endpoint: str,
    ) -> Dict[str, Any]:
        return await unsubscribe_push(db, user_id, endpoint)

    @staticmethod
    async def delete_notification(
        db: AsyncSession,
        *,
        user_id: str,
        notification_id: str,
    ) -> Dict[str, Any]:
        """Stub: delete a single notification."""
        return {"deleted": True, "notification_id": notification_id}


async def list_notifications(
    db: AsyncSession,
    user_id: str,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """Return paginated in-app notifications for a user."""
    try:
        where_clause = Notification.user_id == user_id

        # Total count
        total_q = select(func.count(Notification.id)).where(where_clause)
        total_result = await db.execute(total_q)
        total: int = total_result.scalar() or 0

        # Unread count
        unread_q = select(func.count(Notification.id)).where(
            and_(
                Notification.user_id == user_id,
                Notification.is_read == False,  # noqa: E712
            )
        )
        unread_result = await db.execute(unread_q)
        unread_count: int = unread_result.scalar() or 0

        # Paginated items
        offset = (page - 1) * page_size
        items_q = (
            select(Notification)
            .where(where_clause)
            .order_by(Notification.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items_result = await db.execute(items_q)
        notifications = items_result.scalars().all()

        item_list = [
            {
                "id": str(n.id),
                "notification_type": n.type.value if hasattr(n.type, "value") else str(n.type),
                "title": n.title,
                "message": n.message,
                "data": n.metadata_ or {},
                "priority": "normal",
                "read": n.is_read,
                "action_url": n.action_url,
                "created_at": n.created_at.isoformat(),
            }
            for n in notifications
        ]

        return {
            "items": item_list,
            "total": total,
            "unread_count": unread_count,
            "page": page,
            "page_size": page_size,
        }

    except Exception as e:
        logger.error(f"Error listing notifications for user {user_id}: {e}")
        raise


async def create_notification(
    db: AsyncSession,
    notification_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Create a single in-app notification."""
    try:
        notification = Notification(
            id=uuid.uuid4(),
            user_id=notification_data["user_id"],
            type=notification_data.get("notification_type", "system"),
            title=notification_data["title"],
            message=notification_data["message"],
            action_url=notification_data.get("action_url"),
            action_label=notification_data.get("action_label"),
            metadata_=notification_data.get("data", {}),
            is_read=False,
        )
        db.add(notification)
        await db.flush()

        logger.info(
            f"Notification created for user {notification_data['user_id']}: "
            f"{notification_data['title']}"
        )

        return {
            "id": str(notification.id),
            "user_id": str(notification.user_id),
            "title": notification.title,
            "created_at": notification.created_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error creating notification: {e}")
        raise


async def mark_read(
    db: AsyncSession,
    user_id: str,
    notification_ids: List[str],
) -> Dict[str, Any]:
    """Mark specific notifications as read."""
    try:
        now = datetime.utcnow()
        await db.execute(
            update(Notification)
            .where(
                and_(
                    Notification.user_id == user_id,
                    Notification.id.in_(notification_ids),
                    Notification.is_read == False,  # noqa: E712
                )
            )
            .values(is_read=True, read_at=now)
        )
        await db.flush()

        logger.info(f"Marked {len(notification_ids)} notifications as read for user {user_id}")

        return {
            "marked_count": len(notification_ids),
            "user_id": str(user_id),
        }

    except Exception as e:
        logger.error(f"Error marking notifications as read: {e}")
        raise


async def mark_all_read(
    db: AsyncSession,
    user_id: str,
) -> Dict[str, Any]:
    """Mark all unread notifications as read for a user."""
    try:
        now = datetime.utcnow()
        result = await db.execute(
            update(Notification)
            .where(
                and_(
                    Notification.user_id == user_id,
                    Notification.is_read == False,  # noqa: E712
                )
            )
            .values(is_read=True, read_at=now)
        )
        await db.flush()

        marked_count = result.rowcount

        logger.info(f"Marked all ({marked_count}) notifications as read for user {user_id}")

        return {
            "marked_count": marked_count,
        }

    except Exception as e:
        logger.error(f"Error marking all notifications as read: {e}")
        raise


async def subscribe_push(
    db: AsyncSession,
    user_id: str,
    subscription_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Save a Web Push subscription for a user's device."""
    try:
        subscription = PushSubscription(
            id=uuid.uuid4(),
            user_id=user_id,
            endpoint=subscription_data["endpoint"],
            p256dh_key=subscription_data["p256dh_key"],
            auth_key=subscription_data["auth_key"],
            user_agent=subscription_data.get("user_agent"),
            is_active=True,
        )
        db.add(subscription)
        await db.flush()

        logger.info(f"Push subscription created for user {user_id}")

        return {
            "id": str(subscription.id),
            "endpoint": subscription.endpoint,
            "is_active": True,
            "created_at": subscription.created_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error creating push subscription: {e}")
        raise


async def unsubscribe_push(
    db: AsyncSession,
    user_id: str,
    endpoint: str,
) -> Dict[str, Any]:
    """Deactivate a push subscription by endpoint."""
    try:
        await db.execute(
            update(PushSubscription)
            .where(
                and_(
                    PushSubscription.user_id == user_id,
                    PushSubscription.endpoint == endpoint,
                )
            )
            .values(is_active=False)
        )
        await db.flush()

        logger.info(f"Push subscription deactivated for user {user_id}")

        return {
            "user_id": str(user_id),
            "endpoint": endpoint,
            "is_active": False,
        }

    except Exception as e:
        logger.error(f"Error deactivating push subscription: {e}")
        raise


async def send_push(
    user_id: str,
    title: str,
    message: str,
    data: Optional[Dict[str, Any]] = None,
    db: Optional[AsyncSession] = None,
) -> Dict[str, Any]:
    """
    Send a Web Push notification to all active subscriptions for a user.

    Requires a database session to look up subscriptions. Falls back
    gracefully if pywebpush is not installed.
    """
    try:
        if not db:
            logger.warning("No database session provided for push notification")
            return {"sent": 0, "failed": 0, "reason": "No database session"}

        if not webpush:
            logger.warning("pywebpush not installed, skipping push delivery")
            return {"sent": 0, "failed": 0, "reason": "pywebpush not installed"}

        # Fetch active subscriptions
        subs_q = select(PushSubscription).where(
            and_(
                PushSubscription.user_id == user_id,
                PushSubscription.is_active == True,  # noqa: E712
            )
        )
        result = await db.execute(subs_q)
        subscriptions = result.scalars().all()

        sent = 0
        failed = 0
        payload = json.dumps({
            "title": title,
            "body": message,
            "data": data or {},
        })

        for sub in subscriptions:
            try:
                webpush(
                    subscription_info={
                        "endpoint": sub.endpoint,
                        "keys": {
                            "p256dh": sub.p256dh_key,
                            "auth": sub.auth_key,
                        },
                    },
                    data=payload,
                    vapid_private_key=VAPID_PRIVATE_KEY,
                    vapid_claims=VAPID_CLAIMS,
                )
                sent += 1
            except Exception as push_error:
                failed += 1
                logger.warning(
                    f"Push delivery failed for subscription {sub.id}: {push_error}"
                )
                # Deactivate subscription on 410 Gone or similar
                if "410" in str(push_error) or "expired" in str(push_error).lower():
                    sub.is_active = False

        if failed > 0:
            await db.flush()

        logger.info(f"Push notifications for user {user_id}: {sent} sent, {failed} failed")

        return {"sent": sent, "failed": failed}

    except Exception as e:
        logger.error(f"Error sending push notification to user {user_id}: {e}")
        return {"sent": 0, "failed": 0, "error": str(e)}


async def send_bulk_notifications(
    db: AsyncSession,
    user_ids: List[str],
    notification: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Create in-app notifications for multiple users and optionally
    send push notifications.
    """
    try:
        created_count = 0
        push_sent = 0
        push_failed = 0

        for uid in user_ids:
            try:
                # Create in-app notification
                notif = Notification(
                    id=uuid.uuid4(),
                    user_id=uid,
                    type=notification.get("notification_type", "system"),
                    title=notification["title"],
                    message=notification["message"],
                    action_url=notification.get("action_url"),
                    metadata_=notification.get("data", {}),
                    is_read=False,
                )
                db.add(notif)
                created_count += 1

                # Send push notification
                push_result = await send_push(
                    user_id=uid,
                    title=notification["title"],
                    message=notification["message"],
                    data=notification.get("data"),
                    db=db,
                )
                push_sent += push_result.get("sent", 0)
                push_failed += push_result.get("failed", 0)

            except Exception as user_error:
                logger.warning(f"Bulk notification failed for user {uid}: {user_error}")

        await db.flush()

        logger.info(
            f"Bulk notifications: {created_count} created, "
            f"{push_sent} push sent, {push_failed} push failed"
        )

        return {
            "total_users": len(user_ids),
            "notifications_created": created_count,
            "push_sent": push_sent,
            "push_failed": push_failed,
        }

    except Exception as e:
        logger.error(f"Error sending bulk notifications: {e}")
        raise
