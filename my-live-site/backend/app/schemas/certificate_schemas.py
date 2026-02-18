"""
Certificate Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CertificateCreate(BaseModel):
    """Schema for issuing a new certificate."""
    student_id: UUID = Field(..., description="Student user ID")
    course_id: UUID = Field(..., description="Course ID")
    student_name: str = Field(..., min_length=1, max_length=200, description="Student's full name")
    course_name: str = Field(..., min_length=1, max_length=500, description="Course title")
    grade: Optional[str] = Field(None, max_length=10, description="Achievement grade (e.g., A, B+, Pass)")
    completion_date: datetime = Field(..., description="Date the course was completed")


class CertificateResponse(BaseModel):
    """Full certificate in API response."""
    id: UUID
    serial_number: str
    student_id: UUID
    student_name: str
    course_id: UUID
    course_name: str
    grade: Optional[str] = None
    completion_date: datetime
    issued_at: datetime
    is_valid: bool = True
    revoked_at: Optional[datetime] = None
    metadata_: Optional[Dict[str, Any]] = Field(None, alias="metadata_")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class CertificateValidationResponse(BaseModel):
    """Public-facing certificate validation response (subset of fields)."""
    is_valid: bool
    serial_number: str
    student_name: str
    course_name: str
    completion_date: datetime
    grade: Optional[str] = None
    issued_at: datetime


class CertificateListResponse(BaseModel):
    """Paginated certificate list."""
    certificates: List[CertificateResponse]
    total: int
