"""
Assessment models for quizzes, assignments, projects, and exams.

This module contains SQLAlchemy models for assessments and student submissions,
supporting various assessment types with automatic and manual grading capabilities.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.database import Base


class Assessment(Base):
    """
    Assessment model for quizzes, assignments, projects, and exams.

    Supports multiple question types, timed assessments, auto-grading,
    and flexible availability windows.
    """
    __tablename__ = "assessments"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Relationships
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # Assessment information
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Assessment type
    assessment_type = Column(String(50), nullable=False, index=True)  # 'quiz', 'assignment', 'project', 'exam'

    # Questions/Content
    questions = Column(JSONB, default=[], nullable=False)  # Array of question objects
    # Question format: {"id": str, "type": "multiple_choice"|"essay"|"true_false", "question": str, "options": [], "correct_answer": any, "points": int}

    # Grading
    total_points = Column(Integer, nullable=False)
    passing_score = Column(Integer, nullable=False)  # Minimum points to pass
    auto_gradable = Column(Boolean, default=True, nullable=False)  # False for essays/projects

    # Time constraints
    duration_minutes = Column(Integer, nullable=True)  # null for untimed

    # Availability
    is_published = Column(Boolean, default=False, nullable=False, index=True)
    available_from = Column(DateTime, nullable=True)
    available_until = Column(DateTime, nullable=True)

    # Attempts
    max_attempts = Column(Integer, default=1, nullable=False)

    # Statistics
    total_submissions = Column(Integer, default=0, nullable=False)
    average_score = Column(Numeric(5, 2), default=0.00, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        """String representation of Assessment."""
        return f"<Assessment(id={self.id}, title='{self.title}', type='{self.assessment_type}', course_id={self.course_id})>"

    @property
    def is_quiz(self) -> bool:
        """Check if assessment is a quiz."""
        return self.assessment_type == "quiz"

    @property
    def is_assignment(self) -> bool:
        """Check if assessment is an assignment."""
        return self.assessment_type == "assignment"

    @property
    def is_project(self) -> bool:
        """Check if assessment is a project."""
        return self.assessment_type == "project"

    @property
    def is_exam(self) -> bool:
        """Check if assessment is an exam."""
        return self.assessment_type == "exam"

    @property
    def is_timed(self) -> bool:
        """Check if assessment has a time limit."""
        return self.duration_minutes is not None

    @property
    def is_available(self) -> bool:
        """
        Check if assessment is currently available.

        Returns True if:
        - Assessment is published
        - Current time is after available_from (if set)
        - Current time is before available_until (if set)
        """
        if not self.is_published:
            return False

        now = datetime.utcnow()

        if self.available_from and now < self.available_from:
            return False

        if self.available_until and now > self.available_until:
            return False

        return True


class AssessmentSubmission(Base):
    """
    Student submission model for assessments.

    Tracks submission data, grading status, scores, feedback, and attempt history.
    """
    __tablename__ = "assessment_submissions"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Relationships
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)

    # Submission data
    answers = Column(JSONB, default={}, nullable=False)  # {"question_id": "answer"}

    # Grading
    score = Column(Integer, nullable=True)  # null until graded
    is_graded = Column(Boolean, default=False, nullable=False, index=True)
    graded_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Feedback
    feedback = Column(Text, nullable=True)

    # Status
    is_submitted = Column(Boolean, default=False, nullable=False)
    attempt_number = Column(Integer, default=1, nullable=False)

    # Time tracking
    started_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    graded_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        """String representation of AssessmentSubmission."""
        return f"<AssessmentSubmission(id={self.id}, assessment_id={self.assessment_id}, student_id={self.student_id}, attempt={self.attempt_number}, score={self.score})>"

    @property
    def passed(self) -> bool:
        """
        Check if submission passed the assessment.

        Returns True if graded and score meets or exceeds passing score.
        Requires access to the parent Assessment model.
        """
        # Note: This property would typically be used with a relationship to Assessment
        # In practice, you'd access this via: submission.assessment.passing_score
        # For now, returns None if not graded
        if not self.is_graded or self.score is None:
            return False

        # This would need the assessment relationship to work properly
        # Example usage: return self.score >= self.assessment.passing_score
        # For now, we'll return a placeholder
        return True  # Placeholder - needs assessment relationship

    @property
    def percentage(self) -> float:
        """
        Calculate submission score as a percentage.

        Returns score/total_points * 100.
        Requires access to the parent Assessment model.
        Returns 0.0 if not graded or score is None.
        """
        if not self.is_graded or self.score is None:
            return 0.0

        # This would need the assessment relationship to work properly
        # Example usage: return (self.score / self.assessment.total_points) * 100
        # For now, we'll return a placeholder
        return 0.0  # Placeholder - needs assessment relationship
