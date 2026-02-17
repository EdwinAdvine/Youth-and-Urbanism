"""
Tests for Admin System Health API Endpoints

Tests the following routes under /api/v1/admin/system-health/:
- GET  /overview          - System health overview (DB, errors, test runs)
- GET  /errors            - Paginated, filterable error log list
- GET  /errors/{id}       - Single error log detail
- POST /errors/{id}/diagnose  - Trigger AI diagnosis for an error
- PATCH /errors/{id}/resolve  - Mark an error as resolved
- POST /errors/report     - Frontend error reporting (no auth)
- POST /tests/run         - Trigger test suite execution
- GET  /tests/results     - Paginated test run history
- GET  /tests/results/{id} - Single test run detail

All admin-only endpoints return 403 for non-admin users.
The /errors/report endpoint is public (no auth required).
"""

import uuid
from datetime import datetime
from unittest.mock import patch, MagicMock, AsyncMock

import pytest


BASE_URL = "/api/v1/admin/system-health"


# ── Helpers for building mock objects ───────────────────────────────

def _make_error_log(
    error_id=None,
    level="ERROR",
    source="backend",
    error_type="ValueError",
    message="Something went wrong",
    endpoint="/api/v1/test",
    method="GET",
    user_role="student",
    is_resolved=False,
    ai_diagnosis=None,
    ai_diagnosed_at=None,
    stack_trace="Traceback ...",
    user_id=None,
    request_data=None,
    context=None,
    resolved_by=None,
    resolved_at=None,
    resolution_notes=None,
):
    """Create a mock ErrorLog-like object with the expected attributes."""
    obj = MagicMock()
    obj.id = error_id or uuid.uuid4()
    obj.level = level
    obj.source = source
    obj.error_type = error_type
    obj.message = message
    obj.endpoint = endpoint
    obj.method = method
    obj.user_role = user_role
    obj.is_resolved = is_resolved
    obj.ai_diagnosis = ai_diagnosis
    obj.ai_diagnosed_at = ai_diagnosed_at
    obj.stack_trace = stack_trace
    obj.user_id = user_id
    obj.request_data = request_data
    obj.context = context
    obj.resolved_by = resolved_by
    obj.resolved_at = resolved_at
    obj.resolution_notes = resolution_notes
    obj.created_at = datetime(2026, 2, 15, 10, 0, 0)
    return obj


def _make_test_run(
    run_id=None,
    run_type="backend",
    status="passed",
    summary=None,
    output="test output",
    triggered_by=None,
    started_at=None,
    completed_at=None,
    duration_seconds="3.2s",
):
    """Create a mock TestRun-like object with the expected attributes."""
    obj = MagicMock()
    obj.id = run_id or uuid.uuid4()
    obj.run_type = run_type
    obj.status = status
    obj.summary = summary or {"passed": 5, "failed": 0, "total": 5}
    obj.output = output
    obj.triggered_by = triggered_by or uuid.uuid4()
    obj.started_at = started_at or datetime(2026, 2, 15, 9, 0, 0)
    obj.completed_at = completed_at or datetime(2026, 2, 15, 9, 0, 3)
    obj.duration_seconds = duration_seconds
    return obj


# =====================================================================
# GET /system-health/overview
# =====================================================================


