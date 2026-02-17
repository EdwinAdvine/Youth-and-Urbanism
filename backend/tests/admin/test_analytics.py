"""
Tests for Admin Analytics API Endpoints

Tests the following routes under /api/v1/admin/analytics/:
- GET /dashboard  - Admin dashboard summary (users, courses, enrollments, revenue)
- GET /revenue    - Revenue time series with optional date-range filter
- GET /users      - User growth metrics with optional date-range filter
- GET /courses    - Course performance metrics (top courses, completion rates)

All endpoints require admin role access via inline _require_admin check.
Non-admin users receive 403.
"""

import uuid
from datetime import date
from unittest.mock import patch, AsyncMock

import pytest


BASE_URL = "/api/v1/admin/analytics"


# =====================================================================
# GET /analytics/dashboard
# =====================================================================


@pytest.mark.unit
class TestGetAnalyticsOverview:
    """Tests for the GET /analytics/dashboard endpoint."""

    @patch("app.services.analytics_service.get_dashboard_summary", new_callable=AsyncMock)
    async def test_get_analytics_overview_requires_admin(
        self, mock_summary, client, non_admin_headers
    ):
        """GET /dashboard returns 403 for non-admin (student) users."""
        response = await client.get(f"{BASE_URL}/dashboard", headers=non_admin_headers)
        assert response.status_code == 403

    @patch("app.services.analytics_service.get_dashboard_summary", new_callable=AsyncMock)
    async def test_get_analytics_overview_success(
        self, mock_summary, client, admin_headers
    ):
        """GET /dashboard returns platform metrics for an admin user."""
        mock_summary.return_value = {
            "total_users": 320,
            "total_students": 210,
            "total_courses": 45,
            "total_enrollments": 580,
            "total_revenue": 250000.0,
            "active_users_today": 67,
            "generated_at": "2026-02-15T10:00:00",
        }

        response = await client.get(f"{BASE_URL}/dashboard", headers=admin_headers)

        assert response.status_code == 200
        body = response.json()
        assert body["total_users"] == 320
        assert body["total_courses"] == 45
        assert body["total_revenue"] == 250000.0

    async def test_get_analytics_overview_denied_without_auth(self, client):
        """GET /dashboard returns 401 when no auth token is provided."""
        response = await client.get(f"{BASE_URL}/dashboard")
        assert response.status_code == 401


# =====================================================================
# GET /analytics/users
# =====================================================================


@pytest.mark.unit
class TestGetStudentAnalytics:
    """Tests for the GET /analytics/users endpoint (user growth metrics)."""

    @patch("app.services.analytics_service.get_user_growth", new_callable=AsyncMock)
    async def test_get_student_analytics(
        self, mock_growth, client, admin_headers
    ):
        """GET /users returns user growth data for admin."""
        mock_growth.return_value = {
            "total_users": 320,
            "new_users_this_month": 28,
            "role_breakdown": {
                "student": 210,
                "parent": 60,
                "instructor": 30,
                "admin": 5,
                "partner": 10,
                "staff": 5,
            },
            "growth_trend": [
                {"date": "2026-01-01", "count": 280},
                {"date": "2026-02-01", "count": 320},
            ],
        }

        response = await client.get(f"{BASE_URL}/users", headers=admin_headers)

        assert response.status_code == 200
        body = response.json()
        assert body["total_users"] == 320
        assert "role_breakdown" in body

    async def test_student_analytics_denied_for_student(self, client, non_admin_headers):
        """GET /users returns 403 for student users."""
        response = await client.get(f"{BASE_URL}/users", headers=non_admin_headers)
        assert response.status_code == 403


# =====================================================================
# GET /analytics/courses
# =====================================================================


