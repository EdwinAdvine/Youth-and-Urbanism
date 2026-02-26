"""
Scholarship Application Pydantic schemas.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ScholarshipApplicationCreate(BaseModel):
    """Schema for submitting a scholarship application."""
    applicant_type: str = Field(..., pattern="^(student|parent|parent_guardian)$")
    full_name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    student_name: Optional[str] = Field(None, max_length=200)
    student_age: Optional[str] = Field(None, max_length=10)
    school_name: Optional[str] = Field(None, max_length=200)
    grade: Optional[str] = Field(None, max_length=50)
    settlement: Optional[str] = Field(None, max_length=200)
    county: Optional[str] = Field(None, max_length=100)
    reason: str = Field(..., min_length=20)
    supporting_info: Optional[str] = None


class ScholarshipApplicationReview(BaseModel):
    """Schema for admin review."""
    status: str = Field(..., pattern="^(approved|rejected)$")
    review_notes: Optional[str] = None


class ScholarshipApplicationResponse(BaseModel):
    """Full scholarship application response."""
    id: UUID
    applicant_type: str
    full_name: str
    email: str
    phone: Optional[str] = None
    student_name: Optional[str] = None
    student_age: Optional[str] = None
    school_name: Optional[str] = None
    grade: Optional[str] = None
    settlement: Optional[str] = None
    county: Optional[str] = None
    reason: str
    supporting_info: Optional[str] = None
    status: str = "pending"
    reviewed_by: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ScholarshipApplicationListResponse(BaseModel):
    """Paginated list."""
    applications: list[ScholarshipApplicationResponse]
    total: int
