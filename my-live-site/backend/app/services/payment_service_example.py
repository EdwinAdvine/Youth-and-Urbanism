"""
Example usage of PaymentService.

This file demonstrates how to use the PaymentService class for:
- M-Pesa payments (STK Push)
- PayPal payments
- Stripe payments
- Wallet management
- Transaction tracking
"""

import asyncio
import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db, init_db, DatabaseSession
from app.services.payment_service import PaymentService


async def example_mpesa_payment():
    """Example: Initiate M-Pesa STK Push payment."""
    async with DatabaseSession() as db:
        payment_service = PaymentService(db)

        # Example user ID (replace with actual user ID)
        user_id = uuid.uuid4()

        # Initiate M-Pesa payment
        result = await payment_service.initiate_mpesa_payment(
            phone_number="254712345678",  # Kenyan phone number
            amount=1000.00,  # KES 1000
            user_id=user_id,
            description="Course enrollment payment",
            course_id=uuid.uuid4()  # Optional course ID
        )

        if result["success"]:
            print(f"M-Pesa STK Push sent successfully!")
            print(f"Payment ID: {result['data']['payment_id']}")
            print(f"Transaction Ref: {result['data']['transaction_ref']}")
            print(f"Checkout Request ID: {result['data']['checkout_request_id']}")
            print(f"Amount: KES {result['data']['amount']}")

            # Wait for user to enter PIN and complete payment
            # Then verify payment status
            await asyncio.sleep(30)  # Wait 30 seconds

            verification = await payment_service.verify_mpesa_payment(
                transaction_ref=result['data']['transaction_ref']
            )

            if verification["success"]:
                print(f"Payment Status: {verification['data']['status']}")
        else:
            print(f"M-Pesa payment failed: {result['error']}")


async def example_stripe_payment():
    """Example: Create Stripe payment intent."""
    async with DatabaseSession() as db:
        payment_service = PaymentService(db)

        user_id = uuid.uuid4()

        # Initiate Stripe payment
        result = await payment_service.initiate_stripe_payment(
            amount=50.00,  # USD $50
            user_id=user_id,
            description="Course subscription",
            currency="usd"
        )

        if result["success"]:
            print(f"Stripe payment intent created!")
            print(f"Payment ID: {result['data']['payment_id']}")
            print(f"Client Secret: {result['data']['client_secret']}")
            print(f"Amount: {result['data']['currency'].upper()} {result['data']['amount']}")

            # In frontend, use client_secret with Stripe.js to collect payment
            # After payment, confirm it
            payment_intent_id = result['data']['payment_intent_id']

            confirmation = await payment_service.confirm_stripe_payment(
                payment_intent_id=payment_intent_id
            )

            if confirmation["success"]:
                print(f"Payment confirmed: {confirmation['data']['status']}")
        else:
            print(f"Stripe payment failed: {result['error']}")


async def example_paypal_payment():
    """Example: Create PayPal payment order."""
    async with DatabaseSession() as db:
        payment_service = PaymentService(db)

        user_id = uuid.uuid4()

        # Initiate PayPal payment
        result = await payment_service.initiate_paypal_payment(
            amount=75.00,  # USD $75
            user_id=user_id,
            description="Premium course package",
            currency="USD"
        )

        if result["success"]:
            print(f"PayPal order created!")
            print(f"Payment ID: {result['data']['payment_id']}")
            print(f"Approval URL: {result['data']['approval_url']}")
            print(f"Amount: {result['data']['currency']} {result['data']['amount']}")

            # Redirect user to approval_url to complete payment
            # After user approves, capture the payment
            order_id = result['data']['paypal_order_id']

            capture = await payment_service.capture_paypal_payment(
                order_id=order_id
            )

            if capture["success"]:
                print(f"Payment captured: {capture['data']['status']}")
        else:
            print(f"PayPal payment failed: {result['error']}")


