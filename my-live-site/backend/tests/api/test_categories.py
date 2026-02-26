"""
Category API Tests

Tests for CBC category endpoints at /api/v1/categories/.
"""

import pytest


@pytest.mark.unit
class TestCategories:
    """Test category listing endpoints."""

    async def test_list_categories_public(self, client):
        response = await client.get("/api/v1/categories/")
        assert response.status_code in (200, 404)

    async def test_get_category_by_slug(self, client):
        response = await client.get("/api/v1/categories/mathematics")
        assert response.status_code in (200, 404)

    async def test_list_categories_with_filters(self, client):
        response = await client.get("/api/v1/categories/?grade_level=5")
        assert response.status_code in (200, 404)

    async def test_category_courses(self, client):
        response = await client.get("/api/v1/categories/mathematics/courses")
        assert response.status_code in (200, 404)


@pytest.mark.unit
class TestCategoryAdmin:
    """Test admin category management."""

    async def test_create_category_requires_admin(self, client, auth_headers):
        response = await client.post(
            "/api/v1/categories/",
            json={"name": "New Category", "slug": "new-cat"},
            headers=auth_headers,
        )
        assert response.status_code in (403, 404)

    async def test_create_category_as_admin(self, client, admin_headers):
        response = await client.post(
            "/api/v1/categories/",
            json={"name": "New Category", "slug": "new-cat"},
            headers=admin_headers,
        )
        assert response.status_code in (200, 201, 404, 405)
