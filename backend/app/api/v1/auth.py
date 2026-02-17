"""
Authentication API Endpoints

This module defines FastAPI routes for user authentication including:
- User registration (with automatic AI tutor creation for students)
- User login (with AI tutor verification for students)
- Token refresh
- Current user retrieval
"""

import logging
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Body, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import (
    UserCreate, UserLogin, TokenResponse, UserResponse,
    PasswordReset, PasswordResetConfirm, EmailVerification,
)
from app.services import auth_service
from app.services.email_service import send_verification_email, send_password_reset_email
from app.utils.security import get_current_user, decode_token, verify_token
from app.models.user import User
from app.config import settings


# ---------------------------------------------------------------------------
# Cookie helpers for httpOnly token storage
# ---------------------------------------------------------------------------

def _set_auth_cookies(response: JSONResponse, access_token: str, refresh_token: str) -> None:
    """Set httpOnly, Secure, SameSite cookies for access and refresh tokens."""
    is_prod = settings.is_production
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=is_prod,
        samesite="strict" if is_prod else "lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_prod,
        samesite="strict" if is_prod else "lax",
        max_age=settings.refresh_token_expire_days * 86400,
        path="/api/v1/auth",  # Only sent to auth endpoints
    )


def _clear_auth_cookies(response: JSONResponse) -> None:
    """Remove auth cookies."""
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/api/v1/auth")

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)

# ---------------------------------------------------------------------------
# Redis client for token blacklist
# ---------------------------------------------------------------------------
_redis_client = None


async def _get_redis():
    """Lazily initialise and return an async Redis client."""
    global _redis_client
    if _redis_client is None:
        try:
            import redis.asyncio as aioredis
            _redis_client = aioredis.from_url(
                settings.redis_url, decode_responses=True
            )
        except Exception as e:
            logger.warning(f"Redis unavailable for token blacklist: {e}")
    return _redis_client


async def _check_auth_rate_limit(key: str, max_attempts: int, window_seconds: int) -> bool:
    """
    Rate-limit auth endpoints per key (e.g. IP or email).
    Returns True if allowed, raises HTTPException 429 if limit exceeded.
    """
    r = await _get_redis()
    if r is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable. Please try again later.",
        )

    try:
        redis_key = f"auth_ratelimit:{key}"
        current = await r.incr(redis_key)
        if current == 1:
            await r.expire(redis_key, window_seconds)
        if current > max_attempts:
            ttl = await r.ttl(redis_key)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many attempts. Try again in {ttl} seconds.",
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Auth rate limit check failed: {e}")

    return True


# ---------------------------------------------------------------------------
# Account lockout after repeated failed login attempts
# ---------------------------------------------------------------------------

ACCOUNT_LOCKOUT_THRESHOLD = 10  # Lock after 10 failed attempts
ACCOUNT_LOCKOUT_WINDOW = 3600   # 1-hour window for counting failures
ACCOUNT_LOCKOUT_DURATION = 1800  # 30-minute lockout duration


async def _check_account_lockout(email: str) -> None:
    """
    Check if an account is locked due to too many failed login attempts.
    Raises HTTPException 423 if the account is locked.
    """
    r = await _get_redis()
    if r is None:
        return

    try:
        lockout_key = f"account_lockout:{email.lower()}"
        if await r.exists(lockout_key):
            ttl = await r.ttl(lockout_key)
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Account temporarily locked due to too many failed login attempts. Try again in {ttl} seconds.",
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Account lockout check failed: {e}")


async def _record_failed_login(email: str) -> None:
    """
    Record a failed login attempt. If the threshold is exceeded,
    lock the account for ACCOUNT_LOCKOUT_DURATION seconds.
    """
    r = await _get_redis()
    if r is None:
        return

    try:
        fail_key = f"login_failures:{email.lower()}"
        current = await r.incr(fail_key)
        if current == 1:
            await r.expire(fail_key, ACCOUNT_LOCKOUT_WINDOW)

        if current >= ACCOUNT_LOCKOUT_THRESHOLD:
            lockout_key = f"account_lockout:{email.lower()}"
            await r.setex(lockout_key, ACCOUNT_LOCKOUT_DURATION, "locked")
            await r.delete(fail_key)  # Reset counter
            logger.warning(f"Account locked for {email} after {current} failed attempts")
    except Exception as e:
        logger.warning(f"Failed to record login failure: {e}")


async def _clear_failed_logins(email: str) -> None:
    """Clear the failed login counter after a successful login."""
    r = await _get_redis()
    if r is None:
        return

    try:
        await r.delete(f"login_failures:{email.lower()}")
    except Exception:
        pass


async def is_token_blacklisted(token: str) -> bool:
    """Check whether a JWT has been blacklisted (logged out).

    Fail-closed: returns True (blacklisted) when Redis is unavailable,
    so a logged-out token can never be reused even during an outage.
    """
    r = await _get_redis()
    if r is None:
        logger.warning("Redis unavailable — treating token as blacklisted (fail-closed)")
        return True
    try:
        return await r.exists(f"blacklist:{token}") == 1
    except Exception:
        logger.warning("Redis error during blacklist check — treating token as blacklisted (fail-closed)")
        return True


