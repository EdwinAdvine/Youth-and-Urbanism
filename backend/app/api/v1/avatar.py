"""
Avatar REST API — CRUD for 3D talking-tutor avatars.

All authenticated users (any role) can manage their avatars.
"""

import logging
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.avatar_schemas import (
    AvatarPreset,
    PhotoUploadResponse,
    RPMCallbackRequest,
    UserAvatarCreate,
    UserAvatarResponse,
)
from app.services.avatar_service import AvatarService
from app.utils.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Preset gallery ────────────────────────────────────────────────────


@router.get("/avatar/presets", response_model=List[AvatarPreset])
async def list_preset_avatars(
    current_user=Depends(get_current_user),
):
    """List all curated preset avatars (stylized + realistic)."""
    return AvatarService.get_preset_avatars()


@router.get("/avatar/presets/{preset_id}", response_model=AvatarPreset)
async def get_preset_avatar(
    preset_id: str,
    current_user=Depends(get_current_user),
):
    """Get a single preset avatar by ID."""
    preset = AvatarService.get_preset_by_id(preset_id)
    if not preset:
        raise HTTPException(status_code=404, detail="Preset avatar not found.")
    return preset


# ── User avatar CRUD ──────────────────────────────────────────────────


@router.get("/avatar/my-avatars", response_model=List[UserAvatarResponse])
async def list_my_avatars(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List all avatars saved by the current user."""
    avatars = await AvatarService.list_user_avatars(db, current_user.id)
    return avatars


@router.get("/avatar/active", response_model=UserAvatarResponse)
async def get_active_avatar(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get the user's currently active avatar."""
    avatar = await AvatarService.get_active_avatar(db, current_user.id)
    if not avatar:
        raise HTTPException(status_code=404, detail="No active avatar. Select one in Profile > Avatar.")
    return avatar


@router.post("/avatar/save", response_model=UserAvatarResponse, status_code=201)
async def save_avatar(
    data: UserAvatarCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Save a new avatar (from preset selection or RPM result)."""
    try:
        avatar = await AvatarService.save_avatar(db, current_user.id, data)
        await db.commit()
        await db.refresh(avatar)
        return avatar
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.put("/avatar/{avatar_id}/activate", response_model=UserAvatarResponse)
async def activate_avatar(
    avatar_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Set an avatar as active (deactivates all others)."""
    try:
        avatar = await AvatarService.activate_avatar(db, current_user.id, avatar_id)
        await db.commit()
        await db.refresh(avatar)
        return avatar
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.delete("/avatar/{avatar_id}", status_code=204)
async def delete_avatar(
    avatar_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Delete a saved avatar. Cannot delete the currently active avatar."""
    try:
        await AvatarService.delete_avatar(db, current_user.id, avatar_id)
        await db.commit()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


# ── Ready Player Me integration ───────────────────────────────────────


@router.post("/avatar/upload-photo", response_model=PhotoUploadResponse)
async def upload_photo_for_avatar(
    current_user=Depends(get_current_user),
):
    """
    Initiate an RPM avatar creation session.

    Returns the RPM editor URL. The frontend embeds this in an iframe and
    listens for the ``message`` event with the generated avatar URL.
    """
    rpm_url = await AvatarService.initiate_rpm_session(current_user.id)
    return PhotoUploadResponse(rpm_session_url=rpm_url)


@router.post("/avatar/rpm-callback", response_model=UserAvatarResponse, status_code=201)
async def rpm_avatar_callback(
    data: RPMCallbackRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Callback after RPM finishes avatar generation.

    The frontend posts the RPM result here to persist the new avatar.
    """
    try:
        avatar = await AvatarService.process_rpm_callback(
            db,
            current_user.id,
            rpm_avatar_id=data.rpm_avatar_id,
            model_url=data.model_url,
            thumbnail_url=data.thumbnail_url,
        )
        await db.commit()
        await db.refresh(avatar)
        return avatar
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
