"""
Instructor Application API Endpoints

Public application submission and admin management of instructor applications.
Supports listing, viewing, and reviewing (approve/reject) applications.
"""

import logging
from typing import Optional
from uuid import UUID
from datetime import datetime, timedelta

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

from app.database import get_db
from app.models.user import User
from app.models.instructor_application import InstructorApplication
from app.utils.security import get_current_user, create_access_token
from app.services.email_service import send_instructor_invite_email
from app.schemas.instructor_application_schemas import (
    InstructorApplicationCreate,
    InstructorApplicationReview,
    InstructorApplicationResponse,
    InstructorApplicationListResponse,
)


router = APIRouter(prefix="/instructor-applications", tags=["Instructor Applications"])

# Optional auth scheme for endpoints that work with or without authentication
optional_security = HTTPBearer(auto_error=False)


async def _rate_limit(key: str, max_attempts: int, window_seconds: int) -> None:
    """Atomic INCR+EXPIRE rate limiter. Raises 429 if exceeded."""
    try:
        from app.redis import get_redis
        r = get_redis()
    except Exception:
        return

    try:
        lua = "local c=redis.call('INCR',KEYS[1]) if c==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end return c"
        current = await r.eval(lua, 1, f"rl:{key}", window_seconds)
        if current > max_attempts:
            ttl = await r.ttl(f"rl:{key}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Try again in {ttl} seconds.",
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Rate limit check failed: {e}")


# ============================================================================
# Public / Authenticated Endpoints
# ============================================================================

@router.post(
    "",
    response_model=InstructorApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit instructor application",
    description="Submit an application to become an instructor. Works with or without authentication.",
)
async def submit_application(
    request: Request,
    data: InstructorApplicationCreate,
    db: AsyncSession = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security),
) -> InstructorApplicationResponse:
    """Submit an instructor application (public or authenticated)."""
    # Rate limit: 3 applications per IP per hour
    client_ip = request.client.host if request.client else "unknown"
    await _rate_limit(f"instructor_apply:{client_ip}", max_attempts=3, window_seconds=3600)

    user_id = None

    # If authenticated, link the application to the user
    if credentials:
        try:
            from app.utils.security import verify_token
            from uuid import UUID as UUIDType

            payload = verify_token(credentials.credentials, token_type="access")
            user_id_str = payload.get("sub")
            if user_id_str:
                user_id = UUIDType(user_id_str)
        except Exception:
            # If token is invalid, proceed without linking to a user
            pass

    application = InstructorApplication(
        user_id=user_id,
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        qualifications=data.qualifications,
        experience_years=data.experience_years,
        subjects=data.subjects,
        bio=data.bio,
    )

    db.add(application)
    await db.flush()
    await db.refresh(application)

    return InstructorApplicationResponse.model_validate(application)


# ============================================================================
# Admin Endpoints
# ============================================================================

@router.get(
    "",
    response_model=InstructorApplicationListResponse,
    status_code=status.HTTP_200_OK,
    summary="List instructor applications",
    description="Admin-only endpoint to list all instructor applications with optional status filtering.",
)
async def list_applications(
    application_status: Optional[str] = Query(
        None,
        alias="status",
        pattern="^(pending|approved|rejected)$",
        description="Filter by application status",
    ),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstructorApplicationListResponse:
    """List all instructor applications (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    # Build query
    query = select(InstructorApplication)
    count_query = select(func.count(InstructorApplication.id))

    if application_status:
        query = query.where(InstructorApplication.status == application_status)
        count_query = count_query.where(InstructorApplication.status == application_status)

    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Get paginated results
    query = query.order_by(InstructorApplication.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    applications = result.scalars().all()

    return InstructorApplicationListResponse(
        applications=[InstructorApplicationResponse.model_validate(a) for a in applications],
        total=total,
    )


@router.get(
    "/{application_id}",
    response_model=InstructorApplicationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get instructor application",
    description="Get a single instructor application. Admins can view any; owners can view their own.",
)
async def get_application(
    application_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstructorApplicationResponse:
    """Get a single instructor application (admin or owner)."""
    result = await db.execute(
        select(InstructorApplication).where(InstructorApplication.id == application_id)
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instructor application not found",
        )

    # Check access: admin can view any, owner can view their own
    is_admin = current_user.role == "admin"
    is_owner = application.user_id is not None and application.user_id == current_user.id

    if not is_admin and not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this application",
        )

    return InstructorApplicationResponse.model_validate(application)


@router.put(
    "/{application_id}/review",
    response_model=InstructorApplicationResponse,
    status_code=status.HTTP_200_OK,
    summary="Review instructor application",
    description="Admin-only endpoint to approve or reject an instructor application.",
)
async def review_application(
    application_id: UUID,
    data: InstructorApplicationReview,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstructorApplicationResponse:
    """Approve or reject an instructor application (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    result = await db.execute(
        select(InstructorApplication).where(InstructorApplication.id == application_id)
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instructor application not found",
        )

    if application.status not in ("pending",):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Application has already been {application.status}",
        )

    application.status = data.status
    application.review_notes = data.review_notes
    application.reviewed_by = current_user.id
    application.reviewed_at = datetime.utcnow()

    # On approval: generate a 72-hour invite token and email the applicant
    if data.status == "approved":
        invite_token = create_access_token(
            data={"sub": str(application.id), "type": "instructor_invite"},
            expires_delta=timedelta(hours=72),
        )
        application.invite_token = invite_token
        application.invite_expires_at = datetime.utcnow() + timedelta(hours=72)

        background_tasks.add_task(
            send_instructor_invite_email,
            application.email,
            application.full_name,
            invite_token,
        )

    await db.flush()
    await db.refresh(application)

    return InstructorApplicationResponse.model_validate(application)
