"""
Test Run Model

Tracks test suite execution history. When the admin triggers tests from
the System Health dashboard, each run is stored here with full output,
pass/fail summary, and timing data.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, UUID, Index
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class TestRun(Base):
    """
    Record of a test suite execution.

    Created when an admin triggers a test run from the System Health
    dashboard. Status transitions: pending -> running -> passed/failed/error.
    """

    __tablename__ = "test_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Run classification
    run_type = Column(String(20), nullable=False, index=True)  # backend, frontend, all
    status = Column(String(20), nullable=False, default="pending", index=True)  # pending, running, passed, failed, error

    # Output and results
    output = Column(Text, nullable=True)  # Full test output (stdout + stderr)
    summary = Column(JSONB, nullable=True)  # {passed: N, failed: N, skipped: N, errors: N, total: N}

    # Who triggered it
    triggered_by = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Timing
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(String(20), nullable=True)  # Human-readable duration

    __table_args__ = (
        Index("ix_testrun_type_started", "run_type", "started_at"),
        Index("ix_testrun_status_started", "status", "started_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<TestRun("
            f"type='{self.run_type}', "
            f"status='{self.status}', "
            f"started_at='{self.started_at}')>"
        )
