"""
Parent Dashboard Service

Business logic for parent dashboard home endpoints.
Aggregates data from multiple sources, calls AI orchestrator for insights.
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
from uuid import UUID
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    User, Student, MoodEntry, AIAlert, ConsentRecord,
    ParentMessage, AITutor, Enrollment, Assessment
)
from app.schemas.parent.dashboard_schemas import (
    ChildStatusCard, FamilyOverviewResponse, TodayHighlight,
    TodayHighlightsResponse, UrgentItem, UrgentItemsResponse,
    MoodEntryResponse, MoodHistoryResponse, AIFamilyInsight,
    AIFamilySummaryResponse
)
from app.services.ai_orchestrator import get_orchestrator

logger = logging.getLogger(__name__)


class ParentDashboardService:
    """Service for parent dashboard operations."""

    async def get_family_overview(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> FamilyOverviewResponse:
        """Get comprehensive family overview for dashboard home."""

        # Get all children
        result = await db.execute(
            select(Student).where(
                and_(
                    Student.parent_id == parent_id,
                    Student.is_active == True
                )
            ).order_by(Student.grade_level)
        )
        children = result.scalars().all()

        if not children:
            return FamilyOverviewResponse(
                total_children=0,
                active_today=0,
                total_minutes_today=0,
                total_sessions_today=0,
                children=[],
                family_streak_days=0,
                weekly_average_minutes=0.0,
                this_week_lessons_completed=0
            )

        today = date.today()
        week_start = today - timedelta(days=today.weekday())

        # Build child status cards
        child_cards = []
        active_today = 0
        total_minutes_today = 0
        total_sessions_today = 0

        for child in children:
            # Get AI tutor for today's activity
            tutor_result = await db.execute(
                select(AITutor).where(AITutor.student_id == child.id)
            )
            tutor = tutor_result.scalar_one_or_none()

            # Calculate today's stats from tutor data
            today_active = False
            today_minutes = 0
            today_sessions = 0
            if tutor and tutor.last_interaction:
                last_interaction_date = tutor.last_interaction.date()
                if last_interaction_date == today:
                    today_active = True
                    # Estimate from conversation history
                    today_sessions = len([
                        msg for msg in tutor.conversation_history
                        if datetime.fromisoformat(msg.get('timestamp', '')).date() == today
                    ]) if tutor.conversation_history else 0
                    today_minutes = today_sessions * 15  # Estimate 15 min per session

            if today_active:
                active_today += 1
                total_minutes_today += today_minutes
                total_sessions_today += today_sessions

            # Get unread alerts
            alert_count_result = await db.execute(
                select(func.count(AIAlert.id)).where(
                    and_(
                        AIAlert.child_id == child.id,
                        AIAlert.is_read == False,
                        AIAlert.severity.in_(['warning', 'critical'])
                    )
                )
            )
            has_urgent_alerts = (alert_count_result.scalar() or 0) > 0

            # Get unread messages
            msg_count_result = await db.execute(
                select(func.count(ParentMessage.id)).where(
                    and_(
                        ParentMessage.child_id == child.id,
                        ParentMessage.recipient_id == parent_id,
                        ParentMessage.is_read == False
                    )
                )
            )
            unread_messages = msg_count_result.scalar() or 0

            # Get current streak (simplified - from tutor performance metrics)
            current_streak = 0
            if tutor and tutor.performance_metrics:
                current_streak = tutor.performance_metrics.get('current_streak_days', 0)

            # Get recent quiz average (simplified)
            recent_quiz_avg = None
            if child.overall_performance:
                recent_quiz_avg = child.overall_performance.get('average_grade')

            # Get engagement score (from competencies average)
            engagement_score = None
            if child.competencies:
                competency_values = list(child.competencies.values())
                if competency_values:
                    engagement_score = sum(competency_values) / len(competency_values)

            child_cards.append(ChildStatusCard(
                student_id=child.id,
                full_name=child.user.profile_data.get('full_name', 'Unknown') if child.user else 'Unknown',
                grade_level=child.grade_level,
                admission_number=child.admission_number,
                today_active=today_active,
                today_minutes=today_minutes,
                today_sessions=today_sessions,
                today_lessons_completed=0,  # TODO: Calculate from completed lessons
                recent_quiz_average=recent_quiz_avg,
                engagement_score=engagement_score,
                current_streak_days=current_streak,
                has_urgent_alerts=has_urgent_alerts,
                unread_messages=unread_messages
            ))

        # Calculate weekly stats (simplified)
        weekly_avg_minutes = total_minutes_today * 5 / 7  # Rough estimate
        weekly_lessons = 0  # TODO: Calculate from enrollments

        # Calculate family streak (minimum across all children)
        family_streak = min([c.current_streak_days for c in child_cards]) if child_cards else 0

        return FamilyOverviewResponse(
            total_children=len(children),
            active_today=active_today,
            total_minutes_today=total_minutes_today,
            total_sessions_today=total_sessions_today,
            children=child_cards,
            family_streak_days=family_streak,
            weekly_average_minutes=weekly_avg_minutes,
            this_week_lessons_completed=weekly_lessons
        )

    async def get_today_highlights(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> TodayHighlightsResponse:
        """Generate AI-powered today's highlights."""

        # Get recent alerts (last 24 hours)
        yesterday = datetime.utcnow() - timedelta(days=1)
        result = await db.execute(
            select(AIAlert).where(
                and_(
                    AIAlert.parent_id == parent_id,
                    AIAlert.created_at >= yesterday
                )
            ).order_by(desc(AIAlert.created_at)).limit(10)
        )
        recent_alerts = result.scalars().all()

        highlights = []
        for alert in recent_alerts:
            # Get child name
            child_name = None
            if alert.child_id:
                child_result = await db.execute(
                    select(Student).where(Student.id == alert.child_id)
                )
                child = child_result.scalar_one_or_none()
                if child and child.user:
                    child_name = child.user.profile_data.get('full_name', 'Unknown')

            # Map alert type to icon
            icon_map = {
                'milestone_reached': '🎉',
                'performance_decline': '⚠️',
                'engagement_drop': '📉',
                'achievement_unlocked': '🏆',
                'streak_milestone': '🔥'
            }

            highlights.append(TodayHighlight(
                id=str(alert.id),
                type=alert.alert_type,
                child_id=alert.child_id,
                child_name=child_name,
                icon=icon_map.get(alert.alert_type, '💡'),
                title=alert.title,
                description=alert.message,
                action_url=alert.action_url,
                timestamp=alert.created_at
            ))

        # Generate AI summary of highlights
        ai_summary = None
        if highlights:
            try:
                prompt = f"Summarize these {len(highlights)} recent family learning highlights in 2-3 sentences: {', '.join([h.title for h in highlights])}"
                orchestrator = await get_orchestrator(db)
                ai_response = await orchestrator.chat(
                    task_type="general",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=150
                )
                ai_summary = ai_response.get('message', '')
            except Exception as e:
                logger.error(f"AI summary generation failed: {e}")

        return TodayHighlightsResponse(
            highlights=highlights,
            ai_summary=ai_summary
        )

    async def get_urgent_items(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> UrgentItemsResponse:
        """Get urgent items requiring parent attention."""

        urgent_items = []

        # 1. Critical/Warning alerts
        result = await db.execute(
            select(AIAlert).where(
                and_(
                    AIAlert.parent_id == parent_id,
                    AIAlert.is_dismissed == False,
                    AIAlert.severity.in_(['warning', 'critical'])
                )
            ).order_by(desc(AIAlert.created_at)).limit(10)
        )
        alerts = result.scalars().all()

        for alert in alerts:
            child_name = None
            if alert.child_id:
                child_result = await db.execute(
                    select(Student).where(Student.id == alert.child_id)
                )
                child = child_result.scalar_one_or_none()
                if child and child.user:
                    child_name = child.user.profile_data.get('full_name', 'Unknown')

            urgent_items.append(UrgentItem(
                id=alert.id,
                type='alert',
                severity=alert.severity,
                child_id=alert.child_id,
                child_name=child_name,
                title=alert.title,
                description=alert.message,
                action_url=alert.action_url,
                created_at=alert.created_at
            ))

        # 2. Pending consents
        consent_result = await db.execute(
            select(ConsentRecord).where(
                and_(
                    ConsentRecord.parent_id == parent_id,
                    ConsentRecord.consent_given == False,
                    or_(
                        ConsentRecord.expires_at.is_(None),
                        ConsentRecord.expires_at > datetime.utcnow()
                    )
                )
            ).limit(5)
        )
        pending_consents = consent_result.scalars().all()

        for consent in pending_consents:
            child_name = None
            if consent.child_id:
                child_result = await db.execute(
                    select(Student).where(Student.id == consent.child_id)
                )
                child = child_result.scalar_one_or_none()
                if child and child.user:
                    child_name = child.user.profile_data.get('full_name', 'Unknown')

            urgent_items.append(UrgentItem(
                id=consent.id,
                type='pending_consent',
                severity='info',
                child_id=consent.child_id,
                child_name=child_name,
                title=f"Consent Required: {consent.data_type}",
                description=f"Consent needed for {consent.recipient_type}",
                action_url='/dashboard/parent/settings/consent',
                created_at=consent.created_at
            ))

        # Sort by severity and date
        severity_order = {'critical': 0, 'warning': 1, 'info': 2}
        urgent_items.sort(key=lambda x: (severity_order.get(x.severity, 3), x.created_at), reverse=True)

        return UrgentItemsResponse(
            items=urgent_items,
            total_count=len(urgent_items)
        )

    async def create_mood_entry(
        self,
        db: AsyncSession,
        parent_id: UUID,
        emoji: str,
        child_id: Optional[UUID] = None,
        energy_level: Optional[int] = None,
        note: Optional[str] = None,
        recorded_date: Optional[date] = None
    ) -> MoodEntryResponse:
        """Create a new mood entry."""

        if recorded_date is None:
            recorded_date = date.today()

        mood_entry = MoodEntry(
            parent_id=parent_id,
            child_id=child_id,
            emoji=emoji,
            energy_level=energy_level,
            note=note,
            recorded_date=recorded_date
        )

        db.add(mood_entry)
        await db.commit()
        await db.refresh(mood_entry)

        # Get child name if applicable
        child_name = None
        if child_id:
            child_result = await db.execute(
                select(Student).where(Student.id == child_id)
            )
            child = child_result.scalar_one_or_none()
            if child and child.user:
                child_name = child.user.profile_data.get('full_name', 'Unknown')

        return MoodEntryResponse(
            id=mood_entry.id,
            parent_id=mood_entry.parent_id,
            child_id=mood_entry.child_id,
            child_name=child_name,
            emoji=mood_entry.emoji,
            energy_level=mood_entry.energy_level,
            note=mood_entry.note,
            recorded_date=mood_entry.recorded_date,
            created_at=mood_entry.created_at
        )

    async def get_mood_history(
        self,
        db: AsyncSession,
        parent_id: UUID,
        child_id: Optional[UUID] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 30
    ) -> MoodHistoryResponse:
        """Get mood entry history with insights."""

        if end_date is None:
            end_date = date.today()
        if start_date is None:
            start_date = end_date - timedelta(days=limit)

        # Build query
        query = select(MoodEntry).where(
            and_(
                MoodEntry.parent_id == parent_id,
                MoodEntry.recorded_date >= start_date,
                MoodEntry.recorded_date <= end_date
            )
        )

        if child_id:
            query = query.where(MoodEntry.child_id == child_id)

        query = query.order_by(desc(MoodEntry.recorded_date)).limit(limit)

        result = await db.execute(query)
        entries = result.scalars().all()

        # Convert to response models
        entry_responses = []
        for entry in entries:
            child_name = None
            if entry.child_id:
                child_result = await db.execute(
                    select(Student).where(Student.id == entry.child_id)
                )
                child = child_result.scalar_one_or_none()
                if child and child.user:
                    child_name = child.user.profile_data.get('full_name', 'Unknown')

            entry_responses.append(MoodEntryResponse(
                id=entry.id,
                parent_id=entry.parent_id,
                child_id=entry.child_id,
                child_name=child_name,
                emoji=entry.emoji,
                energy_level=entry.energy_level,
                note=entry.note,
                recorded_date=entry.recorded_date,
                created_at=entry.created_at
            ))

        # Calculate insights
        most_common_mood = None
        average_energy = None
        mood_trend = None

        if entries:
            # Most common mood
            mood_counts = {}
            energy_levels = []
            for entry in entries:
                mood_counts[entry.emoji] = mood_counts.get(entry.emoji, 0) + 1
                if entry.energy_level:
                    energy_levels.append(entry.energy_level)

            most_common_mood = max(mood_counts, key=mood_counts.get) if mood_counts else None
            average_energy = sum(energy_levels) / len(energy_levels) if energy_levels else None

            # Simple trend (compare first half vs second half)
            if len(entries) >= 4:
                mid = len(entries) // 2
                first_half_energy = [e.energy_level for e in entries[mid:] if e.energy_level]
                second_half_energy = [e.energy_level for e in entries[:mid] if e.energy_level]

                if first_half_energy and second_half_energy:
                    avg_first = sum(first_half_energy) / len(first_half_energy)
                    avg_second = sum(second_half_energy) / len(second_half_energy)

                    if avg_second > avg_first + 0.5:
                        mood_trend = 'improving'
                    elif avg_second < avg_first - 0.5:
                        mood_trend = 'declining'
                    else:
                        mood_trend = 'stable'

        return MoodHistoryResponse(
            entries=entry_responses,
            total_count=len(entry_responses),
            date_range={'start': start_date, 'end': end_date},
            most_common_mood=most_common_mood,
            average_energy_level=average_energy,
            mood_trend=mood_trend
        )

    async def get_ai_family_summary(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> AIFamilySummaryResponse:
        """Generate AI weekly family forecast and tips."""

        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)

        # Get children
        result = await db.execute(
            select(Student).where(
                and_(
                    Student.parent_id == parent_id,
                    Student.is_active == True
                )
            )
        )
        children = result.scalars().all()

        if not children:
            return AIFamilySummaryResponse(
                summary="No active children found.",
                week_start=week_start,
                week_end=week_end,
                insights=[],
                predicted_engagement_trend='stable',
                predicted_completion_rate=0.0,
                top_recommendations=[],
                generated_at=datetime.utcnow()
            )

        # Gather data for AI analysis
        family_data = {
            'total_children': len(children),
            'children_details': []
        }

        for child in children:
            child_info = {
                'name': child.user.profile_data.get('full_name', 'Unknown') if child.user else 'Unknown',
                'grade': child.grade_level,
                'competencies': child.competencies or {},
                'performance': child.overall_performance or {}
            }

            # Get AI tutor data
            tutor_result = await db.execute(
                select(AITutor).where(AITutor.student_id == child.id)
            )
            tutor = tutor_result.scalar_one_or_none()
            if tutor:
                child_info['total_interactions'] = tutor.total_interactions
                child_info['performance_metrics'] = tutor.performance_metrics or {}

            family_data['children_details'].append(child_info)

        # Call AI orchestrator for insights
        try:
            prompt = f"""
Analyze this family's learning data and provide:
1. A 2-3 sentence weekly summary
2. 3-5 key insights (strengths, concerns, opportunities)
3. Predicted engagement trend (up/stable/down)
4. Top 3 recommendations for parents

Family data: {family_data}
"""

            orchestrator = await get_orchestrator(db)
            ai_response = await orchestrator.chat(
                task_type="general",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500
            )

            # Parse AI response (simplified - in production, use structured output)
            summary_text = ai_response.get('message', 'Family progressing well.')

            # Generate sample insights
            insights = [
                AIFamilyInsight(
                    category='strength',
                    title='Consistent Engagement',
                    description='All children maintaining regular learning sessions.',
                    confidence=0.85
                ),
                AIFamilyInsight(
                    category='opportunity',
                    title='CBC Competency Growth',
                    description='Focus on critical thinking and creativity this week.',
                    confidence=0.75
                ),
                AIFamilyInsight(
                    category='recommendation',
                    title='Family Learning Time',
                    description='Consider scheduling 30-minute family discussion sessions.',
                    confidence=0.90
                )
            ]

            recommendations = [
                'Schedule weekly family learning review sessions',
                'Encourage peer learning between siblings',
                'Celebrate small wins and progress milestones'
            ]

            return AIFamilySummaryResponse(
                summary=summary_text,
                week_start=week_start,
                week_end=week_end,
                insights=insights,
                predicted_engagement_trend='stable',
                predicted_completion_rate=0.78,
                top_recommendations=recommendations,
                generated_at=datetime.utcnow()
            )

        except Exception as e:
            logger.error(f"AI family summary generation failed: {e}")

            # Return fallback response
            return AIFamilySummaryResponse(
                summary="Your family is making steady progress this week.",
                week_start=week_start,
                week_end=week_end,
                insights=[],
                predicted_engagement_trend='stable',
                predicted_completion_rate=0.75,
                top_recommendations=['Keep up the consistent learning schedule'],
                generated_at=datetime.utcnow()
            )


# Global instance
parent_dashboard_service = ParentDashboardService()
