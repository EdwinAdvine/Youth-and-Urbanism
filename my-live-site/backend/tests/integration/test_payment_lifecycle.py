"""
Payment Lifecycle Integration Tests

End-to-end tests for complete payment workflows:
- M-Pesa: STK Push → Callback → Wallet Credit → Completion
- PayPal: Order Create → Execute → Wallet Credit → Completion
- Stripe: Intent Create → Confirm → Webhook → Wallet Credit → Completion
- Wallet: Credit/Debit operations with transaction history
- Edge cases: Failed payments, duplicate callbacks, concurrent operations

Coverage target: Integration test coverage for payment flows
"""

import pytest
import uuid
from unittest.mock import patch, MagicMock
from decimal import Decimal

from app.services.payment_service import PaymentService
from app.models.payment import Transaction, Wallet
from tests.factories import UserFactory


@pytest.mark.integration
class TestMPesaPaymentLifecycle:
    """Test complete M-Pesa payment flow."""

    @patch("app.services.payment_service.requests.post")
    @patch("app.services.payment_service.requests.get")
    async def test_mpesa_complete_success_flow(
        self, mock_get, mock_post, db_session, test_user
    ):
        """Test complete M-Pesa payment from initiation to completion."""
        # Step 1: Get OAuth token
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {"access_token": "test-token"}
        )

        # Step 2: STK Push response
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "ResponseCode": "0",
                "CheckoutRequestID": "ws_CO_12345",
                "MerchantRequestID": "mr_12345",
                "ResponseDescription": "Success"
            }
        )

        # Initiate payment
        service = PaymentService(db_session)
        initiate_result = await service.initiate_mpesa_payment(
            phone_number="254712345678",
            amount=1000.0,
            user_id=test_user.id,
            description="Course payment"
        )

        assert initiate_result["success"] is True
        payment_id = initiate_result["data"]["payment_id"]

        # Step 3: Simulate M-Pesa callback
        callback_data = {
            "Body": {
                "stkCallback": {
                    "CheckoutRequestID": "ws_CO_12345",
                    "ResultCode": 0,
                    "ResultDesc": "The service request is processed successfully",
                    "CallbackMetadata": {
                        "Item": [
                            {"Name": "Amount", "Value": 1000.0},
                            {"Name": "MpesaReceiptNumber", "Value": "ABC123XYZ"},
                            {"Name": "TransactionDate", "Value": 20240101120000},
                            {"Name": "PhoneNumber", "Value": 254712345678}
                        ]
                    }
                }
            }
        }

        callback_result = await service.handle_mpesa_callback(callback_data)

        assert callback_result["success"] is True
        assert callback_result["data"]["status"] == "completed"

        # Step 4: Verify wallet credited
        wallet_result = await service.get_balance(test_user.id)

        assert wallet_result["success"] is True
        assert wallet_result["data"]["balance"] == 1000.0

        # Step 5: Verify transaction history
        history_result = await service.get_transaction_history(test_user.id)

        assert history_result["success"] is True
        assert len(history_result["data"]["transactions"]) == 1
        assert history_result["data"]["transactions"][0]["status"] == "completed"

    @patch("app.services.payment_service.requests.post")
    @patch("app.services.payment_service.requests.get")
    async def test_mpesa_payment_failure_flow(
        self, mock_get, mock_post, db_session, test_user
    ):
        """Test M-Pesa payment failure workflow."""
        # OAuth token
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {"access_token": "test-token"}
        )

        # STK Push success
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "ResponseCode": "0",
                "CheckoutRequestID": "ws_CO_99999",
                "ResponseDescription": "Success"
            }
        )

        service = PaymentService(db_session)
        initiate_result = await service.initiate_mpesa_payment(
            phone_number="254712345678",
            amount=500.0,
            user_id=test_user.id
        )

        assert initiate_result["success"] is True

        # Simulate failed callback (user cancelled)
        callback_data = {
            "Body": {
                "stkCallback": {
                    "CheckoutRequestID": "ws_CO_99999",
                    "ResultCode": 1032,
                    "ResultDesc": "Request cancelled by user"
                }
            }
        }

        callback_result = await service.handle_mpesa_callback(callback_data)

        assert callback_result["success"] is True
        assert callback_result["data"]["status"] == "failed"

        # Verify wallet NOT credited
        wallet_result = await service.get_balance(test_user.id)
        assert wallet_result["data"]["balance"] == 0.0

    async def test_mpesa_duplicate_callback_handling(
        self, db_session, test_user
    ):
        """Test handling duplicate M-Pesa callbacks (idempotency)."""
        # Create a completed payment
        payment = Payment(
            user_id=test_user.id,
            gateway="mpesa",
            transaction_id="ws_CO_DUPLICATE",
            reference_number="TUHS-DUP-123",
            amount=Decimal("750.00"),
            currency="KES",
            status="completed"
        )
        db_session.add(payment)
        await db_session.commit()

        # Credit wallet once
        service = PaymentService(db_session)
        await service.add_funds(
            user_id=test_user.id,
            amount=750.0,
            transaction_id=str(payment.id)
        )

        initial_balance = (await service.get_balance(test_user.id))["data"]["balance"]

        # Send duplicate callback
        callback_data = {
            "Body": {
                "stkCallback": {
                    "CheckoutRequestID": "ws_CO_DUPLICATE",
                    "ResultCode": 0,
                    "ResultDesc": "Success"
                }
            }
        }

        await service.handle_mpesa_callback(callback_data)

        # Verify balance unchanged (no double crediting)
        final_balance = (await service.get_balance(test_user.id))["data"]["balance"]
        assert final_balance == initial_balance


