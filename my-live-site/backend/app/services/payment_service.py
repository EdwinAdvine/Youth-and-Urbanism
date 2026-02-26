"""
Payment service for multi-gateway payment processing and wallet management.

This module implements:
- M-Pesa (Daraja API) integration for mobile money payments
- PayPal REST API integration for international payments
- Stripe API integration for card payments
- User wallet system for credits and revenue tracking
- Transaction history and audit trail

All methods return consistent response format:
{"success": bool, "data": dict, "error": str}
"""

import logging
import base64
import hashlib
import hmac
import json
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any, List

import requests
import stripe
from paypalrestsdk import Payment as PayPalPayment, configure as paypal_configure
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.config import settings
from app.models.payment import Transaction, Wallet, PaymentMethod
from app.models.user import User

# Configure logging
logger = logging.getLogger(__name__)

# Configure Stripe
if settings.stripe_secret_key:
    stripe.api_key = settings.stripe_secret_key

# Configure PayPal
if settings.paypal_client_id and settings.paypal_client_secret:
    paypal_configure({
        "mode": settings.paypal_mode,
        "client_id": settings.paypal_client_id,
        "client_secret": settings.paypal_client_secret
    })


class PaymentService:
    """
    Comprehensive payment service supporting M-Pesa, PayPal, and Stripe.

    Features:
    - Multi-gateway payment processing
    - Wallet management (credit, debit, balance)
    - Transaction tracking and history
    - Webhook handling for async payment notifications
    - Automatic transaction reconciliation
    """

    def __init__(self, db_session: AsyncSession):
        """
        Initialize payment service with database session.

        Args:
            db_session: SQLAlchemy async database session
        """
        self.db = db_session
        self.mpesa_base_url = settings.mpesa_base_url
        self.paypal_base_url = settings.paypal_base_url

    # ==================== M-PESA METHODS ====================

    async def _get_mpesa_access_token(self) -> Optional[str]:
        """
        Get M-Pesa OAuth access token.

        Returns:
            Access token string or None on failure
        """
        try:
            if not settings.mpesa_consumer_key or not settings.mpesa_consumer_secret:
                logger.error("M-Pesa credentials not configured")
                return None

            # Create authorization header
            auth_string = f"{settings.mpesa_consumer_key}:{settings.mpesa_consumer_secret}"
            auth_bytes = auth_string.encode('ascii')
            auth_base64 = base64.b64encode(auth_bytes).decode('ascii')

            # Request access token
            url = f"{self.mpesa_base_url}/oauth/v1/generate?grant_type=client_credentials"
            headers = {"Authorization": f"Basic {auth_base64}"}

            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()

            data = response.json()
            return data.get('access_token')

        except Exception as e:
            logger.error(f"Failed to get M-Pesa access token: {str(e)}")
            return None

    def _generate_mpesa_password(self, timestamp: str) -> str:
        """
        Generate M-Pesa password for STK Push.

        Args:
            timestamp: Timestamp in YYYYMMDDHHmmss format

        Returns:
            Base64 encoded password
        """
        password_string = f"{settings.mpesa_shortcode}{settings.mpesa_passkey}{timestamp}"
        password_bytes = password_string.encode('ascii')
        return base64.b64encode(password_bytes).decode('ascii')

    async def initiate_mpesa_payment(
        self,
        phone_number: str,
        amount: float,
        user_id: uuid.UUID,
        description: str = "Payment",
        course_id: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        """
        Initiate M-Pesa STK Push payment request.

        Args:
            phone_number: Customer phone number (format: 254XXXXXXXXX)
            amount: Payment amount
            user_id: User making the payment
            description: Payment description
            course_id: Optional course ID for enrollment payments

        Returns:
            Response dict with success status, data, and error message
        """
        try:
            # Validate configuration
            if not all([
                settings.mpesa_consumer_key,
                settings.mpesa_consumer_secret,
                settings.mpesa_shortcode,
                settings.mpesa_passkey,
                settings.mpesa_callback_url
            ]):
                return {
                    "success": False,
                    "data": {},
                    "error": "M-Pesa configuration incomplete"
                }

            # Get access token
            access_token = await self._get_mpesa_access_token()
            if not access_token:
                return {
                    "success": False,
                    "data": {},
                    "error": "Failed to authenticate with M-Pesa"
                }

            # Generate timestamp and password
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self._generate_mpesa_password(timestamp)

            # Generate unique transaction reference
            transaction_ref = f"TUHS-{uuid.uuid4().hex[:12].upper()}"

            # Create payment record
            payment = Transaction(
                user_id=user_id,
                course_id=course_id,
                gateway="mpesa",
                transaction_id=transaction_ref,  # Will be updated with CheckoutRequestID
                reference_number=transaction_ref,
                amount=Decimal(str(amount)),
                currency="KES",
                status="pending",
                phone_number=phone_number,
                description=description,
                payment_metadata={
                    "phone_number": phone_number,
                    "timestamp": timestamp
                }
            )
            self.db.add(payment)
            await self.db.commit()
            await self.db.refresh(payment)

            # Prepare STK Push request
            url = f"{self.mpesa_base_url}/mpesa/stkpush/v1/processrequest"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            payload = {
                "BusinessShortCode": settings.mpesa_shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": int(amount),
                "PartyA": phone_number,
                "PartyB": settings.mpesa_shortcode,
                "PhoneNumber": phone_number,
                "CallBackURL": settings.mpesa_callback_url,
                "AccountReference": transaction_ref,
                "TransactionDesc": description
            }

            # Send STK Push request
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()

            response_data = response.json()

            # Update payment with CheckoutRequestID
            if response_data.get('ResponseCode') == '0':
                payment.transaction_id = response_data.get('CheckoutRequestID', transaction_ref)
                payment.gateway_response = response_data
                await self.db.commit()

                logger.info(f"M-Pesa STK Push initiated: {transaction_ref}")
                return {
                    "success": True,
                    "data": {
                        "payment_id": str(payment.id),
                        "transaction_ref": transaction_ref,
                        "checkout_request_id": response_data.get('CheckoutRequestID'),
                        "merchant_request_id": response_data.get('MerchantRequestID'),
                        "amount": float(amount),
                        "phone_number": phone_number
                    },
                    "error": ""
                }
            else:
                # STK Push failed
                payment.status = "failed"
                payment.gateway_response = response_data
                await self.db.commit()

                return {
                    "success": False,
                    "data": {"payment_id": str(payment.id)},
                    "error": response_data.get('ResponseDescription', 'STK Push failed')
                }

        except requests.exceptions.RequestException as e:
            logger.error(f"M-Pesa API request failed: {str(e)}")
            return {
                "success": False,
                "data": {},
                "error": f"M-Pesa API error: {str(e)}"
            }
        except Exception as e:
            logger.error(f"M-Pesa payment initiation failed: {str(e)}")
            await self.db.rollback()
            return {
                "success": False,
                "data": {},
                "error": f"Payment initiation failed: {str(e)}"
            }

    async def verify_mpesa_payment(self, transaction_ref: str) -> Dict[str, Any]:
        """
        Verify M-Pesa payment status using transaction reference.

        Args:
            transaction_ref: Internal transaction reference number

        Returns:
            Response dict with payment status
        """
        try:
            # Find payment by reference
            stmt = select(Transaction).where(
                Transaction.reference_number == transaction_ref,
                Transaction.gateway == "mpesa"
            )
            result = await self.db.execute(stmt)
            payment = result.scalar_one_or_none()

            if not payment:
                return {
                    "success": False,
                    "data": {},
                    "error": "Payment not found"
                }

            # Get access token
            access_token = await self._get_mpesa_access_token()
            if not access_token:
                return {
                    "success": False,
                    "data": {},
                    "error": "Failed to authenticate with M-Pesa"
                }

            # Query transaction status
            url = f"{self.mpesa_base_url}/mpesa/stkpushquery/v1/query"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self._generate_mpesa_password(timestamp)

            payload = {
                "BusinessShortCode": settings.mpesa_shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "CheckoutRequestID": payment.transaction_id
            }

            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()

            response_data = response.json()

            # Update payment status based on response
            if response_data.get('ResultCode') == '0':
                payment.status = "completed"
                payment.completed_at = datetime.utcnow()
            elif response_data.get('ResultCode') in ['1032', '1']:
                payment.status = "failed"

            payment.gateway_response.update(response_data)
            await self.db.commit()

            return {
                "success": True,
                "data": {
                    "payment_id": str(payment.id),
                    "status": payment.status,
                    "amount": float(payment.amount),
                    "result_code": response_data.get('ResultCode'),
                    "result_desc": response_data.get('ResultDesc')
                },
                "error": ""
            }

        except Exception as e:
            logger.error(f"M-Pesa verification failed: {str(e)}")
            return {
                "success": False,
                "data": {},
                "error": f"Verification failed: {str(e)}"
            }

    async def handle_mpesa_callback(self, callback_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process M-Pesa payment callback notification.

        Args:
            callback_data: Callback data from M-Pesa

        Returns:
            Response dict with processing status
        """
        try:
            # Extract callback information
            body = callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})

            checkout_request_id = stk_callback.get('CheckoutRequestID')
            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')

            # Find payment by CheckoutRequestID
            stmt = select(Transaction).where(
                Transaction.transaction_id == checkout_request_id,
                Transaction.gateway == "mpesa"
            )
            result = await self.db.execute(stmt)
            payment = result.scalar_one_or_none()

            if not payment:
                logger.warning(f"Payment not found for CheckoutRequestID: {checkout_request_id}")
                return {
                    "success": False,
                    "data": {},
                    "error": "Payment not found"
                }

            # Update payment based on result code
            if result_code == 0:
                # Payment successful
                payment.status = "completed"
                payment.completed_at = datetime.utcnow()

                # Extract metadata from callback
                callback_metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])
                metadata = {}
                for item in callback_metadata:
                    name = item.get('Name')
                    value = item.get('Value')
                    if name:
                        metadata[name] = value

                payment.payment_metadata.update(metadata)

                # Credit user wallet if payment successful
                if payment.user_id:
                    credit_result = await self.add_funds(
                        user_id=payment.user_id,
                        amount=float(payment.amount),
                        transaction_id=str(payment.id)
                    )
                    if not credit_result["success"]:
                        logger.error(f"Failed to credit wallet for payment {payment.id}")

                logger.info(f"M-Pesa payment completed: {payment.reference_number}")
            else:
                # Payment failed
                payment.status = "failed"
                payment.payment_metadata['failure_reason'] = result_desc
                logger.warning(f"M-Pesa payment failed: {payment.reference_number} - {result_desc}")

            payment.gateway_response.update(callback_data)
            await self.db.commit()

            return {
                "success": True,
                "data": {
                    "payment_id": str(payment.id),
                    "status": payment.status
                },
                "error": ""
            }

        except Exception as e:
            logger.error(f"M-Pesa callback processing failed: {str(e)}")
            await self.db.rollback()
            return {
                "success": False,
                "data": {},
                "error": f"Callback processing failed: {str(e)}"
            }

    # ==================== PAYPAL METHODS ====================

    async def initiate_paypal_payment(
        self,
        amount: float,
        user_id: uuid.UUID,
        description: str = "Payment",
        course_id: Optional[uuid.UUID] = None,
        currency: str = "USD"
    ) -> Dict[str, Any]:
        """
        Create PayPal payment order.

        Args:
            amount: Payment amount
            user_id: User making the payment
            description: Payment description
            course_id: Optional course ID for enrollment payments
            currency: Currency code (default: USD)

        Returns:
            Response dict with order details and approval URL
        """
        try:
            if not settings.paypal_client_id or not settings.paypal_client_secret:
                return {
                    "success": False,
                    "data": {},
                    "error": "PayPal configuration incomplete"
                }

            # Generate unique transaction reference
            transaction_ref = f"TUHS-PP-{uuid.uuid4().hex[:12].upper()}"

            # Create PayPal payment
            payment = PayPalPayment({
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": f"{settings.paypal_base_url}/payment/execute",
                    "cancel_url": f"{settings.paypal_base_url}/payment/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": description,
                            "sku": transaction_ref,
                            "price": str(amount),
                            "currency": currency,
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "total": str(amount),
                        "currency": currency
                    },
                    "description": description
                }]
            })

            if payment.create():
                # Create payment record
                db_payment = Transaction(
                    user_id=user_id,
                    course_id=course_id,
                    gateway="paypal",
                    transaction_id=payment.id,
                    reference_number=transaction_ref,
                    amount=Decimal(str(amount)),
                    currency=currency,
                    status="pending",
                    description=description,
                    payment_metadata={
                        "paypal_id": payment.id,
                        "created_time": payment.create_time
                    },
                    gateway_response=payment.to_dict()
                )
                self.db.add(db_payment)
                await self.db.commit()
                await self.db.refresh(db_payment)

                # Get approval URL
                approval_url = None
                for link in payment.links:
                    if link.rel == "approval_url":
                        approval_url = link.href
                        break

                logger.info(f"PayPal payment created: {transaction_ref}")
                return {
                    "success": True,
                    "data": {
                        "payment_id": str(db_payment.id),
                        "transaction_ref": transaction_ref,
                        "paypal_order_id": payment.id,
                        "approval_url": approval_url,
                        "amount": float(amount),
                        "currency": currency
                    },
                    "error": ""
                }
            else:
                logger.error(f"PayPal payment creation failed: {payment.error}")
                return {
                    "success": False,
                    "data": {},
                    "error": f"PayPal error: {payment.error}"
                }

        except Exception as e:
            logger.error(f"PayPal payment initiation failed: {str(e)}")
            await self.db.rollback()
            return {
                "success": False,
                "data": {},
                "error": f"Payment initiation failed: {str(e)}"
            }

    async def capture_paypal_payment(self, order_id: str) -> Dict[str, Any]:
        """
        Capture authorized PayPal payment.

        Args:
            order_id: PayPal order ID

        Returns:
            Response dict with capture status
        """
        try:
            # Find payment by PayPal order ID
            stmt = select(Transaction).where(
                Transaction.transaction_id == order_id,
                Transaction.gateway == "paypal"
            )
            result = await self.db.execute(stmt)
            payment = result.scalar_one_or_none()

            if not payment:
                return {
                    "success": False,
                    "data": {},
                    "error": "Payment not found"
                }

            # Execute PayPal payment
            paypal_payment = PayPalPayment.find(order_id)

            if paypal_payment.execute({"payer_id": paypal_payment.payer.payer_info.payer_id}):
                # Payment executed successfully
                payment.status = "completed"
                payment.completed_at = datetime.utcnow()
                payment.gateway_response.update(paypal_payment.to_dict())

                # Credit user wallet
                if payment.user_id:
                    credit_result = await self.add_funds(
                        user_id=payment.user_id,
                        amount=float(payment.amount),
                        transaction_id=str(payment.id)
                    )
                    if not credit_result["success"]:
                        logger.error(f"Failed to credit wallet for payment {payment.id}")

                await self.db.commit()

                logger.info(f"PayPal payment captured: {payment.reference_number}")
                return {
                    "success": True,
                    "data": {
                        "payment_id": str(payment.id),
                        "status": payment.status,
                        "amount": float(payment.amount)
                    },
                    "error": ""
                }
            else:
                logger.error(f"PayPal payment execution failed: {paypal_payment.error}")
                payment.status = "failed"
                payment.payment_metadata['failure_reason'] = str(paypal_payment.error)
                await self.db.commit()

                return {
                    "success": False,
                    "data": {"payment_id": str(payment.id)},
                    "error": f"Payment execution failed: {paypal_payment.error}"
                }

        except Exception as e:
            logger.error(f"PayPal capture failed: {str(e)}")
            await self.db.rollback()
            return {
                "success": False,
                "data": {},
                "error": f"Capture failed: {str(e)}"
            }

    async def handle_paypal_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process PayPal webhook notification.

        Args:
            webhook_data: Webhook data from PayPal

        Returns:
            Response dict with processing status
        """
        try:
            event_type = webhook_data.get('event_type')
            resource = webhook_data.get('resource', {})

            if event_type == 'PAYMENT.SALE.COMPLETED':
                # Payment completed
                payment_id = resource.get('parent_payment')

                stmt = select(Transaction).where(
                    Transaction.transaction_id == payment_id,
                    Transaction.gateway == "paypal"
                )
                result = await self.db.execute(stmt)
                payment = result.scalar_one_or_none()

                if payment and payment.status != "completed":
                    payment.status = "completed"
                    payment.completed_at = datetime.utcnow()
                    payment.gateway_response.update(webhook_data)

                    # Credit user wallet
                    if payment.user_id:
                        await self.add_funds(
                            user_id=payment.user_id,
                            amount=float(payment.amount),
                            transaction_id=str(payment.id)
                        )

                    await self.db.commit()
                    logger.info(f"PayPal webhook: Payment completed {payment_id}")

            elif event_type == 'PAYMENT.SALE.REFUNDED':
                # Payment refunded
                payment_id = resource.get('parent_payment')

                stmt = select(Transaction).where(
                    Transaction.transaction_id == payment_id,
                    Transaction.gateway == "paypal"
                )
                result = await self.db.execute(stmt)
                payment = result.scalar_one_or_none()

                if payment:
                    payment.status = "refunded"
                    payment.gateway_response.update(webhook_data)
                    await self.db.commit()
                    logger.info(f"PayPal webhook: Payment refunded {payment_id}")

            return {
                "success": True,
                "data": {"event_type": event_type},
                "error": ""
            }

        except Exception as e:
            logger.error(f"PayPal webhook processing failed: {str(e)}")
            await self.db.rollback()
            return {
                "success": False,
                "data": {},
                "error": f"Webhook processing failed: {str(e)}"
            }

    # ==================== STRIPE METHODS ====================

    async def initiate_stripe_payment(
        self,
        amount: float,
        user_id: uuid.UUID,
        payment_method_id: Optional[str] = None,
        description: str = "Payment",
        course_id: Optional[uuid.UUID] = None,
        currency: str = None
    ) -> Dict[str, Any]:
        """
        Create Stripe payment intent.

        Args:
            amount: Payment amount
            user_id: User making the payment
            payment_method_id: Stripe payment method ID (optional)
            description: Payment description
            course_id: Optional course ID for enrollment payments
            currency: Currency code (default: from settings)

        Returns:
            Response dict with payment intent details
        """
        try:
            if not settings.stripe_secret_key:
                return {
                    "success": False,
                    "data": {},
                    "error": "Stripe configuration incomplete"
                }

            # Use default currency if not provided
            if currency is None:
                currency = settings.stripe_currency

            # Generate unique transaction reference
            transaction_ref = f"TUHS-ST-{uuid.uuid4().hex[:12].upper()}"

            # Get user email for Stripe
            stmt = select(User).where(User.id == user_id)
            result = await self.db.execute(stmt)
            user = result.scalar_one_or_none()

            # Convert amount to cents (Stripe uses smallest currency unit)
            amount_cents = int(amount * 100)

            # Create Stripe payment intent
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency,
                description=description,
                metadata={
                    "transaction_ref": transaction_ref,
                    "user_id": str(user_id),
                    "course_id": str(course_id) if course_id else None
                },
                receipt_email=user.email if user else None,
                payment_method=payment_method_id,
                confirm=True if payment_method_id else False
            )

            # Create payment record
            db_payment = Transaction(
                user_id=user_id,
                course_id=course_id,
                gateway="stripe",
                transaction_id=payment_intent.id,
                reference_number=transaction_ref,
                amount=Decimal(str(amount)),
                currency=currency.upper(),
                status="pending",
                description=description,
                payment_metadata={
                    "payment_intent_id": payment_intent.id,
                    "client_secret": payment_intent.client_secret
                },
                gateway_response=payment_intent.to_dict()
            )
            self.db.add(db_payment)
            await self.db.commit()
            await self.db.refresh(db_payment)

            logger.info(f"Stripe payment intent created: {transaction_ref}")
            return {
                "success": True,
                "data": {
                    "payment_id": str(db_payment.id),
                    "transaction_ref": transaction_ref,
                    "payment_intent_id": payment_intent.id,
                    "client_secret": payment_intent.client_secret,
                    "amount": float(amount),
                    "currency": currency
                },
                "error": ""
            }

        except stripe.error.StripeError as e:
            logger.error(f"Stripe API error: {str(e)}")
            return {
                "success": False,
                "data": {},
                "error": f"Stripe error: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Stripe payment initiation failed: {str(e)}")
            await self.db.rollback()
            return {
                "success": False,
                "data": {},
                "error": f"Payment initiation failed: {str(e)}"
            }

    async def confirm_stripe_payment(self, payment_intent_id: str) -> Dict[str, Any]:
        """
        Confirm Stripe payment intent.

        Args:
            payment_intent_id: Stripe payment intent ID

        Returns:
            Response dict with confirmation status
        """
        try:
            # Find payment by Stripe payment intent ID
            stmt = select(Transaction).where(
                Transaction.transaction_id == payment_intent_id,
                Transaction.gateway == "stripe"
            )
            result = await self.db.execute(stmt)
            payment = result.scalar_one_or_none()

            if not payment:
                return {
                    "success": False,
                    "data": {},
                    "error": "Payment not found"
                }

            # Retrieve payment intent from Stripe
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            # Update payment status based on payment intent status
            if payment_intent.status == 'succeeded':
                payment.status = "completed"
                payment.completed_at = datetime.utcnow()
                payment.gateway_response.update(payment_intent.to_dict())

                # Credit user wallet
                if payment.user_id:
                    credit_result = await self.add_funds(
                        user_id=payment.user_id,
                        amount=float(payment.amount),
                        transaction_id=str(payment.id)
                    )
                    if not credit_result["success"]:
                        logger.error(f"Failed to credit wallet for payment {payment.id}")

                await self.db.commit()

                logger.info(f"Stripe payment confirmed: {payment.reference_number}")
                return {
                    "success": True,
                    "data": {
                        "payment_id": str(payment.id),
                        "status": payment.status,
                        "amount": float(payment.amount)
                    },
                    "error": ""
                }
            elif payment_intent.status == 'requires_payment_method':
                payment.status = "failed"
                payment.payment_metadata['failure_reason'] = "Payment method required"
                await self.db.commit()

                return {
                    "success": False,
                    "data": {"payment_id": str(payment.id)},
                    "error": "Payment requires payment method"
                }
            else:
                # Still processing
                return {
                    "success": True,
                    "data": {
                        "payment_id": str(payment.id),
                        "status": payment_intent.status
                    },
                    "error": ""
                }

        except stripe.error.StripeError as e:
            logger.error(f"Stripe confirmation error: {str(e)}")
            return {
                "success": False,
                "data": {},
                "error": f"Stripe error: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Stripe confirmation failed: {str(e)}")
            await self.db.rollback()
            return {
                "success": False,
                "data": {},
                "error": f"Confirmation failed: {str(e)}"
            }

    async def handle_stripe_webhook(
        self,
        webhook_data: Dict[str, Any],
        signature: str
    ) -> Dict[str, Any]:
        """
        Process Stripe webhook notification.

        Args:
            webhook_data: Webhook data from Stripe
            signature: Stripe signature header

        Returns:
            Response dict with processing status
        """
        try:
            if not settings.stripe_webhook_secret:
                return {
                    "success": False,
                    "data": {},
                    "error": "Stripe webhook secret not configured"
                }

            # Verify webhook signature
            try:
                event = stripe.Webhook.construct_event(
                    json.dumps(webhook_data),
                    signature,
                    settings.stripe_webhook_secret
                )
            except stripe.error.SignatureVerificationError as e:
                logger.error(f"Stripe webhook signature verification failed: {str(e)}")
                return {
                    "success": False,
                    "data": {},
                    "error": "Invalid signature"
                }

            # Handle different event types
            event_type = event['type']
            event_object = event['data']['object']

            if event_type == 'payment_intent.succeeded':
                # Payment succeeded
                payment_intent_id = event_object['id']

                stmt = select(Transaction).where(
                    Transaction.transaction_id == payment_intent_id,
                    Transaction.gateway == "stripe"
                )
                result = await self.db.execute(stmt)
                payment = result.scalar_one_or_none()

                if payment and payment.status != "completed":
                    payment.status = "completed"
                    payment.completed_at = datetime.utcnow()
                    payment.gateway_response.update(event_object)

                    # Credit user wallet
                    if payment.user_id:
                        await self.add_funds(
                            user_id=payment.user_id,
                            amount=float(payment.amount),
                            transaction_id=str(payment.id)
                        )

                    await self.db.commit()
                    logger.info(f"Stripe webhook: Payment succeeded {payment_intent_id}")

            elif event_type == 'payment_intent.payment_failed':
                # Payment failed
                payment_intent_id = event_object['id']

                stmt = select(Transaction).where(
                    Transaction.transaction_id == payment_intent_id,
                    Transaction.gateway == "stripe"
                )
                result = await self.db.execute(stmt)
                payment = result.scalar_one_or_none()

                if payment:
                    payment.status = "failed"
                    payment.payment_metadata['failure_reason'] = event_object.get('last_payment_error', {}).get('message', 'Unknown error')
                    payment.gateway_response.update(event_object)
                    await self.db.commit()
                    logger.info(f"Stripe webhook: Payment failed {payment_intent_id}")

            elif event_type == 'charge.refunded':
                # Charge refunded
                charge_id = event_object['id']
                payment_intent_id = event_object.get('payment_intent')

                if payment_intent_id:
                    stmt = select(Transaction).where(
                        Transaction.transaction_id == payment_intent_id,
                        Transaction.gateway == "stripe"
                    )
                    result = await self.db.execute(stmt)
                    payment = result.scalar_one_or_none()

                    if payment:
                        payment.status = "refunded"
                        payment.gateway_response.update(event_object)
                        await self.db.commit()
                        logger.info(f"Stripe webhook: Charge refunded {charge_id}")

            return {
                "success": True,
                "data": {"event_type": event_type},
                "error": ""
            }

        except Exception as e:
            logger.error(f"Stripe webhook processing failed: {str(e)}")
            await self.db.rollback()
            return {
                "success": False,
                "data": {},
                "error": f"Webhook processing failed: {str(e)}"
            }

    # ==================== WALLET METHODS ====================

    async def get_wallet(self, user_id: uuid.UUID) -> Dict[str, Any]:
        """
        Get or create user wallet.

        Args:
            user_id: User ID

        Returns:
            Response dict with wallet information
        """
        try:
            # Find existing wallet
            stmt = select(Wallet).where(Wallet.user_id == user_id)
            result = await self.db.execute(stmt)
            wallet = result.scalar_one_or_none()

            if not wallet:
                # Create new wallet
                wallet = Wallet(
                    user_id=user_id,
                    balance=Decimal('0.00'),
                    currency='KES',
                    total_earned=Decimal('0.00'),
                    pending_payout=Decimal('0.00'),
                    is_active=True
                )
                self.db.add(wallet)
                await self.db.commit()
                await self.db.refresh(wallet)
                logger.info(f"Created new wallet for user {user_id}")

            return {
                "success": True,
                "data": {
                    "wallet_id": str(wallet.id),
                    "user_id": str(wallet.user_id),
                    "balance": float(wallet.balance),
                    "currency": wallet.currency,
                    "total_earned": float(wallet.total_earned),
                    "pending_payout": float(wallet.pending_payout),
                    "is_active": wallet.is_active
                },
                "error": ""
            }

        except Exception as e:
            logger.error(f"Failed to get wallet: {str(e)}")
            await self.db.rollback()
            return {
                "success": False,
                "data": {},
                "error": f"Failed to get wallet: {str(e)}"
            }

    async def add_funds(
        self,
        user_id: uuid.UUID,
        amount: float,
        transaction_id: str,
        description: str = "Wallet credit"
    ) -> Dict[str, Any]:
        """
        Add funds to user wallet.

        Args:
            user_id: User ID
            amount: Amount to add
            transaction_id: Payment transaction ID
            description: Transaction description

        Returns:
            Response dict with updated balance
        """
        try:
            if amount <= 0:
                return {
                    "success": False,
                    "data": {},
                    "error": "Amount must be positive"
                }

            # Get or create wallet
            wallet_result = await self.get_wallet(user_id)
            if not wallet_result["success"]:
                return wallet_result

            wallet_id = uuid.UUID(wallet_result["data"]["wallet_id"])

            # Reload wallet from database
            stmt = select(Wallet).where(Wallet.id == wallet_id)
            result = await self.db.execute(stmt)
            wallet = result.scalar_one()

            # Record balance before transaction
            balance_before = wallet.balance

            # Credit wallet
            wallet.credit(Decimal(str(amount)), description)

            # Create wallet transaction record
            wallet_transaction = Transaction(
                wallet_id=wallet.id,
                payment_id=uuid.UUID(transaction_id) if transaction_id else None,
                transaction_type="credit",
                amount=Decimal(str(amount)),
                balance_before=balance_before,
                balance_after=wallet.balance,
                description=description
            )
            self.db.add(wallet_transaction)

            await self.db.commit()
            await self.db.refresh(wallet)

            logger.info(f"Added {amount} to wallet for user {user_id}")
            return {
                "success": True,
                "data": {
                    "wallet_id": str(wallet.id),
                    "previous_balance": float(balance_before),
                    "amount_added": float(amount),
                    "new_balance": float(wallet.balance),
                    "transaction_id": str(wallet_transaction.id)
                },
                "error": ""
            }

        except Exception as e:
            logger.error(f"Failed to add funds: {str(e)}")
            await self.db.rollback()
            return {
                "success": False,
                "data": {},
                "error": f"Failed to add funds: {str(e)}"
            }

    async def deduct_funds(
        self,
        user_id: uuid.UUID,
        amount: float,
        transaction_id: str,
        description: str = "Wallet debit"
    ) -> Dict[str, Any]:
        """
        Deduct funds from user wallet.

        Args:
            user_id: User ID
            amount: Amount to deduct
            transaction_id: Associated transaction ID
            description: Transaction description

        Returns:
            Response dict with updated balance
        """
        try:
            if amount <= 0:
                return {
                    "success": False,
                    "data": {},
                    "error": "Amount must be positive"
                }

            # Get wallet
            wallet_result = await self.get_wallet(user_id)
            if not wallet_result["success"]:
                return wallet_result

            wallet_id = uuid.UUID(wallet_result["data"]["wallet_id"])

            # Reload wallet from database
            stmt = select(Wallet).where(Wallet.id == wallet_id)
            result = await self.db.execute(stmt)
            wallet = result.scalar_one()

            # Check sufficient balance
            if float(wallet.balance) < amount:
                return {
                    "success": False,
                    "data": {
                        "current_balance": float(wallet.balance),
                        "required_amount": float(amount)
                    },
                    "error": "Insufficient balance"
                }

            # Record balance before transaction
            balance_before = wallet.balance

            # Debit wallet
            wallet.debit(Decimal(str(amount)), description)

            # Create wallet transaction record
            wallet_transaction = Transaction(
                wallet_id=wallet.id,
                payment_id=uuid.UUID(transaction_id) if transaction_id else None,
                transaction_type="debit",
                amount=Decimal(str(amount)),
                balance_before=balance_before,
                balance_after=wallet.balance,
                description=description
            )
            self.db.add(wallet_transaction)

            await self.db.commit()
            await self.db.refresh(wallet)

            logger.info(f"Deducted {amount} from wallet for user {user_id}")
            return {
                "success": True,
                "data": {
                    "wallet_id": str(wallet.id),
                    "previous_balance": float(balance_before),
                    "amount_deducted": float(amount),
                    "new_balance": float(wallet.balance),
                    "transaction_id": str(wallet_transaction.id)
                },
                "error": ""
            }

        except ValueError as e:
            logger.error(f"Validation error: {str(e)}")
            return {
                "success": False,
                "data": {},
                "error": str(e)
            }
        except Exception as e:
            logger.error(f"Failed to deduct funds: {str(e)}")
            await self.db.rollback()
            return {
                "success": False,
                "data": {},
                "error": f"Failed to deduct funds: {str(e)}"
            }

    async def get_balance(self, user_id: uuid.UUID) -> Dict[str, Any]:
        """
        Get current wallet balance for user.

        Args:
            user_id: User ID

        Returns:
            Response dict with balance information
        """
        try:
            wallet_result = await self.get_wallet(user_id)
            if not wallet_result["success"]:
                return wallet_result

            return {
                "success": True,
                "data": {
                    "balance": wallet_result["data"]["balance"],
                    "currency": wallet_result["data"]["currency"],
                    "total_earned": wallet_result["data"]["total_earned"],
                    "pending_payout": wallet_result["data"]["pending_payout"]
                },
                "error": ""
            }

        except Exception as e:
            logger.error(f"Failed to get balance: {str(e)}")
            return {
                "success": False,
                "data": {},
                "error": f"Failed to get balance: {str(e)}"
            }

    # ==================== TRANSACTION METHODS ====================

    async def create_transaction(
        self,
        user_id: uuid.UUID,
        amount: float,
        gateway: str,
        metadata: Optional[Dict[str, Any]] = None,
        description: str = "Payment",
        course_id: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        """
        Create a new payment transaction record.

        Args:
            user_id: User making the payment
            amount: Payment amount
            gateway: Payment gateway (mpesa, paypal, stripe)
            metadata: Additional metadata
            description: Payment description
            course_id: Optional course ID

        Returns:
            Response dict with transaction details
        """
        try:
            # Generate unique transaction reference
            transaction_ref = f"TUHS-{gateway.upper()}-{uuid.uuid4().hex[:12].upper()}"

            payment = Transaction(
                user_id=user_id,
                course_id=course_id,
                gateway=gateway.lower(),
                transaction_id=transaction_ref,
                reference_number=transaction_ref,
                amount=Decimal(str(amount)),
                currency='KES',
                status='pending',
                description=description,
                payment_metadata=metadata or {}
            )
            self.db.add(payment)
            await self.db.commit()
            await self.db.refresh(payment)

            logger.info(f"Created transaction: {transaction_ref}")
            return {
                "success": True,
                "data": {
                    "payment_id": str(payment.id),
                    "transaction_ref": transaction_ref,
                    "amount": float(amount),
                    "gateway": gateway,
                    "status": payment.status
                },
                "error": ""
            }

        except Exception as e:
            logger.error(f"Failed to create transaction: {str(e)}")
            await self.db.rollback()
            return {
                "success": False,
                "data": {},
                "error": f"Failed to create transaction: {str(e)}"
            }

    async def update_transaction_status(
        self,
        transaction_id: uuid.UUID,
        status: str
    ) -> Dict[str, Any]:
        """
        Update payment transaction status.

        Args:
            transaction_id: Payment ID
            status: New status (pending, completed, failed, refunded)

        Returns:
            Response dict with updated status
        """
        try:
            stmt = select(Transaction).where(Transaction.id == transaction_id)
            result = await self.db.execute(stmt)
            payment = result.scalar_one_or_none()

            if not payment:
                return {
                    "success": False,
                    "data": {},
                    "error": "Transaction not found"
                }

            old_status = payment.status
            payment.status = status.lower()

            if status.lower() == "completed":
                payment.completed_at = datetime.utcnow()

            await self.db.commit()
            await self.db.refresh(payment)

            logger.info(f"Updated transaction {transaction_id} status: {old_status} -> {status}")
            return {
                "success": True,
                "data": {
                    "payment_id": str(payment.id),
                    "old_status": old_status,
                    "new_status": payment.status
                },
                "error": ""
            }

        except Exception as e:
            logger.error(f"Failed to update transaction status: {str(e)}")
            await self.db.rollback()
            return {
                "success": False,
                "data": {},
                "error": f"Failed to update status: {str(e)}"
            }

    async def get_transaction_history(
        self,
        user_id: uuid.UUID,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get transaction history for user.

        Args:
            user_id: User ID
            limit: Maximum number of transactions to return
            offset: Offset for pagination

        Returns:
            Response dict with transaction list
        """
        try:
            # Query payments
            stmt = (
                select(Transaction)
                .where(Transaction.user_id == user_id)
                .order_by(desc(Transaction.created_at))
                .limit(limit)
                .offset(offset)
            )
            result = await self.db.execute(stmt)
            payments = result.scalars().all()

            # Format transactions
            transactions = []
            for payment in payments:
                transactions.append({
                    "payment_id": str(payment.id),
                    "transaction_ref": payment.reference_number,
                    "gateway": payment.gateway,
                    "amount": float(payment.amount),
                    "currency": payment.currency,
                    "status": payment.status,
                    "description": payment.description,
                    "course_id": str(payment.course_id) if payment.course_id else None,
                    "created_at": payment.created_at.isoformat(),
                    "completed_at": payment.completed_at.isoformat() if payment.completed_at else None
                })

            return {
                "success": True,
                "data": {
                    "transactions": transactions,
                    "count": len(transactions),
                    "limit": limit,
                    "offset": offset
                },
                "error": ""
            }

        except Exception as e:
            logger.error(f"Failed to get transaction history: {str(e)}")
            return {
                "success": False,
                "data": {},
                "error": f"Failed to get history: {str(e)}"
            }
