"""
Error Log Model

Persistent error tracking for the platform. Stores all backend errors,
frontend crash reports, and test failures. The admin System Health
dashboard queries this table for error monitoring and AI-powered diagnosis.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, UUID, Index
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class ErrorLog(Base):
    """
    Platform error log entry.

    Each row represents a single error occurrence captured by the error
    logging middleware, frontend error reporter, or test runner.
    """

    __tablename__ = "error_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Error classification
    level = Column(String(20), nullable=False, default="ERROR", index=True)  # ERROR, WARNING, CRITICAL
    source = Column(String(20), nullable=False, default="backend", index=True)  # backend, frontend, test
    error_type = Column(String(255), nullable=False, index=True)  # Exception class name
    message = Column(Text, nullable=False)
    stack_trace = Column(Text, nullable=True)

    # Request context (nullable for non-request errors)
    endpoint = Column(String(500), nullable=True, index=True)
    method = Column(String(10), nullable=True)
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    user_role = Column(String(50), nullable=True)
    request_data = Column(JSONB, nullable=True)  # Sanitized request body/params

    # Extra metadata
    context = Column(JSONB, nullable=True)  # Browser info, component stack, etc.

    # AI diagnosis (populated on-demand when admin clicks "Diagnose")
    ai_diagnosis = Column(Text, nullable=True)
    ai_diagnosed_at = Column(DateTime, nullable=True)

    # Resolution tracking
    is_resolved = Column(Boolean, default=False, nullable=False, index=True)
    resolved_by = Column(UUID(as_uuid=True), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Composite indexes for common query patterns
    __table_args__ = (
        Index("ix_error_level_created", "level", "created_at"),
        Index("ix_error_source_created", "source", "created_at"),
        Index("ix_error_type_created", "error_type", "created_at"),
        Index("ix_error_resolved_created", "is_resolved", "created_at"),
        Index("ix_error_endpoint_created", "endpoint", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<ErrorLog("
            f"level='{self.level}', "
            f"type='{self.error_type}', "
            f"endpoint='{self.endpoint}')>"
        )
