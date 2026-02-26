from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class TicketCreate(BaseModel):
    subject: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    category: str = Field(..., pattern="^(account|billing|technical|content|safety)$")
    priority: str = Field(default="medium", pattern="^(critical|high|medium|low)$")
    tags: List[str] = []


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None
    tags: Optional[List[str]] = None


class TicketMessageCreate(BaseModel):
    content: str = Field(..., min_length=1)
    is_internal: bool = False
    attachments: List[Dict[str, Any]] = []


class TicketAssign(BaseModel):
    assigned_to: str


class TicketEscalate(BaseModel):
    escalated_to: str
    reason: str


class TicketListFilters(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    assigned_to: Optional[str] = None  # 'me', 'unassigned', or user_id
    search: Optional[str] = None
    page: int = 1
    limit: int = 20
    sort_by: str = "created_at"
    sort_direction: str = "desc"


class TicketResponse(BaseModel):
    id: str
    ticket_number: str
    subject: str
    description: str
    category: str
    priority: str
    status: str
    reporter: Dict[str, Any]
    assigned_to: Optional[Dict[str, Any]] = None
    sla_status: Optional[Dict[str, Any]] = None
    tags: List[str]
    message_count: int
    first_response_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    csat_score: Optional[int] = None
    created_at: datetime
    updated_at: datetime
