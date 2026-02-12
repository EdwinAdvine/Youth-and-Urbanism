"""
Payment Service Tests

Tests for payment service business logic:
- M-Pesa payment processing (OAuth, STK Push, callbacks)
- PayPal payment processing (order creation, capture, webhooks)
- Stripe payment processing (payment intents, confirmation, webhooks)
- Wallet operations (create, credit, debit, balance)
- Transaction management (create, update, history)

Coverage target: 85%+ (critical financial logic)
"""

import pytest
import uuid
from unittest.mock import patch, MagicMock, AsyncMock
from decimal import Decimal
from datetime import datetime

from app.services.payment_service import PaymentService
from app.models.payment import Payment, Wallet, WalletTransaction
from tests.factories import UserFactory


@pytest.mark.unit
class TestMPesaPaymentService:
    """Test M-Pesa payment service methods."""

    @patch("app.services.payment_service.requests.get")
    async def test_get_mpesa_access_token_success(self, mock_get, db_session):
        """Test successful M-Pesa OAuth token retrieval."""
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {"access_token": "test-token-123"}
        )

        service = PaymentService(db_session)
        token = await service._get_mpesa_access_token()

        assert token == "test-token-123"
        mock_get.assert_called_once()

    async def test_get_mpesa_access_token_missing_credentials(self, db_session):
        """Test M-Pesa token retrieval fails with missing credentials."""
        with patch("app.config.settings.mpesa_consumer_key", None):
            service = PaymentService(db_session)
            token = await service._get_mpesa_access_token()

            assert token is None

    def test_generate_mpesa_password(self, db_session):
        """Test M-Pesa password generation."""
        service = PaymentService(db_session)
        timestamp = "20240101120000"

        password = service._generate_mpesa_password(timestamp)

        assert password is not None
        assert isinstance(password, str)
        # Password should be base64 encoded
        assert len(password) > 0

    @patch("app.services.payment_service.requests.post")
    @patch("app.services.payment_service.PaymentService._get_mpesa_access_token")
    async def test_initiate_mpesa_payment_success(
        self, mock_token, mock_post, db_session, test_user
    ):
        """Test successful M-Pesa STK Push initiation."""
        mock_token.return_value = "test-token"
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "ResponseCode": "0",
                "CheckoutRequestID": "ws_CO_12345",
                "MerchantRequestID": "mr_12345",
                "ResponseDescription": "Success"
            }
        )

        service = PaymentService(db_session)
        result = await service.initiate_mpesa_payment(
            phone_number="254712345678",
            amount=1000.0,
            user_id=test_user.id,
            description="Test payment"
        )

        assert result["success"] is True
        assert "payment_id" in result["data"]
        assert result["data"]["amount"] == 1000.0
        assert result["data"]["phone_number"] == "254712345678"

    async def test_initiate_mpesa_payment_missing_config(self, db_session, test_user):
        """Test M-Pesa payment fails with missing configuration."""
        with patch("app.config.settings.mpesa_consumer_key", None):
            service = PaymentService(db_session)
            result = await service.initiate_mpesa_payment(
                phone_number="254712345678",
                amount=1000.0,
                user_id=test_user.id
            )

            assert result["success"] is False
            assert "configuration incomplete" in result["error"].lower()

    @patch("app.services.payment_service.requests.post")
    @patch("app.services.payment_service.PaymentService._get_mpesa_access_token")
    async def test_verify_mpesa_payment_success(
        self, mock_token, mock_post, db_session, test_user
    ):
        """Test successful M-Pesa payment verification."""
        # Create a pending payment
        payment = Payment(
            user_id=test_user.id,
            gateway="mpesa",
            transaction_id="ws_CO_12345",
            reference_number="TUHS-TEST-123",
            amount=Decimal("1000.00"),
            currency="KES",
            status="pending"
        )
        db_session.add(payment)
        await db_session.commit()

        mock_token.return_value = "test-token"
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "ResultCode": "0",
                "ResultDesc": "The service request is processed successfully."
            }
        )

        service = PaymentService(db_session)
        result = await service.verify_mpesa_payment("TUHS-TEST-123")

        assert result["success"] is True
        assert result["data"]["status"] == "completed"

    async def test_verify_mpesa_payment_not_found(self, db_session):
        """Test M-Pesa verification fails for non-existent payment."""
        service = PaymentService(db_session)
        result = await service.verify_mpesa_payment("NON-EXISTENT")

        assert result["success"] is False
        assert "not found" in result["error"].lower()

    async def test_handle_mpesa_callback_success(self, db_session, test_user):
        """Test successful M-Pesa callback processing."""
        # Create a pending payment
        payment = Payment(
            user_id=test_user.id,
            gateway="mpesa",
            transaction_id="ws_CO_12345",
            reference_number="TUHS-TEST-123",
            amount=Decimal("1000.00"),
            currency="KES",
            status="pending"
        )
        db_session.add(payment)
        await db_session.commit()

        callback_data = {
            "Body": {
                "stkCallback": {
                    "CheckoutRequestID": "ws_CO_12345",
                    "ResultCode": 0,
                    "ResultDesc": "Success",
                    "CallbackMetadata": {
                        "Item": [
                            {"Name": "Amount", "Value": 1000.0},
                            {"Name": "MpesaReceiptNumber", "Value": "ABC123"}
                        ]
                    }
                }
            }
        }

        service = PaymentService(db_session)
        result = await service.handle_mpesa_callback(callback_data)

        assert result["success"] is True
        assert result["data"]["status"] == "completed"

    async def test_handle_mpesa_callback_payment_failed(self, db_session, test_user):
        """Test M-Pesa callback for failed payment."""
        payment = Payment(
            user_id=test_user.id,
            gateway="mpesa",
            transaction_id="ws_CO_12345",
            reference_number="TUHS-TEST-123",
            amount=Decimal("1000.00"),
            currency="KES",
            status="pending"
        )
        db_session.add(payment)
        await db_session.commit()

        callback_data = {
            "Body": {
                "stkCallback": {
                    "CheckoutRequestID": "ws_CO_12345",
                    "ResultCode": 1032,
                    "ResultDesc": "Request cancelled by user"
                }
            }
        }

        service = PaymentService(db_session)
        result = await service.handle_mpesa_callback(callback_data)

        assert result["success"] is True
        assert result["data"]["status"] == "failed"


