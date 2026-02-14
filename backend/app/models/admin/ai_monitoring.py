"""
AI Monitoring Models — Phase 5

Tables for AI conversation flagging, content review, and performance metrics.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, UUID, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class AIConversationFlag(Base):
    __tablename__ = "ai_conversation_flags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="SET NULL"), nullable=True, index=True)
    flag_type = Column(String(50), nullable=False, index=True)  # safety | bias | quality | hallucination
    severity = Column(String(20), nullable=False, index=True)  # critical | high | medium | low
    snippet = Column(Text, nullable=True)
    model_used = Column(String(100), nullable=True)
    status = Column(String(30), default="pending_review", index=True)  # pending_review | approved | dismissed
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    admin_notes = Column(Text, nullable=True)
    flagged_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('ix_aicf_type_severity', 'flag_type', 'severity'),
        Index('ix_aicf_status_created', 'status', 'created_at'),
    )

    def __repr__(self) -> str:
        return f"<AIConversationFlag(type='{self.flag_type}', severity='{self.severity}')>"


class AIContentReview(Base):
    __tablename__ = "ai_content_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_type = Column(String(50), nullable=False, index=True)
    content_id = Column(UUID(as_uuid=True), nullable=True)
    model_used = Column(String(100), nullable=True)
    original_content = Column(Text, nullable=True)
    flagged_issues = Column(JSONB, default=[])
    status = Column(String(20), default="pending", index=True)  # pending | approved | rejected | edited
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<AIContentReview(content_type='{self.content_type}', status='{self.status}')>"


class AIPerformanceMetric(Base):
    __tablename__ = "ai_performance_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_name = Column(String(100), nullable=False, index=True)
    metric_type = Column(String(50), nullable=False, index=True)  # latency | accuracy | cost | throughput
    value = Column(Float, nullable=False)
    unit = Column(String(30), nullable=True)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    extra_data = Column("metadata", JSONB, default={})
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('ix_aipm_model_type', 'model_name', 'metric_type'),
        Index('ix_aipm_period', 'period_start', 'period_end'),
    )

    def __repr__(self) -> str:
        return f"<AIPerformanceMetric(model='{self.model_name}', type='{self.metric_type}', value={self.value})>"
