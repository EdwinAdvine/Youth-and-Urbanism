"""
Super Admin API Endpoints

Provides endpoints restricted to the Super Admin for:
- Financial access control (granting/revoking financial permissions)
- Revenue split configuration
"""

import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import require_super_admin

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────

class FinancialAccessGrant(BaseModel):
    """Request body for granting financial permissions."""
    permission_names: List[str] = Field(
        ...,
        description="List of financial permission names to grant",
        min_length=1,
    )
    reason: Optional[str] = Field(None, max_length=500)


class RevenueSplitUpdate(BaseModel):
    """Request body for updating the default revenue split."""
    instructor_pct: float = Field(..., ge=0, le=100)
    platform_pct: float = Field(..., ge=0, le=100)
    partner_pct: float = Field(..., ge=0, le=100)


# ── Financial Access Endpoints ───────────────────────────────────

@router.get("/super-admin/financial-access")
async def list_financial_access(
    current_user: dict = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List all admins and staff with their financial permission status.
    Super Admin only.
    """
    from app.services.admin.financial_access_service import FinancialAccessService

    try:
        users = await FinancialAccessService.list_users_with_financial_access(db)
        return {"status": "success", "data": users}
    except Exception as exc:
        logger.exception("Failed to list financial access")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list financial access.",
        ) from exc


@router.post("/super-admin/financial-access/{user_id}")
async def grant_financial_access(
    user_id: UUID,
    body: FinancialAccessGrant,
    current_user: dict = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Grant financial permissions to an admin or staff user.
    Super Admin only.
    """
    from app.services.admin.financial_access_service import FinancialAccessService

    try:
        granter_id = UUID(current_user["id"])
        result = await FinancialAccessService.grant_financial_permissions(
            db,
            user_id=user_id,
            permission_names=body.permission_names,
            granted_by=granter_id,
            reason=body.reason,
        )
        return {"status": "success", "data": result}
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Failed to grant financial access")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to grant financial access.",
        ) from exc


@router.delete("/super-admin/financial-access/{user_id}/{permission_name}")
async def revoke_financial_access(
    user_id: UUID,
    permission_name: str,
    current_user: dict = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Revoke a specific financial permission from a user.
    Super Admin only.
    """
    from app.services.admin.financial_access_service import FinancialAccessService

    try:
        result = await FinancialAccessService.revoke_financial_permission(
            db,
            user_id=user_id,
            permission_name=permission_name,
        )
        return {"status": "success", "data": result}
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Failed to revoke financial access")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke financial access.",
        ) from exc


# ── Revenue Split Endpoints ──────────────────────────────────────

@router.get("/super-admin/revenue-split")
async def get_default_revenue_split(
    current_user: dict = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get the current default revenue split.
    Super Admin only.
    """
    from app.models.admin.operations import SystemConfig

    result = await db.execute(
        select(SystemConfig).where(SystemConfig.key == "default_revenue_split")
    )
    config = result.scalar_one_or_none()

    if config:
        return {"status": "success", "data": config.value}

    # Return hardcoded default if not configured
    return {
        "status": "success",
        "data": {
            "instructor_pct": 70.0,
            "platform_pct": 20.0,
            "partner_pct": 10.0,
        },
    }


@router.put("/super-admin/revenue-split")
async def update_default_revenue_split(
    body: RevenueSplitUpdate,
    current_user: dict = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Update the default revenue split percentages.
    Must sum to 100%. Super Admin only.
    """
    total = body.instructor_pct + body.platform_pct + body.partner_pct
    if abs(total - 100.0) > 0.01:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Percentages must sum to 100%. Got {total:.2f}%.",
        )

    from app.models.admin.operations import SystemConfig

    result = await db.execute(
        select(SystemConfig).where(SystemConfig.key == "default_revenue_split")
    )
    config = result.scalar_one_or_none()

    split_value = {
        "instructor_pct": body.instructor_pct,
        "platform_pct": body.platform_pct,
        "partner_pct": body.partner_pct,
    }

    if config:
        config.value = split_value
        config.last_modified_by = UUID(current_user["id"])
    else:
        from datetime import datetime
        config = SystemConfig(
            key="default_revenue_split",
            value=split_value,
            category="finance",
            editable=True,
            last_modified_by=UUID(current_user["id"]),
        )
        db.add(config)

    await db.commit()

    logger.info(
        "Revenue split updated to %s by super admin %s",
        split_value, current_user["id"],
    )

    return {"status": "success", "data": split_value}
