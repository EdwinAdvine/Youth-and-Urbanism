"""
NotificationPreference Model

Granular notification preferences per child and notification type.
Controls which alerts are sent through which channels (email, SMS, push, in-app).
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, UUID, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class NotificationPreference(Base):
    """
    NotificationPreference model for parent notification controls.

    Allows parents to configure exactly how they want to be notified about
    different events, per child, with channel-specific controls and severity filtering.

    Notification types:
    - achievement: Certificates, badges, milestones
    - alert: AI-generated warnings (engagement, performance)
    - report: Weekly/monthly/term reports ready
    - message: New messages from teacher/AI tutor
    - payment: Payment reminders, receipts
    - system: Platform updates, maintenance

    Channels: email, SMS, push (mobile app), in-app (dashboard)
    """

    __tablename__ = "parent_notification_preferences"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign keys
    parent_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    child_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=True, index=True)  # null = all children

    # Notification classification
    notification_type = Column(String(50), nullable=False, index=True)

    # Channel preferences
    channel_email = Column(Boolean, default=True, nullable=False)
    channel_sms = Column(Boolean, default=False, nullable=False)
    channel_push = Column(Boolean, default=True, nullable=False)
    channel_in_app = Column(Boolean, default=True, nullable=False)

    # Severity filtering (for alerts)
    severity_threshold = Column(String(20), default='info', nullable=False)  # 'info', 'warning', 'critical' - only notify at this level or above

    # Master toggle
    is_enabled = Column(Boolean, default=True, nullable=False, index=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    parent = relationship("User", foreign_keys=[parent_id], backref="notification_preferences")
    child = relationship("Student", foreign_keys=[child_id], backref="notification_preferences")

    def __repr__(self):
        child_str = f"child={self.child_id}" if self.child_id else "all children"
        channels = []
        if self.channel_email: channels.append("email")
        if self.channel_sms: channels.append("SMS")
        if self.channel_push: channels.append("push")
        if self.channel_in_app: channels.append("in-app")
        return f"<NotificationPreference(type={self.notification_type}, {child_str}, channels={channels}, enabled={self.is_enabled})>"
