"""
Staff Student Journeys API Endpoints

Provides REST endpoints for staff to monitor learner progress
and family case management:
- At-risk learner listing with AI-generated risk scores
- Individual student learning journey details
- Family case listing and detail views
- Case note creation
- Student progress cards (daily activity, completion, grades)

All endpoints require staff or admin role access.
"""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_staff_or_admin_access

from app.services.staff.student_journey_service import StudentJourneyService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Staff Student Journeys"])


# ------------------------------------------------------------------
# Pydantic request models
# ------------------------------------------------------------------
class CaseNoteRequest(BaseModel):
    """Payload for adding a case note to a family."""
    content: str
    note_type: Optional[str] = "general"  # 'general' | 'follow_up' | 'escalation'


# ------------------------------------------------------------------
# GET /at-risk
# ------------------------------------------------------------------
@router.get("/at-risk")
async def list_at_risk_learners(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    grade_level: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List learners flagged as at-risk by the AI risk-scoring engine.

    Supports filtering by grade level and risk level (low/medium/high/critical).
    Results are ordered by risk score descending.
    """
    try:
        data = await StudentJourneyService.list_at_risk(
            db,
            page=page,
            page_size=page_size,
            grade_level=grade_level,
            risk_level=risk_level,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list at-risk learners")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list at-risk learners.",
        ) from exc


# ------------------------------------------------------------------
# GET /{student_id}/journey
# ------------------------------------------------------------------
@router.get("/{student_id}/journey")
async def get_student_journey(
    student_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Retrieve the complete learning journey for a specific student.

    Includes enrolment history, milestone achievements, AI tutor
    interactions, and performance trends.
    """
    try:
        data = await StudentJourneyService.get_journey(
            db, student_id=student_id
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch journey for student %s", student_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch student journey.",
        ) from exc


# ------------------------------------------------------------------
# GET /families
# ------------------------------------------------------------------
@router.get("/families")
async def list_families(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated listing of family cases.

    Supports text search on parent name, email, and admission number.
    """
    try:
        data = await StudentJourneyService.list_families(
            db, page=page, page_size=page_size, search=search
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list families")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list families.",
        ) from exc


# ------------------------------------------------------------------
# GET /families/{family_id}
# ------------------------------------------------------------------
@router.get("/families/{family_id}")
async def get_family_detail(
    family_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Retrieve details for a specific family case, including linked
    students and case notes history.
    """
    try:
        data = await StudentJourneyService.get_family_detail(
            db, family_id=family_id
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Family not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch family %s", family_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch family detail.",
        ) from exc


# ------------------------------------------------------------------
# POST /families/{family_id}/notes
# ------------------------------------------------------------------
@router.post(
    "/families/{family_id}/notes",
    status_code=status.HTTP_201_CREATED,
)
async def add_case_note(
    family_id: str,
    body: CaseNoteRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Add a case note to a family record."""
    try:
        author_id = current_user.get("id") or current_user.get("user_id")
        data = await StudentJourneyService.add_case_note(
            db,
            family_id=family_id,
            author_id=author_id,
            content=body.content,
            note_type=body.note_type,
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Family not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to add case note to family %s", family_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add case note.",
        ) from exc


# ------------------------------------------------------------------
# GET /{student_id}/progress
# ------------------------------------------------------------------
@router.get("/{student_id}/progress")
async def get_student_progress_card(
    student_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Student progress card with daily activity, completion rates,
    and grade summary.
    """
    try:
        data = await StudentJourneyService.get_progress_card(
            db, student_id=student_id
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch progress for student %s", student_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch student progress.",
        ) from exc
