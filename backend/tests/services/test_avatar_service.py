"""
Tests for AvatarService business logic.

Tests cover:
- Preset avatar loading and lookup
- User avatar CRUD operations
- Per-user avatar limit enforcement
- Ready Player Me session creation
- Gesture annotation parsing
"""

import pytest
from unittest.mock import patch
from uuid import uuid4

from app.models.user_avatar import AvatarType, UserAvatar
from app.schemas.avatar_schemas import UserAvatarCreate
from app.services.avatar_service import AvatarService


@pytest.mark.unit
class TestPresetAvatars:
    """Test preset avatar catalogue methods."""

    def test_get_preset_avatars(self):
        """get_preset_avatars() returns a non-empty list."""
        presets = AvatarService.get_preset_avatars()
        assert isinstance(presets, list)
        assert len(presets) > 0

    def test_preset_has_required_fields(self):
        """Each preset has id, name, style, model_url, thumbnail_url."""
        presets = AvatarService.get_preset_avatars()
        for p in presets:
            assert p.id
            assert p.name
            assert p.style in ("stylized", "realistic")
            assert p.model_url.startswith("https://")
            assert p.thumbnail_url

    def test_get_preset_by_id_found(self):
        """get_preset_by_id() returns matching preset."""
        presets = AvatarService.get_preset_avatars()
        if presets:
            result = AvatarService.get_preset_by_id(presets[0].id)
            assert result is not None
            assert result.id == presets[0].id

    def test_get_preset_by_id_not_found(self):
        """get_preset_by_id() returns None for invalid ID."""
        result = AvatarService.get_preset_by_id("does_not_exist")
        assert result is None

    def test_presets_have_diverse_styles(self):
        """Presets include both stylized and realistic avatars."""
        presets = AvatarService.get_preset_avatars()
        styles = {p.style for p in presets}
        assert "stylized" in styles
        assert "realistic" in styles