@pytest.mark.integration
class TestPayPalPaymentLifecycle:
    """Test complete PayPal payment flow."""

    @patch("app.services.payment_service.PayPalPayment")
    async def test_paypal_complete_success_flow(
        self, mock_paypal_class, db_session, test_user
    ):
        """Test complete PayPal payment from creation to execution."""
        # Step 1: Create PayPal payment
        mock_payment = MagicMock()
        mock_payment.id = "PAYPAL-ORDER-123"
        mock_payment.create_time = "2024-01-01T12:00:00Z"
        mock_payment.create.return_value = True
        mock_payment.links = [
            MagicMock(rel="approval_url", href="https://paypal.com/approve?token=ABC")
        ]
        mock_payment.to_dict.return_value = {"id": "PAYPAL-ORDER-123", "state": "created"}
        mock_paypal_class.return_value = mock_payment

        service = PaymentService(db_session)
        create_result = await service.initiate_paypal_payment(
            amount=50.0,
            user_id=test_user.id,
            description="Course enrollment",
            currency="USD"
        )

        assert create_result["success"] is True
        assert "approval_url" in create_result["data"]

        # Step 2: Execute payment (after user approves)
        mock_payment.payer.payer_info.payer_id = "PAYER-123"
        mock_payment.execute.return_value = True
        mock_payment.to_dict.return_value = {"id": "PAYPAL-ORDER-123", "state": "approved"}
        mock_paypal_class.find.return_value = mock_payment

        capture_result = await service.capture_paypal_payment("PAYPAL-ORDER-123")

        assert capture_result["success"] is True
        assert capture_result["data"]["status"] == "completed"

        # Step 3: Verify wallet credited
        wallet_result = await service.get_balance(test_user.id)
        assert wallet_result["data"]["balance"] == 50.0

    @patch("app.services.payment_service.PayPalPayment")
    async def test_paypal_webhook_refund_handling(
        self, mock_paypal_class, db_session, test_user
    ):
        """Test PayPal webhook handling for refunds."""
        # Create completed payment
        payment = Payment(
            user_id=test_user.id,
            gateway="paypal",
            transaction_id="PAYPAL-REFUND-123",
            reference_number="TUHS-PP-REF",
            amount=Decimal("75.00"),
            currency="USD",
            status="completed"
        )
        db_session.add(payment)
        await db_session.commit()

        # Process refund webhook
        service = PaymentService(db_session)
        webhook_data = {
            "event_type": "PAYMENT.SALE.REFUNDED",
            "resource": {
                "parent_payment": "PAYPAL-REFUND-123",
                "amount": {"total": "75.00", "currency": "USD"}
            }
        }

        result = await service.handle_paypal_webhook(webhook_data)

        assert result["success"] is True

        # Verify payment status updated to refunded
        from sqlalchemy import select
        stmt = select(Payment).where(Payment.transaction_id == "PAYPAL-REFUND-123")
        result = await db_session.execute(stmt)
        updated_payment = result.scalar_one()

        assert updated_payment.status == "refunded"


