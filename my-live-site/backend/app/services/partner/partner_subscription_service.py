"""
Partner Subscription Service

Manages partner subscriptions, billing, and payment processing.
Uses async SQLAlchemy queries against the partner_subscriptions
and partner_payments tables.
"""

import logging
import uuid
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.partner.partner_subscription import (
    PartnerSubscription,
    PartnerPayment,
    PartnerSubscriptionStatus,
    PartnerPaymentStatus,
    PartnerPaymentGateway,
)
from app.models.partner.sponsorship import SponsorshipProgram

logger = logging.getLogger(__name__)


# ------------------------------------------------------------------
# Billing period helpers
# ------------------------------------------------------------------

_BILLING_PERIOD_DAYS = {
    "monthly": 30,
    "termly": 90,
    "annual": 365,
}


def _period_end_for(start: date, billing_period: str) -> date:
    """Return the end date of a billing period starting at *start*."""
    days = _BILLING_PERIOD_DAYS.get(billing_period, 30)
    return start + timedelta(days=days)


# ------------------------------------------------------------------
# Serialisation helpers
# ------------------------------------------------------------------

def _subscription_to_dict(sub: PartnerSubscription) -> Dict[str, Any]:
    """Convert a PartnerSubscription model instance to a plain dict."""
    return {
        "id": str(sub.id),
        "partner_id": str(sub.partner_id),
        "program_id": str(sub.program_id),
        "billing_period": sub.billing_period,
        "amount_per_child": float(sub.amount_per_child) if sub.amount_per_child is not None else None,
        "total_children": sub.total_children,
        "total_amount": float(sub.total_amount) if sub.total_amount is not None else None,
        "currency": sub.currency,
        "status": sub.status.value if hasattr(sub.status, "value") else str(sub.status),
        "current_period_start": sub.current_period_start.isoformat() if sub.current_period_start else None,
        "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
        "next_billing_date": sub.next_billing_date.isoformat() if sub.next_billing_date else None,
        "auto_renew": sub.auto_renew,
        "cancelled_at": sub.cancelled_at.isoformat() if sub.cancelled_at else None,
        "cancellation_reason": sub.cancellation_reason,
        "created_at": sub.created_at.isoformat() if sub.created_at else None,
        "updated_at": sub.updated_at.isoformat() if sub.updated_at else None,
    }


def _payment_to_dict(payment: PartnerPayment) -> Dict[str, Any]:
    """Convert a PartnerPayment model instance to a plain dict."""
    return {
        "id": str(payment.id),
        "subscription_id": str(payment.subscription_id),
        "partner_id": str(payment.partner_id),
        "amount": float(payment.amount) if payment.amount is not None else None,
        "currency": payment.currency,
        "status": payment.status.value if hasattr(payment.status, "value") else str(payment.status),
        "payment_gateway": (
            payment.payment_gateway.value
            if payment.payment_gateway and hasattr(payment.payment_gateway, "value")
            else str(payment.payment_gateway) if payment.payment_gateway else None
        ),
        "transaction_reference": payment.transaction_reference,
        "receipt_url": payment.receipt_url,
        "invoice_number": payment.invoice_number,
        "period_start": payment.period_start.isoformat() if payment.period_start else None,
        "period_end": payment.period_end.isoformat() if payment.period_end else None,
        "paid_at": payment.paid_at.isoformat() if payment.paid_at else None,
        "created_at": payment.created_at.isoformat() if payment.created_at else None,
    }


# ------------------------------------------------------------------
# 1. Create subscription
# ------------------------------------------------------------------

