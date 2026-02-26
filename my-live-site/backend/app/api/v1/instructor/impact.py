"""
Instructor Impact, Recognition & Gamification API Routes

Endpoints for feedback, performance metrics, gamification (badges, points,
leaderboard), and peer kudos.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.utils.security import require_role
from app.schemas.instructor.gamification_schemas import (
    InstructorBadgeResponse,
    InstructorBadgeAwardResponse,
    InstructorPointsResponse,
    PointsLogResponse,
    LeaderboardEntry,
    LeaderboardResponse,
    PeerKudoCreate,
    PeerKudoResponse,
    AchievementProgress,
    GamificationOverviewResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/impact", tags=["Instructor Impact & Recognition"])


# ============================================================================
# Feedback Endpoints
# ============================================================================

@router.get("/feedback")
async def list_feedback(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    List course reviews and ratings for the current instructor's courses.

    Returns paginated course feedback including average rating, total reviews,
    and individual enrollment reviews.
    """
    try:
        from app.models.course import Course
        from app.models.enrollment import Enrollment

        instructor_id = str(current_user.id)
        offset = (page - 1) * limit

        # Get instructor's courses with rating data
        courses_query = (
            select(Course)
            .where(
                and_(
                    Course.instructor_id == current_user.id,
                    Course.is_published == True,
                )
            )
            .order_by(Course.average_rating.desc())
        )
        courses_result = await db.execute(courses_query)
        courses = courses_result.scalars().all()

        course_ids = [c.id for c in courses]

        # Get enrollment reviews for those courses
        reviews_query = (
            select(Enrollment)
            .where(
                and_(
                    Enrollment.course_id.in_(course_ids),
                    Enrollment.rating.isnot(None),
                    Enrollment.is_deleted == False,
                )
            )
            .order_by(Enrollment.reviewed_at.desc())
        )

        if min_rating is not None:
            reviews_query = reviews_query.where(Enrollment.rating >= int(min_rating))

        # Count total reviews
        count_query = select(func.count()).select_from(reviews_query.subquery())
        total_result = await db.execute(count_query)
        total_reviews = total_result.scalar() or 0

        # Paginate
        reviews_query = reviews_query.offset(offset).limit(limit)
        reviews_result = await db.execute(reviews_query)
        reviews = reviews_result.scalars().all()

        # Build course lookup for review context
        course_lookup = {str(c.id): c for c in courses}

        # Calculate aggregated stats
        total_courses = len(courses)
        overall_avg_rating = (
            float(sum(float(c.average_rating) for c in courses) / total_courses)
            if total_courses > 0
            else 0.0
        )
        total_review_count = sum(c.total_reviews for c in courses)

        review_items = []
        for r in reviews:
            course = course_lookup.get(str(r.course_id))
            review_items.append({
                "enrollment_id": str(r.id),
                "course_id": str(r.course_id),
                "course_title": course.title if course else "Unknown",
                "student_id": str(r.student_id),
                "rating": r.rating,
                "review": r.review,
                "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
            })

        return {
            "summary": {
                "total_courses": total_courses,
                "overall_average_rating": round(overall_avg_rating, 2),
                "total_reviews": total_review_count,
            },
            "reviews": review_items,
            "page": page,
            "limit": limit,
            "total": total_reviews,
        }

    except Exception as e:
        logger.error(f"Error listing feedback for instructor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/feedback/sentiment")
