"""
Tests for Partner Dashboard API endpoints.

Endpoints under test:
    GET /api/v1/partner/dashboard/overview       - Dashboard overview
    GET /api/v1/partner/dashboard/ai-highlights  - AI highlights

The partner dashboard uses verify_partner_or_admin_access() which
allows both partner and admin roles, rejecting all others with 403.
Service calls go through PartnerDashboardService and PartnerAIService.
"""

import pytest
from unittest.mock import patch, AsyncMock, MagicMock


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
BASE_URL = "/api/v1/partner/dashboard"

MOCK_OVERVIEW = {
    "sponsored_children": 45,
    "active_programs": 3,
    "total_investment": 2500000.0,
    "budget_utilisation": 0.72,
    "impact_score": 85,
    "recent_activity": [
        {
            "type": "enrollment",
            "message": "5 new students enrolled in STEM Scholarship",
            "timestamp": "2026-02-15T09:00:00",
        }
    ],
}

MOCK_AI_HIGHLIGHTS = {
    "highlights": [
        {
            "type": "insight",
            "title": "Student performance improving",
            "description": "Average scores up 12% this month",
            "priority": "info",
        }
    ],
    "recommendations": [
        "Consider expanding the reading programme to Grade 6",
    ],
    "generated_at": "2026-02-15T10:00:00",
}


# ---------------------------------------------------------------------------
# Dashboard Overview
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestPartnerDashboardOverview:
    """Tests for GET /api/v1/partner/dashboard/overview."""

    @patch(
        "app.api.v1.partner.dashboard.PartnerDashboardService.get_overview",
        new_callable=AsyncMock,
    )
    async def test_overview_returns_200_for_partner(
        self, mock_overview, client, partner_user, partner_auth_headers
    ):
        """Authenticated partner receives 200 with dashboard data."""
        mock_overview.return_value = MOCK_OVERVIEW

        response = await client.get(
            f"{BASE_URL}/overview", headers=partner_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "data" in data
        mock_overview.assert_awaited_once()

    @patch(
        "app.api.v1.partner.dashboard.PartnerDashboardService.get_overview",
        new_callable=AsyncMock,
    )
    async def test_overview_returns_200_for_admin(
        self, mock_overview, client, admin_user, admin_auth_headers
    ):
        """Admin role also has access to the partner dashboard."""
        mock_overview.return_value = MOCK_OVERVIEW

        response = await client.get(
            f"{BASE_URL}/overview", headers=admin_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @patch(
        "app.api.v1.partner.dashboard.PartnerDashboardService.get_overview",
        new_callable=AsyncMock,
    )
    async def test_overview_response_shape(
        self, mock_overview, client, partner_user, partner_auth_headers
    ):
        """Response wraps data in {status: 'success', data: ...}."""
        mock_overview.return_value = MOCK_OVERVIEW

        response = await client.get(
            f"{BASE_URL}/overview", headers=partner_auth_headers
        )

        data = response.json()
        assert "status" in data
        assert "data" in data
        assert data["data"]["sponsored_children"] == 45

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

    @patch(
        "app.api.v1.partner.dashboard.PartnerDashboardService.get_overview",
        new_callable=AsyncMock,
        side_effect=Exception("Database error"),
    )
    async def test_overview_service_error_returns_500(
        self, mock_overview, client, partner_user, partner_auth_headers
    ):
        """Service error returns 500."""
        response = await client.get(
            f"{BASE_URL}/overview", headers=partner_auth_headers
        )
        assert response.status_code == 500

    @patch(
        "app.api.v1.partner.dashboard.PartnerDashboardService.get_overview",
        new_callable=AsyncMock,
    )
    async def test_overview_includes_impact_score(
        self, mock_overview, client, partner_user, partner_auth_headers
    ):
        """Response data includes impact_score metric."""
        mock_overview.return_value = MOCK_OVERVIEW

        response = await client.get(
            f"{BASE_URL}/overview", headers=partner_auth_headers
        )

        data = response.json()["data"]
        assert "impact_score" in data
        assert data["impact_score"] == 85

    @patch(
        "app.api.v1.partner.dashboard.PartnerDashboardService.get_overview",
        new_callable=AsyncMock,
    )
    async def test_overview_includes_budget_utilisation(
        self, mock_overview, client, partner_user, partner_auth_headers
    ):
        """Response data includes budget_utilisation."""
        mock_overview.return_value = MOCK_OVERVIEW

        response = await client.get(
            f"{BASE_URL}/overview", headers=partner_auth_headers
        )

        data = response.json()["data"]
        assert "budget_utilisation" in data


# ---------------------------------------------------------------------------
# AI Highlights
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestPartnerAIHighlights:
    """Tests for GET /api/v1/partner/dashboard/ai-highlights."""

    @patch(
        "app.api.v1.partner.dashboard.PartnerAIService.get_daily_highlights",
        new_callable=AsyncMock,
    )
    async def test_ai_highlights_success(
        self, mock_highlights, client, partner_user, partner_auth_headers
    ):
        """Partner receives 200 with AI-generated highlights."""
        mock_highlights.return_value = MOCK_AI_HIGHLIGHTS

        response = await client.get(
            f"{BASE_URL}/ai-highlights", headers=partner_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "data" in data
        mock_highlights.assert_awaited_once()

    @patch(
        "app.api.v1.partner.dashboard.PartnerAIService.get_daily_highlights",
        new_callable=AsyncMock,
    )
    async def test_ai_highlights_response_contains_recommendations(
        self, mock_highlights, client, partner_user, partner_auth_headers
    ):
        """Response includes recommendations list."""
        mock_highlights.return_value = MOCK_AI_HIGHLIGHTS

        response = await client.get(
            f"{BASE_URL}/ai-highlights", headers=partner_auth_headers
        )

        data = response.json()["data"]
        assert "recommendations" in data
        assert isinstance(data["recommendations"], list)

    async def test_ai_highlights_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(f"{BASE_URL}/ai-highlights")
        assert response.status_code in (401, 403)

    async def test_ai_highlights_rejects_student(
        self, client, student_user, student_auth_headers
    ):
        """Student role returns 403."""
        response = await client.get(
            f"{BASE_URL}/ai-highlights", headers=student_auth_headers
        )
        assert response.status_code == 403

    @patch(
        "app.api.v1.partner.dashboard.PartnerAIService.get_daily_highlights",
        new_callable=AsyncMock,
    )
    async def test_ai_highlights_admin_access(
        self, mock_highlights, client, admin_user, admin_auth_headers
    ):
        """Admin also has access to AI highlights."""
        mock_highlights.return_value = MOCK_AI_HIGHLIGHTS

        response = await client.get(
            f"{BASE_URL}/ai-highlights", headers=admin_auth_headers
        )

        assert response.status_code == 200

    @patch(
        "app.api.v1.partner.dashboard.PartnerAIService.get_daily_highlights",
        new_callable=AsyncMock,
        side_effect=Exception("AI service unavailable"),
    )
    async def test_ai_highlights_service_error(
        self, mock_highlights, client, partner_user, partner_auth_headers
    ):
        """Service error returns 500."""
        response = await client.get(
            f"{BASE_URL}/ai-highlights", headers=partner_auth_headers
        )
        assert response.status_code == 500
