"""
Student Pydantic schemas for request/response validation.

This module defines schemas for student management operations including
creation, updates, and responses with AI tutor information.
"""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class StudentBase(BaseModel):
    """
    Base schema for student data.

    Contains common fields shared across student schemas.
    """
    grade_level: str = Field(
        ...,
        description="Student grade level (e.g., 'Grade 1', 'ECD 1')"
    )
    learning_profile: dict = Field(
        default_factory=dict,
        description="Student's learning preferences and profile data"
    )


class StudentCreate(StudentBase):
    """
    Schema for creating a new student.

    Requires user_id, admission_number, and enrollment_date.
    Parent_id is optional for linking to a parent account.
    """
    user_id: UUID = Field(..., description="ID of the associated user account")
    parent_id: Optional[UUID] = Field(
        None,
        description="ID of the parent/guardian account"
    )
    admission_number: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Unique student admission number"
    )
    enrollment_date: date = Field(
        ...,
        description="Date the student enrolled"
    )


class StudentUpdate(BaseModel):
    """
    Schema for updating student information.

    All fields are optional to allow partial updates.
    """
    grade_level: Optional[str] = Field(
        None,
        description="Updated grade level"
    )
    learning_profile: Optional[dict] = Field(
        None,
        description="Updated learning profile data"
    )
    competencies: Optional[dict] = Field(
        None,
        description="Student competencies data (CBC framework)"
    )
    overall_performance: Optional[dict] = Field(
        None,
        description="Overall performance metrics and analytics"
    )
    is_active: Optional[bool] = Field(
        None,
        description="Whether the student account is active"
    )
    parent_id: Optional[UUID] = Field(
        None,
        description="Updated parent/guardian ID"
    )


class StudentResponse(StudentBase):
    """
    Schema for student data responses.

    Includes all student fields with timestamps and computed data.
    """
    id: UUID = Field(..., description="Student unique identifier")
    user_id: UUID = Field(..., description="Associated user account ID")
    parent_id: Optional[UUID] = Field(None, description="Parent/guardian ID")
    admission_number: str = Field(..., description="Student admission number")
    enrollment_date: date = Field(..., description="Enrollment date")
    is_active: bool = Field(..., description="Account active status")
    competencies: dict = Field(
        default_factory=dict,
        description="CBC competencies and assessments"
    )
    overall_performance: dict = Field(
        default_factory=dict,
        description="Performance metrics and analytics"
    )
    created_at: datetime = Field(..., description="Record creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        """Pydantic configuration."""
        from_attributes = True


class StudentWithAITutor(StudentResponse):
    """
    Extended student schema including AI tutor information.

    Combines student data with their assigned AI tutor details
    for enhanced response context.
    """
    ai_tutor_name: str = Field(
        ...,
        description="Name of the assigned AI tutor"
    )
    ai_tutor_response_mode: str = Field(
        ...,
        description="AI tutor response mode (text, voice, video)"
    )
    ai_tutor_total_interactions: int = Field(
        ...,
        description="Total number of interactions with AI tutor"
    )

    class Config:
        """Pydantic configuration."""
        from_attributes = True
