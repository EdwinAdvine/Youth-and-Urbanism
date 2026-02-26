"""
Partner Application API Endpoints

Public application submission and admin management of partner applications.
Supports listing, viewing, and reviewing (approve/reject) applications.
"""

import logging
from typing import Optional
from uuid import UUID
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

from app.database import get_db
from app.models.user import User
from app.models.partner_application import PartnerApplication
from app.utils.security import get_current_user, create_access_token
from app.services.email_service import send_partner_invite_email
from app.schemas.partner_application_schemas import (
    PartnerApplicationCreate,
    PartnerApplicationReview,
    PartnerApplicationResponse,
    PartnerApplicationListResponse,
)


router = APIRouter(prefix="/partner-applications", tags=["Partner Applications"])

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
    response_model=PartnerApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit partner application",
    description="Submit an application to become a partner. Works with or without authentication.",
)
async def submit_application(
    request: Request,
    data: PartnerApplicationCreate,
    db: AsyncSession = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security),
) -> PartnerApplicationResponse:
    """Submit a partner application (public or authenticated)."""
    # Rate limit: 3 applications per IP per hour
    client_ip = request.client.host if request.client else "unknown"
    await _rate_limit(f"partner_apply:{client_ip}", max_attempts=3, window_seconds=3600)

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

    application = PartnerApplication(
        user_id=user_id,
        organization_name=data.organization_name,
        organization_type=data.organization_type,
        contact_person=data.contact_person,
        email=data.email,
        phone=data.phone,
        description=data.description,
        partnership_goals=data.partnership_goals,
        website=data.website,
    )

    db.add(application)
    await db.flush()
    await db.refresh(application)

    return PartnerApplicationResponse.model_validate(application)


# ============================================================================
# Admin Endpoints
# ============================================================================

@router.get(
    "",
    response_model=PartnerApplicationListResponse,
    status_code=status.HTTP_200_OK,
    summary="List partner applications",
    description="Admin-only endpoint to list all partner applications with optional status filtering.",
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
) -> PartnerApplicationListResponse:
    """List all partner applications (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    # Build query
    query = select(PartnerApplication)
    count_query = select(func.count(PartnerApplication.id))

    if application_status:
        query = query.where(PartnerApplication.status == application_status)
        count_query = count_query.where(PartnerApplication.status == application_status)

    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Get paginated results
    query = query.order_by(PartnerApplication.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    applications = result.scalars().all()

    return PartnerApplicationListResponse(
        applications=[PartnerApplicationResponse.model_validate(a) for a in applications],
        total=total,
    )


@router.get(
    "/{application_id}",
    response_model=PartnerApplicationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get partner application",
    description="Get a single partner application. Admins can view any; owners can view their own.",
)
async def get_application(
    application_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PartnerApplicationResponse:
    """Get a single partner application (admin or owner)."""
    result = await db.execute(
        select(PartnerApplication).where(PartnerApplication.id == application_id)
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner application not found",
        )

    # Check access: admin can view any, owner can view their own
    is_admin = current_user.role == "admin"
    is_owner = application.user_id is not None and application.user_id == current_user.id

    if not is_admin and not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this application",
        )

    return PartnerApplicationResponse.model_validate(application)


@router.put(
    "/{application_id}/review",
    response_model=PartnerApplicationResponse,
    status_code=status.HTTP_200_OK,
    summary="Review partner application",
    description="Admin-only endpoint to approve or reject a partner application.",
)
async def review_application(
    application_id: UUID,
    data: PartnerApplicationReview,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PartnerApplicationResponse:
    """Approve or reject a partner application (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    result = await db.execute(
        select(PartnerApplication).where(PartnerApplication.id == application_id)
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner application not found",
        )

    if application.status not in ("pending",):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Application has already been {application.status}",
        )

    application.status = data.status
    application.review_notes = data.review_notes
    application.reviewed_by = current_user.id
    application.reviewed_at = datetime.now(timezone.utc)

    # On approval: generate a 72-hour invite token and email the applicant
    if data.status == "approved":
        invite_token = create_access_token(
            data={"sub": str(application.id), "type": "partner_invite"},
            expires_delta=timedelta(hours=72),
        )
        application.invite_token = invite_token
        application.invite_expires_at = datetime.now(timezone.utc) + timedelta(hours=72)

        background_tasks.add_task(
            send_partner_invite_email,
            application.email,
            application.contact_person,
            invite_token,
        )

    await db.flush()
    await db.refresh(application)

    return PartnerApplicationResponse.model_validate(application)
