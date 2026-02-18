"""
Moderation Queue Models

Content moderation workflow for staff review. StaffModerationItem represents
a piece of user-generated content flagged for review (either by AI or
manually). ReviewDecision records the reviewer's verdict, feedback, and
whether AI assistance was used in the decision.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, UUID, Index, Boolean, Float, Text, ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class StaffModerationItem(Base):
    """
    Content item pending moderation review.

    Stores references to the original content (via content_type + content_id),
    AI-generated risk flags and score, priority, assignment, and review status.
    """

    __tablename__ = "staff_moderation_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_type = Column(String(50), nullable=False)
    content_id = Column(UUID(as_uuid=True), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # People
    submitted_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    assigned_to = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Review state
    status = Column(String(30), default="pending", nullable=False)
    priority = Column(String(20), default="medium", nullable=False)

    # AI analysis
    ai_flags = Column(JSONB, default=[])
    ai_risk_score = Column(Float, nullable=True)

    # Categorization
    category = Column(String(50), nullable=True)
    extra_data = Column(JSONB, default={})

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        Index("ix_staff_moderation_items_status", "status"),
        Index("ix_staff_moderation_items_assigned_to", "assigned_to"),
    )

    def __repr__(self) -> str:
        return (
            f"<StaffModerationItem(content_type='{self.content_type}', "
            f"status='{self.status}', priority='{self.priority}')>"
        )


class ReviewDecision(Base):
    """
    Reviewer's decision on a moderation item.

    Records the verdict (approved, rejected, changes_requested), optional
    feedback, and whether AI assistance was used. Multiple decisions per
    item are supported for audit trail purposes.
    """

    __tablename__ = "review_decisions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    moderation_item_id = Column(
        UUID(as_uuid=True),
        ForeignKey("staff_moderation_items.id", ondelete="CASCADE"),
        nullable=False,
    )
    reviewer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    decision = Column(String(30), nullable=False)  # approved | rejected | changes_requested
    feedback = Column(Text, nullable=True)
    is_ai_assisted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_review_decisions_moderation_item_id", "moderation_item_id"),
    )

    def __repr__(self) -> str:
        return (
            f"<ReviewDecision(moderation_item_id={self.moderation_item_id}, "
            f"decision='{self.decision}')>"
        )
