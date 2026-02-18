"""
Instructor Gamification Service

Badge awarding, points/level calculation, streak tracking, and leaderboards (Redis).
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from decimal import Decimal
import math

import redis.asyncio as aioredis
from sqlalchemy import select, and_, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User
from app.models.instructor.instructor_gamification import (
    InstructorBadge,
    InstructorBadgeAward,
    InstructorPoints,
    InstructorPointsLog,
    PeerKudo
)

logger = logging.getLogger(__name__)

# Redis key constants
LEADERBOARD_KEY_ALL_TIME = "instructor:leaderboard:all_time"
LEADERBOARD_KEY_WEEKLY = "instructor:leaderboard:weekly"
LEADERBOARD_KEY_MONTHLY = "instructor:leaderboard:monthly"


# ---------------------------------------------------------------------------
# Redis helper
# ---------------------------------------------------------------------------

def _get_redis() -> aioredis.Redis:
    """Get an async Redis connection using application settings."""
    return aioredis.from_url(settings.redis_url, decode_responses=True)


async def update_leaderboard(instructor_id: str, points: int) -> None:
    """
    Update the Redis sorted-set leaderboard with the instructor's current
    total points.  Uses ZADD so the score is always the latest value.
    """
    try:
        r = _get_redis()
        async with r:
            # All-time leaderboard -- always updated
            await r.zadd(LEADERBOARD_KEY_ALL_TIME, {str(instructor_id): points})

            # Weekly and monthly leaderboards -- same score; the keys are
            # rotated/expired externally or via a scheduled task.
            await r.zadd(LEADERBOARD_KEY_WEEKLY, {str(instructor_id): points})
            await r.zadd(LEADERBOARD_KEY_MONTHLY, {str(instructor_id): points})

        logger.debug(
            f"Leaderboard updated for instructor {instructor_id}: {points} pts"
        )
    except Exception as e:
        # Leaderboard update is best-effort; don't let it break the main flow
        logger.warning(f"Failed to update Redis leaderboard: {str(e)}")


# ---------------------------------------------------------------------------
# Helper: resolve instructor display name
# ---------------------------------------------------------------------------

async def _get_instructor_name(db: AsyncSession, instructor_id: str) -> str:
    """Look up an instructor's display name from the User model."""
    try:
        query = select(User).where(User.id == instructor_id)
        result = await db.execute(query)
        user = result.scalar_one_or_none()
        if user and user.profile_data:
            return user.profile_data.get("full_name", user.email)
        if user:
            return user.email
        return "Unknown Instructor"
    except Exception:
        return "Unknown Instructor"


