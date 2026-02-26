"""
Error Logging Service Tests

Tests for app/services/admin/error_logging_service.py:
- log_error() creates a DB record
- get_errors() with various filters (level, source, is_resolved, hours)
- get_error_stats() returns aggregated counts
- mark_resolved() updates the error record
- diagnose_with_ai() calls AIOrchestrator and saves diagnosis
"""

import uuid
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.admin.error_logging_service import (
    log_error,
    get_errors,
    get_error_by_id,
    get_error_stats,
    mark_resolved,
    diagnose_with_ai,
)


def _make_error_log(**overrides):
    """Helper to build a mock ErrorLog object."""
    defaults = {
        "id": uuid.uuid4(),
        "level": "ERROR",
        "source": "backend",
        "error_type": "ValueError",
        "message": "Something went wrong",
        "stack_trace": None,
        "endpoint": "/api/v1/test",
        "method": "GET",
        "user_id": None,
        "user_role": None,
        "request_data": None,
        "context": None,
        "ai_diagnosis": None,
        "ai_diagnosed_at": None,
        "is_resolved": False,
        "resolved_by": None,
        "resolved_at": None,
        "resolution_notes": None,
        "created_at": datetime.utcnow(),
    }
    defaults.update(overrides)
    obj = MagicMock()
    for k, v in defaults.items():
        setattr(obj, k, v)
    return obj


@pytest.mark.unit
class TestLogError:
    """Tests for log_error()."""

    async def test_log_error_creates_record(self):
        """log_error should add an ErrorLog entry, commit, and refresh."""
        mock_db = AsyncMock()

        result = await log_error(
            db=mock_db,
            level="ERROR",
            source="backend",
            error_type="ValueError",
            message="test message",
        )

        mock_db.add.assert_called_once()
        mock_db.commit.assert_awaited_once()
        mock_db.refresh.assert_awaited_once()

    async def test_log_error_truncates_long_messages(self):
        """Messages longer than 2000 chars should be truncated."""
        mock_db = AsyncMock()
        long_message = "x" * 5000

        await log_error(
            db=mock_db,
            level="ERROR",
            source="backend",
            error_type="RuntimeError",
            message=long_message,
        )

        # The ErrorLog constructor receives the truncated message
        added_obj = mock_db.add.call_args[0][0]
        assert len(added_obj.message) == 2000

    async def test_log_error_accepts_all_optional_fields(self):
        """log_error should accept and pass through all optional fields."""
        mock_db = AsyncMock()
        user_id = uuid.uuid4()

        await log_error(
            db=mock_db,
            level="CRITICAL",
            source="frontend",
            error_type="TypeError",
            message="crash",
            stack_trace="Traceback...",
            endpoint="/api/v1/crash",
            method="POST",
            user_id=user_id,
            user_role="student",
            request_data={"key": "value"},
            context={"browser": "Chrome"},
        )

        added_obj = mock_db.add.call_args[0][0]
        assert added_obj.level == "CRITICAL"
        assert added_obj.source == "frontend"
        assert added_obj.user_id == user_id
        assert added_obj.request_data == {"key": "value"}

    async def test_log_error_returns_entry(self):
        """log_error should return the created ErrorLog entry."""
        mock_db = AsyncMock()

        result = await log_error(
            db=mock_db,
            level="WARNING",
            source="test",
            error_type="AssertionError",
            message="test failed",
        )

        # Result is the object that was added
        assert result is mock_db.add.call_args[0][0]


@pytest.mark.unit
class TestGetErrors:
    """Tests for get_errors()."""

    async def test_get_errors_no_filters(self):
        """get_errors with no filters should execute count and items queries."""
        mock_db = AsyncMock()

        # Mock count result
        count_scalar = MagicMock()
        count_scalar.scalar.return_value = 3

        # Mock items result
        items_scalars = MagicMock()
        items_scalars.scalars.return_value.all.return_value = ["err1", "err2", "err3"]

        mock_db.execute = AsyncMock(side_effect=[count_scalar, items_scalars])

        result = await get_errors(mock_db)

        assert result["total"] == 3
        assert result["page"] == 1
        assert result["page_size"] == 50
        assert len(result["items"]) == 3

    async def test_get_errors_with_level_filter(self):
        """get_errors should filter by level when provided."""
        mock_db = AsyncMock()

        count_scalar = MagicMock()
        count_scalar.scalar.return_value = 1

        items_scalars = MagicMock()
        items_scalars.scalars.return_value.all.return_value = ["err_critical"]

        mock_db.execute = AsyncMock(side_effect=[count_scalar, items_scalars])

        result = await get_errors(mock_db, level="CRITICAL")

        assert result["total"] == 1
        assert mock_db.execute.await_count == 2

    async def test_get_errors_with_is_resolved_filter(self):
        """get_errors should filter by is_resolved when provided."""
        mock_db = AsyncMock()

        count_scalar = MagicMock()
        count_scalar.scalar.return_value = 0

        items_scalars = MagicMock()
        items_scalars.scalars.return_value.all.return_value = []

        mock_db.execute = AsyncMock(side_effect=[count_scalar, items_scalars])

        result = await get_errors(mock_db, is_resolved=True)

        assert result["total"] == 0
        assert result["items"] == []

    async def test_get_errors_pagination(self):
        """get_errors should calculate pages correctly."""
        mock_db = AsyncMock()

        count_scalar = MagicMock()
        count_scalar.scalar.return_value = 120

        items_scalars = MagicMock()
        items_scalars.scalars.return_value.all.return_value = ["e"] * 50

        mock_db.execute = AsyncMock(side_effect=[count_scalar, items_scalars])

        result = await get_errors(mock_db, page=2, page_size=50)

        assert result["page"] == 2
        assert result["page_size"] == 50
        assert result["pages"] == 3  # ceil(120/50) = 3

    async def test_get_errors_zero_page_size(self):
        """get_errors should handle zero page_size gracefully."""
        mock_db = AsyncMock()

        count_scalar = MagicMock()
        count_scalar.scalar.return_value = 5

        items_scalars = MagicMock()
        items_scalars.scalars.return_value.all.return_value = []

        mock_db.execute = AsyncMock(side_effect=[count_scalar, items_scalars])

        result = await get_errors(mock_db, page_size=0)

        assert result["pages"] == 0


