"""
Partner Collaboration Models

Models for messaging and meeting scheduling between partners
and school staff/administrators.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, UUID, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class MeetingStatus(str, enum.Enum):
    """Status of scheduled meetings"""
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    RESCHEDULED = "rescheduled"


class PartnerMessage(Base):
    """Messages between partners and school staff/administrators"""

    __tablename__ = "partner_messages"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Sender/recipient
    partner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Message content
    subject = Column(String(500), nullable=False)
    body = Column(Text, nullable=False)
    attachments = Column(JSONB, nullable=True, default=list)  # [{"name": "...", "url": "...", "type": "..."}]

    # Status
    read_at = Column(DateTime, nullable=True)
    is_archived = Column(Boolean, default=False)

    # Threading
    parent_message_id = Column(UUID(as_uuid=True), ForeignKey("partner_messages.id", ondelete="SET NULL"), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    sender = relationship("User", foreign_keys=[partner_id])
    recipient = relationship("User", foreign_keys=[recipient_id])
    parent_message = relationship("PartnerMessage", remote_side="PartnerMessage.id", foreign_keys=[parent_message_id])


class PartnerMeeting(Base):
    """Scheduled meetings between partners and school representatives"""

    __tablename__ = "partner_meetings"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Organizer
    partner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Meeting details
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60, nullable=False)
    meeting_url = Column(String(500), nullable=True)
    location = Column(String(300), nullable=True)

    # Attendees
    attendees = Column(JSONB, nullable=True, default=list)  # [{"user_id": "...", "name": "...", "role": "...", "rsvp": "..."}]

    # Status
    status = Column(SQLEnum(MeetingStatus), default=MeetingStatus.SCHEDULED, nullable=False, index=True)

    # AI features
    ai_suggested = Column(Boolean, default=False)
    ai_agenda = Column(JSONB, nullable=True)  # AI-suggested agenda items

    # Notes
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    partner = relationship("User", foreign_keys=[partner_id])
