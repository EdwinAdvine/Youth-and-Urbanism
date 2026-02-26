"""
Tests for Admin Finance API Endpoints

Tests the following routes under /api/v1/admin/:
- GET /finance/transactions  - Paginated transaction listing with filters
- GET /finance/refunds       - Refund queue management
- GET /finance/payouts       - Payout queue management
- GET /finance/plans         - Subscription plan listing
- GET /finance/invoices      - Invoice listing

All endpoints require admin or staff role access (verify_admin_access).
Non-admin/non-staff users receive 403.
"""

import uuid
from unittest.mock import patch, AsyncMock

import pytest


BASE_URL = "/api/v1/admin/finance"


# =====================================================================
# GET /finance/transactions
# =====================================================================


@pytest.mark.unit
class TestGetRevenueOverview:
    """Tests for the GET /finance/transactions endpoint (revenue / transaction overview)."""

    async def test_get_revenue_overview_requires_admin(self, client, non_admin_headers):
        """GET /transactions returns 403 for non-admin (student) users."""
        response = await client.get(
            f"{BASE_URL}/transactions", headers=non_admin_headers
        )
        assert response.status_code == 403

    @patch(
        "app.api.v1.admin.finance.FinanceService.list_transactions",
        new_callable=AsyncMock,
    )
    async def test_get_revenue_overview_success(
        self, mock_list, client, admin_headers
    ):
        """GET /transactions returns paginated transaction list for admin."""
        mock_list.return_value = {
            "items": [
                {
                    "id": str(uuid.uuid4()),
                    "reference": "TXN-20260215-001",
                    "amount": 1500.0,
                    "currency": "KES",
                    "status": "completed",
                    "payment_method": "mpesa",
                    "user_name": "Jane Doe",
                    "created_at": "2026-02-15T09:00:00",
                },
                {
                    "id": str(uuid.uuid4()),
                    "reference": "TXN-20260215-002",
                    "amount": 3000.0,
                    "currency": "KES",
                    "status": "pending",
                    "payment_method": "card",
                    "user_name": "John Doe",
                    "created_at": "2026-02-15T10:30:00",
                },
            ],
            "total": 2,
            "page": 1,
            "page_size": 20,
            "pages": 1,
        }

        response = await client.get(
            f"{BASE_URL}/transactions", headers=admin_headers
        )

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        data = body["data"]
        assert len(data["items"]) == 2
        assert data["total"] == 2

    @patch(
        "app.api.v1.admin.finance.FinanceService.list_transactions",
        new_callable=AsyncMock,
    )
    async def test_get_transactions_with_filters(
        self, mock_list, client, admin_headers
    ):
        """GET /transactions passes status and payment_method filters to service."""
        mock_list.return_value = {
            "items": [],
            "total": 0,
            "page": 1,
            "page_size": 20,
            "pages": 0,
        }

        response = await client.get(
            f"{BASE_URL}/transactions",
            headers=admin_headers,
            params={"status": "completed", "payment_method": "mpesa"},
        )

        assert response.status_code == 200
        mock_list.assert_awaited_once()

    @patch(
        "app.api.v1.admin.finance.FinanceService.list_transactions",
        new_callable=AsyncMock,
    )
    async def test_get_transactions_allowed_for_staff(
        self, mock_list, client, staff_headers
    ):
        """GET /transactions is accessible by staff users."""
        mock_list.return_value = {
            "items": [],
            "total": 0,
            "page": 1,
            "page_size": 20,
            "pages": 0,
        }

        response = await client.get(
            f"{BASE_URL}/transactions", headers=staff_headers
        )

        assert response.status_code == 200

    async def test_get_transactions_denied_without_auth(self, client):
        """GET /transactions returns 401 when no auth token is provided."""
        response = await client.get(f"{BASE_URL}/transactions")
        assert response.status_code == 401


# =====================================================================
# GET /finance/transactions (aliased as "get_transactions" test)
# =====================================================================


