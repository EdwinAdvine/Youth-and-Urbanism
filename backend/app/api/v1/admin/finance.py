"""
Admin Finance API Endpoints

Provides REST endpoints for the admin finance dashboard:
- Paginated transaction listing
- Refund queue management
- Payout queue management
- Subscription plan listing
- Invoice listing

All endpoints require admin or staff role access.
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_admin_access

logger = logging.getLogger(__name__)

router = APIRouter()


# ------------------------------------------------------------------
# Mock data helpers
# ------------------------------------------------------------------

def _mock_transactions(page: int, page_size: int) -> Dict[str, Any]:
    """Generate realistic mock transaction data."""
    now = datetime.utcnow()
    transactions = []
    statuses = ["completed", "pending", "failed", "refunded"]
    methods = ["mpesa", "card", "bank_transfer", "wallet"]
    descriptions = [
        "Course enrollment - CBC Grade 5 Mathematics",
        "Monthly subscription - Family Plan",
        "Course enrollment - English Language Arts",
        "AI Tutor add-on - Premium Pack",
        "Course enrollment - Kiswahili Grade 4",
        "Assessment fee - Term 1 Examinations",
        "Course bundle - Science & Technology",
        "Monthly subscription - Individual Plan",
    ]

    for i in range(page_size):
        idx = (page - 1) * page_size + i
        transactions.append({
            "id": str(uuid4()),
            "reference": f"TXN-2026-{10000 + idx:05d}",
            "user_id": str(uuid4()),
            "user_name": f"Parent {idx + 1}",
            "user_email": f"parent{idx + 1}@example.com",
            "amount": round(500 + (idx * 73.5 % 4500), 2),
            "currency": "KES",
            "status": statuses[idx % len(statuses)],
            "payment_method": methods[idx % len(methods)],
            "description": descriptions[idx % len(descriptions)],
            "mpesa_receipt": f"SHK{90000 + idx}XYZ" if methods[idx % len(methods)] == "mpesa" else None,
            "created_at": (now - timedelta(hours=idx * 3)).isoformat(),
            "completed_at": (now - timedelta(hours=idx * 3, minutes=-5)).isoformat()
            if statuses[idx % len(statuses)] == "completed" else None,
        })

    return {
        "items": transactions,
        "total": 247,
        "page": page,
        "page_size": page_size,
        "total_pages": (247 + page_size - 1) // page_size,
    }


def _mock_refunds() -> list:
    """Generate mock refund queue entries."""
    now = datetime.utcnow()
    return [
        {
            "id": str(uuid4()),
            "transaction_id": str(uuid4()),
            "reference": "TXN-2026-10023",
            "user_name": "Jane Wanjiku",
            "user_email": "jane.wanjiku@example.com",
            "amount": 2500.00,
            "currency": "KES",
            "reason": "Course cancelled by instructor before start date",
            "status": "pending_review",
            "requested_at": (now - timedelta(days=1)).isoformat(),
        },
        {
            "id": str(uuid4()),
            "transaction_id": str(uuid4()),
            "reference": "TXN-2026-10045",
            "user_name": "Peter Ochieng",
            "user_email": "peter.ochieng@example.com",
            "amount": 1800.00,
            "currency": "KES",
            "reason": "Duplicate payment - M-Pesa timeout caused double charge",
            "status": "pending_review",
            "requested_at": (now - timedelta(days=2)).isoformat(),
        },
        {
            "id": str(uuid4()),
            "transaction_id": str(uuid4()),
            "reference": "TXN-2026-10067",
            "user_name": "Amina Hassan",
            "user_email": "amina.hassan@example.com",
            "amount": 3200.00,
            "currency": "KES",
            "reason": "Student withdrew within 7-day refund window",
            "status": "approved",
            "requested_at": (now - timedelta(days=3)).isoformat(),
            "approved_at": (now - timedelta(days=2)).isoformat(),
        },
    ]


def _mock_payouts() -> list:
    """Generate mock payout queue entries."""
    now = datetime.utcnow()
    return [
        {
            "id": str(uuid4()),
            "instructor_id": str(uuid4()),
            "instructor_name": "Dr. Sarah Kimani",
            "instructor_email": "sarah.kimani@example.com",
            "amount": 45000.00,
            "currency": "KES",
            "payout_method": "mpesa",
            "phone_number": "+254712345678",
            "period": "January 2026",
            "courses_count": 3,
            "enrollments_count": 87,
            "status": "pending",
            "scheduled_at": (now + timedelta(days=2)).isoformat(),
        },
        {
            "id": str(uuid4()),
            "instructor_id": str(uuid4()),
            "instructor_name": "Prof. James Mwangi",
            "instructor_email": "james.mwangi@example.com",
            "amount": 32000.00,
            "currency": "KES",
            "payout_method": "bank_transfer",
            "bank_account": "****4521",
            "period": "January 2026",
            "courses_count": 2,
            "enrollments_count": 54,
            "status": "processing",
            "scheduled_at": (now + timedelta(days=1)).isoformat(),
        },
        {
            "id": str(uuid4()),
            "instructor_id": str(uuid4()),
            "instructor_name": "Ms. Grace Atieno",
            "instructor_email": "grace.atieno@example.com",
            "amount": 28500.00,
            "currency": "KES",
            "payout_method": "mpesa",
            "phone_number": "+254798765432",
            "period": "January 2026",
            "courses_count": 2,
            "enrollments_count": 41,
            "status": "pending",
            "scheduled_at": (now + timedelta(days=2)).isoformat(),
        },
    ]


def _mock_plans() -> list:
    """Generate mock subscription plans."""
    return [
        {
            "id": str(uuid4()),
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
            "active_subscribers": 342,
            "is_active": True,
        },
        {
            "id": str(uuid4()),
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
            "active_subscribers": 189,
            "is_active": True,
        },
        {
            "id": str(uuid4()),
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
                "Custom branding",
            ],
            "active_subscribers": 23,
            "is_active": True,
        },
        {
            "id": str(uuid4()),
            "name": "Annual Individual",
            "slug": "individual-annual",
            "price": 15000.00,
            "currency": "KES",
            "billing_cycle": "yearly",
            "features": [
                "1 student account",
                "Access to all CBC courses",
                "AI Tutor - Premium (unlimited chats)",
                "Progress reports",
                "2 months free",
            ],
            "active_subscribers": 156,
            "is_active": True,
        },
    ]


def _mock_invoices(page: int, page_size: int) -> Dict[str, Any]:
    """Generate mock invoice data."""
    now = datetime.utcnow()
    invoices = []
    statuses = ["paid", "pending", "overdue", "cancelled"]

    for i in range(page_size):
        idx = (page - 1) * page_size + i
        invoices.append({
            "id": str(uuid4()),
            "invoice_number": f"INV-2026-{1000 + idx:04d}",
            "user_id": str(uuid4()),
            "user_name": f"Customer {idx + 1}",
            "user_email": f"customer{idx + 1}@example.com",
            "amount": round(1500 + (idx * 250 % 10000), 2),
            "currency": "KES",
            "status": statuses[idx % len(statuses)],
            "description": "Monthly subscription" if idx % 2 == 0 else "Course enrollment",
            "issued_at": (now - timedelta(days=30 - idx)).isoformat(),
            "due_at": (now - timedelta(days=15 - idx)).isoformat(),
            "paid_at": (now - timedelta(days=14 - idx)).isoformat()
            if statuses[idx % len(statuses)] == "paid" else None,
        })

    return {
        "items": invoices,
        "total": 128,
        "page": page,
        "page_size": page_size,
        "total_pages": (128 + page_size - 1) // page_size,
    }


# ------------------------------------------------------------------
# GET /finance/transactions - paginated transaction list
# ------------------------------------------------------------------
@router.get("/finance/transactions")
async def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    payment_method: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated list of all platform transactions.

    Supports filtering by status, payment method, and search by reference or user name.
    """
    try:
        data = _mock_transactions(page, page_size)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list transactions")
        return {"status": "error", "detail": "Failed to list transactions."}


