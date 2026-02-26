"""
CoPilot Session and Message Models

Stores conversation sessions and messages for the AI CoPilot feature.
Each authenticated user (any role) can have multiple chat sessions with their
dedicated AI agent. Sessions contain messages in a one-to-many relationship.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class CopilotSession(Base):
    """
    CoPilot chat session for any authenticated user.

    Each session represents a conversation thread with the user's AI agent.
    Sessions can be titled (auto-generated from first message), pinned for
    quick access, and support multiple response modes (text/voice).
    """
    __tablename__ = "copilot_sessions"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign key to user (any role)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Session metadata
    title = Column(String(255), default="New Chat", nullable=False)
    summary = Column(Text, nullable=True)  # AI-generated summary of conversation
    response_mode = Column(String(20), default="text", nullable=False)  # text, voice

    # Organization flags
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)  # Soft delete

    # Denormalized counts for performance
    message_count = Column(Integer, default=0, nullable=False)
    last_message_at = Column(DateTime(timezone=True), nullable=True)

    # Flexible metadata storage (JSONB for role-specific context, tags, etc.)
    metadata_ = Column(JSONB, default=dict, nullable=False)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    user = relationship("User", backref="copilot_sessions")
    messages = relationship(
        "CopilotMessage",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="CopilotMessage.created_at"
    )

    # Compound index for efficient session listing
    __table_args__ = (
        Index("ix_copilot_sessions_user_updated", "user_id", "updated_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<CopilotSession(id={self.id}, user_id={self.user_id}, "
            f"title='{self.title}', messages={self.message_count})>"
        )


class CopilotMessage(Base):
    """
    Individual message in a CoPilot session.

    Stores both user messages and AI responses with support for
    audio content (audio URLs for voice mode). Tracks which AI provider
    generated each response for analytics and debugging.
    """
    __tablename__ = "copilot_messages"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign key to session
    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("copilot_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Message content
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)

    # Audio URL (for voice mode)
    audio_url = Column(String(500), nullable=True)

    # AI provider metadata
    provider_used = Column(String(100), nullable=True)  # Which AI provider responded
    token_count = Column(Integer, nullable=True)  # For cost tracking and analytics

    # Flexible metadata (task_type, model_version, etc.)
    metadata_ = Column(JSONB, default=dict, nullable=False)

    # Timestamp
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )

    # Relationships
    session = relationship("CopilotSession", back_populates="messages")

    def __repr__(self) -> str:
        return (
            f"<CopilotMessage(id={self.id}, session_id={self.session_id}, "
            f"role='{self.role}', content='{self.content[:50]}...')>"
        )

    @property
    def is_user_message(self) -> bool:
        """Check if message is from the user."""
        return self.role == "user"

    @property
    def is_assistant_message(self) -> bool:
        """Check if message is from the AI assistant."""
        return self.role == "assistant"
