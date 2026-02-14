"""
M-Pesa B2C (Business-to-Customer) Payout Client

Safaricom Daraja API integration for instructor payouts to M-Pesa wallets.
Supports both sandbox and production environments.
"""

import base64
import logging
from datetime import datetime
from typing import Dict, Any, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class MpesaB2CClient:
    """M-Pesa Daraja API B2C payout client."""

    def __init__(self):
        self.consumer_key = settings.mpesa_consumer_key
        self.consumer_secret = settings.mpesa_consumer_secret
        self.shortcode = settings.mpesa_shortcode
        self.base_url = settings.mpesa_base_url
        self.callback_url = settings.mpesa_callback_url
        self.timeout_url = settings.mpesa_timeout_url
        self._access_token: Optional[str] = None
        self._token_expiry: Optional[datetime] = None

    async def _get_access_token(self) -> str:
        """Get OAuth access token from Daraja API."""
        if self._access_token and self._token_expiry and datetime.utcnow() < self._token_expiry:
            return self._access_token

        credentials = base64.b64encode(
            f"{self.consumer_key}:{self.consumer_secret}".encode()
        ).decode()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials",
                headers={"Authorization": f"Basic {credentials}"},
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()

            self._access_token = data["access_token"]
            # Token typically expires in 3600s, refresh at 3500s
            from datetime import timedelta
            self._token_expiry = datetime.utcnow() + timedelta(seconds=3500)

            return self._access_token

    async def send_b2c(
        self,
        phone_number: str,
        amount: float,
        occasion: str = "InstructorPayout",
        remarks: str = "Instructor earnings payout",
        command_id: str = "BusinessPayment",
    ) -> Dict[str, Any]:
        """
        Send B2C payment to instructor's M-Pesa wallet.

        Args:
            phone_number: Recipient phone (254XXXXXXXXX format)
            amount: Amount in KES
            occasion: Transaction occasion
            remarks: Transaction remarks
            command_id: BusinessPayment or SalaryPayment

        Returns:
            Daraja API response dict
        """
        try:
            token = await self._get_access_token()

            # Format phone number
            phone = phone_number.strip().replace("+", "")
            if phone.startswith("0"):
                phone = "254" + phone[1:]

            payload = {
                "InitiatorName": "testapi",
                "SecurityCredential": self._get_security_credential(),
                "CommandID": command_id,
                "Amount": int(amount),
                "PartyA": self.shortcode,
                "PartyB": phone,
                "Remarks": remarks,
                "QueueTimeOutURL": self.timeout_url or f"{settings.mpesa_callback_url}/timeout",
                "ResultURL": self.callback_url or "https://example.com/callback",
                "Occasion": occasion,
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/mpesa/b2c/v3/paymentrequest",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                    },
                    timeout=30,
                )

                result = response.json()
                logger.info(
                    f"M-Pesa B2C response: {result.get('ResponseCode', 'unknown')} "
                    f"for {phone} amount={amount}"
                )
                return result

        except httpx.HTTPStatusError as e:
            logger.error(f"M-Pesa B2C HTTP error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"M-Pesa B2C error: {str(e)}")
            raise

    def _get_security_credential(self) -> str:
        """
        Generate security credential for B2C API.
        In sandbox, use the test credential. In production, encrypt with cert.
        """
        # For sandbox, use a base64-encoded placeholder
        # In production, encrypt initiator_password with Safaricom's public cert
        initiator_password = getattr(settings, "mpesa_initiator_password", "Safaricom999!*!")
        return base64.b64encode(initiator_password.encode()).encode().decode()

    async def check_transaction_status(
        self, transaction_id: str
    ) -> Dict[str, Any]:
        """Query the status of a B2C transaction."""
        try:
            token = await self._get_access_token()

            payload = {
                "Initiator": "testapi",
                "SecurityCredential": self._get_security_credential(),
                "CommandID": "TransactionStatusQuery",
                "TransactionID": transaction_id,
                "PartyA": self.shortcode,
                "IdentifierType": "4",
                "ResultURL": self.callback_url or "https://example.com/callback",
                "QueueTimeOutURL": self.timeout_url or "https://example.com/timeout",
                "Remarks": "Status check",
                "Occasion": "StatusQuery",
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/mpesa/transactionstatus/v1/query",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                    },
                    timeout=30,
                )
                return response.json()

        except Exception as e:
            logger.error(f"M-Pesa status check error: {str(e)}")
            raise

    @staticmethod
    def parse_b2c_callback(callback_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse B2C callback data from Daraja API."""
        result = callback_data.get("Result", {})
        return {
            "result_type": result.get("ResultType"),
            "result_code": result.get("ResultCode"),
            "result_desc": result.get("ResultDesc"),
            "originator_conversation_id": result.get("OriginatorConversationID"),
            "conversation_id": result.get("ConversationID"),
            "transaction_id": result.get("TransactionID"),
            "success": result.get("ResultCode") == 0,
        }
