"""
Staff Content Models

Content authoring, versioning, and real-time collaboration. StaffContentItem
represents a curriculum resource (lesson, worksheet, etc.) with CBC alignment.
StaffContentVersion keeps an immutable version history. StaffCollabSession
tracks live Yjs-based collaborative editing sessions.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, UUID, Index, Boolean, Integer, Text, ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class StaffContentItem(Base):
    """
    Curriculum content item authored by staff.

    Supports rich-text or structured JSON bodies, review workflows,
    grade-level targeting, and CBC (Competency-Based Curriculum) tagging.
    """

    __tablename__ = "staff_content_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    content_type = Column(String(50), nullable=False)
    body = Column(Text, nullable=True)
    body_json = Column(JSONB, nullable=True)
    status = Column(String(30), default="draft", nullable=False)

    # Ownership and review
    author_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    reviewer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Curriculum alignment
    course_id = Column(UUID(as_uuid=True), nullable=True)
    grade_levels = Column(JSONB, default=[])
    learning_area = Column(String(100), nullable=True)
    cbc_tags = Column(JSONB, default=[])

    # Versioning and metadata
    version = Column(Integer, default=1, nullable=False)
    metadata = Column(JSONB, default={})

    # Timestamps
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        Index("ix_staff_content_items_author_id", "author_id"),
        Index("ix_staff_content_items_status", "status"),
        Index("ix_staff_content_items_course_id", "course_id"),
    )

    def __repr__(self) -> str:
        return (
            f"<StaffContentItem(title='{self.title}', "
            f"type='{self.content_type}', status='{self.status}')>"
        )


class StaffContentVersion(Base):
    """
    Immutable snapshot of a content item at a specific version.

    Stores the full body as JSONB for diffing and rollback. Each publish
    or significant edit creates a new version row.
    """

    __tablename__ = "staff_content_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id = Column(
        UUID(as_uuid=True),
        ForeignKey("staff_content_items.id", ondelete="CASCADE"),
        nullable=False,
    )
    version_number = Column(Integer, nullable=False)
    body_snapshot = Column(JSONB, nullable=False)
    changes_summary = Column(Text, nullable=True)
    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_staff_content_versions_content_id", "content_id"),
    )

    def __repr__(self) -> str:
        return (
            f"<StaffContentVersion(content_id={self.content_id}, "
            f"version={self.version_number})>"
        )


class StaffCollabSession(Base):
    """
    Real-time collaborative editing session backed by Yjs CRDT.

    Tracks which content item is being co-edited, the Yjs document ID
    for WebSocket room routing, current participants, and session lifecycle.
    """

    __tablename__ = "staff_collab_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id = Column(
        UUID(as_uuid=True),
        ForeignKey("staff_content_items.id", ondelete="CASCADE"),
        nullable=False,
    )
    yjs_doc_id = Column(String(100), unique=True, nullable=False)
    participants = Column(JSONB, default=[])
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)

    def __repr__(self) -> str:
        return (
            f"<StaffCollabSession(content_id={self.content_id}, "
            f"yjs_doc='{self.yjs_doc_id}', active={self.is_active})>"
        )