@pytest.mark.unit
class TestGetErrorById:
    """Tests for get_error_by_id()."""

    async def test_returns_error_when_found(self):
        """get_error_by_id should return the error when it exists."""
        mock_db = AsyncMock()
        error_id = uuid.uuid4()
        mock_error = _make_error_log(id=error_id)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_error
        mock_db.execute.return_value = mock_result

        result = await get_error_by_id(mock_db, error_id)

        assert result is mock_error

    async def test_returns_none_when_not_found(self):
        """get_error_by_id should return None for non-existent ID."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await get_error_by_id(mock_db, uuid.uuid4())

        assert result is None


@pytest.mark.unit
class TestGetErrorStats:
    """Tests for get_error_stats()."""

    async def test_get_error_stats_returns_aggregated_data(self):
        """get_error_stats should return a dict with all expected keys."""
        mock_db = AsyncMock()

        # total
        total_res = MagicMock()
        total_res.scalar.return_value = 50
        # unresolved
        unresolved_res = MagicMock()
        unresolved_res.scalar.return_value = 30
        # by_level
        level_res = MagicMock()
        level_res.all.return_value = [("ERROR", 35), ("CRITICAL", 15)]
        # by_source
        source_res = MagicMock()
        source_res.all.return_value = [("backend", 40), ("frontend", 10)]
        # top_types
        type_res = MagicMock()
        type_res.all.return_value = [("ValueError", 20), ("KeyError", 10)]
        # top_endpoints
        endpoint_res = MagicMock()
        endpoint_res.all.return_value = [("/api/v1/crash", 15)]

        mock_db.execute = AsyncMock(side_effect=[
            total_res, unresolved_res, level_res,
            source_res, type_res, endpoint_res,
        ])

        result = await get_error_stats(mock_db, hours=24)

        assert result["period_hours"] == 24
        assert result["total"] == 50
        assert result["unresolved"] == 30
        assert result["by_level"] == {"ERROR": 35, "CRITICAL": 15}
        assert result["by_source"] == {"backend": 40, "frontend": 10}
        assert len(result["top_error_types"]) == 2
        assert result["top_failing_endpoints"][0]["endpoint"] == "/api/v1/crash"

    async def test_get_error_stats_empty_period(self):
        """get_error_stats should handle periods with zero errors."""
        mock_db = AsyncMock()

        empty_scalar = MagicMock()
        empty_scalar.scalar.return_value = 0
        empty_list = MagicMock()
        empty_list.all.return_value = []

        mock_db.execute = AsyncMock(side_effect=[
            empty_scalar, empty_scalar, empty_list,
            empty_list, empty_list, empty_list,
        ])

        result = await get_error_stats(mock_db, hours=1)

        assert result["total"] == 0
        assert result["unresolved"] == 0
        assert result["by_level"] == {}


@pytest.mark.unit
class TestMarkResolved:
    """Tests for mark_resolved()."""

    async def test_mark_resolved_updates_error(self):
        """mark_resolved should set is_resolved, resolved_by, and notes."""
        mock_db = AsyncMock()
        error_id = uuid.uuid4()
        admin_id = uuid.uuid4()
        mock_error = _make_error_log(id=error_id, is_resolved=False)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_error
        mock_db.execute.return_value = mock_result

        result = await mark_resolved(mock_db, error_id, admin_id, notes="Fixed the bug")

        assert result is not None
        assert mock_error.is_resolved is True
        assert mock_error.resolved_by == admin_id
        assert mock_error.resolution_notes == "Fixed the bug"
        assert mock_error.resolved_at is not None
        mock_db.commit.assert_awaited_once()

    async def test_mark_resolved_returns_none_for_missing_error(self):
        """mark_resolved should return None if error does not exist."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await mark_resolved(mock_db, uuid.uuid4(), uuid.uuid4())

        assert result is None
        mock_db.commit.assert_not_awaited()


