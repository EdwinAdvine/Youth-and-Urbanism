"""
Admin Finance Service - Phase 7 (Finance & Partnerships)

Provides financial data aggregation, refund queue management,
payout processing, partner management, subscription plan listing,
and invoice listing for the admin finance dashboard.

All methods query real database models (Transaction, Invoice,
PayoutQueueItem, PartnerContract).
"""

import logging
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import Transaction
from app.models.user import User
from app.models.admin.finance import Invoice, PayoutQueueItem, PartnerContract

logger = logging.getLogger(__name__)


def _decimal_to_float(value: Any) -> float:
    """Safely convert a Decimal/None to float for JSON serialisation."""
    if value is None:
        return 0.0
    return float(value)


class FinanceService:
    """Service for admin finance and partnerships data."""

    # ------------------------------------------------------------------
    # Transactions
    # ------------------------------------------------------------------
    @staticmethod
    async def list_transactions(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        gateway_filter: Optional[str] = None,
        status_filter: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Paginated list of transactions from the Transaction model."""
        conditions = []

        if gateway_filter:
            conditions.append(Transaction.gateway == gateway_filter)
        if status_filter:
            conditions.append(Transaction.status == status_filter)
        if date_from:
            conditions.append(Transaction.created_at >= date_from)
        if date_to:
            conditions.append(Transaction.created_at <= date_to)

        where_clause = and_(*conditions) if conditions else True

        count_query = select(func.count(Transaction.id)).where(where_clause)
        count_result = await db.execute(count_query)
        total: int = count_result.scalar() or 0

        offset = (page - 1) * page_size
        items_query = (
            select(Transaction)
            .where(where_clause)
            .order_by(Transaction.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items_result = await db.execute(items_query)
        rows = items_result.scalars().all()

        items: List[Dict[str, Any]] = []
        for txn in rows:
            items.append({
                "id": str(txn.id),
                "user_id": str(txn.user_id),
                "amount": _decimal_to_float(txn.amount),
                "currency": txn.currency,
                "gateway": txn.gateway,
                "status": txn.status,
                "transaction_reference": txn.transaction_reference,
                "metadata": txn.transaction_metadata,
                "created_at": txn.created_at.isoformat() if txn.created_at else None,
                "updated_at": txn.updated_at.isoformat() if txn.updated_at else None,
            })

        total_pages = max(1, (total + page_size - 1) // page_size)

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

    # ------------------------------------------------------------------
    # Refund Queue
    # ------------------------------------------------------------------
    @staticmethod
    async def get_refund_queue(
        db: AsyncSession,
        status_filter: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get refund requests by querying transactions with status='refunded'
        or status='pending_refund'.
        """
        conditions = [
            Transaction.status.in_(["refunded", "pending_refund"])
        ]
        if status_filter:
            conditions.append(Transaction.status == status_filter)

        q = (
            select(Transaction)
            .where(and_(*conditions))
            .order_by(Transaction.created_at.desc())
            .limit(50)
        )
        result = await db.execute(q)
        rows = result.scalars().all()

        # Resolve user names
        user_ids = list({r.user_id for r in rows if r.user_id})
        user_names: Dict[str, str] = {}
        if user_ids:
            uq = select(User.id, User.first_name, User.last_name).where(User.id.in_(user_ids))
            uresult = await db.execute(uq)
            for row in uresult:
                user_names[str(row.id)] = f"{row.first_name} {row.last_name}"

        items: List[Dict[str, Any]] = []
        for txn in rows:
            items.append({
                "id": str(txn.id),
                "transaction_id": str(txn.id),
                "reference": txn.transaction_reference or "",
                "user_name": user_names.get(str(txn.user_id), "Unknown"),
                "amount": _decimal_to_float(txn.amount),
                "currency": txn.currency,
                "gateway": txn.gateway,
                "status": txn.status,
                "created_at": txn.created_at.isoformat() if txn.created_at else None,
            })

        return items

    # ------------------------------------------------------------------
    # Payout Queue
    # ------------------------------------------------------------------
    @staticmethod
    async def get_payout_queue(
        db: AsyncSession,
        status_filter: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Get pending/processing payouts from the PayoutQueueItem model."""
        conditions = []
        if status_filter:
            conditions.append(PayoutQueueItem.status == status_filter)

        where_clause = and_(*conditions) if conditions else True

        q = (
            select(PayoutQueueItem)
            .where(where_clause)
            .order_by(PayoutQueueItem.created_at.desc())
            .limit(50)
        )
        result = await db.execute(q)
        rows = result.scalars().all()

        # Resolve recipient names
        recipient_ids = list({r.recipient_id for r in rows if r.recipient_id})
        names: Dict[str, str] = {}
        if recipient_ids:
            uq = select(User.id, User.first_name, User.last_name).where(User.id.in_(recipient_ids))
            uresult = await db.execute(uq)
            for row in uresult:
                names[str(row.id)] = f"{row.first_name} {row.last_name}"

        items: List[Dict[str, Any]] = []
        for p in rows:
            items.append({
                "id": str(p.id),
                "recipient_id": str(p.recipient_id),
                "recipient_name": names.get(str(p.recipient_id), "Unknown"),
                "amount": _decimal_to_float(p.amount),
                "currency": p.currency,
                "payment_method": p.payment_method,
                "status": p.status,
                "reference": p.reference,
                "processed_at": p.processed_at.isoformat() if p.processed_at else None,
                "failure_reason": p.failure_reason,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            })

        return items

    # ------------------------------------------------------------------
    # Partners (via PartnerContract)
    # ------------------------------------------------------------------
    @staticmethod
    async def list_partners(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        type_filter: Optional[str] = None,
    ) -> Dict[str, Any]:
        """List partner contracts with optional type filtering and pagination."""
        conditions = []
        if type_filter:
            conditions.append(PartnerContract.contract_type == type_filter)

        where_clause = and_(*conditions) if conditions else True

        count_q = select(func.count(PartnerContract.id)).where(where_clause)
        count_result = await db.execute(count_q)
        total: int = count_result.scalar() or 0

        offset = (page - 1) * page_size
        q = (
            select(PartnerContract)
            .where(where_clause)
            .order_by(PartnerContract.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        result = await db.execute(q)
        rows = result.scalars().all()

        # Resolve partner names
        partner_ids = list({r.partner_id for r in rows if r.partner_id})
        names: Dict[str, str] = {}
        if partner_ids:
            uq = select(User.id, User.first_name, User.last_name).where(User.id.in_(partner_ids))
            uresult = await db.execute(uq)
            for row in uresult:
                names[str(row.id)] = f"{row.first_name} {row.last_name}"

        items: List[Dict[str, Any]] = []
        for c in rows:
            items.append({
                "id": str(c.id),
                "partner_id": str(c.partner_id),
                "partner_name": names.get(str(c.partner_id), "Unknown"),
                "contract_type": c.contract_type,
                "status": c.status,
                "total_value": _decimal_to_float(c.total_value),
                "currency": c.currency,
                "start_date": c.start_date.isoformat() if c.start_date else None,
                "end_date": c.end_date.isoformat() if c.end_date else None,
                "auto_renew": c.auto_renew,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            })

        total_pages = max(1, (total + page_size - 1) // page_size)
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

    # ------------------------------------------------------------------
    # Invoices
    # ------------------------------------------------------------------
    @staticmethod
    async def list_invoices(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        status_filter: Optional[str] = None,
    ) -> Dict[str, Any]:
        """List invoices with pagination and optional status filter."""
        conditions = []
        if status_filter:
            conditions.append(Invoice.status == status_filter)

        where_clause = and_(*conditions) if conditions else True

        count_q = select(func.count(Invoice.id)).where(where_clause)
        count_result = await db.execute(count_q)
        total: int = count_result.scalar() or 0

        offset = (page - 1) * page_size
        q = (
            select(Invoice)
            .where(where_clause)
            .order_by(Invoice.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        result = await db.execute(q)
        rows = result.scalars().all()

        # Resolve names (partner or user)
        all_ids = set()
        for inv in rows:
            if inv.partner_id:
                all_ids.add(inv.partner_id)
            if inv.user_id:
                all_ids.add(inv.user_id)
        names: Dict[str, str] = {}
        if all_ids:
            uq = select(User.id, User.first_name, User.last_name).where(User.id.in_(list(all_ids)))
            uresult = await db.execute(uq)
            for row in uresult:
                names[str(row.id)] = f"{row.first_name} {row.last_name}"

        items: List[Dict[str, Any]] = []
        for inv in rows:
            recipient_id = str(inv.partner_id) if inv.partner_id else str(inv.user_id) if inv.user_id else None
            items.append({
                "id": str(inv.id),
                "invoice_number": inv.invoice_number,
                "recipient_name": names.get(recipient_id, "Unknown") if recipient_id else "Unknown",
                "amount": _decimal_to_float(inv.amount),
                "currency": inv.currency,
                "status": inv.status,
                "due_date": inv.due_date.isoformat() if inv.due_date else None,
                "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
                "notes": inv.notes,
                "created_at": inv.created_at.isoformat() if inv.created_at else None,
            })

        total_pages = max(1, (total + page_size - 1) // page_size)
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

    # ------------------------------------------------------------------
    # Subscription Plans (read from SystemConfig)
    # ------------------------------------------------------------------
    @staticmethod
    async def list_subscription_plans(db: AsyncSession) -> List[Dict[str, Any]]:
        """
        List subscription plans from SystemConfig where
        category='subscription_plans'. Falls back to defaults if none exist.
        """
        from app.models.admin.operations import SystemConfig

        q = select(SystemConfig).where(
            SystemConfig.category == "subscription_plans"
        )
        result = await db.execute(q)
        configs = result.scalars().all()

        if configs:
            plans = []
            for cfg in configs:
                plan_data = cfg.value if isinstance(cfg.value, dict) else {}
                plans.append({
                    "id": str(cfg.id),
                    "name": plan_data.get("name", cfg.key),
                    "slug": cfg.key,
                    "price": plan_data.get("price", 0),
                    "currency": plan_data.get("currency", "KES"),
                    "billing_cycle": plan_data.get("billing_cycle", "monthly"),
                    "features": plan_data.get("features", []),
                    "is_active": plan_data.get("is_active", True),
                })
            return plans

        # Default plans when none configured
        return [
            {
                "id": "default-individual",
                "name": "Individual Student",
                "slug": "individual",
                "price": 1500.00,
                "currency": "KES",
                "billing_cycle": "monthly",
                "features": [
                    "1 student account",
                    "Access to all CBC courses",
                    "AI Tutor - Basic (50 chats/month)",
                    "Progress reports",
                ],
                "is_active": True,
            },
            {
                "id": "default-family",
                "name": "Family Plan",
                "slug": "family",
                "price": 3500.00,
                "currency": "KES",
                "billing_cycle": "monthly",
                "features": [
                    "Up to 4 student accounts",
                    "Access to all CBC courses",
                    "AI Tutor - Premium (unlimited chats)",
                    "Progress reports & analytics",
                    "Parent dashboard",
                ],
                "is_active": True,
            },
            {
                "id": "default-school",
                "name": "School License",
                "slug": "school",
                "price": 25000.00,
                "currency": "KES",
                "billing_cycle": "monthly",
                "features": [
                    "Up to 50 student accounts",
                    "All courses + custom content",
                    "AI Tutor - Premium (unlimited)",
                    "Admin dashboard & bulk management",
                    "Dedicated support",
                ],
                "is_active": True,
            },
        ]
