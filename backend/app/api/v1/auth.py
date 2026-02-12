"""
Authentication API Endpoints

This module defines FastAPI routes for user authentication including:
- User registration (with automatic AI tutor creation for students)
- User login (with AI tutor verification for students)
- Token refresh
- Current user retrieval
"""

from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User login",
    description="Authenticate user and return access/refresh tokens. Ensures AI tutor exists for student accounts."
)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """
    Authenticate user and return JWT tokens.

    Args:
        credentials: Login credentials (email and password)
        db: Database session

    Returns:
        TokenResponse: Access token, refresh token, token type, and expiration time

    Raises:
        HTTPException 401: If credentials are invalid
    """
    try:
        token_data = await auth_service.authenticate_user(credentials, db)
        return token_data
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Generate a new access token using a valid refresh token."
)
async def refresh_token(
    refresh_token_data: dict,
    db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """
    Refresh access token using refresh token.

    Args:
        refresh_token_data: Dictionary containing refresh_token
        db: Database session

    Returns:
        TokenResponse: New access token, refresh token, token type, and expiration time

    Raises:
        HTTPException 401: If refresh token is invalid or expired
    """
    refresh_token = refresh_token_data.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token is required"
        )

    try:
        token_data = await auth_service.refresh_access_token(refresh_token, db)
        return token_data
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
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
        payload = verify_token(data.token, token_type="access")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    if payload.get("type") != "email_verification":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token",
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
    data: PasswordReset,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Initiate password reset by sending a reset link email.

    Always returns success to avoid revealing whether an email exists.

    Args:
        data: Contains the email address
        background_tasks: FastAPI background tasks
        db: Database session

    Returns:
        Success message (always, for security)
    """
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
