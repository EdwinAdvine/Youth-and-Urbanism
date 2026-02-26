"""
Flutterwave Payout Client

Bank transfer payouts via Flutterwave API.
Supports KES bank transfers, mobile money, and international transfers.
"""

import logging
from typing import Dict, Any, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3"


class FlutterwaveClient:
    """Flutterwave payment gateway client for bank transfers."""

    def __init__(self):
        self.secret_key = getattr(settings, "flutterwave_secret_key", "")
        self.base_url = FLUTTERWAVE_BASE_URL

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }

    async def create_transfer(
        self,
        account_bank: str,
        account_number: str,
        amount: float,
        currency: str = "KES",
        narration: str = "Instructor payout",
        reference: Optional[str] = None,
        beneficiary_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Create a bank transfer payout.

        Args:
            account_bank: Bank code (e.g., "044" for Access Bank)
            account_number: Recipient bank account number
            amount: Transfer amount
            currency: Currency code (KES, NGN, USD, etc.)
            narration: Transfer description
            reference: Unique reference for idempotency
            beneficiary_name: Recipient full name

        Returns:
            Flutterwave transfer response
        """
        try:
            payload = {
                "account_bank": account_bank,
                "account_number": account_number,
                "amount": amount,
                "currency": currency,
                "narration": narration,
                "reference": reference or f"payout-{int(__import__('time').time())}",
                "callback_url": getattr(settings, "flutterwave_callback_url", ""),
            }

            if beneficiary_name:
                payload["beneficiary_name"] = beneficiary_name

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/transfers",
                    json=payload,
                    headers=self._headers(),
                    timeout=30,
                )

                result = response.json()
                logger.info(
                    f"Flutterwave transfer: status={result.get('status')} "
                    f"amount={amount} {currency}"
                )
                return result

        except Exception as e:
            logger.error(f"Flutterwave transfer error: {str(e)}")
            raise

    async def create_mobile_money_transfer(
        self,
        phone_number: str,
        amount: float,
        currency: str = "KES",
        network: str = "MPESA",
        narration: str = "Instructor payout",
        reference: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a mobile money transfer (M-Pesa, Airtel Money, etc.)."""
        try:
            payload = {
                "account_bank": network,
                "account_number": phone_number,
                "amount": amount,
                "currency": currency,
                "narration": narration,
                "reference": reference or f"momo-{int(__import__('time').time())}",
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/transfers",
                    json=payload,
                    headers=self._headers(),
                    timeout=30,
                )
                return response.json()

        except Exception as e:
            logger.error(f"Flutterwave mobile money error: {str(e)}")
            raise

    async def get_transfer(self, transfer_id: str) -> Dict[str, Any]:
        """Get transfer status by ID."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/transfers/{transfer_id}",
                    headers=self._headers(),
                    timeout=30,
                )
                return response.json()

        except Exception as e:
            logger.error(f"Flutterwave get transfer error: {str(e)}")
            raise

    async def get_banks(self, country: str = "KE") -> Dict[str, Any]:
        """Get list of banks for a country."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/banks/{country}",
                    headers=self._headers(),
                    timeout=30,
                )
                return response.json()

        except Exception as e:
            logger.error(f"Flutterwave get banks error: {str(e)}")
            raise

    @staticmethod
    def parse_webhook(webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Flutterwave webhook payload."""
        data = webhook_data.get("data", {})
        return {
            "id": data.get("id"),
            "reference": data.get("reference"),
            "status": data.get("status"),
            "amount": data.get("amount"),
            "currency": data.get("currency"),
            "complete_message": data.get("complete_message"),
            "success": data.get("status") == "SUCCESSFUL",
        }
