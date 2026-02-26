"""
CoPilot Insights Service

Generates role-specific contextual insights, tips, and alerts for users.
Queries relevant database tables to surface actionable information tailored
to each user's role and current state.
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import List
from uuid import UUID

from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.copilot_schemas import CopilotInsight, CopilotInsightsResponse

logger = logging.getLogger(__name__)


class CopilotInsightsService:
    """
    Service for generating role-specific insights.

    Each role has a dedicated insight generator that queries the database
    for relevant, actionable information to display in the CoPilot sidebar.
    """

    async def get_insights(
        self,
        db: AsyncSession,
        user: User
    ) -> CopilotInsightsResponse:
        """Route to role-specific insight generator."""
        insights = []

        try:
            if user.role == 'student':
                insights = await self._student_insights(db, user)
            elif user.role == 'parent':
                insights = await self._parent_insights(db, user)
            elif user.role == 'instructor':
                insights = await self._instructor_insights(db, user)
            elif user.role == 'admin':
                insights = await self._admin_insights(db, user)
            elif user.role == 'staff':
                insights = await self._staff_insights(db, user)
            elif user.role == 'partner':
                insights = await self._partner_insights(db, user)
        except Exception as e:
            logger.error(f"Error generating insights for {user.role}: {str(e)}")
            # Return empty insights rather than failing
            insights = []

        return CopilotInsightsResponse(
            role=user.role,
            insights=insights,
            generated_at=datetime.now(timezone.utc)
        )

    async def _student_insights(self, db: AsyncSession, user: User) -> List[CopilotInsight]:
        """Generate insights for students."""
        insights = []

        try:
            # Get student record
            from app.models.student import Student
            stmt = select(Student).where(Student.user_id == user.id)
            result = await db.execute(stmt)
            student = result.scalar_one_or_none()

            if not student:
                return insights

            # Check for upcoming assignment deadlines
            from app.models.assessment import AssessmentSubmission, Assessment
            now = datetime.now(timezone.utc)
            upcoming_deadline = now + timedelta(days=3)

            # Find pending assignments due soon
            stmt = select(func.count()).select_from(Assessment).join(
                AssessmentSubmission,
                and_(
                    AssessmentSubmission.assessment_id == Assessment.id,
                    AssessmentSubmission.student_id == student.id
                ),
                isouter=True
            ).where(
                and_(
                    Assessment.due_date.between(now, upcoming_deadline),
                    AssessmentSubmission.id.is_(None)  # Not submitted
                )
            )
            result = await db.execute(stmt)
            pending_count = result.scalar() or 0

            if pending_count > 0:
                insights.append(CopilotInsight(
                    type="reminder",
                    title=f"{pending_count} assignment{'s' if pending_count > 1 else ''} due soon",
                    body=f"You have {pending_count} pending assignment{'s' if pending_count > 1 else ''} due in the next 3 days. Stay on track!",
                    priority=2,
                    action_url="/dashboard/student/assignments/due-soon",
                    metadata={"count": pending_count}
                ))

            # Check current streak
            from app.models.student_dashboard import StudentStreak
            stmt = select(StudentStreak).where(
                StudentStreak.student_id == student.id
            ).order_by(StudentStreak.updated_at.desc()).limit(1)
            result = await db.execute(stmt)
            streak = result.scalar_one_or_none()

            if streak and streak.current_streak >= 3:
                insights.append(CopilotInsight(
                    type="metric",
                    title=f"🔥 {streak.current_streak}-day streak!",
                    body=f"Amazing! You've been learning consistently for {streak.current_streak} days. Keep it up!",
                    priority=1,
                    action_url="/dashboard/student/progress/streaks",
                    metadata={"streak_days": streak.current_streak}
                ))

        except Exception as e:
            logger.error(f"Error in student insights: {str(e)}")

        # Always provide at least one tip
        if not insights:
            insights.append(CopilotInsight(
                type="tip",
                title="Ask me anything!",
                body="I can help with homework, explain concepts, or suggest study strategies.",
                priority=0,
                action_url=None,
                metadata={}
            ))

        return insights

    async def _parent_insights(self, db: AsyncSession, user: User) -> List[CopilotInsight]:
        """Generate insights for parents."""
        insights = []

        try:
            # Get children
            from app.models.student import Student
            stmt = select(Student).where(Student.parent_id == user.id)
            result = await db.execute(stmt)
            children = result.scalars().all()

            if children:
                # Check for children's recent performance
                insights.append(CopilotInsight(
                    type="tip",
                    title=f"Track {len(children)} child{'ren' if len(children) > 1 else ''}'s progress",
                    body=f"View detailed progress reports and support your child{'ren' if len(children) > 1 else ''}'s learning journey.",
                    priority=1,
                    action_url="/dashboard/parent/children",
                    metadata={"child_count": len(children)}
                ))

        except Exception as e:
            logger.error(f"Error in parent insights: {str(e)}")

        if not insights:
            insights.append(CopilotInsight(
                type="tip",
                title="Welcome to Parent Dashboard",
                body="I can help you understand your child's progress and support their learning.",
                priority=0,
                action_url=None,
                metadata={}
            ))

        return insights

    async def _instructor_insights(self, db: AsyncSession, user: User) -> List[CopilotInsight]:
        """Generate insights for instructors."""
        insights = []

        try:
            # Get instructor profile
            from app.models.instructor import InstructorProfile
            stmt = select(InstructorProfile).where(InstructorProfile.user_id == user.id)
            result = await db.execute(stmt)
            instructor = result.scalar_one_or_none()

            if instructor:
                # Check for pending submissions to review
                from app.models.assessment import AssessmentSubmission, Assessment
                from app.models.course import Course
                from app.models.enrollment import Enrollment

                # Count ungraded submissions for instructor's courses
                stmt = select(func.count()).select_from(AssessmentSubmission).join(
                    Assessment
                ).join(
                    Course
                ).where(
                    and_(
                        Course.instructor_id == instructor.id,
                        AssessmentSubmission.status == 'submitted',
                        AssessmentSubmission.grade.is_(None)
                    )
                )
                result = await db.execute(stmt)
                pending_count = result.scalar() or 0

                if pending_count > 0:
                    insights.append(CopilotInsight(
                        type="alert",
                        title=f"{pending_count} submission{'s' if pending_count > 1 else ''} to review",
                        body=f"You have {pending_count} student submission{'s' if pending_count > 1 else ''} waiting for grading.",
                        priority=2,
                        action_url="/dashboard/instructor/submissions",
                        metadata={"count": pending_count}
                    ))

        except Exception as e:
            logger.error(f"Error in instructor insights: {str(e)}")

        if not insights:
            insights.append(CopilotInsight(
                type="tip",
                title="Teaching Assistant Ready",
                body="I can help with lesson planning, CBC alignment, and student engagement strategies.",
                priority=0,
                action_url=None,
                metadata={}
            ))

        return insights

    async def _admin_insights(self, db: AsyncSession, user: User) -> List[CopilotInsight]:
        """Generate insights for admins."""
        insights = []

        try:
            # Get recent user registrations (last 7 days)
            from app.models.user import User as UserModel
            week_ago = datetime.now(timezone.utc) - timedelta(days=7)
            stmt = select(func.count()).select_from(UserModel).where(
                UserModel.created_at >= week_ago
            )
            result = await db.execute(stmt)
            new_users = result.scalar() or 0

            if new_users > 0:
                insights.append(CopilotInsight(
                    type="metric",
                    title=f"{new_users} new user{'s' if new_users > 1 else ''} this week",
                    body=f"Platform growth: {new_users} user{'s' if new_users > 1 else ''} joined in the last 7 days.",
                    priority=1,
                    action_url="/dashboard/admin/users",
                    metadata={"count": new_users}
                ))

        except Exception as e:
            logger.error(f"Error in admin insights: {str(e)}")

        if not insights:
            insights.append(CopilotInsight(
                type="tip",
                title="Admin Dashboard Active",
                body="I can help with platform analytics, user management, and system insights.",
                priority=0,
                action_url=None,
                metadata={}
            ))

        return insights

    async def _staff_insights(self, db: AsyncSession, user: User) -> List[CopilotInsight]:
        """Generate insights for staff."""
        insights = []

        try:
            # Check open support tickets
            from app.models.staff import StaffTicket
            stmt = select(func.count()).select_from(StaffTicket).where(
                StaffTicket.status.in_(['open', 'in_progress'])
            )
            result = await db.execute(stmt)
            open_tickets = result.scalar() or 0

            if open_tickets > 0:
                insights.append(CopilotInsight(
                    type="alert",
                    title=f"{open_tickets} open ticket{'s' if open_tickets > 1 else ''}",
                    body=f"{open_tickets} support ticket{'s' if open_tickets > 1 else ''} need{'s' if open_tickets == 1 else ''} attention.",
                    priority=2,
                    action_url="/dashboard/staff/support/tickets",
                    metadata={"count": open_tickets}
                ))

        except Exception as e:
            logger.error(f"Error in staff insights: {str(e)}")

        if not insights:
            insights.append(CopilotInsight(
                type="tip",
                title="Staff Operations Ready",
                body="I can help with support workflows, content review, and student journey analysis.",
                priority=0,
                action_url=None,
                metadata={}
            ))

        return insights

    async def _partner_insights(self, db: AsyncSession, user: User) -> List[CopilotInsight]:
        """Generate insights for partners."""
        insights = []

        try:
            # Get partner profile
            from app.models.partner import PartnerProfile, SponsoredChild
            stmt = select(PartnerProfile).where(PartnerProfile.user_id == user.id)
            result = await db.execute(stmt)
            partner = result.scalar_one_or_none()

            if partner:
                # Count sponsored children
                stmt = select(func.count()).select_from(SponsoredChild).where(
                    and_(
                        SponsoredChild.partner_id == partner.id,
                        SponsoredChild.status == 'active'
                    )
                )
                result = await db.execute(stmt)
                sponsored_count = result.scalar() or 0

                if sponsored_count > 0:
                    insights.append(CopilotInsight(
                        type="metric",
                        title=f"Sponsoring {sponsored_count} child{'ren' if sponsored_count > 1 else ''}",
                        body=f"Your partnership is supporting {sponsored_count} student{'s' if sponsored_count > 1 else ''}'s education.",
                        priority=1,
                        action_url="/dashboard/partner/sponsored-children",
                        metadata={"count": sponsored_count}
                    ))

        except Exception as e:
            logger.error(f"Error in partner insights: {str(e)}")

        if not insights:
            insights.append(CopilotInsight(
                type="tip",
                title="Partnership Dashboard",
                body="I can help with sponsorship programs, impact reports, and collaboration opportunities.",
                priority=0,
                action_url=None,
                metadata={}
            ))

        return insights
