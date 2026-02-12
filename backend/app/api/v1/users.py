"""
User Profile API Endpoints

Handles user profile updates, password changes, and account management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.database import get_db
from app.models.user import User
from app.utils.security import get_current_user, get_password_hash, verify_password

router = APIRouter(prefix="/users", tags=["Users"])


class ProfileUpdate(BaseModel):
    """Schema for updating user profile data."""
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    grade_level: Optional[str] = None
    profile_data: Optional[Dict[str, Any]] = None


class PasswordChange(BaseModel):
    """Schema for changing password."""
    current_password: str
    new_password: str


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
)
async def get_profile(
    current_user: User = Depends(get_current_user),
):
    """Get the current user's profile."""
    profile = current_user.profile_data or {}
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "full_name": profile.get("full_name", ""),
        "phone_number": profile.get("phone_number", ""),
        "bio": profile.get("bio", ""),
        "grade_level": profile.get("grade_level", ""),
        "profile_data": profile,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
    }


@router.put(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Update current user profile",
)
async def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the current user's profile data."""
    profile = dict(current_user.profile_data or {})

    # Update individual fields if provided
    if data.full_name is not None:
        profile["full_name"] = data.full_name
    if data.phone_number is not None:
        profile["phone_number"] = data.phone_number
    if data.bio is not None:
        profile["bio"] = data.bio
    if data.grade_level is not None:
        profile["grade_level"] = data.grade_level

    # Merge any additional profile_data
    if data.profile_data:
        profile.update(data.profile_data)

    current_user.profile_data = profile
    await db.flush()
    await db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "profile_data": current_user.profile_data,
    }


@router.put(
    "/me/password",
    status_code=status.HTTP_200_OK,
    summary="Change password",
)
async def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change the current user's password."""
    # Verify current password
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # Validate new password length
    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters",
        )

    # Hash and update
    current_user.hashed_password = get_password_hash(data.new_password)
    await db.flush()

    return {"message": "Password changed successfully"}
