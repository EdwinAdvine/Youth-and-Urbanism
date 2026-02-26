"""
Instructor Session Schemas

Pydantic v2 schemas for live sessions, attendance, recordings, and follow-ups.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal


# Session Schemas
class SessionCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    scheduled_at: datetime
    duration_minutes: int = Field(..., ge=15, le=480)  # 15 min to 8 hours
    max_participants: int = Field(default=50, ge=1, le=100)
    recording_enabled: bool = True
    screen_sharing_enabled: bool = True
    course_id: Optional[str] = None
    grade_level: Optional[str] = None


class SessionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=15, le=480)
    max_participants: Optional[int] = Field(None, ge=1, le=100)
    recording_enabled: Optional[bool] = None
    screen_sharing_enabled: Optional[bool] = None


class InstructorSessionResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    host_id: str
    scheduled_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration_minutes: int
    max_participants: int
    recording_enabled: bool
    screen_sharing_enabled: bool
    course_id: Optional[str] = None
    grade_level: Optional[str] = None
    status: str  # scheduled, started, ended
    extra_data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Session Control Schemas
class SessionStart(BaseModel):
    session_id: str


class SessionEnd(BaseModel):
    session_id: str


# Attendance Schemas
class SessionAttendanceResponse(BaseModel):
    id: str
    session_id: str
    student_id: str
    student_name: str
    student_avatar: Optional[str] = None
    joined_at: datetime
    left_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    engagement_score: Optional[Decimal] = None  # AI-calculated
    attention_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# Recording Schemas
class RecordingResponse(BaseModel):
    id: str
    session_id: str
    recording_url: str
    duration_seconds: int
    file_size_bytes: int
    created_at: datetime


# Follow-up Schemas
class FollowUpCreate(BaseModel):
    session_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    assigned_to_student_id: Optional[str] = None


class FollowUpUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None  # pending, completed
    assigned_to_student_id: Optional[str] = None


class SessionFollowUpResponse(BaseModel):
    id: str
    session_id: str
    instructor_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: str
    assigned_to_student_id: Optional[str] = None
    assigned_to_student_name: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# AI Session Summary Schema
class AISessionSummaryRequest(BaseModel):
    session_id: str
    transcript: Optional[str] = None


class AISessionSummaryResponse(BaseModel):
    session_id: str
    summary: str
    key_points: List[str]
    action_items: List[str]
    student_engagement: Dict[str, Any]  # Per-student engagement analysis
    suggested_follow_ups: List[str]
    ai_model_used: str
    generated_at: datetime


# ICE Config Schema
class ICEConfigResponse(BaseModel):
    """WebRTC ICE server configuration"""
    ice_servers: List[Dict[str, Any]]
    session_id: str


# Session Query Schemas
class SessionQueryParams(BaseModel):
    status: Optional[str] = None
    course_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    sort_by: str = Field(default="scheduled_at")
    sort_order: str = Field(default="asc", pattern="^(asc|desc)$")
