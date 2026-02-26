"""
Parent-Student linking Pydantic schemas.
"""

from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class LinkStudentRequest(BaseModel):
    """Request to link a student to the current parent by admission number."""
    admission_number: str = Field(
        ..., description="Student's unique admission number (e.g. TUHS-2026-00001)"
    )


class ChildSummary(BaseModel):
    """Brief summary of a linked child."""
    student_id: UUID
    user_id: UUID
    admission_number: str
    full_name: Optional[str] = None
    grade_level: str
    is_active: bool
    enrollment_date: Optional[date] = None

    class Config:
        from_attributes = True


class ChildProgressResponse(BaseModel):
    """Detailed progress for a specific child."""
    student_id: UUID
    admission_number: str
    full_name: Optional[str] = None
    grade_level: str
    learning_profile: dict = Field(default_factory=dict)
    competencies: dict = Field(default_factory=dict)
    overall_performance: dict = Field(default_factory=dict)
    enrolled_courses: List[dict] = Field(default_factory=list)
    total_interactions_with_tutor: int = 0


class ParentChildrenResponse(BaseModel):
    """Response listing all children linked to a parent."""
    children: List[ChildSummary]
    total: int
