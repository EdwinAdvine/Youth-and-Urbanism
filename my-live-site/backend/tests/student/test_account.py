"""
Tests for Student Account API Routes

Endpoints under test:
- GET  /api/v1/student/account/notifications                      -- list notifications
- PUT  /api/v1/student/account/notifications/{id}/read            -- mark one read
- PUT  /api/v1/student/account/notifications/read-all             -- mark all read
- GET  /api/v1/student/account/notifications/settings             -- get notification prefs
- PUT  /api/v1/student/account/notifications/settings             -- update notification prefs
- GET  /api/v1/student/account/profile                            -- get profile
- PUT  /api/v1/student/account/profile                            -- update profile
- GET  /api/v1/student/account/preferences                        -- get preferences
- PUT  /api/v1/student/account/preferences                        -- update preferences
- GET  /api/v1/student/account/privacy                            -- get privacy settings
- PUT  /api/v1/student/account/privacy                            -- update privacy settings
- POST /api/v1/student/account/privacy/consent                    -- COPPA consent
- GET  /api/v1/student/account/privacy/audit                      -- privacy audit
- GET  /api/v1/student/account/teacher-access                     -- teacher access controls
- PUT  /api/v1/student/account/teacher-access/{teacher_id}        -- update teacher access
"""
import pytest
import uuid
from unittest.mock import patch, AsyncMock, MagicMock
from httpx import AsyncClient


BASE = "/api/v1/student/account"


# ──────────────────────────────────────────────────────────────
# GET /profile
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_profile_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student retrieves their profile."""
    mock_profile = {
        "first_name": "Test",
        "last_name": "Student",
        "bio": "I love science",
        "grade_level": 5,
        "learning_style": "visual",
        "interests": ["Science", "Art"],
    }

    with patch("app.api.v1.student.account.AccountService") as MockService:
        instance = MockService.return_value
        instance.get_profile = AsyncMock(return_value=mock_profile)

        response = await async_client.get(
            f"{BASE}/profile",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Test"
    assert data["grade_level"] == 5


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_profile_requires_auth(async_client: AsyncClient):
    """Unauthenticated request returns 401/403."""
    response = await async_client.get(f"{BASE}/profile")
    assert response.status_code in [401, 403]


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_profile_non_student_forbidden(
    async_client: AsyncClient,
    override_current_user_admin,
):
    """Admin cannot access student profile endpoint."""
    response = await async_client.get(
        f"{BASE}/profile",
        headers={"Authorization": "Bearer fake-token"},
    )
    assert response.status_code == 403


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_profile_no_student_profile(
    async_client: AsyncClient,
    override_current_user_no_profile,
):
    """Student without student_id returns 400."""
    response = await async_client.get(
        f"{BASE}/profile",
        headers={"Authorization": "Bearer fake-token"},
    )
    assert response.status_code == 400
    assert "Student profile not found" in response.json()["detail"]


# ──────────────────────────────────────────────────────────────
# PUT /profile
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_update_profile_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student updates their profile fields."""
    mock_updated = {
        "first_name": "Updated",
        "last_name": "Student",
        "bio": "I now love Math too!",
        "message": "Profile updated",
    }

    with patch("app.api.v1.student.account.AccountService") as MockService:
        instance = MockService.return_value
        instance.update_profile = AsyncMock(return_value=mock_updated)

        response = await async_client.put(
            f"{BASE}/profile",
            headers={"Authorization": "Bearer fake-token"},
            json={
                "first_name": "Updated",
                "bio": "I now love Math too!",
            },
        )

    assert response.status_code == 200


@pytest.mark.unit
@pytest.mark.asyncio
async def test_update_profile_no_student_profile(
    async_client: AsyncClient,
    override_current_user_no_profile,
):
    """Student without student_id cannot update profile."""
    response = await async_client.put(
        f"{BASE}/profile",
        headers={"Authorization": "Bearer fake-token"},
        json={"first_name": "Test"},
    )
    assert response.status_code == 400


# ──────────────────────────────────────────────────────────────
# GET /preferences
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_preferences_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student retrieves their preferences."""
    mock_prefs = {
        "theme": "dark",
        "language": "en",
        "ai_personality": "friendly",
        "font_size": "medium",
        "animations_enabled": True,
        "daily_goal_minutes": 60,
    }

    with patch("app.api.v1.student.account.AccountService") as MockService:
        instance = MockService.return_value
        instance.get_preferences = AsyncMock(return_value=mock_prefs)

        response = await async_client.get(
            f"{BASE}/preferences",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["theme"] == "dark"
    assert data["daily_goal_minutes"] == 60


# ──────────────────────────────────────────────────────────────
# PUT /preferences
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_update_preferences_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student updates preferences (partial update)."""
    mock_result = {"theme": "light", "message": "Preferences updated"}

    with patch("app.api.v1.student.account.AccountService") as MockService:
        instance = MockService.return_value
        instance.update_preferences = AsyncMock(return_value=mock_result)

        response = await async_client.put(
            f"{BASE}/preferences",
            headers={"Authorization": "Bearer fake-token"},
            json={"theme": "light", "daily_goal_minutes": 90},
        )

    assert response.status_code == 200