async def create_subscription(
    db: AsyncSession,
    partner_id: str,
    plan_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Create a new subscription for a partner.

    Validates that the referenced program exists and belongs to the
    partner, calculates the total amount, sets the initial billing
    period dates, and persists the record.

    Args:
        db: Async database session.
        partner_id: UUID string of the partner user.
        plan_data: Dict containing program_id, billing_period,
                   amount_per_child, total_children, currency (optional),
                   auto_renew (optional).

    Returns:
        Dictionary representation of the created subscription.

    Raises:
        ValueError: If the program does not exist or is not owned by the partner.
    """
    try:
        pid = uuid.UUID(partner_id)
        program_id_str = plan_data.get("program_id")
        if not program_id_str:
            raise ValueError("program_id is required")
        program_uuid = uuid.UUID(program_id_str)

        # Validate program ownership
        prog_q = select(SponsorshipProgram).where(
            and_(
                SponsorshipProgram.id == program_uuid,
                SponsorshipProgram.partner_id == pid,
            )
        )
        prog_result = await db.execute(prog_q)
        program = prog_result.scalar_one_or_none()
        if not program:
            raise ValueError(
                f"Program {program_id_str} not found or not owned by partner {partner_id}"
            )

        # Extract fields
        billing_period = plan_data.get("billing_period", "monthly")
        amount_per_child = Decimal(str(plan_data.get("amount_per_child", 0)))
        total_children = int(plan_data.get("total_children", 0))
        total_amount = amount_per_child * total_children
        currency = plan_data.get("currency", "KES")
        auto_renew = plan_data.get("auto_renew", True)

        # Calculate billing period dates
        today = date.today()
        period_end = _period_end_for(today, billing_period)
        next_billing = period_end

        subscription = PartnerSubscription(
            partner_id=pid,
            program_id=program_uuid,
            billing_period=billing_period,
            amount_per_child=amount_per_child,
            total_children=total_children,
            total_amount=total_amount,
            currency=currency,
            status=PartnerSubscriptionStatus.ACTIVE,
            current_period_start=today,
            current_period_end=period_end,
            next_billing_date=next_billing,
            auto_renew=auto_renew,
        )

        db.add(subscription)
        await db.flush()

        logger.info(
            f"Created subscription {subscription.id} for partner {partner_id} "
            f"on program {program_id_str} ({billing_period}, "
            f"{total_children} children, total={total_amount} {currency})"
        )

        return _subscription_to_dict(subscription)

    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Error creating subscription for partner {partner_id}: {e}")
        raise


# ------------------------------------------------------------------
# 2. Get subscriptions (paginated)
# ------------------------------------------------------------------

async def get_subscriptions(
    db: AsyncSession,
    partner_id: str,
    page: int = 1,
    limit: int = 20,
) -> Dict[str, Any]:
    """Return a paginated list of subscriptions for a partner.

    Args:
        db: Async database session.
        partner_id: UUID string of the partner user.
        page: 1-based page number.
        limit: Number of items per page.

    Returns:
        Dictionary with subscriptions list, total count, page, and limit.
    """
    try:
        pid = uuid.UUID(partner_id)
        base_filter = PartnerSubscription.partner_id == pid

        # Total count
        total_q = select(func.count(PartnerSubscription.id)).where(base_filter)
        total_result = await db.execute(total_q)
        total: int = total_result.scalar() or 0

        # Paginated items
        offset = (page - 1) * limit
        items_q = (
            select(PartnerSubscription)
            .where(base_filter)
            .order_by(PartnerSubscription.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        items_result = await db.execute(items_q)
        subscriptions = items_result.scalars().all()

        # Enrich each subscription with the program name
        items: List[Dict[str, Any]] = []
        for sub in subscriptions:
            d = _subscription_to_dict(sub)
            prog_q = select(SponsorshipProgram.name).where(
                SponsorshipProgram.id == sub.program_id
            )
            prog_result = await db.execute(prog_q)
            d["program_name"] = prog_result.scalar()
            items.append(d)

        return {
            "subscriptions": items,
            "total": total,
            "page": page,
            "limit": limit,
        }

    except Exception as e:
        logger.error(f"Error fetching subscriptions for partner {partner_id}: {e}")
        raise


# ------------------------------------------------------------------
# 3. Update subscription
# ------------------------------------------------------------------

async def update_subscription(
    db: AsyncSession,
    subscription_id: str,
    updates: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """Update an existing subscription.

    Allowed fields: auto_renew, status, total_children.
    If total_children is changed the total_amount is recalculated.

    Args:
        db: Async database session.
        subscription_id: UUID string of the subscription.
        updates: Dictionary of fields to update.

    Returns:
        Updated subscription dict, or None if not found.
    """
    try:
        sub_uuid = uuid.UUID(subscription_id)

        query = select(PartnerSubscription).where(PartnerSubscription.id == sub_uuid)
        result = await db.execute(query)
        subscription = result.scalar_one_or_none()

        if not subscription:
            logger.warning(f"Subscription {subscription_id} not found for update")
            return None

        # Apply allowed updates
        if "auto_renew" in updates:
            subscription.auto_renew = bool(updates["auto_renew"])

        if "status" in updates:
            raw_status = updates["status"]
            if isinstance(raw_status, PartnerSubscriptionStatus):
                subscription.status = raw_status
            else:
                subscription.status = PartnerSubscriptionStatus(raw_status)

        if "total_children" in updates:
            new_count = int(updates["total_children"])
            subscription.total_children = new_count
            subscription.total_amount = subscription.amount_per_child * new_count

        subscription.updated_at = datetime.utcnow()
        await db.flush()

        logger.info(f"Updated subscription {subscription_id}: {list(updates.keys())}")

        return _subscription_to_dict(subscription)

    except Exception as e:
        logger.error(f"Error updating subscription {subscription_id}: {e}")
        raise


# ------------------------------------------------------------------
# 4. Cancel subscription
# ------------------------------------------------------------------

async def cancel_subscription(
    db: AsyncSession,
    subscription_id: str,
    reason: str = None,
) -> bool:
    """Cancel a subscription.

    Sets the status to CANCELLED, records the cancellation timestamp
    and optional reason.

    Args:
        db: Async database session.
        subscription_id: UUID string of the subscription.
        reason: Optional cancellation reason text.

    Returns:
        True if the subscription was cancelled, False if not found.
    """
    try:
        sub_uuid = uuid.UUID(subscription_id)

        query = select(PartnerSubscription).where(PartnerSubscription.id == sub_uuid)
        result = await db.execute(query)
        subscription = result.scalar_one_or_none()

        if not subscription:
            logger.warning(f"Subscription {subscription_id} not found for cancellation")
            return False

        subscription.status = PartnerSubscriptionStatus.CANCELLED
        subscription.cancelled_at = datetime.utcnow()
        subscription.cancellation_reason = reason
        subscription.auto_renew = False
        subscription.updated_at = datetime.utcnow()
        await db.flush()

        logger.info(
            f"Cancelled subscription {subscription_id}"
            f"{' reason: ' + reason if reason else ''}"
        )

        return True

    except Exception as e:
        logger.error(f"Error cancelling subscription {subscription_id}: {e}")
        raise


# ------------------------------------------------------------------
# 5. Process payment
# ------------------------------------------------------------------

async def process_payment(
    db: AsyncSession,
    partner_id: str,
    payment_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Process (record) a payment for a partner subscription.

    Creates a PartnerPayment record with a generated invoice number,
    marks it as COMPLETED with the current timestamp.  The actual
    gateway call is mocked for now.

    Args:
        db: Async database session.
        partner_id: UUID string of the partner user.
        payment_data: Dict containing subscription_id, amount, currency
                      (optional), payment_gateway (optional),
                      transaction_reference (optional), period_start,
                      period_end (optional).

    Returns:
        Dictionary representation of the created payment.

    Raises:
        ValueError: If required fields are missing.
    """
    try:
        pid = uuid.UUID(partner_id)
        subscription_id_str = payment_data.get("subscription_id")
        if not subscription_id_str:
            raise ValueError("subscription_id is required")
        sub_uuid = uuid.UUID(subscription_id_str)

        amount = Decimal(str(payment_data.get("amount", 0)))
        currency = payment_data.get("currency", "KES")

        # Resolve payment gateway enum (default to MPESA)
        gateway_raw = payment_data.get("payment_gateway", "mpesa")
        if isinstance(gateway_raw, PartnerPaymentGateway):
            gateway = gateway_raw
        else:
            try:
                gateway = PartnerPaymentGateway(gateway_raw)
            except ValueError:
                gateway = PartnerPaymentGateway.MPESA

        transaction_ref = payment_data.get("transaction_reference")

        # Generate sequential invoice number: INV-{year}-{seq}
        year = datetime.utcnow().year
        count_q = select(func.count(PartnerPayment.id)).where(
            PartnerPayment.partner_id == pid
        )
        count_result = await db.execute(count_q)
        seq = (count_result.scalar() or 0) + 1
        invoice_number = f"INV-{year}-{seq:05d}"

        # Parse optional period dates
        period_start = payment_data.get("period_start")
        period_end = payment_data.get("period_end")
        if period_start and isinstance(period_start, str):
            period_start = date.fromisoformat(period_start)
        if period_end and isinstance(period_end, str):
            period_end = date.fromisoformat(period_end)

        now = datetime.utcnow()

        payment = PartnerPayment(
            subscription_id=sub_uuid,
            partner_id=pid,
            amount=amount,
            currency=currency,
            status=PartnerPaymentStatus.COMPLETED,
            payment_gateway=gateway,
            transaction_reference=transaction_ref,
            invoice_number=invoice_number,
            period_start=period_start,
            period_end=period_end,
            paid_at=now,
        )

        db.add(payment)
        await db.flush()

        logger.info(
            f"Processed payment {payment.id} ({invoice_number}) "
            f"of {amount} {currency} for partner {partner_id}"
        )

        return _payment_to_dict(payment)

    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Error processing payment for partner {partner_id}: {e}")
        raise


# ------------------------------------------------------------------
# 6. Get billing history
# ------------------------------------------------------------------

async def get_billing_history(
    db: AsyncSession,
    partner_id: str,
    limit: int = 50,
) -> List[Dict[str, Any]]:
    """Return payment history for a partner, newest first.

    Args:
        db: Async database session.
        partner_id: UUID string of the partner user.
        limit: Maximum number of records to return.

    Returns:
        List of payment dictionaries.
    """
    try:
        pid = uuid.UUID(partner_id)

        query = (
            select(PartnerPayment)
            .where(PartnerPayment.partner_id == pid)
            .order_by(PartnerPayment.created_at.desc())
            .limit(limit)
        )
        result = await db.execute(query)
        payments = result.scalars().all()

        return [_payment_to_dict(p) for p in payments]

    except Exception as e:
        logger.error(f"Error fetching billing history for partner {partner_id}: {e}")
        raise


# ------------------------------------------------------------------
# 7. Get budget overview
# ------------------------------------------------------------------

async def get_budget_overview(
    db: AsyncSession,
    partner_id: str,
) -> Dict[str, Any]:
    """Return a high-level budget overview for a partner.

    Calculates:
    - total_budget: sum of total_amount across all active subscriptions.
    - spent: sum of completed payment amounts.
    - remaining: total_budget - spent (floored at 0).
    - allocation_breakdown: per-program totals with program names.

    Args:
        db: Async database session.
        partner_id: UUID string of the partner user.

    Returns:
        Budget overview dictionary.
    """
    try:
        pid = uuid.UUID(partner_id)

        # --- Total budget from active subscriptions ---
        budget_q = select(
            func.coalesce(func.sum(PartnerSubscription.total_amount), 0)
        ).where(
            and_(
                PartnerSubscription.partner_id == pid,
                PartnerSubscription.status == PartnerSubscriptionStatus.ACTIVE,
            )
        )
        budget_result = await db.execute(budget_q)
        total_budget = float(budget_result.scalar() or 0)

        # --- Total spent (completed payments) ---
        spent_q = select(
            func.coalesce(func.sum(PartnerPayment.amount), 0)
        ).where(
            and_(
                PartnerPayment.partner_id == pid,
                PartnerPayment.status == PartnerPaymentStatus.COMPLETED,
            )
        )
        spent_result = await db.execute(spent_q)
        spent = float(spent_result.scalar() or 0)

        remaining = max(total_budget - spent, 0.0)

        # --- Allocation breakdown by program ---
        alloc_q = (
            select(
                PartnerSubscription.program_id,
                func.sum(PartnerSubscription.total_amount).label("allocated"),
                func.sum(PartnerSubscription.total_children).label("children"),
            )
            .where(
                and_(
                    PartnerSubscription.partner_id == pid,
                    PartnerSubscription.status == PartnerSubscriptionStatus.ACTIVE,
                )
            )
            .group_by(PartnerSubscription.program_id)
        )
        alloc_result = await db.execute(alloc_q)
        alloc_rows = alloc_result.all()

        allocation_breakdown: List[Dict[str, Any]] = []
        for row in alloc_rows:
            # Look up program name
            prog_q = select(SponsorshipProgram.name).where(
                SponsorshipProgram.id == row.program_id
            )
            prog_result = await db.execute(prog_q)
            program_name = prog_result.scalar() or "Unknown Program"

            # Sum of completed payments for this program's subscriptions
            prog_spent_q = select(
                func.coalesce(func.sum(PartnerPayment.amount), 0)
            ).where(
                and_(
                    PartnerPayment.partner_id == pid,
                    PartnerPayment.status == PartnerPaymentStatus.COMPLETED,
                    PartnerPayment.subscription_id.in_(
                        select(PartnerSubscription.id).where(
                            and_(
                                PartnerSubscription.partner_id == pid,
                                PartnerSubscription.program_id == row.program_id,
                            )
                        )
                    ),
                )
            )
            prog_spent_result = await db.execute(prog_spent_q)
            program_spent = float(prog_spent_result.scalar() or 0)

            allocation_breakdown.append({
                "program_id": str(row.program_id),
                "program_name": program_name,
                "allocated": float(row.allocated or 0),
                "spent": program_spent,
                "remaining": max(float(row.allocated or 0) - program_spent, 0.0),
                "total_children": int(row.children or 0),
            })

        # --- Active subscription count ---
        active_count_q = select(func.count(PartnerSubscription.id)).where(
            and_(
                PartnerSubscription.partner_id == pid,
                PartnerSubscription.status == PartnerSubscriptionStatus.ACTIVE,
            )
        )
        active_count_result = await db.execute(active_count_q)
        active_subscriptions = active_count_result.scalar() or 0

        return {
            "partner_id": partner_id,
            "total_budget": total_budget,
            "spent": spent,
            "remaining": remaining,
            "active_subscriptions": active_subscriptions,
            "allocation_breakdown": allocation_breakdown,
        }

    except Exception as e:
        logger.error(f"Error fetching budget overview for partner {partner_id}: {e}")
        raise
