"""Parent registration service — handles multi-step registration with children."""

import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.user import User
from app.models.student import Student
from app.models.ai_tutor import AITutor
from app.schemas.parent_registration_schemas import ParentRegistrationWithChildren, ChildSummary
from app.utils.security import get_password_hash, create_access_token
from app.utils.student_codes import generate_admission_number, generate_ait_code
from app.services.username_generation_service import generate_username
from app.config import settings

logger = logging.getLogger(__name__)


async def register_parent_with_children(
    db: AsyncSession,
    data: ParentRegistrationWithChildren,
) -> dict:
    """
    Atomic registration: parent user + child users + student records + AI tutors.

    Returns dict with parent info, children summaries, and auth tokens.
    """
    # Check if parent email already exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    try:
        # 1. Create parent user
        parent_user = User(
            email=data.email,
            password_hash=get_password_hash(data.password),
            role="parent",
            profile_data={
                "full_name": data.full_name,
                "phone": data.phone_number,
                "children_count": len(data.children),
            },
            is_active=True,
            is_verified=False,
        )
        db.add(parent_user)
        await db.flush()

        # 2. Create child accounts
        children_summaries = []
        year = datetime.now(timezone.utc).year

        for i, child_data in enumerate(data.children):

            # Generate or use preferred username
            if child_data.preferred_username:
                # Verify it's available
                existing = await db.execute(
                    select(User).where(User.username == child_data.preferred_username)
                )
                if existing.scalar_one_or_none():
                    username = await generate_username(db, child_data.first_name, child_data.last_name)
                else:
                    username = child_data.preferred_username
            else:
                username = await generate_username(db, child_data.first_name, child_data.last_name)

            # Create child User (no email, uses username)
            # Set a temporary password hash - child will set their own password via first-login link
            import secrets
            temp_password = secrets.token_urlsafe(32)

            # Generate admission number — always issued at registration
            admission_number = await generate_admission_number(
                db, child_data.grade_level, year
            )

            child_user = User(
                email=None,
                username=username,
                password_hash=get_password_hash(temp_password),
                role="student",
                date_of_birth=child_data.date_of_birth,
                profile_data={
                    "full_name": f"{child_data.first_name} {child_data.last_name}",
                    "grade_level": child_data.grade_level,
                    "tutor_name": "Birdy",
                    "registered_by_parent": True,
                    "admission_number": admission_number,
                },
                is_active=True,
                is_verified=True,  # No email to verify
            )
            db.add(child_user)
            await db.flush()

            # Create Student record
            new_student = Student(
                user_id=child_user.id,
                parent_id=parent_user.id,
                admission_number=admission_number,
                grade_level=child_data.grade_level,
                enrollment_date=datetime.now(timezone.utc).date(),
                is_active=True,
                learning_profile={},
                competencies={},
                overall_performance={},
            )
            db.add(new_student)
            await db.flush()

            # Generate AIT code and create dedicated AI Tutor
            ait_code = await generate_ait_code(db, admission_number)
            ai_tutor = AITutor(
                student_id=new_student.id,
                name="Birdy",
                ait_code=ait_code,
                conversation_history=[],
                learning_path={},
                performance_metrics={},
                response_mode="text",
                total_interactions=0,
            )
            db.add(ai_tutor)

            # Generate first-login token for this child
            child_setup_token = create_access_token(
                data={
                    "sub": str(child_user.id),
                    "type": "child_first_login",
                    "username": username,
                },
                expires_delta=timedelta(days=30),
            )

            frontend_url = settings.frontend_url if hasattr(settings, 'frontend_url') else "http://localhost:3000"
            setup_link = f"{frontend_url}/child-setup?token={child_setup_token}"

            children_summaries.append(ChildSummary(
                full_name=f"{child_data.first_name} {child_data.last_name}",
                username=username,
                grade_level=child_data.grade_level,
                admission_number=admission_number,
                setup_link=setup_link,
            ))

        # Create AIAgentProfile for parent
        from app.models.ai_agent_profile import AIAgentProfile
        from app.services.copilot_service import CopilotService

        role_defaults = CopilotService.ROLE_DEFAULTS.get(
            "parent",
            {"agent_name": "AI Assistant", "persona": "Helpful assistant", "expertise_focus": "general assistance"}
        )
        parent_agent = AIAgentProfile(
            user_id=parent_user.id,
            agent_name=role_defaults["agent_name"],
            persona=role_defaults["persona"],
            expertise_focus=role_defaults["expertise_focus"],
        )
        db.add(parent_agent)

        await db.commit()
        await db.refresh(parent_user)

        return {
            "parent_user": parent_user,
            "children": children_summaries,
        }

    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Parent registration failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )
