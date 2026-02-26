"""
Tests for Parent Dashboard API endpoints.

Endpoints under test:
    GET  /api/v1/parent/dashboard/overview     - Family overview
    GET  /api/v1/parent/dashboard/highlights   - Today's highlights
    GET  /api/v1/parent/dashboard/urgent       - Urgent items
    POST /api/v1/parent/dashboard/mood         - Create mood entry
    GET  /api/v1/parent/dashboard/mood/history - Mood history
    GET  /api/v1/parent/dashboard/ai-summary   - AI family summary

The parent dashboard uses a local require_parent_role dependency that
checks current_user.role == "parent" and returns 403 for other roles.
Service calls go through parent_dashboard_service.
"""

import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from datetime import date


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
BASE_URL = "/api/v1/parent/dashboard"

MOCK_FAMILY_OVERVIEW = {
    "total_children": 3,
    "active_today": 2,
    "total_minutes_today": 120,
    "total_sessions_today": 5,
    "children": [],
    "family_streak": 7,
    "weekly_average_minutes": 90,
}

MOCK_HIGHLIGHTS = {
    "highlights": [
        {
            "type": "achievement",
            "title": "Math mastery badge earned",
            "child_name": "Amara",
            "timestamp": "2026-02-15T10:00:00",
        }
    ],
    "summary": "Your children had a productive day!",
}

MOCK_URGENT_ITEMS = {
    "alerts": [],
    "upcoming_deadlines": [],
    "pending_consents": [],
    "low_engagement_warnings": [],
}

MOCK_MOOD_ENTRY = {
    "id": "mood-1",
    "emoji": "happy",
    "energy_level": 4,
    "note": "Great day!",
    "recorded_date": "2026-02-15",
    "created_at": "2026-02-15T10:00:00",
}

MOCK_MOOD_HISTORY = {
    "entries": [MOCK_MOOD_ENTRY],
    "most_common_mood": "happy",
    "average_energy": 4.2,
    "mood_trend": "stable",
}

MOCK_AI_SUMMARY = {
    "weekly_summary": "Overall a strong week for the family.",
    "key_insights": {
        "strengths": ["Mathematics", "Reading"],
        "concerns": [],
        "opportunities": ["Creative writing workshops"],
    },
    "predicted_engagement_trend": "improving",
    "top_recommendations": [
        "Schedule a family reading session this weekend."
    ],
}