@pytest.mark.unit
class TestSystemHealthOverview:
    """Tests for the GET /system-health/overview endpoint."""

    @patch("app.api.v1.admin.system_health.test_runner_service")
    @patch("app.api.v1.admin.system_health.error_logging_service")
    @patch("app.api.v1.admin.system_health.check_db_connection", new_callable=AsyncMock)
    async def test_overview_returns_health_data(
        self, mock_db_check, mock_error_svc, mock_test_svc, client, admin_headers
    ):
        """GET /overview returns DB status, error stats, and latest test run."""
        mock_db_check.return_value = True

        mock_error_svc.get_error_stats = AsyncMock(return_value={
            "period_hours": 24,
            "total": 5,
            "unresolved": 2,
            "by_level": {"ERROR": 3, "WARNING": 2},
            "by_source": {"backend": 4, "frontend": 1},
            "top_error_types": [{"type": "ValueError", "count": 3}],
            "top_failing_endpoints": [],
        })

        latest_run = _make_test_run()
        mock_test_svc.get_test_runs = AsyncMock(return_value={
            "items": [latest_run],
            "total": 1,
            "page": 1,
            "page_size": 1,
        })
        mock_test_svc.is_run_active = AsyncMock(return_value=False)

        response = await client.get(f"{BASE_URL}/overview", headers=admin_headers)

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        data = body["data"]
        assert data["database"]["healthy"] is True
        assert data["database"]["status"] == "connected"
        assert data["errors"]["total"] == 5
        assert data["latest_test_run"] is not None
        assert data["test_run_active"] is False

    @patch("app.api.v1.admin.system_health.test_runner_service")
    @patch("app.api.v1.admin.system_health.error_logging_service")
    @patch("app.api.v1.admin.system_health.check_db_connection", new_callable=AsyncMock)
    async def test_overview_no_test_runs(
        self, mock_db_check, mock_error_svc, mock_test_svc, client, admin_headers
    ):
        """GET /overview handles no prior test runs gracefully."""
        mock_db_check.return_value = True
        mock_error_svc.get_error_stats = AsyncMock(return_value={
            "period_hours": 24, "total": 0, "unresolved": 0,
            "by_level": {}, "by_source": {},
            "top_error_types": [], "top_failing_endpoints": [],
        })
        mock_test_svc.get_test_runs = AsyncMock(return_value={
            "items": [], "total": 0, "page": 1, "page_size": 1,
        })
        mock_test_svc.is_run_active = AsyncMock(return_value=False)

        response = await client.get(f"{BASE_URL}/overview", headers=admin_headers)

        assert response.status_code == 200
        data = response.json()["data"]
        assert data["latest_test_run"] is None

    @patch("app.api.v1.admin.system_health.test_runner_service")
    @patch("app.api.v1.admin.system_health.error_logging_service")
    @patch("app.api.v1.admin.system_health.check_db_connection", new_callable=AsyncMock)
    async def test_overview_db_unhealthy(
        self, mock_db_check, mock_error_svc, mock_test_svc, client, admin_headers
    ):
        """GET /overview reports database as disconnected when check fails."""
        mock_db_check.return_value = False
        mock_error_svc.get_error_stats = AsyncMock(return_value={
            "period_hours": 24, "total": 0, "unresolved": 0,
            "by_level": {}, "by_source": {},
            "top_error_types": [], "top_failing_endpoints": [],
        })
        mock_test_svc.get_test_runs = AsyncMock(return_value={
            "items": [], "total": 0, "page": 1, "page_size": 1,
        })
        mock_test_svc.is_run_active = AsyncMock(return_value=False)

        response = await client.get(f"{BASE_URL}/overview", headers=admin_headers)

        assert response.status_code == 200
        data = response.json()["data"]
        assert data["database"]["healthy"] is False
        assert data["database"]["status"] == "disconnected"

    async def test_overview_denied_for_student(self, client, non_admin_headers):
        """GET /overview returns 403 for non-admin users."""
        response = await client.get(f"{BASE_URL}/overview", headers=non_admin_headers)
        assert response.status_code == 403

    async def test_overview_denied_without_auth(self, client):
        """GET /overview returns 401 when no auth token is provided."""
        response = await client.get(f"{BASE_URL}/overview")
        assert response.status_code == 401


# =====================================================================
# GET /system-health/errors
# =====================================================================


