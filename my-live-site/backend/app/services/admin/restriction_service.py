"""
Restriction Service — Phase 3 (People & Access)

Manages user bans, suspensions, feature locks, warnings, and the appeal workflow.
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin.user_restriction import UserRestriction

logger = logging.getLogger(__name__)


class RestrictionService:

    @staticmethod
    async def list_restrictions(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        type_filter: Optional[str] = None,
        active_only: bool = True,
    ) -> Dict[str, Any]:
        """Paginated list of user restrictions."""
        q = select(UserRestriction)
        if active_only:
            q = q.where(UserRestriction.is_active == True)
        if type_filter:
            q = q.where(UserRestriction.restriction_type == type_filter)

        count_q = select(func.count()).select_from(q.subquery())
        total = (await db.execute(count_q)).scalar() or 0

        q = q.order_by(UserRestriction.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(q)
        rows = result.scalars().all()

        items = [
            {
                "id": str(r.id),
                "user_id": str(r.user_id),
                "restriction_type": r.restriction_type,
                "reason": r.reason,
                "is_active": r.is_active,
                "expires_at": r.expires_at.isoformat() if r.expires_at else None,
                "appealed": r.appealed,
                "appeal_decision": r.appeal_decision,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }

    @staticmethod
    async def create_restriction(
        db: AsyncSession,
        user_id: UUID,
        restriction_type: str,
        reason: str,
        created_by: UUID,
        duration_days: Optional[int] = None,
        affected_features: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Create a new user restriction."""
        expires_at = None
        if duration_days:
            expires_at = datetime.utcnow() + timedelta(days=duration_days)

        restriction = UserRestriction(
            user_id=user_id,
            restriction_type=restriction_type,
            reason=reason,
            created_by=created_by,
            duration_days=duration_days,
            expires_at=expires_at,
            affected_features=affected_features or [],
        )
        db.add(restriction)
        await db.commit()
        await db.refresh(restriction)

        return {
            "id": str(restriction.id),
            "user_id": str(restriction.user_id),
            "restriction_type": restriction.restriction_type,
            "is_active": restriction.is_active,
            "expires_at": restriction.expires_at.isoformat() if restriction.expires_at else None,
            "created_at": restriction.created_at.isoformat(),
        }

    @staticmethod
    async def deactivate_restriction(db: AsyncSession, restriction_id: UUID) -> Dict[str, Any]:
        """Deactivate (lift) a restriction."""
        q = select(UserRestriction).where(UserRestriction.id == restriction_id)
        result = await db.execute(q)
        restriction = result.scalar_one_or_none()
        if not restriction:
            return {"success": False, "message": "Restriction not found"}

        restriction.is_active = False
        await db.commit()
        return {"success": True, "message": "Restriction deactivated", "id": str(restriction.id)}

    @staticmethod
    async def list_appeals(db: AsyncSession, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """List restrictions with pending appeals."""
        q = select(UserRestriction).where(
            and_(UserRestriction.appealed == True, UserRestriction.appeal_decision == None)
        )

        count_q = select(func.count()).select_from(q.subquery())
        total = (await db.execute(count_q)).scalar() or 0

        q = q.order_by(UserRestriction.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(q)
        rows = result.scalars().all()

        items = [
            {
                "id": str(r.id),
                "user_id": str(r.user_id),
                "restriction_type": r.restriction_type,
                "reason": r.reason,
                "appeal_text": r.appeal_text,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }

    @staticmethod
    async def process_appeal(
        db: AsyncSession,
        restriction_id: UUID,
        decision: str,
        admin_id: UUID,
    ) -> Dict[str, Any]:
        """Process an appeal: approved or rejected."""
        q = select(UserRestriction).where(UserRestriction.id == restriction_id)
        result = await db.execute(q)
        restriction = result.scalar_one_or_none()
        if not restriction:
            return {"success": False, "message": "Restriction not found"}

        restriction.appeal_decision = decision
        restriction.appeal_decided_by = admin_id
        restriction.appeal_decided_at = datetime.utcnow()

        if decision == "approved":
            restriction.is_active = False

        await db.commit()
        return {"success": True, "decision": decision, "id": str(restriction.id)}