@pytest.mark.unit
class TestPayPalPaymentService:
    """Test PayPal payment service methods."""

    @patch("app.services.payment_service.PayPalPayment")
    async def test_initiate_paypal_payment_success(
        self, mock_paypal, db_session, test_user
    ):
        """Test successful PayPal payment initiation."""
        mock_payment = MagicMock()
        mock_payment.id = "PAYPAL-123"
        mock_payment.create_time = "2024-01-01T12:00:00Z"
        mock_payment.create.return_value = True
        mock_payment.links = [
            MagicMock(rel="approval_url", href="https://paypal.com/approve")
        ]
        mock_payment.to_dict.return_value = {"id": "PAYPAL-123"}
        mock_paypal.return_value = mock_payment

        service = PaymentService(db_session)
        result = await service.initiate_paypal_payment(
            amount=50.0,
            user_id=test_user.id,
            description="Test payment",
            currency="USD"
        )

        assert result["success"] is True
        assert "approval_url" in result["data"]
        assert result["data"]["amount"] == 50.0
        assert result["data"]["currency"] == "USD"

    async def test_initiate_paypal_payment_missing_config(self, db_session, test_user):
        """Test PayPal payment fails with missing configuration."""
        with patch("app.config.settings.paypal_client_id", None):
            service = PaymentService(db_session)
            result = await service.initiate_paypal_payment(
                amount=50.0,
                user_id=test_user.id
            )

            assert result["success"] is False
            assert "configuration incomplete" in result["error"].lower()

    @patch("app.services.payment_service.PayPalPayment")
    async def test_capture_paypal_payment_success(
        self, mock_paypal_class, db_session, test_user
    ):
        """Test successful PayPal payment capture."""
        # Create a pending PayPal payment
        payment = Payment(
            user_id=test_user.id,
            gateway="paypal",
            transaction_id="PAYPAL-123",
            reference_number="TUHS-PP-123",
            amount=Decimal("50.00"),
            currency="USD",
            status="pending"
        )
        db_session.add(payment)
        await db_session.commit()

        mock_payment = MagicMock()
        mock_payment.payer.payer_info.payer_id = "PAYER-123"
        mock_payment.execute.return_value = True
        mock_payment.to_dict.return_value = {"id": "PAYPAL-123", "state": "approved"}
        mock_paypal_class.find.return_value = mock_payment

        service = PaymentService(db_session)
        result = await service.capture_paypal_payment("PAYPAL-123")

        assert result["success"] is True
        assert result["data"]["status"] == "completed"

    async def test_capture_paypal_payment_not_found(self, db_session):
        """Test PayPal capture fails for non-existent payment."""
        service = PaymentService(db_session)
        result = await service.capture_paypal_payment("NON-EXISTENT")

        assert result["success"] is False
        assert "not found" in result["error"].lower()

    async def test_handle_paypal_webhook_payment_completed(
        self, db_session, test_user
    ):
        """Test PayPal webhook for completed payment."""
        payment = Payment(
            user_id=test_user.id,
            gateway="paypal",
            transaction_id="PAYPAL-123",
            reference_number="TUHS-PP-123",
            amount=Decimal("50.00"),
            currency="USD",
            status="pending"
        )
        db_session.add(payment)
        await db_session.commit()

        webhook_data = {
            "event_type": "PAYMENT.SALE.COMPLETED",
            "resource": {
                "parent_payment": "PAYPAL-123",
                "amount": {"total": "50.00", "currency": "USD"}
            }
        }

        service = PaymentService(db_session)
        result = await service.handle_paypal_webhook(webhook_data)

        assert result["success"] is True
        assert result["data"]["event_type"] == "PAYMENT.SALE.COMPLETED"

    async def test_handle_paypal_webhook_payment_refunded(
        self, db_session, test_user
    ):
        """Test PayPal webhook for refunded payment."""
        payment = Payment(
            user_id=test_user.id,
            gateway="paypal",
            transaction_id="PAYPAL-123",
            reference_number="TUHS-PP-123",
            amount=Decimal("50.00"),
            currency="USD",
            status="completed"
        )
        db_session.add(payment)
        await db_session.commit()

        webhook_data = {
            "event_type": "PAYMENT.SALE.REFUNDED",
            "resource": {
                "parent_payment": "PAYPAL-123"
            }
        }

        service = PaymentService(db_session)
        result = await service.handle_paypal_webhook(webhook_data)

        assert result["success"] is True