@pytest.mark.unit
class TestErrorLogs:
    """Tests for the GET /system-health/errors endpoint."""

    @patch("app.api.v1.admin.system_health.error_logging_service")
    async def test_get_errors_returns_paginated_list(
        self, mock_error_svc, client, admin_headers
    ):
        """GET /errors returns a paginated list of error logs."""
        error1 = _make_error_log(level="ERROR")
        error2 = _make_error_log(level="WARNING", source="frontend")

        mock_error_svc.get_errors = AsyncMock(return_value={
            "items": [error1, error2],
            "total": 2,
            "page": 1,
            "page_size": 50,
            "pages": 1,
        })

        response = await client.get(f"{BASE_URL}/errors", headers=admin_headers)

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        data = body["data"]
        assert len(data["items"]) == 2
        assert data["total"] == 2
        assert data["page"] == 1
        assert data["page_size"] == 50
        assert data["pages"] == 1

    @patch("app.api.v1.admin.system_health.error_logging_service")
    async def test_get_errors_with_filters(
        self, mock_error_svc, client, admin_headers
    ):
        """GET /errors passes query filters to the service."""
        mock_error_svc.get_errors = AsyncMock(return_value={
            "items": [],
            "total": 0,
            "page": 1,
            "page_size": 10,
            "pages": 0,
        })

        response = await client.get(
            f"{BASE_URL}/errors",
            headers=admin_headers,
            params={
                "level": "CRITICAL",
                "source": "frontend",
                "is_resolved": False,
                "endpoint": "/api/v1/auth",
                "error_type": "TypeError",
                "hours": 12,
                "page": 1,
                "page_size": 10,
            },
        )

        assert response.status_code == 200
        mock_error_svc.get_errors.assert_awaited_once()
        call_kwargs = mock_error_svc.get_errors.call_args
        # Verify filters were passed through
        assert call_kwargs.kwargs.get("level") == "CRITICAL" or call_kwargs[1].get("level") == "CRITICAL"

    @patch("app.api.v1.admin.system_health.error_logging_service")
    async def test_get_errors_item_shape(
        self, mock_error_svc, client, admin_headers
    ):
        """GET /errors response items contain expected fields."""
        error = _make_error_log(ai_diagnosis="Some diagnosis")
        mock_error_svc.get_errors = AsyncMock(return_value={
            "items": [error],
            "total": 1,
            "page": 1,
            "page_size": 50,
            "pages": 1,
        })

        response = await client.get(f"{BASE_URL}/errors", headers=admin_headers)
        item = response.json()["data"]["items"][0]

        expected_keys = {
            "id", "level", "source", "error_type", "message",
            "endpoint", "method", "user_role", "is_resolved",
            "has_diagnosis", "created_at",
        }
        assert expected_keys.issubset(set(item.keys()))
        assert item["has_diagnosis"] is True

    async def test_get_errors_denied_for_student(self, client, non_admin_headers):
        """GET /errors returns 403 for non-admin users."""
        response = await client.get(f"{BASE_URL}/errors", headers=non_admin_headers)
        assert response.status_code == 403


# =====================================================================
# GET /system-health/errors/{error_id}
# =====================================================================


@pytest.mark.unit
class TestErrorDetail:
    """Tests for the GET /system-health/errors/{error_id} endpoint."""

    @patch("app.api.v1.admin.system_health.error_logging_service")
    async def test_get_error_detail_success(
        self, mock_error_svc, client, admin_headers
    ):
        """GET /errors/{id} returns full error detail."""
        error_id = uuid.uuid4()
        error = _make_error_log(
            error_id=error_id,
            ai_diagnosis="Root cause: missing config key",
            ai_diagnosed_at=datetime(2026, 2, 15, 11, 0, 0),
            is_resolved=True,
            resolved_by=uuid.uuid4(),
            resolved_at=datetime(2026, 2, 15, 12, 0, 0),
            resolution_notes="Fixed in commit abc123",
            request_data={"key": "value"},
            context={"version": "1.0"},
        )
        mock_error_svc.get_error_by_id = AsyncMock(return_value=error)

        response = await client.get(
            f"{BASE_URL}/errors/{error_id}", headers=admin_headers
        )

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        data = body["data"]
        assert data["id"] == str(error_id)
        assert data["ai_diagnosis"] == "Root cause: missing config key"
        assert data["is_resolved"] is True
        assert data["resolution_notes"] == "Fixed in commit abc123"
        assert data["stack_trace"] is not None

    @patch("app.api.v1.admin.system_health.error_logging_service")
    async def test_get_error_detail_not_found(
        self, mock_error_svc, client, admin_headers
    ):
        """GET /errors/{id} returns 404 if error does not exist."""
        mock_error_svc.get_error_by_id = AsyncMock(return_value=None)
        fake_id = uuid.uuid4()

        response = await client.get(
            f"{BASE_URL}/errors/{fake_id}", headers=admin_headers
        )

        assert response.status_code == 404

    async def test_get_error_detail_denied_for_student(self, client, non_admin_headers):
        """GET /errors/{id} returns 403 for non-admin users."""
        fake_id = uuid.uuid4()
        response = await client.get(
            f"{BASE_URL}/errors/{fake_id}", headers=non_admin_headers
        )
        assert response.status_code == 403