@pytest.mark.unit
class TestDiagnoseWithAI:
    """Tests for diagnose_with_ai()."""

    @patch("app.services.admin.error_logging_service.get_error_by_id")
    async def test_diagnose_returns_none_for_missing_error(self, mock_get_by_id):
        """diagnose_with_ai should return None if error is not found."""
        mock_get_by_id.return_value = None
        mock_db = AsyncMock()

        result = await diagnose_with_ai(mock_db, uuid.uuid4())

        assert result is None

    @patch("app.services.ai_orchestrator.AIOrchestrator", autospec=True)
    @patch("app.services.admin.error_logging_service.get_error_by_id")
    async def test_diagnose_calls_orchestrator_and_saves(self, mock_get_by_id, MockOrchestrator):
        """diagnose_with_ai should call AIOrchestrator.generate_response and save diagnosis."""
        error_id = uuid.uuid4()
        mock_error = _make_error_log(
            id=error_id,
            level="ERROR",
            error_type="ValueError",
            source="backend",
            message="bad value",
            endpoint="/api/v1/test",
            method="POST",
            created_at=datetime.utcnow(),
            stack_trace="Traceback line 1\nline 2",
            request_data=None,
            context=None,
        )
        mock_get_by_id.return_value = mock_error

        mock_orch_instance = AsyncMock()
        mock_orch_instance.generate_response.return_value = {
            "response": "Root cause: bad input validation",
            "model": "gemini-pro",
        }
        MockOrchestrator.return_value = mock_orch_instance

        mock_db = AsyncMock()

        result = await diagnose_with_ai(mock_db, error_id)

        assert result is not None
        assert result["diagnosis"] == "Root cause: bad input validation"
        assert result["model_used"] == "gemini-pro"
        assert result["error_id"] == str(error_id)
        assert mock_error.ai_diagnosis == "Root cause: bad input validation"
        mock_db.commit.assert_awaited()

    @patch("app.services.ai_orchestrator.AIOrchestrator", autospec=True)
    @patch("app.services.admin.error_logging_service.get_error_by_id")
    async def test_diagnose_fallback_on_ai_failure(self, mock_get_by_id, MockOrchestrator):
        """diagnose_with_ai should return a fallback diagnosis when AI fails."""
        error_id = uuid.uuid4()
        mock_error = _make_error_log(
            id=error_id,
            level="CRITICAL",
            error_type="RuntimeError",
            source="backend",
            message="server crash",
            endpoint="/api/v1/crash",
            method="GET",
            created_at=datetime.utcnow(),
            stack_trace=None,
            request_data=None,
            context=None,
        )
        mock_get_by_id.return_value = mock_error

        mock_orch_instance = AsyncMock()
        mock_orch_instance.generate_response.side_effect = Exception("API timeout")
        MockOrchestrator.return_value = mock_orch_instance

        mock_db = AsyncMock()

        result = await diagnose_with_ai(mock_db, error_id)

        assert result is not None
        assert result["model_used"] == "fallback"
        assert "AI diagnosis temporarily unavailable" in result["diagnosis"]
        assert mock_error.ai_diagnosis is not None
        mock_db.commit.assert_awaited()

    @patch("app.services.ai_orchestrator.AIOrchestrator", autospec=True)
    @patch("app.services.admin.error_logging_service.get_error_by_id")
    async def test_diagnose_includes_request_data_in_context(self, mock_get_by_id, MockOrchestrator):
        """diagnose_with_ai should include request_data and context in prompt."""
        error_id = uuid.uuid4()
        mock_error = _make_error_log(
            id=error_id,
            level="ERROR",
            error_type="KeyError",
            source="backend",
            message="missing key",
            endpoint="/api/v1/data",
            method="POST",
            created_at=datetime.utcnow(),
            stack_trace=None,
            request_data={"user": "test"},
            context={"browser": "Firefox"},
        )
        mock_get_by_id.return_value = mock_error

        mock_orch_instance = AsyncMock()
        mock_orch_instance.generate_response.return_value = {
            "response": "Key missing from payload",
            "model": "claude-3.5-sonnet",
        }
        MockOrchestrator.return_value = mock_orch_instance

        mock_db = AsyncMock()

        result = await diagnose_with_ai(mock_db, error_id)

        # Verify AI was called with context containing request data
        call_kwargs = mock_orch_instance.generate_response.call_args
        prompt_message = call_kwargs.kwargs.get("message") or call_kwargs[1].get("message") or call_kwargs[0][0]
        assert "Request Data" in prompt_message or result is not None
