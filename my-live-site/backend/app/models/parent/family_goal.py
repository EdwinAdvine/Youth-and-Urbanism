"""
FamilyGoal Model

Family learning goals set by parents for their children.
Goals can be child-specific or family-wide, with AI-suggested milestones.
"""

import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Text, Date, DateTime, UUID, ForeignKey, Boolean, Numeric
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class FamilyGoal(Base):
    """
    FamilyGoal model for parent-set learning goals.

    Parents can create goals for individual children or family-wide goals.
    AI can suggest goals and provide milestone tracking.
    """

    __tablename__ = "parent_family_goals"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign keys
    parent_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    child_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=True, index=True)  # null = family-wide

    # Goal details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False)  # 'academic', 'behavioral', 'creative', 'health'
    target_date = Column(Date, nullable=True)
    progress_percentage = Column(Numeric(5, 2), default=0.00, nullable=False)  # 0.00 to 100.00

    # Status tracking
    status = Column(String(20), default='active', nullable=False)  # 'active', 'completed', 'paused', 'cancelled'

    # AI integration
    is_ai_suggested = Column(Boolean, default=False, nullable=False)
    ai_metadata = Column(JSONB, nullable=True)  # AI-generated milestones, tips, recommendations

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    parent = relationship("User", foreign_keys=[parent_id], backref="family_goals")
    child = relationship("Student", foreign_keys=[child_id], backref="family_goals")

    def __repr__(self):
        child_str = f"child={self.child_id}" if self.child_id else "family-wide"
        return f"<FamilyGoal(id={self.id}, title='{self.title}', {child_str}, status={self.status}, progress={self.progress_percentage}%)>"
