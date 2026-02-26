"""
Student Mastery and Session Tracking Models

Models for tracking topic-level mastery with spaced repetition (SM-2 algorithm)
and daily AI session usage limits. The mastery system gates advancement: students
must score >= 80% on 3 consecutive attempts before moving to the next topic.
Session logs enforce a 2-hour daily tutoring cap with Pomodoro-style breaks.
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Date, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..database import Base


class StudentMasteryRecord(Base):
    """
    Tracks a student's mastery of a specific topic with spaced repetition.

    Mastery is gated: a topic is considered mastered when the student scores
    >= 0.8 (80%) on 3 consecutive attempts. The SM-2 spaced repetition
    algorithm schedules review dates to optimize long-term retention.

    Attributes:
        student_id: FK to students table
        topic_name: Specific topic (e.g. 'Addition of 2-digit numbers')
        subject: Subject area (e.g. 'Mathematics')
        grade_level: Grade when this topic was studied
        mastery_level: Current mastery score (0.0 to 1.0)
        attempt_count: Total number of assessment attempts
        consecutive_correct: Consecutive attempts scoring >= 80%
        is_mastered: True when consecutive_correct >= 3 with mastery_level >= 0.8
        next_review_date: SM-2 computed next review date
        review_interval_days: Current SM-2 interval between reviews
        easiness_factor: SM-2 easiness factor (default 2.5)
        attempt_history: JSONB array of {date, score, time_spent_seconds}
    """
    __tablename__ = "student_mastery_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    topic_name = Column(String(200), nullable=False)
    subject = Column(String(100), nullable=False, index=True)
    grade_level = Column(String(20), nullable=False)

    # Mastery tracking
    mastery_level = Column(Float, default=0.0, nullable=False)
    attempt_count = Column(Integer, default=0, nullable=False)
    consecutive_correct = Column(Integer, default=0, nullable=False)
    is_mastered = Column(Boolean, default=False, nullable=False, index=True)

    # Spaced repetition (SM-2)
    next_review_date = Column(DateTime, nullable=True, index=True)
    review_interval_days = Column(Integer, default=1, nullable=False)
    easiness_factor = Column(Float, default=2.5, nullable=False)

    # History
    attempt_history = Column(JSONB, default=list, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="mastery_records")

    def __repr__(self):
        return (
            f"<StudentMasteryRecord {self.topic_name} "
            f"mastery={self.mastery_level:.0%} mastered={self.is_mastered}>"
        )


class StudentSessionLog(Base):
    """
    Daily AI session usage tracking for enforcing tutoring time limits.

    One row per student per calendar date. Tracks total AI interaction time,
    message counts, and Pomodoro cycles to enforce a 2-hour daily cap and
    encourage regular breaks (25-minute Pomodoro intervals).

    Attributes:
        student_id: FK to students table
        date: Calendar date (unique with student_id)
        total_minutes: Total minutes spent in AI tutoring today
        core_tutoring_minutes: Minutes spent on academic topics
        message_count: Number of messages sent today
        pomodoro_completed: Number of 25-minute focus blocks completed
        break_count: Number of breaks taken
        session_metadata: JSONB for additional tracking data
    """
    __tablename__ = "student_session_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    date = Column(Date, nullable=False, index=True)

    # Time tracking
    total_minutes = Column(Integer, default=0, nullable=False)
    core_tutoring_minutes = Column(Integer, default=0, nullable=False)

    # Interaction counts
    message_count = Column(Integer, default=0, nullable=False)
    pomodoro_completed = Column(Integer, default=0, nullable=False)
    break_count = Column(Integer, default=0, nullable=False)

    # Flexible metadata
    session_metadata = Column(JSONB, default=dict, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="session_logs")

    __table_args__ = (
        UniqueConstraint("student_id", "date", name="uq_student_session_log_date"),
    )

    def __repr__(self):
        return (
            f"<StudentSessionLog {self.date} "
            f"minutes={self.total_minutes} messages={self.message_count}>"
        )
