"""
Staff Moderation API Endpoints

Provides REST endpoints for content moderation workflows:
- Paginated moderation queue with filters (content type, priority,
  status, flag source)
- Individual item review and detail retrieval
- Bulk moderation actions (approve / reject / escalate)
- CBC curriculum alignment checks
- Safety and policy flag listings

All endpoints require staff or admin role access.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_staff_or_admin_access

from app.services.staff.moderation_service import ModerationService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Staff Moderation"])


# ------------------------------------------------------------------
# Pydantic request / response models
# ------------------------------------------------------------------
class ReviewDecision(BaseModel):
    """Payload for submitting a moderation review decision."""
    decision: str  # 'approve' | 'reject' | 'escalate'
    reason: Optional[str] = None
    notes: Optional[str] = None


class BulkModerationRequest(BaseModel):
    """Payload for bulk moderation actions."""
    item_ids: List[str]
    action: str  # 'approve' | 'reject' | 'escalate'
    reason: Optional[str] = None


# ------------------------------------------------------------------
# GET /queue
# ------------------------------------------------------------------
@router.get("/queue")
async def get_moderation_queue(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    content_type: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    flag_source: Optional[str] = Query(None),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated moderation queue.

    Supports filtering by content_type, priority, status, and flag_source.
    Results are ordered by priority (highest first) then by creation date.
    """
    try:
        data = await ModerationService.get_queue(
            db,
            page=page,
            page_size=page_size,
            content_type=content_type,
            priority=priority,
            status_filter=status_filter,
            flag_source=flag_source,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch moderation queue")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch moderation queue.",
        ) from exc


# ------------------------------------------------------------------
# GET /queue/{item_id}
# ------------------------------------------------------------------
@router.get("/queue/{item_id}")
async def get_moderation_item(
    item_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve details of a single moderation queue item."""
    try:
        data = await ModerationService.get_item(db, item_id=item_id)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Moderation item not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch moderation item %s", item_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch moderation item.",
        ) from exc


# ------------------------------------------------------------------
# POST /queue/{item_id}/review
# ------------------------------------------------------------------
@router.post("/queue/{item_id}/review")
async def submit_review(
    item_id: str,
    body: ReviewDecision,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Submit a moderation review decision for a queue item.

    Accepted decisions: approve, reject, escalate.
    """
    try:
        reviewer_id = current_user.get("id") or current_user.get("user_id")
        data = await ModerationService.submit_review(
            db,
            item_id=item_id,
            reviewer_id=reviewer_id,
            decision=body.decision,
            reason=body.reason,
            notes=body.notes,
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Moderation item not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to submit review for item %s", item_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit moderation review.",
        ) from exc


# ------------------------------------------------------------------
# POST /queue/bulk
# ------------------------------------------------------------------
@router.post("/queue/bulk")
async def bulk_moderation_action(
    body: BulkModerationRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Perform a bulk moderation action on multiple queue items.

    Accepted actions: approve, reject, escalate.
    """
    try:
        reviewer_id = current_user.get("id") or current_user.get("user_id")
        data = await ModerationService.bulk_action(
            db,
            item_ids=body.item_ids,
            action=body.action,
            reviewer_id=reviewer_id,
            reason=body.reason,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to perform bulk moderation action")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform bulk moderation action.",
        ) from exc


# ------------------------------------------------------------------
# GET /cbc-alignment/{content_id}
# ------------------------------------------------------------------
@router.get("/cbc-alignment/{content_id}")
async def check_cbc_alignment(
    content_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Run a CBC curriculum alignment check on the specified content.

    Returns alignment score, matched strands, and suggested improvements.
    """
    try:
        data = await ModerationService.check_cbc_alignment(
            db, content_id=content_id
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to check CBC alignment for %s", content_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check CBC alignment.",
        ) from exc


# ------------------------------------------------------------------
# GET /safety-flags
# ------------------------------------------------------------------
@router.get("/safety-flags")
async def get_safety_flags(
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List active safety and policy flags.

    Returns flag definitions with severity, description, and
    the number of currently flagged items per type.
    """
    try:
        data = await ModerationService.get_safety_flags(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch safety flags")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch safety flags.",
        ) from exc
