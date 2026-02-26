"""
Course Pydantic Schemas for Urban Home School (The Bird AI)

This module defines Pydantic schemas for CBC (Competency-Based Curriculum) aligned
course management. The schemas support:
- Course creation and updates by instructors and platform
- Multi-grade level targeting
- CBC learning areas and competencies
- Course enrollment and ratings
- Detailed syllabus and lesson management

CBC Learning Areas:
- Languages (English, Kiswahili, Indigenous Languages)
- Mathematics
- Environmental Activities (Pre-primary)
- Science and Technology
- Social Studies
- Creative Arts (Art, Music, Physical Education)
- Religious Education
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class CourseBase(BaseModel):
    """
    Base schema for course data.

    Attributes:
        title: Course title (3-200 characters)
        description: Detailed course description (minimum 10 characters)
        learning_area: CBC learning area (e.g., 'Mathematics', 'Science and Technology')
        grade_levels: Target grade levels (e.g., ['Grade 1', 'Grade 2'])
    """
    title: str = Field(..., min_length=3, max_length=200, description="Course title")
    description: str = Field(..., min_length=10, description="Detailed course description")
    learning_area: str = Field(..., description="CBC learning area (e.g., 'Mathematics', 'Science')")
    grade_levels: List[str] = Field(..., description="Target grade levels (e.g., ['Grade 1', 'Grade 2'])")

    @field_validator('grade_levels')
    @classmethod
    def validate_grade_levels(cls, v):
        """Ensure grade_levels list is not empty."""
        if not v or len(v) == 0:
            raise ValueError("At least one grade level must be specified")
        return v


class CourseCreate(CourseBase):
    """
    Schema for creating a new course.

    Additional attributes:
        thumbnail_url: Optional course thumbnail/cover image URL
        syllabus: Course syllabus as JSON/dict (CBC-aligned structure)
        lessons: List of lesson objects with content, activities, resources
        price: Course price in specified currency (default: 0.00 for free courses)
        currency: Three-letter currency code (default: KES for Kenyan Shilling)
        estimated_duration_hours: Estimated time to complete the course
        competencies: List of CBC competencies covered by the course
    """
    thumbnail_url: Optional[str] = Field(None, description="Course thumbnail/cover image URL")
    syllabus: dict = Field(default_factory=dict, description="Course syllabus structure")
    lessons: List[dict] = Field(default_factory=list, description="List of lessons with content")
    price: Decimal = Field(default=Decimal("0.00"), ge=0, description="Course price (0.00 for free)")
    currency: str = Field(default="KES", max_length=3, description="Currency code (ISO 4217)")
    estimated_duration_hours: Optional[int] = Field(None, ge=1, description="Estimated completion time in hours")
    competencies: List[dict] = Field(default_factory=list, description="CBC competencies covered")
    course_code: Optional[str] = Field(None, max_length=50, description="Short unique code e.g. 'ENV-G2'")

    @field_validator('price')
    @classmethod
    def validate_price(cls, v):
        """Ensure price is non-negative."""
        if v < 0:
            raise ValueError("Price must be non-negative")
        return v

    @field_validator('currency')
    @classmethod
    def validate_currency(cls, v):
        """Ensure currency code is uppercase."""
        return v.upper()


class CourseUpdate(BaseModel):
    """
    Schema for updating an existing course.

    All fields are optional to allow partial updates.
    Only instructors and admins can update courses.
    """
    title: Optional[str] = Field(None, min_length=3, max_length=200, description="Updated course title")
    description: Optional[str] = Field(None, min_length=10, description="Updated course description")
    thumbnail_url: Optional[str] = Field(None, description="Updated thumbnail URL")
    learning_area: Optional[str] = Field(None, description="Updated CBC learning area")
    grade_levels: Optional[List[str]] = Field(None, description="Updated target grade levels")
    syllabus: Optional[dict] = Field(None, description="Updated syllabus structure")
    lessons: Optional[List[dict]] = Field(None, description="Updated lessons")
    price: Optional[Decimal] = Field(None, ge=0, description="Updated price")
    is_published: Optional[bool] = Field(None, description="Publication status")
    is_featured: Optional[bool] = Field(None, description="Featured course status")
    course_code: Optional[str] = Field(None, max_length=50, description="Updated short unique code")

    @field_validator('grade_levels')
    @classmethod
    def validate_grade_levels(cls, v):
        """Ensure grade_levels list is not empty if provided."""
        if v is not None and len(v) == 0:
            raise ValueError("At least one grade level must be specified")
        return v

    @field_validator('price')
    @classmethod
    def validate_price(cls, v):
        """Ensure price is non-negative if provided."""
        if v is not None and v < 0:
            raise ValueError("Price must be non-negative")
        return v


class CourseResponse(CourseBase):
    """
    Schema for returning course data in API responses.

    Includes computed fields:
        enrollment_count: Number of students enrolled
        average_rating: Average rating from reviews (1-5 scale)
        total_reviews: Total number of reviews
    """
    id: UUID
    course_code: Optional[str] = Field(None, description="Short unique code e.g. 'ENV-G2'")
    thumbnail_url: Optional[str] = None
    instructor_id: Optional[UUID] = Field(None, description="Instructor UUID (None for platform courses)")
    is_platform_created: bool = Field(default=False, description="True if created by platform team")
    price: Decimal
    currency: str
    is_published: bool = Field(default=False, description="Publication status")
    is_featured: bool = Field(default=False, description="Featured on homepage")
    enrollment_count: int = Field(default=0, description="Number of enrolled students")
    average_rating: Decimal = Field(default=Decimal("0.0"), description="Average rating (1-5)")
    total_reviews: int = Field(default=0, description="Total number of reviews")
    estimated_duration_hours: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = Field(None, description="Timestamp when course was published")

    class Config:
        from_attributes = True


class CourseWithDetails(CourseResponse):
    """
    Extended course schema with full details.

    Includes:
        syllabus: Complete course syllabus with learning objectives
        lessons: All lessons with content, activities, and resources
        competencies: Detailed CBC competencies mapping

    Use this schema when returning full course details for enrolled students
    or instructors managing the course.
    """
    syllabus: dict = Field(default_factory=dict, description="Complete course syllabus")
    lessons: List[dict] = Field(default_factory=list, description="All lessons with full content")
    competencies: List[dict] = Field(default_factory=list, description="CBC competencies mapping")


class CourseEnrollment(BaseModel):
    """
    Schema for enrolling a student in a course.

    Attributes:
        course_id: UUID of the course to enroll in
        student_id: UUID of the student being enrolled

    Note: Payment verification should be handled before creating enrollment
    for paid courses.
    """
    course_id: UUID = Field(..., description="Course UUID")
    student_id: UUID = Field(..., description="Student UUID")


class CourseRating(BaseModel):
    """
    Schema for rating and reviewing a course.

    Attributes:
        course_id: UUID of the course being rated
        rating: Integer rating from 1 (poor) to 5 (excellent)
        review: Optional text review (max 1000 characters)

    Only enrolled students can rate courses they have accessed.
    """
    course_id: UUID = Field(..., description="Course UUID")
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 (poor) to 5 (excellent)")
    review: Optional[str] = Field(None, max_length=1000, description="Optional text review")
