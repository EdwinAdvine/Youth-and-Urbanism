"""
Team & Growth Schemas

Request/response schemas for staff performance, team pulse, and workload.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ── My Performance ──────────────────────────────────────────

class TaskMetrics(BaseModel):
    total_assigned: int = 0
    completed: int = 0
    in_progress: int = 0
    overdue: int = 0
    completion_rate: float = 0.0


class QualityMetrics(BaseModel):
    csat_average: float = 0.0
    content_approval_rate: float = 0.0
    first_response_time_avg_minutes: float = 0.0
    resolution_time_avg_minutes: float = 0.0
    sla_compliance_rate: float = 0.0


class MyPerformance(BaseModel):
    staff_id: str
    staff_name: str
    department: Optional[str] = None
    position: Optional[str] = None
    tasks: TaskMetrics
    quality: QualityMetrics
    ai_insights: List[str] = Field(default_factory=list)
    period: str = "current_month"
    trends: Dict[str, List[float]] = Field(default_factory=dict)


# ── Team Pulse ──────────────────────────────────────────────

class TeamMemberSummary(BaseModel):
    user_id: str
    name: str
    position: Optional[str] = None
    department: Optional[str] = None
    open_tickets: int = 0
    pending_reviews: int = 0
    active_sessions: int = 0
    sla_compliance_rate: float = 0.0
    csat_average: float = 0.0
    workload_score: float = Field(default=0.0, description="0-1 scale, higher = more loaded")
    status: str = "available"


class WorkloadDistribution(BaseModel):
    department: str
    total_staff: int
    average_workload: float
    max_workload: float
    min_workload: float
    imbalance_score: float = Field(default=0.0, description="0-1, higher = more imbalanced")


class TeamPulseResponse(BaseModel):
    team_id: Optional[str] = None
    team_name: Optional[str] = None
    members: List[TeamMemberSummary]
    workload_distribution: List[WorkloadDistribution]
    total_open_tickets: int = 0
    total_pending_reviews: int = 0
    overall_sla_compliance: float = 0.0
    ai_suggestions: List[str] = Field(default_factory=list)


# ── Workload Suggestions ───────────────────────────────────

class WorkloadSuggestion(BaseModel):
    suggestion_type: str = Field(..., description="rebalance | reassign | escalate | hire")
    description: str
    from_staff_id: Optional[str] = None
    to_staff_id: Optional[str] = None
    affected_items: List[str] = Field(default_factory=list)
    impact_score: float = Field(default=0.0, ge=0, le=1)
    rationale: str = ""


class WorkloadRebalanceRequest(BaseModel):
    department: Optional[str] = None
    team_id: Optional[str] = None
    dry_run: bool = True


class WorkloadRebalanceResponse(BaseModel):
    suggestions: List[WorkloadSuggestion]
    current_imbalance: float
    projected_imbalance: float
    affected_staff_count: int


# ── Learning Resources ─────────────────────────────────────

class LearningResource(BaseModel):
    id: str
    title: str
    resource_type: str = Field(..., description="wiki | training | video | document | link")
    url: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_required: bool = False
    completion_status: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LearningResourceListResponse(BaseModel):
    items: List[LearningResource]
    total: int
    categories: List[str] = Field(default_factory=list)
