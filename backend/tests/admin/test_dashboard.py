"""
Tests for Admin Dashboard API Endpoints

Tests the following routes under /api/v1/admin/dashboard/:
- GET /overview         - Platform-wide metrics overview
- GET /alerts           - System and safety alerts
- GET /pending-items    - Pending approvals / action items
- GET /revenue-snapshot - Revenue breakdown (today, week, month)
- GET /ai-anomalies     - AI anomaly detections

All endpoints require admin or staff role access (verify_admin_access).
Non-admin/non-staff users receive 403.
"""

import uuid
from datetime import datetime
from unittest.mock import patch, MagicMock, AsyncMock

import pytest


BASE_URL = "/api/v1/admin/dashboard"


# =====================================================================
# GET /dashboard/overview
# =====================================================================


@pytest.mark.unit
class TestDashboardOverview:
    """Tests for the GET /dashboard/overview endpoint."""

    @patch("app.api.v1.admin.dashboard.DashboardService.get_overview", new_callable=AsyncMock)
    async def test_overview_returns_metrics(self, mock_get_overview, client, admin_headers):
        """GET /overview returns platform-wide metrics."""
        mock_get_overview.return_value = {
            "total_users": 150,
            "active_users_today": 42,
            "revenue_today": 15000.0,
            "new_enrollments_today": 8,
            "ai_sessions_today": 35,
            "total_courses": 25,
            "active_courses": 20,
            "generated_at": "2026-02-15T10:00:00",
        }

        response = await client.get(f"{BASE_URL}/overview", headers=admin_headers)

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        data = body["data"]
        assert data["total_users"] == 150
        assert data["active_users_today"] == 42
        assert data["revenue_today"] == 15000.0
        assert data["total_courses"] == 25
        assert "generated_at" in data

    @patch("app.api.v1.admin.dashboard.DashboardService.get_overview", new_callable=AsyncMock)
    async def test_overview_allowed_for_staff(self, mock_get_overview, client, staff_headers):
        """GET /overview is accessible by staff users (verify_admin_access allows staff)."""
        mock_get_overview.return_value = {
            "total_users": 0, "active_users_today": 0, "revenue_today": 0,
            "new_enrollments_today": 0, "ai_sessions_today": 0,
            "total_courses": 0, "active_courses": 0,
            "generated_at": "2026-02-15T10:00:00",
        }

        response = await client.get(f"{BASE_URL}/overview", headers=staff_headers)

        assert response.status_code == 200

    async def test_overview_denied_for_student(self, client, non_admin_headers):
        """GET /overview returns 403 for student users."""
        response = await client.get(f"{BASE_URL}/overview", headers=non_admin_headers)
        assert response.status_code == 403

    async def test_overview_denied_without_auth(self, client):
        """GET /overview returns 401 when no auth token is provided."""
        response = await client.get(f"{BASE_URL}/overview")
        assert response.status_code == 401

    @patch("app.api.v1.admin.dashboard.DashboardService.get_overview", new_callable=AsyncMock)
    async def test_overview_handles_service_error(self, mock_get_overview, client, admin_headers):
        """GET /overview returns 500 when the service raises an exception."""
        mock_get_overview.side_effect = Exception("Database connection lost")

        response = await client.get(f"{BASE_URL}/overview", headers=admin_headers)

        assert response.status_code == 500


# =====================================================================
# GET /dashboard/alerts
# =====================================================================


@pytest.mark.unit
class TestDashboardAlerts:
    """Tests for the GET /dashboard/alerts endpoint."""

    @patch("app.api.v1.admin.dashboard.DashboardService.get_alerts", new_callable=AsyncMock)
    async def test_alerts_returns_list(self, mock_get_alerts, client, admin_headers):
        """GET /alerts returns a list of system alerts."""
        mock_get_alerts.return_value = [
            {
                "id": str(uuid.uuid4()),
                "type": "safety",
                "severity": "critical",
                "title": "Content flagged",
                "message": "AI response flagged for review",
                "created_at": "2026-02-15T09:37:00",
                "is_read": False,
                "action_url": "/admin/moderation/flagged",
            },
            {
                "id": str(uuid.uuid4()),
                "type": "system",
                "severity": "high",
                "title": "DB storage at 82%",
                "message": "Consider scaling storage",
                "created_at": "2026-02-15T08:00:00",
                "is_read": False,
                "action_url": "/admin/system/storage",
            },
        ]

        response = await client.get(f"{BASE_URL}/alerts", headers=admin_headers)

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert body["count"] == 2
        assert isinstance(body["data"], list)
        alert = body["data"][0]
        assert "type" in alert
        assert "severity" in alert
        assert "title" in alert

    @patch("app.api.v1.admin.dashboard.DashboardService.get_alerts", new_callable=AsyncMock)
    async def test_alerts_empty_list(self, mock_get_alerts, client, admin_headers):
        """GET /alerts returns empty list when no alerts exist."""
        mock_get_alerts.return_value = []

        response = await client.get(f"{BASE_URL}/alerts", headers=admin_headers)

        assert response.status_code == 200
        body = response.json()
        assert body["count"] == 0
        assert body["data"] == []

    async def test_alerts_denied_for_student(self, client, non_admin_headers):
        """GET /alerts returns 403 for non-admin/non-staff users."""
        response = await client.get(f"{BASE_URL}/alerts", headers=non_admin_headers)
        assert response.status_code == 403


