"""Pydantic schemas for admin content management endpoints."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class CourseApprovalRequest(BaseModel):
    reason: Optional[str] = None


class RejectCourseRequest(BaseModel):
    reason: str


class CompetencyTagCreate(BaseModel):
    name: str = Field(..., max_length=200)
    strand: str = Field(..., max_length=100)
    sub_strand: Optional[str] = None
    grade_level: Optional[str] = None
    description: Optional[str] = None


class CompetencyTagResponse(BaseModel):
    id: UUID
    name: str
    strand: str
    sub_strand: Optional[str] = None
    grade_level: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class GradeOverrideRequest(BaseModel):
    assessment_id: UUID
    student_id: UUID
    override_score: float
    reason: str


class CertificateTemplateCreate(BaseModel):
    name: str = Field(..., max_length=200)
    template_data: dict = {}


class ResourceUploadRequest(BaseModel):
    title: str = Field(..., max_length=300)
    file_url: str
    file_type: str
    file_size_bytes: Optional[int] = None
    category: Optional[str] = None
    tags: List[str] = []