@pytest.mark.unit
@pytest.mark.asyncio
async def test_update_preferences_non_student_forbidden(
    async_client: AsyncClient,
    override_current_user_instructor,
):
    """Instructor cannot access student preferences."""
    response = await async_client.put(
        f"{BASE}/preferences",
        headers={"Authorization": "Bearer fake-token"},
        json={"theme": "dark"},
    )
    assert response.status_code == 403


# ──────────────────────────────────────────────────────────────
# GET /notifications
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_notifications_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student retrieves their notifications."""
    mock_notifs = [
        {
            "id": str(uuid.uuid4()),
            "title": "Assignment Due",
            "message": "Your Math homework is due tomorrow",
            "category": "academic",
            "is_read": False,
            "created_at": "2026-02-15T08:00:00",
        }
    ]

    with patch("app.api.v1.student.account.AccountService") as MockService:
        instance = MockService.return_value
        instance.get_notifications = AsyncMock(return_value=mock_notifs)

        response = await async_client.get(
            f"{BASE}/notifications",
            headers={"Authorization": "Bearer fake-token"},
            params={"unread_only": True, "limit": 10},
        )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1


# ──────────────────────────────────────────────────────────────
# PUT /notifications/read-all
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_mark_all_notifications_read(
    async_client: AsyncClient,
    override_current_user,
):
    """Student marks all notifications as read."""
    mock_result = {"marked_count": 5, "message": "All notifications marked as read"}

    with patch("app.api.v1.student.account.AccountService") as MockService:
        instance = MockService.return_value
        instance.mark_all_notifications_read = AsyncMock(return_value=mock_result)

        response = await async_client.put(
            f"{BASE}/notifications/read-all",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200


# ──────────────────────────────────────────────────────────────
# GET /privacy
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_privacy_settings_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student retrieves privacy settings including COPPA status."""
    mock_privacy = {
        "profile_visibility": "friends_only",
        "show_online_status": True,
        "show_achievements": True,
        "coppa_consent": {"status": "granted"},
    }

    with patch("app.api.v1.student.account.AccountService") as MockService:
        instance = MockService.return_value
        instance.get_privacy_settings = AsyncMock(return_value=mock_privacy)

        response = await async_client.get(
            f"{BASE}/privacy",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "profile_visibility" in data


# ──────────────────────────────────────────────────────────────
# POST /privacy/consent
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_submit_coppa_consent_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student submits COPPA consent."""
    mock_result = {
        "consent_type": "data_collection",
        "is_granted": True,
        "message": "Consent recorded",
    }

    with patch("app.api.v1.student.account.AccountService") as MockService:
        instance = MockService.return_value
        instance.submit_coppa_consent = AsyncMock(return_value=mock_result)

        response = await async_client.post(
            f"{BASE}/privacy/consent",
            headers={"Authorization": "Bearer fake-token"},
            json={
                "consent_type": "data_collection",
                "is_granted": True,
                "parent_id": str(uuid.uuid4()),
            },
        )

    assert response.status_code == 200


# ──────────────────────────────────────────────────────────────
# GET /teacher-access
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_teacher_access_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student retrieves teacher access controls."""
    mock_access = [
        {
            "teacher_id": str(uuid.uuid4()),
            "teacher_name": "Ms. Wanjiku",
            "can_view_progress": True,
            "can_view_mood": False,
            "can_view_journal": False,
        }
    ]

    with patch("app.api.v1.student.account.AccountService") as MockService:
        instance = MockService.return_value
        instance.get_teacher_access = AsyncMock(return_value=mock_access)

        response = await async_client.get(
            f"{BASE}/teacher-access",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1


# ──────────────────────────────────────────────────────────────
# PUT /teacher-access/{teacher_id}
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_update_teacher_access_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student updates teacher access permissions."""
    teacher_id = str(uuid.uuid4())
    mock_result = {
        "teacher_id": teacher_id,
        "can_view_mood": True,
        "message": "Access updated",
    }

    with patch("app.api.v1.student.account.AccountService") as MockService:
        instance = MockService.return_value
        instance.update_teacher_access = AsyncMock(return_value=mock_result)

        response = await async_client.put(
            f"{BASE}/teacher-access/{teacher_id}",
            headers={"Authorization": "Bearer fake-token"},
            json={"can_view_mood": True, "can_view_journal": False},
        )

    assert response.status_code == 200


@pytest.mark.unit
@pytest.mark.asyncio
async def test_update_teacher_access_non_student_forbidden(
    async_client: AsyncClient,
    override_current_user_admin,
):
    """Admin cannot modify student's teacher access controls."""
    teacher_id = str(uuid.uuid4())
    response = await async_client.put(
        f"{BASE}/teacher-access/{teacher_id}",
        headers={"Authorization": "Bearer fake-token"},
        json={"can_view_mood": True},
    )
    assert response.status_code == 403
