"""
Africa's Talking SMS client for sending SMS messages and OTP codes.

API Documentation: https://developers.africastalking.com/docs/sms/sending
- Production URL: https://api.africastalking.com/version1/messaging
- Sandbox URL: https://api.sandbox.africastalking.com/version1/messaging
- Auth: API Key header + username in form data
"""

import logging
import re
from typing import Any, Dict

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

PRODUCTION_URL = "https://api.africastalking.com/version1/messaging"
SANDBOX_URL = "https://api.sandbox.africastalking.com/version1/messaging"


def _get_base_url() -> str:
    """Return the appropriate API URL based on the configured username."""
    if settings.africas_talking_username == "sandbox":
        return SANDBOX_URL
    return PRODUCTION_URL


def format_phone_number(phone: str) -> str:
    """Convert a Kenyan phone number to E.164 format (+254...).

    Supported input formats:
        - 0712345678   -> +254712345678
        - 254712345678 -> +254712345678
        - +254712345678 -> +254712345678

    Args:
        phone: The phone number string to format.

    Returns:
        The phone number in E.164 format.

    Raises:
        ValueError: If the phone number format is not recognized.
    """
    # Strip whitespace and dashes
    cleaned = re.sub(r"[\s\-]", "", phone.strip())

    if cleaned.startswith("+254"):
        formatted = cleaned
    elif cleaned.startswith("254"):
        formatted = f"+{cleaned}"
    elif cleaned.startswith("0"):
        formatted = f"+254{cleaned[1:]}"
    else:
        raise ValueError(
            f"Unrecognized phone number format: {phone}. "
            "Expected a Kenyan number starting with 0, 254, or +254."
        )

    # Basic validation: +254 followed by 9 digits
    if not re.match(r"^\+254\d{9}$", formatted):
        raise ValueError(
            f"Invalid Kenyan phone number: {phone}. "
            "Expected 9 digits after the +254 prefix."
        )

    return formatted


async def send_sms(phone: str, message: str) -> Dict[str, Any]:
    """Send an SMS message via the Africa's Talking API.

    Args:
        phone: Recipient phone number (any supported Kenyan format).
        message: The SMS message body.

    Returns:
        A dict containing the API response with delivery status.

    Raises:
        ValueError: If the phone number format is invalid.
        httpx.HTTPStatusError: If the API returns a non-2xx status.
    """
    formatted_phone = format_phone_number(phone)
    base_url = _get_base_url()

    headers = {
        "apiKey": settings.africas_talking_api_key or "",
        "Accept": "application/json",
    }

    form_data = {
        "username": settings.africas_talking_username,
        "to": formatted_phone,
        "message": message,
    }

    if settings.africas_talking_sender_id:
        form_data["from"] = settings.africas_talking_sender_id

    logger.info(
        "Sending SMS to %s via Africa's Talking (%s)",
        formatted_phone,
        "sandbox" if base_url == SANDBOX_URL else "production",
    )

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                base_url,
                headers=headers,
                data=form_data,
            )
            response.raise_for_status()
            result = response.json()

        logger.info(
            "SMS sent successfully to %s: %s",
            formatted_phone,
            result,
        )
        return result

    except httpx.HTTPStatusError as exc:
        logger.error(
            "Africa's Talking API error (HTTP %d) sending SMS to %s: %s",
            exc.response.status_code,
            formatted_phone,
            exc.response.text,
        )
        raise
    except httpx.RequestError as exc:
        logger.error(
            "Network error sending SMS to %s via Africa's Talking: %s",
            formatted_phone,
            str(exc),
        )
        raise


async def send_otp(phone: str, code: str) -> Dict[str, Any]:
    """Send a one-time password (OTP) verification code via SMS.

    Args:
        phone: Recipient phone number (any supported Kenyan format).
        code: The OTP code to send.

    Returns:
        A dict containing the API response with delivery status.
    """
    message = (
        f"Your Urban Home School verification code is: {code}. "
        f"Valid for 5 minutes."
    )
    return await send_sms(phone, message)