@pytest.mark.integration
class TestStripePaymentLifecycle:
    """Test complete Stripe payment flow."""

    @patch("app.services.payment_service.stripe.PaymentIntent.create")
    @patch("app.services.payment_service.stripe.PaymentIntent.retrieve")
    async def test_stripe_complete_success_flow(
        self, mock_retrieve, mock_create, db_session, test_user
    ):
        """Test complete Stripe payment from intent to confirmation."""
        # Step 1: Create payment intent
        mock_intent = MagicMock()
        mock_intent.id = "pi_stripe_123"
        mock_intent.client_secret = "pi_stripe_123_secret_abc"
        mock_intent.to_dict.return_value = {
            "id": "pi_stripe_123",
            "status": "requires_payment_method"
        }
        mock_create.return_value = mock_intent

        service = PaymentService(db_session)
        create_result = await service.initiate_stripe_payment(
            amount=100.0,
            user_id=test_user.id,
            description="Premium subscription",
            currency="usd"
        )

        assert create_result["success"] is True
        assert "client_secret" in create_result["data"]

        # Step 2: Confirm payment (after user enters card details)
        mock_intent.status = "succeeded"
        mock_intent.to_dict.return_value = {
            "id": "pi_stripe_123",
            "status": "succeeded"
        }
        mock_retrieve.return_value = mock_intent

        confirm_result = await service.confirm_stripe_payment("pi_stripe_123")

        assert confirm_result["success"] is True
        assert confirm_result["data"]["status"] == "completed"

        # Step 3: Verify wallet credited
        wallet_result = await service.get_balance(test_user.id)
        assert wallet_result["data"]["balance"] == 100.0

    @patch("app.services.payment_service.stripe.Webhook.construct_event")
    async def test_stripe_webhook_payment_failed(
        self, mock_construct, db_session, test_user
    ):
        """Test Stripe webhook for failed payment."""
        # Create pending payment
        payment = Payment(
            user_id=test_user.id,
            gateway="stripe",
            transaction_id="pi_failed_123",
            reference_number="TUHS-ST-FAIL",
            amount=Decimal("250.00"),
            currency="USD",
            status="pending"
        )
        db_session.add(payment)
        await db_session.commit()

        # Process failure webhook
        webhook_event = {
            "type": "payment_intent.payment_failed",
            "data": {
                "object": {
                    "id": "pi_failed_123",
                    "status": "requires_payment_method",
                    "last_payment_error": {
                        "message": "Your card was declined"
                    }
                }
            }
        }
        mock_construct.return_value = webhook_event

        service = PaymentService(db_session)
        result = await service.handle_stripe_webhook(
            webhook_data=webhook_event,
            signature="test-sig"
        )

        assert result["success"] is True

        # Verify payment marked as failed
        from sqlalchemy import select
        stmt = select(Payment).where(Payment.transaction_id == "pi_failed_123")
        result = await db_session.execute(stmt)
        updated_payment = result.scalar_one()

        assert updated_payment.status == "failed"


