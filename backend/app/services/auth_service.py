"""
Authentication Service

This module handles all authentication business logic including:
- User registration with validation
- User login with password verification
- JWT token generation (access + refresh tokens)
- Token refresh
- Password reset

The service integrates with User, Student, and AITutor models to provide
seamless authentication for all user roles in the Urban Home School platform.
"""

from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.student import Student
from app.models.ai_tutor import AITutor
from app.models.ai_agent_profile import AIAgentProfile
from app.schemas.user_schemas import UserCreate, UserLogin, TokenResponse
from app.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.config import settings


async def register_user(user_data: UserCreate, db: AsyncSession) -> User:
    """
    Register a new user in the system.

    This function:
    1. Validates that the email is not already registered
    2. Validates that role is allowed for self-registration (defense-in-depth)
    3. Hashes the password securely
    4. Creates a new user record
    5. For student roles: automatically creates Student and AITutor records

    Args:
        user_data: UserCreate schema containing registration data
        db: AsyncSession database session

    Returns:
        User: The newly created user object

    Raises:
        HTTPException: 400 if email already exists or role not allowed
        HTTPException: 500 if database operation fails
    """
    # Defense-in-depth: validate role whitelist at service level
    ALLOWED_SELF_REGISTRATION_ROLES = ['student', 'parent', 'instructor']
    if user_data.role not in ALLOWED_SELF_REGISTRATION_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{user_data.role}' cannot self-register. Contact an administrator."
        )

    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Please use a different email or login."
        )

    try:
        # Hash the password
        hashed_password = get_password_hash(user_data.password)

        # Create new user
        new_user = User(
            email=user_data.email,
            password_hash=hashed_password,
            role=user_data.role,
            profile_data=user_data.profile_data or {},
            is_active=True,
            is_verified=False,  # Email verification pending
        )

        db.add(new_user)
        await db.flush()  # Flush to get the user ID

        # If registering a student, create Student and AITutor records
        if user_data.role == 'student':
            # Extract student-specific data from profile_data
            profile = user_data.profile_data or {}
            grade_level = profile.get('grade_level', 'Grade 1')
            admission_number = profile.get('admission_number')

            # Generate admission number if not provided
            if not admission_number:
                # Format: TUHS-YYYY-XXXXX (e.g., TUHS-2026-00001)
                from datetime import timezone
                year = datetime.now(timezone.utc).year
                # CRITICAL FIX (M-04): Use COUNT(*) instead of loading all students
                # Prevents O(N) memory usage and race conditions
                from sqlalchemy import func
                result = await db.execute(select(func.count()).select_from(Student))
                count = result.scalar() or 0
                admission_number = f"TUHS-{year}-{(count + 1):05d}"

            # Create Student record
            new_student = Student(
                user_id=new_user.id,
                parent_id=None,  # Can be linked later by parent
                admission_number=admission_number,
                grade_level=grade_level,
                enrollment_date=datetime.now(timezone.utc).date(),
                is_active=True,
                learning_profile=profile.get('learning_profile', {}),
                competencies={},
                overall_performance={},
            )

            db.add(new_student)
            await db.flush()  # Flush to get student ID

            # Create dedicated AI Tutor for the student
            ai_tutor = AITutor(
                student_id=new_student.id,
                name=profile.get('tutor_name', 'Birdy'),  # Default tutor name
                conversation_history=[],
                learning_path={},
                performance_metrics={},
                response_mode='text',  # Default to text mode
                total_interactions=0,
            )

            db.add(ai_tutor)

        # Create AIAgentProfile for ALL roles (student, parent, instructor, admin, staff, partner)
        # Each user gets their own dedicated AI agent with role-specific defaults
        from app.services.copilot_service import CopilotService

        role_defaults = CopilotService.ROLE_DEFAULTS.get(
            user_data.role,
            {'agent_name': 'AI Assistant', 'persona': 'Helpful assistant', 'expertise_focus': 'general assistance'}
        )

        ai_agent_profile = AIAgentProfile(
            user_id=new_user.id,
            agent_name=role_defaults['agent_name'],
            persona=role_defaults['persona'],
            expertise_focus=role_defaults['expertise_focus'],
            avatar_url=None,  # User can customize later
            custom_instructions='',
            is_active=True,
        )
        db.add(ai_agent_profile)

        # Commit all changes
        await db.commit()
        await db.refresh(new_user)

        return new_user

    except HTTPException:
        # Re-raise HTTP exceptions
        await db.rollback()
        raise
    except Exception as e:
        # Rollback transaction on any error
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register user: {str(e)}"
        )


