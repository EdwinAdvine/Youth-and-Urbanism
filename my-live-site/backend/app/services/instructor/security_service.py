"""
Instructor Security Service

2FA management (TOTP, SMS OTP, Email OTP), login history, and security settings.
"""

import logging
import secrets
import base64
from typing import List, Dict, Any, Optional
from datetime import datetime

try:
    import pyotp
except ImportError:
    pyotp = None  # Lazy: only needed when TOTP functions are called

from cryptography.fernet import Fernet

import redis.asyncio as aioredis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.instructor.instructor_2fa import InstructorTwoFactor, InstructorLoginHistory
from app.models.user import User
from app.config import settings

logger = logging.getLogger(__name__)


def _get_fernet() -> Fernet:
    """Get Fernet encryption instance using app encryption key."""
    # Ensure key is 32 bytes, base64-encoded (Fernet requirement)
    key = settings.encryption_key[:32].encode()
    key_b64 = base64.urlsafe_b64encode(key)
    return Fernet(key_b64)


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

        # Encrypt before storing
        fernet = _get_fernet()
        twofa.totp_secret = fernet.encrypt(secret.encode()).decode()
        twofa.backup_codes = [fernet.encrypt(code.encode()).decode() for code in backup_codes]

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

        # Decrypt secret
        fernet = _get_fernet()
        decrypted_secret = fernet.decrypt(twofa.totp_secret.encode()).decode()
        totp = pyotp.TOTP(decrypted_secret)
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
    Enable SMS OTP (via Africa's Talking).
    Sends a verification OTP to the provided phone number and stores
    the code in Redis with a 5-minute TTL.
    """
    try:
        # Get or create 2FA record
        query = select(InstructorTwoFactor).where(
            InstructorTwoFactor.user_id == user_id
        )
        result = await db.execute(query)
        twofa = result.scalar_one_or_none()

        if not twofa:
            twofa = InstructorTwoFactor(user_id=user_id)
            db.add(twofa)

        # Generate OTP code
        otp_code = secrets.token_hex(3).upper()[:6]  # 6-char hex code

        # Store OTP in Redis with 5-minute TTL
        try:
            r = aioredis.from_url(settings.redis_url, decode_responses=True)
            await r.setex(f"2fa:sms:{user_id}", 300, otp_code)
            await r.aclose()
        except Exception as redis_err:
            logger.warning(f"Redis OTP storage failed: {redis_err}")

        # Send OTP via Africa's Talking
        try:
            from app.utils.sms.africas_talking import send_otp
            await send_otp(phone, otp_code)
        except Exception as sms_err:
            logger.error(f"SMS send failed: {sms_err}")
            return False

        # Update 2FA record with phone, mark as pending verification
        twofa.sms_phone = phone

        await db.commit()
        logger.info(f"SMS OTP setup initiated for user {user_id}")
        return True

    except Exception as e:
        logger.error(f"Error enabling SMS OTP: {str(e)}")
        await db.rollback()
        return False


async def verify_sms_otp(
    db: AsyncSession,
    user_id: str,
    code: str
) -> bool:
    """Verify SMS OTP code from Redis."""
    try:
        r = aioredis.from_url(settings.redis_url, decode_responses=True)
        stored_code = await r.get(f"2fa:sms:{user_id}")
        await r.aclose()

        if stored_code and stored_code == code:
            # Enable SMS 2FA
            query = select(InstructorTwoFactor).where(
                InstructorTwoFactor.user_id == user_id
            )
            result = await db.execute(query)
            twofa = result.scalar_one_or_none()
            if twofa:
                twofa.sms_enabled = True
                twofa.last_verified_at = datetime.utcnow()
                await db.commit()

            # Delete used OTP
            r = aioredis.from_url(settings.redis_url, decode_responses=True)
            await r.delete(f"2fa:sms:{user_id}")
            await r.aclose()
            return True
        return False
    except Exception as e:
        logger.error(f"Error verifying SMS OTP: {str(e)}")
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
        # Simple IP geolocation (best-effort)
        location = None
        try:
            import httpx
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"http://ip-api.com/json/{ip_address}?fields=city,country")
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("city"):
                        location = f"{data['city']}, {data['country']}"
        except Exception:
            pass  # Best-effort, don't fail login logging

        log_entry = InstructorLoginHistory(
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            failure_reason=failure_reason,
            two_factor_method=two_factor_method,
            location=location
        )
        db.add(log_entry)
        await db.commit()

    except Exception as e:
        logger.error(f"Error logging login attempt: {str(e)}")


async def get_login_history(
    db: AsyncSession,
    user_id: str,
    limit: int = 50
) -> List[InstructorLoginHistory]:
    """
    Get login history for user.
    """
    try:
        query = select(InstructorLoginHistory).where(
            InstructorLoginHistory.user_id == user_id
        ).order_by(InstructorLoginHistory.created_at.desc()).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()

    except Exception as e:
        logger.error(f"Error getting login history: {str(e)}")
        return []
