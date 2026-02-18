"""
Instructor Dashboard Schemas

Pydantic v2 schemas for instructor dashboard overview and statistics.
"""
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from decimal import Decimal


class InstructorDashboardStats(BaseModel):
    """Main dashboard statistics"""
    total_students: int = 0
    active_students_today: int = 0
    total_courses: int = 0
    published_courses: int = 0
    upcoming_sessions_count: int = 0
    earnings_this_month: Decimal = Decimal("0.00")
    earnings_total: Decimal = Decimal("0.00")
    average_rating: Decimal = Decimal("0.00")
    total_reviews: int = 0
    pending_submissions: int = 0
    ai_flagged_students: List[str] = []  # List of student IDs
    current_streak: int = 0
    total_points: int = 0
    level: int = 1


class UpcomingSessionSummary(BaseModel):
    """Summary of upcoming session"""
    id: str
    title: str
    scheduled_at: str
    duration_minutes: int
    participants_count: int
    course_id: Optional[str] = None


class PendingSubmissionSummary(BaseModel):
    """Summary of pending submission"""
    id: str
    assessment_title: str
    student_name: str
    submitted_at: str
    days_pending: int


class AIFlaggedStudentSummary(BaseModel):
    """Summary of AI-flagged student"""
    student_id: str
    student_name: str
    student_avatar: Optional[str] = None
    flag_reason: str
    flag_severity: str  # low, medium, high
    flagged_at: str


class DashboardOverviewResponse(BaseModel):
    """Complete dashboard overview"""
    stats: InstructorDashboardStats
    upcoming_sessions: List[UpcomingSessionSummary]
    pending_submissions: List[PendingSubmissionSummary]
    ai_flagged_students: List[AIFlaggedStudentSummary]
    quick_actions: List[Dict[str, Any]]  # Context-aware action suggestions
