"""
Child Wallet Service

Business logic for parent-child wallet operations:
- Parent topping up child's wallet
- Configuring purchase approval settings
- Approving/rejecting child purchases
"""

import logging
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import Wallet
from app.models.student import Student
from app.models.parent.purchase_approval import (
    PurchaseApprovalSetting,
    PurchaseApprovalRequest,
    PurchaseApprovalMode,
    ApprovalStatus,
)

logger = logging.getLogger(__name__)


class ChildWalletService:
    """Manage parent-child wallet interactions."""

    @staticmethod
    async def validate_parent_child(
        db: AsyncSession,
        parent_id: UUID,
        child_user_id: UUID,
    ) -> Student:
        """Verify the parent-child relationship exists."""
        result = await db.execute(
            select(Student).where(
                Student.user_id == child_user_id,
                Student.parent_id == parent_id,
            )
        )
        student = result.scalar_one_or_none()
        if not student:
            raise ValueError("Child not found or not linked to your account")
        return student

    @staticmethod
    async def top_up_child_wallet(
        db: AsyncSession,
        parent_id: UUID,
        child_user_id: UUID,
        amount: Decimal,
    ) -> Dict[str, Any]:
        """
        Transfer funds from parent's wallet to child's wallet.
        """
        # Verify parent-child relationship
        await ChildWalletService.validate_parent_child(db, parent_id, child_user_id)

        # Get parent wallet
        parent_wallet_result = await db.execute(
            select(Wallet).where(Wallet.user_id == parent_id)
        )
        parent_wallet = parent_wallet_result.scalar_one_or_none()
        if not parent_wallet:
            raise ValueError("Parent wallet not found")

        if Decimal(str(parent_wallet.balance)) < amount:
            raise ValueError(
                f"Insufficient balance. Available: {parent_wallet.balance} {parent_wallet.currency}"
            )

        # Get child wallet
        child_wallet_result = await db.execute(
            select(Wallet).where(Wallet.user_id == child_user_id)
        )
        child_wallet = child_wallet_result.scalar_one_or_none()
        if not child_wallet:
            raise ValueError("Child wallet not found")

        # Transfer
        parent_wallet.debit(amount)
        child_wallet.credit(amount)

        await db.commit()

        logger.info(
            "Parent %s topped up child %s wallet by %s",
            parent_id, child_user_id, amount,
        )

        return {
            "parent_balance": float(parent_wallet.balance),
            "child_balance": float(child_wallet.balance),
            "amount_transferred": float(amount),
        }

    @staticmethod
    async def get_child_wallet_balance(
        db: AsyncSession,
        parent_id: UUID,
        child_user_id: UUID,
    ) -> Dict[str, Any]:
        """Get the child's wallet balance (parent must be linked)."""
        await ChildWalletService.validate_parent_child(db, parent_id, child_user_id)

        result = await db.execute(
            select(Wallet).where(Wallet.user_id == child_user_id)
        )
        wallet = result.scalar_one_or_none()

        return {
            "balance": float(wallet.balance) if wallet else 0,
            "currency": wallet.currency if wallet else "KES",
            "total_credited": float(wallet.total_credited) if wallet else 0,
            "total_debited": float(wallet.total_debited) if wallet else 0,
        }

    @staticmethod
    async def configure_approval_settings(
        db: AsyncSession,
        parent_id: UUID,
        child_user_id: UUID,
        mode: str,
        daily_limit: Optional[Decimal] = None,
        monthly_limit: Optional[Decimal] = None,
        per_purchase_limit: Optional[Decimal] = None,
    ) -> Dict[str, Any]:
        """Configure purchase approval mode for a child."""
        await ChildWalletService.validate_parent_child(db, parent_id, child_user_id)

        try:
            approval_mode = PurchaseApprovalMode(mode)
        except ValueError:
            raise ValueError(f"Invalid mode: {mode}. Use 'realtime' or 'spending_limit'")

        # Find or create settings
        result = await db.execute(
            select(PurchaseApprovalSetting).where(
                PurchaseApprovalSetting.parent_id == parent_id,
                PurchaseApprovalSetting.child_id == child_user_id,
            )
        )
        settings = result.scalar_one_or_none()

        if settings:
            settings.mode = approval_mode
            settings.daily_limit = daily_limit
            settings.monthly_limit = monthly_limit
            settings.per_purchase_limit = per_purchase_limit
        else:
            settings = PurchaseApprovalSetting(
                parent_id=parent_id,
                child_id=child_user_id,
                mode=approval_mode,
                daily_limit=daily_limit,
                monthly_limit=monthly_limit,
                per_purchase_limit=per_purchase_limit,
            )
            db.add(settings)

        await db.commit()

        return {
            "mode": settings.mode.value,
            "daily_limit": float(settings.daily_limit) if settings.daily_limit else None,
            "monthly_limit": float(settings.monthly_limit) if settings.monthly_limit else None,
            "per_purchase_limit": float(settings.per_purchase_limit) if settings.per_purchase_limit else None,
        }

    @staticmethod
    async def get_approval_settings(
        db: AsyncSession,
        parent_id: UUID,
        child_user_id: UUID,
    ) -> Optional[Dict[str, Any]]:
        """Get purchase approval settings for a child."""
        result = await db.execute(
            select(PurchaseApprovalSetting).where(
                PurchaseApprovalSetting.parent_id == parent_id,
                PurchaseApprovalSetting.child_id == child_user_id,
            )
        )
        settings = result.scalar_one_or_none()

        if not settings:
            return {"mode": "realtime", "daily_limit": None, "monthly_limit": None, "per_purchase_limit": None}

        return {
            "mode": settings.mode.value,
            "daily_limit": float(settings.daily_limit) if settings.daily_limit else None,
            "monthly_limit": float(settings.monthly_limit) if settings.monthly_limit else None,
            "per_purchase_limit": float(settings.per_purchase_limit) if settings.per_purchase_limit else None,
        }

    @staticmethod
    async def list_pending_approvals(
        db: AsyncSession,
        parent_id: UUID,
    ) -> List[Dict[str, Any]]:
        """List pending purchase approval requests for a parent."""
        now = datetime.utcnow()

        result = await db.execute(
            select(PurchaseApprovalRequest).where(
                PurchaseApprovalRequest.parent_id == parent_id,
                PurchaseApprovalRequest.status == ApprovalStatus.PENDING,
                PurchaseApprovalRequest.expires_at > now,
            ).order_by(PurchaseApprovalRequest.created_at.desc())
        )
        requests = result.scalars().all()

        return [
            {
                "id": str(r.id),
                "child_id": str(r.child_id),
                "purchase_type": r.purchase_type,
                "item_name": r.item_name,
                "amount": float(r.amount),
                "currency": r.currency,
                "status": r.status.value,
                "created_at": r.created_at.isoformat(),
                "expires_at": r.expires_at.isoformat(),
            }
            for r in requests
        ]

    @staticmethod
    async def approve_purchase(
        db: AsyncSession,
        parent_id: UUID,
        request_id: UUID,
    ) -> Dict[str, Any]:
        """Approve a child's purchase request."""
        result = await db.execute(
            select(PurchaseApprovalRequest).where(
                PurchaseApprovalRequest.id == request_id,
                PurchaseApprovalRequest.parent_id == parent_id,
            )
        )
        request = result.scalar_one_or_none()

        if not request:
            raise ValueError("Purchase request not found")
        if request.status != ApprovalStatus.PENDING:
            raise ValueError(f"Cannot approve request with status: {request.status.value}")
        if request.expires_at < datetime.utcnow():
            request.status = ApprovalStatus.EXPIRED
            await db.commit()
            raise ValueError("Purchase request has expired")

        # Debit child's wallet
        wallet_result = await db.execute(
            select(Wallet).where(Wallet.user_id == request.child_id)
        )
        wallet = wallet_result.scalar_one_or_none()
        if not wallet or Decimal(str(wallet.balance)) < request.amount:
            raise ValueError("Child does not have sufficient balance for this purchase")

        wallet.debit(request.amount)
        request.status = ApprovalStatus.APPROVED
        request.decision_at = datetime.utcnow()

        await db.commit()

        return {
            "id": str(request.id),
            "status": request.status.value,
            "item_name": request.item_name,
            "amount": float(request.amount),
        }

    @staticmethod
    async def reject_purchase(
        db: AsyncSession,
        parent_id: UUID,
        request_id: UUID,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Reject a child's purchase request."""
        result = await db.execute(
            select(PurchaseApprovalRequest).where(
                PurchaseApprovalRequest.id == request_id,
                PurchaseApprovalRequest.parent_id == parent_id,
            )
        )
        request = result.scalar_one_or_none()

        if not request:
            raise ValueError("Purchase request not found")
        if request.status != ApprovalStatus.PENDING:
            raise ValueError(f"Cannot reject request with status: {request.status.value}")

        request.status = ApprovalStatus.REJECTED
        request.decision_at = datetime.utcnow()
        request.rejection_reason = reason

        await db.commit()

        return {
            "id": str(request.id),
            "status": request.status.value,
        }