@pytest.mark.unit
class TestUserAvatarCRUD:
    """Test user avatar CRUD service methods."""

    async def test_list_user_avatars_empty(self, db_session, test_user):
        """list_user_avatars() returns empty list for new user."""
        result = await AvatarService.list_user_avatars(db_session, test_user.id)
        assert result == []

    async def test_save_avatar(self, db_session, test_user):
        """save_avatar() persists a new avatar."""
        data = UserAvatarCreate(
            name="Test Avatar",
            avatar_type="preset_stylized",
            model_url="https://example.com/avatar.glb",
            thumbnail_url="https://example.com/thumb.png",
        )
        avatar = await AvatarService.save_avatar(db_session, test_user.id, data)
        await db_session.commit()

        assert avatar.name == "Test Avatar"
        assert avatar.user_id == test_user.id
        assert avatar.avatar_type == AvatarType.preset_stylized
        assert avatar.is_active is False
        assert avatar.id is not None

    async def test_save_avatar_enforces_limit(self, db_session, test_user):
        """save_avatar() raises ValueError when limit exceeded."""
        with patch("app.services.avatar_service.settings") as mock_settings:
            mock_settings.avatar_max_per_user = 2
            mock_settings.avatar_preset_config_path = "data/avatar_presets.json"

            # Create 2 avatars (at limit)
            for i in range(2):
                avatar = UserAvatar(
                    user_id=test_user.id,
                    name=f"Avatar {i}",
                    avatar_type=AvatarType.preset_stylized,
                    model_url=f"https://example.com/{i}.glb",
                    is_active=False,
                    customization_data={},
                )
                db_session.add(avatar)
            await db_session.commit()

            # Third should fail
            data = UserAvatarCreate(
                name="Over Limit",
                avatar_type="preset_stylized",
                model_url="https://example.com/over.glb",
            )
            with pytest.raises(ValueError, match="Maximum"):
                await AvatarService.save_avatar(db_session, test_user.id, data)

    async def test_list_user_avatars_active_first(self, db_session, test_user):
        """list_user_avatars() returns active avatar first."""
        inactive = UserAvatar(
            user_id=test_user.id,
            name="Inactive",
            avatar_type=AvatarType.preset_stylized,
            model_url="https://example.com/1.glb",
            is_active=False,
            customization_data={},
        )
        active = UserAvatar(
            user_id=test_user.id,
            name="Active",
            avatar_type=AvatarType.preset_realistic,
            model_url="https://example.com/2.glb",
            is_active=True,
            customization_data={},
        )
        db_session.add_all([inactive, active])
        await db_session.commit()

        result = await AvatarService.list_user_avatars(db_session, test_user.id)
        assert len(result) == 2
        assert result[0].name == "Active"
        assert result[0].is_active is True

    async def test_get_active_avatar(self, db_session, test_user):
        """get_active_avatar() returns the active avatar."""
        avatar = UserAvatar(
            user_id=test_user.id,
            name="Active One",
            avatar_type=AvatarType.preset_stylized,
            model_url="https://example.com/active.glb",
            is_active=True,
            customization_data={},
        )
        db_session.add(avatar)
        await db_session.commit()

        result = await AvatarService.get_active_avatar(db_session, test_user.id)
        assert result is not None
        assert result.name == "Active One"
        assert result.is_active is True

    async def test_get_active_avatar_none(self, db_session, test_user):
        """get_active_avatar() returns None when no avatar is active."""
        result = await AvatarService.get_active_avatar(db_session, test_user.id)
        assert result is None

    async def test_activate_avatar(self, db_session, test_user):
        """activate_avatar() sets avatar as active and deactivates others."""
        avatar1 = UserAvatar(
            user_id=test_user.id,
            name="First",
            avatar_type=AvatarType.preset_stylized,
            model_url="https://example.com/1.glb",
            is_active=True,
            customization_data={},
        )
        avatar2 = UserAvatar(
            user_id=test_user.id,
            name="Second",
            avatar_type=AvatarType.preset_realistic,
            model_url="https://example.com/2.glb",
            is_active=False,
            customization_data={},
        )
        db_session.add_all([avatar1, avatar2])
        await db_session.commit()
        await db_session.refresh(avatar2)

        result = await AvatarService.activate_avatar(db_session, test_user.id, avatar2.id)
        await db_session.commit()

        assert result.is_active is True
        assert result.name == "Second"

        # Verify first is deactivated
        await db_session.refresh(avatar1)
        assert avatar1.is_active is False

    async def test_activate_nonexistent_avatar(self, db_session, test_user):
        """activate_avatar() raises ValueError for invalid avatar ID."""
        fake_id = uuid4()
        with pytest.raises(ValueError, match="not found"):
            await AvatarService.activate_avatar(db_session, test_user.id, fake_id)

    async def test_delete_avatar(self, db_session, test_user):
        """delete_avatar() removes an inactive avatar."""
        avatar = UserAvatar(
            user_id=test_user.id,
            name="Deletable",
            avatar_type=AvatarType.preset_stylized,
            model_url="https://example.com/del.glb",
            is_active=False,
            customization_data={},
        )
        db_session.add(avatar)
        await db_session.commit()
        await db_session.refresh(avatar)

        await AvatarService.delete_avatar(db_session, test_user.id, avatar.id)
        await db_session.commit()

        # Verify it's gone
        result = await AvatarService.list_user_avatars(db_session, test_user.id)
        assert len(result) == 0

    async def test_delete_active_avatar_fails(self, db_session, test_user):
        """delete_avatar() raises ValueError for active avatar."""
        avatar = UserAvatar(
            user_id=test_user.id,
            name="Active",
            avatar_type=AvatarType.preset_stylized,
            model_url="https://example.com/active.glb",
            is_active=True,
            customization_data={},
        )
        db_session.add(avatar)
        await db_session.commit()
        await db_session.refresh(avatar)

        with pytest.raises(ValueError, match="active"):
            await AvatarService.delete_avatar(db_session, test_user.id, avatar.id)

    async def test_delete_nonexistent_avatar(self, db_session, test_user):
        """delete_avatar() raises ValueError for invalid ID."""
        with pytest.raises(ValueError, match="not found"):
            await AvatarService.delete_avatar(db_session, test_user.id, uuid4())

    async def test_avatars_isolated_between_users(self, db_session, test_user, test_admin):
        """User can only see their own avatars."""
        avatar = UserAvatar(
            user_id=test_user.id,
            name="Student Avatar",
            avatar_type=AvatarType.preset_stylized,
            model_url="https://example.com/student.glb",
            is_active=False,
            customization_data={},
        )
        db_session.add(avatar)
        await db_session.commit()

        # Admin should see no avatars
        admin_avatars = await AvatarService.list_user_avatars(db_session, test_admin.id)
        assert len(admin_avatars) == 0

        # Student should see their avatar
        student_avatars = await AvatarService.list_user_avatars(db_session, test_user.id)
        assert len(student_avatars) == 1


