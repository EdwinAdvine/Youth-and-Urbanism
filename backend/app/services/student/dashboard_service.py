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
        """Get assessments due within 24 hours for the student's enrolled courses."""
        from app.models.course import Course

        now = datetime.utcnow()
        deadline = now + timedelta(hours=24)

        # Get student's enrolled course IDs
        enrolled_result = await self.db.execute(
            select(Enrollment.course_id).where(
                and_(
                    Enrollment.student_id == student_id,
                    Enrollment.is_deleted == False
                )
            )
        )
        enrolled_ids = [row[0] for row in enrolled_result.all()]

        if not enrolled_ids:
            return []

        # Find published assessments in enrolled courses with available_until within 24 hours
        # and where the student has not yet submitted
        from app.models.assessment import AssessmentSubmission

        submitted_result = await self.db.execute(
            select(AssessmentSubmission.assessment_id).where(
                and_(
                    AssessmentSubmission.student_id == student_id,
                    AssessmentSubmission.is_submitted == True
                )
            )
        )
        submitted_ids = [row[0] for row in submitted_result.all()]

        query = (
            select(Assessment, Course)
            .join(Course, Assessment.course_id == Course.id)
            .where(
                and_(
                    Assessment.course_id.in_(enrolled_ids),
                    Assessment.is_published == True,
                    Assessment.available_until != None,  # noqa: E711
                    Assessment.available_until <= deadline,
                    Assessment.available_until >= now,
                )
            )
            .order_by(Assessment.available_until.asc())
            .limit(10)
        )

        if submitted_ids:
            query = query.where(Assessment.id.notin_(submitted_ids))

        result = await self.db.execute(query)
        rows = result.all()

        urgent = []
        for assessment, course in rows:
            time_left = assessment.available_until - now
            hours_left = int(time_left.total_seconds() / 3600)
            urgent.append({
                "id": str(assessment.id),
                "type": assessment.assessment_type,
                "title": assessment.title,
                "course_title": course.title,
                "due_at": assessment.available_until.isoformat(),
                "due_in": f"{hours_left}h",
                "priority": "high" if hours_left < 6 else "medium",
            })

        return urgent

    # ── Grade-tiered quote bank ───────────────────────────────────────
    _QUOTES_ECD = [
        {"quote": "Every day is a chance to learn something new!", "author": ""},
        {"quote": "You are amazing just the way you are!", "author": ""},
        {"quote": "Be curious. Ask questions. Explore!", "author": ""},
        {"quote": "A little progress every day adds up to big results.", "author": ""},
        {"quote": "You can do anything you put your mind to.", "author": ""},
        {"quote": "Learning is an adventure — enjoy the journey!", "author": ""},
        {"quote": "Make today a great day for learning.", "author": ""},
        {"quote": "Stars can't shine without darkness. Keep going!", "author": ""},
        {"quote": "Try, try, try again — that's how champions learn.", "author": ""},
        {"quote": "Every expert was once a beginner. You've got this!", "author": ""},
    ]

    _QUOTES_LOWER_PRIMARY = [
        {"quote": "Reading is to the mind what exercise is to the body.", "author": "Joseph Addison"},
        {"quote": "The more that you read, the more things you will know.", "author": "Dr. Seuss"},
        {"quote": "It always seems impossible until it is done.", "author": "Nelson Mandela"},
        {"quote": "Believe you can and you're halfway there.", "author": "Theodore Roosevelt"},
        {"quote": "The secret of getting ahead is getting started.", "author": "Mark Twain"},
        {"quote": "Try to be a rainbow in someone's cloud.", "author": "Maya Angelou"},
        {"quote": "Dream big. Work hard. Stay humble.", "author": ""},
        {"quote": "Learning is a treasure that will follow its owner everywhere.", "author": "Chinese Proverb"},
        {"quote": "Kind words are short to speak, but their echoes are endless.", "author": "Mother Teresa"},
        {"quote": "The only way to do great work is to love what you do.", "author": "Steve Jobs"},
        {"quote": "In the middle of difficulty lies opportunity.", "author": "Albert Einstein"},
        {"quote": "You must be the change you wish to see in the world.", "author": "Mahatma Gandhi"},
        {"quote": "Imagination is more important than knowledge.", "author": "Albert Einstein"},
        {"quote": "Every child is a different kind of flower and all together they make this world a beautiful garden.", "author": ""},
        {"quote": "Hard work beats talent when talent doesn't work hard.", "author": "Tim Notke"},
    ]

    _QUOTES_UPPER_PRIMARY = [
        {"quote": "Genius is one percent inspiration and ninety-nine percent perspiration.", "author": "Thomas Edison"},
        {"quote": "Education is not the filling of a pail, but the lighting of a fire.", "author": "W.B. Yeats"},
        {"quote": "Success is not final, failure is not fatal: it is the courage to continue that counts.", "author": "Winston Churchill"},
        {"quote": "The roots of education are bitter, but the fruit is sweet.", "author": "Aristotle"},
        {"quote": "An investment in knowledge pays the best interest.", "author": "Benjamin Franklin"},
        {"quote": "Knowledge is power. Information is liberating.", "author": "Kofi Annan"},
        {"quote": "The beautiful thing about learning is that no one can take it away from you.", "author": "B.B. King"},
        {"quote": "Your attitude, not your aptitude, will determine your altitude.", "author": "Zig Ziglar"},
        {"quote": "The more I learn, the more I realize how much I don't know.", "author": "Albert Einstein"},
        {"quote": "Strive for progress, not perfection.", "author": ""},
        {"quote": "Science is not only a disciple of reason but also one of romance and passion.", "author": "Stephen Hawking"},
        {"quote": "You don't have to be great to start, but you have to start to be great.", "author": "Zig Ziglar"},
        {"quote": "A person who never made a mistake never tried anything new.", "author": "Albert Einstein"},
        {"quote": "The future belongs to those who believe in the beauty of their dreams.", "author": "Eleanor Roosevelt"},
        {"quote": "Talent wins games, but teamwork and intelligence win championships.", "author": "Michael Jordan"},
    ]

    _QUOTES_JUNIOR_SECONDARY = [
        {"quote": "It does not matter how slowly you go as long as you do not stop.", "author": "Confucius"},
        {"quote": "Live as if you were to die tomorrow. Learn as if you were to live forever.", "author": "Mahatma Gandhi"},
        {"quote": "The function of education is to teach one to think intensively and to think critically.", "author": "Martin Luther King Jr."},
        {"quote": "He who learns but does not think is lost. He who thinks but does not learn is in great danger.", "author": "Confucius"},
        {"quote": "Tell me and I forget. Teach me and I remember. Involve me and I learn.", "author": "Benjamin Franklin"},
        {"quote": "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.", "author": "Malcolm X"},
        {"quote": "The mind is not a vessel to be filled but a fire to be kindled.", "author": "Plutarch"},
        {"quote": "The noblest pleasure is the joy of understanding.", "author": "Leonardo da Vinci"},
        {"quote": "Only the educated are free.", "author": "Epictetus"},
        {"quote": "Knowing yourself is the beginning of all wisdom.", "author": "Aristotle"},
        {"quote": "The purpose of education is to replace an empty mind with an open one.", "author": "Malcolm Forbes"},
        {"quote": "I am not afraid of storms, for I am learning how to sail my ship.", "author": "Louisa May Alcott"},
        {"quote": "If you're not making mistakes, then you're not doing anything.", "author": "John Wooden"},
        {"quote": "We cannot solve our problems with the same thinking we used when we created them.", "author": "Albert Einstein"},
        {"quote": "The greatest glory in living lies not in never falling, but in rising every time we fall.", "author": "Nelson Mandela"},
    ]

    _QUOTES_SENIOR_SECONDARY = [
        {"quote": "The unexamined life is not worth living.", "author": "Socrates"},
        {"quote": "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", "author": "Aristotle"},
        {"quote": "The measure of intelligence is the ability to change.", "author": "Albert Einstein"},
        {"quote": "Education is not preparation for life; education is life itself.", "author": "John Dewey"},
        {"quote": "Intellectual growth should commence at birth and cease only at death.", "author": "Albert Einstein"},
        {"quote": "A mind that is stretched by a new experience can never go back to its old dimensions.", "author": "Oliver Wendell Holmes"},
        {"quote": "The object of education is to prepare the young to educate themselves throughout their lives.", "author": "Robert M. Hutchins"},
        {"quote": "Formal education will make you a living; self-education will make you a fortune.", "author": "Jim Rohn"},
        {"quote": "Real learning comes about when the competitive spirit has ceased.", "author": "Jiddu Krishnamurti"},
        {"quote": "I have never let my schooling interfere with my education.", "author": "Mark Twain"},
        {"quote": "The more you know, the more you know you don't know.", "author": "Aristotle"},
        {"quote": "In theory, there is no difference between theory and practice. In practice, there is.", "author": "Yogi Berra"},
        {"quote": "To know that we know what we know, and to know that we do not know what we do not know, that is true knowledge.", "author": "Nicolaus Copernicus"},
        {"quote": "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", "author": "Brian Herbert"},
        {"quote": "Education is the ability to listen to almost anything without losing your temper or your self-confidence.", "author": "Robert Frost"},
        {"quote": "Knowing is not enough; we must apply. Willing is not enough; we must do.", "author": "Johann Wolfgang von Goethe"},
        {"quote": "An educated mind is able to entertain a thought without accepting it.", "author": "Aristotle"},
    ]

    async def _get_daily_quote(self, grade_level) -> Dict:
        """Return a random grade-appropriate quote from the curated tiered bank."""
        grade_str = str(grade_level).strip() if grade_level else ""

        if "ECD" in grade_str:
            bank = self._QUOTES_ECD
        elif any(g in grade_str for g in ["Grade 1", "Grade 2", "Grade 3"]):
            bank = self._QUOTES_LOWER_PRIMARY
        elif any(g in grade_str for g in ["Grade 4", "Grade 5", "Grade 6"]):
            bank = self._QUOTES_UPPER_PRIMARY
        elif any(g in grade_str for g in ["Grade 7", "Grade 8", "Grade 9"]):
            bank = self._QUOTES_JUNIOR_SECONDARY
        else:
            # Grade 10–12 or unknown
            bank = self._QUOTES_SENIOR_SECONDARY

        selected = random.choice(bank)
        return {
            "quote": selected["quote"],
            "author": selected["author"],
            "category": "inspiration",
            "grade_tier": grade_str,
            "date": datetime.utcnow().date().isoformat(),
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
