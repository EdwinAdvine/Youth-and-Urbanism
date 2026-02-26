"""
Parent AI Insights Service

Business logic for AI companion insights.
Integrates with AI orchestrator for personalized insights.
"""

import logging
from typing import List, Optional
from datetime import datetime, timedelta
from uuid import UUID
from sqlalchemy import select, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User, Student, AITutor, AIAlert
from app.schemas.parent.ai_insights_schemas import (
    AITutorSummary, ConversationSample, LearningStyleAnalysis,
    LearningStyleTrait, SupportTipsResponse, SupportTip,
    AIPlanningResponse, PlannedTopic, CuriosityPatternsResponse,
    CuriosityPattern, TopInterest, WarningSignsResponse, WarningSign,
    AlertsListResponse, AlertSummary, AlertDetailResponse,
    ParentCoachingResponse, CoachingModule, CoachingRecommendation
)
from app.services.ai_orchestrator import get_orchestrator

logger = logging.getLogger(__name__)


class ParentAIInsightsService:
    """Service for parent AI insights operations."""

    async def get_ai_tutor_summary(
        self,
        db: AsyncSession,
        parent_id: UUID,
        child_id: UUID
    ) -> AITutorSummary:
        """Get AI tutor summary for child."""

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

        # Get AI tutor
        tutor_result = await db.execute(
            select(AITutor).where(AITutor.student_id == child_id)
        )
        tutor = tutor_result.scalar_one_or_none()

        if not tutor:
            raise ValueError("AI tutor not found for this child")

        # Extract recent conversations
        recent_conversations = []
        if tutor.conversation_history:
            conversations = tutor.conversation_history[-6:]  # Last 6 messages (3 exchanges)
            for i in range(0, len(conversations) - 1, 2):
                if i + 1 < len(conversations):
                    recent_conversations.append(ConversationSample(
                        timestamp=datetime.fromisoformat(conversations[i].get('timestamp', datetime.utcnow().isoformat())),
                        student_message=conversations[i].get('content', ''),
                        ai_response=conversations[i + 1].get('content', ''),
                        topic=conversations[i].get('topic')
                    ))

        # Get learning path
        learning_path = tutor.learning_path or {}
        current_topic = learning_path.get('current_topic')
        completed_topics = learning_path.get('completed_topics', [])
        recent_topics = completed_topics[-5:] if completed_topics else []

        # Get performance metrics
        performance = tutor.performance_metrics or {}
        strengths = performance.get('strengths', [])
        improvements = performance.get('areas_for_improvement', [])
        progress_rate = performance.get('progress_rate', 0.7)

        # Determine engagement level
        engagement_level = 'medium'
        if progress_rate >= 0.8:
            engagement_level = 'high'
        elif progress_rate < 0.5:
            engagement_level = 'low'

        # Generate AI summary using orchestrator
        try:
            prompt = f"""Provide a parent-friendly summary of {child.user.profile_data.get('full_name', 'the child')}'s learning with their AI tutor.
Total interactions: {tutor.total_interactions}
Current topic: {current_topic}
Strengths: {', '.join(strengths)}
Progress rate: {progress_rate:.0%}
Keep it encouraging and actionable for parents (2-3 sentences)."""

            orchestrator = await get_orchestrator(db)
            ai_response = await orchestrator.chat(
                task_type="general",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200
            )

            summary = ai_response.get('message', 'Your child is making steady progress with their AI tutor.')
            parent_explanation = summary
        except Exception as e:
            logger.error(f"AI summary generation failed: {e}")
            summary = 'Your child is making steady progress with their AI tutor.'
            parent_explanation = 'The AI tutor adapts to your child\'s learning style and pace.'

        return AITutorSummary(
            student_id=child.id,
            student_name=child.user.profile_data.get('full_name', 'Unknown') if child.user else 'Unknown',
            ai_tutor_name=tutor.tutor_name,
            total_interactions=tutor.total_interactions or 0,
            last_interaction=tutor.last_interaction,
            current_topic=current_topic,
            recent_topics=recent_topics,
            strengths=strengths,
            areas_for_improvement=improvements,
            engagement_level=engagement_level,
            progress_rate=progress_rate,
            recent_conversations=recent_conversations,
            summary=summary,
            parent_friendly_explanation=parent_explanation
        )

    async def get_learning_style_analysis(
        self,
        db: AsyncSession,
        parent_id: UUID,
        child_id: UUID
    ) -> LearningStyleAnalysis:
        """Get learning style analysis for child."""

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

        # Get learning profile
        learning_profile = child.learning_profile or {}
        primary_style = learning_profile.get('learning_style', 'visual')

        # Build traits (simplified - would use AI analysis in production)
        traits = [
            LearningStyleTrait(
                trait_name="Visual Learning",
                score=0.85 if primary_style == 'visual' else 0.4,
                description="Learns best through images, diagrams, and visual aids",
                examples=["Charts", "Diagrams", "Videos", "Infographics"]
            ),
            LearningStyleTrait(
                trait_name="Auditory Learning",
                score=0.75 if primary_style == 'auditory' else 0.3,
                description="Learns best through listening and verbal instruction",
                examples=["Discussions", "Podcasts", "Audio books", "Verbal explanations"]
            ),
            LearningStyleTrait(
                trait_name="Kinesthetic Learning",
                score=0.80 if primary_style == 'kinesthetic' else 0.35,
                description="Learns best through hands-on activities and movement",
                examples=["Experiments", "Building models", "Role-playing", "Physical activities"]
            ),
            LearningStyleTrait(
                trait_name="Self-Directed",
                score=0.70,
                description="Prefers independent learning and exploration",
                examples=["Research projects", "Self-paced courses", "Personal interests"]
            )
        ]

        # Preferred activities based on style
        activity_map = {
            'visual': ["Drawing", "Mind mapping", "Video lessons", "Flashcards"],
            'auditory': ["Group discussions", "Verbal quizzes", "Audio recordings", "Storytelling"],
            'kinesthetic': ["Hands-on projects", "Lab experiments", "Field trips", "Building activities"]
        }

        preferred_activities = activity_map.get(primary_style, [])

        # Recommendations
        recommendations = [
            f"Use {primary_style} learning materials when possible",
            "Mix learning styles to reinforce understanding",
            "Create a dedicated learning space at home",
            "Maintain consistent learning routines"
        ]

        return LearningStyleAnalysis(
            student_id=child.id,
            student_name=child.user.profile_data.get('full_name', 'Unknown') if child.user else 'Unknown',
            primary_style=primary_style,
            confidence=0.82,
            traits=traits,
            preferred_activities=preferred_activities,
            optimal_learning_times=["Morning (9-11 AM)", "Early afternoon (2-4 PM)"],
            attention_span_minutes=25,
            analysis=f"Your child is primarily a {primary_style} learner, which means they learn best through {primary_style}-based activities.",
            recommendations_for_parents=recommendations
        )

    async def get_support_tips(
        self,
        db: AsyncSession,
        parent_id: UUID,
        child_id: UUID
    ) -> SupportTipsResponse:
        """Get practical home support tips."""

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

        # Generate support tips
        tips = [
            SupportTip(
                category="academic",
                title="Create a Dedicated Learning Space",
                description="Set up a quiet, well-lit area specifically for learning activities",
                action_steps=[
                    "Choose a quiet corner with minimal distractions",
                    "Ensure good lighting and comfortable seating",
                    "Keep learning materials organized and accessible",
                    "Remove digital distractions during study time"
                ],
                expected_outcome="Improved focus and learning efficiency",
                difficulty="easy"
            ),
            SupportTip(
                category="emotional",
                title="Celebrate Small Wins",
                description="Acknowledge progress and effort, not just results",
                action_steps=[
                    "Notice when your child shows improvement",
                    "Praise specific efforts and strategies",
                    "Create a progress journal together",
                    "Share successes with family members"
                ],
                expected_outcome="Increased motivation and confidence",
                difficulty="easy"
            ),
            SupportTip(
                category="practical",
                title="Establish Learning Routines",
                description="Consistent schedules help build positive learning habits",
                action_steps=[
                    "Set regular learning times each day",
                    "Include breaks and physical activity",
                    "Review the day's learning at dinner",
                    "Prepare materials the night before"
                ],
                expected_outcome="Better time management and consistency",
                difficulty="moderate"
            ),
            SupportTip(
                category="motivational",
                title="Connect Learning to Real Life",
                description="Help your child see practical applications of what they're learning",
                action_steps=[
                    "Discuss how math is used in cooking or shopping",
                    "Point out science in everyday phenomena",
                    "Relate history to current events",
                    "Encourage questions about the world"
                ],
                expected_outcome="Increased engagement and curiosity",
                difficulty="moderate"
            )
        ]

        return SupportTipsResponse(
            student_id=child.id,
            student_name=child.user.profile_data.get('full_name', 'Unknown') if child.user else 'Unknown',
            tips=tips,
            this_week_focus="Building consistent learning routines and celebrating progress",
            priority_actions=[
                "Set up a dedicated learning space",
                "Establish daily learning time",
                "Acknowledge at least one achievement daily"
            ],
            recommended_resources=[
                {"title": "Parent Guide to CBC", "url": "/resources/cbc-guide"},
                {"title": "Learning at Home Tips", "url": "/resources/home-learning"}
            ]
        )

    async def get_ai_planning(
        self,
        db: AsyncSession,
        parent_id: UUID,
        child_id: UUID
    ) -> AIPlanningResponse:
        """Get topics AI is planning for child."""

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

        # Get AI tutor learning path
        tutor_result = await db.execute(
            select(AITutor).where(AITutor.student_id == child_id)
        )
        tutor = tutor_result.scalar_one_or_none()

        upcoming_topics = []
        if tutor and tutor.learning_path:
            upcoming_list = tutor.learning_path.get('upcoming_topics', [])
            for i, topic_name in enumerate(upcoming_list[:5]):
                upcoming_topics.append(PlannedTopic(
                    topic_name=topic_name,
                    subject_area="Mathematics" if "math" in topic_name.lower() else "General",
                    estimated_start=f"In {i + 1} weeks" if i > 0 else "Next week",
                    duration_estimate="1-2 weeks",
                    difficulty_level="appropriate",
                    prerequisites_met=True,
                    learning_objectives=[
                        f"Understand {topic_name} concepts",
                        f"Apply {topic_name} in practice",
                        f"Master {topic_name} fundamentals"
                    ]
                ))

        return AIPlanningResponse(
            student_id=child.id,
            student_name=child.user.profile_data.get('full_name', 'Unknown') if child.user else 'Unknown',
            upcoming_topics=upcoming_topics,
            learning_trajectory="Progressing well through curriculum",
            pacing="on-track",
            planning_rationale="The AI tutor sequences topics based on your child's mastery and readiness.",
            parent_involvement_opportunities=[
                "Discuss new topics at family meals",
                "Ask your child to explain what they learned",
                "Provide real-world examples of concepts",
                "Encourage questions and curiosity"
            ]
        )

    async def get_curiosity_patterns(
        self,
        db: AsyncSession,
        parent_id: UUID,
        child_id: UUID
    ) -> CuriosityPatternsResponse:
        """Get child's curiosity patterns analysis."""

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

        # Build patterns (simplified)
        patterns = [
            CuriosityPattern(
                pattern_type="questions",
                description="Asks 'why' and 'how' questions frequently",
                frequency="daily",
                examples=[
                    "Why does the sun shine?",
                    "How do plants grow?",
                    "What makes clouds move?"
                ],
                significance="Shows deep curiosity about natural phenomena"
            ),
            CuriosityPattern(
                pattern_type="exploration",
                description="Seeks additional information beyond lessons",
                frequency="weekly",
                examples=[
                    "Researches topics independently",
                    "Asks for more practice problems",
                    "Explores related concepts"
                ],
                significance="Demonstrates intrinsic motivation to learn"
            )
        ]

        # Top interests
        interests = child.learning_profile.get('interests', []) if child.learning_profile else []
        top_interests = [
            TopInterest(
                interest_name=interest,
                engagement_score=0.85,
                related_topics=[f"{interest} basics", f"Advanced {interest}"],
                time_spent_percentage=20.0,
                trending="up"
            )
            for interest in interests[:3]
        ]

        return CuriosityPatternsResponse(
            student_id=child.id,
            student_name=child.user.profile_data.get('full_name', 'Unknown') if child.user else 'Unknown',
            patterns=patterns,
            top_interests=top_interests,
            most_common_questions=["Why?", "How does this work?", "What happens if...?"],
            question_complexity_trend="increasing",
            analysis="Your child shows healthy curiosity and asks increasingly sophisticated questions.",
            nurturing_suggestions=[
                "Answer questions with enthusiasm",
                "Encourage hands-on exploration",
                "Provide age-appropriate books on topics of interest",
                "Visit museums or educational sites together"
            ]
        )

    async def get_warning_signs(
        self,
        db: AsyncSession,
        parent_id: UUID,
        child_id: UUID
    ) -> WarningSignsResponse:
        """Get early warning signs analysis."""

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

        # Get recent critical/warning alerts
        alerts_result = await db.execute(
            select(AIAlert).where(
                and_(
                    AIAlert.child_id == child_id,
                    AIAlert.severity.in_(['warning', 'critical']),
                    AIAlert.is_dismissed == False
                )
            ).order_by(desc(AIAlert.created_at)).limit(5)
        )
        alerts = alerts_result.scalars().all()

        # Convert alerts to warnings
        active_warnings = []
        for alert in alerts:
            active_warnings.append(WarningSign(
                warning_type=alert.alert_type,
                severity='high' if alert.severity == 'critical' else 'medium',
                indicator=alert.title,
                description=alert.message,
                first_detected=alert.created_at,
                trend='stable',
                context_data={},
                immediate_actions=[alert.ai_recommendation] if alert.ai_recommendation else [],
                monitoring_plan="Continue observing and check back in 1 week"
            ))

        # Overall risk assessment
        overall_risk = 'low'
        if len([w for w in active_warnings if w.severity == 'high']) > 0:
            overall_risk = 'high'
        elif len(active_warnings) > 2:
            overall_risk = 'medium'

        return WarningSignsResponse(
            student_id=child.id,
            student_name=child.user.profile_data.get('full_name', 'Unknown') if child.user else 'Unknown',
            active_warnings=active_warnings,
            overall_risk_level=overall_risk,
            risk_factors=["Engagement fluctuation"] if active_warnings else [],
            protective_factors=["Consistent attendance", "Supportive home environment", "Age-appropriate curriculum"],
            assessment="Overall, your child is progressing well. Monitor the items above and reach out if you have concerns.",
            intervention_recommendations=[
                "Maintain open communication with your child",
                "Celebrate small successes",
                "Contact support if concerns persist"
            ],
            next_review_date=datetime.utcnow() + timedelta(days=7)
        )

    async def get_alerts_list(
        self,
        db: AsyncSession,
        parent_id: UUID,
        child_id: Optional[UUID] = None,
        severity: Optional[str] = None,
        is_read: Optional[bool] = None
    ) -> AlertsListResponse:
        """Get list of AI alerts."""

        query = select(AIAlert).where(AIAlert.parent_id == parent_id)

        if child_id:
            query = query.where(AIAlert.child_id == child_id)
        if severity:
            query = query.where(AIAlert.severity == severity)
        if is_read is not None:
            query = query.where(AIAlert.is_read == is_read)

        query = query.where(AIAlert.is_dismissed == False)
        query = query.order_by(desc(AIAlert.created_at))

        result = await db.execute(query)
        alerts = result.scalars().all()

        # Build summaries
        summaries = []
        for alert in alerts:
            child_name = None
            if alert.child_id:
                child_result = await db.execute(
                    select(Student).where(Student.id == alert.child_id)
                )
                child = child_result.scalar_one_or_none()
                if child and child.user:
                    child_name = child.user.profile_data.get('full_name', 'Unknown')

            summaries.append(AlertSummary(
                id=alert.id,
                alert_type=alert.alert_type,
                severity=alert.severity,
                title=alert.title,
                message=alert.message,
                child_id=alert.child_id,
                child_name=child_name or 'Unknown',
                created_at=alert.created_at,
                is_read=alert.is_read,
                is_dismissed=alert.is_dismissed,
                action_url=alert.action_url
            ))

        unread_count = sum(1 for s in summaries if not s.is_read)
        critical_count = sum(1 for s in summaries if s.severity == 'critical')

        return AlertsListResponse(
            alerts=summaries,
            total_count=len(summaries),
            unread_count=unread_count,
            critical_count=critical_count
        )


# Global instance
parent_ai_insights_service = ParentAIInsightsService()
