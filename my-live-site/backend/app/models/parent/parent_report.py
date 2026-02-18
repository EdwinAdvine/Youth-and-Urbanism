"""
ParentReport Model

Generated reports with AI summaries and predictive analytics.
Supports weekly, monthly, term, transcript, and portfolio exports.
"""

import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Text, Date, DateTime, UUID, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class ParentReport(Base):
    """
    ParentReport model for generated learning reports.

    Reports aggregate child performance data, AI insights, and progress tracking.
    Available in interactive web view and downloadable PDF format.

    Report types:
    - weekly: Week-at-a-glance summary
    - monthly: Monthly progress report
    - term: End-of-term comprehensive report
    - transcript: Official academic transcript
    - portfolio: Exported learning portfolio (zip)

    AI-enhanced with:
    - Narrative summary of period
    - Predictive projections (e.g., "At current pace, will complete X by Y")
    """

    __tablename__ = "parent_reports"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign keys
    parent_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    child_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True)

    # Report metadata
    report_type = Column(String(30), nullable=False, index=True)  # 'weekly', 'monthly', 'term', 'transcript', 'portfolio'
    title = Column(String(255), nullable=False)
    period_start = Column(Date, nullable=False, index=True)
    period_end = Column(Date, nullable=False, index=True)

    # Report data
    data = Column(JSONB, nullable=False)  # Full report data: grades, competencies, activity stats, achievements
    ai_summary = Column(Text, nullable=True)  # AI-generated narrative summary
    ai_projections = Column(JSONB, nullable=True)  # Predictive analytics: trend forecasts, milestone ETAs

    # Generated files
    pdf_url = Column(String(500), nullable=True)  # Path to generated PDF (if applicable)

    # Status
    status = Column(String(20), default='ready', nullable=False, index=True)  # 'generating', 'ready', 'archived'

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    parent = relationship("User", foreign_keys=[parent_id], backref="parent_reports")
    child = relationship("Student", foreign_keys=[child_id], backref="parent_reports")

    def __repr__(self):
        return f"<ParentReport(id={self.id}, type={self.report_type}, child={self.child_id}, period={self.period_start} to {self.period_end}, status={self.status})>"
