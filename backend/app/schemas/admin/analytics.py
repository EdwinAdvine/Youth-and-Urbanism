"""Pydantic schemas for admin analytics and compliance endpoints."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ComplianceIncidentCreate(BaseModel):
    incident_type: str = Field(..., description="dpa_breach | consent_violation | data_request | child_safety")
    severity: str = Field(..., description="critical | high | medium | low")
    description: str
    affected_users_count: int = 0


class ComplianceIncidentResponse(BaseModel):
    id: UUID
    incident_type: str
    severity: str
    description: str
    affected_users_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ScheduledReportCreate(BaseModel):
    name: str = Field(..., max_length=200)
    report_type: str
    schedule_cron: str
    recipients: List[str] = []
    parameters: dict = {}


class NLQueryRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=500, description="Natural language query")


class NLQueryResponse(BaseModel):
    query: str
    sql_generated: Optional[str] = None
    results: List[dict] = []
    chart_config: Optional[dict] = None
    row_count: int = 0
    execution_time_ms: float = 0
