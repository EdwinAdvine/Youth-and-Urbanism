"""
Partner Sponsorships API Endpoints

Provides REST endpoints for sponsorship programme management:
- CRUD operations on sponsorship programmes
- Bulk child enrolment and removal
- Sponsored children listing with progress, activity,
  achievements, goals, and AI insights
- Parent consent request and response workflow

All endpoints require partner or admin role access.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_partner_or_admin_access

from app.services.partner.sponsorship_service import SponsorshipService
from app.services.partner.partner_ai_service import PartnerAIService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Partner - Sponsorships"])


# ------------------------------------------------------------------
# Pydantic request models
# ------------------------------------------------------------------
class CreateProgramRequest(BaseModel):
    """Payload for creating a new sponsorship programme."""
    name: str
    description: Optional[str] = None
    budget: Optional[float] = None
    currency: str = "KES"
    max_children: Optional[int] = None
    grade_levels: Optional[List[str]] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class UpdateProgramRequest(BaseModel):
    """Payload for updating an existing sponsorship programme."""
    name: Optional[str] = None
    description: Optional[str] = None
    budget: Optional[float] = None
    currency: Optional[str] = None
    max_children: Optional[int] = None
    grade_levels: Optional[List[str]] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class AddChildrenRequest(BaseModel):
    """Payload for bulk-adding children to a programme."""
    student_ids: List[str]


class ConsentRequestBody(BaseModel):
    """Payload for requesting parent consent."""
    sponsored_child_id: str


class ConsentResponseBody(BaseModel):
    """Payload for a parent responding to a consent request."""
    agreed: bool
    consent_text: Optional[str] = None


# ------------------------------------------------------------------
# POST /programs
# ------------------------------------------------------------------
@router.post("/programs", status_code=status.HTTP_201_CREATED)
async def create_program(
    body: CreateProgramRequest,
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Create a new sponsorship programme."""
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await SponsorshipService.create_program(
            db,
            partner_id=user_id,
            name=body.name,
            description=body.description,
            budget=body.budget,
            currency=body.currency,
            max_children=body.max_children,
            grade_levels=body.grade_levels,
            start_date=body.start_date,
            end_date=body.end_date,
            metadata=body.metadata,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to create sponsorship programme")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create sponsorship programme.",
        ) from exc


# ------------------------------------------------------------------
# GET /programs
# ------------------------------------------------------------------
@router.get("/programs")
async def list_programs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated list of sponsorship programmes.

    Supports filtering by programme status (active, paused, completed).
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await SponsorshipService.list_programs(
            db,
            partner_id=user_id,
            page=page,
            page_size=page_size,
            status_filter=status_filter,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list sponsorship programmes")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list sponsorship programmes.",
        ) from exc


