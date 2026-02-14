"""
Student model for Urban Home School platform.

This module defines the Student model representing student profiles in the system.
Each student has a one-to-one relationship with their AI tutor and tracks their
academic progress according to Kenya's Competency-Based Curriculum (CBC).
"""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class Student(Base):
    """
    Student profiles with one-to-one AI tutor relationship.

    This model stores student information including academic progress,
    CBC competencies, learning profiles, and relationships with users
    (student user account and parent guardian account).

    Attributes:
        id: Unique identifier (UUID)
        user_id: Foreign key to users table (student's user account)
        parent_id: Foreign key to users table (parent/guardian account)
        admission_number: Unique student admission/registration number
        grade_level: Current grade level (e.g., 'ECD 1', 'Grade 1', 'Grade 7')
        enrollment_date: Date when student enrolled in the platform
        is_active: Whether the student account is currently active
        learning_profile: JSONB field containing learning preferences and needs
        competencies: JSONB field tracking CBC competency progress
        overall_performance: JSONB field storing grades and assessment results
        created_at: Timestamp when record was created
        updated_at: Timestamp when record was last updated
    """
    __tablename__ = "students"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Relationships
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    parent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Student identification
    admission_number = Column(String(50), unique=True, nullable=False, index=True)

    # Academic information
    grade_level = Column(String(20), nullable=False, index=True)  # 'ECD 1', 'Grade 1', 'Grade 2', etc.

    # Enrollment
    enrollment_date = Column(Date, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Learning profile (flexible JSONB)
    # Contains: learning_style, strengths, weaknesses, interests, goals, special_needs
    learning_profile = Column(JSONB, default={}, nullable=False)

    # CBC (Competency-Based Curriculum) tracking
    competencies = Column(JSONB, default={}, nullable=False)  # CBC competency progress

    # Performance tracking
    overall_performance = Column(JSONB, default={}, nullable=False)  # Grades, assessments

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Dashboard relationships (student_dashboard.py)
    mood_entries = relationship("StudentMoodEntry", back_populates="student", cascade="all, delete-orphan")
    streak = relationship("StudentStreak", back_populates="student", uselist=False, cascade="all, delete-orphan")
    daily_plans = relationship("StudentDailyPlan", back_populates="student", cascade="all, delete-orphan")
    journal_entries = relationship("StudentJournalEntry", back_populates="student", cascade="all, delete-orphan")
    wishlists = relationship("StudentWishlist", back_populates="student", cascade="all, delete-orphan")
    session_preps = relationship("StudentSessionPrep", back_populates="student", cascade="all, delete-orphan")

    # Gamification relationships (student_gamification.py)
    xp_events = relationship("StudentXPEvent", back_populates="student", cascade="all, delete-orphan")
    level = relationship("StudentLevel", back_populates="student", uselist=False, cascade="all, delete-orphan")
    badges = relationship("StudentBadge", back_populates="student", cascade="all, delete-orphan")
    goals = relationship("StudentGoal", back_populates="student", cascade="all, delete-orphan")
    skill_nodes = relationship("StudentSkillNode", back_populates="student", cascade="all, delete-orphan")
    weekly_reports = relationship("StudentWeeklyReport", back_populates="student", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        """String representation of Student instance."""
        return (
            f"<Student(id={self.id}, admission_number='{self.admission_number}', "
            f"grade_level='{self.grade_level}', is_active={self.is_active})>"
        )

    @property
    def is_ecd(self) -> bool:
        """Check if student is in Early Childhood Development (ECD) level."""
        return "ECD" in self.grade_level.upper()

    @property
    def is_primary(self) -> bool:
        """Check if student is in primary school (Grades 1-6)."""
        if "GRADE" in self.grade_level.upper():
            grade_num = self.grade_number
            return grade_num is not None and 1 <= grade_num <= 6
        return False

    @property
    def is_junior_secondary(self) -> bool:
        """Check if student is in junior secondary school (Grades 7-9)."""
        if "GRADE" in self.grade_level.upper():
            grade_num = self.grade_number
            return grade_num is not None and 7 <= grade_num <= 9
        return False

    @property
    def is_senior_secondary(self) -> bool:
        """Check if student is in senior secondary school (Grades 10-12)."""
        if "GRADE" in self.grade_level.upper():
            grade_num = self.grade_number
            return grade_num is not None and 10 <= grade_num <= 12
        return False

    @property
    def grade_number(self) -> Optional[int]:
        """
        Extract numeric grade level from grade_level string.

        Returns:
            Integer grade number (1-12) or None if ECD or unable to extract.

        Examples:
            'Grade 1' -> 1
            'Grade 10' -> 10
            'ECD 2' -> None
        """
        if "ECD" in self.grade_level.upper():
            return None

        # Extract number from grade_level string
        # Expected formats: 'Grade 1', 'Grade 2', etc.
        try:
            parts = self.grade_level.split()
            for part in parts:
                if part.isdigit():
                    return int(part)
        except (ValueError, AttributeError):
            pass

        return None
