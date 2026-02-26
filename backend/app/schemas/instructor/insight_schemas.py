"""
Instructor Insight Schemas

Pydantic v2 schemas for AI daily insights, CBC alignment analysis, and resources.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal


# Daily Insight Schemas
class DailyInsightItem(BaseModel):
    priority: str  # low, medium, high, urgent
    category: str  # submissions, sessions, students, earnings, content, etc.
    title: str
    description: str
    action_url: str
    ai_rationale: str


class InstructorDailyInsightResponse(BaseModel):
    id: str
    instructor_id: str
    insight_date: date
    insights: List[DailyInsightItem]
    generated_at: datetime
    ai_model_used: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DailyInsightQueryParams(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=50)


# CBC Analysis Schemas
class CBCCompetencySchema(BaseModel):
    strand: str
    sub_strand: str
    competency: str
    lesson_references: Optional[List[str]] = None
    importance: Optional[str] = None  # low, medium, high


class CBCSuggestionSchema(BaseModel):
    type: str  # add_content, revise_content, add_assessment, add_activity
    competency: str
    rationale: str
    priority: str  # low, medium, high


class CBCAnalysisRequest(BaseModel):
    course_id: str


class InstructorCBCAnalysisResponse(BaseModel):
    id: str
    course_id: str
    instructor_id: str
    alignment_score: Decimal  # 0-100
    competencies_covered: List[CBCCompetencySchema]
    competencies_missing: List[CBCCompetencySchema]
    suggestions: List[CBCSuggestionSchema]
    ai_model_used: Optional[str] = None
    analysis_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Resource Suggestion Schemas
class AIResourceSuggestionsRequest(BaseModel):
    course_id: str
    lesson_id: Optional[str] = None
    topic: str
    grade_level: str


class ResourceSuggestion(BaseModel):
    title: str
    type: str  # pdf, link, video, file
    url: str
    description: str
    relevance_score: Decimal  # AI-calculated 0-100


class AIResourceSuggestionsResponse(BaseModel):
    suggestions: List[ResourceSuggestion]
    ai_model_used: str
    generated_at: datetime


# Resource Usage Analytics
class ResourceUsageResponse(BaseModel):
    resource_id: str
    resource_title: str
    resource_type: str
    total_views: int
    total_downloads: int
    average_time_spent_seconds: int
    completion_rate: Decimal
    popular_with_grades: List[str]
