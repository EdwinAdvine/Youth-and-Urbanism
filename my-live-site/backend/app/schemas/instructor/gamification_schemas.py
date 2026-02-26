"""
Instructor Gamification Schemas

Pydantic v2 schemas for badges, points, leaderboards, and peer recognition.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# Badge Schemas
class InstructorBadgeResponse(BaseModel):
    id: str
    name: str
    description: str
    icon_url: Optional[str] = None
    category: Optional[str] = None
    criteria: Dict[str, Any]
    tier: str  # bronze, silver, gold, platinum
    points_value: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class InstructorBadgeAwardResponse(BaseModel):
    id: str
    instructor_id: str
    badge_id: str
    badge: InstructorBadgeResponse
    awarded_at: datetime
    extra_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# Points Schemas
class InstructorPointsResponse(BaseModel):
    id: str
    instructor_id: str
    points: int
    level: int
    streak_days: int
    longest_streak: int
    last_activity_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PointsLogResponse(BaseModel):
    id: str
    instructor_id: str
    points_delta: int
    reason: str
    source: str
    extra_data: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Leaderboard Schemas
class LeaderboardEntry(BaseModel):
    rank: int
    instructor_id: str
    instructor_name: str
    instructor_avatar: Optional[str] = None
    points: int
    level: int
    badges_count: int


class LeaderboardResponse(BaseModel):
    period: str  # daily, weekly, monthly, all_time
    entries: List[LeaderboardEntry]
    user_rank: Optional[int] = None
    total_participants: int


# Peer Kudo Schemas
class PeerKudoCreate(BaseModel):
    to_instructor_id: str
    message: str = Field(..., min_length=10, max_length=500)
    category: Optional[str] = None  # helpful, inspiring, expert, creative, etc.
    is_public: bool = True


class PeerKudoResponse(BaseModel):
    id: str
    from_instructor_id: str
    from_instructor_name: str
    from_instructor_avatar: Optional[str] = None
    to_instructor_id: str
    to_instructor_name: str
    message: str
    category: Optional[str] = None
    is_public: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Achievement Progress Schema
class AchievementProgress(BaseModel):
    badge_id: str
    badge_name: str
    badge_tier: str
    progress_current: int
    progress_required: int
    progress_pct: float
    is_completed: bool


class GamificationOverviewResponse(BaseModel):
    total_points: int
    current_level: int
    next_level_points: int
    progress_to_next_level_pct: float
    current_streak: int
    longest_streak: int
    total_badges: int
    badges_by_tier: Dict[str, int]
    recent_achievements: List[InstructorBadgeAwardResponse]
    in_progress_achievements: List[AchievementProgress]
    leaderboard_rank: Optional[int] = None


# Query Schemas
class BadgeQueryParams(BaseModel):
    category: Optional[str] = None
    tier: Optional[str] = None
    is_active: Optional[bool] = True
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=50, ge=1, le=100)


class KudoQueryParams(BaseModel):
    to_instructor_id: Optional[str] = None
    from_instructor_id: Optional[str] = None
    is_public: Optional[bool] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