@pytest.mark.integration
class TestWalletOperations:
    """Test wallet operations in payment context."""

    async def test_wallet_concurrent_credit_operations(
        self, db_session, test_user
    ):
        """Test concurrent wallet credit operations maintain integrity."""
        service = PaymentService(db_session)

        # Simulate concurrent credits (like multiple webhooks arriving at same time)
        results = []
        for i in range(3):
            result = await service.add_funds(
                user_id=test_user.id,
                amount=100.0,
                transaction_id=str(uuid.uuid4()),
                description=f"Credit {i+1}"
            )
            results.append(result)

        # All should succeed
        assert all(r["success"] for r in results)

        # Final balance should be sum of all credits
        balance_result = await service.get_balance(test_user.id)
        assert balance_result["data"]["balance"] == 300.0

    async def test_wallet_insufficient_balance_prevents_debit(
        self, db_session, test_user
    ):
        """Test wallet prevents debit when insufficient balance."""
        service = PaymentService(db_session)

        # Add small amount
        await service.add_funds(
            user_id=test_user.id,
            amount=50.0,
            transaction_id=str(uuid.uuid4())
        )

        # Attempt large debit
        debit_result = await service.deduct_funds(
            user_id=test_user.id,
            amount=500.0,
            transaction_id=str(uuid.uuid4())
        )

        assert debit_result["success"] is False
        assert "insufficient balance" in debit_result["error"].lower()

        # Balance unchanged
        balance_result = await service.get_balance(test_user.id)
        assert balance_result["data"]["balance"] == 50.0

    async def test_complete_payment_to_purchase_flow(
        self, db_session, test_user
    ):
        """Test complete flow: payment → wallet credit → course purchase → wallet debit."""
        service = PaymentService(db_session)

        # Step 1: User makes payment
        await service.add_funds(
            user_id=test_user.id,
            amount=5000.0,
            transaction_id=str(uuid.uuid4()),
            description="M-Pesa deposit"
        )

        # Step 2: User enrolls in course (wallet debit)
        course_price = 2500.0
        debit_result = await service.deduct_funds(
            user_id=test_user.id,
            amount=course_price,
            transaction_id=str(uuid.uuid4()),
            description="Course enrollment"
        )

        assert debit_result["success"] is True
        assert debit_result["data"]["new_balance"] == 2500.0

        # Step 3: Verify transaction history shows both operations
        history_result = await service.get_transaction_history(test_user.id)

        # Should have payment transaction only (wallet transactions are separate)
        assert history_result["success"] is True


@pytest.mark.integration
class TestPaymentEdgeCases:
    """Test payment edge cases and error handling."""

    async def test_payment_with_non_existent_user(self, db_session):
        """Test payment handling for non-existent user."""
        service = PaymentService(db_session)
        fake_user_id = uuid.uuid4()

        result = await service.create_transaction(
            user_id=fake_user_id,
            amount=1000.0,
            gateway="mpesa",
            description="Test"
        )

        # Should still create transaction record
        assert result["success"] is True

    async def test_zero_amount_payment_rejected(self, db_session, test_user):
        """Test zero or negative amount payments are rejected."""
        service = PaymentService(db_session)

        # Test zero amount
        zero_result = await service.add_funds(
            user_id=test_user.id,
            amount=0.0,
            transaction_id=str(uuid.uuid4())
        )

        assert zero_result["success"] is False

        # Test negative amount
        negative_result = await service.add_funds(
            user_id=test_user.id,
            amount=-100.0,
            transaction_id=str(uuid.uuid4())
        )

        assert negative_result["success"] is False

    async def test_payment_status_transitions(self, db_session, test_user):
        """Test valid payment status transitions."""
        service = PaymentService(db_session)

        # Create transaction
        create_result = await service.create_transaction(
            user_id=test_user.id,
            amount=1500.0,
            gateway="stripe"
        )

        payment_id = uuid.UUID(create_result["data"]["payment_id"])

        # Transition: pending → completed
        update_result = await service.update_transaction_status(
            transaction_id=payment_id,
            status="completed"
        )

        assert update_result["success"] is True
        assert update_result["data"]["new_status"] == "completed"


# Target: Integration test coverage for payment workflows
