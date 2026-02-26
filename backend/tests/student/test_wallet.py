"""
Tests for Student Wallet & Payment API Routes

Endpoints under test:
- GET  /api/v1/student/wallet/balance                  -- wallet balance
- GET  /api/v1/student/wallet/transactions             -- transaction history
- POST /api/v1/student/wallet/topup/paystack           -- initiate Paystack payment
- GET  /api/v1/student/wallet/payment/verify/{ref}     -- verify Paystack payment
- GET  /api/v1/student/wallet/payment-methods          -- saved payment methods
- POST /api/v1/student/wallet/payment-methods          -- save payment method
- GET  /api/v1/student/wallet/subscription             -- subscription info
- GET  /api/v1/student/wallet/ai-advisor               -- AI financial advice
"""
import pytest
import uuid
from unittest.mock import patch, AsyncMock, MagicMock
from httpx import AsyncClient


BASE = "/api/v1/student/wallet"


# ──────────────────────────────────────────────────────────────
# GET /balance
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_wallet_balance_success(
    async_client: AsyncClient,
    override_current_user,
    mock_wallet_balance,
):
    """Student fetches wallet balance successfully."""
    with patch("app.api.v1.student.wallet.WalletService") as MockService:
        instance = MockService.return_value
        instance.get_wallet_balance = AsyncMock(return_value=mock_wallet_balance)

        response = await async_client.get(
            f"{BASE}/balance",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["balance"] == 5000
    assert data["currency"] == "KES"


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_wallet_balance_requires_auth(async_client: AsyncClient):
    """Unauthenticated request is rejected."""
    response = await async_client.get(f"{BASE}/balance")
    assert response.status_code in [401, 403]


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_wallet_balance_non_student_forbidden(
    async_client: AsyncClient,
    override_current_user_admin,
):
    """Admin role cannot access student wallet balance."""
    response = await async_client.get(
        f"{BASE}/balance",
        headers={"Authorization": "Bearer fake-token"},
    )
    assert response.status_code == 403


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_wallet_balance_service_error(
    async_client: AsyncClient,
    override_current_user,
):
    """Service exception returns 500."""
    with patch("app.api.v1.student.wallet.WalletService") as MockService:
        instance = MockService.return_value
        instance.get_wallet_balance = AsyncMock(
            side_effect=RuntimeError("Redis unavailable")
        )

        response = await async_client.get(
            f"{BASE}/balance",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 500


# ──────────────────────────────────────────────────────────────
# GET /transactions
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_transaction_history_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student retrieves paginated transaction history."""
    mock_history = {
        "transactions": [
            {
                "id": str(uuid.uuid4()),
                "amount": 500,
                "type": "topup",
                "created_at": "2026-02-14T10:00:00",
            }
        ],
        "total": 1,
        "limit": 20,
        "offset": 0,
    }

    with patch("app.api.v1.student.wallet.WalletService") as MockService:
        instance = MockService.return_value
        instance.get_transaction_history = AsyncMock(return_value=mock_history)

        response = await async_client.get(
            f"{BASE}/transactions",
            headers={"Authorization": "Bearer fake-token"},
            params={"limit": 20, "offset": 0},
        )

    assert response.status_code == 200
    data = response.json()
    assert "transactions" in data
    assert data["total"] == 1


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_transaction_history_non_student_forbidden(
    async_client: AsyncClient,
    override_current_user_instructor,
):
    """Instructor cannot access student transactions."""
    response = await async_client.get(
        f"{BASE}/transactions",
        headers={"Authorization": "Bearer fake-token"},
    )
    assert response.status_code == 403


# ──────────────────────────────────────────────────────────────
# POST /topup/paystack
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_initiate_paystack_payment_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Valid top-up request returns Paystack authorization URL."""
    mock_payment = {
        "reference": "ref_abc123",
        "authorization_url": "https://checkout.paystack.com/test",
        "access_code": "code_xyz",
    }

    with patch("app.api.v1.student.wallet.WalletService") as MockService:
        instance = MockService.return_value
        instance.initiate_paystack_payment = AsyncMock(return_value=mock_payment)

        response = await async_client.post(
            f"{BASE}/topup/paystack",
            headers={"Authorization": "Bearer fake-token"},
            json={"amount": 10000},
        )

    assert response.status_code == 200
    data = response.json()
    assert "authorization_url" in data
    assert "reference" in data
    assert "message" in data


@pytest.mark.unit
@pytest.mark.asyncio
async def test_initiate_paystack_payment_below_minimum(
    async_client: AsyncClient,
    override_current_user,
):
    """Amount below 100 kobo returns 400."""
    response = await async_client.post(
        f"{BASE}/topup/paystack",
        headers={"Authorization": "Bearer fake-token"},
        json={"amount": 50},
    )
    assert response.status_code == 400
    assert "Minimum amount" in response.json()["detail"]


@pytest.mark.unit
@pytest.mark.asyncio
async def test_initiate_paystack_no_student_profile(
    async_client: AsyncClient,
    override_current_user_no_profile,
):
    """Student without profile cannot initiate payment."""
    response = await async_client.post(
        f"{BASE}/topup/paystack",
        headers={"Authorization": "Bearer fake-token"},
        json={"amount": 10000},
    )
    assert response.status_code == 400
    assert "Student profile not found" in response.json()["detail"]


# ──────────────────────────────────────────────────────────────
# GET /payment/verify/{reference}
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_verify_payment_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Successful payment verification returns transaction data."""
    mock_verification = {
        "status": "success",
        "amount": 10000,
        "reference": "ref_abc123",
    }

    with patch("app.api.v1.student.wallet.WalletService") as MockService:
        instance = MockService.return_value
        instance.verify_paystack_payment = AsyncMock(return_value=mock_verification)

        response = await async_client.get(
            f"{BASE}/payment/verify/ref_abc123",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"


@pytest.mark.unit
@pytest.mark.asyncio
async def test_verify_payment_not_found(
    async_client: AsyncClient,
    override_current_user,
):
    """Unknown payment reference returns 404."""
    with patch("app.api.v1.student.wallet.WalletService") as MockService:
        instance = MockService.return_value
        instance.verify_paystack_payment = AsyncMock(
            side_effect=ValueError("Payment not found")
        )

        response = await async_client.get(
            f"{BASE}/payment/verify/ref_unknown",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 404


# ──────────────────────────────────────────────────────────────
# GET /subscription
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_subscription_info_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student retrieves their subscription information."""
    mock_sub = {
        "plan": "premium",
        "status": "active",
        "expires_at": "2026-12-31T23:59:59",
    }

    with patch("app.api.v1.student.wallet.WalletService") as MockService:
        instance = MockService.return_value
        instance.get_subscription_info = AsyncMock(return_value=mock_sub)

        response = await async_client.get(
            f"{BASE}/subscription",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["plan"] == "premium"
    assert data["status"] == "active"


# ──────────────────────────────────────────────────────────────
# GET /ai-advisor
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_ai_fund_advisor_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student receives AI-powered financial advice."""
    mock_advice = {
        "recommendations": ["Save 500 KES per month for textbooks"],
        "spending_summary": {"courses": 2000, "materials": 500},
    }

    with patch("app.api.v1.student.wallet.WalletService") as MockService:
        instance = MockService.return_value
        instance.get_ai_fund_advisor = AsyncMock(return_value=mock_advice)

        response = await async_client.get(
            f"{BASE}/ai-advisor",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
