"""
Parent Discussion Card Model

AI-generated weekly content for parents to support learning at home.
Each card contains a summary of the child's learning progress, discussion
starters for family conversations, and offline activity suggestions
contextualized to what the child studied that week.
"""
from sqlalchemy import Column, String, Date, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ...database import Base


class ParentDiscussionCard(Base):
    """
    AI-generated weekly discussion card for parent-child engagement.

    Generated once per week per child, containing a parent-friendly summary
    of learning progress, conversation starters related to studied topics,
    and offline activities that reinforce classroom concepts.

    Attributes:
        parent_id: FK to users table (parent account)
        child_id: FK to students table
        week_start: Start date of the covered week
        week_end: End date of the covered week
        summary_text: AI-generated parent-friendly progress summary
        discussion_starters: JSONB array of {topic, question, context}
        offline_activities: JSONB array of {activity, description, materials_needed}
        confidence_trend: Student confidence trajectory ('improving'|'stable'|'declining')
        metrics: JSONB snapshot of {topics_covered, time_spent_minutes, mood_trend, mastery_gained}
    """
    __tablename__ = "parent_discussion_cards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    child_id = Column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Week range
    week_start = Column(Date, nullable=False)
    week_end = Column(Date, nullable=False)

    # AI-generated content
    summary_text = Column(Text, nullable=False)
    discussion_starters = Column(JSONB, default=list, nullable=False)
    offline_activities = Column(JSONB, default=list, nullable=False)
    confidence_trend = Column(String(20), nullable=True)  # improving, stable, declining

    # Metrics snapshot
    metrics = Column(JSONB, default=dict, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    def __repr__(self):
        return (
            f"<ParentDiscussionCard {self.week_start} to {self.week_end} "
            f"child={self.child_id}>"
        )
