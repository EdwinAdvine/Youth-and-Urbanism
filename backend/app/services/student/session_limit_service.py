"""
Student Session Limit Service

Enforces a 2-hour daily AI tutoring cap and encourages Pomodoro-style
breaks (25 minutes focus, 5 minutes break). Tracks daily interaction
counts and provides session status for the frontend timer.
"""
from datetime import date, datetime
from typing import Dict
from uuid import UUID

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student_mastery import StudentSessionLog


class StudentSessionLimitService:
    """Service for enforcing daily AI session limits and break schedules."""

    # Daily limits
    MAX_DAILY_MINUTES = 120  # 2 hours
    POMODORO_MINUTES = 25  # Focus block duration
    BREAK_MINUTES = 5  # Break duration

    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_or_create_today_log(self, student_id: UUID) -> StudentSessionLog:
        """Get or create today's session log for a student."""
        today = date.today()
        stmt = select(StudentSessionLog).where(
            and_(
                StudentSessionLog.student_id == student_id,
                StudentSessionLog.date == today,
            )
        )
        result = await self.db.execute(stmt)
        log = result.scalar_one_or_none()

        if not log:
            log = StudentSessionLog(
                student_id=student_id,
                date=today,
            )
            self.db.add(log)
            await self.db.flush()

        return log

    async def log_interaction(self, student_id: UUID, minutes_elapsed: int = 1) -> Dict:
        """
        Log an AI interaction and increment counters.

        Args:
            student_id: Student UUID
            minutes_elapsed: Estimated minutes for this interaction (default 1)

        Returns:
            Updated session status dict
        """
        log = await self._get_or_create_today_log(student_id)

        log.message_count += 1
        log.total_minutes += minutes_elapsed
        log.core_tutoring_minutes += minutes_elapsed
        log.updated_at = datetime.utcnow()

        # Check if a Pomodoro block was completed
        if log.total_minutes > 0 and log.total_minutes % self.POMODORO_MINUTES == 0:
            log.pomodoro_completed += 1

        await self.db.commit()
        return await self.check_session_limits(student_id)

    async def log_break(self, student_id: UUID) -> Dict:
        """Record that the student took a break."""
        log = await self._get_or_create_today_log(student_id)
        log.break_count += 1
        log.updated_at = datetime.utcnow()
        await self.db.commit()
        return await self.check_session_limits(student_id)

    async def check_session_limits(self, student_id: UUID) -> Dict:
        """
        Check if the student can continue their AI session.

        Returns:
            Dict with:
                can_continue: bool - whether student is within daily limit
                minutes_used: int - total minutes used today
                minutes_remaining: int - minutes left in daily budget
                suggest_break: bool - whether to suggest a Pomodoro break
                message_count: int - messages sent today
                pomodoro_completed: int - focus blocks completed
                suggestion: str - human-friendly suggestion text
        """
        log = await self._get_or_create_today_log(student_id)

        minutes_remaining = max(0, self.MAX_DAILY_MINUTES - log.total_minutes)
        can_continue = log.total_minutes < self.MAX_DAILY_MINUTES

        # Suggest break at Pomodoro intervals
        minutes_since_break = log.total_minutes % self.POMODORO_MINUTES
        suggest_break = (
            minutes_since_break >= self.POMODORO_MINUTES - 2  # Within 2 min of break time
            and log.total_minutes > 0
        )

        # Build suggestion text
        if not can_continue:
            suggestion = (
                "You have reached your 2-hour learning limit for today! "
                "Great job working so hard. Now go play, read a book, "
                "or spend time with your family. Your brain needs rest to "
                "remember everything you learned!"
            )
        elif suggest_break:
            suggestion = (
                f"You have been focused for {self.POMODORO_MINUTES} minutes — amazing! "
                "Take a 5-minute break: stretch, drink water, look outside. "
                "Your brain will work even better after a rest!"
            )
        elif minutes_remaining <= 15:
            suggestion = (
                f"You have about {minutes_remaining} minutes left today. "
                "Let us make the most of it! What topic would you like to review?"
            )
        else:
            suggestion = ""

        return {
            "can_continue": can_continue,
            "minutes_used": log.total_minutes,
            "minutes_remaining": minutes_remaining,
            "suggest_break": suggest_break,
            "message_count": log.message_count,
            "pomodoro_completed": log.pomodoro_completed,
            "break_count": log.break_count,
            "suggestion": suggestion,
        }

    async def get_daily_stats(self, student_id: UUID) -> Dict:
        """Get today's session stats for the frontend dashboard."""
        log = await self._get_or_create_today_log(student_id)
        return {
            "date": log.date.isoformat(),
            "total_minutes": log.total_minutes,
            "core_tutoring_minutes": log.core_tutoring_minutes,
            "message_count": log.message_count,
            "pomodoro_completed": log.pomodoro_completed,
            "break_count": log.break_count,
            "minutes_remaining": max(0, self.MAX_DAILY_MINUTES - log.total_minutes),
            "daily_limit_minutes": self.MAX_DAILY_MINUTES,
        }
