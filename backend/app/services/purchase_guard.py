"""
Purchase Guard

A reusable service called before any purchase for student users.
Checks parent approval settings and spending limits.
"""

import logging
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student import Student
from app.models.payment import Wallet
from app.models.parent.purchase_approval import (
    PurchaseApprovalSetting,
    PurchaseApprovalRequest,
    PurchaseApprovalMode,
    ApprovalStatus,
)

logger = logging.getLogger(__name__)


class PurchaseRequiresApproval(Exception):
    """Raised when a purchase requires parent approval."""
    def __init__(self, request_id: str, message: str = "Purchase requires parent approval"):
        self.request_id = request_id
        self.message = message
        super().__init__(self.message)


async def guard_student_purchase(
    db: AsyncSession,
    student_user_id: UUID,
    amount: Decimal,
    purchase_type: str,
    item_id: Optional[UUID],
    item_name: str,
) -> bool:
    """
    Check if a student's purchase can proceed.

    Returns True if the purchase is allowed to proceed immediately.
    Raises PurchaseRequiresApproval if parent must approve first.

    For students without a linked parent, purchases proceed normally.
    """
    # Check if student has a linked parent
    result = await db.execute(
        select(Student).where(Student.user_id == student_user_id)
    )
    student = result.scalar_one_or_none()

    if not student or not student.parent_id:
        # No parent linked — allow purchase
        return True

    # Check approval settings
    settings_result = await db.execute(
        select(PurchaseApprovalSetting).where(
            PurchaseApprovalSetting.child_id == student_user_id,
            PurchaseApprovalSetting.parent_id == student.parent_id,
            PurchaseApprovalSetting.is_active == True,
        )
    )
    settings = settings_result.scalar_one_or_none()

    if not settings:
        # Default: real-time approval required
        request = await _create_approval_request(
            db, student_user_id, student.parent_id,
            purchase_type, item_id, item_name, amount,
        )
        raise PurchaseRequiresApproval(
            request_id=str(request.id),
            message="Purchase requires parent approval. Your parent has been notified.",
        )

    if settings.mode == PurchaseApprovalMode.REALTIME:
        # Always require approval
        request = await _create_approval_request(
            db, student_user_id, student.parent_id,
            purchase_type, item_id, item_name, amount,
        )
        raise PurchaseRequiresApproval(
            request_id=str(request.id),
            message="Purchase requires parent approval. Your parent has been notified.",
        )

    # SPENDING_LIMIT mode — check limits
    if settings.per_purchase_limit and amount > settings.per_purchase_limit:
        request = await _create_approval_request(
            db, student_user_id, student.parent_id,
            purchase_type, item_id, item_name, amount,
        )
        raise PurchaseRequiresApproval(
            request_id=str(request.id),
            message=f"Purchase of KES {amount} exceeds your per-purchase limit of KES {settings.per_purchase_limit}. Parent approval required.",
        )

    if settings.daily_limit:
        daily_spent = await _get_spending_in_period(
            db, student_user_id, hours=24,
        )
        if daily_spent + amount > settings.daily_limit:
            request = await _create_approval_request(
                db, student_user_id, student.parent_id,
                purchase_type, item_id, item_name, amount,
            )
            raise PurchaseRequiresApproval(
                request_id=str(request.id),
                message="This purchase would exceed your daily spending limit. Parent approval required.",
            )

    if settings.monthly_limit:
        monthly_spent = await _get_spending_in_period(
            db, student_user_id, hours=24 * 30,
        )
        if monthly_spent + amount > settings.monthly_limit:
            request = await _create_approval_request(
                db, student_user_id, student.parent_id,
                purchase_type, item_id, item_name, amount,
            )
            raise PurchaseRequiresApproval(
                request_id=str(request.id),
                message="This purchase would exceed your monthly spending limit. Parent approval required.",
            )

    # Within all limits — auto-approve
    logger.info(
        "Auto-approved purchase for student %s: %s %s (within limits)",
        student_user_id, amount, item_name,
    )
    return True


async def _create_approval_request(
    db: AsyncSession,
    child_id: UUID,
    parent_id: UUID,
    purchase_type: str,
    item_id: Optional[UUID],
    item_name: str,
    amount: Decimal,
) -> PurchaseApprovalRequest:
    """Create a purchase approval request."""
    request = PurchaseApprovalRequest.create_with_expiry(
        child_id=child_id,
        parent_id=parent_id,
        purchase_type=purchase_type,
        item_id=item_id,
        item_name=item_name,
        amount=amount,
    )
    db.add(request)
    await db.commit()
    await db.refresh(request)

    logger.info(
        "Created purchase approval request %s for child %s (amount=%s)",
        request.id, child_id, amount,
    )

    return request


async def _get_spending_in_period(
    db: AsyncSession,
    child_id: UUID,
    hours: int,
) -> Decimal:
    """Calculate total approved spending in a time period."""
    since = datetime.utcnow() - timedelta(hours=hours)

    result = await db.execute(
        select(func.coalesce(func.sum(PurchaseApprovalRequest.amount), 0)).where(
            and_(
                PurchaseApprovalRequest.child_id == child_id,
                PurchaseApprovalRequest.status.in_([
                    ApprovalStatus.APPROVED,
                    ApprovalStatus.AUTO_APPROVED,
                ]),
                PurchaseApprovalRequest.created_at >= since,
            )
        )
    )
    return Decimal(str(result.scalar() or 0))
