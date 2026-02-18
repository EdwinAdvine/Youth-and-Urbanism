"""
Instructor Profile Service

Business logic for instructor profile management, public profiles, and portfolios.
"""

import logging
import uuid
from typing import Optional, Dict, Any
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.instructor.instructor_profile import InstructorProfile
from app.models.user import User
from app.services.ai_orchestrator import AIOrchestrator

logger = logging.getLogger(__name__)


async def get_or_create_profile(
    db: AsyncSession, user_id: str
) -> InstructorProfile:
    """
    Get instructor profile or create if doesn't exist.
    """
    try:
        # Try to get existing profile
        query = select(InstructorProfile).where(
            InstructorProfile.user_id == user_id
        )
        result = await db.execute(query)
        profile = result.scalar_one_or_none()

        if profile:
            return profile

        # Create new profile
        profile = InstructorProfile(
            id=uuid.uuid4(),
            user_id=user_id,
            specializations=[],
            qualifications=[],
            subjects=[],
            languages=["en"],
            social_links=[],
            portfolio_items=[],
            public_profile_enabled=False,
            onboarding_completed=False,
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

        logger.info(f"Created new instructor profile for user {user_id}")
        return profile

    except Exception as e:
        logger.error(f"Error getting/creating instructor profile: {str(e)}")
        await db.rollback()
        raise


async def update_profile(
    db: AsyncSession,
    user_id: str,
    updates: Dict[str, Any]
) -> InstructorProfile:
    """
    Update instructor profile.
    """
    try:
        profile = await get_or_create_profile(db, user_id)

        # Update allowed fields
        for key, value in updates.items():
            if hasattr(profile, key):
                setattr(profile, key, value)

        profile.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(profile)

        logger.info(f"Updated instructor profile for user {user_id}")
        return profile

    except Exception as e:
        logger.error(f"Error updating instructor profile: {str(e)}")
        await db.rollback()
        raise


async def update_public_profile(
    db: AsyncSession,
    user_id: str,
    public_data: Dict[str, Any]
) -> InstructorProfile:
    """
    Update public profile settings (slug, SEO, social links, portfolio).
    """
    try:
        profile = await get_or_create_profile(db, user_id)

        if "public_profile_enabled" in public_data:
            profile.public_profile_enabled = public_data["public_profile_enabled"]

        if "public_slug" in public_data:
            # Check slug uniqueness
            slug = public_data["public_slug"]
            if slug:
                existing = await db.execute(
                    select(InstructorProfile).where(
                        InstructorProfile.public_slug == slug,
                        InstructorProfile.user_id != user_id
                    )
                )
                if existing.scalar_one_or_none():
                    raise ValueError(f"Slug '{slug}' is already taken")
            profile.public_slug = slug

        if "seo_meta" in public_data:
            profile.seo_meta = public_data["seo_meta"]

        if "social_links" in public_data:
            profile.social_links = public_data["social_links"]

        if "portfolio_items" in public_data:
            profile.portfolio_items = public_data["portfolio_items"]

        profile.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(profile)

        logger.info(f"Updated public profile for user {user_id}")
        return profile

    except Exception as e:
        logger.error(f"Error updating public profile: {str(e)}")
        await db.rollback()
        raise


async def get_public_profile_by_slug(
    db: AsyncSession,
    slug: str
) -> Optional[Dict[str, Any]]:
    """
    Get public instructor profile by slug (cached).
    Returns None if not found or not enabled.
    """
    try:
        query = select(InstructorProfile).where(
            InstructorProfile.public_slug == slug,
            InstructorProfile.public_profile_enabled == True
        )
        result = await db.execute(query)
        profile = result.scalar_one_or_none()

        if not profile:
            return None

        # Get user info
        user_query = select(User).where(User.id == profile.user_id)
        user_result = await db.execute(user_query)
        user = user_result.scalar_one_or_none()

        # TODO: Get stats (total students, courses, rating, reviews, badges)
        # These would come from enrollments, courses, reviews, badges tables

        return {
            "display_name": profile.display_name or user.name,
            "bio": profile.bio,
            "tagline": profile.tagline,
            "avatar_url": profile.avatar_url,
            "banner_url": profile.banner_url,
            "specializations": profile.specializations,
            "qualifications": profile.qualifications,
            "experience_years": profile.experience_years,
            "subjects": profile.subjects,
            "languages": profile.languages,
            "teaching_style": profile.teaching_style,
            "social_links": profile.social_links,
            "portfolio_items": profile.portfolio_items,
            "seo_meta": profile.seo_meta,
            "total_students": 0,  # TODO: Calculate
            "total_courses": 0,  # TODO: Calculate
            "average_rating": 0.0,  # TODO: Calculate
            "total_reviews": 0,  # TODO: Calculate
            "badges_count": 0,  # TODO: Calculate
        }

    except Exception as e:
        logger.error(f"Error getting public profile by slug: {str(e)}")
        raise


async def update_availability(
    db: AsyncSession,
    user_id: str,
    availability_config: Dict[str, Any]
) -> InstructorProfile:
    """
    Update instructor availability configuration.
    """
    try:
        profile = await get_or_create_profile(db, user_id)
        profile.availability_config = availability_config
        profile.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(profile)

        logger.info(f"Updated availability for user {user_id}")
        return profile

    except Exception as e:
        logger.error(f"Error updating availability: {str(e)}")
        await db.rollback()
        raise


async def update_onboarding_step(
    db: AsyncSession,
    user_id: str,
    step: str,
    completed: bool = False
) -> InstructorProfile:
    """
    Update instructor onboarding progress.
    """
    try:
        profile = await get_or_create_profile(db, user_id)
        profile.onboarding_step = step
        if completed:
            profile.onboarding_completed = True
        profile.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(profile)

        logger.info(f"Updated onboarding step for user {user_id}: {step}")
        return profile

    except Exception as e:
        logger.error(f"Error updating onboarding step: {str(e)}")
        await db.rollback()
        raise


async def ai_generate_portfolio_suggestions(
    db: AsyncSession,
    user_id: str
) -> Dict[str, Any]:
    """
    AI-powered portfolio builder suggestions.
    """
    try:
        profile = await get_or_create_profile(db, user_id)

        # Build context for AI
        context = f"""
        Instructor Profile:
        - Specializations: {", ".join(profile.specializations)}
        - Subjects: {", ".join(profile.subjects)}
        - Experience: {profile.experience_years} years
        - Teaching Style: {profile.teaching_style}

        Generate portfolio item suggestions that would strengthen this instructor's profile.
        """

        ai_orchestrator = AIOrchestrator()
        result = await ai_orchestrator.process_request(
            task_type="creative",
            user_prompt=context,
            conversation_history=[],
            system_prompt="You are an educational portfolio consultant."
        )

        return {
            "suggestions": result.get("response", ""),
            "ai_model_used": result.get("model_used", "unknown"),
            "generated_at": datetime.utcnow()
        }

    except Exception as e:
        logger.error(f"Error generating portfolio suggestions: {str(e)}")
        raise
