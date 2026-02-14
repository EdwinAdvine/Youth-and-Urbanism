from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class AIAgendaItem(BaseModel):
    id: str
    title: str
    description: str
    priority: str  # critical, high, medium, low
    category: str  # ticket, moderation, content, assessment, session
    due_at: Optional[datetime] = None
    ai_rationale: str
    action_url: str


class MyFocusResponse(BaseModel):
    urgent_tickets: List[Dict[str, Any]]
    moderation_highlights: List[Dict[str, Any]]
    tasks_deadlines: List[Dict[str, Any]]
    student_flags: List[Dict[str, Any]]
    ai_anomalies: List[Dict[str, Any]]
    ai_agenda: List[AIAgendaItem]
    stats: Dict[str, Any]


class StaffDashboardStats(BaseModel):
    tickets_assigned: int = 0
    tickets_resolved_today: int = 0
    moderation_pending: int = 0
    content_in_review: int = 0
    active_sessions: int = 0
    students_monitored: int = 0
    sla_at_risk: int = 0
    avg_response_time_minutes: float = 0.0