# ---------------------------------------------------------------------------
# Family Overview
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestFamilyOverview:
    """Tests for GET /api/v1/parent/dashboard/overview."""

    @patch(
        "app.api.v1.parent.dashboard.parent_dashboard_service.get_family_overview",
        new_callable=AsyncMock,
    )
    async def test_overview_returns_200_for_parent(
        self, mock_overview, client, parent_user, parent_auth_headers
    ):
        """Authenticated parent receives 200 with family overview."""
        mock_overview.return_value = MOCK_FAMILY_OVERVIEW

        response = await client.get(
            f"{BASE_URL}/overview", headers=parent_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "total_children" in data
        assert "active_today" in data
        mock_overview.assert_awaited_once()

    @patch(
        "app.api.v1.parent.dashboard.parent_dashboard_service.get_family_overview",
        new_callable=AsyncMock,
    )
    async def test_overview_passes_parent_id(
        self, mock_overview, client, parent_user, parent_auth_headers
    ):
        """Service receives the correct parent_id."""
        mock_overview.return_value = MOCK_FAMILY_OVERVIEW

        await client.get(f"{BASE_URL}/overview", headers=parent_auth_headers)

        call_kwargs = mock_overview.call_args.kwargs
        assert call_kwargs["parent_id"] == parent_user.id

    async def test_overview_requires_authentication(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(f"{BASE_URL}/overview")
        assert response.status_code in (401, 403)

    async def test_overview_rejects_student_role(
        self, client, student_user, student_auth_headers
    ):
        """Student role returns 403."""
        response = await client.get(
            f"{BASE_URL}/overview", headers=student_auth_headers
        )
        assert response.status_code == 403

    async def test_overview_rejects_instructor_role(
        self, client, instructor_user, instructor_auth_headers
    ):
        """Instructor role returns 403."""
        response = await client.get(
            f"{BASE_URL}/overview", headers=instructor_auth_headers
        )
        assert response.status_code == 403

    @patch(
        "app.api.v1.parent.dashboard.parent_dashboard_service.get_family_overview",
        new_callable=AsyncMock,
    )
    async def test_overview_includes_children_list(
        self, mock_overview, client, parent_user, parent_auth_headers
    ):
        """Response includes the children array."""
        mock_overview.return_value = MOCK_FAMILY_OVERVIEW

        response = await client.get(
            f"{BASE_URL}/overview", headers=parent_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "children" in data
        assert isinstance(data["children"], list)

    @patch(
        "app.api.v1.parent.dashboard.parent_dashboard_service.get_family_overview",
        new_callable=AsyncMock,
    )
    async def test_overview_includes_streak(
        self, mock_overview, client, parent_user, parent_auth_headers
    ):
        """Response includes the family_streak field."""
        mock_overview.return_value = MOCK_FAMILY_OVERVIEW

        response = await client.get(
            f"{BASE_URL}/overview", headers=parent_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "family_streak" in data


# ---------------------------------------------------------------------------
# Today's Highlights
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestTodayHighlights:
    """Tests for GET /api/v1/parent/dashboard/highlights."""

    @patch(
        "app.api.v1.parent.dashboard.parent_dashboard_service.get_today_highlights",
        new_callable=AsyncMock,
    )
    async def test_highlights_success(
        self, mock_highlights, client, parent_user, parent_auth_headers
    ):
        """Parent receives 200 with today's highlights."""
        mock_highlights.return_value = MOCK_HIGHLIGHTS

        response = await client.get(
            f"{BASE_URL}/highlights", headers=parent_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "highlights" in data
        assert "summary" in data

    async def test_highlights_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(f"{BASE_URL}/highlights")
        assert response.status_code in (401, 403)

    async def test_highlights_rejects_student(
        self, client, student_user, student_auth_headers
    ):
        """Student role returns 403."""
        response = await client.get(
            f"{BASE_URL}/highlights", headers=student_auth_headers
        )
        assert response.status_code == 403


# ---------------------------------------------------------------------------
# Urgent Items
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestUrgentItems:
    """Tests for GET /api/v1/parent/dashboard/urgent."""

    @patch(
        "app.api.v1.parent.dashboard.parent_dashboard_service.get_urgent_items",
        new_callable=AsyncMock,
    )
    async def test_urgent_items_success(
        self, mock_urgent, client, parent_user, parent_auth_headers
    ):
        """Parent receives 200 with urgent items."""
        mock_urgent.return_value = MOCK_URGENT_ITEMS

        response = await client.get(
            f"{BASE_URL}/urgent", headers=parent_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "alerts" in data
        assert "upcoming_deadlines" in data

    async def test_urgent_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(f"{BASE_URL}/urgent")
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Mood Entry
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestMoodEntry:
    """Tests for POST /api/v1/parent/dashboard/mood."""

    @patch(
        "app.api.v1.parent.dashboard.parent_dashboard_service.create_mood_entry",
        new_callable=AsyncMock,
    )
    async def test_create_mood_entry_success(
        self, mock_mood, client, parent_user, parent_auth_headers, sample_mood_entry
    ):
        """Parent receives 201 on successful mood creation."""
        mock_mood.return_value = MOCK_MOOD_ENTRY

        response = await client.post(
            f"{BASE_URL}/mood",
            json=sample_mood_entry,
            headers=parent_auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert "emoji" in data

    async def test_create_mood_requires_auth(self, client, sample_mood_entry):
        """Request without auth returns 401 or 403."""
        response = await client.post(f"{BASE_URL}/mood", json=sample_mood_entry)
        assert response.status_code in (401, 403)

    async def test_create_mood_validates_body(
        self, client, parent_user, parent_auth_headers
    ):
        """Missing required emoji field returns 422."""
        response = await client.post(
            f"{BASE_URL}/mood",
            json={},
            headers=parent_auth_headers,
        )
        assert response.status_code == 422

    async def test_create_mood_rejects_student(
        self, client, student_user, student_auth_headers, sample_mood_entry
    ):
        """Student role returns 403."""
        response = await client.post(
            f"{BASE_URL}/mood",
            json=sample_mood_entry,
            headers=student_auth_headers,
        )
        assert response.status_code == 403


# ---------------------------------------------------------------------------
# Mood History
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestMoodHistory:
    """Tests for GET /api/v1/parent/dashboard/mood/history."""

    @patch(
        "app.api.v1.parent.dashboard.parent_dashboard_service.get_mood_history",
        new_callable=AsyncMock,
    )
    async def test_mood_history_success(
        self, mock_history, client, parent_user, parent_auth_headers
    ):
        """Parent receives 200 with mood history."""
        mock_history.return_value = MOCK_MOOD_HISTORY

        response = await client.get(
            f"{BASE_URL}/mood/history", headers=parent_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "entries" in data
        assert "most_common_mood" in data

    async def test_mood_history_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(f"{BASE_URL}/mood/history")
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# AI Family Summary
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestAIFamilySummary:
    """Tests for GET /api/v1/parent/dashboard/ai-summary."""

    @patch(
        "app.api.v1.parent.dashboard.parent_dashboard_service.get_ai_family_summary",
        new_callable=AsyncMock,
    )
    async def test_ai_summary_success(
        self, mock_summary, client, parent_user, parent_auth_headers
    ):
        """Parent receives 200 with AI family summary."""
        mock_summary.return_value = MOCK_AI_SUMMARY

        response = await client.get(
            f"{BASE_URL}/ai-summary", headers=parent_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "weekly_summary" in data
        assert "top_recommendations" in data

    async def test_ai_summary_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(f"{BASE_URL}/ai-summary")
        assert response.status_code in (401, 403)

    async def test_ai_summary_rejects_student(
        self, client, student_user, student_auth_headers
    ):
        """Student role returns 403."""
        response = await client.get(
            f"{BASE_URL}/ai-summary", headers=student_auth_headers
        )
        assert response.status_code == 403
