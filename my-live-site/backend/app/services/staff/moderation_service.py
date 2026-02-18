"""
Moderation Service

Content moderation workflow: queue management, review decisions, bulk actions,
CBC alignment checking, and safety/policy flag retrieval.
"""

import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staff.moderation_queue import StaffModerationItem, ReviewDecision
from app.models.user import User
from app.services.ai_orchestrator import AIOrchestrator

logger = logging.getLogger(__name__)


class ModerationService:
    """Facade exposing moderation functions as static methods."""

    @staticmethod
    async def get_queue(db, *, page=1, page_size=20, content_type=None, priority=None, status_filter=None, flag_source=None):
        filters = {}
        if content_type: filters["content_type"] = content_type
        if priority: filters["priority"] = priority
        if status_filter: filters["status"] = status_filter
        if flag_source: filters["flag_source"] = flag_source
        return await get_moderation_queue(db, filters=filters, page=page, page_size=page_size)

    @staticmethod
    async def get_item(db, *, item_id):
        return await get_moderation_item(db, item_id=item_id)

    @staticmethod
    async def submit_review(db, *, item_id, reviewer_id, decision, reason=None, notes=None):
        decision_data = {"moderation_item_id": item_id, "decision": decision, "reason": reason, "notes": notes}
        return await submit_review_decision(db, reviewer_id=reviewer_id, decision_data=decision_data)

    @staticmethod
    async def bulk_action(db, *, item_ids, action, reviewer_id, reason=None):
        bulk_data = {"item_ids": item_ids, "action": action, "reason": reason}
        return await bulk_moderate(db, reviewer_id=reviewer_id, bulk_action=bulk_data)

    @staticmethod
    async def check_cbc_alignment(db, *, content_id):
        return await get_cbc_alignment(db, content_id=content_id, content_text="")

    @staticmethod
    async def get_safety_flags(db):
        return await get_safety_flags(db)


