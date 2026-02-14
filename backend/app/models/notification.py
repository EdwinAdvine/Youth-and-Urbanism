"""
Notification model for Urban Home School platform.

Stores user notifications for events like assignments, grades,
course updates, forum replies, payments, and system alerts.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.database import Base

import enum


class NotificationType(str, enum.Enum):
    assignment = "assignment"
    quiz = "quiz"
    course = "course"
    message = "message"
    forum = "forum"
    achievement = "achievement"
    system = "system"
    payment = "payment"
    ai = "ai"
    moderation = "moderation"
    enrollment = "enrollment"


class Notification(Base):
    """
    User notification record.

    Attributes:
        id: Unique identifier (UUID)
        user_id: Recipient user
        type: Notification category
        title: Short title
        message: Notification body text
        is_read: Whether the user has read this notification
        action_url: Optional URL to navigate to when clicked
        action_label: Optional button label (e.g. "View Assignment")
        metadata: Flexible JSONB for extra data
        created_at: When the notification was created
        read_at: When the user marked it as read
    """
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type = Column(
        SAEnum(NotificationType, name="notification_type", create_type=True),
        nullable=False,
        index=True,
    )
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    action_url = Column(String(500), nullable=True)
    action_label = Column(String(100), nullable=True)
    metadata_ = Column("metadata", JSONB, default={}, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    read_at = Column(DateTime, nullable=True)

    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, type={self.type}, is_read={self.is_read})>"