@pytest.mark.unit
class TestGetCourseAnalytics:
    """Tests for the GET /analytics/courses endpoint."""

    @patch("app.services.analytics_service.get_course_performance", new_callable=AsyncMock)
    async def test_get_course_analytics(
        self, mock_performance, client, admin_headers
    ):
        """GET /courses returns course performance metrics for admin."""
        mock_performance.return_value = {
            "total_courses": 45,
            "published_courses": 38,
            "avg_completion_rate": 72.5,
            "top_courses": [
                {
                    "id": str(uuid.uuid4()),
                    "title": "Mathematics Grade 7",
                    "enrollments": 85,
                    "completion_rate": 80.0,
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "English Grade 6",
                    "enrollments": 72,
                    "completion_rate": 75.0,
                },
            ],
        }

        response = await client.get(f"{BASE_URL}/courses", headers=admin_headers)

        assert response.status_code == 200
        body = response.json()
        assert body["total_courses"] == 45
        assert body["avg_completion_rate"] == 72.5
        assert len(body["top_courses"]) == 2

    async def test_course_analytics_denied_for_student(self, client, non_admin_headers):
        """GET /courses returns 403 for student users."""
        response = await client.get(f"{BASE_URL}/courses", headers=non_admin_headers)
        assert response.status_code == 403


# =====================================================================
# GET /analytics/revenue (date range filter)
# =====================================================================


@pytest.mark.unit
class TestAnalyticsDateRangeFilter:
    """Tests for the GET /analytics/revenue endpoint with date range parameters."""

    @patch("app.services.analytics_service.get_revenue_metrics", new_callable=AsyncMock)
    async def test_analytics_date_range_filter(
        self, mock_revenue, client, admin_headers
    ):
        """GET /revenue accepts start_date and end_date query parameters."""
        mock_revenue.return_value = {
            "total_revenue": 120000.0,
            "currency": "KES",
            "period": {
                "start": "2026-01-01",
                "end": "2026-01-31",
            },
            "daily_revenue": [
                {"date": "2026-01-01", "amount": 4000.0},
                {"date": "2026-01-02", "amount": 3500.0},
            ],
        }

        response = await client.get(
            f"{BASE_URL}/revenue",
            headers=admin_headers,
            params={
                "start_date": "2026-01-01",
                "end_date": "2026-01-31",
            },
        )

        assert response.status_code == 200
        body = response.json()
        assert body["total_revenue"] == 120000.0
        assert body["currency"] == "KES"
        mock_revenue.assert_awaited_once()

    @patch("app.services.analytics_service.get_revenue_metrics", new_callable=AsyncMock)
    async def test_revenue_without_date_range(
        self, mock_revenue, client, admin_headers
    ):
        """GET /revenue works without date range parameters (defaults)."""
        mock_revenue.return_value = {
            "total_revenue": 250000.0,
            "currency": "KES",
            "period": {"start": None, "end": None},
            "daily_revenue": [],
        }

        response = await client.get(f"{BASE_URL}/revenue", headers=admin_headers)

        assert response.status_code == 200
        mock_revenue.assert_awaited_once()

    async def test_revenue_denied_for_student(self, client, non_admin_headers):
        """GET /revenue returns 403 for student users."""
        response = await client.get(f"{BASE_URL}/revenue", headers=non_admin_headers)
        assert response.status_code == 403


# =====================================================================
# Cross-cutting: student denial
# =====================================================================


@pytest.mark.unit
class TestAnalyticsDeniedForStudent:
    """Verify all analytics endpoints deny student access."""

    ANALYTICS_ENDPOINTS = [
        "/dashboard",
        "/revenue",
        "/users",
        "/courses",
    ]

    async def test_analytics_denied_for_student(self, client, non_admin_headers):
        """All analytics endpoints return 403 for a student user."""
        for path in self.ANALYTICS_ENDPOINTS:
            url = f"{BASE_URL}{path}"
            resp = await client.get(url, headers=non_admin_headers)
            assert resp.status_code == 403, (
                f"Expected 403 for GET {path}, got {resp.status_code}"
            )

    async def test_analytics_denied_without_auth(self, client):
        """All analytics endpoints return 401 without auth headers."""
        for path in self.ANALYTICS_ENDPOINTS:
            url = f"{BASE_URL}{path}"
            resp = await client.get(url)
            assert resp.status_code == 401, (
                f"Expected 401 for GET {path}, got {resp.status_code}"
            )
