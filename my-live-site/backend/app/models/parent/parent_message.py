"""
ParentMessage Model

Real-time messaging for parent communications.
Supports conversations with AI tutors, teachers, family members, and support.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, UUID, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class ParentMessage(Base):
    """
    ParentMessage model for real-time parent communications.

    Supports multiple conversation channels:
    - ai_tutor: Parent messaging child's AI tutor
    - teacher: Parent messaging child's human instructor
    - family: Parent-child messaging (moderated)
    - support: Parent-platform support conversations

    Messages are grouped by conversation_id for threading.
    """

    __tablename__ = "parent_messages"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Conversation grouping
    conversation_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # Groups messages into threads

    # Participants
    sender_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    recipient_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)  # null = AI tutor

    # Message context
    channel = Column(String(30), nullable=False, index=True)  # 'ai_tutor', 'teacher', 'family', 'support'
    child_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=True, index=True)  # Context child

    # Message content
    content = Column(Text, nullable=False)
    message_type = Column(String(20), default='text', nullable=False)  # 'text', 'image', 'file', 'system'

    # Read tracking
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime, nullable=True)

    # Additional metadata
    metadata_ = Column(JSONB, nullable=True)  # Attachments, AI context, moderation flags

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], backref="received_messages")
    child = relationship("Student", foreign_keys=[child_id], backref="related_messages")

    def __repr__(self):
        recipient_str = f"to={self.recipient_id}" if self.recipient_id else "to=AI"
        return f"<ParentMessage(id={self.id}, from={self.sender_id}, {recipient_str}, channel={self.channel}, read={self.is_read})>"
