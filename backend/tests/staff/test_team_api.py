"""Tests for Staff Team API endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_my_performance(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/team/my-performance"""
    response = await async_client.get(
        "/api/v1/staff/team/my-performance",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data


@pytest.mark.asyncio
async def test_get_team_pulse(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/team/pulse"""
    response = await async_client.get(
        "/api/v1/staff/team/pulse",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    # 200 if user has team-lead privileges, 403 if not
    assert response.status_code in (200, 403)


@pytest.mark.asyncio
async def test_list_learning_resources(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/team/learning-resources"""
    response = await async_client.get(
        "/api/v1/staff/team/learning-resources",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data


@pytest.mark.asyncio
async def test_list_learning_resources_with_filters(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/team/learning-resources with category filter"""
    response = await async_client.get(
        "/api/v1/staff/team/learning-resources?category=onboarding&page=1&page_size=10",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"


@pytest.mark.asyncio
async def test_rebalance_workload(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/team/workload/rebalance"""
    response = await async_client.post(
        "/api/v1/staff/team/workload/rebalance",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    # 200 if user has team-lead privileges, 403 if not
    assert response.status_code in (200, 403)


@pytest.mark.asyncio
async def test_list_team_members(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/team/members"""
    response = await async_client.get(
        "/api/v1/staff/team/members",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    # 200 if user has team-lead privileges, 403 if not
    assert response.status_code in (200, 403)


@pytest.mark.asyncio
async def test_performance_unauthorized(async_client: AsyncClient):
    """Test team performance access without authentication"""
    response = await async_client.get("/api/v1/staff/team/my-performance")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_performance_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test staff team performance blocked for student role"""
    response = await async_client.get(
        "/api/v1/staff/team/my-performance",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_resources_unauthorized(async_client: AsyncClient):
    """Test learning resources access without authentication"""
    response = await async_client.get("/api/v1/staff/team/learning-resources")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_resources_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test learning resources blocked for student role"""
    response = await async_client.get(
        "/api/v1/staff/team/learning-resources",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_pulse_unauthorized(async_client: AsyncClient):
    """Test team pulse access without authentication"""
    response = await async_client.get("/api/v1/staff/team/pulse")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_pulse_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test team pulse blocked for student role"""
    response = await async_client.get(
        "/api/v1/staff/team/pulse",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403
