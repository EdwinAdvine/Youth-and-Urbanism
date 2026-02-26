"""
Notification Preference Models

Staff notification channel preferences and Web Push subscriptions.
PushSubscription stores per-device push subscription credentials.
StaffNotificationPref controls per-user delivery channels, digest
frequency, quiet hours, and per-category opt-in/out.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, UUID, Index, Boolean, Text, ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class PushSubscription(Base):
    """
    Web Push API subscription for a single device.

    Stores the push endpoint, p256dh public key, and auth secret
    required by the Web Push protocol. One user can have multiple
    subscriptions across devices.
    """

    __tablename__ = "push_subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    endpoint = Column(Text, nullable=False)
    p256dh_key = Column(Text, nullable=False)
    auth_key = Column(Text, nullable=False)
    user_agent = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_push_subscriptions_user_id", "user_id"),
    )

    def __repr__(self) -> str:
        return (
            f"<PushSubscription(user_id={self.user_id}, "
            f"active={self.is_active})>"
        )


class StaffNotificationPref(Base):
    """
    Per-staff-member notification delivery preferences.

    Controls which channels are enabled (push, email, in-app), digest
    frequency, quiet-hours window, and per-category overrides.
    One-to-one with users.
    """

    __tablename__ = "staff_notification_prefs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    channels = Column(
        JSONB,
        default={"push": True, "email": True, "in_app": True},
    )
    digest_frequency = Column(String(20), default="daily", nullable=False)
    quiet_hours = Column(
        JSONB,
        default={"enabled": False, "start": "22:00", "end": "07:00"},
    )
    categories = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    def __repr__(self) -> str:
        return (
            f"<StaffNotificationPref(user_id={self.user_id}, "
            f"digest='{self.digest_frequency}')>"
        )
