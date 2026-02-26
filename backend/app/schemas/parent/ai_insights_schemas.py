"""
Parent AI Insights Schemas

Pydantic schemas for AI companion insights endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


# ========== AI Tutor Summary Schemas ==========

class ConversationSample(BaseModel):
    """Sample conversation exchange."""
    timestamp: datetime
    student_message: str
    ai_response: str
    topic: Optional[str] = None


class AITutorSummary(BaseModel):
    """AI tutor summary for child."""
    student_id: UUID
    student_name: str
    ai_tutor_name: str
    total_interactions: int
    last_interaction: Optional[datetime]

    # Recent topics
    current_topic: Optional[str] = None
    recent_topics: List[str] = []

    # Performance insights
    strengths: List[str] = []
    areas_for_improvement: List[str] = []
    engagement_level: str  # high, medium, low
    progress_rate: float  # 0.0-1.0

    # Conversation samples
    recent_conversations: List[ConversationSample] = []

    # AI-generated summary
    summary: str
    parent_friendly_explanation: str


# ========== Learning Style Schemas ==========

class LearningStyleTrait(BaseModel):
    """Single learning style trait."""
    trait_name: str
    score: float  # 0.0-1.0
    description: str
    examples: List[str]


class LearningStyleAnalysis(BaseModel):
    """Comprehensive learning style analysis."""
    student_id: UUID
    student_name: str

    # Primary learning style
    primary_style: str  # visual, auditory, kinesthetic
    confidence: float  # 0.0-1.0

    # Detailed traits
    traits: List[LearningStyleTrait]

    # Strengths and preferences
    preferred_activities: List[str]
    optimal_learning_times: List[str]
    attention_span_minutes: Optional[int] = None

    # AI insights
    analysis: str
    recommendations_for_parents: List[str]


# ========== Support Tips Schemas ==========

class SupportTip(BaseModel):
    """Single actionable support tip."""
    category: str  # academic, emotional, practical, motivational
    title: str
    description: str
    action_steps: List[str]
    expected_outcome: str
    difficulty: str  # easy, moderate, advanced


class SupportTipsResponse(BaseModel):
    """Practical home support tips."""
    student_id: UUID
    student_name: str

    # Categorized tips
    tips: List[SupportTip]

    # Weekly focus
    this_week_focus: str
    priority_actions: List[str]

    # Resources
    recommended_resources: List[Dict[str, str]] = []


# ========== AI Planning Schemas ==========

class PlannedTopic(BaseModel):
    """Topic AI is planning to cover."""
    topic_name: str
    subject_area: str
    estimated_start: Optional[str] = None  # e.g., "Next week", "In 3 days"
    duration_estimate: Optional[str] = None
    difficulty_level: str
    prerequisites_met: bool
    learning_objectives: List[str]


class AIPlanningResponse(BaseModel):
    """Topics AI is planning for child."""
    student_id: UUID
    student_name: str

    # Planned topics
    upcoming_topics: List[PlannedTopic]

    # Current trajectory
    learning_trajectory: str
    pacing: str  # ahead, on-track, needs-support

    # AI reasoning
    planning_rationale: str
    parent_involvement_opportunities: List[str]


# ========== Curiosity Patterns Schemas ==========

class CuriosityPattern(BaseModel):
    """Pattern in child's curiosity/questions."""
    pattern_type: str  # questions, exploration, interests, engagement-peaks
    description: str
    frequency: str  # daily, weekly, occasional
    examples: List[str]
    significance: str


class TopInterest(BaseModel):
    """Top interest area for child."""
    interest_name: str
    engagement_score: float  # 0.0-1.0
    related_topics: List[str]
    time_spent_percentage: float
    trending: str  # up, stable, down


class CuriosityPatternsResponse(BaseModel):
    """Analysis of child's curiosity patterns."""
    student_id: UUID
    student_name: str

    # Patterns identified
    patterns: List[CuriosityPattern]

    # Top interests
    top_interests: List[TopInterest]

    # Question types
    most_common_questions: List[str]
    question_complexity_trend: str  # increasing, stable, decreasing

    # AI insights
    analysis: str
    nurturing_suggestions: List[str]


# ========== Early Warning Signs Schemas ==========

class WarningSign(BaseModel):
    """Early warning indicator."""
    warning_type: str  # engagement, performance, emotional, behavioral
    severity: str  # low, medium, high
    indicator: str
    description: str
    first_detected: datetime
    trend: str  # improving, stable, worsening

    # Context
    context_data: Dict[str, Any] = {}

    # Recommendations
    immediate_actions: List[str]
    monitoring_plan: str


class WarningSignsResponse(BaseModel):
    """Early warning signs dashboard."""
    student_id: UUID
    student_name: str

    # Active warnings
    active_warnings: List[WarningSign]

    # Overall risk assessment
    overall_risk_level: str  # low, medium, high
    risk_factors: List[str]
    protective_factors: List[str]

    # AI assessment
    assessment: str
    intervention_recommendations: List[str]

    # Follow-up
    next_review_date: Optional[datetime] = None


# ========== Alerts List Schemas ==========

class AlertSummary(BaseModel):
    """Summary of an AI alert."""
    id: UUID
    alert_type: str
    severity: str
    title: str
    message: str
    child_id: UUID
    child_name: str
    created_at: datetime
    is_read: bool
    is_dismissed: bool
    action_url: Optional[str] = None


class AlertsListResponse(BaseModel):
    """List of AI alerts."""
    alerts: List[AlertSummary]
    total_count: int
    unread_count: int
    critical_count: int


class AlertDetailResponse(BaseModel):
    """Detailed alert information."""
    id: UUID
    parent_id: UUID
    child_id: UUID
    child_name: str
    alert_type: str
    severity: str
    title: str
    message: str
    ai_recommendation: Optional[str] = None
    is_read: bool
    is_dismissed: bool
    action_url: Optional[str] = None
    metadata_: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ========== AI Parent Coaching Schemas ==========

class CoachingModule(BaseModel):
    """AI coaching module for parents."""
    module_id: str
    title: str
    description: str
    estimated_duration_minutes: int
    topics_covered: List[str]
    is_completed: bool


class CoachingRecommendation(BaseModel):
    """Personalized coaching recommendation."""
    recommendation_id: str
    title: str
    reason: str
    priority: str  # high, medium, low
    module_id: Optional[str] = None


class ParentCoachingResponse(BaseModel):
    """AI parent coaching content."""
    student_id: UUID
    student_name: str

    # Personalized recommendations
    recommended_modules: List[CoachingRecommendation]

    # Available modules
    available_modules: List[CoachingModule]

    # Progress
    completed_modules_count: int
    total_modules_count: int

    # AI insights
    coaching_focus: str
    personalized_tips: List[str]
