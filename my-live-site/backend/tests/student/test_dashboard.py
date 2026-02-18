"""
Tests for Student Dashboard API Routes

Endpoints under test:
- GET  /api/v1/student/dashboard/today        -- today's dashboard overview
- POST /api/v1/student/dashboard/mood          -- mood check-in
- GET  /api/v1/student/dashboard/teacher-sync  -- teacher sync notes
- GET  /api/v1/student/dashboard/quote         -- daily quote
- PUT  /api/v1/student/dashboard/daily-plan    -- update daily plan
"""
import pytest
import uuid
from unittest.mock import patch, AsyncMock, MagicMock
from httpx import AsyncClient


BASE = "/api/v1/student/dashboard"


# ──────────────────────────────────────────────────────────────
# GET /today
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_today_dashboard_success(
    async_client: AsyncClient,
    override_current_user,
    mock_dashboard_data,
):
    """Authenticated student receives full dashboard payload."""
    with patch(
        "app.api.v1.student.dashboard.DashboardService"
    ) as MockService:
        instance = MockService.return_value
        instance.get_today_dashboard = AsyncMock(return_value=mock_dashboard_data)

        response = await async_client.get(
            f"{BASE}/today",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "greeting" in data
    assert "daily_plan" in data
    assert "streak" in data
    assert "xp" in data


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_today_dashboard_requires_auth(async_client: AsyncClient):
    """Request without Authorization header returns 401 or 403."""
    response = await async_client.get(f"{BASE}/today")
    assert response.status_code in [401, 403]


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_today_dashboard_non_student_forbidden(
    async_client: AsyncClient,
    override_current_user_admin,
):
    """Admin user gets 403 on a student-only endpoint."""
    response = await async_client.get(
        f"{BASE}/today",
        headers={"Authorization": "Bearer fake-token"},
    )
    assert response.status_code == 403


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_today_dashboard_no_student_profile(
    async_client: AsyncClient,
    override_current_user_no_profile,
):
    """Student user without student_id returns 400."""
    response = await async_client.get(
        f"{BASE}/today",
        headers={"Authorization": "Bearer fake-token"},
    )
    assert response.status_code == 400
    assert "Student profile not found" in response.json()["detail"]


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_today_dashboard_service_value_error(
    async_client: AsyncClient,
    override_current_user,
):
    """When DashboardService raises ValueError, endpoint returns 404."""
    with patch(
        "app.api.v1.student.dashboard.DashboardService"
    ) as MockService:
        instance = MockService.return_value
        instance.get_today_dashboard = AsyncMock(
            side_effect=ValueError("Student record not found")
        )

        response = await async_client.get(
            f"{BASE}/today",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 404


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_today_dashboard_service_exception(
    async_client: AsyncClient,
    override_current_user,
):
    """Generic service exception maps to 500."""
    with patch(
        "app.api.v1.student.dashboard.DashboardService"
    ) as MockService:
        instance = MockService.return_value
        instance.get_today_dashboard = AsyncMock(
            side_effect=RuntimeError("DB connection lost")
        )

        response = await async_client.get(
            f"{BASE}/today",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 500


# ──────────────────────────────────────────────────────────────
# POST /mood
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_submit_mood_check_in_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Valid mood check-in returns 200 with confirmation."""
    mock_entry = MagicMock()
    mock_entry.id = uuid.uuid4()
    mock_entry.mood_type.value = "happy"
    mock_entry.energy_level = 4
    mock_entry.note = "Feeling great"
    mock_entry.timestamp = "2026-02-15T08:00:00"

    with patch(
        "app.api.v1.student.dashboard.DashboardService"
    ) as MockService:
        instance = MockService.return_value
        instance.submit_mood_check_in = AsyncMock(return_value=mock_entry)

        response = await async_client.post(
            f"{BASE}/mood",
            headers={"Authorization": "Bearer fake-token"},
            json={
                "mood_type": "happy",
                "energy_level": 4,
                "note": "Feeling great",
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert data["mood_type"] == "happy"
    assert data["energy_level"] == 4
    assert "message" in data


@pytest.mark.unit
@pytest.mark.asyncio
async def test_submit_mood_invalid_energy_level(
    async_client: AsyncClient,
    override_current_user,
):
    """Energy level outside 1-5 returns 400."""
    response = await async_client.post(
        f"{BASE}/mood",
        headers={"Authorization": "Bearer fake-token"},
        json={"mood_type": "happy", "energy_level": 10},
    )
    assert response.status_code == 400
    assert "Energy level must be between 1 and 5" in response.json()["detail"]


# ──────────────────────────────────────────────────────────────
# GET /teacher-sync
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_teacher_sync_notes_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Returns list of teacher sync notes."""
    mock_notes = [
        {"id": str(uuid.uuid4()), "note": "Review chapter 5", "teacher": "Ms. Wanjiku"}
    ]

    with patch(
        "app.api.v1.student.dashboard.DashboardService"
    ) as MockService:
        instance = MockService.return_value
        instance.get_teacher_sync_notes = AsyncMock(return_value=mock_notes)

        response = await async_client.get(
            f"{BASE}/teacher-sync",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1


# ──────────────────────────────────────────────────────────────
# PUT /daily-plan
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_update_daily_plan_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Valid plan update returns updated plan data."""
    mock_plan = MagicMock()
    mock_plan.date = "2026-02-15"
    mock_plan.items = [{"task": "Math homework", "completed": True}]
    mock_plan.manually_edited = True

    with patch(
        "app.api.v1.student.dashboard.DashboardService"
    ) as MockService:
        instance = MockService.return_value
        instance.update_daily_plan = AsyncMock(return_value=mock_plan)

        response = await async_client.put(
            f"{BASE}/daily-plan",
            headers={"Authorization": "Bearer fake-token"},
            json={"items": [{"task": "Math homework", "completed": True}]},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["manually_edited"] is True
    assert "message" in data


@pytest.mark.unit
@pytest.mark.asyncio
async def test_update_daily_plan_non_student_forbidden(
    async_client: AsyncClient,
    override_current_user_instructor,
):
    """Instructor cannot update a student daily plan."""
    response = await async_client.put(
        f"{BASE}/daily-plan",
        headers={"Authorization": "Bearer fake-token"},
        json={"items": []},
    )
    assert response.status_code == 403
