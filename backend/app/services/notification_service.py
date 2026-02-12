"""
Notification Service for Urban Home School

Provides CRUD operations for notifications and a utility function
for creating notifications from other services.
"""

import logging
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, func, desc, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification, NotificationType

logger = logging.getLogger(__name__)


async def create_notification(
    db: AsyncSession,
    user_id: UUID,
    type: str,
    title: str,
    message: str,
    action_url: Optional[str] = None,
    action_label: Optional[str] = None,
    metadata: Optional[dict] = None,
) -> Notification:
    """
    Create a notification for a user.

    This is the primary utility function called by other services
    (e.g. when a quiz is graded, a forum reply is posted, etc.).
    """
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        action_url=action_url,
        action_label=action_label,
        metadata_=metadata or {},
    )
    db.add(notification)
    await db.flush()
    return notification


async def get_notifications(
    db: AsyncSession,
    user_id: UUID,
    is_read: Optional[bool] = None,
    notification_type: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> dict:
    """
    Get paginated notifications for a user with optional filters.

    Returns dict with notifications list, total count, and unread count.
    """
    query = select(Notification).where(Notification.user_id == user_id)

    if is_read is not None:
        query = query.where(Notification.is_read == is_read)
    if notification_type:
        query = query.where(Notification.type == notification_type)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Get unread count (always for the user, unfiltered)
    unread_query = select(func.count()).where(
        Notification.user_id == user_id,
        Notification.is_read == False,
    )
    unread_result = await db.execute(unread_query)
    unread_count = unread_result.scalar() or 0

    # Paginate
    offset = (page - 1) * limit
    query = query.order_by(desc(Notification.created_at)).offset(offset).limit(limit)
    result = await db.execute(query)
    notifications = result.scalars().all()

    return {
        "notifications": notifications,
        "total": total,
        "unread_count": unread_count,
        "page": page,
        "limit": limit,
    }


async def get_unread_count(db: AsyncSession, user_id: UUID) -> int:
    """Get the number of unread notifications for a user."""
    result = await db.execute(
        select(func.count()).where(
            Notification.user_id == user_id,
            Notification.is_read == False,
        )
    )
    return result.scalar() or 0


async def mark_as_read(
    db: AsyncSession, user_id: UUID, notification_id: UUID
) -> Optional[Notification]:
    """Mark a single notification as read."""
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
    )
    notification = result.scalars().first()

    if notification and not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        await db.flush()

    return notification


async def mark_all_as_read(db: AsyncSession, user_id: UUID) -> int:
    """Mark all unread notifications as read. Returns count updated."""
    now = datetime.utcnow()
    result = await db.execute(
        update(Notification)
        .where(Notification.user_id == user_id, Notification.is_read == False)
        .values(is_read=True, read_at=now)
    )
    await db.flush()
    return result.rowcount


async def delete_notification(
    db: AsyncSession, user_id: UUID, notification_id: UUID
) -> bool:
    """Delete a notification. Returns True if deleted, False if not found."""
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
    )
    notification = result.scalars().first()

    if not notification:
        return False

    await db.delete(notification)
    await db.flush()
    return True
