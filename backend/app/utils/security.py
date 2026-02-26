"""
Security utilities for authentication, authorization, and encryption.

This module provides:
- Password hashing and verification using bcrypt
- JWT token creation and verification (access and refresh tokens)
- API key encryption/decryption using Fernet symmetric encryption
- Role-based access control decorator
"""

from __future__ import annotations

import logging
import uuid as _uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Dict, List, Optional, Union
from functools import wraps

from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import bcrypt as _bcrypt
from cryptography.fernet import Fernet, InvalidToken
import base64
import hashlib

from app.config import settings
from app.database import get_db

logger = logging.getLogger(__name__)

# HTTP Bearer token security scheme
# auto_error=False so missing tokens return 401 (via our handler) instead of
# FastAPI's default 403, keeping status codes consistent for the frontend interceptor.
security = HTTPBearer(auto_error=False)

# Initialize Fernet cipher for API key encryption
def _get_fernet_key() -> bytes:
    """
    Generate a Fernet-compatible key from the encryption_key setting.

    Fernet requires a URL-safe base64-encoded 32-byte key.
    If encryption_key is not properly formatted, we'll derive one.
    """
    try:
        encryption_key = getattr(settings, 'encryption_key', settings.secret_key)

        # If the key is already properly formatted for Fernet, use it
        if len(encryption_key) == 44 and encryption_key.endswith('='):
            try:
                return base64.urlsafe_b64decode(encryption_key)
            except Exception:
                pass

        # Otherwise, derive a Fernet key from the encryption key
        key_bytes = encryption_key.encode('utf-8')
        derived_key = hashlib.sha256(key_bytes).digest()
        return base64.urlsafe_b64encode(derived_key)
    except Exception as e:
        raise ValueError(f"Failed to initialize encryption key: {str(e)}")


try:
    fernet = Fernet(_get_fernet_key())
except Exception as e:
    if getattr(settings, 'is_production', False):
        raise RuntimeError(
            f"FATAL: Failed to initialize encryption. Set a valid ENCRYPTION_KEY: {str(e)}"
        )
    # In development, generate a temporary key but warn loudly
    logger.warning(
        "Using generated encryption key — encrypted data will NOT persist across restarts. "
        "Set ENCRYPTION_KEY in your environment for data persistence."
    )
    fernet = Fernet(Fernet.generate_key())


# ============================================================================
# Password Hashing
# ============================================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.

    Uses bcrypt directly to avoid passlib version incompatibilities.

    Args:
        plain_password: The plain text password to verify
        hashed_password: The bcrypt hashed password from database

    Returns:
        True if password matches, False otherwise
    """
    try:
        return _bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a plain password using bcrypt.

    Uses bcrypt directly to avoid passlib version incompatibilities.

    Args:
        password: The plain text password to hash

    Returns:
        The bcrypt hashed password

    Raises:
        ValueError: If password is empty or invalid
    """
    if not password or not password.strip():
        raise ValueError("Password cannot be empty")

    return _bcrypt.hashpw(
        password.encode("utf-8"),
        _bcrypt.gensalt(),
    ).decode("utf-8")


# ============================================================================
# JWT Token Management
# ============================================================================

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.

    Args:
        data: Dictionary of claims to encode in the token (e.g., {"sub": user_id})
        expires_delta: Optional custom expiration time. Defaults to ACCESS_TOKEN_EXPIRE_MINUTES

    Returns:
        Encoded JWT token string

    Example:
        token = create_access_token(
            data={"sub": str(user.id), "role": user.role},
            expires_delta=timedelta(minutes=30)
        )
    """
    to_encode = data.copy()

    # Set expiration time
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    now = datetime.now(timezone.utc)
    to_encode.update({
        "exp": expire,
        "iat": now,
        "nbf": now,
        "jti": str(_uuid.uuid4()),
    })

    # Only set type if not already specified (for email verification, password reset, etc.)
    if "type" not in to_encode:
        to_encode["type"] = "access"

    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )

    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Create a JWT refresh token with longer expiration (7 days).

    Args:
        data: Dictionary of claims to encode in the token

    Returns:
        Encoded JWT refresh token string

    Example:
        refresh_token = create_refresh_token({"sub": str(user.id)})
    """
    to_encode = data.copy()

    # Refresh tokens expire after 7 days
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=7)

    to_encode.update({
        "exp": expire,
        "iat": now,
        "nbf": now,
        "jti": str(_uuid.uuid4()),
        "type": "refresh"
    })

    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )

    return encoded_jwt


