"""
Parent Weekly Summary API Routes

Endpoints for retrieving and generating AI-powered weekly learning summaries
for parents. Includes discussion starter cards and offline activity suggestions
contextualized to each child's recent learning.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, List
from uuid import UUID

logger = logging.getLogger(__name__)

from app.database import get_db
from app.models.user import User
from app.services.parent.weekly_summary_service import ParentWeeklySummaryService
from app.utils.security import get_current_user


router = APIRouter(prefix="/parent/weekly-summary", tags=["Parent Weekly Summary"])


def _assert_parent(user: User):
    """Ensure the authenticated user is a parent."""
    if user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only parents can access this endpoint",
        )


@router.get("/{child_id}")
async def get_weekly_summaries(
    child_id: UUID,
    limit: int = Query(4, ge=1, le=20, description="Number of summaries to return"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[Dict]:
    """Get recent weekly summaries for a child."""
    _assert_parent(current_user)
    service = ParentWeeklySummaryService(db)
    return await service.get_summaries(
        parent_id=current_user.id,
        child_id=child_id,
        limit=limit,
    )


@router.post("/{child_id}/generate")
async def generate_weekly_summary(
    child_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict:
    """Generate a new weekly summary for a child."""
    _assert_parent(current_user)
    service = ParentWeeklySummaryService(db)

    try:
        card = await service.generate_weekly_summary(
            parent_id=current_user.id,
            child_id=child_id,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    return {
        "id": str(card.id),
        "week_start": card.week_start.isoformat(),
        "week_end": card.week_end.isoformat(),
        "summary_text": card.summary_text,
        "discussion_starters": card.discussion_starters,
        "offline_activities": card.offline_activities,
        "confidence_trend": card.confidence_trend,
        "metrics": card.metrics,
        "created_at": card.created_at.isoformat(),
    }
