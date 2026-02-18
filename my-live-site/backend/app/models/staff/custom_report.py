"""
Custom Report Models

User-defined report builder with scheduling and sharing. ReportDefinition
stores the report configuration (type, filters, columns) and whether it is
a reusable template. ReportSchedule adds cron-based scheduling, export
format, and recipient list for automated report delivery.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, UUID, Boolean, Text, ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class ReportDefinition(Base):
    """
    Saved report configuration.

    Stores the report type, query configuration, filters, and sharing
    settings. Can be flagged as a template for reuse by other staff.
    """

    __tablename__ = "staff_report_definitions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    report_type = Column(String(50), nullable=False)
    config = Column(JSONB, nullable=False)
    filters = Column(JSONB, default={})
    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    is_template = Column(Boolean, default=False, nullable=False)
    is_shared = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    def __repr__(self) -> str:
        return (
            f"<ReportDefinition(name='{self.name}', "
            f"type='{self.report_type}', template={self.is_template})>"
        )


class ReportSchedule(Base):
    """
    Automated report delivery schedule.

    Links a report definition to a cron expression, export format, and
    recipient list. Tracks last and next execution times for the
    scheduler.
    """

    __tablename__ = "staff_report_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(
        UUID(as_uuid=True),
        ForeignKey("staff_report_definitions.id", ondelete="CASCADE"),
        nullable=False,
    )
    schedule_cron = Column(String(100), nullable=False)
    format = Column(String(20), nullable=False)
    recipients = Column(JSONB, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    last_run_at = Column(DateTime, nullable=True)
    next_run_at = Column(DateTime, nullable=True)
    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return (
            f"<ReportSchedule(report_id={self.report_id}, "
            f"cron='{self.schedule_cron}', active={self.is_active})>"
        )