@pytest.mark.unit
class TestStripePaymentService:
    """Test Stripe payment service methods."""

    @patch("app.services.payment_service.stripe.PaymentIntent.create")
    async def test_initiate_stripe_payment_success(
        self, mock_create, db_session, test_user
    ):
        """Test successful Stripe payment intent creation."""
        mock_intent = MagicMock()
        mock_intent.id = "pi_test_123"
        mock_intent.client_secret = "pi_test_123_secret"
        mock_intent.to_dict.return_value = {
            "id": "pi_test_123",
            "status": "requires_payment_method"
        }
        mock_create.return_value = mock_intent

        service = PaymentService(db_session)
        result = await service.initiate_stripe_payment(
            amount=100.0,
            user_id=test_user.id,
            description="Test payment",
            currency="usd"
        )

        assert result["success"] is True
        assert result["data"]["payment_intent_id"] == "pi_test_123"
        assert "client_secret" in result["data"]

    async def test_initiate_stripe_payment_missing_config(self, db_session, test_user):
        """Test Stripe payment fails with missing configuration."""
        with patch("app.config.settings.stripe_secret_key", None):
            service = PaymentService(db_session)
            result = await service.initiate_stripe_payment(
                amount=100.0,
                user_id=test_user.id
            )

            assert result["success"] is False
            assert "configuration incomplete" in result["error"].lower()

    @patch("app.services.payment_service.stripe.PaymentIntent.retrieve")
    async def test_confirm_stripe_payment_success(
        self, mock_retrieve, db_session, test_user
    ):
        """Test successful Stripe payment confirmation."""
        # Create a pending Stripe payment
        payment = Payment(
            user_id=test_user.id,
            gateway="stripe",
            transaction_id="pi_test_123",
            reference_number="TUHS-ST-123",
            amount=Decimal("100.00"),
            currency="USD",
            status="pending"
        )
        db_session.add(payment)
        await db_session.commit()

        mock_intent = MagicMock()
        mock_intent.status = "succeeded"
        mock_intent.to_dict.return_value = {"id": "pi_test_123", "status": "succeeded"}
        mock_retrieve.return_value = mock_intent

        service = PaymentService(db_session)
        result = await service.confirm_stripe_payment("pi_test_123")

        assert result["success"] is True
        assert result["data"]["status"] == "completed"

    async def test_confirm_stripe_payment_not_found(self, db_session):
        """Test Stripe confirmation fails for non-existent payment."""
        service = PaymentService(db_session)
        result = await service.confirm_stripe_payment("pi_non_existent")

        assert result["success"] is False
        assert "not found" in result["error"].lower()

    @patch("app.services.payment_service.stripe.Webhook.construct_event")
    async def test_handle_stripe_webhook_payment_succeeded(
        self, mock_construct, db_session, test_user
    ):
        """Test Stripe webhook for successful payment."""
        payment = Payment(
            user_id=test_user.id,
            gateway="stripe",
            transaction_id="pi_test_123",
            reference_number="TUHS-ST-123",
            amount=Decimal("100.00"),
            currency="USD",
            status="pending"
        )
        db_session.add(payment)
        await db_session.commit()

        webhook_event = {
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_test_123",
                    "status": "succeeded",
                    "amount": 10000
                }
            }
        }
        mock_construct.return_value = webhook_event

        service = PaymentService(db_session)
        result = await service.handle_stripe_webhook(
            webhook_data=webhook_event,
            signature="test-signature"
        )

        assert result["success"] is True
        assert result["data"]["event_type"] == "payment_intent.succeeded"

    @patch("app.services.payment_service.stripe.Webhook.construct_event")
    async def test_handle_stripe_webhook_invalid_signature(
        self, mock_construct, db_session
    ):
        """Test Stripe webhook with invalid signature."""
        from stripe.error import SignatureVerificationError

        mock_construct.side_effect = SignatureVerificationError(
            "Invalid signature",
            sig_header="invalid"
        )

        service = PaymentService(db_session)
        result = await service.handle_stripe_webhook(
            webhook_data={},
            signature="invalid-signature"
        )

        assert result["success"] is False
        assert "invalid signature" in result["error"].lower()

    async def test_handle_stripe_webhook_missing_secret(self, db_session):
        """Test Stripe webhook fails without webhook secret."""
        with patch("app.config.settings.stripe_webhook_secret", None):
            service = PaymentService(db_session)
            result = await service.handle_stripe_webhook(
                webhook_data={},
                signature="test-sig"
            )

            assert result["success"] is False
            assert "not configured" in result["error"].lower()


