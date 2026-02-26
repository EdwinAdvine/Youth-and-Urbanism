"""
Parent Weekly Summary Service

Generates AI-powered weekly learning summaries for parents, including
discussion starter cards and offline activity suggestions. Queries the
child's mastery records, session logs, mood entries, and skill nodes
to provide personalized, actionable content for parent-child engagement.
"""
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.parent.discussion_card import ParentDiscussionCard
from app.models.student import Student
from app.models.student_mastery import StudentMasteryRecord, StudentSessionLog
from app.models.student_dashboard import StudentMoodEntry
from app.models.student_gamification import StudentSkillNode
from app.services.ai_orchestrator import AIOrchestrator


class ParentWeeklySummaryService:
    """Service for generating and retrieving weekly parent summaries."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_orchestrator = AIOrchestrator()

    async def generate_weekly_summary(
        self,
        parent_id: UUID,
        child_id: UUID,
    ) -> ParentDiscussionCard:
        """
        Generate an AI-powered weekly summary for a parent about their child.

        Collects the past week's learning data and feeds it to the AI to generate:
        - A parent-friendly summary of progress
        - 3 discussion starter cards for family conversations
        - 2 offline activity suggestions related to learned topics
        - A confidence trend assessment
        """
        today = date.today()
        week_start = today - timedelta(days=7)

        # Verify the child belongs to this parent
        child_stmt = select(Student).where(
            and_(Student.id == child_id, Student.parent_id == parent_id)
        )
        child_result = await self.db.execute(child_stmt)
        child = child_result.scalar_one_or_none()
        if not child:
            raise ValueError("Child not found or does not belong to this parent")

        # Gather week's data
        data_context = await self._gather_weekly_data(child_id, week_start, today)

        # Generate AI summary
        prompt = self._build_summary_prompt(child, data_context)
        ai_response = await self.ai_orchestrator.chat(
            message=prompt,
            system_message=(
                "You are a warm, supportive educational assistant generating a weekly "
                "learning summary for a Kenyan parent. Write in a friendly, encouraging tone. "
                "Use simple language that any parent can understand. "
                "Include Kenyan context (CBC curriculum, local examples). "
                "Respond in this exact JSON format:\n"
                '{"summary": "...", "discussion_starters": [{"topic": "...", "question": "...", '
                '"context": "..."}], "offline_activities": [{"activity": "...", '
                '"description": "...", "materials_needed": "..."}], '
                '"confidence_trend": "improving|stable|declining"}'
            ),
            task_type="general",
        )

        # Parse AI response (handle both JSON and plain text)
        import json
        try:
            ai_data = json.loads(ai_response.get("message", "{}"))
        except json.JSONDecodeError:
            ai_data = {
                "summary": ai_response.get("message", "Summary generation in progress."),
                "discussion_starters": [],
                "offline_activities": [],
                "confidence_trend": "stable",
            }

        # Create discussion card record
        card = ParentDiscussionCard(
            parent_id=parent_id,
            child_id=child_id,
            week_start=week_start,
            week_end=today,
            summary_text=ai_data.get("summary", ""),
            discussion_starters=ai_data.get("discussion_starters", []),
            offline_activities=ai_data.get("offline_activities", []),
            confidence_trend=ai_data.get("confidence_trend", "stable"),
            metrics=data_context.get("metrics", {}),
        )
        self.db.add(card)
        await self.db.commit()
        await self.db.refresh(card)
        return card

    async def _gather_weekly_data(
        self, child_id: UUID, week_start: date, week_end: date
    ) -> Dict:
        """Gather the child's learning data from the past week."""
        metrics = {}

        # Mastery progress this week
        mastery_stmt = select(StudentMasteryRecord).where(
            and_(
                StudentMasteryRecord.student_id == child_id,
                StudentMasteryRecord.updated_at >= datetime.combine(week_start, datetime.min.time()),
                StudentMasteryRecord.is_deleted == False,
            )
        )
        mastery_result = await self.db.execute(mastery_stmt)
        mastery_records = mastery_result.scalars().all()

        topics_studied = [r.topic_name for r in mastery_records]
        subjects_covered = list(set(r.subject for r in mastery_records))
        newly_mastered = [r.topic_name for r in mastery_records if r.is_mastered]
        metrics["topics_covered"] = len(topics_studied)
        metrics["subjects"] = subjects_covered
        metrics["newly_mastered"] = newly_mastered

        # Session time this week
        session_stmt = select(
            func.sum(StudentSessionLog.total_minutes),
            func.sum(StudentSessionLog.message_count),
        ).where(
            and_(
                StudentSessionLog.student_id == child_id,
                StudentSessionLog.date >= week_start,
                StudentSessionLog.date <= week_end,
            )
        )
        session_result = await self.db.execute(session_stmt)
        row = session_result.one_or_none()
        metrics["total_minutes"] = row[0] or 0 if row else 0
        metrics["total_messages"] = row[1] or 0 if row else 0

        # Mood trend this week
        mood_stmt = (
            select(StudentMoodEntry.mood_type)
            .where(
                and_(
                    StudentMoodEntry.student_id == child_id,
                    StudentMoodEntry.timestamp >= datetime.combine(week_start, datetime.min.time()),
                )
            )
            .order_by(StudentMoodEntry.timestamp.desc())
            .limit(7)
        )
        mood_result = await self.db.execute(mood_stmt)
        moods = [m[0].value for m in mood_result.all()]
        metrics["mood_trend"] = moods if moods else ["no data"]

        # Top skills
        skill_stmt = (
            select(StudentSkillNode.skill_name, StudentSkillNode.subject, StudentSkillNode.proficiency)
            .where(StudentSkillNode.student_id == child_id)
            .order_by(StudentSkillNode.proficiency.desc())
            .limit(5)
        )
        skill_result = await self.db.execute(skill_stmt)
        top_skills = [
            {"skill": name, "subject": subj, "proficiency": prof}
            for name, subj, prof in skill_result.all()
        ]
        metrics["top_skills"] = top_skills

        return {
            "topics_studied": topics_studied,
            "subjects_covered": subjects_covered,
            "newly_mastered": newly_mastered,
            "metrics": metrics,
        }

    def _build_summary_prompt(self, child: Student, data_context: Dict) -> str:
        """Build the prompt for AI summary generation."""
        metrics = data_context.get("metrics", {})
        return (
            f"Generate a weekly learning summary for a parent of a {child.grade_level} student.\n\n"
            f"This week's data:\n"
            f"- Topics covered: {', '.join(data_context.get('topics_studied', ['None']))}\n"
            f"- Subjects: {', '.join(data_context.get('subjects_covered', ['None']))}\n"
            f"- Newly mastered topics: {', '.join(data_context.get('newly_mastered', ['None']))}\n"
            f"- Total study time: {metrics.get('total_minutes', 0)} minutes\n"
            f"- Messages exchanged with AI tutor: {metrics.get('total_messages', 0)}\n"
            f"- Mood trend: {', '.join(metrics.get('mood_trend', ['no data']))}\n\n"
            "Please generate:\n"
            "1. A warm, encouraging 3-4 sentence summary of the child's progress this week\n"
            "2. Three discussion starter questions the parent can ask at dinner to deepen learning\n"
            "3. Two offline activities related to topics studied (using materials available at home)\n"
            "4. An overall confidence trend assessment (improving, stable, or declining)\n"
        )

    async def get_summaries(
        self,
        parent_id: UUID,
        child_id: UUID,
        limit: int = 4,
    ) -> List[Dict]:
        """Get recent weekly summaries for a child."""
        stmt = (
            select(ParentDiscussionCard)
            .where(
                and_(
                    ParentDiscussionCard.parent_id == parent_id,
                    ParentDiscussionCard.child_id == child_id,
                    ParentDiscussionCard.is_deleted == False,
                )
            )
            .order_by(ParentDiscussionCard.week_end.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        cards = result.scalars().all()

        return [
            {
                "id": str(c.id),
                "week_start": c.week_start.isoformat(),
                "week_end": c.week_end.isoformat(),
                "summary_text": c.summary_text,
                "discussion_starters": c.discussion_starters,
                "offline_activities": c.offline_activities,
                "confidence_trend": c.confidence_trend,
                "metrics": c.metrics,
                "created_at": c.created_at.isoformat(),
            }
            for c in cards
        ]
