"""
Avatar Service — business logic for 3D avatar management.

Handles preset avatar catalogue, user avatar CRUD, Ready Player Me
integration, and avatar model retrieval for service-worker caching.
"""

from __future__ import annotations

import json
import logging
import os
import re
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user_avatar import AvatarType, UserAvatar
from app.schemas.avatar_schemas import (
    AvatarPreset,
    GestureAnnotation,
    UserAvatarCreate,
)

logger = logging.getLogger(__name__)

# Gesture marker pattern: [smile], [nod], etc.
_GESTURE_RE = re.compile(
    r"\[(smile|nod|think|point|excited|calm|wave|emphasize)\]",
    re.IGNORECASE,
)

# Approximate TTS word rate for timestamp estimation (words per minute)
_TTS_WPM = 150


class AvatarService:
    """Avatar business logic."""

    # ── Preset catalogue ──────────────────────────────────────────────

    @staticmethod
    def get_preset_avatars() -> List[AvatarPreset]:
        """Return the curated list of preset avatars from the JSON config."""
        config_path = Path(settings.avatar_preset_config_path)
        if not config_path.is_absolute():
            config_path = Path(os.getcwd()) / config_path

        if not config_path.exists():
            logger.warning("Preset avatar config not found at %s", config_path)
            return []

        with open(config_path, "r") as f:
            data = json.load(f)

        return [AvatarPreset(**item) for item in data.get("avatars", [])]

    @staticmethod
    def get_preset_by_id(preset_id: str) -> Optional[AvatarPreset]:
        """Find a single preset by its ID."""
        for preset in AvatarService.get_preset_avatars():
            if preset.id == preset_id:
                return preset
        return None

    # ── User avatar CRUD ──────────────────────────────────────────────

    @staticmethod
    async def list_user_avatars(
        db: AsyncSession, user_id: uuid.UUID
    ) -> List[UserAvatar]:
        """Return all avatars owned by the user, active first."""
        stmt = (
            select(UserAvatar)
            .where(UserAvatar.user_id == user_id)
            .order_by(UserAvatar.is_active.desc(), UserAvatar.created_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_active_avatar(
        db: AsyncSession, user_id: uuid.UUID
    ) -> Optional[UserAvatar]:
        """Return the user's currently active avatar, or None."""
        stmt = select(UserAvatar).where(
            UserAvatar.user_id == user_id, UserAvatar.is_active.is_(True)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def save_avatar(
        db: AsyncSession,
        user_id: uuid.UUID,
        data: UserAvatarCreate,
    ) -> UserAvatar:
        """Persist a new avatar for the user (max limit enforced)."""
        # Enforce per-user limit
        existing = await AvatarService.list_user_avatars(db, user_id)
        if len(existing) >= settings.avatar_max_per_user:
            raise ValueError(
                f"Maximum of {settings.avatar_max_per_user} avatars per user."
            )

        avatar = UserAvatar(
            user_id=user_id,
            name=data.name,
            avatar_type=AvatarType(data.avatar_type),
            model_url=data.model_url,
            thumbnail_url=data.thumbnail_url,
            rpm_avatar_id=data.rpm_avatar_id,
            customization_data=data.customization_data,
            is_active=False,
        )
        db.add(avatar)
        await db.flush()
        return avatar

    @staticmethod
    async def activate_avatar(
        db: AsyncSession,
        user_id: uuid.UUID,
        avatar_id: uuid.UUID,
    ) -> UserAvatar:
        """Set *avatar_id* as active; deactivate all others for the user."""
        # Deactivate all
        await db.execute(
            update(UserAvatar)
            .where(UserAvatar.user_id == user_id)
            .values(is_active=False)
        )

        # Activate the chosen one
        stmt = select(UserAvatar).where(
            UserAvatar.id == avatar_id, UserAvatar.user_id == user_id
        )
        result = await db.execute(stmt)
        avatar = result.scalar_one_or_none()
        if avatar is None:
            raise ValueError("Avatar not found.")

        avatar.is_active = True
        await db.flush()
        return avatar

    @staticmethod
    async def delete_avatar(
        db: AsyncSession, user_id: uuid.UUID, avatar_id: uuid.UUID
    ) -> None:
        """Delete a user avatar. Cannot delete an active avatar."""
        stmt = select(UserAvatar).where(
            UserAvatar.id == avatar_id, UserAvatar.user_id == user_id
        )
        result = await db.execute(stmt)
        avatar = result.scalar_one_or_none()
        if avatar is None:
            raise ValueError("Avatar not found.")
        if avatar.is_active:
            raise ValueError("Cannot delete the currently active avatar. Activate another first.")

        await db.delete(avatar)
        await db.flush()

    # ── Ready Player Me integration ───────────────────────────────────

    @staticmethod
    async def initiate_rpm_session(user_id: uuid.UUID) -> str:
        """
        Return the RPM editor URL for the user to create/customise an avatar.

        The RPM editor is an iframe/redirect; the frontend listens for the
        ``message`` event and posts the result back via the rpm-callback
        endpoint.
        """
        subdomain = settings.rpm_subdomain or "demo"
        return f"https://{subdomain}.readyplayer.me/avatar?frameApi"

    @staticmethod
    async def process_rpm_callback(
        db: AsyncSession,
        user_id: uuid.UUID,
        rpm_avatar_id: str,
        model_url: str,
        thumbnail_url: Optional[str] = None,
    ) -> UserAvatar:
        """Save a newly created RPM avatar after the editor callback."""
        data = UserAvatarCreate(
            name=f"Custom Avatar",
            avatar_type="custom_rpm",
            model_url=model_url,
            thumbnail_url=thumbnail_url,
            rpm_avatar_id=rpm_avatar_id,
            customization_data={"source": "ready_player_me"},
        )
        return await AvatarService.save_avatar(db, user_id, data)

    # ── Gesture annotation parsing ────────────────────────────────────

    @staticmethod
    def parse_gesture_annotations(
        annotated_text: str,
    ) -> tuple[str, List[GestureAnnotation]]:
        """
        Extract ``[gesture]`` markers from LLM output.

        Returns the clean text (markers removed) and a list of
        :class:`GestureAnnotation` objects with estimated timestamps.
        """
        annotations: List[GestureAnnotation] = []
        clean_parts: List[str] = []
        last_end = 0

        for match in _GESTURE_RE.finditer(annotated_text):
            # Text between the previous marker and this one
            clean_parts.append(annotated_text[last_end : match.start()])
            char_pos = len("".join(clean_parts))

            # Estimate timestamp: count words up to this point
            words_so_far = len("".join(clean_parts).split())
            est_ms = int((words_so_far / _TTS_WPM) * 60_000)

            annotations.append(
                GestureAnnotation(
                    gesture=match.group(1).lower(),
                    char_position=char_pos,
                    timestamp_ms=est_ms,
                )
            )
            last_end = match.end()

        # Remaining text after last marker
        clean_parts.append(annotated_text[last_end:])
        clean_text = "".join(clean_parts).strip()
        # Collapse multiple spaces that might result from marker removal
        clean_text = re.sub(r"  +", " ", clean_text)

        return clean_text, annotations