# ---------------------------------------------------------------------------
# Points CRUD
# ---------------------------------------------------------------------------

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

        # Capture previous activity timestamp *before* overwriting
        previous_activity = points_record.last_activity_at

        # Add points
        points_record.points += points_delta
        now = datetime.utcnow()
        points_record.last_activity_at = now

        # Calculate level (simple formula: level = floor(points / 100) + 1)
        new_level = (points_record.points // 100) + 1
        if new_level > points_record.level:
            points_record.level = new_level
            logger.info(f"Instructor {instructor_id} leveled up to {new_level}")

        # Update streak
        if previous_activity:
            days_diff = (now - previous_activity).days
            if days_diff == 1:
                # Consecutive day
                points_record.streak_days += 1
                if points_record.streak_days > points_record.longest_streak:
                    points_record.longest_streak = points_record.streak_days
            elif days_diff > 1:
                # Streak broken
                points_record.streak_days = 1
            # days_diff == 0 means same day -- streak unchanged
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

        # Update Redis leaderboard
        await update_leaderboard(instructor_id, points_record.points)

        logger.info(f"Added {points_delta} points to instructor {instructor_id}: {reason}")
        return points_record

    except Exception as e:
        logger.error(f"Error adding points: {str(e)}")
        await db.rollback()
        raise


# ---------------------------------------------------------------------------
# Badge checking & awarding
# ---------------------------------------------------------------------------

def _evaluate_criteria(
    event_type: str,
    criteria: Dict[str, Any],
    event_data: Dict[str, Any]
) -> bool:
    """
    Evaluate whether *event_data* satisfies the badge *criteria* for the
    given *event_type*.

    Supported event types and their criteria keys / event_data keys:
        course_published  -> min_courses   / total_courses
        enrollment        -> min_students  / total_students
        session_completed -> min_sessions  / total_sessions
        rating_received   -> min_rating    / average_rating
        streak            -> min_streak    / streak_days
        earnings          -> min_earnings  / total_earnings
    """
    if event_type not in criteria:
        return False

    if event_type == "course_published":
        return event_data.get("total_courses", 0) >= criteria.get("min_courses", 0)

    if event_type == "enrollment":
        return event_data.get("total_students", 0) >= criteria.get("min_students", 0)

    if event_type == "session_completed":
        return event_data.get("total_sessions", 0) >= criteria.get("min_sessions", 0)

    if event_type == "rating_received":
        return event_data.get("average_rating", 0) >= criteria.get("min_rating", 0)

    if event_type == "streak":
        return event_data.get("streak_days", 0) >= criteria.get("min_streak", 0)

    if event_type == "earnings":
        return Decimal(str(event_data.get("total_earnings", 0))) >= Decimal(
            str(criteria.get("min_earnings", 0))
        )

    return False


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
            InstructorBadge.is_active == True  # noqa: E712
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

            criteria = badge.criteria
            if _evaluate_criteria(event_type, criteria, event_data):
                # Award badge
                award = InstructorBadgeAward(
                    instructor_id=instructor_id,
                    badge_id=badge.id,
                    awarded_at=datetime.utcnow()
                )
                db.add(award)
                new_awards.append(award)

                # Award points for earning the badge
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


# ---------------------------------------------------------------------------
# Peer Kudos
# ---------------------------------------------------------------------------

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
        kudo = PeerKudo(
            from_instructor_id=from_instructor_id,
            to_instructor_id=to_instructor_id,
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


# ---------------------------------------------------------------------------
# Leaderboard
# ---------------------------------------------------------------------------

async def get_leaderboard(
    db: AsyncSession,
    period: str = "all_time",
    limit: int = 100,
    current_instructor_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get leaderboard from Redis sorted set.

    Returns a dict with:
        entries  -- list of {rank, instructor_id, name, points}
        my_rank  -- rank of the current instructor (None if not provided)
    """
    key_map = {
        "all_time": LEADERBOARD_KEY_ALL_TIME,
        "weekly": LEADERBOARD_KEY_WEEKLY,
        "monthly": LEADERBOARD_KEY_MONTHLY,
    }
    redis_key = key_map.get(period, LEADERBOARD_KEY_ALL_TIME)

    entries: List[Dict[str, Any]] = []
    my_rank: Optional[int] = None

    try:
        r = _get_redis()
        async with r:
            # ZREVRANGE returns highest-score first
            raw = await r.zrevrange(redis_key, 0, limit - 1, withscores=True)

            # Resolve instructor names in bulk
            instructor_ids = [member for member, _ in raw]
            names_map: Dict[str, str] = {}
            if instructor_ids:
                query = select(User.id, User.email, User.profile_data).where(
                    User.id.in_(instructor_ids)
                )
                result = await db.execute(query)
                for row in result.all():
                    uid = str(row.id)
                    profile = row.profile_data or {}
                    names_map[uid] = profile.get("full_name", row.email)

            for rank_idx, (member, score) in enumerate(raw, start=1):
                entries.append({
                    "rank": rank_idx,
                    "instructor_id": member,
                    "name": names_map.get(member, "Unknown Instructor"),
                    "points": int(score),
                })

            # Current instructor's rank
            if current_instructor_id:
                rank_zero_based = await r.zrevrank(
                    redis_key, str(current_instructor_id)
                )
                if rank_zero_based is not None:
                    my_rank = rank_zero_based + 1  # 1-based

    except Exception as e:
        logger.warning(f"Error getting leaderboard from Redis: {str(e)}")
        # Fallback: query database directly
        try:
            query = (
                select(InstructorPoints)
                .order_by(InstructorPoints.points.desc())
                .limit(limit)
            )
            result = await db.execute(query)
            records = result.scalars().all()

            for rank_idx, record in enumerate(records, start=1):
                name = await _get_instructor_name(db, str(record.instructor_id))
                entries.append({
                    "rank": rank_idx,
                    "instructor_id": str(record.instructor_id),
                    "name": name,
                    "points": record.points,
                })
                if current_instructor_id and str(record.instructor_id) == str(current_instructor_id):
                    my_rank = rank_idx
        except Exception as db_err:
            logger.error(f"Fallback leaderboard query failed: {str(db_err)}")

    return {
        "entries": entries,
        "my_rank": my_rank,
    }


# ---------------------------------------------------------------------------
# Query helpers used by the impact router
# ---------------------------------------------------------------------------

async def get_badges(
    db: AsyncSession,
    instructor_id: str
) -> List[Dict[str, Any]]:
    """
    List all badges with their awarded status for the given instructor.
    Returns a list of badge dicts, each containing badge metadata and
    whether the instructor has earned it (plus the award date if so).
    """
    try:
        # All active badges
        badges_query = select(InstructorBadge).where(
            InstructorBadge.is_active == True  # noqa: E712
        )
        badges_result = await db.execute(badges_query)
        badges = badges_result.scalars().all()

        # Awards for this instructor
        awards_query = select(InstructorBadgeAward).where(
            InstructorBadgeAward.instructor_id == instructor_id
        )
        awards_result = await db.execute(awards_query)
        awards = awards_result.scalars().all()
        awarded_map = {str(a.badge_id): a for a in awards}

        result = []
        for badge in badges:
            award = awarded_map.get(str(badge.id))
            result.append({
                "id": str(badge.id),
                "name": badge.name,
                "description": badge.description,
                "icon_url": badge.icon_url,
                "category": badge.category,
                "tier": badge.tier.value if badge.tier else None,
                "points_value": badge.points_value,
                "criteria": badge.criteria,
                "earned": award is not None,
                "awarded_at": award.awarded_at.isoformat() if award else None,
            })

        return result

    except Exception as e:
        logger.error(f"Error getting badges: {str(e)}")
        return []


async def get_points_summary(
    db: AsyncSession,
    instructor_id: str
) -> Dict[str, Any]:
    """
    Return the instructor's points, level, streak info, and progress
    towards the next level.
    """
    try:
        points_record = await get_or_create_points_record(db, instructor_id)

        current_level = points_record.level
        points_for_current_level = (current_level - 1) * 100
        points_for_next_level = current_level * 100
        progress_in_level = points_record.points - points_for_current_level
        points_needed = points_for_next_level - points_for_current_level  # always 100
        next_level_progress = min(
            round((progress_in_level / points_needed) * 100, 1) if points_needed else 100,
            100.0,
        )

        return {
            "total_points": points_record.points,
            "level": current_level,
            "streak_days": points_record.streak_days,
            "longest_streak": points_record.longest_streak,
            "last_activity_at": (
                points_record.last_activity_at.isoformat()
                if points_record.last_activity_at
                else None
            ),
            "next_level_points": points_for_next_level,
            "next_level_progress": next_level_progress,
        }

    except Exception as e:
        logger.error(f"Error getting points summary: {str(e)}")
        return {
            "total_points": 0,
            "level": 1,
            "streak_days": 0,
            "longest_streak": 0,
            "last_activity_at": None,
            "next_level_points": 100,
            "next_level_progress": 0,
        }


async def get_points_history(
    db: AsyncSession,
    instructor_id: str,
    page: int = 1,
    limit: int = 20
) -> Dict[str, Any]:
    """
    Paginated points change log for the instructor.
    """
    try:
        offset = (page - 1) * limit

        # Total count
        count_query = select(func.count()).select_from(InstructorPointsLog).where(
            InstructorPointsLog.instructor_id == instructor_id
        )
        count_result = await db.execute(count_query)
        total = count_result.scalar() or 0

        # Fetch page
        logs_query = (
            select(InstructorPointsLog)
            .where(InstructorPointsLog.instructor_id == instructor_id)
            .order_by(InstructorPointsLog.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        logs_result = await db.execute(logs_query)
        logs = logs_result.scalars().all()

        items = [
            {
                "id": str(log.id),
                "points_delta": log.points_delta,
                "reason": log.reason,
                "source": log.source,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ]

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": math.ceil(total / limit) if limit else 1,
        }

    except Exception as e:
        logger.error(f"Error getting points history: {str(e)}")
        return {
            "items": [],
            "total": 0,
            "page": page,
            "limit": limit,
            "total_pages": 0,
        }


async def get_kudos(
    db: AsyncSession,
    instructor_id: str,
    direction: str = "received",
    page: int = 1,
    limit: int = 20
) -> Dict[str, Any]:
    """
    List kudos received or sent by an instructor, with instructor names
    resolved from the User model.

    Args:
        direction: "received" or "sent"
    """
    try:
        offset = (page - 1) * limit

        if direction == "sent":
            filter_clause = PeerKudo.from_instructor_id == instructor_id
        else:
            filter_clause = PeerKudo.to_instructor_id == instructor_id

        # Total count
        count_query = select(func.count()).select_from(PeerKudo).where(filter_clause)
        count_result = await db.execute(count_query)
        total = count_result.scalar() or 0

        # Fetch page
        kudos_query = (
            select(PeerKudo)
            .where(filter_clause)
            .order_by(PeerKudo.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        kudos_result = await db.execute(kudos_query)
        kudos = kudos_result.scalars().all()

        # Collect unique instructor IDs to resolve names in one query
        ids_to_resolve: set = set()
        for kudo in kudos:
            ids_to_resolve.add(str(kudo.from_instructor_id))
            ids_to_resolve.add(str(kudo.to_instructor_id))

        names_map: Dict[str, str] = {}
        if ids_to_resolve:
            users_query = select(User.id, User.email, User.profile_data).where(
                User.id.in_(list(ids_to_resolve))
            )
            users_result = await db.execute(users_query)
            for row in users_result.all():
                uid = str(row.id)
                profile = row.profile_data or {}
                names_map[uid] = profile.get("full_name", row.email)

        items = [
            {
                "id": str(kudo.id),
                "from_instructor_id": str(kudo.from_instructor_id),
                "from_instructor_name": names_map.get(
                    str(kudo.from_instructor_id), "Unknown Instructor"
                ),
                "to_instructor_id": str(kudo.to_instructor_id),
                "to_instructor_name": names_map.get(
                    str(kudo.to_instructor_id), "Unknown Instructor"
                ),
                "message": kudo.message,
                "category": kudo.category,
                "is_public": kudo.is_public,
                "created_at": kudo.created_at.isoformat(),
            }
            for kudo in kudos
        ]

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": math.ceil(total / limit) if limit else 1,
        }

    except Exception as e:
        logger.error(f"Error getting kudos: {str(e)}")
        return {
            "items": [],
            "total": 0,
            "page": page,
            "limit": limit,
            "total_pages": 0,
        }


async def get_gamification_overview(
    db: AsyncSession,
    instructor_id: str
) -> Dict[str, Any]:
    """
    Complete gamification overview combining badges, points, streaks,
    recent activity, and leaderboard position.
    """
    try:
        # Gather all data concurrently-ish (same event loop, sequential awaits
        # but each is a lightweight DB query)
        points_summary = await get_points_summary(db, instructor_id)
        badges = await get_badges(db, instructor_id)
        recent_history = await get_points_history(db, instructor_id, page=1, limit=5)
        recent_kudos_received = await get_kudos(
            db, instructor_id, direction="received", page=1, limit=5
        )
        leaderboard = await get_leaderboard(
            db, period="all_time", limit=10, current_instructor_id=instructor_id
        )

        earned_badges = [b for b in badges if b["earned"]]
        total_badges = len(badges)
        earned_count = len(earned_badges)

        return {
            "points": points_summary,
            "badges": {
                "earned": earned_count,
                "total": total_badges,
                "recent": earned_badges[:5],  # Most recently earned
                "all": badges,
            },
            "recent_activity": recent_history["items"],
            "recent_kudos": recent_kudos_received["items"],
            "leaderboard": {
                "my_rank": leaderboard["my_rank"],
                "top_entries": leaderboard["entries"],
            },
        }

    except Exception as e:
        logger.error(f"Error getting gamification overview: {str(e)}")
        return {
            "points": {
                "total_points": 0,
                "level": 1,
                "streak_days": 0,
                "longest_streak": 0,
                "last_activity_at": None,
                "next_level_points": 100,
                "next_level_progress": 0,
            },
            "badges": {
                "earned": 0,
                "total": 0,
                "recent": [],
                "all": [],
            },
            "recent_activity": [],
            "recent_kudos": [],
            "leaderboard": {
                "my_rank": None,
                "top_entries": [],
            },
        }