def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
    """
    Verify and decode a JWT token.

    Args:
        token: The JWT token string to verify
        token_type: Expected token type ("access" or "refresh")

    Returns:
        Dictionary containing the decoded token payload

    Raises:
        HTTPException: If token is invalid, expired, or wrong type

    Example:
        payload = verify_token(token, token_type="access")
        user_id = payload.get("sub")
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )

        # Verify token type
        if payload.get("type") != token_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected {token_type}",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check required claims (sub and jti)
        if payload.get("sub") is None:
            raise credentials_exception
        if payload.get("jti") is None:
            raise credentials_exception

        return payload

    except JWTError as e:
        if "expired" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        raise credentials_exception


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode a JWT token without verification (for inspection purposes only).

    Args:
        token: The JWT token string to decode

    Returns:
        Dictionary containing the decoded payload, or None if invalid

    Warning:
        This function does NOT verify the token signature.
        Use verify_token() for authentication purposes.
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
            options={"verify_signature": False}
        )
        return payload
    except JWTError:
        return None


# ============================================================================
# API Key Encryption
# ============================================================================

def encrypt_api_key(api_key: str) -> str:
    """
    Encrypt an API key using Fernet symmetric encryption.

    Args:
        api_key: The plain text API key to encrypt

    Returns:
        Base64-encoded encrypted API key

    Raises:
        ValueError: If api_key is empty

    Example:
        encrypted_key = encrypt_api_key("sk-1234567890abcdef")
        # Store encrypted_key in database
    """
    if not api_key or not api_key.strip():
        raise ValueError("API key cannot be empty")

    try:
        encrypted_bytes = fernet.encrypt(api_key.encode('utf-8'))
        return encrypted_bytes.decode('utf-8')
    except Exception as e:
        raise ValueError(f"Failed to encrypt API key: {str(e)}")


def decrypt_api_key(encrypted_key: str) -> str:
    """
    Decrypt an encrypted API key.

    Args:
        encrypted_key: The base64-encoded encrypted API key

    Returns:
        The decrypted plain text API key

    Raises:
        ValueError: If decryption fails or key is invalid

    Example:
        plain_key = decrypt_api_key(encrypted_key_from_db)
        # Use plain_key to make API calls
    """
    if not encrypted_key or not encrypted_key.strip():
        raise ValueError("Encrypted key cannot be empty")

    try:
        decrypted_bytes = fernet.decrypt(encrypted_key.encode('utf-8'))
        return decrypted_bytes.decode('utf-8')
    except InvalidToken:
        raise ValueError("Invalid or corrupted encrypted key")
    except Exception as e:
        raise ValueError(f"Failed to decrypt API key: {str(e)}")


# ============================================================================
# Role-Based Access Control
# ============================================================================

def require_role(allowed_roles: List[str]) -> Callable:
    """
    Decorator to enforce role-based access control on API endpoints.

    Args:
        allowed_roles: List of roles that are allowed to access the endpoint
                      (e.g., ["admin", "instructor", "staff"])

    Returns:
        Decorator function that checks user role

    Raises:
        HTTPException: 403 if user doesn't have required role
        HTTPException: 401 if token is invalid

    Example:
        @router.get("/admin/users")
        @require_role(["admin", "staff"])
        async def get_all_users(current_user: dict = Depends(get_current_user)):
            return {"users": [...]}
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract current_user from kwargs (should be injected by dependency)
            current_user = kwargs.get('current_user')

            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )

            # Check if user has required role (supports both ORM objects and dicts)
            user_role = getattr(current_user, 'role', None) or current_user.get('role') if isinstance(current_user, dict) else current_user.role
            if user_role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
                )

            return await func(*args, **kwargs)

        return wrapper
    return decorator


def check_permissions(
    user_role: str,
    required_roles: List[str],
    resource_owner_id: Optional[str] = None,
    user_id: Optional[str] = None
) -> bool:
    """
    Check if a user has permission to access a resource.

    Args:
        user_role: The role of the current user
        required_roles: List of roles that can access the resource
        resource_owner_id: Optional ID of the resource owner
        user_id: Optional ID of the current user

    Returns:
        True if user has permission, False otherwise

    Example:
        has_permission = check_permissions(
            user_role="parent",
            required_roles=["parent", "admin"],
            resource_owner_id=student.parent_id,
            user_id=current_user.id
        )
    """
    # Check role-based access
    if user_role in required_roles:
        return True

    # Check ownership-based access
    if resource_owner_id and user_id and resource_owner_id == user_id:
        return True

    return False


# ============================================================================
# Token Extraction Helpers
# ============================================================================

async def get_token_from_header(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Extract JWT token from Authorization header.

    Args:
        credentials: HTTPAuthorizationCredentials from Bearer token

    Returns:
        The JWT token string

    Raises:
        HTTPException: If token is missing or invalid format
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token"
        )

    return credentials.credentials


# ============================================================================
# Security Utilities
# ============================================================================

def generate_secure_token(length: int = 32) -> str:
    """
    Generate a cryptographically secure random token.

    Args:
        length: Length of the token in bytes (default 32)

    Returns:
        URL-safe base64-encoded random token

    Example:
        reset_token = generate_secure_token(32)
    """
    import secrets
    return secrets.token_urlsafe(length)


def is_strong_password(password: str) -> tuple[bool, List[str]]:
    """
    Check if a password meets security requirements.

    Requirements:
    - At least 8 characters long
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    - Contains at least one special character

    Args:
        password: The password to validate

    Returns:
        Tuple of (is_valid, list_of_errors)

    Example:
        is_valid, errors = is_strong_password("MyP@ssw0rd")
        if not is_valid:
            raise ValueError(f"Weak password: {', '.join(errors)}")
    """
    errors = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")

    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter")

    if not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter")

    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one digit")

    special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    if not any(c in special_chars for c in password):
        errors.append("Password must contain at least one special character")

    return len(errors) == 0, errors