# =====================================================================
# POST /system-health/errors/{error_id}/diagnose
# =====================================================================


@pytest.mark.unit
class TestDiagnoseError:
    """Tests for the POST /system-health/errors/{error_id}/diagnose endpoint."""

    @patch("app.api.v1.admin.system_health.error_logging_service")
    async def test_diagnose_error_success(
        self, mock_error_svc, client, admin_headers
    ):
        """POST /errors/{id}/diagnose returns AI diagnosis data."""
        error_id = uuid.uuid4()
        mock_error_svc.diagnose_with_ai = AsyncMock(return_value={
            "error_id": str(error_id),
            "diagnosis": "Root cause: unhandled NoneType",
            "diagnosed_at": "2026-02-15T11:00:00",
            "model_used": "gemini-pro",
        })

        response = await client.post(
            f"{BASE_URL}/errors/{error_id}/diagnose", headers=admin_headers
        )

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert body["data"]["diagnosis"] == "Root cause: unhandled NoneType"
        assert body["data"]["model_used"] == "gemini-pro"

    @patch("app.api.v1.admin.system_health.error_logging_service")
    async def test_diagnose_error_not_found(
        self, mock_error_svc, client, admin_headers
    ):
        """POST /errors/{id}/diagnose returns 404 if error does not exist."""
        mock_error_svc.diagnose_with_ai = AsyncMock(return_value=None)
        fake_id = uuid.uuid4()

        response = await client.post(
            f"{BASE_URL}/errors/{fake_id}/diagnose", headers=admin_headers
        )

        assert response.status_code == 404

    async def test_diagnose_error_denied_for_student(self, client, non_admin_headers):
        """POST /errors/{id}/diagnose returns 403 for non-admin users."""
        fake_id = uuid.uuid4()
        response = await client.post(
            f"{BASE_URL}/errors/{fake_id}/diagnose", headers=non_admin_headers
        )
        assert response.status_code == 403


# =====================================================================
# PATCH /system-health/errors/{error_id}/resolve
# =====================================================================


