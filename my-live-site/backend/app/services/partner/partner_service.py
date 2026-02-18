"""
Partner Profile Service

Manages partner profile CRUD operations including organization details,
branding configuration, contact information, and onboarding state.
"""

import logging
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.partner.partner_profile import PartnerProfile
from app.models.user import User

logger = logging.getLogger(__name__)


class PartnerDashboardService:
    """Facade used by partner dashboard routes."""

    @staticmethod
    async def get_overview(db, user_id: str):
        profile = await get_partner_profile(db, user_id)
        return {
            "profile": profile,
            "sponsored_children": 0,
            "active_programs": 0,
            "total_investment": 0,
            "budget_utilisation": 0,
            "impact_score": 0,
            "recent_activity": [],
        }


async def get_partner_profile(
    db: AsyncSession,
    user_id: str,
) -> Optional[Dict[str, Any]]:
    """
    Retrieve the full partner profile for a given user.

    Returns the profile including organization details, branding
    configuration, contact info, and onboarding status. Returns None
    if no profile exists for the user.

    Args:
        db: Async database session.
        user_id: UUID of the partner user.

    Returns:
        Dictionary containing the partner profile or None.
    """
    try:
        query = select(PartnerProfile).where(PartnerProfile.user_id == user_id)
        result = await db.execute(query)
        profile = result.scalar_one_or_none()

        if not profile:
            return None

        # Fetch associated user for display name / email
        user_q = select(User).where(User.id == user_id)
        user_result = await db.execute(user_q)
        user = user_result.scalar_one_or_none()

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "email": user.email if user else None,
            "full_name": f"{user.first_name} {user.last_name}" if user else None,
            "organization_name": profile.organization_name,
            "organization_type": profile.organization_type,
            "display_name": profile.display_name,
            "bio": profile.bio,
            "tagline": profile.tagline,
            "logo_url": profile.logo_url,
            "banner_url": profile.banner_url,
            "contact_person": profile.contact_person,
            "contact_email": profile.contact_email,
            "contact_phone": profile.contact_phone,
            "address": profile.address,
            "website": profile.website,
            "social_links": profile.social_links or [],
            "registration_number": profile.registration_number,
            "tax_id": profile.tax_id,
            "tax_exempt": profile.tax_exempt,
            "specializations": profile.specializations or [],
            "partnership_tier": profile.partnership_tier,
            "branding_config": profile.branding_config,
            "onboarding_completed": profile.onboarding_completed,
            "onboarding_step": profile.onboarding_step,
            "created_at": profile.created_at.isoformat() if profile.created_at else None,
            "updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
        }

    except Exception as e:
        logger.error(f"Error fetching partner profile for user {user_id}: {e}")
        raise


async def create_partner_profile(
    db: AsyncSession,
    user_id: str,
    data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Create a new partner profile for a user.

    Initialises the profile with organisation details, contact information,
    branding config, and sets onboarding to its first step.

    Args:
        db: Async database session.
        user_id: UUID of the partner user.
        data: Dictionary containing profile fields (organization_name,
              organization_type, display_name, bio, tagline, etc.).

    Returns:
        Dictionary containing the newly created profile.

    Raises:
        ValueError: If a profile already exists for this user.
    """
    try:
        # Check for existing profile
        existing_q = select(PartnerProfile).where(PartnerProfile.user_id == user_id)
        existing_result = await db.execute(existing_q)
        if existing_result.scalar_one_or_none():
            raise ValueError(f"Partner profile already exists for user {user_id}")

        profile = PartnerProfile(
            user_id=user_id,
            organization_name=data.get("organization_name", ""),
            organization_type=data.get("organization_type", "Individual"),
            display_name=data.get("display_name"),
            bio=data.get("bio"),
            tagline=data.get("tagline"),
            logo_url=data.get("logo_url"),
            banner_url=data.get("banner_url"),
            contact_person=data.get("contact_person"),
            contact_email=data.get("contact_email"),
            contact_phone=data.get("contact_phone"),
            address=data.get("address"),
            website=data.get("website"),
            social_links=data.get("social_links", []),
            registration_number=data.get("registration_number"),
            tax_id=data.get("tax_id"),
            tax_exempt=data.get("tax_exempt", False),
            specializations=data.get("specializations", []),
            partnership_tier=data.get("partnership_tier", "standard"),
            branding_config=data.get("branding_config"),
            onboarding_completed=False,
            onboarding_step="organization_details",
        )

        db.add(profile)
        await db.flush()

        logger.info(f"Created partner profile for user {user_id}")

        return {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "organization_name": profile.organization_name,
            "organization_type": profile.organization_type,
            "display_name": profile.display_name,
            "partnership_tier": profile.partnership_tier,
            "onboarding_completed": profile.onboarding_completed,
            "onboarding_step": profile.onboarding_step,
            "created_at": profile.created_at.isoformat() if profile.created_at else None,
        }

    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Error creating partner profile for user {user_id}: {e}")
        raise


async def update_partner_profile(
    db: AsyncSession,
    user_id: str,
    updates: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """
    Update an existing partner profile.

    Accepts a dictionary of fields to update. Only non-None values in the
    updates dictionary are applied. Returns the updated profile or None
    if no profile exists.

    Args:
        db: Async database session.
        user_id: UUID of the partner user.
        updates: Dictionary of fields to update.

    Returns:
        Dictionary containing the updated profile, or None if not found.
    """
    try:
        query = select(PartnerProfile).where(PartnerProfile.user_id == user_id)
        result = await db.execute(query)
        profile = result.scalar_one_or_none()

        if not profile:
            return None

        # Allowlisted fields that can be updated
        updatable_fields = [
            "organization_name",
            "organization_type",
            "display_name",
            "bio",
            "tagline",
            "logo_url",
            "banner_url",
            "contact_person",
            "contact_email",
            "contact_phone",
            "address",
            "website",
            "social_links",
            "registration_number",
            "tax_id",
            "tax_exempt",
            "specializations",
            "partnership_tier",
            "branding_config",
            "onboarding_completed",
            "onboarding_step",
        ]

        for field in updatable_fields:
            if field in updates:
                setattr(profile, field, updates[field])

        profile.updated_at = datetime.utcnow()
        await db.flush()

        logger.info(f"Updated partner profile for user {user_id}")

        # Return the full profile via the get function
        return await get_partner_profile(db, user_id)

    except Exception as e:
        logger.error(f"Error updating partner profile for user {user_id}: {e}")
        raise
