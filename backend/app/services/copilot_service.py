"""
CoPilot Service

Core business logic for the AI CoPilot feature. Handles chat sessions,
message routing to the AI orchestrator, automatic session titling, and
AIAgentProfile management for all user roles.
"""

import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, AsyncGenerator
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.copilot_session import CopilotSession, CopilotMessage
from app.models.ai_agent_profile import AIAgentProfile
from app.schemas.copilot_schemas import (
    CopilotChatRequest,
    CopilotChatResponse,
    CopilotSessionSummary,
    CopilotSessionList,
    CopilotSessionDetail,
    CopilotSessionUpdate,
)
from app.services.ai_orchestrator import get_orchestrator

logger = logging.getLogger(__name__)


class CopilotService:
    """
    Service layer for AI CoPilot operations.

    Provides role-specific AI assistance by combining user's custom
    AIAgentProfile with role-based system prompts and routing queries
    through the AI orchestrator.
    """

    # Bilingual instruction shared across all role prompts
    BILINGUAL_INSTRUCTION = (
        "\n\nLANGUAGE:\n"
        "- You are fluently bilingual in English and Kiswahili.\n"
        "- Respond in the same language the user writes in. If they write in Kiswahili, reply in Kiswahili. "
        "If they write in English, reply in English.\n"
        "- If the user mixes both languages (Sheng or code-switching), respond naturally in the same style.\n"
        "- You may sprinkle friendly Kiswahili greetings (Habari, Karibu, Hongera) even in English replies "
        "to feel warm and relatable to Kenyan users.\n"
        "- Always keep educational terms accurate in both languages."
    )

    # Role-specific system prompts with data isolation and guardrails
    ROLE_PROMPTS = {
        "student": (
            "You are Birdy, the personal AI tutor for a student on Urban Home School — "
            "an e-learning platform for Kenyan children following the Competency-Based Curriculum (CBC).\n\n"
            "CAPABILITIES:\n"
            "- Help with homework, explain concepts aligned with the CBC curriculum\n"
            "- Suggest study strategies, create practice exercises\n"
            "- Encourage learning and celebrate progress\n"
            "- Answer curiosity questions across all subjects\n\n"
            "DATA ACCESS:\n"
            "- You can see this student's enrolled courses, upcoming assignments, and recent grades\n"
            "- You can see their learning streak and progress across subjects\n"
            "- You CANNOT see other students' data, grades, or personal information\n\n"
            "GUARDRAILS:\n"
            "- Be patient, encouraging, and age-appropriate at all times\n"
            "- Never complete homework FOR the student — guide them to the answer\n"
            "- Never share other students' data or compare them to others\n"
            "- If asked about anything harmful or off-topic, gently redirect to learning\n"
            "- Keep explanations concise, fun, and relatable to Kenyan students"
        ),
        "parent": (
            "You are Parents Companion, the dedicated AI assistant for a parent on Urban Home School — "
            "an e-learning platform for Kenyan children following the CBC curriculum.\n\n"
            "CAPABILITIES:\n"
            "- Track your children's learning progress, grades, and attendance\n"
            "- Explain CBC curriculum concepts and what your child is learning\n"
            "- Suggest ways to support learning at home\n"
            "- Help navigate platform features (payments, enrollments, reports)\n"
            "- Provide age-appropriate parenting tips for educational support\n\n"
            "DATA ACCESS:\n"
            "- You can see this parent's linked children and their academic data\n"
            "- You can see enrollment details, grades, and assignment deadlines\n"
            "- You CANNOT see other families' data or other parents' information\n"
            "- You CANNOT modify grades, enrollments, or payments — only advise\n\n"
            "GUARDRAILS:\n"
            "- Be warm, supportive, and non-judgmental\n"
            "- Focus on actionable guidance parents can use at home\n"
            "- Never share data about children not linked to this parent\n"
            "- Respect privacy — do not speculate about family circumstances"
        ),
        "instructor": (
            "You are Instructor AI, the teaching assistant for an instructor on Urban Home School — "
            "an e-learning platform for Kenyan children following the CBC curriculum.\n\n"
            "CAPABILITIES:\n"
            "- Help with lesson planning aligned to CBC competencies and strands\n"
            "- Design assessments (quizzes, assignments, exams) with rubrics\n"
            "- Suggest student engagement and differentiation strategies\n"
            "- Assist with content creation and course structuring\n"
            "- Analyze student performance trends in your courses\n\n"
            "DATA ACCESS:\n"
            "- You can see this instructor's courses, enrollments, and submissions\n"
            "- You can see aggregate student performance in their courses\n"
            "- You CANNOT see other instructors' courses or earnings\n"
            "- You CANNOT see individual student personal data beyond academic performance\n\n"
            "GUARDRAILS:\n"
            "- Provide professional, evidence-based teaching guidance\n"
            "- Always align recommendations with CBC competency framework\n"
            "- Never share student personal details or compare students publicly\n"
            "- Focus on pedagogical best practices"
        ),
        "admin": (
            "You are Bird Admin AI, the administrative assistant for the Urban Home School platform — "
            "an e-learning platform for Kenyan children following the CBC curriculum.\n\n"
            "CAPABILITIES:\n"
            "- Monitor platform health, user analytics, and system performance\n"
            "- Assist with user management decisions and content moderation\n"
            "- Interpret analytics dashboards and revenue reports\n"
            "- Guide system configuration and strategic planning\n"
            "- Help draft platform communications and policies\n\n"
            "DATA ACCESS:\n"
            "- You have access to aggregate platform metrics (active users, revenue, enrollments)\n"
            "- You can see system health, error rates, and operational alerts\n"
            "- You can reference user counts by role and engagement metrics\n"
            "- You should present data in summary form, not expose raw PII\n\n"
            "GUARDRAILS:\n"
            "- Provide data-driven, actionable insights\n"
            "- Present user data in aggregate — avoid exposing individual user details unless asked\n"
            "- Flag security concerns proactively\n"
            "- Recommend best practices for platform governance"
        ),
        "staff": (
            "You are Staff AI, the operations assistant for staff members on Urban Home School — "
            "an e-learning platform for Kenyan children following the CBC curriculum.\n\n"
            "CAPABILITIES:\n"
            "- Help triage and respond to support tickets\n"
            "- Analyze student journey patterns and flag at-risk learners\n"
            "- Assist with content review and moderation decisions\n"
            "- Guide operational workflows and SLA compliance\n"
            "- Draft communications to users (parents, students, instructors)\n\n"
            "DATA ACCESS:\n"
            "- You can see support ticket queues, SLA metrics, and moderation flags\n"
            "- You can see student engagement data for support purposes\n"
            "- You CANNOT modify user accounts or override admin decisions\n\n"
            "GUARDRAILS:\n"
            "- Be professional and solution-oriented\n"
            "- Follow established support protocols and escalation paths\n"
            "- Protect user privacy — use student data only for resolving their issues\n"
            "- Track SLA timelines and flag overdue tickets"
        ),
        "partner": (
            "You are Sponsors AI, the partnership assistant for sponsors and partners on Urban Home School — "
            "an e-learning platform for Kenyan children following the CBC curriculum.\n\n"
            "CAPABILITIES:\n"
            "- Track sponsorship impact and program outcomes\n"
            "- Interpret impact reports with anonymized data\n"
            "- Explore collaboration opportunities and community engagement\n"
            "- Help plan sponsored events or learning programs\n"
            "- Generate summaries for stakeholder reporting\n\n"
            "DATA ACCESS:\n"
            "- You can see this partner's sponsored students count and program metrics\n"
            "- You can see aggregate impact data (completion rates, grade improvements)\n"
            "- You CANNOT see individual student names, grades, or personal details\n"
            "- All student data is anonymized and presented in aggregate only\n\n"
            "GUARDRAILS:\n"
            "- CRITICAL: Never expose individual student identities or personal data to sponsors\n"
            "- All data must be anonymized — use cohort-level statistics only\n"
            "- Do not share financial details about platform revenue or instructor earnings\n"
            "- Focus on measurable educational outcomes and social impact"
        ),
    }

    # Role-specific default AIAgentProfile settings
    ROLE_DEFAULTS = {
        "student": {
            "agent_name": "Birdy",
            "persona": "A friendly, encouraging AI tutor for Kenyan students following the CBC curriculum.",
            "expertise_focus": ["Mathematics", "Science", "English", "Kiswahili"],
        },
        "parent": {
            "agent_name": "Parents Companion",
            "persona": "A warm, supportive guide helping parents track and nurture their children's education.",
            "expertise_focus": ["child_progress", "cbc_curriculum", "parenting_tips"],
        },
        "instructor": {
            "agent_name": "Instructor AI",
            "persona": "An expert teaching assistant for CBC-aligned lesson planning and assessment design.",
            "expertise_focus": ["lesson_planning", "assessment_design", "cbc_alignment"],
        },
        "admin": {
            "agent_name": "Bird Admin AI",
            "persona": "A data-driven platform management assistant for analytics and operations.",
            "expertise_focus": ["analytics", "user_management", "system_config"],
        },
        "staff": {
            "agent_name": "Staff AI",
            "persona": "An operations assistant for efficient support ticket resolution and student care.",
            "expertise_focus": ["support_tickets", "student_journeys", "content_review"],
        },
        "partner": {
            "agent_name": "Sponsors AI",
            "persona": "A partnership advisor focused on sponsorship impact and community collaboration.",
            "expertise_focus": ["sponsorships", "impact_reports", "collaboration"],
        },
    }

    async def chat(
        self,
        db: AsyncSession,
        user: User,
        request: CopilotChatRequest
    ) -> CopilotChatResponse:
        """
        Main chat method: handles user message and returns AI response.

        Uses a 3-phase pattern to avoid holding a DB connection during the
        AI round-trip (which can take 5-10 seconds and exhaust the pool):

        Phase 1 (DB): Read session, agent profile, build prompt, load history
        Phase 2 (No DB): Route query to AI orchestrator
        Phase 3 (DB): Save user message + AI response, update session
        """
        from app.database import AsyncSessionLocal

        try:
            # ── Phase 1: Pre-AI DB reads ──────────────────────────────
            # Get or create session
            if request.session_id:
                session = await self._get_session(db, user.id, request.session_id)
            else:
                session = await self.create_session(db, user.id, response_mode=request.response_mode)

            # Load agent profile
            agent_profile = await self.ensure_agent_profile(db, user)

            # Build system prompt with user-specific data context
            system_prompt = await self._build_system_prompt(db, user, agent_profile)

            # Load conversation context
            context = {}
            if request.include_context and session.message_count > 0:
                history_messages = await self._get_recent_messages(
                    db, session.id, request.context_messages
                )
                context['conversation_history'] = [
                    {'role': msg.role, 'content': msg.content}
                    for msg in history_messages
                ]

            context['system_message'] = system_prompt
            context['user_name'] = (user.profile_data or {}).get('full_name', user.email.split('@')[0])

            # Capture IDs needed for Phase 3 writes
            session_id = session.id
            session_message_count = session.message_count
            user_id = user.id

            # ── Phase 2: AI call (no DB session held) ─────────────────
            # get_orchestrator(None) uses its own short-lived session if
            # provider reload is needed, so the caller's DB connection is free
            orchestrator = await get_orchestrator(None)
            ai_response = await orchestrator.route_query(
                query=request.message,
                context=context,
                response_mode=request.response_mode
            )

            # ── Phase 3: Post-AI DB writes ────────────────────────────
            # Use a fresh session to avoid stale-state issues after the
            # long AI call gap
            async with AsyncSessionLocal() as write_db:
                # Save user message
                user_message = CopilotMessage(
                    session_id=session_id,
                    role="user",
                    content=request.message,
                    metadata_={'request_mode': request.response_mode}
                )
                write_db.add(user_message)

                # Save AI response
                assistant_message = CopilotMessage(
                    session_id=session_id,
                    role="assistant",
                    content=ai_response.get('message', ''),
                    audio_url=ai_response.get('audio_url'),
                    provider_used=ai_response.get('provider_used'),
                    metadata_=ai_response.get('metadata', {})
                )
                write_db.add(assistant_message)

                # Update session metadata
                from sqlalchemy import update
                await write_db.execute(
                    update(CopilotSession)
                    .where(CopilotSession.id == session_id)
                    .values(
                        message_count=session_message_count + 2,
                        last_message_at=datetime.now(timezone.utc),
                        updated_at=datetime.now(timezone.utc),
                    )
                )

                await write_db.commit()
                await write_db.refresh(assistant_message)

                # Auto-title session from first user message
                if session_message_count == 0:  # First exchange
                    await self._auto_title_session(write_db, session_id, request.message)

            return CopilotChatResponse(
                message=assistant_message.content,
                session_id=session_id,
                message_id=assistant_message.id,
                response_mode=request.response_mode,
                audio_url=assistant_message.audio_url,
                provider_used=assistant_message.provider_used,
                timestamp=assistant_message.created_at
            )

        except Exception as e:
            logger.error(f"Error in CoPilot chat: {str(e)}")
            await db.rollback()
            raise

    async def chat_stream(
        self,
        db: AsyncSession,
        user: User,
        request: CopilotChatRequest
    ) -> AsyncGenerator[str, None]:
        """
        Streaming chat: yields SSE-formatted JSON strings token by token.

        Flow is identical to chat() but the full response is streamed back
        word-by-word so the frontend can render tokens progressively.
        The final event carries the complete metadata (session_id, message_id, etc.).
        """
        try:
            # Get the full response using existing chat logic
            response = await self.chat(db, user, request)

            # Stream the response text word by word
            words = response.message.split(' ')
            for i, word in enumerate(words):
                token = word + (' ' if i < len(words) - 1 else '')
                yield json.dumps({"token": token, "done": False})

            # Final event with complete metadata
            yield json.dumps({
                "token": "",
                "done": True,
                "message": response.message,
                "session_id": str(response.session_id),
                "message_id": str(response.message_id),
                "response_mode": response.response_mode,
                "audio_url": response.audio_url,
                "provider_used": response.provider_used,
                "timestamp": response.timestamp.isoformat(),
            })

        except Exception as e:
            logger.error(f"Error in CoPilot chat_stream: {str(e)}")
            yield json.dumps({"error": str(e), "done": True})

    async def _build_system_prompt(
        self, db: AsyncSession, user: User, agent_profile: AIAgentProfile
    ) -> str:
        """Build personalized system prompt from role + agent profile + live data."""
        base_prompt = self.ROLE_PROMPTS.get(user.role, self.ROLE_PROMPTS['student'])

        # Customize with agent profile
        custom_persona = agent_profile.persona if agent_profile.persona else ""
        agent_name = agent_profile.agent_name or "The Bird AI"
        user_name = (user.profile_data or {}).get('full_name', 'the user')

        prompt = custom_persona if (custom_persona and custom_persona != base_prompt) else base_prompt
        prompt += self.BILINGUAL_INSTRUCTION
        prompt += f"\n\nYou are {agent_name}, speaking to {user_name}."

        # Inject live user-specific data context
        data_context = await self._build_data_context(db, user)
        if data_context:
            prompt += f"\n\nCURRENT USER DATA (use to personalize responses):\n{data_context}"

        return prompt

    async def _build_data_context(self, db: AsyncSession, user: User) -> str:
        """Query role-specific aggregate data to inject into the system prompt."""
        try:
            if user.role == "student":
                return await self._student_context(db, user)
            elif user.role == "parent":
                return await self._parent_context(db, user)
            elif user.role == "instructor":
                return await self._instructor_context(db, user)
            elif user.role == "admin":
                return await self._admin_context(db, user)
            elif user.role == "staff":
                return await self._staff_context(db, user)
            elif user.role == "partner":
                return await self._partner_context(db, user)
        except Exception as e:
            logger.warning(f"Failed to build data context for {user.role}: {str(e)}")
        return ""

    async def _student_context(self, db: AsyncSession, user: User) -> str:
        from app.models.course import Course
        from app.models.enrollment import Enrollment
        from app.models.student import Student

        lines = []
        # Get student profile
        stmt = select(Student).where(Student.user_id == user.id)
        result = await db.execute(stmt)
        student = result.scalar_one_or_none()
        if student:
            lines.append(f"Grade Level: {student.grade_level or 'Not set'}")

        # Get enrollments with course titles
        stmt = (
            select(Course.title, Course.learning_area, Enrollment.progress, Enrollment.current_grade)
            .join(Enrollment, Enrollment.course_id == Course.id)
            .where(Enrollment.student_id == (student.id if student else user.id))
            .where(Enrollment.status == "active")
            .limit(10)
        )
        result = await db.execute(stmt)
        enrollments = result.all()
        if enrollments:
            lines.append(f"Active Enrollments ({len(enrollments)}):")
            for title, area, progress, grade in enrollments:
                lines.append(f"  - {title} ({area}) — {progress or 0}% complete, grade: {grade or 'N/A'}")
        else:
            lines.append("Active Enrollments: None yet")

        return "\n".join(lines)

    async def _parent_context(self, db: AsyncSession, user: User) -> str:
        """Build parent context with batched queries (2 queries for N children)."""
        from app.models.student import Student
        from app.models.enrollment import Enrollment
        from app.models.course import Course
        from collections import defaultdict

        lines = []

        # Query 1: Get all children with their User profiles in a single JOIN
        stmt = (
            select(Student, User)
            .join(User, User.id == Student.user_id)
            .where(Student.parent_id == user.id)
        )
        result = await db.execute(stmt)
        children_with_users = result.all()

        if not children_with_users:
            lines.append("Linked Children: None found")
            return "\n".join(lines)

        lines.append(f"Children ({len(children_with_users)}):")
        child_ids = [child.id for child, _ in children_with_users]

        # Query 2: Get ALL enrollments for ALL children in a single query
        enroll_stmt = (
            select(
                Enrollment.student_id,
                Course.title,
                Enrollment.progress,
                Enrollment.current_grade,
            )
            .join(Course, Course.id == Enrollment.course_id)
            .where(Enrollment.student_id.in_(child_ids))
            .where(Enrollment.status == "active")
        )
        enroll_result = await db.execute(enroll_stmt)

        # Group enrollments by student_id
        enrollments_by_student = defaultdict(list)
        for student_id, title, progress, grade in enroll_result.all():
            enrollments_by_student[student_id].append((title, progress, grade))

        for child, child_user in children_with_users:
            child_name = (child_user.profile_data or {}).get('full_name', 'Unknown')
            lines.append(f"  - {child_name} (Grade: {child.grade_level or 'N/A'})")
            for title, progress, grade in enrollments_by_student.get(child.id, [])[:5]:
                lines.append(f"    Course: {title} — {progress or 0}% complete, grade: {grade or 'N/A'}")

        return "\n".join(lines)

    async def _instructor_context(self, db: AsyncSession, user: User) -> str:
        from app.models.course import Course
        from app.models.enrollment import Enrollment

        lines = []
        # Get instructor's courses
        stmt = (
            select(Course.title, Course.enrollment_count, Course.is_published, Course.average_rating)
            .where(Course.instructor_id == user.id)
            .limit(10)
        )
        result = await db.execute(stmt)
        courses = result.all()

        if courses:
            total_students = sum(c.enrollment_count or 0 for c in courses)
            published = sum(1 for c in courses if c.is_published)
            lines.append(f"Courses: {len(courses)} total ({published} published)")
            lines.append(f"Total Students Enrolled: {total_students}")
            for title, enrollment_count, is_published, rating in courses:
                status = "Published" if is_published else "Draft"
                lines.append(f"  - {title} [{status}] — {enrollment_count or 0} students, rating: {rating or 'N/A'}")
        else:
            lines.append("Courses: None created yet")

        return "\n".join(lines)

    async def _admin_context(self, db: AsyncSession, user: User) -> str:
        lines = []
        # User counts by role
        stmt = select(User.role, func.count(User.id)).where(
            User.is_active == True, User.is_deleted == False
        ).group_by(User.role)
        result = await db.execute(stmt)
        role_counts = {role: count for role, count in result.all()}

        total = sum(role_counts.values())
        lines.append(f"Total Active Users: {total}")
        for role in ["student", "parent", "instructor", "staff", "partner", "admin"]:
            lines.append(f"  - {role.capitalize()}s: {role_counts.get(role, 0)}")

        # Course stats
        from app.models.course import Course
        stmt = select(func.count(Course.id)).where(Course.is_published == True)
        result = await db.execute(stmt)
        published_courses = result.scalar() or 0
        lines.append(f"Published Courses: {published_courses}")

        return "\n".join(lines)

    async def _staff_context(self, db: AsyncSession, user: User) -> str:
        lines = []
        try:
            from app.models.staff.ticket import StaffTicket
            # Open tickets summary
            stmt = select(StaffTicket.status, func.count(StaffTicket.id)).group_by(StaffTicket.status)
            result = await db.execute(stmt)
            ticket_counts = {status: count for status, count in result.all()}
            total = sum(ticket_counts.values())
            open_count = ticket_counts.get("open", 0) + ticket_counts.get("in_progress", 0)
            lines.append(f"Support Tickets: {total} total, {open_count} open/in-progress")
            for status, count in ticket_counts.items():
                lines.append(f"  - {status}: {count}")
        except Exception:
            lines.append("Support Tickets: Data unavailable")

        return "\n".join(lines)

    async def _partner_context(self, db: AsyncSession, user: User) -> str:
        lines = []
        try:
            from app.models.partner.sponsorship import SponsorshipProgram, SponsoredChild
            # Sponsorship programs
            stmt = select(
                SponsorshipProgram.name, SponsorshipProgram.status,
                func.count(SponsoredChild.id)
            ).outerjoin(
                SponsoredChild, SponsoredChild.program_id == SponsorshipProgram.id
            ).where(
                SponsorshipProgram.partner_id == user.id
            ).group_by(SponsorshipProgram.id)
            result = await db.execute(stmt)
            programs = result.all()

            if programs:
                total_children = sum(count for _, _, count in programs)
                lines.append(f"Sponsorship Programs: {len(programs)}")
                lines.append(f"Total Sponsored Students: {total_children}")
                for name, status, count in programs:
                    lines.append(f"  - {name} [{status}] — {count} students")
            else:
                lines.append("Sponsorship Programs: None yet")
        except Exception:
            lines.append("Sponsorship Data: unavailable")

        return "\n".join(lines)

    async def _auto_title_session(
        self,
        db: AsyncSession,
        session_id: UUID,
        first_message: str
    ) -> None:
        """Generate and set session title from first message using AI."""
        try:
            # Use AI to generate a concise title (no DB session needed for AI call)
            orchestrator = await get_orchestrator(None)
            title_response = await orchestrator.route_query(
                query=f"Summarize this in 3-5 words as a conversation title: '{first_message[:200]}'",
                context={'system_message': 'Generate only a short title, nothing else.'},
                response_mode='text'
            )

            title = title_response.get('message', '')[:255]  # Truncate to fit column
            if title and len(title) > 5:  # Ensure we got a real title
                from sqlalchemy import update
                await db.execute(
                    update(CopilotSession)
                    .where(CopilotSession.id == session_id)
                    .values(title=title)
                )
                await db.commit()
        except Exception as e:
            logger.warning(f"Failed to auto-title session: {str(e)}")
            # Not critical, keep default title

    async def create_session(
        self,
        db: AsyncSession,
        user_id: UUID,
        title: Optional[str] = None,
        response_mode: str = "text"
    ) -> CopilotSession:
        """Create a new CoPilot session."""
        session = CopilotSession(
            user_id=user_id,
            title=title or "New Chat",
            response_mode=response_mode,
            is_pinned=False,
            is_deleted=False,
            message_count=0
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)
        return session

    # Role-specific welcome messages
    WELCOME_MESSAGES = {
        "student": (
            "Habari! Hi there! I'm Birdy, your personal AI tutor. "
            "Niko hapa kukusaidia kujifunza na kufurahi! I can explain tricky concepts, "
            "help with homework, suggest study tips, and answer your curiosity questions. "
            "Unaweza kuniuliza kwa Kiswahili au English — I speak both! "
            "What subjects interest you the most? Unapenda masomo gani zaidi?"
        ),
        "parent": (
            "Karibu! Welcome! I'm Parents Companion. I'll help you track your child's learning "
            "journey on Urban Home School. You can ask me about their progress, assignments, "
            "grades, or how to support their learning at home. "
            "Unaweza kuongea nami kwa Kiswahili au English. Nikusaidie vipi leo?"
        ),
        "instructor": (
            "Habari! Hello! I'm Instructor AI, your teaching assistant. I can help with lesson "
            "planning aligned to the CBC curriculum, assessment design, student engagement "
            "strategies, and content creation. "
            "Ninazungumza Kiswahili na English — feel free to use either! What would you like to work on?"
        ),
        "admin": (
            "Karibu! Welcome! I'm Bird Admin AI. I can help you monitor platform health, review "
            "analytics, manage users, and make data-driven decisions for Urban Home School. "
            "Ninaweza kukusaidia kwa Kiswahili au English. What would you like to check first?"
        ),
        "staff": (
            "Habari! Hello! I'm Staff AI. I can help with support tickets, student journey analysis, "
            "content review, and operational workflows. I'll keep you on top of SLA timelines "
            "and help you resolve issues efficiently. "
            "Ninaongea Kiswahili na English — How can I assist you today?"
        ),
        "partner": (
            "Karibu! Welcome! I'm Sponsors AI. I'll help you track the impact of your sponsorships, "
            "view program outcomes with anonymized data, and explore collaboration opportunities. "
            "Ninazungumza Kiswahili na English. How can I help you make an even bigger impact?"
        ),
    }

    async def create_welcome_session(self, db: AsyncSession, user: User) -> CopilotSession:
        """Create a welcome session with an introductory message for a new user."""
        try:
            agent_profile = await self.ensure_agent_profile(db, user)
            agent_name = agent_profile.agent_name or "The Bird AI"

            welcome_msg = self.WELCOME_MESSAGES.get(user.role, self.WELCOME_MESSAGES['student'])

            session = CopilotSession(
                user_id=user.id,
                title=f"Welcome to {agent_name}",
                response_mode="text",
                is_pinned=True,
                is_deleted=False,
                message_count=1,
                last_message_at=datetime.now(timezone.utc),
            )
            db.add(session)
            await db.flush()

            welcome_message = CopilotMessage(
                session_id=session.id,
                role="assistant",
                content=welcome_msg,
                provider_used="system",
                metadata_={"type": "welcome", "agent_name": agent_name},
            )
            db.add(welcome_message)
            await db.commit()
            await db.refresh(session)

            logger.info(f"Welcome session created for user {user.id} ({user.role})")
            return session

        except Exception as e:
            logger.error(f"Failed to create welcome session for user {user.id}: {str(e)}")
            await db.rollback()
            # Not critical — don't fail registration over this
            return None

    async def list_sessions(
        self,
        db: AsyncSession,
        user_id: UUID,
        page: int = 1,
        page_size: int = 20
    ) -> CopilotSessionList:
        """List user's sessions (paginated, non-deleted only)."""
        # Count total sessions
        count_stmt = select(func.count()).select_from(CopilotSession).where(
            and_(
                CopilotSession.user_id == user_id,
                CopilotSession.is_deleted == False
            )
        )
        result = await db.execute(count_stmt)
        total = result.scalar() or 0

        # Get paginated sessions
        offset = (page - 1) * page_size
        stmt = select(CopilotSession).where(
            and_(
                CopilotSession.user_id == user_id,
                CopilotSession.is_deleted == False
            )
        ).order_by(CopilotSession.updated_at.desc()).offset(offset).limit(page_size)

        result = await db.execute(stmt)
        sessions = result.scalars().all()

        return CopilotSessionList(
            sessions=[CopilotSessionSummary.from_orm(s) for s in sessions],
            total=total,
            page=page,
            page_size=page_size
        )

    async def get_session(
        self,
        db: AsyncSession,
        user_id: UUID,
        session_id: UUID,
        message_limit: int = 50,
        message_offset: int = 0
    ) -> CopilotSessionDetail:
        """Get session with messages."""
        session = await self._get_session(db, user_id, session_id)

        # Get paginated messages
        messages = await self._get_messages_paginated(
            db, session.id, message_limit, message_offset
        )

        return CopilotSessionDetail(
            id=session.id,
            title=session.title,
            summary=session.summary,
            response_mode=session.response_mode,
            is_pinned=session.is_pinned,
            message_count=session.message_count,
            messages=messages,
            created_at=session.created_at,
            updated_at=session.updated_at
        )

    async def update_session(
        self,
        db: AsyncSession,
        user_id: UUID,
        session_id: UUID,
        update_data: CopilotSessionUpdate
    ) -> CopilotSessionSummary:
        """Update session metadata."""
        session = await self._get_session(db, user_id, session_id)

        if update_data.title is not None:
            session.title = update_data.title
        if update_data.is_pinned is not None:
            session.is_pinned = update_data.is_pinned
        if update_data.response_mode is not None:
            session.response_mode = update_data.response_mode

        session.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(session)

        return CopilotSessionSummary.from_orm(session)

    async def delete_session(
        self,
        db: AsyncSession,
        user_id: UUID,
        session_id: UUID
    ) -> None:
        """Soft-delete a session."""
        session = await self._get_session(db, user_id, session_id)
        session.is_deleted = True
        session.updated_at = datetime.now(timezone.utc)
        await db.commit()

    async def ensure_agent_profile(
        self,
        db: AsyncSession,
        user: User
    ) -> AIAgentProfile:
        """Get or create AIAgentProfile with role-specific defaults."""
        stmt = select(AIAgentProfile).where(AIAgentProfile.user_id == user.id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if not profile:
            # Create with role defaults
            defaults = self.ROLE_DEFAULTS.get(user.role, self.ROLE_DEFAULTS['student'])
            profile = AIAgentProfile(
                user_id=user.id,
                agent_name=defaults['agent_name'],
                persona=defaults['persona'],
                expertise_focus=defaults['expertise_focus'],
                preferred_language='en',
                response_style='conversational'
            )
            db.add(profile)
            await db.commit()
            await db.refresh(profile)

        return profile

    # Private helper methods

    async def _get_session(
        self,
        db: AsyncSession,
        user_id: UUID,
        session_id: UUID
    ) -> CopilotSession:
        """Get session, ensuring user owns it."""
        stmt = select(CopilotSession).where(
            and_(
                CopilotSession.id == session_id,
                CopilotSession.user_id == user_id,
                CopilotSession.is_deleted == False
            )
        )
        result = await db.execute(stmt)
        session = result.scalar_one_or_none()

        if not session:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        return session

    async def _get_recent_messages(
        self,
        db: AsyncSession,
        session_id: UUID,
        limit: int
    ) -> List[CopilotMessage]:
        """Get recent messages for context."""
        stmt = select(CopilotMessage).where(
            CopilotMessage.session_id == session_id
        ).order_by(CopilotMessage.created_at.desc()).limit(limit)

        result = await db.execute(stmt)
        messages = result.scalars().all()
        return list(reversed(messages))  # Return in chronological order

    async def _get_messages_paginated(
        self,
        db: AsyncSession,
        session_id: UUID,
        limit: int,
        offset: int
    ) -> List[CopilotMessage]:
        """Get paginated messages."""
        stmt = select(CopilotMessage).where(
            CopilotMessage.session_id == session_id
        ).order_by(CopilotMessage.created_at.asc()).offset(offset).limit(limit)

        result = await db.execute(stmt)
        return result.scalars().all()
