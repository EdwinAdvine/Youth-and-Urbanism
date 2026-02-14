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
    """
    try:
        # TODO: Validate available balance
        # TODO: Integrate with payment gateways

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

        logger.info(f"Payout requested: {payout.id}")
        return payout

    except Exception as e:
        logger.error(f"Error requesting payout: {str(e)}")
        await db.rollback()
        raise


async def get_earnings_breakdown(
    db: AsyncSession,
    instructor_id: str,
    start_date: datetime = None,
    end_date: datetime = None
) -> Dict[str, Any]:
    """
    Get detailed earnings breakdown by type, course, and session.
    """
    try:
        # TODO: Implement detailed breakdown queries
        return {
            "total_gross": Decimal("0.00"),
            "total_net": Decimal("0.00"),
            "by_type": {
                "course_sales": Decimal("0.00"),
                "session_fees": Decimal("0.00"),
                "bonuses": Decimal("0.00"),
                "referrals": Decimal("0.00")
            },
            "by_course": [],
            "by_session": []
        }

    except Exception as e:
        logger.error(f"Error getting earnings breakdown: {str(e)}")
        raise
