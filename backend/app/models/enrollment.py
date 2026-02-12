"""
Enrollment Model for Urban Home School

This model represents the relationship between students and courses, tracking
enrollment status, progress, completion, and performance metrics.

Key Features:
- Student-Course many-to-many relationship tracking
- Progress tracking (lessons completed, time spent)
- Performance metrics (grades, quiz scores)
- Enrollment status management (active, completed, dropped, expired)
- Payment tracking for paid courses
- Certificate generation upon completion
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    DateTime,
    UUID,
    ForeignKey,
    Numeric,
    Enum as SQLEnum,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class EnrollmentStatus(str, enum.Enum):
    """Enrollment status options"""
    ACTIVE = "active"
    COMPLETED = "completed"
    DROPPED = "dropped"
    EXPIRED = "expired"
    PENDING_PAYMENT = "pending_payment"


class Enrollment(Base):
    """Student-Course enrollment tracking"""

    __tablename__ = "enrollments"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign keys
    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    course_id = Column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Enrollment status
    status = Column(
        SQLEnum(EnrollmentStatus),
        default=EnrollmentStatus.ACTIVE,
        nullable=False,
        index=True
    )

    # Progress tracking
    progress_percentage = Column(Numeric(5, 2), default=0.00, nullable=False)  # 0.00 to 100.00
    completed_lessons = Column(JSONB, default=[], nullable=False)  # Array of lesson IDs
    total_time_spent_minutes = Column(Integer, default=0, nullable=False)
    last_accessed_at = Column(DateTime, nullable=True)

    # Performance metrics
    current_grade = Column(Numeric(5, 2), default=0.00, nullable=True)  # 0.00 to 100.00
    quiz_scores = Column(JSONB, default=[], nullable=False)  # Array of quiz score objects
    assignment_scores = Column(JSONB, default=[], nullable=False)  # Array of assignment score objects

    # Completion tracking
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    certificate_id = Column(UUID(as_uuid=True), nullable=True)  # Link to certificate if completed

    # Payment tracking (for paid courses)
    payment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("transactions.id", ondelete="SET NULL"),
        nullable=True
    )
    payment_amount = Column(Numeric(10, 2), default=0.00, nullable=False)

    # Course feedback
    rating = Column(Integer, nullable=True)  # 1-5 rating after completion
    review = Column(String(1000), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    # Timestamps
    enrolled_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Soft delete
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    subscription = relationship("Subscription", back_populates="enrollment", uselist=False)

    def __repr__(self) -> str:
        """String representation for debugging"""
        return (
            f"<Enrollment(id={self.id}, student_id={self.student_id}, "
            f"course_id={self.course_id}, status={self.status}, "
            f"progress={self.progress_percentage}%)>"
        )

    @property
    def is_active(self) -> bool:
        """Check if enrollment is active"""
        return self.status == EnrollmentStatus.ACTIVE and not self.is_deleted

    @property
    def is_paid(self) -> bool:
        """Check if the enrollment required payment"""
        return self.payment_amount > 0 and self.payment_id is not None

    @property
    def completion_percentage(self) -> float:
        """Get completion percentage as float"""
        return float(self.progress_percentage)

    def mark_lesson_complete(self, lesson_id: str) -> None:
        """
        Mark a lesson as completed.

        Args:
            lesson_id: The unique identifier of the lesson

        Note:
            Updates completed_lessons JSONB array and last_accessed_at timestamp.
            Does not automatically recalculate progress_percentage.
        """
        if lesson_id not in self.completed_lessons:
            self.completed_lessons.append(lesson_id)
            self.last_accessed_at = datetime.utcnow()

    def update_progress(self, total_lessons: int) -> None:
        """
        Calculate and update progress percentage based on completed lessons.

        Args:
            total_lessons: Total number of lessons in the course
        """
        if total_lessons > 0:
            completed_count = len(self.completed_lessons)
            self.progress_percentage = Decimal(
                str(round((completed_count / total_lessons) * 100, 2))
            )
            self.last_accessed_at = datetime.utcnow()

            # Auto-complete if all lessons done
            if completed_count >= total_lessons and not self.is_completed:
                self.complete_enrollment()

    def complete_enrollment(self) -> None:
        """
        Mark the enrollment as completed.

        Sets status to COMPLETED, is_completed flag, and completion timestamp.
        """
        self.status = EnrollmentStatus.COMPLETED
        self.is_completed = True
        self.completed_at = datetime.utcnow()

    def add_rating(self, rating: int, review: Optional[str] = None) -> None:
        """
        Add student rating and review for the course.

        Args:
            rating: Integer rating from 1 to 5
            review: Optional text review (max 1000 characters)

        Raises:
            ValueError: If rating is not between 1 and 5
        """
        if not 1 <= rating <= 5:
            raise ValueError("Rating must be between 1 and 5")

        self.rating = rating
        self.review = review[:1000] if review else None
        self.reviewed_at = datetime.utcnow()

    def drop_enrollment(self) -> None:
        """
        Drop/withdraw from the enrollment.

        Changes status to DROPPED. Does not delete the record to maintain history.
        """
        self.status = EnrollmentStatus.DROPPED
        self.last_accessed_at = datetime.utcnow()
