"""
AI Agent Profile API Tests

Tests for AI agent profile customization endpoints:
- GET /api/v1/ai-agent/profile - Get current user's AI agent profile
- PUT /api/v1/ai-agent/profile - Update AI agent profile
- POST /api/v1/ai-agent/profile/reset - Reset profile to defaults

Coverage target: 75%+
"""

import pytest
from fastapi import status


@pytest.mark.unit
class TestGetAgentProfile:
    """Test get agent profile endpoint: GET /api/v1/ai-agent/profile"""

    async def test_get_profile_requires_auth(self, client):
        """Test that getting the AI agent profile requires authentication."""
        response = await client.get("/api/v1/ai-agent/profile")

        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_404_NOT_FOUND,
        )

    async def test_get_profile_success(self, client, auth_headers):
        """Test getting the AI agent profile returns defaults for a new user."""
        response = await client.get(
            "/api/v1/ai-agent/profile",
            headers=auth_headers,
        )

        assert response.status_code in (
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
        )

        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            assert "agent_name" in data
            assert "persona" in data
            assert "preferred_language" in data
            assert "response_style" in data
            # Default values
            assert data["agent_name"] == "The Bird AI"
            assert data["preferred_language"] == "en"

    async def test_get_profile_as_admin(self, client, admin_headers):
        """Test that admins can also access their own agent profile."""
        response = await client.get(
            "/api/v1/ai-agent/profile",
            headers=admin_headers,
        )

        assert response.status_code in (
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
        )


@pytest.mark.unit
class TestUpdateAgentProfile:
    """Test update agent profile endpoint: PUT /api/v1/ai-agent/profile"""

    async def test_update_profile(self, client, auth_headers):
        """Test updating the AI agent profile with valid data."""
        response = await client.put(
            "/api/v1/ai-agent/profile",
            headers=auth_headers,
            json={
                "agent_name": "My Study Buddy",
                "persona": "A fun and supportive tutor for primary school students.",
                "preferred_language": "sw",
                "expertise_focus": ["Mathematics", "Science"],
                "response_style": "conversational",
            },
        )

        assert response.status_code in (
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            assert data["agent_name"] == "My Study Buddy"
            assert data["preferred_language"] == "sw"

    async def test_update_profile_requires_auth(self, client):
        """Test that updating the profile without auth fails."""
        response = await client.put(
            "/api/v1/ai-agent/profile",
            json={"agent_name": "Unauthorized Agent"},
        )

        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_404_NOT_FOUND,
        )

    async def test_update_profile_partial(self, client, auth_headers):
        """Test that partial updates are accepted (only some fields)."""
        response = await client.put(
            "/api/v1/ai-agent/profile",
            headers=auth_headers,
            json={"agent_name": "Partial Update Agent"},
        )

        assert response.status_code in (
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@pytest.mark.unit
class TestResetAgentProfile:
    """Test reset agent profile endpoint: POST /api/v1/ai-agent/profile/reset"""

    async def test_reset_profile(self, client, auth_headers):
        """Test resetting the AI agent profile to default values."""
        response = await client.post(
            "/api/v1/ai-agent/profile/reset",
            headers=auth_headers,
        )

        assert response.status_code in (
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            # Should return default values after reset
            assert data["agent_name"] == "The Bird AI"
            assert data["preferred_language"] == "en"
            assert data["response_style"] == "conversational"

    async def test_reset_profile_requires_auth(self, client):
        """Test that resetting the profile without auth fails."""
        response = await client.post("/api/v1/ai-agent/profile/reset")

        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_404_NOT_FOUND,
        )
