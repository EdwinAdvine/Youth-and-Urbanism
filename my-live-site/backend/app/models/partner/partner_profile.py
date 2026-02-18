"""
Partner Profile Model

Extended profile information for partners including organization details,
branding configuration, and partnership tier management.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, UUID, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class PartnerProfile(Base):
    """Extended profile for partners with organization details and branding support"""

    __tablename__ = "partner_profiles"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # User relationship (one-to-one)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Organization information
    organization_name = Column(String(300), nullable=False)
    organization_type = Column(String(50), nullable=False)  # NGO, Corporate, Government, Foundation, Individual
    display_name = Column(String(200), nullable=True)
    bio = Column(Text, nullable=True)
    tagline = Column(String(300), nullable=True)
    logo_url = Column(String(500), nullable=True)
    banner_url = Column(String(500), nullable=True)

    # Contact information
    contact_person = Column(String(200), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    address = Column(JSONB, nullable=True)  # {"street": "...", "city": "...", "county": "...", "country": "Kenya", "postal_code": "..."}
    website = Column(String(500), nullable=True)
    social_links = Column(JSONB, nullable=True, default=list)  # [{"platform": "linkedin", "url": "..."}]

    # Registration and legal
    registration_number = Column(String(100), nullable=True)  # Official org registration
    tax_id = Column(String(100), nullable=True)
    tax_exempt = Column(Boolean, default=False)

    # Partnership details
    specializations = Column(JSONB, nullable=True, default=list)  # ["Primary Education", "STEM", "Special Needs"]
    partnership_tier = Column(String(50), default="standard")  # standard, premium, enterprise

    # Branding configuration
    branding_config = Column(JSONB, nullable=True)  # {"primary_color": "#...", "logo_position": "...", "report_template": "..."}

    # Onboarding status
    onboarding_completed = Column(Boolean, default=False)
    onboarding_step = Column(String(50), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="partner_profile")
    sponsorship_programs = relationship(
        "SponsorshipProgram",
        primaryjoin="PartnerProfile.user_id == foreign(SponsorshipProgram.partner_id)",
        viewonly=True,
    )
