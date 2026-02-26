"""Tests for Knowledge Base API"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_search_kb(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/kb/search"""
    response = await async_client.get(
        "/api/v1/staff/kb/search?q=test&limit=10",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "results" in data

@pytest.mark.asyncio
async def test_create_article(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/kb/articles"""
    article_data = {
        "title": "Test Article",
        "content": "# Test\nThis is a test article",
        "category": "technical",
        "tags": ["test", "guide"]
    }
    response = await async_client.post(
        "/api/v1/staff/kb/articles",
        json=article_data,
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 201

@pytest.mark.asyncio
async def test_ai_suggestions(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/kb/ai-suggestions"""
    response = await async_client.get(
        "/api/v1/staff/kb/ai-suggestions",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get("suggestions"), list)