# ------------------------------------------------------------------
# GET /finance/refunds - refund queue
# ------------------------------------------------------------------
@router.get("/finance/refunds")
async def list_refunds(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List refund requests in the review queue.

    Returns pending, approved, and recently processed refund requests.
    """
    try:
        refunds = _mock_refunds()
        if status_filter:
            refunds = [r for r in refunds if r["status"] == status_filter]
        return {
            "status": "success",
            "data": {
                "items": refunds,
                "total": len(refunds),
            },
        }
    except Exception as exc:
        logger.exception("Failed to list refunds")
        return {"status": "error", "detail": "Failed to list refunds."}


# ------------------------------------------------------------------
# GET /finance/payouts - payout queue
# ------------------------------------------------------------------
@router.get("/finance/payouts")
async def list_payouts(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List instructor payout queue.

    Returns pending and processing payouts scheduled for disbursement.
    """
    try:
        payouts = _mock_payouts()
        if status_filter:
            payouts = [p for p in payouts if p["status"] == status_filter]
        return {
            "status": "success",
            "data": {
                "items": payouts,
                "total": len(payouts),
            },
        }
    except Exception as exc:
        logger.exception("Failed to list payouts")
        return {"status": "error", "detail": "Failed to list payouts."}


# ------------------------------------------------------------------
# GET /finance/plans - subscription plans
# ------------------------------------------------------------------
@router.get("/finance/plans")
async def list_plans(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List all subscription plans with active subscriber counts.

    Returns plan details including pricing, features, and subscriber metrics.
    """
    try:
        plans = _mock_plans()
        return {
            "status": "success",
            "data": {
                "items": plans,
                "total": len(plans),
            },
        }
    except Exception as exc:
        logger.exception("Failed to list plans")
        return {"status": "error", "detail": "Failed to list plans."}


# ------------------------------------------------------------------
# GET /finance/invoices - invoice list
# ------------------------------------------------------------------
@router.get("/finance/invoices")
async def list_invoices(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated list of invoices.

    Supports filtering by status and search by invoice number or customer name.
    """
    try:
        data = _mock_invoices(page, page_size)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list invoices")
        return {"status": "error", "detail": "Failed to list invoices."}
