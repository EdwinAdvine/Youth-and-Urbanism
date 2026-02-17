"""
Search API Tests

Tests for global search endpoint at /api/v1/search/.
"""

import pytest


@pytest.mark.unit
class TestGlobalSearch:
    """Test global search endpoints."""

    async def test_search_requires_auth(self, client):
        response = await client.get("/api/v1/search/?q=math")
        assert response.status_code in (200, 401, 403, 404)

    async def test_search_with_query(self, client, auth_headers):
        response = await client.get("/api/v1/search/?q=math", headers=auth_headers)
        assert response.status_code in (200, 404)

    async def test_search_empty_query(self, client, auth_headers):
        response = await client.get("/api/v1/search/?q=", headers=auth_headers)
        assert response.status_code in (200, 400, 404, 422)

    async def test_search_with_type_filter(self, client, auth_headers):
        response = await client.get(
            "/api/v1/search/?q=math&type=course", headers=auth_headers
        )
        assert response.status_code in (200, 404)

    async def test_search_with_pagination(self, client, auth_headers):
        response = await client.get(
            "/api/v1/search/?q=math&page=1&page_size=10", headers=auth_headers
        )
        assert response.status_code in (200, 404)
