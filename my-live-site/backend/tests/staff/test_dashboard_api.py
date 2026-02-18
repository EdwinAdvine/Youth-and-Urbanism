"""Tests for Staff Dashboard API endpoints"""
import pytest
from httpx import AsyncClient
from datetime import datetime

@pytest.mark.asyncio
async def test_get_dashboard_overview(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/dashboard/overview"""
    response = await async_client.get(
        "/api/v1/staff/dashboard/overview",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "urgent_tickets" in data
    assert "moderation_queue" in data
    assert "student_flags" in data
    assert "ai_agenda" in data

@pytest.mark.asyncio
async def test_get_counters(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/dashboard/counters"""
    response = await async_client.get(
        "/api/v1/staff/dashboard/counters",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get("open_tickets"), int)
    assert isinstance(data.get("pending_moderation"), int)
    assert isinstance(data.get("at_risk_students"), int)

@pytest.mark.asyncio
async def test_dashboard_unauthorized(async_client: AsyncClient):
    """Test dashboard access without authentication"""
    response = await async_client.get("/api/v1/staff/dashboard/overview")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_dashboard_student_forbidden(async_client: AsyncClient, student_token: str):
    """Test staff dashboard blocked for student role"""
    response = await async_client.get(
        "/api/v1/staff/dashboard/overview",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 403