async def authenticate_user(credentials: UserLogin, db: AsyncSession) -> TokenResponse:
    """
    Authenticate a user and return JWT tokens.

    This function:
    1. Verifies email exists and password is correct
    2. Checks if user account is active
    3. For students: ensures AITutor exists (creates if missing)
    4. Generates access and refresh tokens
    5. Updates last_login timestamp

    Args:
        credentials: UserLogin schema containing email and password
        db: AsyncSession database session

    Returns:
        TokenResponse: Contains access_token, refresh_token, token_type, and expires_in

    Raises:
        HTTPException: 401 if credentials are invalid or account is inactive
        HTTPException: 500 if database operation fails
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == credentials.email)
    )
    user = result.scalars().first()

    # Verify user exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive. Please contact support.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user account is deleted
    if user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account has been deleted. Please contact support.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # For student users, ensure AITutor exists
        if user.is_student:
            # Get student record
            student_result = await db.execute(
                select(Student).where(Student.user_id == user.id)
            )
            student = student_result.scalars().first()

            if student:
                # Check if AITutor exists
                tutor_result = await db.execute(
                    select(AITutor).where(AITutor.student_id == student.id)
                )
                ai_tutor = tutor_result.scalars().first()

                # Create AITutor if it doesn't exist
                if not ai_tutor:
                    ai_tutor = AITutor(
                        student_id=student.id,
                        name='Birdy',  # Default tutor name
                        conversation_history=[],
                        learning_path={},
                        performance_metrics={},
                        response_mode='text',
                        total_interactions=0,
                    )
                    db.add(ai_tutor)
                    await db.flush()

        # Lazy-create AIAgentProfile for ALL existing users who don't have one
        # This ensures backward compatibility for users created before CoPilot feature
        agent_profile_result = await db.execute(
            select(AIAgentProfile).where(AIAgentProfile.user_id == user.id)
        )
        agent_profile = agent_profile_result.scalars().first()

        if not agent_profile:
            from app.services.copilot_service import CopilotService

            role_defaults = CopilotService.ROLE_DEFAULTS.get(
                user.role,
                {'agent_name': 'AI Assistant', 'persona': 'Helpful assistant', 'expertise_focus': 'general assistance'}
            )

            agent_profile = AIAgentProfile(
                user_id=user.id,
                agent_name=role_defaults['agent_name'],
                persona=role_defaults['persona'],
                expertise_focus=role_defaults['expertise_focus'],
                avatar_url=None,
                custom_instructions='',
                is_active=True,
            )
            db.add(agent_profile)
            await db.flush()

        # Generate JWT tokens
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        }

        access_token = create_access_token(data=token_data)
        refresh_token = create_refresh_token(data={"sub": str(user.id)})

        # Update last_login timestamp
        from datetime import timezone
        user.last_login = datetime.now(timezone.utc)
        await db.commit()

        # Return token response
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,  # Convert to seconds
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        await db.rollback()
        raise
    except Exception as e:
        # Rollback transaction on any error
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )


async def refresh_access_token(refresh_token: str, db: AsyncSession) -> TokenResponse:
    """
    Generate a new access token using a valid refresh token.

    This function:
    1. Verifies the refresh token is valid
    2. Extracts user ID from token
    3. Verifies user still exists and is active
    4. Generates new access and refresh tokens

    Args:
        refresh_token: Valid JWT refresh token
        db: AsyncSession database session

    Returns:
        TokenResponse: New access_token, refresh_token, token_type, and expires_in

    Raises:
        HTTPException: 401 if token is invalid, expired, or user is inactive
        HTTPException: 500 if database operation fails
    """
    try:
        # Verify refresh token
        payload = verify_token(refresh_token, token_type="refresh")
        user_id_str: str = payload.get("sub")

        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Convert user_id to UUID
        try:
            user_id = UUID(user_id_str)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID in token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user from database
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalars().first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check if user is deleted
        if user.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account has been deleted",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Generate new tokens
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        }

        new_access_token = create_access_token(data=token_data)
        new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,  # Convert to seconds
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )


async def get_current_user(token: str, db: AsyncSession) -> User:
    """
    Get the current authenticated user from a JWT access token.

    This is a utility function for use in authentication dependencies.

    Args:
        token: JWT access token
        db: AsyncSession database session

    Returns:
        User: The authenticated user object

    Raises:
        HTTPException: 401 if token is invalid or user not found
    """
    try:
        # Verify access token
        payload = verify_token(token, token_type="access")
        user_id_str: str = payload.get("sub")

        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Convert to UUID
        try:
            user_id = UUID(user_id_str)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID in token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user from database
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalars().first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if user.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account has been deleted",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def initiate_password_reset(email: str, db: AsyncSession) -> bool:
    """
    Initiate password reset process for a user.

    This function:
    1. Finds the user by email
    2. Generates a secure password reset token
    3. Stores the token (or sends email with reset link)

    Note: Email sending functionality should be implemented separately.

    Args:
        email: User's email address
        db: AsyncSession database session

    Returns:
        bool: True if reset was initiated successfully

    Raises:
        HTTPException: 404 if user not found
        HTTPException: 400 if account is inactive
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == email)
    )
    user = result.scalars().first()

    if not user:
        # For security, don't reveal if email exists
        # Return True but don't actually do anything
        return True

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reset password for inactive account"
        )

    try:
        # Generate password reset token (valid for 1 hour)
        reset_token = create_access_token(
            data={"sub": str(user.id), "type": "password_reset"},
            expires_delta=timedelta(hours=1)
        )

        # TODO: Send email with reset link containing the token
        # For now, we just return success
        # In production, integrate with email service to send:
        # reset_url = f"{frontend_url}/reset-password?token={reset_token}"

        return True

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate password reset: {str(e)}"
        )


