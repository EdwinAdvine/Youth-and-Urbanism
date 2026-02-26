"""
Instructor Earnings Service

Revenue split calculation, multi-gateway payouts, earnings aggregation.
"""

import logging
from typing import Dict, Any, List
from datetime import datetime
from decimal import Decimal

from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.instructor.instructor_earnings import (
    InstructorEarning,
    InstructorPayout,
    InstructorRevenueSplit
)

logger = logging.getLogger(__name__)


async def calculate_earning(
    db: AsyncSession,
    instructor_id: str,
    gross_amount: Decimal,
    earning_type: str,
    course_id: str = None,
    session_id: str = None
) -> InstructorEarning:
    """
    Calculate and create earning record with configurable revenue split.
    """
    try:
        # Get revenue split for this instructor/course
        split_query = select(InstructorRevenueSplit).where(
            and_(
                InstructorRevenueSplit.instructor_id == instructor_id,
                InstructorRevenueSplit.course_id == course_id if course_id else True
            )
        ).order_by(InstructorRevenueSplit.created_at.desc()).limit(1)

        split_result = await db.execute(split_query)
        split = split_result.scalar_one_or_none()

        # Default splits if not configured
        if split:
            instructor_pct = split.instructor_pct
            platform_pct = split.platform_pct
            partner_pct = split.partner_pct
        else:
            instructor_pct = Decimal("60.00")
            platform_pct = Decimal("30.00")
            partner_pct = Decimal("10.00")

        # Calculate net amount
        net_amount = gross_amount * (instructor_pct / 100)

        earning = InstructorEarning(
            instructor_id=instructor_id,
            course_id=course_id,
            session_id=session_id,
            earning_type=earning_type,
            gross_amount=gross_amount,
            platform_fee_pct=platform_pct,
            partner_fee_pct=partner_pct,
            net_amount=net_amount,
            currency="KES",
            status="pending"
        )
        db.add(earning)
        await db.commit()
        await db.refresh(earning)

        logger.info(f"Created earning record: {earning.id}")
        return earning

    except Exception as e:
        logger.error(f"Error calculating earning: {str(e)}")
        await db.rollback()
        raise


async def request_payout(
    db: AsyncSession,
    instructor_id: str,
    amount: Decimal,
    payout_method: str,
    payout_details: Dict[str, Any]
) -> InstructorPayout:
    """
    Request payout (M-Pesa B2C, bank transfer, PayPal).
    Validates balance and initiates gateway transfer.
    """
    try:
        # Validate available balance
        available = await get_available_balance(db, instructor_id)
        if amount > available:
            raise ValueError(
                f"Insufficient balance. Available: {available}, Requested: {amount}"
            )

        # Create payout record
        payout = InstructorPayout(
            instructor_id=instructor_id,
            amount=amount,
            currency="KES",
            payout_method=payout_method,
            payout_details=payout_details,
            status="requested"
        )
        db.add(payout)
        await db.commit()
        await db.refresh(payout)

        # Initiate payment gateway transfer
        gateway_result = await _process_payout_gateway(payout_method, amount, payout_details)

        # Update payout with gateway response
        payout.status = "processing" if gateway_result.get("success") else "failed"
        payout.payout_details = {
            **payout_details,
            "gateway_response": gateway_result,
        }
        await db.commit()
        await db.refresh(payout)

        logger.info(f"Payout {payout.id}: method={payout_method} status={payout.status}")
        return payout

    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Error requesting payout: {str(e)}")
        await db.rollback()
        raise


