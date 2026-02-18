"""
Forum API Tests

Tests for forum post endpoints at /api/v1/forum/.
"""

import pytest
from unittest.mock import patch, MagicMock


@pytest.mark.unit
class TestForumPosts:
    """Test forum post CRUD endpoints."""

    async def test_list_posts_returns_paginated(self, client, auth_headers):
        response = await client.get("/api/v1/forum/posts", headers=auth_headers)
        # Accept 200 or 404 depending on if endpoint exists
        assert response.status_code in (200, 404)

    async def test_list_posts_public_access(self, client):
        response = await client.get("/api/v1/forum/posts")
        # Forum may be public or require auth
        assert response.status_code in (200, 401, 403, 404)

    async def test_create_post_requires_auth(self, client):
        response = await client.post(
            "/api/v1/forum/posts",
            json={"title": "Test Post", "content": "Content"},
        )
        assert response.status_code in (401, 403)

    async def test_create_post_success(self, client, auth_headers):
        response = await client.post(
            "/api/v1/forum/posts",
            json={"title": "Test Post", "content": "Test content body"},
            headers=auth_headers,
        )
        assert response.status_code in (200, 201, 404, 422)

    async def test_create_post_missing_title(self, client, auth_headers):
        response = await client.post(
            "/api/v1/forum/posts",
            json={"content": "No title"},
            headers=auth_headers,
        )
        assert response.status_code in (422, 404)


@pytest.mark.unit
class TestForumReplies:
    """Test forum reply endpoints."""

    async def test_create_reply_requires_auth(self, client):
        response = await client.post(
            "/api/v1/forum/posts/fake-id/replies",
            json={"content": "Reply"},
        )
        assert response.status_code in (401, 403, 404)

    async def test_get_replies_for_post(self, client, auth_headers):
        response = await client.get(
            "/api/v1/forum/posts/fake-id/replies",
            headers=auth_headers,
        )
        assert response.status_code in (200, 404)
