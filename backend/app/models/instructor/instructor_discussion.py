"""
Instructor Discussion Models

Models for instructor community forums and discussions.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Boolean, DateTime, UUID, ForeignKey, Numeric, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class PostType(str, enum.Enum):
    """Types of forum posts"""
    DISCUSSION = "discussion"
    ANNOUNCEMENT = "announcement"
    QUESTION = "question"


class InstructorForumPost(Base):
    """
    A discussion post in the instructor community forum.

    Posts can be discussions, announcements, or questions. Admins can pin
    important posts. The AI runs sentiment analysis on each post (score
    from -100 to +100) and flags posts for moderation if needed. Posts
    support threaded replies via the InstructorForumReply relationship.
    """

    __tablename__ = "instructor_forum_posts"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Instructor (author)
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Forum (optional categorization)
    forum_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # Future: FK to forums table

    # Post content
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=False)
    post_type = Column(SQLEnum(PostType), default=PostType.DISCUSSION, nullable=False, index=True)

    # Moderation
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_moderated = Column(Boolean, default=False, nullable=False)  # AI-flagged for review

    # AI sentiment analysis
    sentiment_score = Column(Numeric(5, 2), nullable=True)  # -100 to +100

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    instructor = relationship("User", foreign_keys=[instructor_id])
    replies = relationship("InstructorForumReply", back_populates="post", cascade="all, delete-orphan")


class InstructorForumReply(Base):
    """
    A reply to an instructor forum post.

    Each reply has content text, an AI-generated sentiment score, and
    timestamps. Replies are linked to both the parent post and the author.
    The sentiment score helps moderators quickly identify negative or
    heated discussions in the instructor community.
    """

    __tablename__ = "instructor_forum_replies"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Post
    post_id = Column(UUID(as_uuid=True), ForeignKey("instructor_forum_posts.id", ondelete="CASCADE"), nullable=False, index=True)

    # Author
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Reply content
    content = Column(Text, nullable=False)

    # AI sentiment analysis
    sentiment_score = Column(Numeric(5, 2), nullable=True)  # -100 to +100

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    post = relationship("InstructorForumPost", back_populates="replies")
    author = relationship("User", foreign_keys=[author_id])