async def get_available_balance(
    db: AsyncSession,
    instructor_id: str,
) -> Decimal:
    """Calculate available balance: confirmed earnings minus pending/processing payouts."""
    # Total confirmed earnings
    earnings_q = select(func.coalesce(func.sum(InstructorEarning.net_amount), 0)).where(
        and_(
            InstructorEarning.instructor_id == instructor_id,
            InstructorEarning.status.in_(["confirmed", "paid"]),
        )
    )
    total_earnings = Decimal(str((await db.execute(earnings_q)).scalar() or 0))

    # Total paid/pending/processing payouts
    payouts_q = select(func.coalesce(func.sum(InstructorPayout.amount), 0)).where(
        and_(
            InstructorPayout.instructor_id == instructor_id,
            InstructorPayout.status.in_(["requested", "processing", "completed"]),
        )
    )
    total_payouts = Decimal(str((await db.execute(payouts_q)).scalar() or 0))

    return total_earnings - total_payouts


async def get_earnings_breakdown(
    db: AsyncSession,
    instructor_id: str,
    start_date: datetime = None,
    end_date: datetime = None
) -> Dict[str, Any]:
    """Get detailed earnings breakdown by type, course, and session."""
    try:
        filters = [InstructorEarning.instructor_id == instructor_id]
        if start_date:
            filters.append(InstructorEarning.created_at >= start_date)
        if end_date:
            filters.append(InstructorEarning.created_at <= end_date)

        # Totals
        totals_q = select(
            func.coalesce(func.sum(InstructorEarning.gross_amount), 0).label("total_gross"),
            func.coalesce(func.sum(InstructorEarning.net_amount), 0).label("total_net"),
        ).where(and_(*filters))
        totals = (await db.execute(totals_q)).one()

        # By type
        by_type_q = select(
            InstructorEarning.earning_type,
            func.sum(InstructorEarning.net_amount).label("amount"),
        ).where(and_(*filters)).group_by(InstructorEarning.earning_type)
        by_type_result = await db.execute(by_type_q)
        by_type = {
            "course_sales": Decimal("0.00"),
            "session_fees": Decimal("0.00"),
            "bonuses": Decimal("0.00"),
            "referrals": Decimal("0.00"),
        }
        for row in by_type_result.all():
            if row.earning_type in by_type:
                by_type[row.earning_type] = Decimal(str(row.amount or 0))

        # By course (top 10)
        by_course_q = select(
            InstructorEarning.course_id,
            func.sum(InstructorEarning.net_amount).label("amount"),
            func.count().label("count"),
        ).where(
            and_(*filters, InstructorEarning.course_id.isnot(None))
        ).group_by(InstructorEarning.course_id).order_by(
            func.sum(InstructorEarning.net_amount).desc()
        ).limit(10)
        by_course_result = await db.execute(by_course_q)
        by_course = [
            {
                "course_id": str(row.course_id),
                "amount": float(row.amount or 0),
                "count": row.count,
            }
            for row in by_course_result.all()
        ]

        return {
            "total_gross": float(totals.total_gross),
            "total_net": float(totals.total_net),
            "by_type": {k: float(v) for k, v in by_type.items()},
            "by_course": by_course,
            "by_session": [],
        }

    except Exception as e:
        logger.error(f"Error getting earnings breakdown: {str(e)}")
        raise


async def list_earnings(
    db: AsyncSession,
    instructor_id: str,
    earning_type: str = None,
    status: str = None,
    page: int = 1,
    limit: int = 20,
) -> Dict[str, Any]:
    """List earnings with pagination and filtering."""
    try:
        from sqlalchemy import desc

        filters = [InstructorEarning.instructor_id == instructor_id]
        if earning_type:
            filters.append(InstructorEarning.earning_type == earning_type)
        if status:
            filters.append(InstructorEarning.status == status)

        count_q = select(func.count()).select_from(InstructorEarning).where(and_(*filters))
        total = (await db.execute(count_q)).scalar() or 0

        query = (
            select(InstructorEarning)
            .where(and_(*filters))
            .order_by(desc(InstructorEarning.created_at))
            .offset((page - 1) * limit)
            .limit(limit)
        )
        rows = (await db.execute(query)).scalars().all()

        return {
            "earnings": [_earning_to_dict(e) for e in rows],
            "total": total,
            "page": page,
            "limit": limit,
        }

    except Exception as e:
        logger.error(f"Error listing earnings: {str(e)}")
        raise