@pytest.mark.unit
class TestWalletService:
    """Test wallet service methods."""

    async def test_get_wallet_creates_new(self, db_session, test_user):
        """Test wallet creation for new user."""
        service = PaymentService(db_session)
        result = await service.get_wallet(test_user.id)

        assert result["success"] is True
        assert result["data"]["user_id"] == str(test_user.id)
        assert result["data"]["balance"] == 0.0
        assert result["data"]["currency"] == "KES"

    async def test_get_wallet_returns_existing(self, db_session, test_user):
        """Test returning existing wallet."""
        # Create a wallet first
        wallet = Wallet(
            user_id=test_user.id,
            balance=Decimal("100.00"),
            currency="KES"
        )
        db_session.add(wallet)
        await db_session.commit()

        service = PaymentService(db_session)
        result = await service.get_wallet(test_user.id)

        assert result["success"] is True
        assert result["data"]["balance"] == 100.0

    async def test_add_funds_success(self, db_session, test_user):
        """Test successful wallet credit."""
        service = PaymentService(db_session)
        result = await service.add_funds(
            user_id=test_user.id,
            amount=500.0,
            transaction_id=str(uuid.uuid4()),
            description="Test credit"
        )

        assert result["success"] is True
        assert result["data"]["amount_added"] == 500.0
        assert result["data"]["new_balance"] == 500.0

    async def test_add_funds_invalid_amount(self, db_session, test_user):
        """Test wallet credit fails with negative amount."""
        service = PaymentService(db_session)
        result = await service.add_funds(
            user_id=test_user.id,
            amount=-100.0,
            transaction_id=str(uuid.uuid4())
        )

        assert result["success"] is False
        assert "positive" in result["error"].lower()

    async def test_deduct_funds_success(self, db_session, test_user):
        """Test successful wallet debit."""
        # Add funds first
        service = PaymentService(db_session)
        await service.add_funds(
            user_id=test_user.id,
            amount=1000.0,
            transaction_id=str(uuid.uuid4())
        )

        # Deduct funds
        result = await service.deduct_funds(
            user_id=test_user.id,
            amount=300.0,
            transaction_id=str(uuid.uuid4()),
            description="Test debit"
        )

        assert result["success"] is True
        assert result["data"]["amount_deducted"] == 300.0
        assert result["data"]["new_balance"] == 700.0

    async def test_deduct_funds_insufficient_balance(self, db_session, test_user):
        """Test wallet debit fails with insufficient balance."""
        service = PaymentService(db_session)
        result = await service.deduct_funds(
            user_id=test_user.id,
            amount=5000.0,
            transaction_id=str(uuid.uuid4())
        )

        assert result["success"] is False
        assert "insufficient balance" in result["error"].lower()

    async def test_get_balance_success(self, db_session, test_user):
        """Test getting wallet balance."""
        # Add funds
        service = PaymentService(db_session)
        await service.add_funds(
            user_id=test_user.id,
            amount=750.0,
            transaction_id=str(uuid.uuid4())
        )

        result = await service.get_balance(test_user.id)

        assert result["success"] is True
        assert result["data"]["balance"] == 750.0
        assert result["data"]["currency"] == "KES"


