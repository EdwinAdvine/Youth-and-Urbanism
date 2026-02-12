"""
Enrollment Pydantic Schemas for Urban Home School

This module defines Pydantic schemas for student course enrollment management.
Schemas handle enrollment creation, progress tracking, and completion workflows.

Key Features:
- Enrollment lifecycle management (enroll, progress, complete, drop)
- Progress tracking with lesson completion
- Performance metrics (grades, quiz scores)
- Course ratings and reviews
- Payment integration for paid courses
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.models.enrollment import EnrollmentStatus


class EnrollmentBase(BaseModel):
    """Base enrollment schema"""
    student_id: UUID = Field(..., description="Student UUID")
    course_id: UUID = Field(..., description="Course UUID")


class EnrollmentCreate(EnrollmentBase):
    """
    Schema for creating a new enrollment.

    For paid courses, payment_id should be provided after successful payment.
    For free courses, payment_id can be None.
    """
    payment_id: Optional[UUID] = Field(None, description="Payment transaction UUID for paid courses")
    payment_amount: Decimal = Field(default=Decimal("0.00"), ge=0, description="Amount paid for enrollment")

    @field_validator('payment_amount')
    @classmethod
    def validate_payment_amount(cls, v):
        """Ensure payment amount is non-negative."""
        if v < 0:
            raise ValueError("Payment amount must be non-negative")
        return v


class EnrollmentUpdate(BaseModel):
    """
    Schema for updating enrollment status and metadata.

    All fields are optional for partial updates.
    """
    status: Optional[EnrollmentStatus] = Field(None, description="Enrollment status")
    progress_percentage: Optional[Decimal] = Field(None, ge=0, le=100, description="Progress percentage (0-100)")
    current_grade: Optional[Decimal] = Field(None, ge=0, le=100, description="Current grade (0-100)")


class LessonCompletionRequest(BaseModel):
    """Schema for marking a lesson as completed"""
    lesson_id: str = Field(..., description="Unique identifier of the completed lesson")
    time_spent_minutes: int = Field(default=0, ge=0, description="Time spent on this lesson in minutes")


class EnrollmentRatingRequest(BaseModel):
    """Schema for rating and reviewing a course after enrollment"""
    rating: int = Field(..., ge=1, le=5, description="Course rating from 1 (poor) to 5 (excellent)")
    review: Optional[str] = Field(None, max_length=1000, description="Optional text review")

    @field_validator('rating')
    @classmethod
    def validate_rating(cls, v):
        """Ensure rating is between 1 and 5."""
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


class EnrollmentResponse(EnrollmentBase):
    """
    Schema for returning enrollment data in API responses.

    Includes all enrollment tracking fields and computed properties.
    """
    id: UUID
    status: EnrollmentStatus
    progress_percentage: Decimal = Field(default=Decimal("0.00"), description="Progress percentage (0-100)")
    completed_lessons: List[str] = Field(default_factory=list, description="List of completed lesson IDs")
    total_time_spent_minutes: int = Field(default=0, description="Total time spent on course in minutes")
    last_accessed_at: Optional[datetime] = Field(None, description="Last time student accessed the course")

    # Performance metrics
    current_grade: Optional[Decimal] = Field(None, description="Current grade (0-100)")
    quiz_scores: List[dict] = Field(default_factory=list, description="Quiz score records")
    assignment_scores: List[dict] = Field(default_factory=list, description="Assignment score records")

    # Completion tracking
    is_completed: bool = Field(default=False, description="Whether enrollment is completed")
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")
    certificate_id: Optional[UUID] = Field(None, description="Certificate UUID if issued")

    # Payment info
    payment_id: Optional[UUID] = None
    payment_amount: Decimal = Field(default=Decimal("0.00"), description="Amount paid")

    # Rating and review
    rating: Optional[int] = Field(None, ge=1, le=5, description="Student rating (1-5)")
    review: Optional[str] = Field(None, description="Student review text")
    reviewed_at: Optional[datetime] = Field(None, description="Review timestamp")

    # Timestamps
    enrolled_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EnrollmentWithCourseDetails(EnrollmentResponse):
    """
    Extended enrollment schema with full course details.

    Includes nested course information for dashboard displays.
    """
    course: dict = Field(..., description="Full course details")


class EnrollmentStatsResponse(BaseModel):
    """
    Schema for enrollment statistics.

    Used for analytics and reporting.
    """
    total_enrollments: int = Field(default=0, description="Total number of enrollments")
    active_enrollments: int = Field(default=0, description="Currently active enrollments")
    completed_enrollments: int = Field(default=0, description="Completed enrollments")
    dropped_enrollments: int = Field(default=0, description="Dropped enrollments")
    average_progress: Decimal = Field(default=Decimal("0.00"), description="Average progress percentage")
    average_completion_time_days: Optional[float] = Field(None, description="Average time to complete in days")


class StudentEnrollmentListResponse(BaseModel):
    """
    Schema for listing a student's enrollments with course summaries.
    """
    enrollments: List[EnrollmentWithCourseDetails]
    total: int = Field(..., description="Total number of enrollments")
    active_count: int = Field(default=0, description="Number of active enrollments")
    completed_count: int = Field(default=0, description="Number of completed enrollments")


class CourseEnrollmentListResponse(BaseModel):
    """
    Schema for listing enrollments for a specific course.

    Used by instructors to view who's enrolled in their course.
    """
    enrollments: List[EnrollmentResponse]
    total: int = Field(..., description="Total number of enrollments")
    course_id: UUID
    course_title: str
