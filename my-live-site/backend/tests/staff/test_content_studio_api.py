"""Tests for Staff Content Studio API endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_content(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/content-studio/content"""
    response = await async_client.get(
        "/api/v1/staff/content-studio/content",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_create_content(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/content-studio/content"""
    content_data = {
        "title": "Introduction to Kenyan Geography",
        "type": "lesson",
        "subject": "social_studies",
        "grade_level": 5,
        "body": "Kenya is located in East Africa...",
        "tags": ["geography", "kenya", "cbc"]
    }
    response = await async_client.post(
        "/api/v1/staff/content-studio/content",
        json=content_data,
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Introduction to Kenyan Geography"


@pytest.mark.asyncio
async def test_content_studio_unauthorized(async_client: AsyncClient):
    """Test content studio access without authentication"""
    response = await async_client.get("/api/v1/staff/content-studio/content")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_content_studio_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test staff content studio blocked for student role"""
    response = await async_client.get(
        "/api/v1/staff/content-studio/content",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403
