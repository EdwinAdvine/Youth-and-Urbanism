"""Pydantic schemas for admin operations endpoints (tickets, moderation, config)."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Support Tickets
# ---------------------------------------------------------------------------

class TicketCreate(BaseModel):
    subject: str = Field(..., max_length=300)
    description: str
    category: Optional[str] = None
    priority: str = "medium"


class TicketUpdateRequest(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[UUID] = None


class TicketResponse(BaseModel):
    id: UUID
    ticket_number: str
    subject: str
    category: Optional[str] = None
    priority: str
    status: str
    reporter_id: UUID
    assigned_to: Optional[UUID] = None
    sla_deadline: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Moderation
# ---------------------------------------------------------------------------

class ModerationDecisionRequest(BaseModel):
    decision: str = Field(..., description="approved | removed | escalated")
    reason: Optional[str] = None


class KeywordFilterCreate(BaseModel):
    keyword: str = Field(..., max_length=200)
    category: str = Field(..., description="profanity | hate_speech | adult | custom")
    severity: str = "medium"


# ---------------------------------------------------------------------------
# System Config
# ---------------------------------------------------------------------------

class ConfigChangeRequest(BaseModel):
    config_id: UUID
    requested_value: dict
    reason: Optional[str] = None


class ConfigApprovalRequest(BaseModel):
    decision: str = Field(..., description="approved | rejected")
