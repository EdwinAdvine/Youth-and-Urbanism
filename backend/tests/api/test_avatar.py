"""
Tests for Avatar REST API endpoints.

Tests cover:
- Preset avatar listing and retrieval
- User avatar CRUD (save, list, activate, delete)
- Ready Player Me integration endpoints
- Authentication requirements
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from app.models.user_avatar import AvatarType, UserAvatar


@pytest.fixture(autouse=True)
def mock_redis_blacklist():
    """Mock Redis token blacklist to allow auth in tests (Redis client not initialized in test env)."""
    with patch("app.api.v1.auth.is_token_blacklisted", new_callable=AsyncMock, return_value=False):
        yield


@pytest.mark.unit
class TestAvatarPresetEndpoints:
    """Test preset avatar gallery endpoints."""

    async def test_list_presets_authenticated(self, client, auth_headers):
        """GET /api/v1/avatar/presets returns preset list."""
        response = await client.get("/api/v1/avatar/presets", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Check preset structure
        preset = data[0]
        assert "id" in preset
        assert "name" in preset
        assert "model_url" in preset
        assert "style" in preset
        assert preset["style"] in ("stylized", "realistic")

    async def test_list_presets_unauthenticated(self, client):
        """GET /api/v1/avatar/presets requires auth."""
        response = await client.get("/api/v1/avatar/presets")
        assert response.status_code in (401, 403)

    async def test_get_preset_by_id(self, client, auth_headers):
        """GET /api/v1/avatar/presets/{id} returns a single preset."""
        # First get list to know a valid ID
        list_response = await client.get("/api/v1/avatar/presets", headers=auth_headers)
        presets = list_response.json()
        assert len(presets) > 0
        preset_id = presets[0]["id"]
        response = await client.get(
            f"/api/v1/avatar/presets/{preset_id}", headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json()["id"] == preset_id

    async def test_get_preset_not_found(self, client, auth_headers):
        """GET /api/v1/avatar/presets/{id} returns 404 for invalid ID."""
        response = await client.get(
            "/api/v1/avatar/presets/nonexistent_id", headers=auth_headers
        )
        assert response.status_code == 404


@pytest.mark.unit
class TestAvatarCRUDEndpoints:
    """Test user avatar CRUD endpoints."""

    async def test_list_my_avatars_empty(self, client, auth_headers):
        """GET /api/v1/avatar/my-avatars returns empty list for new user."""
        response = await client.get("/api/v1/avatar/my-avatars", headers=auth_headers)
        assert response.status_code == 200
        assert response.json() == []

    async def test_save_avatar(self, client, test_user, auth_headers):
        """POST /api/v1/avatar/save creates a new avatar."""
        payload = {
            "name": "My Test Avatar",
            "avatar_type": "preset_stylized",
            "model_url": "https://models.readyplayer.me/test.glb",
            "thumbnail_url": "https://cdn.example.com/thumb.png",
            "customization_data": {"preset_id": "test_1"},
        }
        response = await client.post(
            "/api/v1/avatar/save", json=payload, headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "My Test Avatar"
        assert data["avatar_type"] == "preset_stylized"
        assert data["user_id"] == str(test_user.id)
        assert data["is_active"] is False
        assert "id" in data
        assert "created_at" in data

    async def test_save_avatar_unauthenticated(self, client):
        """POST /api/v1/avatar/save requires auth."""
        payload = {
            "name": "Unauthorized Avatar",
            "avatar_type": "preset_stylized",
            "model_url": "https://example.com/avatar.glb",
        }
        response = await client.post("/api/v1/avatar/save", json=payload)
        assert response.status_code in (401, 403)

    async def test_save_avatar_invalid_type(self, client, auth_headers):
        """POST /api/v1/avatar/save rejects invalid avatar_type."""
        payload = {
            "name": "Bad Type",
            "avatar_type": "invalid_type",
            "model_url": "https://example.com/avatar.glb",
        }
        response = await client.post(
            "/api/v1/avatar/save", json=payload, headers=auth_headers
        )
        assert response.status_code == 422

    async def test_list_my_avatars_after_save(self, client, test_user, auth_headers, db_session):
        """GET /api/v1/avatar/my-avatars returns saved avatars."""
        # Create an avatar directly in DB
        avatar = UserAvatar(
            user_id=test_user.id,
            name="Direct Avatar",
            avatar_type=AvatarType.preset_stylized,
            model_url="https://example.com/a.glb",
            is_active=False,
            customization_data={},
        )
        db_session.add(avatar)
        await db_session.commit()

        response = await client.get("/api/v1/avatar/my-avatars", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Direct Avatar"

    async def test_get_active_avatar_none(self, client, auth_headers):
        """GET /api/v1/avatar/active returns 404 when no active avatar."""
        response = await client.get("/api/v1/avatar/active", headers=auth_headers)
        assert response.status_code == 404

    async def test_activate_avatar(self, client, test_user, auth_headers, db_session):
        """PUT /api/v1/avatar/{id}/activate sets avatar as active."""
        # Create an avatar
        avatar = UserAvatar(
            user_id=test_user.id,
            name="To Activate",
            avatar_type=AvatarType.preset_realistic,
            model_url="https://example.com/b.glb",
            is_active=False,
            customization_data={},
        )
        db_session.add(avatar)
        await db_session.commit()
        await db_session.refresh(avatar)

        response = await client.put(
            f"/api/v1/avatar/{avatar.id}/activate", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is True
        assert data["name"] == "To Activate"

    async def test_activate_deactivates_others(self, client, test_user, auth_headers, db_session):
        """Activating one avatar deactivates all others."""
        avatar1 = UserAvatar(
            user_id=test_user.id,
            name="Avatar 1",
            avatar_type=AvatarType.preset_stylized,
            model_url="https://example.com/1.glb",
            is_active=True,
            customization_data={},
        )
        avatar2 = UserAvatar(
            user_id=test_user.id,
            name="Avatar 2",
            avatar_type=AvatarType.preset_stylized,
            model_url="https://example.com/2.glb",
            is_active=False,
            customization_data={},
        )
        db_session.add_all([avatar1, avatar2])
        await db_session.commit()
        await db_session.refresh(avatar2)

        # Activate avatar2
        response = await client.put(
            f"/api/v1/avatar/{avatar2.id}/activate", headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json()["is_active"] is True

        # Verify avatar1 is no longer active
        active_response = await client.get("/api/v1/avatar/active", headers=auth_headers)
        assert active_response.status_code == 200
        assert active_response.json()["name"] == "Avatar 2"

    async def test_activate_nonexistent_avatar(self, client, auth_headers):
        """PUT /api/v1/avatar/{id}/activate returns 404 for invalid ID."""
        fake_id = str(uuid4())
        response = await client.put(
            f"/api/v1/avatar/{fake_id}/activate", headers=auth_headers
        )
        assert response.status_code == 404

    async def test_delete_avatar(self, client, test_user, auth_headers, db_session):
        """DELETE /api/v1/avatar/{id} removes an inactive avatar."""
        avatar = UserAvatar(
            user_id=test_user.id,
            name="To Delete",
            avatar_type=AvatarType.preset_stylized,
            model_url="https://example.com/d.glb",
            is_active=False,
            customization_data={},
        )
        db_session.add(avatar)
        await db_session.commit()
        await db_session.refresh(avatar)

        response = await client.delete(
            f"/api/v1/avatar/{avatar.id}", headers=auth_headers
        )
        assert response.status_code == 204

        # Verify it's gone
        list_response = await client.get("/api/v1/avatar/my-avatars", headers=auth_headers)
        assert len(list_response.json()) == 0

    async def test_delete_active_avatar_fails(self, client, test_user, auth_headers, db_session):
        """DELETE /api/v1/avatar/{id} rejects deleting the active avatar."""
        avatar = UserAvatar(
            user_id=test_user.id,
            name="Active Avatar",
            avatar_type=AvatarType.preset_stylized,
            model_url="https://example.com/active.glb",
            is_active=True,
            customization_data={},
        )
        db_session.add(avatar)
        await db_session.commit()
        await db_session.refresh(avatar)

        response = await client.delete(
            f"/api/v1/avatar/{avatar.id}", headers=auth_headers
        )
        assert response.status_code == 400
        assert "active" in response.json()["detail"].lower()


@pytest.mark.unit
class TestRPMEndpoints:
    """Test Ready Player Me integration endpoints."""

    async def test_upload_photo_returns_rpm_url(self, client, auth_headers):
        """POST /api/v1/avatar/upload-photo returns an RPM session URL."""
        response = await client.post(
            "/api/v1/avatar/upload-photo", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "rpm_session_url" in data
        assert "readyplayer.me" in data["rpm_session_url"]

    async def test_rpm_callback_creates_avatar(self, client, test_user, auth_headers):
        """POST /api/v1/avatar/rpm-callback saves a new custom avatar."""
        payload = {
            "rpm_avatar_id": "rpm_test_123",
            "model_url": "https://models.readyplayer.me/rpm_test_123.glb",
            "thumbnail_url": "https://models.readyplayer.me/rpm_test_123.png",
        }
        response = await client.post(
            "/api/v1/avatar/rpm-callback", json=payload, headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["avatar_type"] == "custom_rpm"
        assert data["rpm_avatar_id"] == "rpm_test_123"
        assert data["user_id"] == str(test_user.id)
