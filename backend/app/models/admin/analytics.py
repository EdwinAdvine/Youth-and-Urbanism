"""
Analytics Models — Phase 6

Tables for compliance incident tracking and scheduled report management.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, UUID, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class ComplianceIncident(Base):
    __tablename__ = "compliance_incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_type = Column(String(50), nullable=False, index=True)  # dpa_breach | consent_violation | data_request | child_safety
    severity = Column(String(20), nullable=False, index=True)  # critical | high | medium | low
    description = Column(Text, nullable=False)
    affected_users_count = Column(Integer, default=0)
    status = Column(String(20), default="open", index=True)  # open | investigating | resolved
    reported_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<ComplianceIncident(type='{self.incident_type}', severity='{self.severity}')>"


class ScheduledReport(Base):
    __tablename__ = "scheduled_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    report_type = Column(String(50), nullable=False)
    schedule_cron = Column(String(100), nullable=False)
    recipients = Column(JSONB, default=[])
    parameters = Column(JSONB, default={})
    last_run_at = Column(DateTime, nullable=True)
    next_run_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<ScheduledReport(name='{self.name}', active={self.is_active})>"
