"""Tests for Staff Student Progress API endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_progress_overview(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/progress/overview"""
    response = await async_client.get(
        "/api/v1/staff/progress/overview",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data


@pytest.mark.asyncio
async def test_get_progress_overview_with_filters(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/progress/overview with query filters"""
    response = await async_client.get(
        "/api/v1/staff/progress/overview?grade_level=5&search=John&page=1&page_size=10",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"


@pytest.mark.asyncio
async def test_get_student_progress_detail(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/progress/{student_id}"""
    response = await async_client.get(
        "/api/v1/staff/progress/student-test-123",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    # 200 if student exists, 404 if not found
    assert response.status_code in (200, 404)


@pytest.mark.asyncio
async def test_get_learning_journey(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/progress/{student_id}/learning-journey"""
    response = await async_client.get(
        "/api/v1/staff/progress/student-test-123/learning-journey",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    # 200 if student exists, 404 if not found
    assert response.status_code in (200, 404)


@pytest.mark.asyncio
async def test_get_daily_activity(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/progress/{student_id}/daily-activity"""
    response = await async_client.get(
        "/api/v1/staff/progress/student-test-123/daily-activity?date_from=2026-01-01&date_to=2026-01-31",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    # 200 if student exists, 404 if not found
    assert response.status_code in (200, 404)


@pytest.mark.asyncio
async def test_progress_overview_unauthorized(async_client: AsyncClient):
    """Test progress overview access without authentication"""
    response = await async_client.get("/api/v1/staff/progress/overview")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_progress_overview_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test staff progress overview blocked for student role"""
    response = await async_client.get(
        "/api/v1/staff/progress/overview",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_student_detail_unauthorized(async_client: AsyncClient):
    """Test student progress detail without authentication"""
    response = await async_client.get("/api/v1/staff/progress/student-test-123")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_student_detail_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test student progress detail blocked for student role"""
    response = await async_client.get(
        "/api/v1/staff/progress/student-test-123",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403