# =====================================================================
# GET /dashboard/pending-items
# =====================================================================


@pytest.mark.unit
class TestDashboardPendingItems:
    """Tests for the GET /dashboard/pending-items endpoint."""

    @patch("app.api.v1.admin.dashboard.DashboardService.get_pending_items", new_callable=AsyncMock)
    async def test_pending_items_returns_counts(self, mock_get_pending, client, admin_headers):
        """GET /pending-items returns breakdown of pending approvals."""
        mock_get_pending.return_value = {
            "total": 12,
            "categories": {
                "pending_enrollments": 3,
                "pending_courses": 2,
                "pending_transactions": 4,
                "open_tickets": 2,
                "moderation_items": 1,
            },
        }

        response = await client.get(f"{BASE_URL}/pending-items", headers=admin_headers)

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        data = body["data"]
        assert data["total"] == 12
        assert "categories" in data
        assert data["categories"]["pending_enrollments"] == 3

    @patch("app.api.v1.admin.dashboard.DashboardService.get_pending_items", new_callable=AsyncMock)
    async def test_pending_items_zero_counts(self, mock_get_pending, client, admin_headers):
        """GET /pending-items handles zero pending items."""
        mock_get_pending.return_value = {
            "total": 0,
            "categories": {
                "pending_enrollments": 0,
                "pending_courses": 0,
                "pending_transactions": 0,
                "open_tickets": 0,
                "moderation_items": 0,
            },
        }

        response = await client.get(f"{BASE_URL}/pending-items", headers=admin_headers)

        assert response.status_code == 200
        assert response.json()["data"]["total"] == 0

    async def test_pending_items_denied_for_student(self, client, non_admin_headers):
        """GET /pending-items returns 403 for non-admin/non-staff users."""
        response = await client.get(f"{BASE_URL}/pending-items", headers=non_admin_headers)
        assert response.status_code == 403


# =====================================================================
# GET /dashboard/revenue-snapshot
# =====================================================================


@pytest.mark.unit
class TestDashboardRevenueSnapshot:
    """Tests for the GET /dashboard/revenue-snapshot endpoint."""

    @patch("app.api.v1.admin.dashboard.DashboardService.get_revenue_snapshot", new_callable=AsyncMock)
    async def test_revenue_snapshot_returns_data(self, mock_get_revenue, client, admin_headers):
        """GET /revenue-snapshot returns today/week/month revenue data."""
        mock_get_revenue.return_value = {
            "total_today": 5000.0,
            "total_yesterday": 4500.0,
            "total_week": 32000.0,
            "total_month": 120000.0,
            "trend_percentage": 11.1,
            "currency": "KES",
            "recent_transactions": [
                {
                    "id": str(uuid.uuid4()),
                    "amount": 1500.0,
                    "currency": "KES",
                    "gateway": "mpesa",
                    "created_at": "2026-02-15T09:45:00",
                },
            ],
            "generated_at": "2026-02-15T10:00:00",
        }

        response = await client.get(f"{BASE_URL}/revenue-snapshot", headers=admin_headers)

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        data = body["data"]
        assert data["total_today"] == 5000.0
        assert data["currency"] == "KES"
        assert data["trend_percentage"] == 11.1
        assert len(data["recent_transactions"]) == 1

    @patch("app.api.v1.admin.dashboard.DashboardService.get_revenue_snapshot", new_callable=AsyncMock)
    async def test_revenue_snapshot_handles_service_error(self, mock_get_revenue, client, admin_headers):
        """GET /revenue-snapshot returns 500 when the service raises."""
        mock_get_revenue.side_effect = Exception("Query timeout")

        response = await client.get(f"{BASE_URL}/revenue-snapshot", headers=admin_headers)

        assert response.status_code == 500

    async def test_revenue_snapshot_denied_for_student(self, client, non_admin_headers):
        """GET /revenue-snapshot returns 403 for non-admin/non-staff users."""
        response = await client.get(f"{BASE_URL}/revenue-snapshot", headers=non_admin_headers)
        assert response.status_code == 403


# =====================================================================
# GET /dashboard/ai-anomalies
# =====================================================================


