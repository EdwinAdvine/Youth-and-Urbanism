"""
Google OAuth Authentication Endpoint

Allows users to sign in or register using their Google account.
Verifies the Google ID token, finds or creates the user, and returns JWT tokens.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.ai_agent_profile import AIAgentProfile
from app.utils.security import create_access_token, create_refresh_token, get_password_hash
from app.services.copilot_service import CopilotService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


class GoogleAuthRequest(BaseModel):
    """Request schema for Google OAuth login."""
    credential: str  # Google ID token from frontend
    role: Optional[str] = None  # Required for new user registration


class GoogleAuthResponse(BaseModel):
    """Response schema for Google OAuth login."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    is_new_user: bool = False


def _set_auth_cookies(response: JSONResponse, access_token: str, refresh_token: str) -> None:
    """Set httpOnly cookies for authentication."""
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
        path="/api/v1/auth",
    )


async def _verify_google_token(credential: str) -> dict:
    """
    Verify Google ID token and extract user info.

    Returns dict with: email, name, picture, sub (Google user ID)
    """
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.google_client_id
        )

        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Invalid issuer')

        return {
            'email': idinfo.get('email'),
            'name': idinfo.get('name', ''),
            'picture': idinfo.get('picture'),
            'google_id': idinfo.get('sub'),
            'email_verified': idinfo.get('email_verified', False),
        }
    except ImportError:
        # google-auth not installed - use manual JWT verification
        logger.warning("google-auth not installed, using manual token verification")
        import httpx
        import jwt as pyjwt

        # Fetch Google's public keys
        async with httpx.AsyncClient() as client:
            resp = await client.get('https://www.googleapis.com/oauth2/v3/tokeninfo', params={'id_token': credential})
            if resp.status_code != 200:
                raise ValueError('Failed to verify Google token')
            idinfo = resp.json()

        if idinfo.get('aud') != settings.google_client_id:
            raise ValueError('Token audience mismatch')

        return {
            'email': idinfo.get('email'),
            'name': idinfo.get('name', ''),
            'picture': idinfo.get('picture'),
            'google_id': idinfo.get('sub'),
            'email_verified': True,
        }
    except Exception as e:
        logger.error(f"Google token verification failed: {e}")
        raise ValueError(f"Invalid Google token: {str(e)}")


@router.post(
    "/google",
    response_model=GoogleAuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Sign in with Google",
    description="Authenticate using a Google ID token. Creates a new account if the email doesn't exist."
)
async def google_auth(
    data: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Google OAuth authentication.

    For existing users: logs them in and returns JWT tokens.
    For new users: creates an account with the specified role and returns JWT tokens.
    """
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Sign-In is not configured. Please set GOOGLE_CLIENT_ID."
        )

    # Verify the Google ID token
    try:
        google_user = await _verify_google_token(data.credential)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

    email = google_user['email']
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account does not have an email address"
        )

    # Check if user exists
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    is_new_user = False

    if not user:
        # New user - require role selection
        allowed_roles = ['student', 'parent', 'partner']
        role = data.role or 'student'

        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role '{role}' is not available for self-registration. Choose from: {', '.join(allowed_roles)}"
            )

        # Create new user with Google profile data
        import secrets
        random_password = secrets.token_urlsafe(32)

        user = User(
            email=email,
            password_hash=get_password_hash(random_password),
            role=role,
            profile_data={
                'full_name': google_user['name'],
                'avatar_url': google_user.get('picture'),
                'auth_provider': 'google',
                'google_id': google_user['google_id'],
            },
            is_active=True,
            is_verified=True,  # Google emails are pre-verified
        )
        db.add(user)
        await db.flush()

        # Create AI Agent Profile
        role_defaults = CopilotService.ROLE_DEFAULTS.get(
            role, {'agent_name': 'AI Assistant', 'persona': 'Helpful assistant', 'expertise_focus': 'general assistance'}
        )
        ai_agent = AIAgentProfile(
            user_id=user.id,
            agent_name=role_defaults['agent_name'],
            persona=role_defaults['persona'],
            expertise_focus=role_defaults['expertise_focus'],
        )
        db.add(ai_agent)

        # For students, create student record
        if role == 'student':
            from app.models.student import Student
            from app.models.ai_tutor import AITutor
            from datetime import datetime, timezone
            from sqlalchemy import func

            count_result = await db.execute(select(func.count()).select_from(Student))
            count = count_result.scalar() or 0
            year = datetime.now(timezone.utc).year

            student = Student(
                user_id=user.id,
                admission_number=f"TUHS-{year}-{(count + 1):05d}",
                grade_level='Grade 1',
                enrollment_date=datetime.now(timezone.utc).date(),
                is_active=True,
                learning_profile={},
                competencies={},
                overall_performance={},
            )
            db.add(student)
            await db.flush()

            ai_tutor = AITutor(
                student_id=student.id,
                name='Birdy',
                conversation_history=[],
                learning_path={},
                performance_metrics={},
                response_mode='text',
                total_interactions=0,
            )
            db.add(ai_tutor)

        is_new_user = True

    else:
        # Existing user - verify account is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is inactive. Please contact support."
            )
        if user.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account has been deleted. Please contact support."
            )

    # Generate JWT tokens
    from datetime import datetime, timezone
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
    }
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    # Update last_login
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    # Build response with cookies
    body = {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60,
        "is_new_user": is_new_user,
    }
    response = JSONResponse(content=body, status_code=200)
    _set_auth_cookies(response, access_token, refresh_token)

    return response
