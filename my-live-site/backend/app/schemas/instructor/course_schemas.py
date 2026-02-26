"""
Instructor Course Schemas

Pydantic v2 schemas for instructor course management, modules, lessons, and resources.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal


# Resource Schemas
class ResourceSchema(BaseModel):
    title: str
    type: str  # pdf, link, video, file
    url: str
    size: Optional[int] = None


# Lesson Schemas
class LessonSchema(BaseModel):
    id: str
    title: str
    content: str
    type: str  # video, text, interactive, quiz
    duration_minutes: Optional[int] = None
    resources: List[ResourceSchema] = []
    order: int


class LessonCreate(BaseModel):
    title: str
    content: str
    type: str
    duration_minutes: Optional[int] = None
    resources: List[ResourceSchema] = []
    order: int


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    type: Optional[str] = None
    duration_minutes: Optional[int] = None
    resources: Optional[List[ResourceSchema]] = None
    order: Optional[int] = None


# Course Schemas
class CourseCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str
    thumbnail_url: Optional[str] = None
    grade_levels: List[str]
    learning_area: str
    price: Decimal = Field(default=Decimal("0.00"), ge=0)
    currency: str = "KES"
    competencies: List[str] = []
    estimated_duration_hours: Optional[int] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    grade_levels: Optional[List[str]] = None
    learning_area: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0)
    currency: Optional[str] = None
    competencies: Optional[List[str]] = None
    estimated_duration_hours: Optional[int] = None
    is_published: Optional[bool] = None


class CourseModulesUpdate(BaseModel):
    """Update course syllabus/modules structure"""
    syllabus: Dict[str, Any]
    lessons: List[LessonSchema]


class InstructorCourseResponse(BaseModel):
    id: str
    title: str
    description: str
    thumbnail_url: Optional[str] = None
    grade_levels: List[str]
    learning_area: str
    syllabus: Dict[str, Any]
    lessons: List[LessonSchema]
    instructor_id: str
    is_platform_created: bool
    price: Decimal
    currency: str
    is_published: bool
    is_featured: bool
    enrollment_count: int
    average_rating: Decimal
    total_reviews: int
    estimated_duration_hours: Optional[int] = None
    competencies: List[str]
    revenue_split_id: Optional[str] = None
    cbc_analysis_id: Optional[str] = None
    ai_generated_meta: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Course Analytics Schema
class CourseAnalyticsResponse(BaseModel):
    course_id: str
    total_enrollments: int
    active_students: int
    completion_rate: Decimal
    average_progress: Decimal
    average_rating: Decimal
    total_reviews: int
    total_revenue: Decimal
    revenue_this_month: Decimal
    engagement_score: Decimal  # AI-calculated
    popular_lessons: List[Dict[str, Any]]
    drop_off_points: List[Dict[str, Any]]  # AI-identified


# AI Content Generation Schemas
class AIContentGenerateRequest(BaseModel):
    course_id: str
    content_type: str  # lesson, quiz, activity, summary
    topic: str
    grade_level: str
    additional_context: Optional[str] = None


class AIContentGenerateResponse(BaseModel):
    generated_content: str
    suggestions: List[str]
    ai_model_used: str
    generated_at: datetime


# Course Query Schemas
class CourseQueryParams(BaseModel):
    is_published: Optional[bool] = None
    grade_level: Optional[str] = None
    learning_area: Optional[str] = None
    search: Optional[str] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    sort_by: str = Field(default="created_at")
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")