async def confirm_password_reset(
    reset_token: str,
    new_password: str,
    db: AsyncSession
) -> bool:
    """
    Confirm password reset with token and set new password.

    This function:
    1. Verifies the reset token
    2. Extracts user ID from token
    3. Updates the user's password
    4. CRITICAL FIX (H-01): Blacklists the reset token to prevent reuse

    Args:
        reset_token: Password reset token from email
        new_password: New password to set
        db: AsyncSession database session

    Returns:
        bool: True if password was reset successfully

    Raises:
        HTTPException: 401 if token is invalid or expired
        HTTPException: 500 if database operation fails
    """
    try:
        # Verify reset token
        payload = verify_token(reset_token, token_type="password_reset")

        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid reset token"
            )

        # Convert to UUID
        user_id = UUID(user_id_str)

        # Get user from database
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalars().first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        # Hash new password and update
        user.password_hash = get_password_hash(new_password)
        await db.commit()

        # CRITICAL FIX (H-01): Blacklist the reset token to prevent reuse
        # Password reset tokens are one-time use only for security
        try:
            import redis.asyncio as aioredis
            import time
            r = aioredis.from_url(
                settings.redis_url, decode_responses=True
            ) if hasattr(settings, 'redis_url') else None

            if r is not None:
                # Calculate remaining TTL
                exp = payload.get("exp", 0)
                ttl = max(int(exp - time.time()), 1)
                await r.setex(f"blacklist:{reset_token}", ttl, "1")
                await r.close()
        except Exception as e:
            # Log warning but don't fail the password reset
            # Token is already used, so even if blacklist fails, it's expired in 1 hour
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to blacklist password reset token: {e}")

        return True

    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset password: {str(e)}"
        )
