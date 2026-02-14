"""
PayPal Payouts Client

PayPal Payouts API for international instructor payments.
Supports both sandbox and production environments.
"""

import base64
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class PayPalClient:
    """PayPal Payouts API client."""

    def __init__(self):
        self.client_id = settings.paypal_client_id
        self.client_secret = settings.paypal_client_secret
        self.base_url = settings.paypal_base_url
        self._access_token: Optional[str] = None
        self._token_expiry: Optional[datetime] = None

    async def _get_access_token(self) -> str:
        """Get OAuth2 access token from PayPal."""
        if self._access_token and self._token_expiry and datetime.utcnow() < self._token_expiry:
            return self._access_token

        credentials = base64.b64encode(
            f"{self.client_id}:{self.client_secret}".encode()
        ).decode()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/v1/oauth2/token",
                data={"grant_type": "client_credentials"},
                headers={
                    "Authorization": f"Basic {credentials}",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()

            self._access_token = data["access_token"]
            from datetime import timedelta
            expires_in = data.get("expires_in", 32400)
            self._token_expiry = datetime.utcnow() + timedelta(seconds=expires_in - 100)

            return self._access_token

    async def create_payout(
        self,
        email: str,
        amount: float,
        currency: str = "USD",
        note: str = "Instructor earnings payout",
        sender_batch_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Create a PayPal payout to an email address.

        Args:
            email: Recipient PayPal email
            amount: Amount to send
            currency: Currency code (USD, EUR, GBP, etc.)
            note: Payout note visible to recipient
            sender_batch_id: Unique batch ID for idempotency

        Returns:
            PayPal payout batch response
        """
        try:
            token = await self._get_access_token()

            batch_id = sender_batch_id or f"payout-{int(__import__('time').time())}"

            payload = {
                "sender_batch_header": {
                    "sender_batch_id": batch_id,
                    "email_subject": "You have a payout from Urban Home School",
                    "email_message": note,
                },
                "items": [
                    {
                        "recipient_type": "EMAIL",
                        "amount": {
                            "value": f"{amount:.2f}",
                            "currency": currency,
                        },
                        "note": note,
                        "receiver": email,
                        "sender_item_id": f"item-{batch_id}",
                    }
                ],
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/v1/payments/payouts",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                    },
                    timeout=30,
                )

                result = response.json()
                logger.info(
                    f"PayPal payout: batch_id={batch_id} "
                    f"amount={amount} {currency} to={email}"
                )
                return result

        except httpx.HTTPStatusError as e:
            logger.error(f"PayPal payout HTTP error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"PayPal payout error: {str(e)}")
            raise

    async def get_payout_batch(self, payout_batch_id: str) -> Dict[str, Any]:
        """Get payout batch status."""
        try:
            token = await self._get_access_token()

            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/v1/payments/payouts/{payout_batch_id}",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=30,
                )
                return response.json()

        except Exception as e:
            logger.error(f"PayPal get payout error: {str(e)}")
            raise

    async def get_payout_item(self, payout_item_id: str) -> Dict[str, Any]:
        """Get individual payout item status."""
        try:
            token = await self._get_access_token()

            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/v1/payments/payouts-item/{payout_item_id}",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=30,
                )
                return response.json()

        except Exception as e:
            logger.error(f"PayPal get payout item error: {str(e)}")
            raise

    @staticmethod
    def parse_webhook(webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse PayPal webhook payload."""
        resource = webhook_data.get("resource", {})
        return {
            "event_type": webhook_data.get("event_type"),
            "payout_batch_id": resource.get("batch_header", {}).get("payout_batch_id"),
            "batch_status": resource.get("batch_header", {}).get("batch_status"),
            "amount": resource.get("batch_header", {}).get("amount", {}).get("value"),
            "currency": resource.get("batch_header", {}).get("amount", {}).get("currency"),
            "success": resource.get("batch_header", {}).get("batch_status") == "SUCCESS",
        }
