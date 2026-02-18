"""
Partner Impact Report Model

Model for tracking AI-generated impact reports and analytics
for partner sponsorship outcomes.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, UUID, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class ReportType(str, enum.Enum):
    """Types of impact reports"""
    MONTHLY = "monthly"
    TERMLY = "termly"
    ANNUAL = "annual"
    CUSTOM = "custom"


class ExportFormat(str, enum.Enum):
    """Supported export formats"""
    PDF = "pdf"
    CSV = "csv"
    XLSX = "xlsx"


class PartnerImpactReport(Base):
    """AI-generated impact reports summarizing sponsorship outcomes"""

    __tablename__ = "partner_impact_reports"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # References
    partner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    program_id = Column(UUID(as_uuid=True), ForeignKey("sponsorship_programs.id", ondelete="SET NULL"), nullable=True, index=True)

    # Report details
    report_type = Column(SQLEnum(ReportType), nullable=False)
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=True)  # AI-generated summary

    # Structured data
    metrics = Column(JSONB, nullable=True)  # {"total_students": 15, "avg_progress": 78.5, "completion_rate": 0.85, ...}
    ai_insights = Column(JSONB, nullable=True)  # {"key_findings": [...], "recommendations": [...], "risk_flags": [...]}
    cbc_progress = Column(JSONB, nullable=True)  # {"by_competency": {...}, "by_grade": {...}, "by_subject": {...}}

    # Period covered
    period_start = Column(DateTime, nullable=True)
    period_end = Column(DateTime, nullable=True)

    # Export
    export_format = Column(SQLEnum(ExportFormat), nullable=True)
    export_url = Column(String(500), nullable=True)

    # Timestamps
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    exported_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    partner = relationship("User", foreign_keys=[partner_id])
    program = relationship("SponsorshipProgram", foreign_keys=[program_id])
