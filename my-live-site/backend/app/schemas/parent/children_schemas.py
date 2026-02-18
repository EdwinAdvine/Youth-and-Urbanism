"""
Parent Children Schemas

Pydantic schemas for parent children endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from uuid import UUID


# ========== Child Profile Schemas ==========

class CBCCompetencyScore(BaseModel):
    """CBC competency score."""
    name: str
    score: float  # 0-100
    description: Optional[str] = None
    trend: Optional[str] = None  # improving, stable, declining


class ChildProfileResponse(BaseModel):
    """Full child profile with learning data."""
    # Basic info
    student_id: UUID
    user_id: UUID
    full_name: str
    grade_level: str
    admission_number: str
    date_of_birth: date
    gender: Optional[str] = None
    avatar_url: Optional[str] = None

    # Learning profile
    learning_style: Optional[str] = None  # visual, auditory, kinesthetic
    strengths: List[str] = []
    interests: List[str] = []

    # CBC competencies (7 core)
    competencies: List[CBCCompetencyScore] = []

    # Overall performance
    average_grade: Optional[float] = None
    class_rank: Optional[int] = None
    total_students: Optional[int] = None

    # Activity stats
    total_learning_hours: float = 0.0
    current_streak_days: int = 0
    total_courses_enrolled: int = 0
    courses_completed: int = 0

    # AI tutor
    ai_tutor_id: Optional[UUID] = None
    total_interactions: int = 0
    last_interaction: Optional[datetime] = None

    # Status
    is_active: bool = True


class ChildSummaryCard(BaseModel):
    """Condensed child summary for list views."""
    student_id: UUID
    full_name: str
    grade_level: str
    admission_number: str
    avatar_url: Optional[str] = None
    is_active: bool = True

    # Quick stats
    today_active: bool = False
    current_streak_days: int = 0
    average_grade: Optional[float] = None
    engagement_score: Optional[float] = None


class ChildrenListResponse(BaseModel):
    """List of children for parent."""
    children: List[ChildSummaryCard]
    total_count: int


# ========== Learning Journey Schemas ==========

class FocusArea(BaseModel):
    """Current focus area for child."""
    subject: str
    topic: str
    progress_percentage: float
    target_completion: Optional[date] = None


class WeeklyNarrative(BaseModel):
    """AI-generated weekly learning narrative."""
    week_start: date
    week_end: date
    summary: str
    highlights: List[str]
    areas_of_growth: List[str]
    challenges: List[str]
    recommendations: List[str]


class LearningJourneyResponse(BaseModel):
    """Child's learning journey overview."""
    student_id: UUID
    full_name: str
    grade_level: str

    # Current focus
    current_focus_areas: List[FocusArea]

    # Weekly narrative
    weekly_narrative: Optional[WeeklyNarrative] = None

    # CBC competency radar
    cbc_competencies: List[CBCCompetencyScore]

    # Learning path
    completed_topics: List[str]
    in_progress_topics: List[str]
    upcoming_topics: List[str]


# ========== Activity Tracking Schemas ==========

class ActivityDay(BaseModel):
    """Single day's activity summary."""
    date: date
    total_minutes: int
    sessions_count: int
    lessons_completed: int
    quizzes_taken: int
    average_score: Optional[float] = None


class ActivityFeedItem(BaseModel):
    """Real-time activity feed item."""
    id: UUID
    timestamp: datetime
    activity_type: str  # lesson, quiz, achievement, session
    title: str
    description: str
    icon: str
    related_subject: Optional[str] = None


class ActivityResponse(BaseModel):
    """Child's activity tracking data."""
    student_id: UUID

    # Daily stats (last 7 days)
    daily_activity: List[ActivityDay]

    # Weekly summary
    week_total_minutes: int
    week_total_sessions: int
    week_lessons_completed: int
    week_average_score: Optional[float] = None

    # Streaks
    current_streak_days: int
    longest_streak_days: int

    # Real-time feed
    recent_activities: List[ActivityFeedItem]


# ========== Achievements Schemas ==========

class Certificate(BaseModel):
    """Certificate earned by child."""
    id: UUID
    title: str
    description: str
    issued_date: date
    certificate_url: str
    thumbnail_url: Optional[str] = None
    course_name: Optional[str] = None


class Badge(BaseModel):
    """Badge earned by child."""
    id: UUID
    name: str
    description: str
    icon_url: str
    earned_date: datetime
    category: str  # academic, engagement, streak, milestone


class GrowthMilestone(BaseModel):
    """Learning growth milestone."""
    id: str
    title: str
    description: str
    achieved_date: date
    metric_name: str
    metric_value: float


class AchievementsResponse(BaseModel):
    """Child's achievements and milestones."""
    student_id: UUID

    # Certificates
    certificates: List[Certificate]
    total_certificates: int

    # Badges
    badges: List[Badge]
    total_badges: int

    # Growth milestones
    milestones: List[GrowthMilestone]

    # Recent achievements
    recent_achievements: List[Dict[str, Any]]


# ========== Goals Schemas ==========

class FamilyGoalBase(BaseModel):
    """Base family goal schema."""
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    category: str  # academic, behavioral, creative, health
    target_date: Optional[date] = None
    progress_percentage: float = Field(0.0, ge=0.0, le=100.0)


class FamilyGoalCreate(FamilyGoalBase):
    """Create family goal request."""
    child_id: Optional[UUID] = None  # None = applies to all children


class FamilyGoalUpdate(BaseModel):
    """Update family goal request."""
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    target_date: Optional[date] = None
    progress_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    status: Optional[str] = None  # active, completed, paused, cancelled


class FamilyGoalResponse(BaseModel):
    """Family goal response."""
    id: UUID
    parent_id: UUID
    child_id: Optional[UUID]
    child_name: Optional[str]
    title: str
    description: Optional[str]
    category: str
    progress_percentage: float
    status: str
    target_date: Optional[date]
    is_ai_suggested: bool
    ai_metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GoalsListResponse(BaseModel):
    """List of family goals."""
    goals: List[FamilyGoalResponse]
    total_count: int
    active_count: int
    completed_count: int


# ========== AI Pathways Schemas ==========

class PredictedPathway(BaseModel):
    """AI-predicted learning pathway."""
    pathway_name: str
    description: str
    confidence: float  # 0.0-1.0
    recommended_subjects: List[str]
    estimated_timeline_months: int
    key_milestones: List[str]


class AIPathwaysResponse(BaseModel):
    """AI-predicted learning pathways for child."""
    student_id: UUID
    full_name: str
    grade_level: str

    # Predicted pathways
    pathways: List[PredictedPathway]

    # Current trajectory
    current_trajectory: str
    trajectory_confidence: float

    # Recommendations
    recommended_focus_areas: List[str]
    potential_career_interests: List[str]
