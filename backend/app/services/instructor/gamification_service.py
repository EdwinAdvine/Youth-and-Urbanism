"""
Instructor Gamification Service

Badge awarding, points/level calculation, streak tracking, and leaderboards (Redis).
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.instructor.instructor_gamification import (
    InstructorBadge,
    InstructorBadgeAward,
    InstructorPoints,
    InstructorPointsLog,
    PeerKudo
)

logger = logging.getLogger(__name__)


async def get_or_create_points_record(
    db: AsyncSession,
    instructor_id: str
) -> InstructorPoints:
    """
    Get or create points record for instructor.
    """
    try:
        query = select(InstructorPoints).where(
            InstructorPoints.instructor_id == instructor_id
        )
        result = await db.execute(query)
        points_record = result.scalar_one_or_none()

        if points_record:
            return points_record

        # Create new record
        points_record = InstructorPoints(
            instructor_id=instructor_id,
            points=0,
            level=1,
            streak_days=0,
            longest_streak=0,
            last_activity_at=None
        )
        db.add(points_record)
        await db.commit()
        await db.refresh(points_record)

        return points_record

    except Exception as e:
        logger.error(f"Error getting/creating points record: {str(e)}")
        await db.rollback()
        raise


async def add_points(
    db: AsyncSession,
    instructor_id: str,
    points_delta: int,
    reason: str,
    source: str
) -> InstructorPoints:
    """
    Add points to instructor and check for level up.
    """
    try:
        points_record = await get_or_create_points_record(db, instructor_id)

        # Add points
        points_record.points += points_delta
        points_record.last_activity_at = datetime.utcnow()

        # Calculate level (simple formula: level = floor(points / 100) + 1)
        new_level = (points_record.points // 100) + 1
        if new_level > points_record.level:
            points_record.level = new_level
            logger.info(f"Instructor {instructor_id} leveled up to {new_level}")

        # Update streak
        now = datetime.utcnow()
        if points_record.last_activity_at:
            days_diff = (now - points_record.last_activity_at).days
            if days_diff == 1:
                # Consecutive day
                points_record.streak_days += 1
                if points_record.streak_days > points_record.longest_streak:
                    points_record.longest_streak = points_record.streak_days
            elif days_diff > 1:
                # Streak broken
                points_record.streak_days = 1
        else:
            points_record.streak_days = 1

        # Log the points change
        log_entry = InstructorPointsLog(
            instructor_id=instructor_id,
            points_delta=points_delta,
            reason=reason,
            source=source
        )
        db.add(log_entry)

        await db.commit()
        await db.refresh(points_record)

        # TODO: Update Redis leaderboard
        # await update_leaderboard(instructor_id, points_record.points)

        logger.info(f"Added {points_delta} points to instructor {instructor_id}: {reason}")
        return points_record

    except Exception as e:
        logger.error(f"Error adding points: {str(e)}")
        await db.rollback()
        raise


async def check_and_award_badges(
    db: AsyncSession,
    instructor_id: str,
    event_type: str,
    event_data: Dict[str, Any]
) -> List[InstructorBadgeAward]:
    """
    Check if instructor qualifies for any badges and award them.
    """
    try:
        # Get all active badges
        badges_query = select(InstructorBadge).where(
            InstructorBadge.is_active == True
        )
        badges_result = await db.execute(badges_query)
        badges = badges_result.scalars().all()

        # Get already awarded badges for this instructor
        awarded_query = select(InstructorBadgeAward.badge_id).where(
            InstructorBadgeAward.instructor_id == instructor_id
        )
        awarded_result = await db.execute(awarded_query)
        awarded_badge_ids = {str(badge_id) for badge_id in awarded_result.scalars().all()}

        new_awards = []

        for badge in badges:
            # Skip if already awarded
            if str(badge.id) in awarded_badge_ids:
                continue

            # Check criteria (simplified - would be more complex in production)
            criteria = badge.criteria
            if event_type in criteria:
                # TODO: Implement complex criteria evaluation
                # For now, simple example
                should_award = False

                if event_type == "course_published" and criteria.get("min_courses", 0) == 1:
                    should_award = True
                elif event_type == "enrollment" and event_data.get("total_students", 0) >= criteria.get("min_students", 0):
                    should_award = True

                if should_award:
                    # Award badge
                    award = InstructorBadgeAward(
                        instructor_id=instructor_id,
                        badge_id=badge.id,
                        awarded_at=datetime.utcnow()
                    )
                    db.add(award)
                    new_awards.append(award)

                    # Award points
                    await add_points(
                        db,
                        instructor_id,
                        badge.points_value,
                        f"Badge earned: {badge.name}",
                        "badge_award"
                    )

                    logger.info(f"Awarded badge '{badge.name}' to instructor {instructor_id}")

        if new_awards:
            await db.commit()

        return new_awards

    except Exception as e:
        logger.error(f"Error checking/awarding badges: {str(e)}")
        await db.rollback()
        return []


async def create_peer_kudo(
    db: AsyncSession,
    from_instructor_id: str,
    to_instructor_id: str,
    message: str,
    category: Optional[str] = None,
    is_public: bool = True
) -> PeerKudo:
    """
    Create peer recognition kudo.
    """
    try:
        # TODO: Get instructor names from profiles

        kudo = PeerKudo(
            from_instructor_id=from_instructor_id,
            to_instructor_id=to_instructor_id,
            from_instructor_name="Instructor",  # TODO: Get from profile
            to_instructor_name="Instructor",  # TODO: Get from profile
            message=message,
            category=category,
            is_public=is_public
        )
        db.add(kudo)

        # Award points to recipient
        await add_points(
            db,
            to_instructor_id,
            15,  # Points for receiving kudo
            "Peer recognition received",
            "peer_kudo"
        )

        await db.commit()
        await db.refresh(kudo)

        logger.info(f"Kudo created from {from_instructor_id} to {to_instructor_id}")
        return kudo

    except Exception as e:
        logger.error(f"Error creating peer kudo: {str(e)}")
        await db.rollback()
        raise


async def get_leaderboard(
    period: str = "all_time",
    limit: int = 100
) -> List[Dict[str, Any]]:
    """
    Get leaderboard from Redis sorted set.
    """
    try:
        # TODO: Implement Redis leaderboard
        # Redis key: instructor:leaderboard:points
        # ZADD for updates, ZREVRANGE for retrieval

        # For now, return empty
        return []

    except Exception as e:
        logger.error(f"Error getting leaderboard: {str(e)}")
        return []
