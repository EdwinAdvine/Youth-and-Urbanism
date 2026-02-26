"""
Instructor Application Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, EmailStr


class InstructorApplicationCreate(BaseModel):
    """Schema for submitting an instructor application."""
    full_name: str = Field(..., min_length=1, max_length=200, description="Applicant's full name")
    email: EmailStr = Field(..., description="Applicant's email address")
    phone: Optional[str] = Field(None, max_length=50, description="Phone number")
    qualifications: str = Field(..., min_length=1, description="Academic/professional qualifications")
    experience_years: int = Field(0, ge=0, description="Years of teaching experience")
    subjects: Optional[List[str]] = Field(None, description="List of subjects the applicant can teach")
    bio: Optional[str] = Field(None, description="Short biography or personal statement")


class InstructorApplicationReview(BaseModel):
    """Schema for admin review of an instructor application."""
    status: str = Field(..., pattern="^(approved|rejected)$", description="Review decision: approved or rejected")
    review_notes: Optional[str] = Field(None, description="Notes about the review decision")


class InstructorApplicationResponse(BaseModel):
    """Full instructor application in API response."""
    id: UUID
    user_id: Optional[UUID] = None
    full_name: str
    email: str
    phone: Optional[str] = None
    qualifications: str
    experience_years: int = 0
    subjects: Optional[List[str]] = None
    bio: Optional[str] = None
    cv_url: Optional[str] = None
    id_document_front_url: Optional[str] = None
    id_document_back_url: Optional[str] = None
    status: str = "pending"
    invite_expires_at: Optional[datetime] = None
    reviewed_by: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InstructorApplicationListResponse(BaseModel):
    """Paginated instructor application list."""
    applications: List[InstructorApplicationResponse]
    total: int
