"""
Instructor Account API Routes

Endpoints for profile, public profile, availability, and security (2FA).
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.models.user import User
from app.utils.security import require_role
from app.schemas.instructor.profile_schemas import (
    InstructorProfileResponse,
    InstructorProfileUpdate,
    PublicProfileUpdate,
    AvailabilityUpdate,
    OnboardingStepUpdate
)
from app.schemas.instructor.security_schemas import (
    TOTPSetupResponse,
    TOTPVerifyRequest,
    TOTPEnableRequest,
    SMSOTPEnableRequest,
    TwoFactorStatusResponse,
    LoginHistoryResponse,
    LoginHistoryQueryParams
)
from app.services.instructor.profile_service import (
    get_or_create_profile,
    update_profile,
    update_public_profile,
    update_availability,
    update_onboarding_step,
    ai_generate_portfolio_suggestions
)
from app.services.instructor.security_service import (
    setup_totp,
    verify_totp,
    enable_totp,
    enable_sms_otp,
    get_login_history
)

router = APIRouter(prefix="/account", tags=["Instructor Account"])


# ============================================================================
# Profile Endpoints
# ============================================================================

@router.get("/profile", response_model=InstructorProfileResponse)
async def get_profile(
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """Get instructor profile."""
    try:
        profile = await get_or_create_profile(db, str(current_user.id))
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/profile", response_model=InstructorProfileResponse)
async def update_instructor_profile(
    updates: InstructorProfileUpdate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """Update instructor profile."""
    try:
        profile = await update_profile(db, str(current_user.id), updates.dict(exclude_unset=True))
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/profile/public", response_model=InstructorProfileResponse)
async def update_public_settings(
    updates: PublicProfileUpdate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """Update public profile settings (slug, SEO, portfolio)."""
    try:
        profile = await update_public_profile(db, str(current_user.id), updates.dict(exclude_unset=True))
        return profile
    except Exception as e:
        if "already taken" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/availability", response_model=InstructorProfileResponse)
async def update_instructor_availability(
    updates: AvailabilityUpdate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """Update availability configuration."""
    try:
        profile = await update_availability(
            db,
            str(current_user.id),
            updates.availability_config.dict()
        )
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/onboarding", response_model=InstructorProfileResponse)
async def update_onboarding(
    updates: OnboardingStepUpdate,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """Update onboarding progress."""
    try:
        profile = await update_onboarding_step(
            db,
            str(current_user.id),
            updates.onboarding_step,
            updates.onboarding_completed or False
        )
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/profile/ai-portfolio-suggestions")
async def get_portfolio_suggestions(
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """Get AI-powered portfolio suggestions."""
    try:
        suggestions = await ai_generate_portfolio_suggestions(db, str(current_user.id))
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Security / 2FA Endpoints
# ============================================================================

@router.post("/security/totp/setup", response_model=TOTPSetupResponse)
async def setup_totp_2fa(
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """Setup TOTP 2FA (returns QR code and backup codes)."""
    try:
        result = await setup_totp(db, str(current_user.id))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/security/totp/verify")
async def verify_totp_code(
    request: TOTPVerifyRequest,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """Verify TOTP code."""
    try:
        is_valid = await verify_totp(db, str(current_user.id), request.code)
        return {"valid": is_valid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/security/totp/enable")
async def enable_totp_2fa(
    request: TOTPEnableRequest,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """Enable TOTP 2FA after verification."""
    try:
        success = await enable_totp(db, str(current_user.id), request.code)
        if not success:
            raise HTTPException(status_code=400, detail="Invalid verification code")
        return {"message": "TOTP 2FA enabled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/security/sms-otp/enable")
async def enable_sms_2fa(
    request: SMSOTPEnableRequest,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """Enable SMS OTP 2FA."""
    try:
        success = await enable_sms_otp(db, str(current_user.id), request.phone)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to send SMS")
        return {"message": "SMS OTP setup initiated. Check your phone for verification code."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/security/login-history", response_model=List[LoginHistoryResponse])
async def get_login_history_endpoint(
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db)
):
    """Get login history for security audit."""
    try:
        history = await get_login_history(db, str(current_user.id), limit)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