async def get_feedback_sentiment(
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    AI-powered sentiment analysis of instructor feedback.

    Uses the AI Orchestrator to analyze review text and provide
    sentiment breakdown (positive, negative, neutral), common themes,
    and actionable suggestions.
    """
    try:
        from app.models.course import Course
        from app.models.enrollment import Enrollment
        from app.services.ai_orchestrator import AIOrchestrator

        # Gather reviews for the instructor's courses
        courses_query = select(Course.id).where(
            Course.instructor_id == current_user.id
        )
        courses_result = await db.execute(courses_query)
        course_ids = [row[0] for row in courses_result.fetchall()]

        if not course_ids:
            return {
                "sentiment_summary": {
                    "positive": 0,
                    "neutral": 0,
                    "negative": 0,
                },
                "common_themes": [],
                "suggestions": [],
                "total_reviews_analyzed": 0,
            }

        reviews_query = (
            select(Enrollment.review, Enrollment.rating)
            .where(
                and_(
                    Enrollment.course_id.in_(course_ids),
                    Enrollment.review.isnot(None),
                    Enrollment.is_deleted == False,
                )
            )
            .order_by(Enrollment.reviewed_at.desc())
            .limit(100)  # Analyze latest 100 reviews
        )
        reviews_result = await db.execute(reviews_query)
        reviews = reviews_result.fetchall()

        if not reviews:
            return {
                "sentiment_summary": {
                    "positive": 0,
                    "neutral": 0,
                    "negative": 0,
                },
                "common_themes": [],
                "suggestions": [],
                "total_reviews_analyzed": 0,
            }

        # Build prompt for sentiment analysis
        review_texts = "\n".join(
            [f"Rating: {r.rating}/5 - {r.review}" for r in reviews if r.review]
        )
        prompt = (
            "Analyze the following course reviews for an instructor. "
            "Provide a JSON response with:\n"
            '1. "sentiment_summary": {"positive": count, "neutral": count, "negative": count}\n'
            '2. "common_themes": list of recurring themes (max 5)\n'
            '3. "suggestions": list of actionable improvement suggestions (max 5)\n\n'
            f"Reviews:\n{review_texts}"
        )

        orchestrator = AIOrchestrator(db)
        await orchestrator.load_providers()
        ai_response = await orchestrator.route_query(
            query=prompt,
            context={"task": "sentiment_analysis"},
            response_mode="text",
        )

        return {
            "ai_analysis": ai_response.get("message", ""),
            "provider_used": ai_response.get("provider_used", "unknown"),
            "total_reviews_analyzed": len(reviews),
        }

    except Exception as e:
        logger.error(f"Error performing sentiment analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/performance")
async def get_performance_metrics(
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Get instructor performance metrics.

    Returns total students, course completion rates, average rating,
    enrollment trends, and session statistics.
    """
    try:
        from app.models.course import Course
        from app.models.enrollment import Enrollment

        instructor_id = current_user.id

        # Get instructor's courses
        courses_query = select(Course).where(
            Course.instructor_id == instructor_id
        )
        courses_result = await db.execute(courses_query)
        courses = courses_result.scalars().all()

        course_ids = [c.id for c in courses]
        total_courses = len(courses)
        published_courses = sum(1 for c in courses if c.is_published)

        if not course_ids:
            return {
                "total_courses": 0,
                "published_courses": 0,
                "total_students": 0,
                "active_students": 0,
                "completion_rate": 0.0,
                "average_rating": 0.0,
                "total_reviews": 0,
                "total_enrollments": 0,
                "completed_enrollments": 0,
                "average_progress": 0.0,
            }

        # Enrollment statistics
        total_enrollments_q = select(func.count()).where(
            and_(
                Enrollment.course_id.in_(course_ids),
                Enrollment.is_deleted == False,
            )
        )
        total_enrollments_result = await db.execute(total_enrollments_q)
        total_enrollments = total_enrollments_result.scalar() or 0

        # Active students (distinct student_ids with active enrollments)
        active_students_q = select(
            func.count(func.distinct(Enrollment.student_id))
        ).where(
            and_(
                Enrollment.course_id.in_(course_ids),
                Enrollment.status == "active",
                Enrollment.is_deleted == False,
            )
        )
        active_students_result = await db.execute(active_students_q)
        active_students = active_students_result.scalar() or 0

        # Total distinct students
        total_students_q = select(
            func.count(func.distinct(Enrollment.student_id))
        ).where(
            and_(
                Enrollment.course_id.in_(course_ids),
                Enrollment.is_deleted == False,
            )
        )
        total_students_result = await db.execute(total_students_q)
        total_students = total_students_result.scalar() or 0

        # Completed enrollments
        completed_q = select(func.count()).where(
            and_(
                Enrollment.course_id.in_(course_ids),
                Enrollment.is_completed == True,
                Enrollment.is_deleted == False,
            )
        )
        completed_result = await db.execute(completed_q)
        completed_enrollments = completed_result.scalar() or 0

        completion_rate = (
            round((completed_enrollments / total_enrollments) * 100, 2)
            if total_enrollments > 0
            else 0.0
        )

        # Average progress across all enrollments
        avg_progress_q = select(
            func.avg(Enrollment.progress_percentage)
        ).where(
            and_(
                Enrollment.course_id.in_(course_ids),
                Enrollment.is_deleted == False,
            )
        )
        avg_progress_result = await db.execute(avg_progress_q)
        average_progress = float(avg_progress_result.scalar() or 0)

        # Rating stats from courses
        total_reviews = sum(c.total_reviews for c in courses)
        avg_rating = (
            float(sum(float(c.average_rating) for c in courses) / total_courses)
            if total_courses > 0
            else 0.0
        )

        return {
            "total_courses": total_courses,
            "published_courses": published_courses,
            "total_students": total_students,
            "active_students": active_students,
            "completion_rate": completion_rate,
            "average_rating": round(avg_rating, 2),
            "total_reviews": total_reviews,
            "total_enrollments": total_enrollments,
            "completed_enrollments": completed_enrollments,
            "average_progress": round(average_progress, 2),
        }

    except Exception as e:
        logger.error(f"Error fetching performance metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Gamification Endpoints
# ============================================================================

@router.get("/gamification/overview", response_model=GamificationOverviewResponse)
async def get_gamification_overview(
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Get complete gamification overview for the current instructor.

    Includes total points, level, streak, badges by tier, recent
    achievements, in-progress achievements, and leaderboard rank.
    """
    try:
        from app.services.instructor.gamification_service import (
            get_or_create_points_record,
            get_leaderboard,
        )
        from app.models.instructor.instructor_gamification import (
            InstructorBadge,
            InstructorBadgeAward,
        )

        instructor_id = str(current_user.id)
        points_record = await get_or_create_points_record(db, instructor_id)

        # Calculate next-level threshold
        next_level_points = points_record.level * 100
        progress_pct = (
            round((points_record.points % 100) / 100 * 100, 1)
            if next_level_points > 0
            else 0.0
        )

        # Get awarded badges
        awards_query = (
            select(InstructorBadgeAward)
            .where(InstructorBadgeAward.instructor_id == instructor_id)
            .order_by(InstructorBadgeAward.awarded_at.desc())
        )
        awards_result = await db.execute(awards_query)
        awards = awards_result.scalars().all()

        total_badges = len(awards)

        # Count badges by tier
        badges_by_tier: dict = {}
        recent_achievements = []
        for award in awards:
            # Load badge details
            badge_query = select(InstructorBadge).where(
                InstructorBadge.id == award.badge_id
            )
            badge_result = await db.execute(badge_query)
            badge = badge_result.scalar_one_or_none()

            if badge:
                tier = badge.tier if isinstance(badge.tier, str) else badge.tier.value
                badges_by_tier[tier] = badges_by_tier.get(tier, 0) + 1

                if len(recent_achievements) < 5:
                    recent_achievements.append({
                        "id": str(award.id),
                        "instructor_id": instructor_id,
                        "badge_id": str(award.badge_id),
                        "badge": {
                            "id": str(badge.id),
                            "name": badge.name,
                            "description": badge.description,
                            "icon_url": badge.icon_url,
                            "category": badge.category,
                            "criteria": badge.criteria or {},
                            "tier": tier,
                            "points_value": badge.points_value,
                            "is_active": badge.is_active,
                            "created_at": badge.created_at,
                        },
                        "awarded_at": award.awarded_at,
                        "extra_data": award.extra_data,
                    })

        # Get in-progress achievements (badges not yet earned)
        awarded_badge_ids = [a.badge_id for a in awards]
        remaining_badges_query = select(InstructorBadge).where(
            and_(
                InstructorBadge.is_active == True,
                InstructorBadge.id.notin_(awarded_badge_ids) if awarded_badge_ids else True,
            )
        )
        remaining_result = await db.execute(remaining_badges_query)
        remaining_badges = remaining_result.scalars().all()

        in_progress = []
        for badge in remaining_badges[:5]:
            tier = badge.tier if isinstance(badge.tier, str) else badge.tier.value
            criteria = badge.criteria or {}
            required = criteria.get("min_courses", criteria.get("min_students", 10))
            in_progress.append({
                "badge_id": str(badge.id),
                "badge_name": badge.name,
                "badge_tier": tier,
                "progress_current": 0,  # Would need event-specific calculation
                "progress_required": required,
                "progress_pct": 0.0,
                "is_completed": False,
            })

        # Leaderboard rank (basic fallback since Redis isn't fully implemented)
        leaderboard_rank = None

        return GamificationOverviewResponse(
            total_points=points_record.points,
            current_level=points_record.level,
            next_level_points=next_level_points,
            progress_to_next_level_pct=progress_pct,
            current_streak=points_record.streak_days,
            longest_streak=points_record.longest_streak,
            total_badges=total_badges,
            badges_by_tier=badges_by_tier,
            recent_achievements=recent_achievements,
            in_progress_achievements=in_progress,
            leaderboard_rank=leaderboard_rank,
        )

    except Exception as e:
        logger.error(f"Error getting gamification overview: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/gamification/badges")
async def list_badges(
    category: Optional[str] = Query(None),
    tier: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    List all badges with the current instructor's earned status.

    Returns all available badges, indicating which ones the instructor
    has already earned and when.
    """
    try:
        from app.models.instructor.instructor_gamification import (
            InstructorBadge,
            InstructorBadgeAward,
        )

        instructor_id = str(current_user.id)
        offset = (page - 1) * limit

        # Get all active badges
        badges_query = select(InstructorBadge).where(
            InstructorBadge.is_active == True
        )

        if category:
            badges_query = badges_query.where(InstructorBadge.category == category)
        if tier:
            badges_query = badges_query.where(InstructorBadge.tier == tier)

        badges_query = badges_query.order_by(InstructorBadge.created_at.asc())

        # Count total
        count_query = select(func.count()).select_from(badges_query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Paginate
        badges_query = badges_query.offset(offset).limit(limit)
        badges_result = await db.execute(badges_query)
        badges = badges_result.scalars().all()

        # Get awarded badges for this instructor
        awards_query = select(InstructorBadgeAward).where(
            InstructorBadgeAward.instructor_id == instructor_id
        )
        awards_result = await db.execute(awards_query)
        awards = awards_result.scalars().all()
        awarded_map = {str(a.badge_id): a for a in awards}

        badge_items = []
        for badge in badges:
            badge_id_str = str(badge.id)
            award = awarded_map.get(badge_id_str)
            tier_val = badge.tier if isinstance(badge.tier, str) else badge.tier.value
            badge_items.append({
                "id": badge_id_str,
                "name": badge.name,
                "description": badge.description,
                "icon_url": badge.icon_url,
                "category": badge.category,
                "criteria": badge.criteria or {},
                "tier": tier_val,
                "points_value": badge.points_value,
                "is_active": badge.is_active,
                "created_at": badge.created_at.isoformat() if badge.created_at else None,
                "earned": award is not None,
                "awarded_at": award.awarded_at.isoformat() if award else None,
            })

        return {
            "badges": badge_items,
            "page": page,
            "limit": limit,
            "total": total,
        }

    except Exception as e:
        logger.error(f"Error listing badges: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/gamification/points", response_model=InstructorPointsResponse)
async def get_points(
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Get current points, level, and streak information for the instructor.
    """
    try:
        from app.services.instructor.gamification_service import (
            get_or_create_points_record,
        )

        instructor_id = str(current_user.id)
        points_record = await get_or_create_points_record(db, instructor_id)
        return points_record

    except Exception as e:
        logger.error(f"Error getting points: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/gamification/points/history")
async def get_points_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Get paginated points history log for the instructor.

    Shows each points change with reason, source, and timestamp.
    """
    try:
        from app.models.instructor.instructor_gamification import InstructorPointsLog

        instructor_id = str(current_user.id)
        offset = (page - 1) * limit

        # Count total entries
        count_query = select(func.count()).where(
            InstructorPointsLog.instructor_id == instructor_id
        )
        count_result = await db.execute(count_query)
        total = count_result.scalar() or 0

        # Fetch paginated log
        log_query = (
            select(InstructorPointsLog)
            .where(InstructorPointsLog.instructor_id == instructor_id)
            .order_by(InstructorPointsLog.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        log_result = await db.execute(log_query)
        log_entries = log_result.scalars().all()

        items = []
        for entry in log_entries:
            items.append({
                "id": str(entry.id),
                "instructor_id": str(entry.instructor_id),
                "points_delta": entry.points_delta,
                "reason": entry.reason,
                "source": entry.source,
                "extra_data": entry.extra_data,
                "created_at": entry.created_at.isoformat() if entry.created_at else None,
            })

        return {
            "history": items,
            "page": page,
            "limit": limit,
            "total": total,
        }

    except Exception as e:
        logger.error(f"Error getting points history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/gamification/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    period: str = Query("all_time", regex="^(daily|weekly|monthly|all_time)$"),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the instructor leaderboard.

    Supports different time periods: daily, weekly, monthly, all_time.
    Returns ranked entries with points, level, and badge count.
    Includes the current instructor's rank.
    """
    try:
        from app.models.instructor.instructor_gamification import (
            InstructorPoints,
            InstructorBadgeAward,
        )

        instructor_id = str(current_user.id)

        # Get all instructors with points, ordered by points descending
        points_query = (
            select(InstructorPoints)
            .order_by(InstructorPoints.points.desc())
            .limit(limit)
        )
        points_result = await db.execute(points_query)
        points_records = points_result.scalars().all()

        # Get badge counts per instructor
        badge_counts_query = (
            select(
                InstructorBadgeAward.instructor_id,
                func.count(InstructorBadgeAward.id).label("badge_count"),
            )
            .group_by(InstructorBadgeAward.instructor_id)
        )
        badge_counts_result = await db.execute(badge_counts_query)
        badge_counts = {
            str(row.instructor_id): row.badge_count
            for row in badge_counts_result.fetchall()
        }

        # Get instructor names
        instructor_ids = [p.instructor_id for p in points_records]
        if instructor_ids:
            users_query = select(User).where(User.id.in_(instructor_ids))
            users_result = await db.execute(users_query)
            users = users_result.scalars().all()
            user_lookup = {str(u.id): u for u in users}
        else:
            user_lookup = {}

        entries = []
        user_rank = None
        for rank_idx, record in enumerate(points_records, start=1):
            rid = str(record.instructor_id)
            user = user_lookup.get(rid)
            entry = LeaderboardEntry(
                rank=rank_idx,
                instructor_id=rid,
                instructor_name=user.full_name if user else "Unknown",
                instructor_avatar=user.profile_picture if user else None,
                points=record.points,
                level=record.level,
                badges_count=badge_counts.get(rid, 0),
            )
            entries.append(entry)

            if rid == instructor_id:
                user_rank = rank_idx

        # If the current user wasn't in the top N, find their rank
        if user_rank is None and instructor_id:
            all_points_query = (
                select(func.count())
                .where(
                    InstructorPoints.points > (
                        select(InstructorPoints.points).where(
                            InstructorPoints.instructor_id == instructor_id
                        ).scalar_subquery()
                    )
                )
            )
            rank_result = await db.execute(all_points_query)
            higher_count = rank_result.scalar() or 0
            user_rank = higher_count + 1

        # Total participants
        total_q = select(func.count()).select_from(InstructorPoints)
        total_result = await db.execute(total_q)
        total_participants = total_result.scalar() or 0

        return LeaderboardResponse(
            period=period,
            entries=entries,
            user_rank=user_rank,
            total_participants=total_participants,
        )

    except Exception as e:
        logger.error(f"Error getting leaderboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Peer Kudos Endpoints
# ============================================================================

@router.post("/gamification/kudos", response_model=PeerKudoResponse)
async def send_kudo(
    kudo_data: PeerKudoCreate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Send a peer recognition kudo to another instructor.

    Awards points to the recipient. The sender cannot send a kudo
    to themselves.
    """
    try:
        from app.services.instructor.gamification_service import create_peer_kudo

        instructor_id = str(current_user.id)

        # Prevent self-kudos
        if kudo_data.to_instructor_id == instructor_id:
            raise HTTPException(
                status_code=400, detail="Cannot send a kudo to yourself"
            )

        # Verify recipient exists and is an instructor
        recipient_query = select(User).where(
            and_(
                User.id == kudo_data.to_instructor_id,
                User.role == "instructor",
            )
        )
        recipient_result = await db.execute(recipient_query)
        recipient = recipient_result.scalar_one_or_none()

        if not recipient:
            raise HTTPException(
                status_code=404, detail="Recipient instructor not found"
            )

        kudo = await create_peer_kudo(
            db=db,
            from_instructor_id=instructor_id,
            to_instructor_id=kudo_data.to_instructor_id,
            message=kudo_data.message,
            category=kudo_data.category,
            is_public=kudo_data.is_public,
        )

        return PeerKudoResponse(
            id=str(kudo.id),
            from_instructor_id=instructor_id,
            from_instructor_name=current_user.full_name or "Instructor",
            from_instructor_avatar=current_user.profile_picture,
            to_instructor_id=kudo_data.to_instructor_id,
            to_instructor_name=recipient.full_name or "Instructor",
            message=kudo.message,
            category=kudo.category,
            is_public=kudo.is_public,
            created_at=kudo.created_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending kudo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/gamification/kudos")
async def list_kudos(
    direction: str = Query("received", regex="^(received|sent)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    List kudos received by or sent from the current instructor.

    Use the direction query parameter:
    - 'received': kudos sent TO this instructor (default)
    - 'sent': kudos sent BY this instructor
    """
    try:
        from app.models.instructor.instructor_gamification import PeerKudo

        instructor_id = str(current_user.id)
        offset = (page - 1) * limit

        # Build query based on direction
        if direction == "received":
            kudos_query = select(PeerKudo).where(
                PeerKudo.to_instructor_id == instructor_id
            )
        else:
            kudos_query = select(PeerKudo).where(
                PeerKudo.from_instructor_id == instructor_id
            )

        kudos_query = kudos_query.order_by(PeerKudo.created_at.desc())

        # Count total
        count_query = select(func.count()).select_from(kudos_query.subquery())
        count_result = await db.execute(count_query)
        total = count_result.scalar() or 0

        # Paginate
        kudos_query = kudos_query.offset(offset).limit(limit)
        kudos_result = await db.execute(kudos_query)
        kudos = kudos_result.scalars().all()

        # Resolve instructor names
        all_instructor_ids = set()
        for k in kudos:
            all_instructor_ids.add(str(k.from_instructor_id))
            all_instructor_ids.add(str(k.to_instructor_id))

        if all_instructor_ids:
            users_query = select(User).where(User.id.in_(list(all_instructor_ids)))
            users_result = await db.execute(users_query)
            users = users_result.scalars().all()
            user_lookup = {str(u.id): u for u in users}
        else:
            user_lookup = {}

        kudo_items = []
        for k in kudos:
            from_user = user_lookup.get(str(k.from_instructor_id))
            to_user = user_lookup.get(str(k.to_instructor_id))
            kudo_items.append({
                "id": str(k.id),
                "from_instructor_id": str(k.from_instructor_id),
                "from_instructor_name": from_user.full_name if from_user else "Instructor",
                "from_instructor_avatar": from_user.profile_picture if from_user else None,
                "to_instructor_id": str(k.to_instructor_id),
                "to_instructor_name": to_user.full_name if to_user else "Instructor",
                "message": k.message,
                "category": k.category,
                "is_public": k.is_public,
                "created_at": k.created_at.isoformat() if k.created_at else None,
            })

        return {
            "kudos": kudo_items,
            "direction": direction,
            "page": page,
            "limit": limit,
            "total": total,
        }

    except Exception as e:
        logger.error(f"Error listing kudos: {e}")
        raise HTTPException(status_code=500, detail=str(e))
