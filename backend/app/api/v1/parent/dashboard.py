"""
Parent Dashboard Router

API endpoints for parent dashboard home features.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import date
from uuid import UUID

from app.database import get_db
from app.models import User
from app.utils.security import get_current_user
from app.schemas.parent.dashboard_schemas import (
    FamilyOverviewResponse, TodayHighlightsResponse,
    UrgentItemsResponse, MoodEntryCreate, MoodEntryResponse,
    MoodHistoryQuery, MoodHistoryResponse, AIFamilySummaryResponse
)
from app.services.parent.dashboard_service import parent_dashboard_service

router = APIRouter(prefix="/parent/dashboard", tags=["parent-dashboard"])


def require_parent_role(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure user has parent role."""
    if current_user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent role required"
        )
    return current_user


@router.get("/overview", response_model=FamilyOverviewResponse)
async def get_family_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get comprehensive family overview for dashboard home.

    Returns:
    - Total children count
    - Active children today
    - Total minutes and sessions today
    - Individual child status cards with activity, performance, alerts
    - Family streak and weekly averages
    """
    return await parent_dashboard_service.get_family_overview(
        db=db,
        parent_id=current_user.id
    )


@router.get("/highlights", response_model=TodayHighlightsResponse)
async def get_today_highlights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get AI-generated today's highlights.

    Returns:
    - List of highlight items (achievements, milestones, warnings)
    - AI-generated summary of highlights
    """
    return await parent_dashboard_service.get_today_highlights(
        db=db,
        parent_id=current_user.id
    )


@router.get("/urgent", response_model=UrgentItemsResponse)
async def get_urgent_items(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get urgent items requiring parent attention.

    Returns:
    - Critical/warning AI alerts
    - Upcoming deadlines
    - Pending consent requests
    - Low engagement warnings
    """
    return await parent_dashboard_service.get_urgent_items(
        db=db,
        parent_id=current_user.id
    )


@router.post("/mood", response_model=MoodEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_mood_entry(
    mood_data: MoodEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Record a mood entry for a child or the whole family.

    Request body:
    - child_id (optional): Specific child, or null for whole family
    - emoji: Mood emoji (happy, tired, anxious, excited, stressed, neutral)
    - energy_level (optional): Energy level 1-5
    - note (optional): Additional notes
    - recorded_date (optional): Date of entry, defaults to today
    """
    return await parent_dashboard_service.create_mood_entry(
        db=db,
        parent_id=current_user.id,
        emoji=mood_data.emoji,
        child_id=mood_data.child_id,
        energy_level=mood_data.energy_level,
        note=mood_data.note,
        recorded_date=mood_data.recorded_date
    )


@router.get("/mood/history", response_model=MoodHistoryResponse)
async def get_mood_history(
    child_id: Optional[UUID] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get mood entry history with aggregated insights.

    Query parameters:
    - child_id (optional): Filter by specific child, or omit for all children
    - start_date (optional): Start of date range
    - end_date (optional): End of date range
    - limit: Maximum number of entries (default 30)

    Returns:
    - List of mood entries
    - Most common mood
    - Average energy level
    - Mood trend (improving/stable/declining)
    """
    return await parent_dashboard_service.get_mood_history(
        db=db,
        parent_id=current_user.id,
        child_id=child_id,
        start_date=start_date,
        end_date=end_date,
        limit=limit
    )


@router.get("/ai-summary", response_model=AIFamilySummaryResponse)
async def get_ai_family_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """
    Get AI-generated weekly family forecast and tips.

    Returns:
    - Weekly summary narrative
    - Key insights (strengths, concerns, opportunities)
    - Predicted engagement trend
    - Top recommendations for parents
    """
    return await parent_dashboard_service.get_ai_family_summary(
        db=db,
        parent_id=current_user.id
    )
