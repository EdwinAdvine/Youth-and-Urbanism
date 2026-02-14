"""
Student Dashboard Models - Dashboard, Mood, Streaks, Daily Plans
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..database import Base


class MoodType(str, enum.Enum):
    happy = "happy"
    okay = "okay"
    tired = "tired"
    frustrated = "frustrated"
    excited = "excited"


class StudentMoodEntry(Base):
    """Student mood check-ins"""
    __tablename__ = "student_mood_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    mood_type = Column(SQLEnum(MoodType), nullable=False)
    energy_level = Column(Integer, default=3)  # 1-5 scale
    note = Column(Text, nullable=True)
    context = Column(String(50), default="manual")  # login, manual, ai_prompt
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Soft delete
    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", back_populates="mood_entries")

    def __repr__(self):
        return f"<StudentMoodEntry {self.id} - {self.student_id} - {self.mood_type}>"


class StudentStreak(Base):
    """Student learning streaks"""
    __tablename__ = "student_streaks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, unique=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(DateTime, nullable=True)
    streak_shields = Column(Integer, default=0)  # Can "freeze" a streak
    history = Column(JSONB, default=list)  # Array of {date, completed, activities_count}

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", back_populates="streak")

    def __repr__(self):
        return f"<StudentStreak {self.student_id} - Current: {self.current_streak}>"


class StudentDailyPlan(Base):
    """AI-generated daily learning plans"""
    __tablename__ = "student_daily_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime, nullable=False)
    items = Column(JSONB, default=list)  # Array of plan items
    ai_generated = Column(Boolean, default=True)
    manually_edited = Column(Boolean, default=False)
    total_duration = Column(Integer, default=0)  # minutes
    completed_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", back_populates="daily_plans")

    def __repr__(self):
        return f"<StudentDailyPlan {self.student_id} - {self.date.date()}>"


class StudentJournalEntry(Base):
    """AI journal and reflections"""
    __tablename__ = "student_journal_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    mood_tag = Column(SQLEnum(MoodType), nullable=True)
    ai_insights = Column(JSONB, nullable=True)  # {sentiment, topics, suggestions}
    reflection_prompts = Column(ARRAY(String), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", back_populates="journal_entries")

    def __repr__(self):
        return f"<StudentJournalEntry {self.id} - {self.student_id}>"


class StudentWishlist(Base):
    """Student course wishlist"""
    __tablename__ = "student_wishlists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    priority = Column(Integer, default=0)
    added_at = Column(DateTime, default=datetime.utcnow)

    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", back_populates="wishlists")
    course = relationship("Course")

    def __repr__(self):
        return f"<StudentWishlist {self.student_id} - {self.course_id}>"


class StudentSessionPrep(Base):
    """AI session preparation tips"""
    __tablename__ = "student_session_prep"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), nullable=False)  # Reference to live session
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    tips = Column(JSONB, default=list)  # Array of tip strings
    engagement_prediction = Column(String(20), default="medium")  # high, medium, low
    recommended_pre_reading = Column(ARRAY(String), nullable=True)
    teacher_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", back_populates="session_preps")

    def __repr__(self):
        return f"<StudentSessionPrep {self.session_id} - {self.student_id}>"
