"""
ErrorLog Model Tests

Tests for app/models/admin/error_log.py:
- Model instantiation with required fields
- Default values (is_resolved=False, uuid generation)
- __repr__ method
- Column types and nullable constraints
"""

import uuid
from datetime import datetime

import pytest

from app.models.admin.error_log import ErrorLog


@pytest.mark.unit
class TestErrorLogModel:
    """Tests for the ErrorLog SQLAlchemy model."""

    def test_instantiation_with_required_fields(self):
        """ErrorLog should be instantiable with required fields only."""
        error = ErrorLog(
            level="ERROR",
            source="backend",
            error_type="ValueError",
            message="test error message",
        )

        assert error.level == "ERROR"
        assert error.source == "backend"
        assert error.error_type == "ValueError"
        assert error.message == "test error message"

    def test_default_is_resolved_false(self):
        """ErrorLog.is_resolved should default to False."""
        error = ErrorLog(
            level="ERROR",
            source="backend",
            error_type="RuntimeError",
            message="runtime error",
        )

        # The Column default is False; when instantiated directly (no DB),
        # the attribute may be None or the Column-level default.
        # Either way, it should not be True.
        assert error.is_resolved is not True

    def test_uuid_default_is_callable(self):
        """ErrorLog.id column should have uuid.uuid4 as its default factory."""
        id_col = ErrorLog.__table__.columns["id"]
        assert id_col.default is not None
        # The default should be callable (uuid.uuid4)
        assert callable(id_col.default.arg)

    def test_optional_fields_default_to_none(self):
        """Optional fields should be None when not provided."""
        error = ErrorLog(
            level="WARNING",
            source="frontend",
            error_type="TypeError",
            message="type error in component",
        )

        assert error.stack_trace is None
        assert error.endpoint is None
        assert error.method is None
        assert error.user_id is None
        assert error.user_role is None
        assert error.request_data is None
        assert error.context is None
        assert error.ai_diagnosis is None
        assert error.ai_diagnosed_at is None
        assert error.resolved_by is None
        assert error.resolved_at is None
        assert error.resolution_notes is None

    def test_instantiation_with_all_fields(self):
        """ErrorLog should accept all fields including optional ones."""
        user_id = uuid.uuid4()
        resolved_by = uuid.uuid4()
        now = datetime.utcnow()

        error = ErrorLog(
            level="CRITICAL",
            source="backend",
            error_type="DatabaseError",
            message="Connection refused",
            stack_trace="Traceback...\n  File...",
            endpoint="/api/v1/users",
            method="POST",
            user_id=user_id,
            user_role="admin",
            request_data={"email": "test@test.com"},
            context={"ip": "127.0.0.1"},
            ai_diagnosis="Root cause: DB connection pool exhausted",
            ai_diagnosed_at=now,
            is_resolved=True,
            resolved_by=resolved_by,
            resolved_at=now,
            resolution_notes="Increased connection pool size",
        )

        assert error.level == "CRITICAL"
        assert error.user_id == user_id
        assert error.resolved_by == resolved_by
        assert error.is_resolved is True
        assert error.resolution_notes == "Increased connection pool size"
        assert error.ai_diagnosis is not None

    def test_repr(self):
        """ErrorLog.__repr__ should include level, type, and endpoint."""
        error = ErrorLog(
            level="ERROR",
            source="backend",
            error_type="ValueError",
            message="bad value",
            endpoint="/api/v1/test",
        )

        repr_str = repr(error)

        assert "ErrorLog" in repr_str
        assert "ERROR" in repr_str
        assert "ValueError" in repr_str
        assert "/api/v1/test" in repr_str

    def test_repr_with_none_endpoint(self):
        """ErrorLog.__repr__ should handle None endpoint."""
        error = ErrorLog(
            level="WARNING",
            source="frontend",
            error_type="ReferenceError",
            message="ref error",
        )

        repr_str = repr(error)

        assert "ErrorLog" in repr_str
        assert "WARNING" in repr_str

    def test_table_name(self):
        """ErrorLog should map to the 'error_logs' table."""
        assert ErrorLog.__tablename__ == "error_logs"

    def test_level_column_has_index(self):
        """The level column should be indexed for fast filtering."""
        level_col = ErrorLog.__table__.columns["level"]
        assert level_col.index is True

    def test_source_column_has_index(self):
        """The source column should be indexed for fast filtering."""
        source_col = ErrorLog.__table__.columns["source"]
        assert source_col.index is True

    def test_is_resolved_column_has_index(self):
        """The is_resolved column should be indexed for filtering."""
        resolved_col = ErrorLog.__table__.columns["is_resolved"]
        assert resolved_col.index is True

    def test_created_at_column_has_index(self):
        """The created_at column should be indexed for time-based queries."""
        created_col = ErrorLog.__table__.columns["created_at"]
        assert created_col.index is True

    def test_composite_indexes_defined(self):
        """ErrorLog should have composite indexes for common query patterns."""
        index_names = {idx.name for idx in ErrorLog.__table__.indexes}

        assert "ix_error_level_created" in index_names
        assert "ix_error_source_created" in index_names
        assert "ix_error_type_created" in index_names
        assert "ix_error_resolved_created" in index_names
        assert "ix_error_endpoint_created" in index_names
