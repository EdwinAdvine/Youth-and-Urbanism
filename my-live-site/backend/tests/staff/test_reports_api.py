"""Tests for Custom Reports API"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_report(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/reports"""
    report_data = {
        "name": "Test Report",
        "config": {
            "widgets": [
                {"type": "metric", "config": {"label": "Total Students"}}
            ]
        }
    }
    response = await async_client.post(
        "/api/v1/staff/reports",
        json=report_data,
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 201

@pytest.mark.asyncio
async def test_generate_report(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/reports/generate"""
    response = await async_client.post(
        "/api/v1/staff/reports/generate",
        json={"report_id": "report-123", "format": "pdf"},
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_schedule_report(async_client: AsyncClient, staff_token: str):
    """Test POST /api/v1/staff/reports/schedule"""
    schedule_data = {
        "report_id": "report-123",
        "frequency": "weekly",
        "recipients": ["staff@tuhs.co.ke"],
        "format": "pdf"
    }
    response = await async_client.post(
        "/api/v1/staff/reports/schedule",
        json=schedule_data,
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert response.status_code == 201
