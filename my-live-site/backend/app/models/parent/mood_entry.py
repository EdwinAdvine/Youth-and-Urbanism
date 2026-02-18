"""
MoodEntry Model

Daily mood and energy tracking for children.
Parents can record emoji-based mood entries with optional notes
to track emotional wellbeing and energy levels.
"""

import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Text, Date, DateTime, UUID, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class MoodEntry(Base):
    """
    MoodEntry model for tracking daily mood and energy levels.

    Parents can record simple emoji-based moods for each child,
    helping track emotional patterns and wellbeing over time.
    Can also record family-level moods (child_id = null).
    """

    __tablename__ = "parent_mood_entries"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign keys
    parent_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    child_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=True, index=True)  # null = family-level

    # Mood data
    emoji = Column(String(10), nullable=False)  # 'happy', 'tired', 'anxious', 'excited', 'stressed', 'neutral'
    energy_level = Column(Integer, nullable=True)  # 1-5 scale (1=very low, 5=very high)
    note = Column(Text, nullable=True)  # Optional parent note

    # Date tracking
    recorded_date = Column(Date, nullable=False, index=True)  # The date this mood represents
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    parent = relationship("User", foreign_keys=[parent_id], backref="parent_mood_entries")
    child = relationship("Student", foreign_keys=[child_id], backref="parent_mood_entries")

    def __repr__(self):
        child_str = f"child={self.child_id}" if self.child_id else "family"
        return f"<MoodEntry(id={self.id}, parent={self.parent_id}, {child_str}, emoji={self.emoji}, date={self.recorded_date})>"