async def get_moderation_queue(
    db: AsyncSession,
    filters: Optional[Dict[str, Any]] = None,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """
    Return a paginated list of moderation items with AI risk scores.

    Supports filtering by content_type, priority, status, flag_source,
    assigned_to, and date range.
    """
    try:
        filters = filters or {}
        conditions = []

        if filters.get("content_type"):
            conditions.append(StaffModerationItem.content_type == filters["content_type"])
        if filters.get("priority"):
            conditions.append(StaffModerationItem.priority == filters["priority"])
        if filters.get("status"):
            conditions.append(StaffModerationItem.status == filters["status"])
        if filters.get("assigned_to"):
            conditions.append(StaffModerationItem.assigned_to == filters["assigned_to"])
        if filters.get("date_from"):
            conditions.append(StaffModerationItem.created_at >= filters["date_from"])
        if filters.get("date_to"):
            conditions.append(StaffModerationItem.created_at <= filters["date_to"])

        where_clause = and_(*conditions) if conditions else True

        # Total count
        total_q = select(func.count(StaffModerationItem.id)).where(where_clause)
        total_result = await db.execute(total_q)
        total: int = total_result.scalar() or 0

        # Pending count
        pending_q = select(func.count(StaffModerationItem.id)).where(
            StaffModerationItem.status == "pending"
        )
        pending_result = await db.execute(pending_q)
        pending_count: int = pending_result.scalar() or 0

        # Critical count
        critical_q = select(func.count(StaffModerationItem.id)).where(
            and_(
                StaffModerationItem.priority == "critical",
                StaffModerationItem.status == "pending",
            )
        )
        critical_result = await db.execute(critical_q)
        critical_count: int = critical_result.scalar() or 0

        # Paginated items
        offset = (page - 1) * page_size
        items_q = (
            select(StaffModerationItem)
            .where(where_clause)
            .order_by(
                StaffModerationItem.priority.desc(),
                StaffModerationItem.ai_risk_score.desc().nullslast(),
                StaffModerationItem.created_at.asc(),
            )
            .offset(offset)
            .limit(page_size)
        )
        items_result = await db.execute(items_q)
        items = items_result.scalars().all()

        # Build response list
        item_list = []
        for item in items:
            item_list.append({
                "id": str(item.id),
                "content_type": item.content_type,
                "content_id": str(item.content_id),
                "content_title": item.title,
                "content_snippet": (item.description or "")[:200],
                "author_id": str(item.submitted_by),
                "ai_risk_score": item.ai_risk_score,
                "ai_categories": item.ai_flags or [],
                "priority": item.priority,
                "status": item.status,
                "assigned_to": str(item.assigned_to) if item.assigned_to else None,
                "category": item.category,
                "created_at": item.created_at.isoformat(),
                "updated_at": item.updated_at.isoformat() if item.updated_at else None,
            })

        return {
            "items": item_list,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pending_count": pending_count,
            "critical_count": critical_count,
        }

    except Exception as e:
        logger.error(f"Error fetching moderation queue: {e}")
        raise


async def get_moderation_item(db: AsyncSession, item_id: str) -> Optional[Dict[str, Any]]:
    """Return a single moderation item with full details."""
    try:
        q = select(StaffModerationItem).where(StaffModerationItem.id == item_id)
        result = await db.execute(q)
        item = result.scalar_one_or_none()

        if not item:
            return None

        # Fetch review history
        decisions_q = (
            select(ReviewDecision)
            .where(ReviewDecision.moderation_item_id == item_id)
            .order_by(ReviewDecision.created_at.desc())
        )
        decisions_result = await db.execute(decisions_q)
        decisions = decisions_result.scalars().all()

        decision_list = [
            {
                "id": str(d.id),
                "reviewer_id": str(d.reviewer_id),
                "decision": d.decision,
                "feedback": d.feedback,
                "is_ai_assisted": d.is_ai_assisted,
                "created_at": d.created_at.isoformat(),
            }
            for d in decisions
        ]

        return {
            "id": str(item.id),
            "content_type": item.content_type,
            "content_id": str(item.content_id),
            "title": item.title,
            "description": item.description,
            "submitted_by": str(item.submitted_by),
            "assigned_to": str(item.assigned_to) if item.assigned_to else None,
            "status": item.status,
            "priority": item.priority,
            "ai_flags": item.ai_flags,
            "ai_risk_score": item.ai_risk_score,
            "category": item.category,
            "metadata": item.metadata,
            "review_history": decision_list,
            "created_at": item.created_at.isoformat(),
            "updated_at": item.updated_at.isoformat() if item.updated_at else None,
        }

    except Exception as e:
        logger.error(f"Error fetching moderation item {item_id}: {e}")
        raise


async def submit_review_decision(
    db: AsyncSession,
    reviewer_id: str,
    decision_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Submit a review decision (approve, reject, escalate, request_changes)
    for a moderation item. Updates the item status accordingly.
    """
    try:
        item_id = decision_data["moderation_item_id"]
        decision_value = decision_data["decision"]

        # Create decision record
        decision = ReviewDecision(
            id=uuid.uuid4(),
            moderation_item_id=item_id,
            reviewer_id=reviewer_id,
            decision=decision_value,
            feedback=decision_data.get("reason") or decision_data.get("feedback_to_author"),
            is_ai_assisted=decision_data.get("is_ai_assisted", False),
        )
        db.add(decision)

        # Update moderation item status
        status_map = {
            "approve": "approved",
            "reject": "rejected",
            "escalate": "escalated",
            "request_changes": "changes_requested",
        }
        new_status = status_map.get(decision_value, decision_value)

        await db.execute(
            update(StaffModerationItem)
            .where(StaffModerationItem.id == item_id)
            .values(status=new_status, updated_at=datetime.utcnow())
        )

        await db.flush()

        logger.info(
            f"Review decision '{decision_value}' submitted for item {item_id} by {reviewer_id}"
        )

        return {
            "id": str(decision.id),
            "moderation_item_id": str(item_id),
            "reviewer_id": str(reviewer_id),
            "decision": decision_value,
            "new_status": new_status,
            "created_at": decision.created_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error submitting review decision: {e}")
        raise


async def bulk_moderate(
    db: AsyncSession,
    reviewer_id: str,
    bulk_action: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Bulk approve, reject, assign, or escalate moderation items.

    Returns counts of successful and failed operations.
    """
    try:
        item_ids = bulk_action["item_ids"]
        action = bulk_action["action"]
        reason = bulk_action.get("reason")
        assign_to = bulk_action.get("assign_to")

        successful = 0
        failed = 0
        errors: List[Dict[str, str]] = []

        status_map = {
            "approve": "approved",
            "reject": "rejected",
            "escalate": "escalated",
        }

        for item_id in item_ids:
            try:
                if action in status_map:
                    # Create decision record
                    decision = ReviewDecision(
                        id=uuid.uuid4(),
                        moderation_item_id=item_id,
                        reviewer_id=reviewer_id,
                        decision=action,
                        feedback=reason,
                        is_ai_assisted=False,
                    )
                    db.add(decision)

                    await db.execute(
                        update(StaffModerationItem)
                        .where(StaffModerationItem.id == item_id)
                        .values(
                            status=status_map[action],
                            updated_at=datetime.utcnow(),
                        )
                    )
                elif action == "assign" and assign_to:
                    await db.execute(
                        update(StaffModerationItem)
                        .where(StaffModerationItem.id == item_id)
                        .values(
                            assigned_to=assign_to,
                            updated_at=datetime.utcnow(),
                        )
                    )

                successful += 1
            except Exception as item_error:
                failed += 1
                errors.append({
                    "item_id": str(item_id),
                    "error": str(item_error),
                })
                logger.warning(f"Bulk action failed for item {item_id}: {item_error}")

        await db.flush()

        logger.info(
            f"Bulk moderation: action={action}, total={len(item_ids)}, "
            f"success={successful}, failed={failed}"
        )

        return {
            "total": len(item_ids),
            "successful": successful,
            "failed": failed,
            "errors": errors,
        }

    except Exception as e:
        logger.error(f"Error in bulk moderation: {e}")
        raise


async def get_cbc_alignment(
    db: AsyncSession,
    content_id: str,
    content_text: str,
) -> Dict[str, Any]:
    """
    Check CBC alignment of content via AI analysis.

    Uses the AI orchestrator to assess how well the content aligns with
    Kenya's Competency-Based Curriculum standards.
    """
    try:
        orchestrator = AIOrchestrator(db)
        await orchestrator.load_providers()

        prompt = (
            "Analyse the following educational content for alignment with Kenya's "
            "Competency-Based Curriculum (CBC). Identify: "
            "1. Which CBC competencies are covered (list competency codes). "
            "2. Any competencies that should be covered but are missing. "
            "3. An alignment score from 0.0 to 1.0. "
            "4. Suggestions for improvement. "
            f"\n\nContent:\n{content_text[:3000]}"
        )

        result = await orchestrator.route_query(
            query=prompt,
            context={"content_id": content_id, "task": "cbc_alignment"},
            response_mode="text",
        )

        ai_message = result.get("message", "")

        return {
            "content_id": content_id,
            "aligned_competencies": [],
            "missing_competencies": [],
            "alignment_score": 0.0,
            "suggestions": [ai_message] if ai_message else [],
            "raw_analysis": ai_message,
        }

    except Exception as e:
        logger.error(f"Error checking CBC alignment for content {content_id}: {e}")
        return {
            "content_id": content_id,
            "aligned_competencies": [],
            "missing_competencies": [],
            "alignment_score": 0.0,
            "suggestions": ["CBC alignment check unavailable at this time."],
            "raw_analysis": "",
        }


async def get_safety_flags(
    db: AsyncSession,
    filters: Optional[Dict[str, Any]] = None,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """
    Return paginated safety/policy flags from moderation items
    that have been flagged with high risk scores.
    """
    try:
        filters = filters or {}
        conditions = [StaffModerationItem.ai_risk_score.isnot(None)]

        if filters.get("risk_type"):
            # Filter by category in ai_flags
            conditions.append(
                StaffModerationItem.category == filters["risk_type"]
            )
        if filters.get("status"):
            conditions.append(StaffModerationItem.status == filters["status"])
        if filters.get("min_risk_score"):
            conditions.append(
                StaffModerationItem.ai_risk_score >= filters["min_risk_score"]
            )

        where_clause = and_(*conditions) if conditions else True

        # Total count
        total_q = select(func.count(StaffModerationItem.id)).where(where_clause)
        total_result = await db.execute(total_q)
        total: int = total_result.scalar() or 0

        # High risk count (score >= 0.7)
        high_risk_q = select(func.count(StaffModerationItem.id)).where(
            and_(
                StaffModerationItem.ai_risk_score >= 0.7,
                StaffModerationItem.status == "pending",
            )
        )
        high_risk_result = await db.execute(high_risk_q)
        high_risk_count: int = high_risk_result.scalar() or 0

        # Paginated items
        offset = (page - 1) * page_size
        items_q = (
            select(StaffModerationItem)
            .where(where_clause)
            .order_by(StaffModerationItem.ai_risk_score.desc().nullslast())
            .offset(offset)
            .limit(page_size)
        )
        items_result = await db.execute(items_q)
        items = items_result.scalars().all()

        item_list = [
            {
                "id": str(item.id),
                "content_type": item.content_type,
                "content_id": str(item.content_id),
                "risk_type": item.category or "other",
                "risk_score": item.ai_risk_score,
                "description": item.description or "",
                "reporter_type": "ai",
                "reporter_id": None,
                "status": item.status,
                "created_at": item.created_at.isoformat(),
            }
            for item in items
        ]

        return {
            "items": item_list,
            "total": total,
            "page": page,
            "page_size": page_size,
            "high_risk_count": high_risk_count,
        }

    except Exception as e:
        logger.error(f"Error fetching safety flags: {e}")
        raise
