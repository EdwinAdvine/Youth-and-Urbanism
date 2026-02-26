"""
Instructor Session Models

Models for live session attendance tracking and follow-up tasks.
Extends the existing LiveSession model from staff/live_session.py
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Integer, DateTime, UUID, ForeignKey, Numeric, Enum as SQLEnum, Date
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class FollowUpStatus(str, enum.Enum):
    """Status of follow-up tasks"""
    PENDING = "pending"
    COMPLETED = "completed"


class InstructorSessionAttendance(Base):
    """
    Per-student attendance record for a live session.

    Captures when a student joined and left, total duration, and AI-calculated
    engagement metrics (questions asked, reactions, participation). This data
    feeds the instructor's session analytics and helps the AI generate
    follow-up recommendations for disengaged students.
    """

    __tablename__ = "instructor_session_attendance"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Session and student
    session_id = Column(UUID(as_uuid=True), ForeignKey("live_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)

    # Attendance timing
    joined_at = Column(DateTime, nullable=False)
    left_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)

    # Engagement metrics (AI-calculated)
    engagement_score = Column(Numeric(5, 2), nullable=True)  # 0-100
    attention_data = Column(JSONB, nullable=True)  # Questions asked, reactions, participation

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    session = relationship("LiveSession", foreign_keys=[session_id])
    student = relationship("Student", foreign_keys=[student_id])


class InstructorSessionFollowUp(Base):
    """
    A follow-up task created by an instructor after a live session.

    Tasks can be general (for the whole class) or assigned to a specific
    student. Each task has a title, description, due date, and status
    (pending -> completed). Instructors use these to track post-session
    action items like sending materials, grading, or one-on-one check-ins.
    """

    __tablename__ = "instructor_session_follow_ups"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Session and instructor
    session_id = Column(UUID(as_uuid=True), ForeignKey("live_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Task details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    status = Column(SQLEnum(FollowUpStatus), default=FollowUpStatus.PENDING, nullable=False, index=True)

    # Optional: assign to specific student
    assigned_to_student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="SET NULL"), nullable=True, index=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    session = relationship("LiveSession", foreign_keys=[session_id])
    instructor = relationship("User", foreign_keys=[instructor_id])
    assigned_to_student = relationship("Student", foreign_keys=[assigned_to_student_id])