@pytest.mark.unit
class TestResolveError:
    """Tests for the PATCH /system-health/errors/{error_id}/resolve endpoint."""

    @patch("app.api.v1.admin.system_health.error_logging_service")
    async def test_resolve_error_success(
        self, mock_error_svc, client, admin_headers
    ):
        """PATCH /errors/{id}/resolve marks the error as resolved."""
        error_id = uuid.uuid4()
        resolved_error = _make_error_log(
            error_id=error_id,
            is_resolved=True,
            resolved_at=datetime(2026, 2, 15, 12, 0, 0),
        )
        mock_error_svc.mark_resolved = AsyncMock(return_value=resolved_error)

        response = await client.patch(
            f"{BASE_URL}/errors/{error_id}/resolve",
            headers=admin_headers,
            params={"notes": "Fixed in production"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert body["data"]["is_resolved"] is True
        assert body["data"]["resolved_at"] is not None

    @patch("app.api.v1.admin.system_health.error_logging_service")
    async def test_resolve_error_not_found(
        self, mock_error_svc, client, admin_headers
    ):
        """PATCH /errors/{id}/resolve returns 404 if error does not exist."""
        mock_error_svc.mark_resolved = AsyncMock(return_value=None)
        fake_id = uuid.uuid4()

        response = await client.patch(
            f"{BASE_URL}/errors/{fake_id}/resolve", headers=admin_headers
        )

        assert response.status_code == 404

    async def test_resolve_error_denied_for_student(self, client, non_admin_headers):
        """PATCH /errors/{id}/resolve returns 403 for non-admin users."""
        fake_id = uuid.uuid4()
        response = await client.patch(
            f"{BASE_URL}/errors/{fake_id}/resolve", headers=non_admin_headers
        )
        assert response.status_code == 403


# =====================================================================
# POST /system-health/errors/report  (no auth required)
# =====================================================================


@pytest.mark.unit
class TestFrontendErrorReport:
    """Tests for the POST /system-health/errors/report endpoint."""

    @patch("app.api.v1.admin.system_health.error_logging_service")
    async def test_report_frontend_error_success(
        self, mock_error_svc, client
    ):
        """POST /errors/report accepts error payload without auth."""
        mock_error_svc.log_error = AsyncMock(return_value=MagicMock())

        payload = {
            "level": "ERROR",
            "error_type": "ChunkLoadError",
            "message": "Failed to load dynamic import /assets/dashboard.js",
            "stack_trace": "Error: ChunkLoadError at ...",
            "url": "/dashboard",
            "user_role": "student",
            "context": {"browser": "Chrome 120"},
        }

        response = await client.post(f"{BASE_URL}/errors/report", json=payload)

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        mock_error_svc.log_error.assert_awaited_once()

    @patch("app.api.v1.admin.system_health.error_logging_service")
    async def test_report_frontend_error_minimal_payload(
        self, mock_error_svc, client
    ):
        """POST /errors/report works with minimal payload."""
        mock_error_svc.log_error = AsyncMock(return_value=MagicMock())

        response = await client.post(
            f"{BASE_URL}/errors/report",
            json={"message": "Unknown error"},
        )

        assert response.status_code == 200
        assert response.json()["status"] == "success"

    @patch("app.api.v1.admin.system_health.error_logging_service")
    async def test_report_frontend_error_service_failure(
        self, mock_error_svc, client
    ):
        """POST /errors/report returns error status when service fails."""
        mock_error_svc.log_error = AsyncMock(side_effect=Exception("DB down"))

        response = await client.post(
            f"{BASE_URL}/errors/report",
            json={"message": "Some error"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "error"

    async def test_report_frontend_error_no_auth_required(self, client):
        """POST /errors/report does not require authentication."""
        # Even without any auth headers, the endpoint should not return 401
        with patch(
            "app.api.v1.admin.system_health.error_logging_service"
        ) as mock_svc:
            mock_svc.log_error = AsyncMock(return_value=MagicMock())
            response = await client.post(
                f"{BASE_URL}/errors/report",
                json={"message": "pre-auth error"},
            )
            assert response.status_code != 401


# =====================================================================
# POST /system-health/tests/run
# =====================================================================


@pytest.mark.unit
class TestRunTests:
    """Tests for the POST /system-health/tests/run endpoint."""

    @patch("app.api.v1.admin.system_health.test_runner_service")
    async def test_run_tests_success(
        self, mock_test_svc, client, admin_headers
    ):
        """POST /tests/run triggers a test execution and returns run data."""
        test_run = _make_test_run(run_type="backend", status="passed")
        mock_test_svc.is_run_active = AsyncMock(return_value=False)
        mock_test_svc.run_tests = AsyncMock(return_value=test_run)

        response = await client.post(
            f"{BASE_URL}/tests/run",
            headers=admin_headers,
            params={"run_type": "backend"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        data = body["data"]
        assert data["type"] == "backend"
        assert data["status"] == "passed"
        assert data["started_at"] is not None

    @patch("app.api.v1.admin.system_health.test_runner_service")
    async def test_run_tests_conflict_when_active(
        self, mock_test_svc, client, admin_headers
    ):
        """POST /tests/run returns 409 if a test run is already active."""
        mock_test_svc.is_run_active = AsyncMock(return_value=True)

        response = await client.post(
            f"{BASE_URL}/tests/run",
            headers=admin_headers,
            params={"run_type": "all"},
        )

        assert response.status_code == 409

    async def test_run_tests_invalid_run_type(self, client, admin_headers):
        """POST /tests/run returns 400 for invalid run_type."""
        with patch(
            "app.api.v1.admin.system_health.test_runner_service"
        ) as mock_test_svc:
            mock_test_svc.is_run_active = AsyncMock(return_value=False)

            response = await client.post(
                f"{BASE_URL}/tests/run",
                headers=admin_headers,
                params={"run_type": "integration"},
            )

            assert response.status_code == 400

    async def test_run_tests_denied_for_student(self, client, non_admin_headers):
        """POST /tests/run returns 403 for non-admin users."""
        response = await client.post(
            f"{BASE_URL}/tests/run",
            headers=non_admin_headers,
            params={"run_type": "backend"},
        )
        assert response.status_code == 403

    @patch("app.api.v1.admin.system_health.test_runner_service")
    async def test_run_tests_default_run_type(
        self, mock_test_svc, client, admin_headers
    ):
        """POST /tests/run defaults to run_type='all' when not specified."""
        test_run = _make_test_run(run_type="all")
        mock_test_svc.is_run_active = AsyncMock(return_value=False)
        mock_test_svc.run_tests = AsyncMock(return_value=test_run)

        response = await client.post(
            f"{BASE_URL}/tests/run", headers=admin_headers
        )

        assert response.status_code == 200


# =====================================================================
# GET /system-health/tests/results
# =====================================================================


@pytest.mark.unit
class TestGetTestResults:
    """Tests for the GET /system-health/tests/results endpoint."""

    @patch("app.api.v1.admin.system_health.test_runner_service")
    async def test_get_test_results_success(
        self, mock_test_svc, client, admin_headers
    ):
        """GET /tests/results returns paginated test run history."""
        run1 = _make_test_run(run_type="backend", status="passed")
        run2 = _make_test_run(run_type="frontend", status="failed")

        mock_test_svc.get_test_runs = AsyncMock(return_value={
            "items": [run1, run2],
            "total": 2,
            "page": 1,
            "page_size": 20,
        })

        response = await client.get(f"{BASE_URL}/tests/results", headers=admin_headers)

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        data = body["data"]
        assert len(data["items"]) == 2
        assert data["total"] == 2

    @patch("app.api.v1.admin.system_health.test_runner_service")
    async def test_get_test_results_with_type_filter(
        self, mock_test_svc, client, admin_headers
    ):
        """GET /tests/results can filter by run_type."""
        mock_test_svc.get_test_runs = AsyncMock(return_value={
            "items": [],
            "total": 0,
            "page": 1,
            "page_size": 20,
        })

        response = await client.get(
            f"{BASE_URL}/tests/results",
            headers=admin_headers,
            params={"run_type": "backend"},
        )

        assert response.status_code == 200
        mock_test_svc.get_test_runs.assert_awaited_once()

    @patch("app.api.v1.admin.system_health.test_runner_service")
    async def test_get_test_results_item_shape(
        self, mock_test_svc, client, admin_headers
    ):
        """GET /tests/results items contain the expected fields."""
        run = _make_test_run()
        mock_test_svc.get_test_runs = AsyncMock(return_value={
            "items": [run],
            "total": 1,
            "page": 1,
            "page_size": 20,
        })

        response = await client.get(f"{BASE_URL}/tests/results", headers=admin_headers)
        item = response.json()["data"]["items"][0]

        expected_keys = {
            "id", "type", "status", "summary", "triggered_by",
            "started_at", "completed_at", "duration",
        }
        assert expected_keys.issubset(set(item.keys()))

    async def test_get_test_results_denied_for_student(self, client, non_admin_headers):
        """GET /tests/results returns 403 for non-admin users."""
        response = await client.get(
            f"{BASE_URL}/tests/results", headers=non_admin_headers
        )
        assert response.status_code == 403


# =====================================================================
# GET /system-health/tests/results/{run_id}
# =====================================================================


@pytest.mark.unit
class TestGetTestRunDetail:
    """Tests for the GET /system-health/tests/results/{run_id} endpoint."""

    @patch("app.api.v1.admin.system_health.test_runner_service")
    async def test_get_test_run_detail_success(
        self, mock_test_svc, client, admin_headers
    ):
        """GET /tests/results/{id} returns full test run detail with output."""
        run_id = uuid.uuid4()
        run = _make_test_run(run_id=run_id, output="test output lines...")
        mock_test_svc.get_test_run_by_id = AsyncMock(return_value=run)

        response = await client.get(
            f"{BASE_URL}/tests/results/{run_id}", headers=admin_headers
        )

        assert response.status_code == 200
        body = response.json()
        data = body["data"]
        assert data["id"] == str(run_id)
        assert data["output"] == "test output lines..."

    @patch("app.api.v1.admin.system_health.test_runner_service")
    async def test_get_test_run_detail_not_found(
        self, mock_test_svc, client, admin_headers
    ):
        """GET /tests/results/{id} returns 404 if run does not exist."""
        mock_test_svc.get_test_run_by_id = AsyncMock(return_value=None)
        fake_id = uuid.uuid4()

        response = await client.get(
            f"{BASE_URL}/tests/results/{fake_id}", headers=admin_headers
        )

        assert response.status_code == 404

    async def test_get_test_run_detail_denied_for_student(self, client, non_admin_headers):
        """GET /tests/results/{id} returns 403 for non-admin users."""
        fake_id = uuid.uuid4()
        response = await client.get(
            f"{BASE_URL}/tests/results/{fake_id}", headers=non_admin_headers
        )
        assert response.status_code == 403


# =====================================================================
# Cross-cutting access control tests
# =====================================================================


@pytest.mark.unit
class TestSystemHealthAccessControl:
    """Verify that all admin-only endpoints deny access to non-admin roles."""

    ADMIN_ONLY_ENDPOINTS = [
        ("GET", "/overview"),
        ("GET", "/errors"),
        ("GET", f"/errors/{uuid.uuid4()}"),
        ("POST", f"/errors/{uuid.uuid4()}/diagnose"),
        ("PATCH", f"/errors/{uuid.uuid4()}/resolve"),
        ("POST", "/tests/run"),
        ("GET", "/tests/results"),
        ("GET", f"/tests/results/{uuid.uuid4()}"),
    ]

    async def test_all_admin_endpoints_deny_student(self, client, non_admin_headers):
        """All admin-only endpoints return 403 for a student user."""
        for method, path in self.ADMIN_ONLY_ENDPOINTS:
            url = f"{BASE_URL}{path}"
            if method == "GET":
                resp = await client.get(url, headers=non_admin_headers)
            elif method == "POST":
                resp = await client.post(url, headers=non_admin_headers)
            elif method == "PATCH":
                resp = await client.patch(url, headers=non_admin_headers)
            else:
                continue

            assert resp.status_code == 403, (
                f"Expected 403 for {method} {path}, got {resp.status_code}"
            )

    async def test_all_admin_endpoints_deny_unauthenticated(self, client):
        """All admin-only endpoints return 401 without auth headers."""
        for method, path in self.ADMIN_ONLY_ENDPOINTS:
            url = f"{BASE_URL}{path}"
            if method == "GET":
                resp = await client.get(url)
            elif method == "POST":
                resp = await client.post(url)
            elif method == "PATCH":
                resp = await client.patch(url)
            else:
                continue

            assert resp.status_code == 401, (
                f"Expected 401 for {method} {path}, got {resp.status_code}"
            )
