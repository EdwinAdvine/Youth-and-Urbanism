"""
Parent Children Service

Business logic for parent children endpoints.
Handles child profiles, learning journey, activity, achievements, goals.
"""

import logging
from typing import List, Optional
from datetime import date, datetime, timedelta
from uuid import UUID
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    User, Student, AITutor, Enrollment, Assessment,
    Certificate, FamilyGoal
)
from app.schemas.parent.children_schemas import (
    ChildProfileResponse, ChildSummaryCard, ChildrenListResponse,
    CBCCompetencyScore, FocusArea, WeeklyNarrative, LearningJourneyResponse,
    ActivityDay, ActivityFeedItem, ActivityResponse,
    Certificate as CertificateSchema, Badge, GrowthMilestone, AchievementsResponse,
    FamilyGoalResponse, GoalsListResponse, PredictedPathway, AIPathwaysResponse
)
from app.services.ai_orchestrator import get_orchestrator

logger = logging.getLogger(__name__)


class ParentChildrenService:
    """Service for parent children operations."""

    async def get_children_list(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> ChildrenListResponse:
        """Get list of all children for parent."""

        result = await db.execute(
            select(Student).where(
                and_(
                    Student.parent_id == parent_id,
                    Student.is_active == True
                )
            ).order_by(Student.grade_level)
        )
        children = result.scalars().all()

        child_cards = []
        for child in children:
            # Get AI tutor for engagement score
            tutor_result = await db.execute(
                select(AITutor).where(AITutor.student_id == child.id)
            )
            tutor = tutor_result.scalar_one_or_none()

            today_active = False
            if tutor and tutor.last_interaction:
                today_active = tutor.last_interaction.date() == date.today()

            current_streak = 0
            if tutor and tutor.performance_metrics:
                current_streak = tutor.performance_metrics.get('current_streak_days', 0)

            average_grade = None
            if child.overall_performance:
                average_grade = child.overall_performance.get('average_grade')

            engagement_score = None
            if child.competencies:
                values = list(child.competencies.values())
                if values:
                    engagement_score = sum(values) / len(values)

            child_cards.append(ChildSummaryCard(
                student_id=child.id,
                full_name=child.user.profile_data.get('full_name', 'Unknown') if child.user else 'Unknown',
                grade_level=child.grade_level,
                admission_number=child.admission_number,
                is_active=child.is_active,
                today_active=today_active,
                current_streak_days=current_streak,
                average_grade=average_grade,
                engagement_score=engagement_score
            ))

        return ChildrenListResponse(
            children=child_cards,
            total_count=len(child_cards)
        )

    async def get_child_profile(
        self,
        db: AsyncSession,
        parent_id: UUID,
        child_id: UUID
    ) -> ChildProfileResponse:
        """Get full child profile."""

        # Get child
        result = await db.execute(
            select(Student).where(
                and_(
                    Student.id == child_id,
                    Student.parent_id == parent_id
                )
            )
        )
        child = result.scalar_one_or_none()
        if not child:
            raise ValueError("Child not found")

        # Get AI tutor
        tutor_result = await db.execute(
            select(AITutor).where(AITutor.student_id == child.id)
        )
        tutor = tutor_result.scalar_one_or_none()

        # Get enrollments count
        enrollment_count_result = await db.execute(
            select(func.count(Enrollment.id)).where(Enrollment.student_id == child.id)
        )
        total_enrollments = enrollment_count_result.scalar() or 0

        completed_count_result = await db.execute(
            select(func.count(Enrollment.id)).where(
                and_(
                    Enrollment.student_id == child.id,
                    Enrollment.status == 'completed'
                )
            )
        )
        completed_enrollments = completed_count_result.scalar() or 0

        # Build CBC competencies
        cbc_scores = []
        if child.competencies:
            competency_names = [
                'communication', 'critical_thinking', 'creativity',
                'collaboration', 'citizenship', 'digital_literacy', 'learning_to_learn'
            ]
            for name in competency_names:
                score = child.competencies.get(name, 0)
                cbc_scores.append(CBCCompetencyScore(
                    name=name.replace('_', ' ').title(),
                    score=float(score),
                    description=f"{name.replace('_', ' ').title()} competency",
                    trend='stable'
                ))

        # Get learning profile
        learning_profile = child.learning_profile or {}
        learning_style = learning_profile.get('learning_style')
        strengths = learning_profile.get('strengths', [])
        interests = learning_profile.get('interests', [])

        # Overall performance
        overall_perf = child.overall_performance or {}
        average_grade = overall_perf.get('average_grade')
        class_rank = overall_perf.get('class_rank')
        total_students = overall_perf.get('total_students')

        # Activity stats
        total_hours = 0.0
        current_streak = 0
        total_interactions = 0
        last_interaction = None

        if tutor:
            total_interactions = tutor.total_interactions or 0
            last_interaction = tutor.last_interaction
            if tutor.performance_metrics:
                current_streak = tutor.performance_metrics.get('current_streak_days', 0)
                # Estimate hours (15 min per interaction)
                total_hours = (total_interactions * 15) / 60.0

        return ChildProfileResponse(
            student_id=child.id,
            user_id=child.user_id,
            full_name=child.user.profile_data.get('full_name', 'Unknown') if child.user else 'Unknown',
            grade_level=child.grade_level,
            admission_number=child.admission_number,
            date_of_birth=child.date_of_birth,
            gender=child.gender,
            learning_style=learning_style,
            strengths=strengths,
            interests=interests,
            competencies=cbc_scores,
            average_grade=average_grade,
            class_rank=class_rank,
            total_students=total_students,
            total_learning_hours=total_hours,
            current_streak_days=current_streak,
            total_courses_enrolled=total_enrollments,
            courses_completed=completed_enrollments,
            ai_tutor_id=tutor.id if tutor else None,
            total_interactions=total_interactions,
            last_interaction=last_interaction,
            is_active=child.is_active
        )

    async def get_learning_journey(
        self,
        db: AsyncSession,
        parent_id: UUID,
        child_id: UUID
    ) -> LearningJourneyResponse:
        """Get child's learning journey."""

        # Get child
        result = await db.execute(
            select(Student).where(
                and_(
                    Student.id == child_id,
                    Student.parent_id == parent_id
                )
            )
        )
        child = result.scalar_one_or_none()
        if not child:
            raise ValueError("Child not found")

        # Get AI tutor for learning path
        tutor_result = await db.execute(
            select(AITutor).where(AITutor.student_id == child.id)
        )
        tutor = tutor_result.scalar_one_or_none()

        # Build focus areas (from active enrollments)
        enrollment_result = await db.execute(
            select(Enrollment).where(
                and_(
                    Enrollment.student_id == child.id,
                    Enrollment.status == 'active'
                )
            ).limit(3)
        )
        enrollments = enrollment_result.scalars().all()

        focus_areas = []
        for enrollment in enrollments:
            if enrollment.course:
                focus_areas.append(FocusArea(
                    subject=enrollment.course.subject or 'General',
                    topic=enrollment.course.title,
                    progress_percentage=enrollment.progress_percentage or 0.0,
                    target_completion=None
                ))

        # Generate weekly narrative using AI
        week_start = date.today() - timedelta(days=date.today().weekday())
        week_end = week_start + timedelta(days=6)

        weekly_narrative = None
        if tutor:
            try:
                prompt = f"""Generate a weekly learning narrative for {child.user.profile_data.get('full_name', 'student')} (Grade {child.grade_level}).
Summarize: highlights, growth areas, challenges, and recommendations.
Total interactions this week: {tutor.total_interactions or 0}
Competencies: {child.competencies}
"""
                orchestrator = await get_orchestrator(db)
                ai_response = await orchestrator.chat(
                    task_type="general",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=300
                )

                weekly_narrative = WeeklyNarrative(
                    week_start=week_start,
                    week_end=week_end,
                    summary=ai_response.get('message', 'Progressing well.'),
                    highlights=['Consistent engagement', 'Active learning'],
                    areas_of_growth=['Critical thinking', 'Problem solving'],
                    challenges=['Time management'],
                    recommendations=['Practice daily', 'Review regularly']
                )
            except Exception as e:
                logger.error(f"AI narrative generation failed: {e}")

        # CBC competencies
        cbc_scores = []
        if child.competencies:
            for name, score in child.competencies.items():
                cbc_scores.append(CBCCompetencyScore(
                    name=name.replace('_', ' ').title(),
                    score=float(score)
                ))

        # Learning path from AI tutor
        learning_path = tutor.learning_path if tutor else {}
        completed = learning_path.get('completed_topics', [])
        upcoming = learning_path.get('upcoming_topics', [])
        in_progress = [learning_path.get('current_topic', '')] if learning_path.get('current_topic') else []

        return LearningJourneyResponse(
            student_id=child.id,
            full_name=child.user.profile_data.get('full_name', 'Unknown') if child.user else 'Unknown',
            grade_level=child.grade_level,
            current_focus_areas=focus_areas,
            weekly_narrative=weekly_narrative,
            cbc_competencies=cbc_scores,
            completed_topics=completed,
            in_progress_topics=in_progress,
            upcoming_topics=upcoming
        )

    async def get_activity(
        self,
        db: AsyncSession,
        parent_id: UUID,
        child_id: UUID
    ) -> ActivityResponse:
        """Get child's activity tracking data."""

        # Verify child belongs to parent
        result = await db.execute(
            select(Student).where(
                and_(
                    Student.id == child_id,
                    Student.parent_id == parent_id
                )
            )
        )
        child = result.scalar_one_or_none()
        if not child:
            raise ValueError("Child not found")

        # Get AI tutor for interaction data
        tutor_result = await db.execute(
            select(AITutor).where(AITutor.student_id == child.id)
        )
        tutor = tutor_result.scalar_one_or_none()

        # Build daily activity (last 7 days) - simplified
        daily_activity = []
        for i in range(7):
            activity_date = date.today() - timedelta(days=i)
            # In real implementation, query actual activity data
            daily_activity.append(ActivityDay(
                date=activity_date,
                total_minutes=0,
                sessions_count=0,
                lessons_completed=0,
                quizzes_taken=0
            ))

        # Weekly summary
        week_total_minutes = 0
        week_total_sessions = 0
        week_lessons = 0

        # Streaks
        current_streak = 0
        longest_streak = 0
        if tutor and tutor.performance_metrics:
            current_streak = tutor.performance_metrics.get('current_streak_days', 0)
            longest_streak = tutor.performance_metrics.get('longest_streak_days', 0)

        # Recent activity feed
        recent_activities = []

        return ActivityResponse(
            student_id=child.id,
            daily_activity=daily_activity,
            week_total_minutes=week_total_minutes,
            week_total_sessions=week_total_sessions,
            week_lessons_completed=week_lessons,
            week_average_score=None,
            current_streak_days=current_streak,
            longest_streak_days=longest_streak,
            recent_activities=recent_activities
        )

    async def get_achievements(
        self,
        db: AsyncSession,
        parent_id: UUID,
        child_id: UUID
    ) -> AchievementsResponse:
        """Get child's achievements and milestones."""

        # Verify child belongs to parent
        result = await db.execute(
            select(Student).where(
                and_(
                    Student.id == child_id,
                    Student.parent_id == parent_id
                )
            )
        )
        child = result.scalar_one_or_none()
        if not child:
            raise ValueError("Child not found")

        # Get certificates (Certificate.student_id references users.id)
        cert_result = await db.execute(
            select(Certificate).where(Certificate.student_id == child.user_id)
        )
        certificates = cert_result.scalars().all()

        cert_schemas = [
            CertificateSchema(
                id=cert.id,
                title=cert.course_name,
                description=f"Grade: {cert.grade}" if cert.grade else 'Course completion certificate',
                issued_date=cert.completion_date.date() if cert.completion_date else cert.issued_at.date(),
                certificate_url=f"/certificates/validate/{cert.serial_number}",
                thumbnail_url=None,
                course_name=cert.course_name
            )
            for cert in certificates
        ]

        # Badges (placeholder - would come from a badges table)
        badges = []

        # Growth milestones (placeholder)
        milestones = []

        # Recent achievements (placeholder)
        recent = []

        return AchievementsResponse(
            student_id=child.id,
            certificates=cert_schemas,
            total_certificates=len(cert_schemas),
            badges=badges,
            total_badges=len(badges),
            milestones=milestones,
            recent_achievements=recent
        )

    async def get_goals(
        self,
        db: AsyncSession,
        parent_id: UUID,
        child_id: Optional[UUID] = None
    ) -> GoalsListResponse:
        """Get family goals."""

        query = select(FamilyGoal).where(FamilyGoal.parent_id == parent_id)

        if child_id:
            query = query.where(
                or_(
                    FamilyGoal.child_id == child_id,
                    FamilyGoal.child_id.is_(None)
                )
            )

        query = query.order_by(desc(FamilyGoal.created_at))

        result = await db.execute(query)
        goals = result.scalars().all()

        # Convert to response models
        goal_responses = []
        active_count = 0
        completed_count = 0

        for goal in goals:
            child_name = None
            if goal.child_id:
                child_result = await db.execute(
                    select(Student).where(Student.id == goal.child_id)
                )
                child = child_result.scalar_one_or_none()
                if child and child.user:
                    child_name = child.user.profile_data.get('full_name', 'Unknown')

            goal_responses.append(FamilyGoalResponse(
                id=goal.id,
                parent_id=goal.parent_id,
                child_id=goal.child_id,
                child_name=child_name,
                title=goal.title,
                description=goal.description,
                category=goal.category,
                progress_percentage=float(goal.progress_percentage or 0),
                status=goal.status,
                target_date=goal.target_date,
                is_ai_suggested=goal.is_ai_suggested,
                ai_metadata=goal.ai_metadata,
                created_at=goal.created_at,
                updated_at=goal.updated_at
            ))

            if goal.status == 'active':
                active_count += 1
            elif goal.status == 'completed':
                completed_count += 1

        return GoalsListResponse(
            goals=goal_responses,
            total_count=len(goal_responses),
            active_count=active_count,
            completed_count=completed_count
        )


# Global instance
parent_children_service = ParentChildrenService()
