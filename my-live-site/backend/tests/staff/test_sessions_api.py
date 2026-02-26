"""Tests for Staff Sessions API endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_sessions(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/sessions/"""
    response = await async_client.get(
        "/api/v1/staff/sessions/",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data


@pytest.mark.asyncio
async def test_list_sessions_with_filters(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/sessions/ with query filters"""
    response = await async_client.get(
        "/api/v1/staff/sessions/?status=scheduled&session_type=class&page=1&page_size=10",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"


@pytest.mark.asyncio
async def test_get_session_detail(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/sessions/{session_id}"""
    response = await async_client.get(
        "/api/v1/staff/sessions/session-test-123",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    # 200 if session exists, 404 if not found -- both are valid authenticated responses
    assert response.status_code in (200, 404)


@pytest.mark.asyncio
async def test_create_session(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/sessions/"""
    session_data = {
        "title": "Test Live Session",
        "description": "A test session for unit testing",
        "session_type": "class",
        "scheduled_start": "2026-03-01T09:00:00Z",
        "scheduled_end": "2026-03-01T10:00:00Z",
        "max_participants": 30
    }
    response = await async_client.post(
        "/api/v1/staff/sessions/",
        json=session_data,
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data


@pytest.mark.asyncio
async def test_generate_join_token(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/sessions/{session_id}/token"""
    response = await async_client.post(
        "/api/v1/staff/sessions/session-test-123/token",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    # 200 if session exists, 404 if not found
    assert response.status_code in (200, 404)


@pytest.mark.asyncio
async def test_sessions_unauthorized(async_client: AsyncClient):
    """Test sessions access without authentication"""
    response = await async_client.get("/api/v1/staff/sessions/")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_sessions_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test staff sessions blocked for student role"""
    response = await async_client.get(
        "/api/v1/staff/sessions/",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_session_unauthorized(async_client: AsyncClient):
    """Test session creation without authentication"""
    session_data = {
        "title": "Unauthorized Session",
        "session_type": "class",
        "scheduled_start": "2026-03-01T09:00:00Z",
        "scheduled_end": "2026-03-01T10:00:00Z"
    }
    response = await async_client.post(
        "/api/v1/staff/sessions/",
        json=session_data
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_session_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test session creation blocked for student role"""
    session_data = {
        "title": "Forbidden Session",
        "session_type": "class",
        "scheduled_start": "2026-03-01T09:00:00Z",
        "scheduled_end": "2026-03-01T10:00:00Z"
    }
    response = await async_client.post(
        "/api/v1/staff/sessions/",
        json=session_data,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403
