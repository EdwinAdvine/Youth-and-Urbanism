"""
Parent Dashboard Schemas

Pydantic schemas for parent dashboard endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from uuid import UUID


# ========== Overview Schemas ==========

class ChildStatusCard(BaseModel):
    """Individual child status card for dashboard overview."""
    student_id: UUID
    full_name: str
    grade_level: str
    admission_number: str
    avatar_url: Optional[str] = None

    # Today's activity
    today_active: bool = False
    today_minutes: int = 0
    today_sessions: int = 0
    today_lessons_completed: int = 0

    # Recent performance
    recent_quiz_average: Optional[float] = None
    engagement_score: Optional[float] = None
    current_streak_days: int = 0

    # Alerts
    has_urgent_alerts: bool = False
    unread_messages: int = 0


class FamilyOverviewResponse(BaseModel):
    """Family overview dashboard response."""
    total_children: int
    active_today: int
    total_minutes_today: int
    total_sessions_today: int

    # Children cards
    children: List[ChildStatusCard]

    # Quick stats
    family_streak_days: int
    weekly_average_minutes: float
    this_week_lessons_completed: int


# ========== Highlights Schemas ==========

class TodayHighlight(BaseModel):
    """A single highlight item for today."""
    id: str
    type: str  # achievement, milestone, improvement, warning
    child_id: Optional[UUID] = None
    child_name: Optional[str] = None
    icon: str
    title: str
    description: str
    action_url: Optional[str] = None
    timestamp: datetime


class TodayHighlightsResponse(BaseModel):
    """AI-generated today's highlights."""
    highlights: List[TodayHighlight]
    ai_summary: Optional[str] = None


# ========== Urgent Items Schemas ==========

class UrgentItem(BaseModel):
    """A single urgent item requiring attention."""
    id: UUID
    type: str  # deadline, low_engagement, pending_consent, alert
    severity: str  # info, warning, critical
    child_id: Optional[UUID] = None
    child_name: Optional[str] = None
    title: str
    description: str
    action_url: Optional[str] = None
    due_date: Optional[date] = None
    created_at: datetime


class UrgentItemsResponse(BaseModel):
    """List of urgent items."""
    items: List[UrgentItem]
    total_count: int


# ========== Mood Entry Schemas ==========

class MoodEntryCreate(BaseModel):
    """Create a new mood entry."""
    child_id: Optional[UUID] = None  # None = whole family
    emoji: str = Field(..., description="Mood emoji (happy, tired, anxious, excited, stressed, neutral)")
    energy_level: Optional[int] = Field(None, ge=1, le=5, description="Energy level 1-5")
    note: Optional[str] = Field(None, max_length=500)
    recorded_date: Optional[date] = None  # Defaults to today


class MoodEntryResponse(BaseModel):
    """Mood entry response."""
    id: UUID
    parent_id: UUID
    child_id: Optional[UUID]
    child_name: Optional[str]
    emoji: str
    energy_level: Optional[int]
    note: Optional[str]
    recorded_date: date
    created_at: datetime

    class Config:
        from_attributes = True


class MoodHistoryQuery(BaseModel):
    """Query parameters for mood history."""
    child_id: Optional[UUID] = None  # None = all children
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    limit: int = Field(30, ge=1, le=365)


class MoodHistoryResponse(BaseModel):
    """Mood history response with aggregated data."""
    entries: List[MoodEntryResponse]
    total_count: int
    date_range: Dict[str, date]

    # Aggregated insights
    most_common_mood: Optional[str] = None
    average_energy_level: Optional[float] = None
    mood_trend: Optional[str] = None  # improving, stable, declining


# ========== AI Summary Schemas ==========

class AIFamilyInsight(BaseModel):
    """Single AI-generated family insight."""
    category: str  # strength, concern, opportunity, recommendation
    title: str
    description: str
    confidence: float  # 0.0-1.0


class AIFamilySummaryResponse(BaseModel):
    """AI weekly family forecast and tips."""
    summary: str
    week_start: date
    week_end: date

    # Insights
    insights: List[AIFamilyInsight]

    # Predictions
    predicted_engagement_trend: str  # up, stable, down
    predicted_completion_rate: float

    # Recommendations
    top_recommendations: List[str]

    # Generated timestamp
    generated_at: datetime


# ========== General Response Schemas ==========

class DashboardStatsResponse(BaseModel):
    """General dashboard statistics."""
    total_children: int
    active_children_today: int
    total_active_minutes_today: int
    total_sessions_today: int
    total_lessons_completed_this_week: int
    unread_messages: int
    unread_alerts: int
    pending_consents: int
    upcoming_deadlines: int
