"""
Instructor Security Service

2FA management (TOTP, SMS OTP, Email OTP), login history, and security settings.
"""

import logging
import secrets
from typing import List, Dict, Any, Optional
from datetime import datetime

import pyotp
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.instructor.instructor_2fa import InstructorTwoFactor, LoginHistory
from app.models.user import User

logger = logging.getLogger(__name__)


async def setup_totp(
    db: AsyncSession,
    user_id: str
) -> Dict[str, Any]:
    """
    Generate TOTP secret and QR code URI for 2FA setup.
    """
    try:
        # Get or create 2FA record
        query = select(InstructorTwoFactor).where(
            InstructorTwoFactor.user_id == user_id
        )
        result = await db.execute(query)
        twofa = result.scalar_one_or_none()

        if not twofa:
            twofa = InstructorTwoFactor(
                user_id=user_id,
                totp_enabled=False,
                sms_enabled=False,
                email_otp_enabled=False
            )
            db.add(twofa)

        # Generate new secret
        secret = pyotp.random_base32()

        # Get user email for QR code
        user_query = select(User).where(User.id == user_id)
        user_result = await db.execute(user_query)
        user = user_result.scalar_one()

        # Generate QR code URI
        totp = pyotp.TOTP(secret)
        qr_uri = totp.provisioning_uri(
            name=user.email,
            issuer_name="Urban Home School"
        )

        # Generate backup codes
        backup_codes = [secrets.token_hex(4) for _ in range(10)]

        # Store encrypted secret and backup codes
        # TODO: Encrypt before storing
        twofa.totp_secret = secret
        twofa.backup_codes = backup_codes

        await db.commit()

        return {
            "secret": secret,
            "qr_code_uri": qr_uri,
            "backup_codes": backup_codes
        }

    except Exception as e:
        logger.error(f"Error setting up TOTP: {str(e)}")
        await db.rollback()
        raise


async def verify_totp(
    db: AsyncSession,
    user_id: str,
    code: str
) -> bool:
    """
    Verify TOTP code.
    """
    try:
        query = select(InstructorTwoFactor).where(
            InstructorTwoFactor.user_id == user_id
        )
        result = await db.execute(query)
        twofa = result.scalar_one_or_none()

        if not twofa or not twofa.totp_secret:
            return False

        # TODO: Decrypt secret
        totp = pyotp.TOTP(twofa.totp_secret)
        is_valid = totp.verify(code, valid_window=1)

        if is_valid:
            twofa.last_verified_at = datetime.utcnow()
            await db.commit()

        return is_valid

    except Exception as e:
        logger.error(f"Error verifying TOTP: {str(e)}")
        return False


async def enable_totp(
    db: AsyncSession,
    user_id: str,
    code: str
) -> bool:
    """
    Enable TOTP 2FA after verification.
    """
    try:
        is_valid = await verify_totp(db, user_id, code)

        if is_valid:
            query = select(InstructorTwoFactor).where(
                InstructorTwoFactor.user_id == user_id
            )
            result = await db.execute(query)
            twofa = result.scalar_one()

            twofa.totp_enabled = True
            await db.commit()

            logger.info(f"TOTP enabled for user {user_id}")
            return True

        return False

    except Exception as e:
        logger.error(f"Error enabling TOTP: {str(e)}")
        await db.rollback()
        return False


async def enable_sms_otp(
    db: AsyncSession,
    user_id: str,
    phone: str
) -> bool:
    """
    Enable SMS OTP (via Africa's Talking or Twilio).
    """
    try:
        # TODO: Integrate with Africa's Talking API
        # Send verification SMS

        query = select(InstructorTwoFactor).where(
            InstructorTwoFactor.user_id == user_id
        )
        result = await db.execute(query)
        twofa = result.scalar_one_or_none()

        if not twofa:
            twofa = InstructorTwoFactor(user_id=user_id)
            db.add(twofa)

        twofa.sms_phone = phone
        # Store verification code in Redis with TTL
        # TODO: Redis integration

        await db.commit()
        logger.info(f"SMS OTP setup initiated for user {user_id}")
        return True

    except Exception as e:
        logger.error(f"Error enabling SMS OTP: {str(e)}")
        await db.rollback()
        return False


async def log_login_attempt(
    db: AsyncSession,
    user_id: str,
    ip_address: str,
    user_agent: str,
    success: bool,
    failure_reason: Optional[str] = None,
    two_factor_method: Optional[str] = None
) -> None:
    """
    Log login attempt for security audit.
    """
    try:
        log_entry = LoginHistory(
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            failure_reason=failure_reason,
            two_factor_method=two_factor_method,
            # TODO: Get location from IP geolocation service
            location=None
        )
        db.add(log_entry)
        await db.commit()

    except Exception as e:
        logger.error(f"Error logging login attempt: {str(e)}")


async def get_login_history(
    db: AsyncSession,
    user_id: str,
    limit: int = 50
) -> List[LoginHistory]:
    """
    Get login history for user.
    """
    try:
        query = select(LoginHistory).where(
            LoginHistory.user_id == user_id
        ).order_by(LoginHistory.created_at.desc()).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()

    except Exception as e:
        logger.error(f"Error getting login history: {str(e)}")
        return []
