"""
Admin Moderation Service - Phase 8 (Operations & Control)

Provides content moderation queue management, keyword filter
administration, and moderation decision recording.
"""

import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, or_, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin.operations import ModerationItem, KeywordFilter

logger = logging.getLogger(__name__)


class ModerationService:
    """Service for admin content moderation."""

    # ------------------------------------------------------------------
    # Moderation Queue
    # ------------------------------------------------------------------
    @staticmethod
    async def list_queue(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        severity: Optional[str] = None,
        content_type: Optional[str] = None,
        status_filter: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Paginated moderation queue with optional filters.
        """
        base_q = select(ModerationItem)
        count_q = select(func.count(ModerationItem.id))

        conditions = []
        if severity:
            conditions.append(ModerationItem.severity == severity)
        if content_type:
            conditions.append(ModerationItem.content_type == content_type)
        if status_filter:
            conditions.append(ModerationItem.status == status_filter)
        else:
            # Default to pending items
            conditions.append(ModerationItem.status == "pending_review")

        if conditions:
            where = and_(*conditions)
            base_q = base_q.where(where)
            count_q = count_q.where(where)

        # Total
        total_result = await db.execute(count_q)
        total: int = total_result.scalar() or 0

        # Severity counts (unfiltered, pending only)
        severity_q = select(
            ModerationItem.severity,
            func.count(ModerationItem.id),
        ).where(
            ModerationItem.status == "pending_review"
        ).group_by(ModerationItem.severity)
        severity_result = await db.execute(severity_q)
        severity_counts = {row[0]: row[1] for row in severity_result}

        # Paginate (highest severity first)
        severity_order = func.array_position(
            ["critical", "high", "medium", "low"],
            ModerationItem.severity,
        )
        offset = (page - 1) * page_size
        base_q = (
            base_q
            .order_by(ModerationItem.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        result = await db.execute(base_q)
        items_raw = result.scalars().all()

        items: List[Dict[str, Any]] = []
        for m in items_raw:
            items.append({
                "id": str(m.id),
                "content_type": m.content_type,
                "content_preview": m.content_preview[:200] if m.content_preview else None,
                "content_id": str(m.content_id) if m.content_id else None,
                "author_id": str(m.author_id) if m.author_id else None,
                "flag_reason": m.flag_reason,
                "flagged_by": m.flagged_by,
                "severity": m.severity,
                "status": m.status,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            })

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, -(-total // page_size)),
            "severity_counts": {
                "critical": severity_counts.get("critical", 0),
                "high": severity_counts.get("high", 0),
                "medium": severity_counts.get("medium", 0),
                "low": severity_counts.get("low", 0),
            },
        }

    @staticmethod
    async def approve_item(
        db: AsyncSession,
        item_id: str,
        reviewer_id: uuid.UUID,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Approve a moderation queue item."""
        try:
            item_uuid = uuid.UUID(item_id)
        except ValueError:
            return {"success": False, "error": "Invalid item ID"}

        q = select(ModerationItem).where(ModerationItem.id == item_uuid)
        result = await db.execute(q)
        item = result.scalar_one_or_none()

        if not item:
            return {"success": False, "error": "Item not found"}

        item.status = "approved"
        item.reviewed_by = reviewer_id
        item.reviewed_at = datetime.utcnow()
        item.review_notes = reason
        await db.commit()

        return {
            "success": True,
            "id": str(item.id),
            "status": "approved",
        }

    @staticmethod
    async def remove_item(
        db: AsyncSession,
        item_id: str,
        reviewer_id: uuid.UUID,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Remove/reject a moderation queue item."""
        try:
            item_uuid = uuid.UUID(item_id)
        except ValueError:
            return {"success": False, "error": "Invalid item ID"}

        q = select(ModerationItem).where(ModerationItem.id == item_uuid)
        result = await db.execute(q)
        item = result.scalar_one_or_none()

        if not item:
            return {"success": False, "error": "Item not found"}

        item.status = "removed"
        item.reviewed_by = reviewer_id
        item.reviewed_at = datetime.utcnow()
        item.review_notes = reason
        await db.commit()

        return {
            "success": True,
            "id": str(item.id),
            "status": "removed",
        }

    # ------------------------------------------------------------------
    # Keyword Filters
    # ------------------------------------------------------------------
    @staticmethod
    async def list_keyword_filters(
        db: AsyncSession,
        category: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """List all keyword filters, optionally filtered by category."""
        q = select(KeywordFilter).where(KeywordFilter.is_active == True)
        if category:
            q = q.where(KeywordFilter.category == category)
        q = q.order_by(KeywordFilter.created_at.desc())

        result = await db.execute(q)
        filters = result.scalars().all()

        return [
            {
                "id": str(f.id),
                "keyword": f.keyword,
                "category": f.category,
                "severity": f.severity,
                "is_active": f.is_active,
                "created_at": f.created_at.isoformat() if f.created_at else None,
            }
            for f in filters
        ]

    @staticmethod
    async def add_keyword_filter(
        db: AsyncSession,
        keyword: str,
        category: str,
        severity: str = "medium",
        created_by: Optional[uuid.UUID] = None,
    ) -> Dict[str, Any]:
        """Add a new keyword filter."""
        kf = KeywordFilter(
            keyword=keyword.lower().strip(),
            category=category,
            severity=severity,
            is_active=True,
            created_by=created_by,
        )
        db.add(kf)
        await db.commit()
        await db.refresh(kf)

        return {
            "success": True,
            "id": str(kf.id),
            "keyword": kf.keyword,
            "category": kf.category,
        }

    @staticmethod
    async def remove_keyword_filter(
        db: AsyncSession,
        filter_id: str,
    ) -> Dict[str, Any]:
        """Deactivate a keyword filter."""
        try:
            filter_uuid = uuid.UUID(filter_id)
        except ValueError:
            return {"success": False, "error": "Invalid filter ID"}

        q = select(KeywordFilter).where(KeywordFilter.id == filter_uuid)
        result = await db.execute(q)
        kf = result.scalar_one_or_none()

        if not kf:
            return {"success": False, "error": "Filter not found"}

        kf.is_active = False
        await db.commit()

        return {"success": True, "id": str(kf.id), "status": "deactivated"}
