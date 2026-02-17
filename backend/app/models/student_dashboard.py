"""
Student Dashboard Models

Models supporting the student dashboard experience: mood check-ins,
learning streaks, AI-generated daily plans, reflective journal entries,
course wishlists, and session preparation tips. These tables power the
personalized dashboard widgets that help students stay organized,
self-aware, and on track with their learning goals.
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
    """
    A single mood check-in recorded by a student.

    Students log how they feel (happy, okay, tired, frustrated, excited)
    along with an energy level (1-5) and optional note. Check-ins can be
    triggered at login, manually, or by an AI prompt. The dashboard uses
    mood trends to adapt learning recommendations and alert parents.
    """
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
    """
    Tracks a student's consecutive-day learning streak.

    One row per student (unique student_id). Records the current streak
    length, longest historical streak, last activity date, and available
    streak shields (which let a student skip a day without breaking the
    streak). History is stored as a JSONB array of daily entries showing
    whether the student completed activities each day.
    """
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
    """
    A daily learning plan for a student, typically AI-generated.

    Each plan contains a JSONB array of items (lessons, activities, breaks)
    with estimated durations. Plans can be AI-generated or manually edited
    by the student. The dashboard tracks total planned duration and how
    many items have been completed.
    """
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
    """
    A reflective journal entry written by a student.

    Students write free-form reflections that the AI analyzes to produce
    insights (sentiment, key topics, suggestions) stored in the ai_insights
    JSONB field. Optional reflection_prompts guide the student's next entry.
    Entries can be tagged with a mood to correlate with mood check-in data.
    """
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
    """
    A course saved to a student's wishlist for future enrollment.

    Links a student to a course they are interested in but have not yet
    enrolled in. A priority field allows the student to rank their wishlist
    items. The dashboard shows wishlisted courses as recommendations.
    """
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
    """
    AI-generated preparation tips for an upcoming live session.

    Before a live class, the AI generates tips (JSONB array), an engagement
    prediction (high/medium/low), and recommended pre-reading materials.
    Teachers can also attach notes. This helps students arrive prepared and
    boosts participation during the live session.
    """
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
