"""Tests for Staff Live Support API endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_support_queue(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/live-support/queue"""
    response = await async_client.get(
        "/api/v1/staff/live-support/queue",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "sessions" in data
    assert "waiting_count" in data


@pytest.mark.asyncio
async def test_create_support_session(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/live-support/sessions"""
    session_data = {
        "user_id": "user-123",
        "type": "chat",
        "subject": "Login issue",
        "priority": "high"
    }
    response = await async_client.post(
        "/api/v1/staff/live-support/sessions",
        json=session_data,
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "active"
    assert data["type"] == "chat"


@pytest.mark.asyncio
async def test_live_support_unauthorized(async_client: AsyncClient):
    """Test live support access without authentication"""
    response = await async_client.get("/api/v1/staff/live-support/queue")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_live_support_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test staff live support blocked for student role"""
    response = await async_client.get(
        "/api/v1/staff/live-support/queue",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403