@pytest.mark.unit
class TestGetTransactions:
    """Additional tests for the GET /finance/transactions endpoint."""

    @patch(
        "app.api.v1.admin.finance.FinanceService.list_transactions",
        new_callable=AsyncMock,
    )
    async def test_get_transactions(self, mock_list, client, admin_headers):
        """GET /transactions returns transaction items with expected fields."""
        txn_id = str(uuid.uuid4())
        mock_list.return_value = {
            "items": [
                {
                    "id": txn_id,
                    "reference": "TXN-001",
                    "amount": 2500.0,
                    "currency": "KES",
                    "status": "completed",
                    "payment_method": "mpesa",
                    "user_name": "Test User",
                    "created_at": "2026-02-15T11:00:00",
                },
            ],
            "total": 1,
            "page": 1,
            "page_size": 20,
            "pages": 1,
        }

        response = await client.get(
            f"{BASE_URL}/transactions", headers=admin_headers
        )

        assert response.status_code == 200
        body = response.json()
        item = body["data"]["items"][0]
        assert item["id"] == txn_id
        assert item["amount"] == 2500.0
        assert item["currency"] == "KES"

    @patch(
        "app.api.v1.admin.finance.FinanceService.list_transactions",
        new_callable=AsyncMock,
    )
    async def test_get_transactions_handles_service_error(
        self, mock_list, client, admin_headers
    ):
        """GET /transactions returns 500 when the service raises an exception."""
        mock_list.side_effect = Exception("Database connection lost")

        response = await client.get(
            f"{BASE_URL}/transactions", headers=admin_headers
        )

        assert response.status_code == 500


# =====================================================================
# GET /finance/payouts
# =====================================================================


@pytest.mark.unit
class TestGetPayouts:
    """Tests for the GET /finance/payouts endpoint."""

    @patch(
        "app.api.v1.admin.finance.FinanceService.get_payout_queue",
        new_callable=AsyncMock,
    )
    async def test_get_payouts(self, mock_payouts, client, admin_headers):
        """GET /payouts returns the payout queue for admin."""
        mock_payouts.return_value = [
            {
                "id": str(uuid.uuid4()),
                "instructor_name": "John Instructor",
                "amount": 15000.0,
                "currency": "KES",
                "status": "pending",
                "scheduled_at": "2026-02-20T00:00:00",
            },
            {
                "id": str(uuid.uuid4()),
                "instructor_name": "Jane Instructor",
                "amount": 22000.0,
                "currency": "KES",
                "status": "processing",
                "scheduled_at": "2026-02-18T00:00:00",
            },
        ]

        response = await client.get(
            f"{BASE_URL}/payouts", headers=admin_headers
        )

        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert body["data"]["total"] == 2
        assert len(body["data"]["items"]) == 2

    @patch(
        "app.api.v1.admin.finance.FinanceService.get_payout_queue",
        new_callable=AsyncMock,
    )
    async def test_get_payouts_empty(self, mock_payouts, client, admin_headers):
        """GET /payouts returns empty list when no payouts exist."""
        mock_payouts.return_value = []

        response = await client.get(
            f"{BASE_URL}/payouts", headers=admin_headers
        )

        assert response.status_code == 200
        body = response.json()
        assert body["data"]["total"] == 0
        assert body["data"]["items"] == []

    @patch(
        "app.api.v1.admin.finance.FinanceService.get_payout_queue",
        new_callable=AsyncMock,
    )
    async def test_get_payouts_with_status_filter(
        self, mock_payouts, client, admin_headers
    ):
        """GET /payouts passes status filter to the service."""
        mock_payouts.return_value = []

        response = await client.get(
            f"{BASE_URL}/payouts",
            headers=admin_headers,
            params={"status": "pending"},
        )

        assert response.status_code == 200
        mock_payouts.assert_awaited_once()

    async def test_get_payouts_denied_for_student(self, client, non_admin_headers):
        """GET /payouts returns 403 for non-admin users."""
        response = await client.get(
            f"{BASE_URL}/payouts", headers=non_admin_headers
        )
        assert response.status_code == 403

    async def test_get_payouts_denied_without_auth(self, client):
        """GET /payouts returns 401 when no auth token is provided."""
        response = await client.get(f"{BASE_URL}/payouts")
        assert response.status_code == 401


# =====================================================================
# Cross-cutting: student denial
# =====================================================================


@pytest.mark.unit
class TestFinanceDeniedForStudent:
    """Verify all finance endpoints deny student access."""

    FINANCE_ENDPOINTS = [
        "/finance/transactions",
        "/finance/refunds",
        "/finance/payouts",
        "/finance/plans",
        "/finance/invoices",
    ]

    async def test_finance_denied_for_student(self, client, non_admin_headers):
        """All finance endpoints return 403 for a student user."""
        for path in self.FINANCE_ENDPOINTS:
            url = f"/api/v1/admin{path}"
            resp = await client.get(url, headers=non_admin_headers)
            assert resp.status_code == 403, (
                f"Expected 403 for GET {path}, got {resp.status_code}"
            )

    async def test_finance_denied_without_auth(self, client):
        """All finance endpoints return 401 without auth headers."""
        for path in self.FINANCE_ENDPOINTS:
            url = f"/api/v1/admin{path}"
            resp = await client.get(url)
            assert resp.status_code == 401, (
                f"Expected 401 for GET {path}, got {resp.status_code}"
            )