@pytest.mark.unit
class TestRPMIntegration:
    """Test Ready Player Me integration methods."""

    async def test_initiate_rpm_session(self):
        """initiate_rpm_session() returns an RPM editor URL."""
        url = await AvatarService.initiate_rpm_session(uuid4())
        assert "readyplayer.me" in url
        assert "frameApi" in url

    async def test_process_rpm_callback(self, db_session, test_user):
        """process_rpm_callback() creates a custom_rpm avatar."""
        avatar = await AvatarService.process_rpm_callback(
            db_session,
            test_user.id,
            rpm_avatar_id="rpm_abc123",
            model_url="https://models.readyplayer.me/rpm_abc123.glb",
            thumbnail_url="https://models.readyplayer.me/rpm_abc123.png",
        )
        await db_session.commit()

        assert avatar.avatar_type == AvatarType.custom_rpm
        assert avatar.rpm_avatar_id == "rpm_abc123"
        assert avatar.user_id == test_user.id
        assert avatar.is_active is False


@pytest.mark.unit
class TestGestureAnnotations:
    """Test gesture annotation parsing."""

    def test_parse_simple_gestures(self):
        """parse_gesture_annotations() extracts markers correctly."""
        text = "[smile] Hello! [nod] That's correct."
        clean, annotations = AvatarService.parse_gesture_annotations(text)

        assert clean == "Hello! That's correct."
        assert len(annotations) == 2
        assert annotations[0].gesture == "smile"
        assert annotations[1].gesture == "nod"

    def test_parse_no_gestures(self):
        """parse_gesture_annotations() handles text without markers."""
        text = "Plain text with no gestures."
        clean, annotations = AvatarService.parse_gesture_annotations(text)

        assert clean == "Plain text with no gestures."
        assert len(annotations) == 0

    def test_parse_all_gesture_types(self):
        """parse_gesture_annotations() handles all 8 gesture types."""
        text = "[smile] [nod] [think] [point] [excited] [calm] [wave] [emphasize] Done."
        clean, annotations = AvatarService.parse_gesture_annotations(text)

        assert len(annotations) == 8
        gesture_names = [a.gesture for a in annotations]
        assert "smile" in gesture_names
        assert "nod" in gesture_names
        assert "think" in gesture_names
        assert "point" in gesture_names
        assert "excited" in gesture_names
        assert "calm" in gesture_names
        assert "wave" in gesture_names
        assert "emphasize" in gesture_names

    def test_parse_case_insensitive(self):
        """parse_gesture_annotations() is case-insensitive for markers."""
        text = "[Smile] Hello [NOD] World"
        clean, annotations = AvatarService.parse_gesture_annotations(text)

        assert len(annotations) == 2
        assert annotations[0].gesture == "smile"
        assert annotations[1].gesture == "nod"

    def test_parse_preserves_surrounding_text(self):
        """Markers are removed cleanly from text."""
        text = "Great question! [think] Let me explain photosynthesis. [point] The key process happens here."
        clean, annotations = AvatarService.parse_gesture_annotations(text)

        assert "[think]" not in clean
        assert "[point]" not in clean
        assert "Great question!" in clean
        assert "Let me explain photosynthesis." in clean
        assert "The key process happens here." in clean

    def test_parse_timestamps_increase(self):
        """Gesture timestamps increase monotonically."""
        text = "[smile] First sentence here. [nod] Second sentence here. [point] Third sentence here."
        _, annotations = AvatarService.parse_gesture_annotations(text)

        assert len(annotations) == 3
        for i in range(1, len(annotations)):
            assert annotations[i].timestamp_ms >= annotations[i - 1].timestamp_ms

    def test_parse_ignores_unknown_markers(self):
        """Unknown markers like [jump] are left in the text."""
        text = "[smile] Hello [jump] World"
        clean, annotations = AvatarService.parse_gesture_annotations(text)

        assert len(annotations) == 1
        assert annotations[0].gesture == "smile"
        assert "[jump]" in clean
