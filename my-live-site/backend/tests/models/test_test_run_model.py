"""
TestRun Model Tests

Tests for app/models/admin/test_run.py:
- Model instantiation with required fields
- Default values (status='pending', uuid generation)
- Status transitions (pending -> running -> passed/failed/error)
- __repr__ method
- Column types and indexes
"""

import uuid
from datetime import datetime

import pytest

from app.models.admin.test_run import TestRun


@pytest.mark.unit
class TestTestRunModel:
    """Tests for the TestRun SQLAlchemy model."""

    def test_instantiation_with_required_fields(self):
        """TestRun should be instantiable with required fields."""
        triggered_by = uuid.uuid4()
        run = TestRun(
            run_type="backend",
            triggered_by=triggered_by,
        )

        assert run.run_type == "backend"
        assert run.triggered_by == triggered_by

    def test_default_status_pending(self):
        """TestRun.status column should default to 'pending'."""
        status_col = TestRun.__table__.columns["status"]
        assert status_col.default is not None
        assert status_col.default.arg == "pending"

    def test_uuid_default_is_callable(self):
        """TestRun.id column should have uuid.uuid4 as its default factory."""
        id_col = TestRun.__table__.columns["id"]
        assert id_col.default is not None
        assert callable(id_col.default.arg)

    def test_optional_fields_default_to_none(self):
        """Optional fields should be None when not provided."""
        run = TestRun(
            run_type="frontend",
            triggered_by=uuid.uuid4(),
        )

        assert run.output is None
        assert run.summary is None
        assert run.completed_at is None
        assert run.duration_seconds is None

    def test_instantiation_with_all_fields(self):
        """TestRun should accept all fields including optional ones."""
        triggered_by = uuid.uuid4()
        now = datetime.utcnow()

        run = TestRun(
            run_type="all",
            status="passed",
            output="====== 5 passed in 1.00s ======",
            summary={"passed": 5, "failed": 0, "total": 5},
            triggered_by=triggered_by,
            started_at=now,
            completed_at=now,
            duration_seconds="1.0s",
        )

        assert run.run_type == "all"
        assert run.status == "passed"
        assert run.output is not None
        assert run.summary["passed"] == 5
        assert run.duration_seconds == "1.0s"

    def test_status_transition_to_running(self):
        """TestRun status can be set to 'running'."""
        run = TestRun(
            run_type="backend",
            status="pending",
            triggered_by=uuid.uuid4(),
        )

        run.status = "running"
        assert run.status == "running"

    def test_status_transition_to_passed(self):
        """TestRun status can transition to 'passed'."""
        run = TestRun(
            run_type="backend",
            status="running",
            triggered_by=uuid.uuid4(),
        )

        run.status = "passed"
        assert run.status == "passed"

    def test_status_transition_to_failed(self):
        """TestRun status can transition to 'failed'."""
        run = TestRun(
            run_type="backend",
            status="running",
            triggered_by=uuid.uuid4(),
        )

        run.status = "failed"
        assert run.status == "failed"

    def test_status_transition_to_error(self):
        """TestRun status can transition to 'error'."""
        run = TestRun(
            run_type="frontend",
            status="running",
            triggered_by=uuid.uuid4(),
        )

        run.status = "error"
        assert run.status == "error"

    def test_repr(self):
        """TestRun.__repr__ should include type, status, and started_at."""
        now = datetime.utcnow()
        run = TestRun(
            run_type="backend",
            status="running",
            triggered_by=uuid.uuid4(),
            started_at=now,
        )

        repr_str = repr(run)

        assert "TestRun" in repr_str
        assert "backend" in repr_str
        assert "running" in repr_str

    def test_repr_with_defaults(self):
        """TestRun.__repr__ should work with default values."""
        run = TestRun(
            run_type="all",
            triggered_by=uuid.uuid4(),
        )

        repr_str = repr(run)

        assert "TestRun" in repr_str
        assert "all" in repr_str

    def test_table_name(self):
        """TestRun should map to the 'test_runs' table."""
        assert TestRun.__tablename__ == "test_runs"

    def test_run_type_column_has_index(self):
        """The run_type column should be indexed."""
        col = TestRun.__table__.columns["run_type"]
        assert col.index is True

    def test_status_column_has_index(self):
        """The status column should be indexed."""
        col = TestRun.__table__.columns["status"]
        assert col.index is True

    def test_triggered_by_column_has_index(self):
        """The triggered_by column should be indexed."""
        col = TestRun.__table__.columns["triggered_by"]
        assert col.index is True

    def test_started_at_column_has_index(self):
        """The started_at column should be indexed."""
        col = TestRun.__table__.columns["started_at"]
        assert col.index is True

    def test_composite_indexes_defined(self):
        """TestRun should have composite indexes for common queries."""
        index_names = {idx.name for idx in TestRun.__table__.indexes}

        assert "ix_testrun_type_started" in index_names
        assert "ix_testrun_status_started" in index_names

    def test_run_type_values(self):
        """TestRun should support backend, frontend, and all run types."""
        for run_type in ("backend", "frontend", "all"):
            run = TestRun(
                run_type=run_type,
                triggered_by=uuid.uuid4(),
            )
            assert run.run_type == run_type
