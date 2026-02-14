"""
Live Session Models

Real-time virtual classroom sessions with recording and breakout room
support. LiveSession manages session lifecycle (scheduling, start, end).
LiveSessionRecording stores post-session recording metadata.
BreakoutRoom enables sub-group collaboration within a live session.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, UUID, Index, Boolean, Integer, Text,
    BigInteger, ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class LiveSession(Base):
    """
    Virtual classroom live session.

    Supports scheduling, participant caps, recording toggles, and
    screen-sharing configuration. Tied to an optional course and grade
    level for curriculum context.
    """

    __tablename__ = "live_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Host and type
    host_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    session_type = Column(String(50), nullable=False)
    room_name = Column(String(100), unique=True, nullable=False)
    status = Column(String(30), default="scheduled", nullable=False)

    # Configuration
    max_participants = Column(Integer, default=30, nullable=False)
    recording_enabled = Column(Boolean, default=False, nullable=False)
    screen_share_enabled = Column(Boolean, default=True, nullable=False)

    # Curriculum context
    course_id = Column(UUID(as_uuid=True), nullable=True)
    grade_level = Column(String(20), nullable=True)

    # Scheduling and lifecycle
    scheduled_at = Column(DateTime, nullable=False)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)

    # Metadata
    metadata = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_live_sessions_host_id", "host_id"),
        Index("ix_live_sessions_status", "status"),
        Index("ix_live_sessions_scheduled_at", "scheduled_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<LiveSession(title='{self.title}', "
            f"room='{self.room_name}', status='{self.status}')>"
        )


class LiveSessionRecording(Base):
    """
    Recording metadata for a completed live session.

    Stores the external recording URL, duration, file size, and format.
    Multiple recordings per session are supported (e.g., gallery and
    speaker views).
    """

    __tablename__ = "live_session_recordings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("live_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    recording_url = Column(String(500), nullable=False)
    duration_seconds = Column(Integer, nullable=True)
    file_size_bytes = Column(BigInteger, nullable=True)
    format = Column(String(20), default="mp4", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return (
            f"<LiveSessionRecording(session_id={self.session_id}, "
            f"format='{self.format}')>"
        )


class BreakoutRoom(Base):
    """
    Breakout room within a live session.

    Enables small-group collaboration by splitting session participants
    into named sub-rooms with tracked membership.
    """

    __tablename__ = "breakout_rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("live_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String(100), nullable=False)
    participants = Column(JSONB, default=[])
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return (
            f"<BreakoutRoom(session_id={self.session_id}, "
            f"name='{self.name}', active={self.is_active})>"
        )