def sanitize_user_data(user_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Remove sensitive data from user dictionary before returning in API response.

    Args:
        user_dict: Dictionary containing user data

    Returns:
        Sanitized user dictionary with sensitive fields removed

    Example:
        safe_user = sanitize_user_data(user.__dict__)
    """
    sensitive_fields = [
        'password',
        'hashed_password',
        'password_hash',
        'password_reset_token',
        'email_verification_token',
        '_sa_instance_state'  # SQLAlchemy internal state
    ]

    sanitized = user_dict.copy()
    for field in sensitive_fields:
        sanitized.pop(field, None)

    return sanitized


# ============================================================================
# User Authentication Dependencies
# ============================================================================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db)
):
    """
    Get the current authenticated user from JWT token.

    Returns the actual User ORM object from the database, enabling
    downstream code to access all user attributes and relationships.

    Args:
        credentials: HTTPAuthorizationCredentials from Bearer token
        db: Database session (injected by FastAPI)

    Returns:
        User ORM object from database

    Raises:
        HTTPException 401: If token is invalid or user not found
    """
    from app.models.user import User
    from sqlalchemy import select
    from uuid import UUID

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # With auto_error=False, credentials is None when no Bearer token is present
    if credentials is None:
        raise credentials_exception

    try:
        token = credentials.credentials
        payload = verify_token(token, token_type="access")
        user_id: str = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        # Check if token has been blacklisted (user logged out)
        try:
            from app.api.v1.auth import is_token_blacklisted
            if await is_token_blacklisted(token):
                raise credentials_exception
        except ImportError:
            pass  # auth module not yet loaded

        from sqlalchemy.orm import selectinload
        result = await db.execute(
            select(User)
            .options(selectinload(User.student_profile))
            .where(User.id == UUID(user_id))
        )
        user = result.scalar_one_or_none()

        if user is None or not user.is_active or user.is_deleted:
            raise credentials_exception

        return user

    except HTTPException:
        raise
    except Exception:
        raise credentials_exception


async def get_current_active_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db)
) -> Dict[str, Any]:
    """
    Get current active user with full validation against the database.

    Verifies the JWT token, checks the blacklist, and confirms the user
    is still active in the database (not just in the token claims).

    Args:
        credentials: HTTPAuthorizationCredentials from Bearer token
        db: Database session (injected by FastAPI)

    Returns:
        Dictionary with verified user information

    Raises:
        HTTPException 401: If token is invalid or user not found
        HTTPException 403: If user is inactive or deleted
    """
    from app.models.user import User
    from sqlalchemy import select
    from uuid import UUID

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # With auto_error=False, credentials is None when no Bearer token is present
    if credentials is None:
        raise credentials_exception

    try:
        # Extract and verify token
        token = credentials.credentials
        payload = verify_token(token, token_type="access")
        user_id: str = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        # Check if token has been blacklisted (user logged out)
        try:
            from app.api.v1.auth import is_token_blacklisted
            if await is_token_blacklisted(token):
                raise credentials_exception
        except ImportError:
            pass  # auth module not yet loaded

        # Verify user is still active in database (not just token claims)
        result = await db.execute(
            select(User.id, User.email, User.role, User.is_active, User.is_deleted)
            .where(User.id == UUID(user_id))
        )
        user_row = result.first()

        if user_row is None:
            raise credentials_exception

        if not user_row.is_active or user_row.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user"
            )

        return {
            "id": str(user_row.id),
            "role": user_row.role,
            "email": user_row.email,
            "is_active": user_row.is_active,
        }

    except HTTPException:
        raise
    except Exception:
        raise credentials_exception


# ============================================================================
# Rate Limiting Helpers
# ============================================================================

class RateLimitExceeded(HTTPException):
    """Custom exception for rate limit violations."""

    def __init__(self, detail: str = "Too many requests"):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail
        )


def check_rate_limit(
    identifier: str,
    max_requests: int,
    window_seconds: int,
    redis_client: Any
) -> bool:
    """
    Check if a rate limit has been exceeded using Redis.

    Args:
        identifier: Unique identifier (e.g., user_id or IP address)
        max_requests: Maximum number of requests allowed
        window_seconds: Time window in seconds
        redis_client: Redis client instance

    Returns:
        True if within rate limit, False if exceeded

    Example:
        if not check_rate_limit(user_id, max_requests=100, window_seconds=60, redis_client=redis):
            raise RateLimitExceeded("Too many requests. Try again later.")
    """
    try:
        key = f"rate_limit:{identifier}"
        current = redis_client.get(key)

        if current is None:
            # First request in window
            redis_client.setex(key, window_seconds, 1)
            return True

        current_count = int(current)
        if current_count >= max_requests:
            return False

        # Increment counter
        redis_client.incr(key)
        return True

    except Exception as e:
        # If Redis fails, block the request (fail closed) to prevent abuse
        logger.error(f"Rate limit check failed (blocking request): {str(e)}")
        return False