@pytest.mark.unit
class TestDashboardAIAnomalies:
    """Tests for the GET /dashboard/ai-anomalies endpoint."""

    @patch("app.api.v1.admin.dashboard.DashboardService.get_ai_anomalies", new_callable=AsyncMock)
    async def test_ai_anomalies_returns_list(self, mock_get_anomalies, client, admin_headers):
        """GET /ai-anomalies returns a list of AI anomaly detections."""
        mock_get_anomalies.return_value = [
            {
                "id": str(uuid.uuid4()),
                "type": "response_quality",
                "severity": "high",
                "title": "Low-quality AI responses detected",
                "description": "Gemini Pro returned low-confidence responses",
                "affected_model": "gemini-pro",
                "affected_subject": "Mathematics",
                "affected_grade": "Grade 6",
                "detected_at": "2026-02-15T09:15:00",
                "status": "open",
                "action_url": "/admin/ai/anomalies/response-quality",
            },
        ]

        response = await client.get(f"{BASE_URL}/ai-anomalies", headers=admin_headers)

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert body["count"] == 1
        anomaly = body["data"][0]
        assert anomaly["type"] == "response_quality"
        assert anomaly["affected_model"] == "gemini-pro"

    @patch("app.api.v1.admin.dashboard.DashboardService.get_ai_anomalies", new_callable=AsyncMock)
    async def test_ai_anomalies_empty_list(self, mock_get_anomalies, client, admin_headers):
        """GET /ai-anomalies returns empty list when no anomalies detected."""
        mock_get_anomalies.return_value = []

        response = await client.get(f"{BASE_URL}/ai-anomalies", headers=admin_headers)

        assert response.status_code == 200
        body = response.json()
        assert body["count"] == 0
        assert body["data"] == []

    async def test_ai_anomalies_denied_for_student(self, client, non_admin_headers):
        """GET /ai-anomalies returns 403 for non-admin/non-staff users."""
        response = await client.get(f"{BASE_URL}/ai-anomalies", headers=non_admin_headers)
        assert response.status_code == 403


# =====================================================================
# Cross-cutting access control tests
# =====================================================================


@pytest.mark.unit
class TestDashboardAccessControl:
    """Verify that all dashboard endpoints enforce role-based access."""

    DASHBOARD_ENDPOINTS = [
        "/overview",
        "/alerts",
        "/pending-items",
        "/revenue-snapshot",
        "/ai-anomalies",
    ]

    async def test_all_endpoints_deny_student(self, client, non_admin_headers):
        """All dashboard endpoints return 403 for a student user."""
        for path in self.DASHBOARD_ENDPOINTS:
            url = f"{BASE_URL}{path}"
            resp = await client.get(url, headers=non_admin_headers)
            assert resp.status_code == 403, (
                f"Expected 403 for GET {path}, got {resp.status_code}"
            )

    async def test_all_endpoints_deny_unauthenticated(self, client):
        """All dashboard endpoints return 401 without auth headers."""
        for path in self.DASHBOARD_ENDPOINTS:
            url = f"{BASE_URL}{path}"
            resp = await client.get(url)
            assert resp.status_code == 401, (
                f"Expected 401 for GET {path}, got {resp.status_code}"
            )

    async def test_all_endpoints_allow_staff(self, client, staff_headers):
        """All dashboard endpoints allow staff role access."""
        # We need to mock the service for each endpoint to avoid DB hits
        with patch(
            "app.api.v1.admin.dashboard.DashboardService.get_overview",
            new_callable=AsyncMock,
            return_value={
                "total_users": 0, "active_users_today": 0, "revenue_today": 0,
                "new_enrollments_today": 0, "ai_sessions_today": 0,
                "total_courses": 0, "active_courses": 0,
                "generated_at": "2026-02-15T10:00:00",
            },
        ), patch(
            "app.api.v1.admin.dashboard.DashboardService.get_alerts",
            new_callable=AsyncMock,
            return_value=[],
        ), patch(
            "app.api.v1.admin.dashboard.DashboardService.get_pending_items",
            new_callable=AsyncMock,
            return_value={
                "total": 0,
                "categories": {
                    "pending_enrollments": 0, "pending_courses": 0,
                    "pending_transactions": 0, "open_tickets": 0,
                    "moderation_items": 0,
                },
            },
        ), patch(
            "app.api.v1.admin.dashboard.DashboardService.get_revenue_snapshot",
            new_callable=AsyncMock,
            return_value={
                "total_today": 0, "total_yesterday": 0, "total_week": 0,
                "total_month": 0, "trend_percentage": 0, "currency": "KES",
                "recent_transactions": [], "generated_at": "2026-02-15T10:00:00",
            },
        ), patch(
            "app.api.v1.admin.dashboard.DashboardService.get_ai_anomalies",
            new_callable=AsyncMock,
            return_value=[],
        ):
            for path in self.DASHBOARD_ENDPOINTS:
                url = f"{BASE_URL}{path}"
                resp = await client.get(url, headers=staff_headers)
                assert resp.status_code == 200, (
                    f"Expected 200 for GET {path} with staff, got {resp.status_code}"
                )
