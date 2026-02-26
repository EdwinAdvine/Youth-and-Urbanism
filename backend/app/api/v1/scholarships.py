"""
Scholarship Application API Endpoints

Public submission and admin management of scholarship applications.
"""

import logging
from typing import Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.scholarship import ScholarshipApplication
from app.utils.security import get_current_user
from app.schemas.scholarship_schemas import (
    ScholarshipApplicationCreate,
    ScholarshipApplicationReview,
    ScholarshipApplicationResponse,
    ScholarshipApplicationListResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/scholarships", tags=["Scholarships"])


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
# Public Endpoints
# ============================================================================

@router.post(
    "",
    response_model=ScholarshipApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit scholarship application",
    description="Public endpoint to submit a scholarship application.",
)
async def submit_scholarship(
    request: Request,
    data: ScholarshipApplicationCreate,
    db: AsyncSession = Depends(get_db),
) -> ScholarshipApplicationResponse:
    """Submit a scholarship application (public)."""
    client_ip = request.client.host if request.client else "unknown"
    await _rate_limit(f"scholarship:{client_ip}", max_attempts=3, window_seconds=3600)

    application = ScholarshipApplication(
        applicant_type=data.applicant_type,
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        student_name=data.student_name,
        student_age=data.student_age,
        school_name=data.school_name,
        grade=data.grade,
        settlement=data.settlement,
        county=data.county,
        reason=data.reason,
        supporting_info=data.supporting_info,
    )

    db.add(application)
    await db.flush()
    await db.refresh(application)

    return ScholarshipApplicationResponse.model_validate(application)


# ============================================================================
# Admin Endpoints
# ============================================================================

@router.get(
    "",
    response_model=ScholarshipApplicationListResponse,
    status_code=status.HTTP_200_OK,
    summary="List scholarship applications",
    description="Admin-only endpoint to list all scholarship applications.",
)
async def list_scholarships(
    application_status: Optional[str] = Query(
        None, alias="status", pattern="^(pending|approved|rejected)$"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ScholarshipApplicationListResponse:
    """List all scholarship applications (admin/staff only)."""
    if current_user.role not in ("admin", "staff"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    query = select(ScholarshipApplication)
    count_query = select(func.count(ScholarshipApplication.id))

    if application_status:
        query = query.where(ScholarshipApplication.status == application_status)
        count_query = count_query.where(ScholarshipApplication.status == application_status)

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(
        query.order_by(ScholarshipApplication.created_at.desc()).offset(skip).limit(limit)
    )
    applications = result.scalars().all()

    return ScholarshipApplicationListResponse(
        applications=[ScholarshipApplicationResponse.model_validate(a) for a in applications],
        total=total,
    )


@router.put(
    "/{application_id}/review",
    response_model=ScholarshipApplicationResponse,
    status_code=status.HTTP_200_OK,
    summary="Review scholarship application",
    description="Admin-only endpoint to approve or reject a scholarship application.",
)
async def review_scholarship(
    application_id: UUID,
    data: ScholarshipApplicationReview,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ScholarshipApplicationResponse:
    """Approve or reject a scholarship application (admin only)."""
    if current_user.role not in ("admin", "staff"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    result = await db.execute(
        select(ScholarshipApplication).where(ScholarshipApplication.id == application_id)
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if application.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Application has already been {application.status}",
        )

    application.status = data.status
    application.review_notes = data.review_notes
    application.reviewed_by = current_user.id
    application.reviewed_at = datetime.utcnow()

    await db.flush()
    await db.refresh(application)

    return ScholarshipApplicationResponse.model_validate(application)
