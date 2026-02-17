"""
Course Model for Urban Home School

This model represents CBC (Competency-Based Curriculum) aligned courses with support
for multiple grade levels, learning areas, and comprehensive content management.

Key Features:
- CBC alignment with grade levels and learning areas
- Support for both platform-created and external instructor courses
- Revenue sharing model: 60% instructor / 30% platform / 10% partner
- Flexible pricing (free or paid courses)
- Structured syllabus and lessons using JSONB
- Course statistics (enrollments, ratings, reviews)
- Publication workflow with timestamps

Revenue Sharing:
- External instructors receive 60% of course revenue
- Platform receives 30% for infrastructure and support
- Partners receive 10% for student referrals
- Platform-created courses: 100% platform revenue
"""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Integer,
    DateTime,
    UUID,
    ForeignKey,
    Numeric,
    ARRAY,
)
from sqlalchemy.dialects.postgresql import JSONB

from app.database import Base


class Course(Base):
    """
    A CBC-aligned course with multi-grade-level support and revenue sharing.

    Courses can be created by platform admins (is_platform_created=True) or
    external instructors. Each course targets one or more grade levels and a
    learning area from Kenya's CBC framework. Content is stored as structured
    JSONB (syllabus and lessons array). Paid courses follow a 60/30/10
    revenue split between instructor, platform, and partner. Statistics
    (enrollment count, average rating, reviews) are denormalized here for
    fast dashboard queries.
    """

    __tablename__ = "courses"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Course information
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    thumbnail_url = Column(String(500), nullable=True)

    # CBC alignment
    grade_levels = Column(ARRAY(String), nullable=False, index=True)  # ['Grade 1', 'Grade 2']
    learning_area = Column(String(100), nullable=False, index=True)  # 'Mathematics', 'Science', 'Languages', etc.

    # Course content
    syllabus = Column(JSONB, default={}, nullable=False)  # Structured course content
    lessons = Column(JSONB, default=[], nullable=False)  # Array of lesson objects

    # Creator information
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    is_platform_created = Column(Boolean, default=False, nullable=False)  # Created by admin vs instructor

    # Pricing (for external instructors - 60/30/10 split)
    price = Column(Numeric(10, 2), default=0.00, nullable=False)  # 0.00 for free courses
    currency = Column(String(3), default='KES', nullable=False)  # KES, USD, etc.

    # Course status
    is_published = Column(Boolean, default=False, nullable=False, index=True)
    is_featured = Column(Boolean, default=False, nullable=False)

    # Statistics
    enrollment_count = Column(Integer, default=0, nullable=False)
    average_rating = Column(Numeric(3, 2), default=0.00, nullable=False)  # 0.00 to 5.00
    total_reviews = Column(Integer, default=0, nullable=False)

    # Duration
    estimated_duration_hours = Column(Integer, nullable=True)

    # Competencies
    competencies = Column(JSONB, default=[], nullable=False)  # CBC competencies covered

    # Instructor dashboard enhancements
    revenue_split_id = Column(UUID(as_uuid=True), ForeignKey("instructor_revenue_splits.id", ondelete="SET NULL"), nullable=True)
    cbc_analysis_id = Column(UUID(as_uuid=True), ForeignKey("instructor_cbc_analyses.id", ondelete="SET NULL"), nullable=True)
    ai_generated_meta = Column(JSONB, nullable=True)  # AI-generated metadata (keywords, difficulty, etc.)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    published_at = Column(DateTime, nullable=True)

    def __repr__(self) -> str:
        """String representation for debugging"""
        return (
            f"<Course(id={self.id}, title='{self.title}', "
            f"grade_levels={self.grade_levels}, learning_area='{self.learning_area}', "
            f"price={self.price}, is_published={self.is_published})>"
        )

    @property
    def is_free(self) -> bool:
        """Check if the course is free"""
        return self.price == 0 or self.price == Decimal('0.00')

    @property
    def is_paid(self) -> bool:
        """Check if the course is paid"""
        return self.price > 0

    @property
    def is_external_instructor(self) -> bool:
        """Check if the course is created by an external instructor"""
        return not self.is_platform_created and self.instructor_id is not None

    def update_rating(self, new_rating: float) -> None:
        """
        Update the average rating with a new rating value.

        This method recalculates the average rating using the formula:
        new_average = ((current_average * total_reviews) + new_rating) / (total_reviews + 1)

        Args:
            new_rating: The new rating value (should be between 0.00 and 5.00)

        Raises:
            ValueError: If new_rating is not between 0.00 and 5.00
        """
        if not 0.00 <= new_rating <= 5.00:
            raise ValueError("Rating must be between 0.00 and 5.00")

        # Calculate new average
        current_total = float(self.average_rating) * self.total_reviews
        new_total = current_total + new_rating
        self.total_reviews += 1
        self.average_rating = Decimal(str(round(new_total / self.total_reviews, 2)))
