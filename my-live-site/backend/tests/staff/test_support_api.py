"""Tests for Staff Support & Tickets API"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_tickets(async_client: AsyncClient, staff_token: str):
    """Test GET /api/v1/staff/support/tickets"""
    response = await async_client.get(
        "/api/v1/staff/support/tickets?limit=10",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "tickets" in data
    assert "total" in data

@pytest.mark.asyncio
async def test_create_ticket(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/support/tickets"""
    ticket_data = {
        "subject": "Test Ticket",
        "description": "Test description",
        "priority": "medium",
        "category": "technical"
    }
    response = await async_client.post(
        "/api/v1/staff/support/tickets",
        json=ticket_data,
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["subject"] == "Test Ticket"
    assert data["status"] == "open"

@pytest.mark.asyncio
async def test_assign_ticket(async_client: AsyncClient, staff_token: str, ticket_id: str):
    """Test POST /api/v1/staff/support/tickets/{ticket_id}/assign"""
    response = await async_client.post(
        f"/api/v1/staff/support/tickets/{ticket_id}/assign",
        json={"staff_id": "staff-123"},
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_sla_breach_alert(async_client: AsyncClient, staff_token: str):
    """Test SLA breach detection"""
    response = await async_client.get(
        "/api/v1/staff/support/sla-breaches",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