# ------------------------------------------------------------------
# GET /programs/{program_id}
# ------------------------------------------------------------------
@router.get("/programs/{program_id}")
async def get_program(
    program_id: str,
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve a single sponsorship programme with enrolled children summary."""
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await SponsorshipService.get_program(
            db, partner_id=user_id, program_id=program_id
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sponsorship programme not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch programme %s", program_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch sponsorship programme.",
        ) from exc


# ------------------------------------------------------------------
# PUT /programs/{program_id}
# ------------------------------------------------------------------
@router.put("/programs/{program_id}")
async def update_program(
    program_id: str,
    body: UpdateProgramRequest,
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Update an existing sponsorship programme."""
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        updates = body.model_dump(exclude_unset=True)
        data = await SponsorshipService.update_program(
            db, partner_id=user_id, program_id=program_id, updates=updates
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sponsorship programme not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update programme %s", program_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update sponsorship programme.",
        ) from exc


# ------------------------------------------------------------------
# POST /programs/{program_id}/children
# ------------------------------------------------------------------
@router.post(
    "/programs/{program_id}/children",
    status_code=status.HTTP_201_CREATED,
)
async def add_children_to_program(
    program_id: str,
    body: AddChildrenRequest,
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Bulk-add children to a sponsorship programme.

    Accepts a list of student IDs to enrol in the programme.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await SponsorshipService.add_children(
            db,
            partner_id=user_id,
            program_id=program_id,
            student_ids=body.student_ids,
        )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Failed to add children to programme %s", program_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add children to sponsorship programme.",
        ) from exc


# ------------------------------------------------------------------
# DELETE /programs/{program_id}/children/{student_id}
# ------------------------------------------------------------------
@router.delete("/programs/{program_id}/children/{student_id}")
async def remove_child_from_program(
    program_id: str,
    student_id: str,
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Remove a child from a sponsorship programme."""
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        success = await SponsorshipService.remove_child(
            db,
            partner_id=user_id,
            program_id=program_id,
            student_id=student_id,
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child or programme not found.",
            )
        return {"status": "success", "message": "Child removed from programme."}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Failed to remove child %s from programme %s",
            student_id, program_id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove child from programme.",
        ) from exc


# ------------------------------------------------------------------
# GET /children
# ------------------------------------------------------------------
@router.get("/children")
async def list_sponsored_children(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    program_id: Optional[str] = Query(None),
    grade_level: Optional[str] = Query(None),
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated list of all sponsored children across programmes.

    Supports filtering by programme and grade level.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await SponsorshipService.list_children(
            db,
            partner_id=user_id,
            page=page,
            page_size=page_size,
            program_id=program_id,
            grade_level=grade_level,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list sponsored children")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list sponsored children.",
        ) from exc


# ------------------------------------------------------------------
# GET /children/{child_id}/progress
# ------------------------------------------------------------------
@router.get("/children/{child_id}/progress")
async def get_child_progress(
    child_id: str,
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Retrieve the learning journey and progress for a sponsored child.

    Returns course progress, completion rates, grade trends,
    and subject performance breakdown.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await SponsorshipService.get_child_progress(
            db, partner_id=user_id, child_id=child_id
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sponsored child not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch progress for child %s", child_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch child progress.",
        ) from exc


# ------------------------------------------------------------------
# GET /children/{child_id}/activity
# ------------------------------------------------------------------
@router.get("/children/{child_id}/activity")
async def get_child_activity(
    child_id: str,
    period: Optional[str] = Query("week", regex="^(day|week|month)$"),
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Retrieve daily or weekly activity feed for a sponsored child.

    Shows lessons completed, time spent learning, quizzes taken,
    and AI tutor interactions within the selected period.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await SponsorshipService.get_child_activity(
            db, partner_id=user_id, child_id=child_id, period=period
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sponsored child not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch activity for child %s", child_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch child activity.",
        ) from exc


# ------------------------------------------------------------------
# GET /children/{child_id}/achievements
# ------------------------------------------------------------------
@router.get("/children/{child_id}/achievements")
async def get_child_achievements(
    child_id: str,
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Retrieve certificates and badges earned by a sponsored child.

    Returns a list of certificates, badges, and special
    recognitions with dates and descriptions.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await SponsorshipService.get_child_achievements(
            db, partner_id=user_id, child_id=child_id
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sponsored child not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Failed to fetch achievements for child %s", child_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch child achievements.",
        ) from exc


# ------------------------------------------------------------------
# GET /children/{child_id}/goals
# ------------------------------------------------------------------
@router.get("/children/{child_id}/goals")
async def get_child_goals(
    child_id: str,
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Retrieve goals and milestones for a sponsored child.

    Returns active goals, milestone progress, and completion
    history for the child's learning journey.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await SponsorshipService.get_child_goals(
            db, partner_id=user_id, child_id=child_id
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sponsored child not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch goals for child %s", child_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch child goals.",
        ) from exc


# ------------------------------------------------------------------
# GET /children/{child_id}/ai-insights
# ------------------------------------------------------------------
@router.get("/children/{child_id}/ai-insights")
async def get_child_ai_insights(
    child_id: str,
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Retrieve AI companion insights for a sponsored child.

    Returns AI-generated analysis of learning patterns, strengths,
    areas for improvement, and personalised recommendations.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await PartnerAIService.get_child_insights(
            db, partner_id=user_id, child_id=child_id
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sponsored child not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Failed to fetch AI insights for child %s", child_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch AI insights for child.",
        ) from exc


# ------------------------------------------------------------------
# POST /consent/request
# ------------------------------------------------------------------
@router.post("/consent/request", status_code=status.HTTP_201_CREATED)
async def request_parent_consent(
    body: ConsentRequestBody,
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Request parent consent for sponsoring a child.

    Sends a consent request to the child's parent or guardian
    for approval before the sponsorship can be activated.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await SponsorshipService.request_consent(
            db,
            partner_id=user_id,
            sponsored_child_id=body.sponsored_child_id,
        )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to request parent consent")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to request parent consent.",
        ) from exc


# ------------------------------------------------------------------
# POST /consent/{consent_id}/respond
# ------------------------------------------------------------------
@router.post("/consent/{consent_id}/respond")
async def respond_to_consent(
    consent_id: str,
    body: ConsentResponseBody,
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Parent responds to a consent request.

    The parent can agree or decline the sponsorship consent.
    An optional consent_text can be provided as additional terms.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await SponsorshipService.respond_to_consent(
            db,
            consent_id=consent_id,
            responder_id=user_id,
            agreed=body.agreed,
            consent_text=body.consent_text,
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consent request not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Failed to respond to consent request %s", consent_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to respond to consent request.",
        ) from exc


# ------------------------------------------------------------------
# GET /consent/status
# ------------------------------------------------------------------
@router.get("/consent/status")
async def get_consent_status(
    current_user: dict = Depends(verify_partner_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Retrieve consent status for all sponsored children.

    Returns a list of consent requests with their current status
    (pending, approved, declined) for each sponsored child.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await SponsorshipService.get_consent_status(
            db, partner_id=user_id
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch consent status")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch consent status.",
        ) from exc
