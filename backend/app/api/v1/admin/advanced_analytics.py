"""
Advanced Analytics API Endpoints - Phase 6 (Analytics & Intelligence)

Admin-only endpoints for advanced analytics including:
- Learning impact and CBC progress metrics
- Business and growth analytics
- Compliance and risk data (Kenya DPA 2019)
- AI-powered custom query processing

All endpoints require admin or staff role access via verify_admin_access().
"""

import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_admin_access
from app.services.admin.advanced_analytics_service import AdvancedAnalyticsService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["Admin - Analytics"])


# ------------------------------------------------------------------
# Request / Response schemas
# ------------------------------------------------------------------
class CustomQueryRequest(BaseModel):
    """Schema for custom AI query requests."""
    query: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Natural language query for analytics",
        examples=["Show me enrollment trends by county"],
    )


# ------------------------------------------------------------------
# GET /learning-impact
# ------------------------------------------------------------------
@router.get("/learning-impact")
async def get_learning_impact(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Learning impact analytics including CBC strand progress,
    skill acquisition curves, and cohort comparison data.
    """
    try:
        data = await AdvancedAnalyticsService.get_learning_impact(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch learning impact data")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch learning impact data.",
        ) from exc


# ------------------------------------------------------------------
# GET /business-metrics
# ------------------------------------------------------------------
@router.get("/business-metrics")
async def get_business_metrics(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Business and growth metrics including MRR, churn rate,
    customer LTV, acquisition funnel, and partner performance.
    """
    try:
        data = await AdvancedAnalyticsService.get_business_metrics(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch business metrics")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch business metrics.",
        ) from exc


# ------------------------------------------------------------------
# GET /compliance
# ------------------------------------------------------------------
@router.get("/compliance")
async def get_compliance_data(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Compliance and risk data including DPA 2019 compliance status,
    consent tracking, incident log, and child protection metrics.
    """
    try:
        data = await AdvancedAnalyticsService.get_compliance_data(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to fetch compliance data")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch compliance data.",
        ) from exc


# ------------------------------------------------------------------
# POST /custom-query
# ------------------------------------------------------------------
@router.post("/custom-query")
async def run_custom_query(
    payload: CustomQueryRequest,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Process a natural language analytics query using AI.

    Accepts a free-text query and returns chart configuration
    and data suitable for frontend rendering.
    """
    try:
        data = await AdvancedAnalyticsService.get_custom_query_result(
            db, payload.query
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to process custom query")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process custom query.",
        ) from exc
