"""
Forum models for Urban Home School platform.

Provides community discussion with posts, replies, likes,
and moderation features. Categories align with CBC curriculum subjects.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Text, DateTime, Boolean, Integer, ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY

from app.database import Base


class ForumPost(Base):
    """
    A forum discussion post.

    Categories: general, mathematics, science, languages,
    social-studies, technology, help-support.
    """
    __tablename__ = "forum_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    author_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    tags = Column(JSONB, default=[], nullable=False)

    is_public = Column(Boolean, default=True, nullable=False, index=True)
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_solved = Column(Boolean, default=False, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    is_flagged = Column(Boolean, default=False, nullable=False)

    view_count = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_activity_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    def __repr__(self) -> str:
        return f"<ForumPost(id={self.id}, title='{self.title[:30]}')>"


class ForumReply(Base):
    """A reply to a forum post."""
    __tablename__ = "forum_replies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    post_id = Column(
        UUID(as_uuid=True),
        ForeignKey("forum_posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content = Column(Text, nullable=False)
    is_solution = Column(Boolean, default=False, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<ForumReply(id={self.id}, post_id={self.post_id})>"


class ForumLike(Base):
    """
    A like on a forum post or reply.

    Exactly one of post_id or reply_id must be set.
    """
    __tablename__ = "forum_likes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    post_id = Column(
        UUID(as_uuid=True),
        ForeignKey("forum_posts.id", ondelete="CASCADE"),
        nullable=True,
    )
    reply_id = Column(
        UUID(as_uuid=True),
        ForeignKey("forum_replies.id", ondelete="CASCADE"),
        nullable=True,
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="uq_user_post_like"),
        UniqueConstraint("user_id", "reply_id", name="uq_user_reply_like"),
    )
