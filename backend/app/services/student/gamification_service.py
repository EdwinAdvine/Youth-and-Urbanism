"""
Student Gamification Service - XP, Levels, Badges, Achievements, Leaderboards

Manages the student gamification system including:
- XP awarding with configurable sources and multipliers
- Level progression using an exponential XP curve
- Badge awarding based on achievement milestones
- Leaderboard generation (class, grade, or school scope)
- AI-powered weekly learning reports with narrative summaries
- Learning goal creation and tracking
- Skill node progression (skill tree)

XP rewards and badge definitions are configured as class constants.
Level XP requirements follow an exponential curve: base * multiplier^(level-1).
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, desc
from uuid import UUID
import math

from app.models.student import Student
from app.models.student_gamification import (
    StudentXPEvent,
    StudentLevel,
    StudentBadge,
    StudentGoal,
    StudentSkillNode,
    StudentWeeklyReport
)
from app.services.ai_orchestrator import AIOrchestrator


class GamificationService:
    """Service for student gamification and progress tracking"""

    # XP requirements for levels (exponential curve)
    LEVEL_XP_BASE = 100
    LEVEL_XP_MULTIPLIER = 1.5

    # XP sources and their base rewards
    XP_REWARDS = {
        "login": 10,
        "assignment_complete": 50,
        "quiz_complete": 30,
        "challenge_complete": 20,
        "helping_peer": 15,
        "project_complete": 100,
        "streak_milestone": 25,
        "lesson_complete": 40
    }

    # Badge definitions
    BADGES = {
        "first_lesson": {
            "name": "First Steps",
            "description": "Complete your first lesson",
            "icon": "🎯",
            "rarity": "common"
        },
        "streak_7": {
            "name": "Week Warrior",
            "description": "Maintain a 7-day learning streak",
            "icon": "🔥",
            "rarity": "uncommon"
        },
        "streak_30": {
            "name": "Month Master",
            "description": "Maintain a 30-day learning streak",
            "icon": "⚡",
            "rarity": "rare"
        },
        "assignments_10": {
            "name": "Assignment Ace",
            "description": "Complete 10 assignments",
            "icon": "📝",
            "rarity": "uncommon"
        },
        "level_10": {
            "name": "Rising Star",
            "description": "Reach level 10",
            "icon": "⭐",
            "rarity": "rare"
        },
        "perfect_quiz": {
            "name": "Perfect Score",
            "description": "Get 100% on a quiz",
            "icon": "💯",
            "rarity": "uncommon"
        }
    }

    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_orchestrator = AIOrchestrator()

    async def award_xp(
        self,
        student_id: UUID,
        source: str,
        description: str,
        multiplier: float = 1.0,
        custom_amount: Optional[int] = None
    ) -> Dict:
        """
        Award XP to a student and check for level ups

        Args:
            student_id: Student UUID
            source: XP source (login, assignment_complete, etc.)
            description: Description of what earned the XP
            multiplier: XP multiplier (e.g., 2.0 for double XP event)
            custom_amount: Optional custom XP amount (overrides source default)

        Returns:
            Dict with XP awarded, new total XP, level, and any level ups
        """
        # Calculate XP amount
        base_xp = custom_amount or self.XP_REWARDS.get(source, 10)
        xp_amount = int(base_xp * multiplier)

        # Create XP event
        xp_event = StudentXPEvent(
            student_id=student_id,
            xp_amount=xp_amount,
            source=source,
            description=description,
            multiplier=multiplier
        )
        self.db.add(xp_event)

        # Get or create student level record
        level_result = await self.db.execute(
            select(StudentLevel).where(StudentLevel.student_id == student_id)
        )
        student_level = level_result.scalar_one_or_none()

        if not student_level:
            student_level = StudentLevel(
                student_id=student_id,
                current_level=1,
                total_xp=0,
                next_level_xp=self._calculate_xp_for_level(2)
            )
            self.db.add(student_level)
            await self.db.flush()

        # Update total XP
        old_level = student_level.current_level
        student_level.total_xp += xp_amount

        # Check for level ups
        leveled_up = False
        levels_gained = 0

        while student_level.total_xp >= student_level.next_level_xp:
            student_level.current_level += 1
            levels_gained += 1
            leveled_up = True
            student_level.next_level_xp = self._calculate_xp_for_level(student_level.current_level + 1)

        await self.db.commit()

        # Award badges for level milestones
        if leveled_up and student_level.current_level == 10:
            await self.award_badge(student_id, "level_10")

        result = {
            "xp_awarded": xp_amount,
            "total_xp": student_level.total_xp,
            "current_level": student_level.current_level,
            "next_level_xp": student_level.next_level_xp,
            "progress_to_next_level": (student_level.total_xp / student_level.next_level_xp) * 100,
            "leveled_up": leveled_up,
            "levels_gained": levels_gained
        }

        return result

    async def get_student_level_data(self, student_id: UUID) -> Dict:
        """Get student's current level and XP data"""
        level_result = await self.db.execute(
            select(StudentLevel).where(StudentLevel.student_id == student_id)
        )
        student_level = level_result.scalar_one_or_none()

        if not student_level:
            # Return default level 1 data
            return {
                "current_level": 1,
                "total_xp": 0,
                "next_level_xp": self._calculate_xp_for_level(2),
                "progress_to_next_level": 0
            }

        return {
            "current_level": student_level.current_level,
            "total_xp": student_level.total_xp,
            "next_level_xp": student_level.next_level_xp,
            "progress_to_next_level": (student_level.total_xp / student_level.next_level_xp) * 100
        }

    async def award_badge(self, student_id: UUID, badge_key: str) -> Optional[StudentBadge]:
        """Award a badge to a student"""
        if badge_key not in self.BADGES:
            return None

        # Check if student already has this badge
        existing = await self.db.execute(
            select(StudentBadge).where(
                and_(
                    StudentBadge.student_id == student_id,
                    StudentBadge.badge_name == self.BADGES[badge_key]["name"]
                )
            )
        )
        if existing.scalar_one_or_none():
            return None  # Already has badge

        badge_def = self.BADGES[badge_key]
        badge = StudentBadge(
            student_id=student_id,
            badge_type="achievement",
            badge_name=badge_def["name"],
            description=badge_def["description"],
            icon=badge_def["icon"],
            rarity=badge_def["rarity"]
        )

        self.db.add(badge)
        await self.db.commit()
        await self.db.refresh(badge)

        return badge

    async def get_student_badges(self, student_id: UUID) -> List[Dict]:
        """Get all badges earned by a student"""
        result = await self.db.execute(
            select(StudentBadge)
            .where(StudentBadge.student_id == student_id)
            .order_by(desc(StudentBadge.earned_at))
        )
        badges = result.scalars().all()

        return [
            {
                "id": str(badge.id),
                "badge_type": badge.badge_type,
                "badge_name": badge.badge_name,
                "description": badge.description,
                "icon": badge.icon,
                "rarity": badge.rarity,
                "earned_at": badge.earned_at,
                "is_shareable": badge.is_shareable
            }
            for badge in badges
        ]

    async def get_leaderboard(
        self,
        student_id: UUID,
        scope: str = "class",
        limit: int = 10
    ) -> List[Dict]:
        """
        Get leaderboard data

        Args:
            student_id: Current student ID
            scope: "class" | "grade" | "school"
            limit: Number of entries to return
        """
        # Get student's grade to filter by class/grade
        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()

        if not student:
            return []

        # Build query based on scope
        if scope == "grade":
            # Get top students from same grade
            result = await self.db.execute(
                select(StudentLevel, Student)
                .join(Student, StudentLevel.student_id == Student.id)
                .where(Student.grade_level == student.grade_level)
                .order_by(desc(StudentLevel.total_xp))
                .limit(limit)
            )
        else:
            # Default: all students (can be refined to actual class)
            result = await self.db.execute(
                select(StudentLevel, Student)
                .join(Student, StudentLevel.student_id == Student.id)
                .order_by(desc(StudentLevel.total_xp))
                .limit(limit)
            )

        leaderboard = []
        for level, stud in result:
            leaderboard.append({
                "rank": len(leaderboard) + 1,
                "student_id": str(stud.id),
                "student_name": f"{stud.first_name} {stud.last_name}",
                "level": level.current_level,
                "total_xp": level.total_xp,
                "is_current_student": str(stud.id) == str(student_id)
            })

        return leaderboard

    async def generate_weekly_report(self, student_id: UUID) -> StudentWeeklyReport:
        """Generate AI-powered weekly learning report"""
        # Get student info
        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()

        if not student:
            raise ValueError("Student not found")

        # Calculate week range
        today = datetime.utcnow()
        week_start = today - timedelta(days=7)

        # Get this week's XP events
        xp_result = await self.db.execute(
            select(StudentXPEvent)
            .where(
                and_(
                    StudentXPEvent.student_id == student_id,
                    StudentXPEvent.timestamp >= week_start
                )
            )
        )
        xp_events = xp_result.scalars().all()

        # Calculate metrics
        total_xp = sum(event.xp_amount for event in xp_events)
        event_counts = {}
        for event in xp_events:
            event_counts[event.source] = event_counts.get(event.source, 0) + 1

        metrics = {
            "total_xp_earned": total_xp,
            "activities_completed": len(xp_events),
            "lessons_completed": event_counts.get("lesson_complete", 0),
            "assignments_completed": event_counts.get("assignment_complete", 0),
            "quizzes_completed": event_counts.get("quiz_complete", 0)
        }

        # Generate AI narrative
        ai_prompt = f"""Create a motivational weekly learning story for {student.first_name}, a grade {student.grade_level} student.

This week they:
- Earned {total_xp} XP
- Completed {metrics['lessons_completed']} lessons
- Finished {metrics['assignments_completed']} assignments
- Took {metrics['quizzes_completed']} quizzes

Write a short, encouraging narrative (2-3 paragraphs) celebrating their progress."""

        ai_response = await self.ai_orchestrator.chat(
            message=ai_prompt,
            system_message="You are an encouraging mentor writing personalized weekly reports for students.",
            task_type="general"
        )

        # Create weekly report
        report = StudentWeeklyReport(
            student_id=student_id,
            week_start=week_start,
            week_end=today,
            ai_story=ai_response["message"],
            metrics=metrics,
            strongest_subject=None,  # Would need subject-level tracking
            improvement_area=None,
            shared_with_parent=False
        )

        self.db.add(report)
        await self.db.commit()
        await self.db.refresh(report)

        return report

    async def create_goal(
        self,
        student_id: UUID,
        title: str,
        target: int,
        unit: str = "lessons",
        deadline: Optional[datetime] = None,
        ai_suggested: bool = False
    ) -> StudentGoal:
        """Create a learning goal"""
        goal = StudentGoal(
            student_id=student_id,
            title=title,
            target=target,
            current=0,
            unit=unit,
            deadline=deadline,
            ai_suggested=ai_suggested,
            status="active"
        )

        self.db.add(goal)
        await self.db.commit()
        await self.db.refresh(goal)

        return goal

    async def get_student_goals(self, student_id: UUID) -> List[Dict]:
        """Get student's active goals"""
        result = await self.db.execute(
            select(StudentGoal)
            .where(
                and_(
                    StudentGoal.student_id == student_id,
                    StudentGoal.status == "active"
                )
            )
            .order_by(StudentGoal.created_at.desc())
        )
        goals = result.scalars().all()

        return [
            {
                "id": str(goal.id),
                "title": goal.title,
                "target": goal.target,
                "current": goal.current,
                "unit": goal.unit,
                "progress_percentage": (goal.current / goal.target) * 100 if goal.target > 0 else 0,
                "deadline": goal.deadline,
                "ai_suggested": goal.ai_suggested,
                "status": goal.status
            }
            for goal in goals
        ]

    def _calculate_xp_for_level(self, level: int) -> int:
        """Calculate XP required for a specific level"""
        return int(self.LEVEL_XP_BASE * (self.LEVEL_XP_MULTIPLIER ** (level - 1)))
