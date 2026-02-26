"""
Feature Guard

FastAPI dependency that checks whether the current user's active
subscription plan includes a given feature (via the plan_features table).
"""

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.plan_feature import PlanFeature
from app.utils.security import get_current_user


def require_feature(feature_key: str):
    """Return a FastAPI dependency that ensures the user has `feature_key` enabled."""

    async def _guard(
        current_user=Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ):
        user_id = current_user.get("user_id") or current_user.get("sub")

        # Find user's active subscription
        sub_result = await db.execute(
            select(Subscription.plan_id).where(
                Subscription.user_id == user_id,
                Subscription.status.in_([
                    SubscriptionStatus.ACTIVE,
                    SubscriptionStatus.TRIALING,
                ]),
            ).limit(1)
        )
        plan_id = sub_result.scalar_one_or_none()

        if plan_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No active subscription. Feature '{feature_key}' requires a subscription.",
            )

        # Check if the feature is enabled for this plan
        feat_result = await db.execute(
            select(PlanFeature.is_enabled).where(
                PlanFeature.plan_id == plan_id,
                PlanFeature.feature_key == feature_key,
            )
        )
        is_enabled = feat_result.scalar_one_or_none()

        if is_enabled is None or not is_enabled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Feature '{feature_key}' is not included in your current plan.",
            )

        return current_user

    return _guard
