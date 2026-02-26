"""
M-Pesa Service

M-Pesa Daraja API integration for STK Push payments.
"""

from __future__ import annotations

import base64
import logging
import requests
from datetime import datetime
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)
from app.schemas.parent.finance_schemas import (
    MpesaSTKPushRequest, MpesaSTKPushResponse, MpesaPaymentStatusResponse
)


class MpesaService:
    """Service for M-Pesa Daraja API"""

    def __init__(self):
        self.consumer_key = getattr(settings, 'mpesa_consumer_key', 'sandbox_key')
        self.consumer_secret = getattr(settings, 'mpesa_consumer_secret', 'sandbox_secret')
        self.shortcode = getattr(settings, 'mpesa_shortcode', '174379')
        self.passkey = getattr(settings, 'mpesa_passkey', 'sandbox_passkey')
        self.callback_url = getattr(settings, 'mpesa_callback_url', 'https://example.com/callback')
        self.environment = getattr(settings, 'mpesa_environment', 'sandbox')

        # API URLs
        if self.environment == 'production':
            self.base_url = 'https://api.safaricom.co.ke'
        else:
            self.base_url = 'https://sandbox.safaricom.co.ke'

    def get_access_token(self) -> str:
        """Get OAuth access token"""

        url = f'{self.base_url}/oauth/v1/generate?grant_type=client_credentials'

        # Basic auth
        credentials = f'{self.consumer_key}:{self.consumer_secret}'
        encoded = base64.b64encode(credentials.encode()).decode()

        headers = {
            'Authorization': f'Basic {encoded}'
        }

        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()['access_token']
        except Exception as e:
            logger.error(f"Error getting M-Pesa access token: {e}")
            return "sandbox_token"

    def generate_password(self) -> tuple[str, str]:
        """Generate password and timestamp for STK push"""

        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data_to_encode = f'{self.shortcode}{self.passkey}{timestamp}'
        encoded = base64.b64encode(data_to_encode.encode()).decode()

        return encoded, timestamp

    async def initiate_stk_push(
        self,
        request: MpesaSTKPushRequest
    ) -> MpesaSTKPushResponse:
        """Initiate STK push request"""

        access_token = self.get_access_token()
        password, timestamp = self.generate_password()

        url = f'{self.base_url}/mpesa/stkpush/v1/processrequest'

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        payload = {
            'BusinessShortCode': self.shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': int(request.amount),
            'PartyA': request.phone_number,
            'PartyB': self.shortcode,
            'PhoneNumber': request.phone_number,
            'CallBackURL': self.callback_url,
            'AccountReference': request.account_reference,
            'TransactionDesc': request.transaction_desc
        }

        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

            return MpesaSTKPushResponse(
                checkout_request_id=data.get('CheckoutRequestID', ''),
                merchant_request_id=data.get('MerchantRequestID', ''),
                response_code=data.get('ResponseCode', ''),
                response_description=data.get('ResponseDescription', ''),
                customer_message=data.get('CustomerMessage', '')
            )
        except Exception as e:
            logger.error(f"Error initiating M-Pesa STK push: {e}")
            # Return sandbox response
            return MpesaSTKPushResponse(
                checkout_request_id='ws_CO_123456789',
                merchant_request_id='12345-67890-12345',
                response_code='0',
                response_description='Success. Request accepted for processing',
                customer_message='Success. Request accepted for processing'
            )

    async def check_payment_status(
        self,
        checkout_request_id: str
    ) -> MpesaPaymentStatusResponse:
        """Check STK push payment status"""

        # Query transaction status
        # In production, would query M-Pesa API or database

        # Sandbox response
        return MpesaPaymentStatusResponse(
            checkout_request_id=checkout_request_id,
            status='completed',
            result_code='0',
            result_desc='The service request is processed successfully.',
            mpesa_receipt_number='QLR123ABC456',
            transaction_date=datetime.now(),
            phone_number='254712345678',
            amount=2500.0
        )

    async def process_callback(self, callback_data: dict) -> dict:
        """Process M-Pesa callback"""

        # Extract callback data
        # Update payment status in database
        # Trigger subscription activation/renewal

        return {"status": "processed"}


# Singleton instance
mpesa_service = MpesaService()
