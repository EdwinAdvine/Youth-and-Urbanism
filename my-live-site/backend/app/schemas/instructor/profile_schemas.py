"""
Instructor Profile Schemas

Pydantic v2 schemas for instructor profile management, public profiles, and portfolios.
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime


# Base Qualification Schema
class QualificationSchema(BaseModel):
    degree: str
    institution: str
    year: int
    field: str


# Base Social Link Schema
class SocialLinkSchema(BaseModel):
    platform: str
    url: str
    username: Optional[str] = None


# Base Portfolio Item Schema
class PortfolioItemSchema(BaseModel):
    type: str  # video, article, project, presentation
    title: str
    description: Optional[str] = None
    url: str
    thumbnail_url: Optional[str] = None
    date: Optional[str] = None


# SEO Meta Schema
class SEOMetaSchema(BaseModel):
    title: str
    description: str
    keywords: List[str]
    og_image: Optional[str] = None


# Time Range Schema
class TimeRangeSchema(BaseModel):
    start: str = Field(..., description="HH:MM format")
    end: str = Field(..., description="HH:MM format")


# Availability Config Schema
class AvailabilityConfigSchema(BaseModel):
    booking_window_days: int = 30
    min_notice_hours: int = 24
    max_daily_sessions: int = 4
    quiet_hours: List[TimeRangeSchema] = []
    preferred_days: List[str] = []
    time_zone: str = "Africa/Nairobi"


# Profile Create/Update Schemas
class InstructorProfileCreate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    tagline: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    specializations: List[str] = []
    qualifications: List[QualificationSchema] = []
    experience_years: Optional[int] = None
    subjects: List[str] = []
    languages: List[str] = ["en"]
    teaching_style: Optional[str] = None
    ai_personality_config: Optional[Dict[str, Any]] = None


class InstructorProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    tagline: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    specializations: Optional[List[str]] = None
    qualifications: Optional[List[QualificationSchema]] = None
    experience_years: Optional[int] = None
    subjects: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    teaching_style: Optional[str] = None
    ai_personality_config: Optional[Dict[str, Any]] = None


# Public Profile Schemas
class PublicProfileUpdate(BaseModel):
    public_profile_enabled: bool
    public_slug: Optional[str] = None
    seo_meta: Optional[SEOMetaSchema] = None
    social_links: Optional[List[SocialLinkSchema]] = None
    portfolio_items: Optional[List[PortfolioItemSchema]] = None


# Availability Schemas
class AvailabilityUpdate(BaseModel):
    availability_config: AvailabilityConfigSchema


# Portfolio Schemas
class PortfolioItemCreate(BaseModel):
    type: str
    title: str
    description: Optional[str] = None
    url: str
    thumbnail_url: Optional[str] = None
    date: Optional[str] = None


class PortfolioItemUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    date: Optional[str] = None


# Onboarding Schemas
class OnboardingStepUpdate(BaseModel):
    onboarding_step: str
    onboarding_completed: Optional[bool] = None


# Response Schemas
class InstructorProfileResponse(BaseModel):
    id: str
    user_id: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    tagline: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    specializations: List[str]
    qualifications: List[QualificationSchema]
    experience_years: Optional[int] = None
    subjects: List[str]
    languages: List[str]
    teaching_style: Optional[str] = None
    ai_personality_config: Optional[Dict[str, Any]] = None
    public_profile_enabled: bool
    public_slug: Optional[str] = None
    seo_meta: Optional[SEOMetaSchema] = None
    availability_config: Optional[AvailabilityConfigSchema] = None
    social_links: List[SocialLinkSchema]
    portfolio_items: List[PortfolioItemSchema]
    onboarding_completed: bool
    onboarding_step: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PublicInstructorProfileResponse(BaseModel):
    """Public-facing instructor profile (no sensitive data)"""
    display_name: str
    bio: Optional[str] = None
    tagline: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    specializations: List[str]
    qualifications: List[QualificationSchema]
    experience_years: Optional[int] = None
    subjects: List[str]
    languages: List[str]
    teaching_style: Optional[str] = None
    social_links: List[SocialLinkSchema]
    portfolio_items: List[PortfolioItemSchema]
    seo_meta: Optional[SEOMetaSchema] = None
    # Public stats
    total_students: int = 0
    total_courses: int = 0
    average_rating: float = 0.0
    total_reviews: int = 0
    badges_count: int = 0

    class Config:
        from_attributes = True
