"""
Partner Wallet Service

Business logic for partner wallet operations: balance, transactions,
top-up, and withdrawal requests.
"""

import uuid
from decimal import Decimal
from typing import Any, Dict, List, Optional

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import Wallet, Transaction


class PartnerWalletService:
    """Service layer for partner wallet operations."""

    async def get_balance(self, db: AsyncSession, user_id: str) -> Dict[str, Any]:
        """Return the partner's wallet balance and tracking totals."""
        uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id

        result = await db.execute(
            select(Wallet).where(Wallet.user_id == uid)
        )
        wallet = result.scalar_one_or_none()

        if not wallet:
            return {
                "balance": 0,
                "currency": "KES",
                "total_credited": 0,
                "total_debited": 0,
                "total_withdrawn": 0,
            }

        return {
            "balance": float(wallet.balance),
            "currency": wallet.currency,
            "total_credited": float(getattr(wallet, "total_credited", 0) or 0),
            "total_debited": float(getattr(wallet, "total_debited", 0) or 0),
            "total_withdrawn": float(getattr(wallet, "total_withdrawn", 0) or 0),
        }

    async def get_transactions(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 50,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """Return paginated wallet transactions for the partner."""
        uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id

        result = await db.execute(
            select(Transaction)
            .where(Transaction.user_id == uid)
            .order_by(desc(Transaction.created_at))
            .offset(offset)
            .limit(limit)
        )
        transactions = result.scalars().all()

        items = []
        for t in transactions:
            items.append({
                "id": str(t.id),
                "amount": float(t.amount),
                "currency": t.currency,
                "transaction_type": t.transaction_type,
                "status": t.status,
                "description": getattr(t, "description", None) or t.transaction_type,
                "reference": t.reference,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            })

        return {"items": items, "total": len(items), "limit": limit, "offset": offset}

    async def top_up(
        self,
        db: AsyncSession,
        user_id: str,
        amount: float,
        payment_method: str = "paystack",
    ) -> Dict[str, Any]:
        """
        Initiate a wallet top-up for the partner.

        In production this would trigger a Paystack/M-Pesa charge flow.
        For now, directly credits the wallet as a placeholder.
        """
        uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        decimal_amount = Decimal(str(amount))

        result = await db.execute(
            select(Wallet).where(Wallet.user_id == uid)
        )
        wallet = result.scalar_one_or_none()

        if not wallet:
            raise ValueError("Wallet not found for this user")

        wallet.credit(decimal_amount)

        tx = Transaction(
            user_id=uid,
            amount=decimal_amount,
            currency=wallet.currency,
            transaction_type="wallet_top_up",
            status="completed",
            reference=f"PTOP-{uuid.uuid4().hex[:8].upper()}",
            payment_gateway=payment_method,
        )
        db.add(tx)
        await db.commit()

        return {
            "balance": float(wallet.balance),
            "amount_added": float(decimal_amount),
            "transaction_reference": tx.reference,
        }


partner_wallet_service = PartnerWalletService()