async def example_wallet_operations():
    """Example: Wallet management operations."""
    async with DatabaseSession() as db:
        payment_service = PaymentService(db)

        user_id = uuid.uuid4()

        # Get or create wallet
        wallet_result = await payment_service.get_wallet(user_id)
        if wallet_result["success"]:
            print(f"Wallet ID: {wallet_result['data']['wallet_id']}")
            print(f"Balance: {wallet_result['data']['currency']} {wallet_result['data']['balance']}")

        # Add funds to wallet
        add_result = await payment_service.add_funds(
            user_id=user_id,
            amount=500.00,
            transaction_id=str(uuid.uuid4()),
            description="Top-up from M-Pesa"
        )

        if add_result["success"]:
            print(f"Added funds successfully!")
            print(f"Previous balance: {add_result['data']['previous_balance']}")
            print(f"Amount added: {add_result['data']['amount_added']}")
            print(f"New balance: {add_result['data']['new_balance']}")

        # Get current balance
        balance_result = await payment_service.get_balance(user_id)
        if balance_result["success"]:
            print(f"Current balance: {balance_result['data']['currency']} {balance_result['data']['balance']}")

        # Deduct funds from wallet
        deduct_result = await payment_service.deduct_funds(
            user_id=user_id,
            amount=100.00,
            transaction_id=str(uuid.uuid4()),
            description="Course enrollment payment"
        )

        if deduct_result["success"]:
            print(f"Deducted funds successfully!")
            print(f"Previous balance: {deduct_result['data']['previous_balance']}")
            print(f"Amount deducted: {deduct_result['data']['amount_deducted']}")
            print(f"New balance: {deduct_result['data']['new_balance']}")


async def example_transaction_history():
    """Example: Get transaction history."""
    async with DatabaseSession() as db:
        payment_service = PaymentService(db)

        user_id = uuid.uuid4()

        # Get transaction history
        history_result = await payment_service.get_transaction_history(
            user_id=user_id,
            limit=10,
            offset=0
        )

        if history_result["success"]:
            transactions = history_result['data']['transactions']
            print(f"Found {history_result['data']['count']} transactions")

            for txn in transactions:
                print(f"\nTransaction: {txn['transaction_ref']}")
                print(f"  Gateway: {txn['gateway']}")
                print(f"  Amount: {txn['currency']} {txn['amount']}")
                print(f"  Status: {txn['status']}")
                print(f"  Created: {txn['created_at']}")


async def example_webhook_handlers():
    """Example: Handle payment gateway webhooks."""
    async with DatabaseSession() as db:
        payment_service = PaymentService(db)

        # Example M-Pesa callback data
        mpesa_callback = {
            "Body": {
                "stkCallback": {
                    "CheckoutRequestID": "ws_CO_12345",
                    "ResultCode": 0,
                    "ResultDesc": "The service request is processed successfully.",
                    "CallbackMetadata": {
                        "Item": [
                            {"Name": "Amount", "Value": 1000.00},
                            {"Name": "MpesaReceiptNumber", "Value": "ABC123XYZ"},
                            {"Name": "PhoneNumber", "Value": "254712345678"}
                        ]
                    }
                }
            }
        }

        mpesa_result = await payment_service.handle_mpesa_callback(mpesa_callback)
        if mpesa_result["success"]:
            print(f"M-Pesa callback processed: {mpesa_result['data']}")

        # Example Stripe webhook (signature verification required in production)
        stripe_webhook = {
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_123456",
                    "amount": 5000,
                    "currency": "usd",
                    "status": "succeeded"
                }
            }
        }

        stripe_result = await payment_service.handle_stripe_webhook(
            webhook_data=stripe_webhook,
            signature="test_signature"  # In production, get from Stripe-Signature header
        )
        if stripe_result["success"]:
            print(f"Stripe webhook processed: {stripe_result['data']}")

        # Example PayPal webhook
        paypal_webhook = {
            "event_type": "PAYMENT.SALE.COMPLETED",
            "resource": {
                "parent_payment": "PAYID-123456",
                "state": "completed",
                "amount": {
                    "total": "75.00",
                    "currency": "USD"
                }
            }
        }

        paypal_result = await payment_service.handle_paypal_webhook(paypal_webhook)
        if paypal_result["success"]:
            print(f"PayPal webhook processed: {paypal_result['data']}")


async def main():
    """Run all examples."""
    # Initialize database connection
    await init_db()

    print("=" * 60)
    print("PaymentService Examples")
    print("=" * 60)

    # Uncomment the examples you want to run

    # print("\n1. M-Pesa Payment Example")
    # print("-" * 60)
    # await example_mpesa_payment()

    # print("\n2. Stripe Payment Example")
    # print("-" * 60)
    # await example_stripe_payment()

    # print("\n3. PayPal Payment Example")
    # print("-" * 60)
    # await example_paypal_payment()

    print("\n4. Wallet Operations Example")
    print("-" * 60)
    await example_wallet_operations()

    print("\n5. Transaction History Example")
    print("-" * 60)
    await example_transaction_history()

    # print("\n6. Webhook Handlers Example")
    # print("-" * 60)
    # await example_webhook_handlers()

    print("\n" + "=" * 60)
    print("Examples completed!")
    print("=" * 60)


if __name__ == "__main__":
    # Run examples
    asyncio.run(main())
