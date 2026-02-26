"""
Paystack Payout Client

Bank transfer payouts via Paystack API.
Supports NGN, GHS, KES, and ZAR transfers.
"""

import logging
from typing import Dict, Any, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

PAYSTACK_BASE_URL = "https://api.paystack.co"


class PaystackClient:
    """Paystack payment gateway client for bank transfers."""

    def __init__(self):
        self.secret_key = getattr(settings, "paystack_secret_key", "")
        self.base_url = PAYSTACK_BASE_URL

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }

    async def create_transfer_recipient(
        self,
        name: str,
        account_number: str,
        bank_code: str,
        currency: str = "KES",
        recipient_type: str = "nuban",
    ) -> Dict[str, Any]:
        """
        Create a transfer recipient (required before transfer).

        Args:
            name: Recipient full name
            account_number: Bank account number
            bank_code: Bank code
            currency: Currency code
            recipient_type: "nuban" for bank, "mobile_money" for mobile

        Returns:
            Paystack recipient response with recipient_code
        """
        try:
            payload = {
                "type": recipient_type,
                "name": name,
                "account_number": account_number,
                "bank_code": bank_code,
                "currency": currency,
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/transferrecipient",
                    json=payload,
                    headers=self._headers(),
                    timeout=30,
                )
                result = response.json()
                logger.info(f"Paystack recipient created: {result.get('data', {}).get('recipient_code')}")
                return result

        except Exception as e:
            logger.error(f"Paystack create recipient error: {str(e)}")
            raise

    async def initiate_transfer(
        self,
        amount: int,
        recipient_code: str,
        reason: str = "Instructor payout",
        currency: str = "KES",
        reference: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Initiate a bank transfer.

        Args:
            amount: Amount in smallest currency unit (kobo/pesewas/cents)
            recipient_code: Recipient code from create_transfer_recipient
            reason: Transfer reason
            currency: Currency code
            reference: Unique reference

        Returns:
            Paystack transfer response
        """
        try:
            payload = {
                "source": "balance",
                "amount": amount,
                "recipient": recipient_code,
                "reason": reason,
                "currency": currency,
            }
            if reference:
                payload["reference"] = reference

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/transfer",
                    json=payload,
                    headers=self._headers(),
                    timeout=30,
                )
                result = response.json()
                logger.info(
                    f"Paystack transfer: status={result.get('data', {}).get('status')} "
                    f"amount={amount}"
                )
                return result

        except Exception as e:
            logger.error(f"Paystack transfer error: {str(e)}")
            raise

    async def verify_transfer(self, reference: str) -> Dict[str, Any]:
        """Verify a transfer status."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/transfer/verify/{reference}",
                    headers=self._headers(),
                    timeout=30,
                )
                return response.json()

        except Exception as e:
            logger.error(f"Paystack verify transfer error: {str(e)}")
            raise

    async def list_banks(self, country: str = "kenya") -> Dict[str, Any]:
        """List available banks."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/bank?country={country}",
                    headers=self._headers(),
                    timeout=30,
                )
                return response.json()

        except Exception as e:
            logger.error(f"Paystack list banks error: {str(e)}")
            raise

    async def check_balance(self) -> Dict[str, Any]:
        """Check Paystack balance."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/balance",
                    headers=self._headers(),
                    timeout=30,
                )
                return response.json()

        except Exception as e:
            logger.error(f"Paystack balance check error: {str(e)}")
            raise

    @staticmethod
    def parse_webhook(webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Paystack webhook payload."""
        data = webhook_data.get("data", {})
        return {
            "reference": data.get("reference"),
            "status": data.get("status"),
            "amount": data.get("amount"),
            "currency": data.get("currency"),
            "transfer_code": data.get("transfer_code"),
            "success": data.get("status") == "success",
        }
