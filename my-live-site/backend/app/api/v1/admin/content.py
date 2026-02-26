"""
Admin Content & Learning Integrity API Endpoints - Phase 4

Provides REST endpoints for:
- Course listing, approval, and rejection
- CBC curriculum alignment data
- Assessment grade override queue
- Certificate issuance log
- Resource library management

All endpoints require admin or staff role access.
"""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_admin_access
from app.services.admin.content_service import ContentService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/content", tags=["Admin - Content"])


# ------------------------------------------------------------------
# Request schemas
# ------------------------------------------------------------------
class RejectCourseRequest(BaseModel):
    reason: str


# ------------------------------------------------------------------
# GET /courses - list courses with filters
# ------------------------------------------------------------------
@router.get("/courses")
async def list_courses(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Filter by status: published, draft, pending_review",
    ),
    search: Optional[str] = Query(None, description="Search by title or learning area"),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated course list with optional status filter and search.

    Returns courses with creator info, grade levels, ratings, and
    derived status for admin review workflows.
    """
    try:
        data = await ContentService.list_courses(
            db,
            page=page,
            page_size=page_size,
            status_filter=status_filter,
            search=search,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch courses list")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch courses list.",
        ) from exc


# ------------------------------------------------------------------
# PUT /courses/{id}/approve - approve a course
# ------------------------------------------------------------------
@router.put("/courses/{course_id}/approve")
async def approve_course(
    course_id: str,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Approve a pending course for publication.

    Sets is_published=True and records the published_at timestamp.
    """
    try:
        result = await ContentService.approve_course(db, course_id)
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to approve course"),
            )
        return {"status": "success", "data": result}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to approve course %s", course_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve course.",
        ) from exc


# ------------------------------------------------------------------
# PUT /courses/{id}/reject - reject a course
# ------------------------------------------------------------------
@router.put("/courses/{course_id}/reject")
async def reject_course(
    course_id: str,
    body: RejectCourseRequest,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Reject a pending course submission.

    Requires a reason explaining why the course was rejected.
    """
    try:
        result = await ContentService.reject_course(db, course_id, body.reason)
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to reject course"),
            )
        return {"status": "success", "data": result}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to reject course %s", course_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reject course.",
        ) from exc


# ------------------------------------------------------------------
# GET /courses/{id}/versions - course version history
# ------------------------------------------------------------------
@router.get("/courses/{course_id}/versions")
async def get_course_versions(
    course_id: str,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Version history for a specific course.

    Returns mock data until CourseVersion model is implemented.
    """
    try:
        versions = await ContentService.get_course_versions(db, course_id)
        return {"status": "success", "data": versions, "count": len(versions)}
    except Exception as exc:
        logger.exception("Failed to fetch course versions for %s", course_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch course versions.",
        ) from exc


# ------------------------------------------------------------------
# GET /cbc-alignment - CBC alignment data
# ------------------------------------------------------------------
@router.get("/cbc-alignment")
async def get_cbc_alignment(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    CBC curriculum strand coverage analysis.

    Returns competency mapping data across all CBC strands with
    coverage percentages, sub-strand breakdowns, and identified gaps.
    """
    try:
        data = await ContentService.get_cbc_alignment_data(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch CBC alignment data")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch CBC alignment data.",
        ) from exc


# ------------------------------------------------------------------
# GET /assessments/overrides - grade override queue
# ------------------------------------------------------------------
@router.get("/assessments/overrides")
async def get_assessment_overrides(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Grade override request queue.

    Returns a paginated list of grade override requests submitted by
    instructors, along with statistics (pending, approved, rejected).
    """
    try:
        data = await ContentService.get_assessment_overrides(
            db, page=page, page_size=page_size
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch assessment overrides")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch assessment overrides.",
        ) from exc


# ------------------------------------------------------------------
# GET /certificates - certificate issuance log
# ------------------------------------------------------------------
@router.get("/certificates")
async def get_certificates_log(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Certificate issuance log.

    Returns a paginated list of issued certificates with validity
    status and summary statistics.
    """
    try:
        data = await ContentService.get_certificates_log(
            db, page=page, page_size=page_size
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch certificates log")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch certificates log.",
        ) from exc


# ------------------------------------------------------------------
# GET /resources - resource library
# ------------------------------------------------------------------
@router.get("/resources")
async def list_resources(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    resource_status: Optional[str] = Query(
        None,
        alias="status",
        description="Filter by status: approved, pending, flagged",
    ),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Resource library items with optional category and status filters.

    Returns resources with file metadata, usage statistics, and
    moderation status.
    """
    try:
        data = await ContentService.list_resources(
            db,
            page=page,
            page_size=page_size,
            category=category,
            status=resource_status,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch resource library")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch resource library.",
        ) from exc