async def list_payouts(
    db: AsyncSession,
    instructor_id: str,
    status: str = None,
    payout_method: str = None,
    page: int = 1,
    limit: int = 20,
) -> Dict[str, Any]:
    """List payouts with pagination and filtering."""
    try:
        from sqlalchemy import desc

        filters = [InstructorPayout.instructor_id == instructor_id]
        if status:
            filters.append(InstructorPayout.status == status)
        if payout_method:
            filters.append(InstructorPayout.payout_method == payout_method)

        count_q = select(func.count()).select_from(InstructorPayout).where(and_(*filters))
        total = (await db.execute(count_q)).scalar() or 0

        query = (
            select(InstructorPayout)
            .where(and_(*filters))
            .order_by(desc(InstructorPayout.created_at))
            .offset((page - 1) * limit)
            .limit(limit)
        )
        rows = (await db.execute(query)).scalars().all()

        return {
            "payouts": [_payout_to_dict(p) for p in rows],
            "total": total,
            "page": page,
            "limit": limit,
        }

    except Exception as e:
        logger.error(f"Error listing payouts: {str(e)}")
        raise


async def _process_payout_gateway(
    payout_method: str,
    amount: Decimal,
    details: Dict[str, Any],
) -> Dict[str, Any]:
    """Initiate payout through the appropriate payment gateway."""
    try:
        if payout_method == "mpesa_b2c":
            from app.utils.payments.mpesa_b2c import MpesaB2CClient
            client = MpesaB2CClient()
            result = await client.send_b2c(
                phone_number=details.get("phone_number", ""),
                amount=float(amount),
            )
            return {"success": result.get("ResponseCode") == "0", "data": result}

        elif payout_method == "bank_transfer":
            from app.utils.payments.flutterwave import FlutterwaveClient
            client = FlutterwaveClient()
            result = await client.create_transfer(
                account_bank=details.get("bank_code", ""),
                account_number=details.get("account_number", ""),
                amount=float(amount),
                beneficiary_name=details.get("account_name", ""),
            )
            return {"success": result.get("status") == "success", "data": result}

        elif payout_method == "paypal":
            from app.utils.payments.paypal import PayPalClient
            client = PayPalClient()
            result = await client.create_payout(
                email=details.get("email", ""),
                amount=float(amount),
                currency=details.get("currency", "USD"),
            )
            return {"success": "batch_header" in result, "data": result}

        else:
            return {"success": False, "error": f"Unknown payout method: {payout_method}"}

    except Exception as e:
        logger.error(f"Payment gateway error ({payout_method}): {str(e)}")
        return {"success": False, "error": str(e)}


def _earning_to_dict(earning: InstructorEarning) -> dict:
    return {
        "id": str(earning.id),
        "instructor_id": str(earning.instructor_id),
        "course_id": str(earning.course_id) if earning.course_id else None,
        "session_id": str(earning.session_id) if earning.session_id else None,
        "earning_type": earning.earning_type,
        "gross_amount": float(earning.gross_amount),
        "platform_fee_pct": float(earning.platform_fee_pct),
        "partner_fee_pct": float(earning.partner_fee_pct),
        "net_amount": float(earning.net_amount),
        "currency": earning.currency,
        "status": earning.status,
        "created_at": earning.created_at.isoformat() if earning.created_at else None,
    }


def _payout_to_dict(payout: InstructorPayout) -> dict:
    return {
        "id": str(payout.id),
        "instructor_id": str(payout.instructor_id),
        "amount": float(payout.amount),
        "currency": payout.currency,
        "payout_method": payout.payout_method,
        "payout_details": payout.payout_details,
        "status": payout.status,
        "created_at": payout.created_at.isoformat() if payout.created_at else None,
    }