@pytest.mark.unit
class TestTransactionService:
    """Test transaction service methods."""

    async def test_create_transaction_success(self, db_session, test_user):
        """Test creating payment transaction record."""
        service = PaymentService(db_session)
        result = await service.create_transaction(
            user_id=test_user.id,
            amount=2500.0,
            gateway="mpesa",
            description="Test transaction"
        )

        assert result["success"] is True
        assert "payment_id" in result["data"]
        assert result["data"]["amount"] == 2500.0
        assert result["data"]["gateway"] == "mpesa"
        assert result["data"]["status"] == "pending"

    async def test_update_transaction_status_success(self, db_session, test_user):
        """Test updating transaction status."""
        # Create transaction
        service = PaymentService(db_session)
        create_result = await service.create_transaction(
            user_id=test_user.id,
            amount=1500.0,
            gateway="stripe"
        )

        payment_id = uuid.UUID(create_result["data"]["payment_id"])

        # Update status
        result = await service.update_transaction_status(
            transaction_id=payment_id,
            status="completed"
        )

        assert result["success"] is True
        assert result["data"]["new_status"] == "completed"
        assert result["data"]["old_status"] == "pending"

    async def test_update_transaction_status_not_found(self, db_session):
        """Test update fails for non-existent transaction."""
        service = PaymentService(db_session)
        result = await service.update_transaction_status(
            transaction_id=uuid.uuid4(),
            status="completed"
        )

        assert result["success"] is False
        assert "not found" in result["error"].lower()

    async def test_get_transaction_history_success(self, db_session, test_user):
        """Test retrieving user transaction history."""
        # Create multiple transactions
        service = PaymentService(db_session)
        for i in range(3):
            await service.create_transaction(
                user_id=test_user.id,
                amount=1000.0 * (i + 1),
                gateway="mpesa",
                description=f"Transaction {i + 1}"
            )

        result = await service.get_transaction_history(
            user_id=test_user.id,
            limit=10
        )

        assert result["success"] is True
        assert len(result["data"]["transactions"]) == 3
        assert result["data"]["count"] == 3

    async def test_get_transaction_history_pagination(self, db_session, test_user):
        """Test transaction history pagination."""
        # Create 5 transactions
        service = PaymentService(db_session)
        for i in range(5):
            await service.create_transaction(
                user_id=test_user.id,
                amount=500.0,
                gateway="mpesa"
            )

        # Get first 2
        result = await service.get_transaction_history(
            user_id=test_user.id,
            limit=2,
            offset=0
        )

        assert result["success"] is True
        assert len(result["data"]["transactions"]) == 2
        assert result["data"]["limit"] == 2
        assert result["data"]["offset"] == 0

    async def test_get_transaction_history_empty(self, db_session, test_user):
        """Test transaction history for user with no transactions."""
        service = PaymentService(db_session)
        result = await service.get_transaction_history(test_user.id)

        assert result["success"] is True
        assert result["data"]["count"] == 0
        assert result["data"]["transactions"] == []


# Target: 85%+ coverage for payment_service.py
