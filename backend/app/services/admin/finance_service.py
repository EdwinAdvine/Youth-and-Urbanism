"""
Admin Finance Service - Phase 7 (Finance & Partnerships)

Provides financial data aggregation, refund queue management,
failed payment tracking, payout processing, partner management,
and invoice listing for the admin finance dashboard.

Methods return dicts/lists suitable for direct JSON serialisation in
FastAPI response models.
"""

import logging
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import Transaction

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
        """
        Paginated list of transactions from the Transaction model.

        Supports filtering by payment gateway, status, and date range.

        Args:
            db: Async database session
            page: Current page number (1-based)
            page_size: Number of items per page
            gateway_filter: Filter by gateway (mpesa, paypal, stripe)
            status_filter: Filter by status (pending, completed, failed, refunded)
            date_from: Filter transactions created on or after this date
            date_to: Filter transactions created on or before this date

        Returns:
            Dict with items, total, page, page_size, and total_pages
        """
        # Build base query with filters
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

        # Count total matching records
        count_query = select(func.count(Transaction.id)).where(where_clause)
        count_result = await db.execute(count_query)
        total: int = count_result.scalar() or 0

        # Fetch paginated records
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
    async def get_refund_queue(db: AsyncSession) -> List[Dict[str, Any]]:
        """
        Get pending refund requests.

        Returns mock data until a dedicated RefundRequest model is added.
        Falls back to mock if no refunded transactions exist.
        """
        now = datetime.utcnow()

        refund_requests: List[Dict[str, Any]] = [
            {
                "id": str(uuid.uuid4()),
                "transaction_id": f"TXN-MPESA-{uuid.uuid4().hex[:8].upper()}",
                "user_name": "Grace Wanjiku",
                "user_email": "grace.wanjiku@example.com",
                "amount": 1200.00,
                "currency": "KES",
                "gateway": "mpesa",
                "reason": "Course content not as described",
                "original_date": (now - timedelta(days=5)).isoformat(),
                "requested_at": (now - timedelta(hours=8)).isoformat(),
                "status": "pending_review",
                "priority": "high",
            },
            {
                "id": str(uuid.uuid4()),
                "transaction_id": f"TXN-MPESA-{uuid.uuid4().hex[:8].upper()}",
                "user_name": "James Ochieng",
                "user_email": "james.ochieng@example.com",
                "amount": 2500.00,
                "currency": "KES",
                "gateway": "mpesa",
                "reason": "Duplicate payment - paid twice for Premium plan",
                "original_date": (now - timedelta(days=2)).isoformat(),
                "requested_at": (now - timedelta(hours=3)).isoformat(),
                "status": "pending_review",
                "priority": "critical",
            },
            {
                "id": str(uuid.uuid4()),
                "transaction_id": f"TXN-STRIPE-{uuid.uuid4().hex[:8].upper()}",
                "user_name": "Mary Kamau",
                "user_email": "mary.kamau@example.com",
                "amount": 500.00,
                "currency": "KES",
                "gateway": "stripe",
                "reason": "Accidental subscription upgrade",
                "original_date": (now - timedelta(days=1)).isoformat(),
                "requested_at": (now - timedelta(hours=12)).isoformat(),
                "status": "pending_review",
                "priority": "medium",
            },
            {
                "id": str(uuid.uuid4()),
                "transaction_id": f"TXN-PAYPAL-{uuid.uuid4().hex[:8].upper()}",
                "user_name": "Peter Njoroge",
                "user_email": "peter.njoroge@example.com",
                "amount": 3500.00,
                "currency": "KES",
                "gateway": "paypal",
                "reason": "Technical issue prevented course access for 2 weeks",
                "original_date": (now - timedelta(days=14)).isoformat(),
                "requested_at": (now - timedelta(days=1)).isoformat(),
                "status": "pending_review",
                "priority": "high",
            },
            {
                "id": str(uuid.uuid4()),
                "transaction_id": f"TXN-MPESA-{uuid.uuid4().hex[:8].upper()}",
                "user_name": "Sarah Akinyi",
                "user_email": "sarah.akinyi@example.com",
                "amount": 800.00,
                "currency": "KES",
                "gateway": "mpesa",
                "reason": "Child no longer attending - family relocation",
                "original_date": (now - timedelta(days=7)).isoformat(),
                "requested_at": (now - timedelta(hours=18)).isoformat(),
                "status": "pending_review",
                "priority": "low",
            },
        ]

        return refund_requests

    # ------------------------------------------------------------------
    # Failed Payments
    # ------------------------------------------------------------------
    @staticmethod
    async def get_failed_payments(db: AsyncSession) -> List[Dict[str, Any]]:
        """
        Get recent failed payment attempts.

        Returns mock data until dedicated failure tracking is in place.
        """
        now = datetime.utcnow()

        failed: List[Dict[str, Any]] = [
            {
                "id": str(uuid.uuid4()),
                "transaction_reference": f"MPESA-FAIL-{uuid.uuid4().hex[:6].upper()}",
                "user_name": "John Mutua",
                "user_email": "john.mutua@example.com",
                "amount": 1200.00,
                "currency": "KES",
                "gateway": "mpesa",
                "error_code": "INSUFFICIENT_FUNDS",
                "error_message": "M-Pesa account has insufficient funds to complete this transaction",
                "retry_count": 2,
                "last_attempt": (now - timedelta(minutes=15)).isoformat(),
                "created_at": (now - timedelta(hours=1)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "transaction_reference": f"STRIPE-FAIL-{uuid.uuid4().hex[:6].upper()}",
                "user_name": "Amina Hassan",
                "user_email": "amina.hassan@example.com",
                "amount": 2500.00,
                "currency": "KES",
                "gateway": "stripe",
                "error_code": "CARD_DECLINED",
                "error_message": "The card was declined by the issuing bank",
                "retry_count": 1,
                "last_attempt": (now - timedelta(minutes=45)).isoformat(),
                "created_at": (now - timedelta(hours=2)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "transaction_reference": f"MPESA-FAIL-{uuid.uuid4().hex[:6].upper()}",
                "user_name": "David Kipchoge",
                "user_email": "david.kipchoge@example.com",
                "amount": 500.00,
                "currency": "KES",
                "gateway": "mpesa",
                "error_code": "TIMEOUT",
                "error_message": "M-Pesa STK push timed out - user did not enter PIN",
                "retry_count": 3,
                "last_attempt": (now - timedelta(hours=1)).isoformat(),
                "created_at": (now - timedelta(hours=4)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "transaction_reference": f"PAYPAL-FAIL-{uuid.uuid4().hex[:6].upper()}",
                "user_name": "Lucy Wambui",
                "user_email": "lucy.wambui@example.com",
                "amount": 3500.00,
                "currency": "KES",
                "gateway": "paypal",
                "error_code": "ACCOUNT_RESTRICTED",
                "error_message": "PayPal account is currently restricted. Contact PayPal support.",
                "retry_count": 0,
                "last_attempt": (now - timedelta(hours=3)).isoformat(),
                "created_at": (now - timedelta(hours=3)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "transaction_reference": f"MPESA-FAIL-{uuid.uuid4().hex[:6].upper()}",
                "user_name": "Samuel Otieno",
                "user_email": "samuel.otieno@example.com",
                "amount": 1800.00,
                "currency": "KES",
                "gateway": "mpesa",
                "error_code": "NETWORK_ERROR",
                "error_message": "Network connectivity issue between Safaricom and payment processor",
                "retry_count": 4,
                "last_attempt": (now - timedelta(minutes=5)).isoformat(),
                "created_at": (now - timedelta(hours=6)).isoformat(),
            },
        ]

        return failed

    # ------------------------------------------------------------------
    # Payout Queue
    # ------------------------------------------------------------------
    @staticmethod
    async def get_payout_queue(db: AsyncSession) -> List[Dict[str, Any]]:
        """
        Get pending instructor and partner payouts.

        Returns mock data until a dedicated Payout model is added.
        """
        now = datetime.utcnow()

        payouts: List[Dict[str, Any]] = [
            {
                "id": str(uuid.uuid4()),
                "recipient_name": "Dr. Faith Muthoni",
                "recipient_type": "instructor",
                "amount": 45000.00,
                "currency": "KES",
                "gateway": "mpesa",
                "phone_number": "+254712***890",
                "description": "Course royalties - January 2026",
                "status": "pending_approval",
                "requested_at": (now - timedelta(hours=4)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "recipient_name": "Elimu Digital Ltd",
                "recipient_type": "partner",
                "amount": 120000.00,
                "currency": "KES",
                "gateway": "mpesa",
                "phone_number": "+254720***456",
                "description": "Revenue share - Q4 2025",
                "status": "pending_approval",
                "requested_at": (now - timedelta(hours=12)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "recipient_name": "Prof. Kevin Onyango",
                "recipient_type": "instructor",
                "amount": 28500.00,
                "currency": "KES",
                "gateway": "mpesa",
                "phone_number": "+254711***234",
                "description": "Course royalties + bonus - January 2026",
                "status": "pending_approval",
                "requested_at": (now - timedelta(days=1)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "recipient_name": "Kenya Publishers Association",
                "recipient_type": "partner",
                "amount": 85000.00,
                "currency": "KES",
                "gateway": "stripe",
                "phone_number": None,
                "description": "Content licensing fees - January 2026",
                "status": "pending_approval",
                "requested_at": (now - timedelta(days=2)).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "recipient_name": "Mrs. Njeri Macharia",
                "recipient_type": "instructor",
                "amount": 15750.00,
                "currency": "KES",
                "gateway": "mpesa",
                "phone_number": "+254722***678",
                "description": "Assessment creation fees - December 2025",
                "status": "processing",
                "requested_at": (now - timedelta(days=3)).isoformat(),
            },
        ]

        return payouts

    # ------------------------------------------------------------------
    # Partners
    # ------------------------------------------------------------------
    @staticmethod
    async def list_partners(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        type_filter: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        List partners with optional type filtering and pagination.

        Returns mock data until a dedicated Partner model is added.

        Args:
            db: Async database session
            page: Current page number (1-based)
            page_size: Number of items per page
            type_filter: Filter by partner type (content, business)
        """
        all_partners: List[Dict[str, Any]] = [
            {
                "id": str(uuid.uuid4()),
                "name": "Elimu Digital Ltd",
                "type": "content",
                "contact_email": "partnerships@elimudigital.co.ke",
                "contact_phone": "+254720456789",
                "status": "active",
                "revenue_share_percent": 15.0,
                "students_referred": 342,
                "revenue_generated": 1250000.00,
                "api_usage": 12450,
                "contract_start": "2024-06-01",
                "contract_end": "2026-05-31",
                "description": "Leading Kenyan digital textbook publisher providing CBC-aligned content",
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Kenya Publishers Association",
                "type": "content",
                "contact_email": "digital@kpa.co.ke",
                "contact_phone": "+254733987654",
                "status": "active",
                "revenue_share_percent": 12.5,
                "students_referred": 0,
                "revenue_generated": 850000.00,
                "api_usage": 8200,
                "contract_start": "2025-01-01",
                "contract_end": "2026-12-31",
                "description": "National association providing licensed textbook content for all grade levels",
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Safaricom PLC",
                "type": "business",
                "contact_email": "edupartners@safaricom.co.ke",
                "contact_phone": "+254722000100",
                "status": "active",
                "revenue_share_percent": 8.0,
                "students_referred": 1580,
                "revenue_generated": 3200000.00,
                "api_usage": 45600,
                "contract_start": "2024-09-01",
                "contract_end": "2026-08-31",
                "description": "M-Pesa payment integration and student acquisition via Safaricom bundles",
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Twiga Education Foundation",
                "type": "business",
                "contact_email": "admin@twigaedu.org",
                "contact_phone": "+254711234567",
                "status": "active",
                "revenue_share_percent": 10.0,
                "students_referred": 890,
                "revenue_generated": 620000.00,
                "api_usage": 3200,
                "contract_start": "2025-03-01",
                "contract_end": "2027-02-28",
                "description": "Non-profit providing scholarships and subsidised access to rural students",
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Longhorn Publishers",
                "type": "content",
                "contact_email": "digital@longhornpublishers.com",
                "contact_phone": "+254720876543",
                "status": "pending",
                "revenue_share_percent": 14.0,
                "students_referred": 0,
                "revenue_generated": 0.0,
                "api_usage": 0,
                "contract_start": "2026-03-01",
                "contract_end": "2028-02-28",
                "description": "Major East African publisher with extensive CBC curriculum materials",
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Equity Bank Foundation",
                "type": "business",
                "contact_email": "education@equitybank.co.ke",
                "contact_phone": "+254763000200",
                "status": "active",
                "revenue_share_percent": 5.0,
                "students_referred": 450,
                "revenue_generated": 380000.00,
                "api_usage": 1800,
                "contract_start": "2025-06-01",
                "contract_end": "2027-05-31",
                "description": "Banking partner providing education loans and Wings to Fly integration",
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Oxford University Press EA",
                "type": "content",
                "contact_email": "digital.ea@oup.com",
                "contact_phone": "+254733456789",
                "status": "expired",
                "revenue_share_percent": 18.0,
                "students_referred": 120,
                "revenue_generated": 450000.00,
                "api_usage": 5600,
                "contract_start": "2024-01-01",
                "contract_end": "2025-12-31",
                "description": "International publisher with Kenyan curriculum adaptation materials",
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Jomo Kenyatta Foundation",
                "type": "content",
                "contact_email": "partnerships@jkf.co.ke",
                "contact_phone": "+254722345678",
                "status": "active",
                "revenue_share_percent": 11.0,
                "students_referred": 215,
                "revenue_generated": 720000.00,
                "api_usage": 6800,
                "contract_start": "2025-02-01",
                "contract_end": "2027-01-31",
                "description": "Government-affiliated publisher with primary and secondary school content",
            },
        ]

        # Apply type filter
        if type_filter:
            all_partners = [p for p in all_partners if p["type"] == type_filter]

        total = len(all_partners)
        total_pages = max(1, (total + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        items = all_partners[offset : offset + page_size]

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
    ) -> Dict[str, Any]:
        """
        List invoices with pagination.

        Returns mock data until a dedicated Invoice model is added.

        Args:
            db: Async database session
            page: Current page number (1-based)
            page_size: Number of items per page
        """
        now = datetime.utcnow()

        all_invoices: List[Dict[str, Any]] = [
            {
                "id": str(uuid.uuid4()),
                "invoice_number": "INV-2026-0001",
                "recipient_name": "Dr. Faith Muthoni",
                "recipient_email": "faith.muthoni@example.com",
                "type": "instructor_payout",
                "amount": 45000.00,
                "currency": "KES",
                "status": "paid",
                "issued_date": (now - timedelta(days=30)).strftime("%Y-%m-%d"),
                "due_date": (now - timedelta(days=15)).strftime("%Y-%m-%d"),
                "paid_date": (now - timedelta(days=18)).strftime("%Y-%m-%d"),
                "description": "Course royalties payment - January 2026",
            },
            {
                "id": str(uuid.uuid4()),
                "invoice_number": "INV-2026-0002",
                "recipient_name": "Elimu Digital Ltd",
                "recipient_email": "finance@elimudigital.co.ke",
                "type": "partner_revenue_share",
                "amount": 120000.00,
                "currency": "KES",
                "status": "pending",
                "issued_date": (now - timedelta(days=7)).strftime("%Y-%m-%d"),
                "due_date": (now + timedelta(days=23)).strftime("%Y-%m-%d"),
                "paid_date": None,
                "description": "Revenue share payment - Q4 2025",
            },
            {
                "id": str(uuid.uuid4()),
                "invoice_number": "INV-2026-0003",
                "recipient_name": "Safaricom PLC",
                "recipient_email": "billing@safaricom.co.ke",
                "type": "service_fee",
                "amount": 35000.00,
                "currency": "KES",
                "status": "overdue",
                "issued_date": (now - timedelta(days=45)).strftime("%Y-%m-%d"),
                "due_date": (now - timedelta(days=15)).strftime("%Y-%m-%d"),
                "paid_date": None,
                "description": "M-Pesa integration service fees - December 2025",
            },
            {
                "id": str(uuid.uuid4()),
                "invoice_number": "INV-2026-0004",
                "recipient_name": "Prof. Kevin Onyango",
                "recipient_email": "kevin.onyango@example.com",
                "type": "instructor_payout",
                "amount": 28500.00,
                "currency": "KES",
                "status": "paid",
                "issued_date": (now - timedelta(days=20)).strftime("%Y-%m-%d"),
                "due_date": (now - timedelta(days=5)).strftime("%Y-%m-%d"),
                "paid_date": (now - timedelta(days=8)).strftime("%Y-%m-%d"),
                "description": "Course royalties + performance bonus - January 2026",
            },
            {
                "id": str(uuid.uuid4()),
                "invoice_number": "INV-2026-0005",
                "recipient_name": "Kenya Publishers Association",
                "recipient_email": "finance@kpa.co.ke",
                "type": "content_licensing",
                "amount": 85000.00,
                "currency": "KES",
                "status": "pending",
                "issued_date": (now - timedelta(days=3)).strftime("%Y-%m-%d"),
                "due_date": (now + timedelta(days=27)).strftime("%Y-%m-%d"),
                "paid_date": None,
                "description": "Content licensing fees - January 2026",
            },
            {
                "id": str(uuid.uuid4()),
                "invoice_number": "INV-2026-0006",
                "recipient_name": "Twiga Education Foundation",
                "recipient_email": "finance@twigaedu.org",
                "type": "partner_revenue_share",
                "amount": 62000.00,
                "currency": "KES",
                "status": "draft",
                "issued_date": now.strftime("%Y-%m-%d"),
                "due_date": (now + timedelta(days=30)).strftime("%Y-%m-%d"),
                "paid_date": None,
                "description": "Scholarship programme revenue share - February 2026",
            },
            {
                "id": str(uuid.uuid4()),
                "invoice_number": "INV-2026-0007",
                "recipient_name": "Jomo Kenyatta Foundation",
                "recipient_email": "accounts@jkf.co.ke",
                "type": "content_licensing",
                "amount": 72000.00,
                "currency": "KES",
                "status": "paid",
                "issued_date": (now - timedelta(days=35)).strftime("%Y-%m-%d"),
                "due_date": (now - timedelta(days=5)).strftime("%Y-%m-%d"),
                "paid_date": (now - timedelta(days=10)).strftime("%Y-%m-%d"),
                "description": "Content licensing and digital rights - Q4 2025",
            },
            {
                "id": str(uuid.uuid4()),
                "invoice_number": "INV-2026-0008",
                "recipient_name": "Mrs. Njeri Macharia",
                "recipient_email": "njeri.macharia@example.com",
                "type": "instructor_payout",
                "amount": 15750.00,
                "currency": "KES",
                "status": "pending",
                "issued_date": (now - timedelta(days=5)).strftime("%Y-%m-%d"),
                "due_date": (now + timedelta(days=25)).strftime("%Y-%m-%d"),
                "paid_date": None,
                "description": "Assessment creation fees - December 2025",
            },
        ]

        total = len(all_invoices)
        total_pages = max(1, (total + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        items = all_invoices[offset : offset + page_size]

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }
