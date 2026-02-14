"""Tests for Staff Insights & Analytics API endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_platform_health(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/insights/platform-health"""
    response = await async_client.get(
        "/api/v1/staff/insights/platform-health",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "uptime" in data
    assert "active_users" in data
    assert "error_rate" in data


@pytest.mark.asyncio
async def test_get_content_performance(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/insights/content-performance"""
    response = await async_client.get(
        "/api/v1/staff/insights/content-performance",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "top_courses" in data
    assert "engagement_metrics" in data


@pytest.mark.asyncio
async def test_get_support_metrics(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/insights/support-metrics"""
    response = await async_client.get(
        "/api/v1/staff/insights/support-metrics",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "avg_resolution_time" in data
    assert "satisfaction_score" in data
    assert "tickets_by_category" in data


@pytest.mark.asyncio
async def test_insights_unauthorized(async_client: AsyncClient):
    """Test insights access without authentication"""
    response = await async_client.get("/api/v1/staff/insights/platform-health")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_insights_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test staff insights blocked for student role"""
    response = await async_client.get(
        "/api/v1/staff/insights/platform-health",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403
