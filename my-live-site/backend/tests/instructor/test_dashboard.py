"""
Tests for Instructor Dashboard API endpoints.

Endpoint under test:
    GET /api/v1/instructor/dashboard/overview

The route calls get_dashboard_overview(db, instructor_id) from
app.services.instructor.dashboard_service and returns a
DashboardOverviewResponse.
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
OVERVIEW_URL = "/api/v1/instructor/dashboard/overview"

MOCK_OVERVIEW = {
    "total_students": 42,
    "active_courses": 5,
    "pending_submissions": 8,
    "total_revenue": 150000.0,
    "upcoming_sessions": [
        {
            "id": "session-1",
            "title": "Math Review",
            "scheduled_at": "2026-02-16T10:00:00",
            "student_count": 12,
        }
    ],
    "pending_submissions_list": [],
    "ai_flagged_students": [],
    "quick_actions": [],
}


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestInstructorDashboardOverview:
    """Tests for GET /api/v1/instructor/dashboard/overview."""

    @patch(
        "app.api.v1.instructor.dashboard.get_dashboard_overview",
        new_callable=AsyncMock,
    )
    async def test_overview_returns_200_for_instructor(
        self, mock_get_overview, client, instructor_user, instructor_auth_headers
    ):
        """Authenticated instructor receives 200 with dashboard data."""
        mock_get_overview.return_value = MOCK_OVERVIEW

        response = await client.get(OVERVIEW_URL, headers=instructor_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "total_students" in data
        assert "active_courses" in data
        mock_get_overview.assert_awaited_once()

    @patch(
        "app.api.v1.instructor.dashboard.get_dashboard_overview",
        new_callable=AsyncMock,
    )
    async def test_overview_passes_correct_instructor_id(
        self, mock_get_overview, client, instructor_user, instructor_auth_headers
    ):
        """Service is called with the authenticated instructor's user id."""
        mock_get_overview.return_value = MOCK_OVERVIEW

        await client.get(OVERVIEW_URL, headers=instructor_auth_headers)

        call_args = mock_get_overview.call_args
        # Second positional arg is the instructor_id string
        assert call_args[0][1] == str(instructor_user.id)

    async def test_overview_requires_authentication(self, client):
        """Request without Authorization header returns 401 or 403."""
        response = await client.get(OVERVIEW_URL)
        assert response.status_code in (401, 403)

    async def test_overview_rejects_student_role(
        self, client, student_user, student_auth_headers
    ):
        """A student token must be rejected with 403."""
        response = await client.get(OVERVIEW_URL, headers=student_auth_headers)
        assert response.status_code == 403

    @patch(
        "app.api.v1.instructor.dashboard.get_dashboard_overview",
        new_callable=AsyncMock,
    )
    async def test_overview_returns_upcoming_sessions(
        self, mock_get_overview, client, instructor_user, instructor_auth_headers
    ):
        """Response body includes the upcoming_sessions list."""
        mock_get_overview.return_value = MOCK_OVERVIEW

        response = await client.get(OVERVIEW_URL, headers=instructor_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "upcoming_sessions" in data
        assert isinstance(data["upcoming_sessions"], list)

    @patch(
        "app.api.v1.instructor.dashboard.get_dashboard_overview",
        new_callable=AsyncMock,
    )
    async def test_overview_returns_pending_submissions(
        self, mock_get_overview, client, instructor_user, instructor_auth_headers
    ):
        """Response body includes pending_submissions count."""
        mock_get_overview.return_value = MOCK_OVERVIEW

        response = await client.get(OVERVIEW_URL, headers=instructor_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "pending_submissions" in data

    @patch(
        "app.api.v1.instructor.dashboard.get_dashboard_overview",
        new_callable=AsyncMock,
        side_effect=Exception("DB connection lost"),
    )
    async def test_overview_service_error_returns_500(
        self, mock_get_overview, client, instructor_user, instructor_auth_headers
    ):
        """When the service layer raises, the endpoint returns 500."""
        response = await client.get(OVERVIEW_URL, headers=instructor_auth_headers)
        assert response.status_code == 500

    @patch(
        "app.api.v1.instructor.dashboard.get_dashboard_overview",
        new_callable=AsyncMock,
    )
    async def test_overview_response_contains_revenue(
        self, mock_get_overview, client, instructor_user, instructor_auth_headers
    ):
        """Response includes total_revenue metric."""
        mock_get_overview.return_value = MOCK_OVERVIEW

        response = await client.get(OVERVIEW_URL, headers=instructor_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "total_revenue" in data
        assert data["total_revenue"] == 150000.0