# Create router with authentication prefix and tags
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account. Automatically creates an AI tutor for student accounts."
)
async def register(
    request: Request,
    user_data: UserCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Register a new user and send verification email.

    Args:
        user_data: User registration data (email, password, name, role, etc.)
        background_tasks: FastAPI background tasks for async email sending
        db: Database session

    Returns:
        UserResponse: Created user data

    Raises:
        HTTPException 400: If email already exists or validation fails
    """
    # Rate limit: 5 registrations per IP per hour
    client_ip = request.client.host if request.client else "unknown"
    await _check_auth_rate_limit(f"register:{client_ip}", max_attempts=5, window_seconds=3600)

    try:
        user = await auth_service.register_user(user_data, db)

        # Send verification email in background
        user_name = (user.profile_data or {}).get("full_name")
        background_tasks.add_task(
            send_verification_email, user.email, str(user.id), user_name
        )

        return UserResponse.model_validate(user)
    except HTTPException:
        raise
    except ValueError as e:
        # Registration ValueErrors are user-facing validation messages (e.g. "Email already registered")
        error_msg = str(e)
        safe_messages = [
            "email already registered",
            "invalid email",
            "password too short",
            "password too weak",
            "invalid role",
        ]
        detail = error_msg if any(msg in error_msg.lower() for msg in safe_messages) else "Registration validation failed"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )
    except Exception as e:
        logger.error(f"Registration failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User login",
    description="Authenticate user and return access/refresh tokens. Ensures AI tutor exists for student accounts."
)
async def login(
    request: Request,
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user and return JWT tokens (also set as httpOnly cookies).

    Args:
        request: FastAPI Request (for rate limiting)
        credentials: Login credentials (email and password)
        db: Database session

    Returns:
        JSONResponse with token data and httpOnly cookies set

    Raises:
        HTTPException 401: If credentials are invalid
    """
    # Rate limit: 10 login attempts per IP per hour, 5 per email per 15 min
    client_ip = request.client.host if request.client else "unknown"
    await _check_auth_rate_limit(f"login:ip:{client_ip}", max_attempts=10, window_seconds=3600)
    await _check_auth_rate_limit(f"login:email:{credentials.email}", max_attempts=5, window_seconds=900)

    # Check if account is locked due to too many failed attempts
    await _check_account_lockout(credentials.email)

    try:
        token_data = await auth_service.authenticate_user(credentials, db)

        # Successful login — clear failed attempt counter
        await _clear_failed_logins(credentials.email)

        # Build JSON body (backward compatible — tokens still in body for mobile/API clients)
        body = {
            "access_token": token_data.access_token,
            "refresh_token": token_data.refresh_token,
            "token_type": token_data.token_type,
            "expires_in": token_data.expires_in,
        }
        response = JSONResponse(content=body, status_code=200)

        # Also set httpOnly cookies for browser clients
        _set_auth_cookies(response, token_data.access_token, token_data.refresh_token)

        return response
    except HTTPException as e:
        # Record failed login attempt for account lockout (only for auth failures)
        if e.status_code in (401, 403):
            await _record_failed_login(credentials.email)
        raise
    except ValueError as e:
        # Record failed login attempt
        await _record_failed_login(credentials.email)
        logger.warning(f"Login ValueError for {credentials.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except Exception as e:
        logger.error(f"Login failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Generate a new access token using a valid refresh token."
)
async def refresh_token(
    request: Request,
    refresh_token_data: dict = Body(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token.

    Accepts refresh_token from either:
    1. Request body ({"refresh_token": "..."}) — for API/mobile clients
    2. httpOnly cookie — for browser clients

    Args:
        request: FastAPI Request (for cookie access)
        refresh_token_data: Optional dict containing refresh_token
        db: Database session

    Returns:
        JSONResponse with new tokens and httpOnly cookies

    Raises:
        HTTPException 401: If refresh token is invalid or expired
    """
    # Try body first, then cookie
    rt = None
    if refresh_token_data:
        rt = refresh_token_data.get("refresh_token")
    if not rt:
        rt = request.cookies.get("refresh_token")

    if not rt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token is required"
        )

    try:
        token_data = await auth_service.refresh_access_token(rt, db)

        body = {
            "access_token": token_data.access_token,
            "refresh_token": token_data.refresh_token,
            "token_type": token_data.token_type,
            "expires_in": token_data.expires_in,
        }
        response = JSONResponse(content=body, status_code=200)
        _set_auth_cookies(response, token_data.access_token, token_data.refresh_token)

        return response
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Token refresh ValueError: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except Exception as e:
        logger.error(f"Token refresh failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user",
    description="Retrieve the currently authenticated user's information."
)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
) -> UserResponse:
    """
    Get current authenticated user.

    Args:
        current_user: Currently authenticated user (injected by dependency)

    Returns:
        UserResponse: Current user data

    Raises:
        HTTPException 401: If token is invalid or user not found
    """
    return UserResponse.model_validate(current_user)


# ============================================================================
# Email Verification
# ============================================================================

@router.post(
    "/verify-email",
    status_code=status.HTTP_200_OK,
    summary="Verify email address",
    description="Verify a user's email address using the token sent during registration.",
)
async def verify_email(
    data: EmailVerification,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Verify user's email using the verification token.

    Args:
        data: Contains the verification token from the email link
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException 400: If token is invalid, expired, or email already verified
    """
    try:
        payload = verify_token(data.token, token_type="email_verification")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token",
        )

    result = await db.execute(
        select(User).where(User.id == UUID(user_id_str))
    )
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.is_verified:
        return {"message": "Email is already verified"}

    user.is_verified = True
    await db.commit()

    return {"message": "Email verified successfully"}


@router.post(
    "/resend-verification",
    status_code=status.HTTP_200_OK,
    summary="Resend verification email",
    description="Resend the email verification link to the current user.",
)
async def resend_verification(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Resend email verification link.

    Args:
        background_tasks: FastAPI background tasks
        current_user: Authenticated user

    Returns:
        Success message
    """
    if current_user.is_verified:
        return {"message": "Email is already verified"}

    user_name = (current_user.profile_data or {}).get("full_name")
    background_tasks.add_task(
        send_verification_email, current_user.email, str(current_user.id), user_name
    )

    return {"message": "Verification email sent"}


# ============================================================================
# Password Reset
# ============================================================================

@router.post(
    "/forgot-password",
    status_code=status.HTTP_200_OK,
    summary="Request password reset",
    description="Send a password reset link to the provided email address.",
)
async def forgot_password(
    request: Request,
    data: PasswordReset,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Initiate password reset by sending a reset link email.

    Always returns success to avoid revealing whether an email exists.

    Args:
        request: FastAPI Request (for rate limiting)
        data: Contains the email address
        background_tasks: FastAPI background tasks
        db: Database session

    Returns:
        Success message (always, for security)
    """
    # Rate limit: 3 password reset requests per IP per hour
    client_ip = request.client.host if request.client else "unknown"
    await _check_auth_rate_limit(f"forgot:ip:{client_ip}", max_attempts=3, window_seconds=3600)

    result = await db.execute(
        select(User).where(User.email == data.email, User.is_active == True)
    )
    user = result.scalars().first()

    if user:
        user_name = (user.profile_data or {}).get("full_name")
        background_tasks.add_task(
            send_password_reset_email, user.email, str(user.id), user_name
        )

    # Always return success to avoid email enumeration
    return {"message": "If an account exists with that email, a reset link has been sent"}


@router.post(
    "/reset-password",
    status_code=status.HTTP_200_OK,
    summary="Reset password",
    description="Set a new password using the reset token from the email link.",
)
async def reset_password(
    data: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Reset password using the token from the reset email.

    Args:
        data: Contains reset token and new password
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException 400: If token is invalid or expired
    """
    success = await auth_service.confirm_password_reset(
        reset_token=data.token,
        new_password=data.new_password,
        db=db,
    )

    if success:
        return {"message": "Password reset successfully"}

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Failed to reset password",
    )


# ============================================================================
# Logout (Token Blacklist)
# ============================================================================

@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout user",
    description="Invalidate the access and refresh tokens by adding them to the Redis blacklist.",
)
async def logout(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Logout the current user by blacklisting their access token and clearing cookies.

    The token is stored in Redis with a TTL equal to its remaining lifetime
    so that it cannot be reused after logout.
    """
    # With auto_error=False, credentials is None when no token is present.
    # For logout, still clear cookies even without a valid token.
    if credentials is None:
        response = JSONResponse(content={"message": "Logged out successfully"})
        _clear_auth_cookies(response)
        return response

    token = credentials.credentials

    try:
        payload = verify_token(token, token_type="access")
    except HTTPException:
        # Token is already invalid/expired - still clear cookies
        response = JSONResponse(content={"message": "Logged out successfully"})
        _clear_auth_cookies(response)
        return response

    # Calculate remaining TTL so the blacklist entry auto-expires
    import time
    exp = payload.get("exp", 0)
    ttl = max(int(exp - time.time()), 1)

    r = await _get_redis()
    if r is not None:
        try:
            # Blacklist access token
            await r.setex(f"blacklist:{token}", ttl, "1")

            # Also blacklist refresh token if present in cookie
            refresh_token = request.cookies.get("refresh_token")
            if refresh_token:
                try:
                    # Refresh tokens have 7-day expiry
                    refresh_payload = verify_token(refresh_token, token_type="refresh")
                    refresh_exp = refresh_payload.get("exp", 0)
                    refresh_ttl = max(int(refresh_exp - time.time()), 1)
                    await r.setex(f"blacklist:{refresh_token}", refresh_ttl, "1")
                except Exception as e:
                    logger.warning(f"Failed to blacklist refresh token: {e}")
        except Exception as e:
            logger.warning(f"Failed to blacklist tokens in Redis: {e}")

    response = JSONResponse(content={"message": "Logged out successfully"})
    _clear_auth_cookies(response)
    return response
