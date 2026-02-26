"""
Tests for Instructor Earnings API endpoints.

Endpoints under test:
    GET  /api/v1/instructor/earnings/           - List earnings
    GET  /api/v1/instructor/earnings/breakdown  - Earnings breakdown
    POST /api/v1/instructor/earnings/payouts/request  - Request payout
    GET  /api/v1/instructor/earnings/payouts/history   - Payout history
    GET  /api/v1/instructor/earnings/balance            - Available balance
"""

import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from datetime import datetime


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
EARNINGS_URL = "/api/v1/instructor/earnings/"
BREAKDOWN_URL = "/api/v1/instructor/earnings/breakdown"
PAYOUT_REQUEST_URL = "/api/v1/instructor/earnings/payouts/request"
PAYOUT_HISTORY_URL = "/api/v1/instructor/earnings/payouts/history"
BALANCE_URL = "/api/v1/instructor/earnings/balance"

MOCK_EARNINGS_LIST = {
    "earnings": [
        {
            "id": "earn-1",
            "amount": 5000.0,
            "earning_type": "course_revenue",
            "status": "confirmed",
            "created_at": "2026-01-15T10:00:00",
        }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
}

MOCK_BREAKDOWN = {
    "total_earnings": 150000.0,
    "by_type": {
        "course_revenue": 100000.0,
        "session_revenue": 30000.0,
        "bonus": 20000.0,
    },
    "by_course": [],
    "by_month": [],
    "period_start": "2026-01-01T00:00:00",
    "period_end": "2026-02-15T23:59:59",
}

MOCK_PAYOUT = {
    "id": "payout-1",
    "amount": 5000.0,
    "payout_method": "mpesa",
    "status": "pending",
    "created_at": "2026-02-15T10:00:00",
}

MOCK_PAYOUT_HISTORY = {
    "payouts": [MOCK_PAYOUT],
    "total": 1,
    "page": 1,
    "limit": 20,
}


# ---------------------------------------------------------------------------
# List Earnings
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestListEarnings:
    """Tests for GET /api/v1/instructor/earnings/."""

    @patch(
        "app.services.instructor.earnings_service.list_earnings",
        new_callable=AsyncMock,
    )
    async def test_list_earnings_success(
        self, mock_list, client, instructor_user, instructor_auth_headers
    ):
        """Instructor receives 200 with earnings list."""
        mock_list.return_value = MOCK_EARNINGS_LIST

        response = await client.get(EARNINGS_URL, headers=instructor_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "earnings" in data
        assert "total" in data

    async def test_list_earnings_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(EARNINGS_URL)
        assert response.status_code in (401, 403)

    async def test_list_earnings_rejects_student(
        self, client, student_user, student_auth_headers
    ):
        """Student role cannot access earnings."""
        response = await client.get(EARNINGS_URL, headers=student_auth_headers)
        assert response.status_code == 403

    @patch(
        "app.services.instructor.earnings_service.list_earnings",
        new_callable=AsyncMock,
    )
    async def test_list_earnings_with_filters(
        self, mock_list, client, instructor_user, instructor_auth_headers
    ):
        """Earnings can be filtered by type and status."""
        mock_list.return_value = MOCK_EARNINGS_LIST

        response = await client.get(
            f"{EARNINGS_URL}?earning_type=course_revenue&status=confirmed",
            headers=instructor_auth_headers,
        )
        assert response.status_code == 200

    @patch(
        "app.services.instructor.earnings_service.list_earnings",
        new_callable=AsyncMock,
    )
    async def test_list_earnings_custom_pagination(
        self, mock_list, client, instructor_user, instructor_auth_headers
    ):
        """Custom page and limit query parameters are accepted."""
        mock_list.return_value = MOCK_EARNINGS_LIST

        response = await client.get(
            f"{EARNINGS_URL}?page=2&limit=10",
            headers=instructor_auth_headers,
        )
        assert response.status_code == 200

    @patch(
        "app.services.instructor.earnings_service.list_earnings",
        new_callable=AsyncMock,
        side_effect=Exception("Database error"),
    )
    async def test_list_earnings_service_error(
        self, mock_list, client, instructor_user, instructor_auth_headers
    ):
        """Service error returns 500."""
        response = await client.get(EARNINGS_URL, headers=instructor_auth_headers)
        assert response.status_code == 500


# ---------------------------------------------------------------------------
# Earnings Breakdown
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestEarningsBreakdown:
    """Tests for GET /api/v1/instructor/earnings/breakdown."""

    @patch(
        "app.api.v1.instructor.earnings.get_earnings_breakdown",
        new_callable=AsyncMock,
    )
    async def test_breakdown_success(
        self, mock_breakdown, client, instructor_user, instructor_auth_headers
    ):
        """Instructor receives 200 with breakdown data."""
        mock_breakdown.return_value = MOCK_BREAKDOWN

        response = await client.get(BREAKDOWN_URL, headers=instructor_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "total_earnings" in data

    async def test_breakdown_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(BREAKDOWN_URL)
        assert response.status_code in (401, 403)

    async def test_breakdown_rejects_student(
        self, client, student_user, student_auth_headers
    ):
        """Student role cannot access breakdown."""
        response = await client.get(BREAKDOWN_URL, headers=student_auth_headers)
        assert response.status_code == 403

    @patch(
        "app.api.v1.instructor.earnings.get_earnings_breakdown",
        new_callable=AsyncMock,
        side_effect=Exception("Service failure"),
    )
    async def test_breakdown_service_error(
        self, mock_breakdown, client, instructor_user, instructor_auth_headers
    ):
        """Service error returns 500."""
        response = await client.get(BREAKDOWN_URL, headers=instructor_auth_headers)
        assert response.status_code == 500


# ---------------------------------------------------------------------------
# Request Payout
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestPayoutRequest:
    """Tests for POST /api/v1/instructor/earnings/payouts/request."""

    @patch(
        "app.api.v1.instructor.earnings.request_payout",
        new_callable=AsyncMock,
    )
    async def test_payout_request_success(
        self, mock_payout, client, instructor_user, instructor_auth_headers
    ):
        """Instructor receives 200 with payout data."""
        mock_payout.return_value = MOCK_PAYOUT

        response = await client.post(
            PAYOUT_REQUEST_URL,
            json={
                "amount": 5000.0,
                "payout_method": "mpesa",
                "payout_details": {"phone_number": "+254712345678"},
            },
            headers=instructor_auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["status"] == "pending"

    async def test_payout_request_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.post(
            PAYOUT_REQUEST_URL,
            json={
                "amount": 5000.0,
                "payout_method": "mpesa",
                "payout_details": {"phone_number": "+254712345678"},
            },
        )
        assert response.status_code in (401, 403)

    async def test_payout_request_rejects_student(
        self, client, student_user, student_auth_headers
    ):
        """Student role cannot request payouts."""
        response = await client.post(
            PAYOUT_REQUEST_URL,
            json={
                "amount": 5000.0,
                "payout_method": "mpesa",
                "payout_details": {"phone_number": "+254712345678"},
            },
            headers=student_auth_headers,
        )
        assert response.status_code == 403

    async def test_payout_request_validates_body(
        self, client, instructor_user, instructor_auth_headers
    ):
        """Missing required fields returns 422."""
        response = await client.post(
            PAYOUT_REQUEST_URL,
            json={},
            headers=instructor_auth_headers,
        )
        assert response.status_code == 422


# ---------------------------------------------------------------------------
# Payout History
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestPayoutHistory:
    """Tests for GET /api/v1/instructor/earnings/payouts/history."""

    @patch(
        "app.services.instructor.earnings_service.list_payouts",
        new_callable=AsyncMock,
    )
    async def test_payout_history_success(
        self, mock_list, client, instructor_user, instructor_auth_headers
    ):
        """Instructor receives 200 with payout history."""
        mock_list.return_value = MOCK_PAYOUT_HISTORY

        response = await client.get(
            PAYOUT_HISTORY_URL, headers=instructor_auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "payouts" in data

    async def test_payout_history_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(PAYOUT_HISTORY_URL)
        assert response.status_code in (401, 403)

    async def test_payout_history_rejects_student(
        self, client, student_user, student_auth_headers
    ):
        """Student role cannot access payout history."""
        response = await client.get(PAYOUT_HISTORY_URL, headers=student_auth_headers)
        assert response.status_code == 403


# ---------------------------------------------------------------------------
# Balance
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestBalance:
    """Tests for GET /api/v1/instructor/earnings/balance."""

    @patch(
        "app.services.instructor.earnings_service.get_available_balance",
        new_callable=AsyncMock,
    )
    async def test_balance_success(
        self, mock_balance, client, instructor_user, instructor_auth_headers
    ):
        """Instructor receives 200 with balance info."""
        mock_balance.return_value = 25000.0

        response = await client.get(BALANCE_URL, headers=instructor_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "available_balance" in data
        assert data["available_balance"] == 25000.0
        assert data["currency"] == "KES"

    async def test_balance_requires_auth(self, client):
        """Request without auth returns 401 or 403."""
        response = await client.get(BALANCE_URL)
        assert response.status_code in (401, 403)

    async def test_balance_rejects_student(
        self, client, student_user, student_auth_headers
    ):
        """Student role cannot check instructor balance."""
        response = await client.get(BALANCE_URL, headers=student_auth_headers)
        assert response.status_code == 403

    @patch(
        "app.services.instructor.earnings_service.get_available_balance",
        new_callable=AsyncMock,
        side_effect=Exception("Service failure"),
    )
    async def test_balance_service_error(
        self, mock_balance, client, instructor_user, instructor_auth_headers
    ):
        """Service error returns 500."""
        response = await client.get(BALANCE_URL, headers=instructor_auth_headers)
        assert response.status_code == 500
