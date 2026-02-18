"""Pydantic schemas for admin AI monitoring endpoints."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class ConversationFlagResponse(BaseModel):
    id: UUID
    conversation_id: Optional[UUID] = None
    student_id: Optional[UUID] = None
    flag_type: str
    severity: str
    snippet: Optional[str] = None
    model_used: Optional[str] = None
    status: str
    flagged_at: datetime

    class Config:
        from_attributes = True


class FlagReviewRequest(BaseModel):
    decision: str  # approved | dismissed
    admin_notes: Optional[str] = None


class ContentReviewRequest(BaseModel):
    decision: str  # approved | rejected | edited
    override_content: Optional[str] = None


class PerformanceMetricsParams(BaseModel):
    model_name: Optional[str] = None
    metric_type: Optional[str] = None
    period: str = "24h"  # 1h | 6h | 24h | 7d | 30d
