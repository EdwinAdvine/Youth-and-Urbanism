"""Tests for Staff Notifications API endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_notifications(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/notifications/"""
    response = await async_client.get(
        "/api/v1/staff/notifications/",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "success"


@pytest.mark.asyncio
async def test_list_notifications_with_filters(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/notifications/ with query filters"""
    response = await async_client.get(
        "/api/v1/staff/notifications/?is_read=false&category=alert&page=1&page_size=10",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "status" in data


@pytest.mark.asyncio
async def test_mark_notifications_read(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/notifications/mark-read"""
    response = await async_client.post(
        "/api/v1/staff/notifications/mark-read",
        json={"notification_ids": ["notif-test-1", "notif-test-2"]},
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"


@pytest.mark.asyncio
async def test_mark_all_notifications_read(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/notifications/mark-all-read"""
    response = await async_client.post(
        "/api/v1/staff/notifications/mark-all-read",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"


@pytest.mark.asyncio
async def test_delete_notification(async_client: AsyncClient, staff_token: str):
    """Test DELETE /api/v1/staff/notifications/{notification_id}"""
    response = await async_client.delete(
        "/api/v1/staff/notifications/notif-test-123",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    # 200 if found or 404 if not found -- both are valid authenticated responses
    assert response.status_code in (200, 404)


@pytest.mark.asyncio
async def test_notifications_unauthorized(async_client: AsyncClient):
    """Test notifications access without authentication"""
    response = await async_client.get("/api/v1/staff/notifications/")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_notifications_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test staff notifications blocked for student role"""
    response = await async_client.get(
        "/api/v1/staff/notifications/",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_mark_read_unauthorized(async_client: AsyncClient):
    """Test mark-read without authentication"""
    response = await async_client.post(
        "/api/v1/staff/notifications/mark-read",
        json={"notification_ids": ["notif-1"]}
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_mark_read_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test mark-read blocked for student role"""
    response = await async_client.post(
        "/api/v1/staff/notifications/mark-read",
        json={"notification_ids": ["notif-1"]},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403
