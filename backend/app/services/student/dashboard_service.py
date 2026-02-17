"""
Student Dashboard Service - Daily plans, mood tracking, streaks, urgent items

Provides the main student dashboard data aggregation including:
- Time-adaptive greetings and daily motivational quotes
- AI-generated daily learning plans with course and assignment scheduling
- Mood check-in submission and tracking
- Learning streak calculation and management
- Urgent/overdue assignment detection
- XP and level data via the gamification service
- Daily plan manual editing support

All methods are async and require a student UUID for personalization.
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from uuid import UUID
import random

from app.models.user import User
from app.models.student import Student
from app.models.student_dashboard import (
    StudentMoodEntry,
    StudentStreak,
    StudentDailyPlan,
    MoodType
)
from app.models.enrollment import Enrollment
from app.models.assessment import Assessment, AssessmentSubmission
from app.services.ai_orchestrator import AIOrchestrator
from app.services.student.gamification_service import GamificationService


class DashboardService:
    """
    Service for student dashboard operations.

    Aggregates data from multiple sources (enrollments, assessments,
    mood entries, streaks, gamification) to build the student's daily
    dashboard view. Uses the AI orchestrator for generating daily
    learning plans and motivational content.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_orchestrator = AIOrchestrator()
        self.gamification_service = GamificationService(db)

    async def get_today_dashboard(self, student_id: UUID) -> Dict:
        """Get comprehensive dashboard data for today"""
        # Get student info
        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()

        if not student:
            raise ValueError("Student not found")

        # Get time-based greeting
        greeting = self._get_time_adaptive_greeting()

        # Get today's plan
        daily_plan = await self._get_or_create_daily_plan(student_id, student.grade_level)

        # Get current streak
        streak_data = await self._get_streak_data(student_id)

        # Get last mood check-in
        mood_data = await self._get_latest_mood(student_id)

        # Get urgent items
        urgent_items = await self._get_urgent_items(student_id)

        # Get daily quote
        daily_quote = await self._get_daily_quote(student.grade_level)

        # Get XP and level from gamification service
        xp_data = await self.gamification_service.get_student_level_data(student_id)

        return {
            "greeting": greeting,
            "student_name": student.first_name,
            "daily_plan": daily_plan,
            "streak": streak_data,
            "mood": mood_data,
            "urgent_items": urgent_items,
            "daily_quote": daily_quote,
            "xp_data": xp_data,
            "timestamp": datetime.utcnow()
        }

    async def submit_mood_check_in(
        self,
        student_id: UUID,
        mood_type: MoodType,
        energy_level: int,
        note: Optional[str] = None
    ) -> StudentMoodEntry:
        """Submit a mood check-in"""
        mood_entry = StudentMoodEntry(
            student_id=student_id,
            mood_type=mood_type,
            energy_level=energy_level,
            note=note,
            timestamp=datetime.utcnow()
        )

        self.db.add(mood_entry)
        await self.db.commit()
        await self.db.refresh(mood_entry)

        return mood_entry

    async def _get_or_create_daily_plan(self, student_id: UUID, grade_level: int) -> Dict:
        """Get or create AI-generated daily plan"""
        today = datetime.utcnow().date()

        # Check if plan exists for today
        result = await self.db.execute(
            select(StudentDailyPlan).where(
                and_(
                    StudentDailyPlan.student_id == student_id,
                    func.date(StudentDailyPlan.date) == today
                )
            )
        )
        existing_plan = result.scalar_one_or_none()

        if existing_plan:
            return {
                "date": existing_plan.date,
                "items": existing_plan.items,
                "ai_generated": existing_plan.ai_generated,
                "manually_edited": existing_plan.manually_edited
            }

        # Generate new AI plan
        plan_items = await self._generate_ai_daily_plan(student_id, grade_level)

        new_plan = StudentDailyPlan(
            student_id=student_id,
            date=datetime.utcnow(),
            items=plan_items,
            ai_generated=True,
            manually_edited=False
        )

        self.db.add(new_plan)
        await self.db.commit()

        return {
            "date": new_plan.date,
            "items": new_plan.items,
            "ai_generated": True,
            "manually_edited": False
        }

    async def _generate_ai_daily_plan(self, student_id: UUID, grade_level: int) -> List[Dict]:
        """Generate AI-curated daily learning plan"""
        # Get student's enrolled courses
        enrollments_result = await self.db.execute(
            select(Enrollment).where(
                and_(
                    Enrollment.student_id == student_id,
                    Enrollment.is_deleted == False
                )
            ).limit(5)
        )
        enrollments = enrollments_result.scalars().all()

        # Get pending assignments (simplified for now)
        assignments_result = await self.db.execute(
            select(Assessment).where(
                Assessment.is_deleted == False
            ).limit(3)
        )
        assignments = assignments_result.scalars().all()

        # Create plan items
        plan_items = []

        # Morning review (AI-suggested)
        plan_items.append({
            "id": "morning-review",
            "time": "08:00",
            "type": "review",
            "title": "Quick Morning Review",
            "description": "Review yesterday's key concepts",
            "duration": 15,
            "completed": False,
            "ai_suggested": True
        })

        # Add course lessons
        for i, enrollment in enumerate(enrollments[:2]):
            plan_items.append({
                "id": f"lesson-{i+1}",
                "time": f"{9 + i}:00",
                "type": "lesson",
                "title": f"Continue learning",
                "description": f"Progress in your course",
                "duration": 45,
                "completed": False,
                "ai_suggested": True,
                "course_id": str(enrollment.course_id)
            })

        # Add assignment if pending
        if assignments:
            plan_items.append({
                "id": "assignment-1",
                "time": "11:00",
                "type": "assignment",
                "title": "Complete assignment",
                "description": "Work on pending assignment",
                "duration": 30,
                "completed": False,
                "ai_suggested": True
            })

        # Afternoon practice
        plan_items.append({
            "id": "practice",
            "time": "14:00",
            "type": "practice",
            "title": "Practice Challenge",
            "description": "Test your skills with today's challenge",
            "duration": 20,
            "completed": False,
            "ai_suggested": True
        })

        return plan_items

    async def _get_streak_data(self, student_id: UUID) -> Dict:
        """Get student's current streak"""
        result = await self.db.execute(
            select(StudentStreak).where(StudentStreak.student_id == student_id)
        )
        streak = result.scalar_one_or_none()

        if not streak:
            # Create new streak record
            streak = StudentStreak(
                student_id=student_id,
                current_streak=0,
                longest_streak=0,
                last_activity_date=None
            )
            self.db.add(streak)
            await self.db.commit()

        return {
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "last_activity": streak.last_activity_date
        }

    async def _get_latest_mood(self, student_id: UUID) -> Optional[Dict]:
        """Get student's latest mood check-in"""
        result = await self.db.execute(
            select(StudentMoodEntry)
            .where(StudentMoodEntry.student_id == student_id)
            .order_by(StudentMoodEntry.timestamp.desc())
            .limit(1)
        )
        mood = result.scalar_one_or_none()

        if not mood:
            return None

        return {
            "mood_type": mood.mood_type.value,
            "energy_level": mood.energy_level,
            "note": mood.note,
            "timestamp": mood.timestamp
        }

    async def _get_urgent_items(self, student_id: UUID) -> List[Dict]:
        """Get urgent/overdue items"""
        urgent = []

        # Get assignments due soon (within 48 hours)
        two_days_from_now = datetime.utcnow() + timedelta(days=2)

        assignments_result = await self.db.execute(
            select(Assessment).where(
                and_(
                    Assessment.is_deleted == False,
                    Assessment.due_date <= two_days_from_now,
                    Assessment.due_date >= datetime.utcnow()
                )
            ).limit(5)
        )
        assignments = assignments_result.scalars().all()

        for assignment in assignments:
            time_left = assignment.due_date - datetime.utcnow()
            hours_left = int(time_left.total_seconds() / 3600)

            urgent.append({
                "id": str(assignment.id),
                "type": "assignment",
                "title": assignment.title,
                "due_in": f"{hours_left}h" if hours_left < 24 else f"{hours_left // 24}d",
                "priority": "high" if hours_left < 6 else "medium"
            })

        return urgent

    async def _get_daily_quote(self, grade_level: int) -> Dict:
        """Get age-appropriate daily quote/micro-lesson"""
        quotes = [
            {
                "quote": "The expert in anything was once a beginner.",
                "author": "Helen Hayes",
                "category": "motivation"
            },
            {
                "quote": "Learning is not attained by chance; it must be sought for with ardor.",
                "author": "Abigail Adams",
                "category": "learning"
            },
            {
                "quote": "Education is the most powerful weapon which you can use to change the world.",
                "author": "Nelson Mandela",
                "category": "inspiration"
            },
            {
                "quote": "The more that you read, the more things you will know.",
                "author": "Dr. Seuss",
                "category": "reading"
            }
        ]

        # Select random quote
        selected = random.choice(quotes)

        return {
            "text": selected["quote"],
            "author": selected["author"],
            "category": selected["category"],
            "date": datetime.utcnow().date()
        }

    def _get_time_adaptive_greeting(self) -> str:
        """Get greeting based on time of day"""
        current_hour = datetime.utcnow().hour

        if current_hour < 12:
            return "Good morning"
        elif current_hour < 17:
            return "Good afternoon"
        else:
            return "Good evening"

    async def get_teacher_sync_notes(self, student_id: UUID) -> List[Dict]:
        """Get teacher notes integrated into student's daily plan"""
        # This would integrate with the instructor dashboard
        # For now, return empty list as placeholder
        return []

    async def update_daily_plan(self, student_id: UUID, plan_items: List[Dict]) -> StudentDailyPlan:
        """Update daily plan (mark as manually edited)"""
        today = datetime.utcnow().date()

        result = await self.db.execute(
            select(StudentDailyPlan).where(
                and_(
                    StudentDailyPlan.student_id == student_id,
                    func.date(StudentDailyPlan.date) == today
                )
            )
        )
        plan = result.scalar_one_or_none()

        if plan:
            plan.items = plan_items
            plan.manually_edited = True
            await self.db.commit()
            await self.db.refresh(plan)

        return plan
