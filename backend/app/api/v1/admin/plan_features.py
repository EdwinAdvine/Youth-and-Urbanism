"""
Admin Plan Features API

Endpoints for super admins to manage per-plan feature toggles.
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.plan_feature import PlanFeature
from app.models.subscription import SubscriptionPlan
from app.utils.permissions import require_super_admin

router = APIRouter(prefix="/plan-features", tags=["Admin - Plan Features"])


# ── Available feature keys ───────────────────────────────────────
AVAILABLE_FEATURES = [
    {"key": "ai_tutor", "name": "AI Tutor Access"},
    {"key": "live_sessions", "name": "Live Sessions"},
    {"key": "store_access", "name": "Online Store"},
    {"key": "forum_access", "name": "Community Forum"},
    {"key": "assessments", "name": "Assessments & Quizzes"},
    {"key": "certificates", "name": "Certificates"},
    {"key": "parent_insights", "name": "Parent AI Insights"},
    {"key": "advanced_analytics", "name": "Advanced Analytics"},
    {"key": "custom_avatar", "name": "Custom Avatar"},
    {"key": "priority_support", "name": "Priority Support"},
    {"key": "offline_access", "name": "Offline Access"},
    {"key": "collaborative_docs", "name": "Collaborative Documents"},
]


# ── Schemas ──────────────────────────────────────────────────────
class PlanFeatureCreate(BaseModel):
    feature_key: str = Field(..., max_length=100)
    feature_name: str = Field(..., max_length=200)
    is_enabled: bool = True
    config: Optional[dict] = None
    display_order: int = 0


class PlanFeatureUpdate(BaseModel):
    feature_name: Optional[str] = Field(None, max_length=200)
    is_enabled: Optional[bool] = None
    config: Optional[dict] = None
    display_order: Optional[int] = None


class PlanFeatureResponse(BaseModel):
    id: str
    plan_id: str
    feature_key: str
    feature_name: str
    is_enabled: bool
    config: Optional[dict]
    display_order: int


# ── Endpoints ────────────────────────────────────────────────────
@router.get("/available")
async def list_available_features(
    _current_user=Depends(require_super_admin),
):
    """List all available feature keys that can be assigned to plans."""
    return {"status": "success", "data": AVAILABLE_FEATURES}


@router.get("/plans/{plan_id}")
async def list_plan_features(
    plan_id: str,
    _current_user=Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all features configured for a subscription plan."""
    plan_uuid = uuid.UUID(plan_id)

    # Verify plan exists
    plan_result = await db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.id == plan_uuid)
    )
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    result = await db.execute(
        select(PlanFeature)
        .where(PlanFeature.plan_id == plan_uuid)
        .order_by(PlanFeature.display_order)
    )
    features = result.scalars().all()

    return {
        "status": "success",
        "data": {
            "plan_id": plan_id,
            "plan_name": plan.name,
            "features": [
                PlanFeatureResponse(
                    id=str(f.id),
                    plan_id=str(f.plan_id),
                    feature_key=f.feature_key,
                    feature_name=f.feature_name,
                    is_enabled=f.is_enabled,
                    config=f.config,
                    display_order=f.display_order,
                ).model_dump()
                for f in features
            ],
        },
    }


@router.post("/plans/{plan_id}", status_code=status.HTTP_201_CREATED)
async def add_plan_feature(
    plan_id: str,
    body: PlanFeatureCreate,
    _current_user=Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    """Add a feature to a subscription plan."""
    plan_uuid = uuid.UUID(plan_id)

    # Verify plan exists
    plan_result = await db.execute(
        select(SubscriptionPlan).where(SubscriptionPlan.id == plan_uuid)
    )
    if not plan_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Plan not found")

    # Check for duplicate
    existing = await db.execute(
        select(PlanFeature).where(
            PlanFeature.plan_id == plan_uuid,
            PlanFeature.feature_key == body.feature_key,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail=f"Feature '{body.feature_key}' already exists for this plan",
        )

    feature = PlanFeature(
        plan_id=plan_uuid,
        feature_key=body.feature_key,
        feature_name=body.feature_name,
        is_enabled=body.is_enabled,
        config=body.config,
        display_order=body.display_order,
    )
    db.add(feature)
    await db.commit()
    await db.refresh(feature)

    return {
        "status": "success",
        "data": PlanFeatureResponse(
            id=str(feature.id),
            plan_id=str(feature.plan_id),
            feature_key=feature.feature_key,
            feature_name=feature.feature_name,
            is_enabled=feature.is_enabled,
            config=feature.config,
            display_order=feature.display_order,
        ).model_dump(),
    }


@router.put("/plans/{plan_id}/{feature_id}")
async def update_plan_feature(
    plan_id: str,
    feature_id: str,
    body: PlanFeatureUpdate,
    _current_user=Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update a feature on a subscription plan (toggle, rename, reconfigure)."""
    feature_uuid = uuid.UUID(feature_id)

    result = await db.execute(
        select(PlanFeature).where(
            PlanFeature.id == feature_uuid,
            PlanFeature.plan_id == uuid.UUID(plan_id),
        )
    )
    feature = result.scalar_one_or_none()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")

    if body.feature_name is not None:
        feature.feature_name = body.feature_name
    if body.is_enabled is not None:
        feature.is_enabled = body.is_enabled
    if body.config is not None:
        feature.config = body.config
    if body.display_order is not None:
        feature.display_order = body.display_order

    await db.commit()
    await db.refresh(feature)

    return {
        "status": "success",
        "data": PlanFeatureResponse(
            id=str(feature.id),
            plan_id=str(feature.plan_id),
            feature_key=feature.feature_key,
            feature_name=feature.feature_name,
            is_enabled=feature.is_enabled,
            config=feature.config,
            display_order=feature.display_order,
        ).model_dump(),
    }


@router.delete("/plans/{plan_id}/{feature_id}", status_code=status.HTTP_200_OK)
async def remove_plan_feature(
    plan_id: str,
    feature_id: str,
    _current_user=Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    """Remove a feature from a subscription plan."""
    feature_uuid = uuid.UUID(feature_id)

    result = await db.execute(
        select(PlanFeature).where(
            PlanFeature.id == feature_uuid,
            PlanFeature.plan_id == uuid.UUID(plan_id),
        )
    )
    feature = result.scalar_one_or_none()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")

    await db.delete(feature)
    await db.commit()

    return {"status": "success", "message": "Feature removed from plan"}
