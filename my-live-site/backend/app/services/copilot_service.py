"""
CoPilot Service

Core business logic for the AI CoPilot feature. Handles chat sessions,
message routing to the AI orchestrator, automatic session titling, and
AIAgentProfile management for all user roles.
"""

import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
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

    # Role-specific system prompts
    ROLE_PROMPTS = {
        "student": (
            "You are The Bird AI, a helpful educational CoPilot for a student "
            "on the Urban Home School platform in Kenya. Help with homework, "
            "explain concepts aligned with the CBC curriculum, suggest study strategies, "
            "and encourage learning. Be patient, encouraging, and age-appropriate."
        ),
        "parent": (
            "You are The Bird AI, a helpful CoPilot for a parent on the Urban Home School platform. "
            "Help understand your child's progress, suggest ways to support learning at home, "
            "explain CBC curriculum concepts, answer questions about the platform features, "
            "and provide parenting tips for educational support."
        ),
        "instructor": (
            "You are The Bird AI, a CoPilot for an instructor on the Urban Home School platform. "
            "Help with lesson planning aligned to CBC, assessment design, student engagement "
            "strategies, content creation best practices, and classroom management tips. "
            "Provide professional teaching guidance."
        ),
        "admin": (
            "You are The Bird AI, an administrative CoPilot for the Urban Home School platform. "
            "Help with platform management decisions, user analytics interpretation, "
            "content moderation guidance, system configuration questions, and strategic planning. "
            "Provide data-driven insights for platform operations."
        ),
        "staff": (
            "You are The Bird AI, a CoPilot for staff members on the Urban Home School platform. "
            "Help with support ticket responses, student journey analysis, content review procedures, "
            "operational workflows, and SLA compliance. Provide guidance for effective support operations."
        ),
        "partner": (
            "You are The Bird AI, a CoPilot for partners on the Urban Home School platform. "
            "Help with sponsorship program understanding, impact report interpretation, "
            "collaboration opportunities, partnership best practices, and community engagement strategies."
        ),
    }

    # Role-specific default AIAgentProfile settings
    ROLE_DEFAULTS = {
        "student": {
            "agent_name": "Birdy",
            "persona": "A friendly, encouraging AI tutor for Kenyan students.",
            "expertise_focus": ["Mathematics", "Science", "English", "Kiswahili"],
        },
        "parent": {
            "agent_name": "The Bird AI",
            "persona": "A supportive guide helping parents nurture their child's education.",
            "expertise_focus": ["child_progress", "cbc_curriculum", "parenting_tips"],
        },
        "instructor": {
            "agent_name": "The Bird AI",
            "persona": "An expert teaching assistant for CBC-aligned content creation.",
            "expertise_focus": ["lesson_planning", "assessment_design", "cbc_alignment"],
        },
        "admin": {
            "agent_name": "The Bird AI",
            "persona": "A platform management assistant with data-driven insights.",
            "expertise_focus": ["analytics", "user_management", "system_config"],
        },
        "staff": {
            "agent_name": "The Bird AI",
            "persona": "A support operations assistant for efficient issue resolution.",
            "expertise_focus": ["support_tickets", "student_journeys", "content_review"],
        },
        "partner": {
            "agent_name": "The Bird AI",
            "persona": "A partnership advisor focused on impact and collaboration.",
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

        Flow:
        1. Get or create session
        2. Load AIAgentProfile for personalization
        3. Build role-specific system prompt
        4. Load conversation history for context
        5. Route to AI orchestrator
        6. Save user message + AI response
        7. Auto-title session if first message
        8. Return response
        """
        try:
            # Get or create session
            if request.session_id:
                session = await self._get_session(db, user.id, request.session_id)
            else:
                session = await self.create_session(db, user.id, response_mode=request.response_mode)

            # Load agent profile
            agent_profile = await self.ensure_agent_profile(db, user)

            # Build system prompt
            system_prompt = await self._build_system_prompt(user, agent_profile)

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
            context['user_name'] = user.full_name or user.email.split('@')[0]

            # Route to AI orchestrator
            orchestrator = await get_orchestrator(db)
            ai_response = await orchestrator.route_query(
                query=request.message,
                context=context,
                response_mode=request.response_mode
            )

            # Save user message
            user_message = CopilotMessage(
                session_id=session.id,
                role="user",
                content=request.message,
                metadata_={'request_mode': request.response_mode}
            )
            db.add(user_message)

            # Save AI response
            assistant_message = CopilotMessage(
                session_id=session.id,
                role="assistant",
                content=ai_response.get('message', ''),
                audio_url=ai_response.get('audio_url'),
                video_url=ai_response.get('video_url'),
                provider_used=ai_response.get('provider_used'),
                metadata_=ai_response.get('metadata', {})
            )
            db.add(assistant_message)

            # Update session metadata
            session.message_count += 2
            session.last_message_at = datetime.now(timezone.utc)
            session.updated_at = datetime.now(timezone.utc)

            await db.commit()
            await db.refresh(assistant_message)

            # Auto-title session from first user message
            if session.message_count == 2:  # First exchange
                await self._auto_title_session(db, session, request.message)

            return CopilotChatResponse(
                message=assistant_message.content,
                session_id=session.id,
                message_id=assistant_message.id,
                response_mode=request.response_mode,
                audio_url=assistant_message.audio_url,
                video_url=assistant_message.video_url,
                provider_used=assistant_message.provider_used,
                timestamp=assistant_message.created_at
            )

        except Exception as e:
            logger.error(f"Error in CoPilot chat: {str(e)}")
            await db.rollback()
            raise

    async def _build_system_prompt(self, user: User, agent_profile: AIAgentProfile) -> str:
        """Build personalized system prompt from role + agent profile."""
        base_prompt = self.ROLE_PROMPTS.get(user.role, self.ROLE_PROMPTS['student'])

        # Customize with agent profile
        custom_persona = agent_profile.persona if agent_profile.persona else ""
        agent_name = agent_profile.agent_name or "The Bird AI"

        if custom_persona and custom_persona != base_prompt:
            # User has customized their persona
            return f"{custom_persona}\n\nYou are {agent_name}, speaking to {user.full_name or 'the user'}."
        else:
            # Use role default
            return f"{base_prompt}\n\nYou are {agent_name}, speaking to {user.full_name or 'the user'}."

    async def _auto_title_session(
        self,
        db: AsyncSession,
        session: CopilotSession,
        first_message: str
    ) -> None:
        """Generate and set session title from first message using AI."""
        try:
            # Use AI to generate a concise title
            orchestrator = await get_orchestrator(db)
            title_response = await orchestrator.route_query(
                query=f"Summarize this in 3-5 words as a conversation title: '{first_message[:200]}'",
                context={'system_message': 'Generate only a short title, nothing else.'},
                response_mode='text'
            )

            title = title_response.get('message', '')[:255]  # Truncate to fit column
            if title and len(title) > 5:  # Ensure we got a real title
                session.title = title
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
