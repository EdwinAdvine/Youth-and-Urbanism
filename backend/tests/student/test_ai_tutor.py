"""
Tests for Student AI Tutor API Routes

Endpoints under test:
- POST /api/v1/student/ai/chat             -- chat with AI tutor
- GET  /api/v1/student/ai/learning-path    -- AI-generated learning path
- GET  /api/v1/student/ai/journal          -- list journal entries
- POST /api/v1/student/ai/journal          -- create journal entry
- POST /api/v1/student/ai/explain          -- AI concept explanation
- POST /api/v1/student/ai/teacher-question -- send question to teacher
- GET  /api/v1/student/ai/teacher-responses -- get teacher responses
- POST /api/v1/student/ai/voice            -- ElevenLabs TTS
"""
import pytest
import uuid
from unittest.mock import patch, AsyncMock, MagicMock
from httpx import AsyncClient


BASE = "/api/v1/student/ai"


# ──────────────────────────────────────────────────────────────
# POST /chat
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_chat_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Authenticated student successfully chats with AI tutor."""
    mock_response = {
        "response": "The Pythagorean theorem states a^2 + b^2 = c^2.",
        "model_used": "gemini-pro",
        "conversation_id": str(uuid.uuid4()),
    }

    with patch("app.api.v1.student.ai_tutor.AITutorService") as MockService:
        instance = MockService.return_value
        instance.chat_with_ai = AsyncMock(return_value=mock_response)

        response = await async_client.post(
            f"{BASE}/chat",
            headers={"Authorization": "Bearer fake-token"},
            json={"message": "Explain the Pythagorean theorem"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert data["model_used"] == "gemini-pro"


@pytest.mark.unit
@pytest.mark.asyncio
async def test_chat_requires_authentication(async_client: AsyncClient):
    """Chat endpoint without auth header returns 401/403."""
    response = await async_client.post(
        f"{BASE}/chat",
        json={"message": "Hello"},
    )
    assert response.status_code in [401, 403]


@pytest.mark.unit
@pytest.mark.asyncio
async def test_chat_non_student_forbidden(
    async_client: AsyncClient,
    override_current_user_admin,
):
    """Admin user cannot use the student chat endpoint."""
    response = await async_client.post(
        f"{BASE}/chat",
        headers={"Authorization": "Bearer fake-token"},
        json={"message": "Hello"},
    )
    assert response.status_code == 403


@pytest.mark.unit
@pytest.mark.asyncio
async def test_chat_no_student_profile(
    async_client: AsyncClient,
    override_current_user_no_profile,
):
    """Student without student_id returns 400."""
    response = await async_client.post(
        f"{BASE}/chat",
        headers={"Authorization": "Bearer fake-token"},
        json={"message": "Hello"},
    )
    assert response.status_code == 400
    assert "Student profile not found" in response.json()["detail"]


@pytest.mark.unit
@pytest.mark.asyncio
async def test_chat_missing_message_field(
    async_client: AsyncClient,
    override_current_user,
):
    """Request body without 'message' field fails validation (422)."""
    response = await async_client.post(
        f"{BASE}/chat",
        headers={"Authorization": "Bearer fake-token"},
        json={},
    )
    assert response.status_code == 422


@pytest.mark.unit
@pytest.mark.asyncio
async def test_chat_with_conversation_history(
    async_client: AsyncClient,
    override_current_user,
):
    """Chat request may include prior conversation history."""
    mock_response = {
        "response": "Let me elaborate further.",
        "model_used": "claude-3.5-sonnet",
    }

    with patch("app.api.v1.student.ai_tutor.AITutorService") as MockService:
        instance = MockService.return_value
        instance.chat_with_ai = AsyncMock(return_value=mock_response)

        response = await async_client.post(
            f"{BASE}/chat",
            headers={"Authorization": "Bearer fake-token"},
            json={
                "message": "Can you explain more?",
                "conversation_history": [
                    {"role": "user", "content": "What is gravity?"},
                    {"role": "assistant", "content": "Gravity is a force..."},
                ],
            },
        )

    assert response.status_code == 200


@pytest.mark.unit
@pytest.mark.asyncio
async def test_chat_service_value_error_returns_404(
    async_client: AsyncClient,
    override_current_user,
):
    """ValueError from AITutorService maps to 404."""
    with patch("app.api.v1.student.ai_tutor.AITutorService") as MockService:
        instance = MockService.return_value
        instance.chat_with_ai = AsyncMock(
            side_effect=ValueError("AI tutor not found for student")
        )

        response = await async_client.post(
            f"{BASE}/chat",
            headers={"Authorization": "Bearer fake-token"},
            json={"message": "Hello"},
        )

    assert response.status_code == 404


@pytest.mark.unit
@pytest.mark.asyncio
async def test_chat_service_generic_error_returns_500(
    async_client: AsyncClient,
    override_current_user,
):
    """Unexpected exception from service maps to 500."""
    with patch("app.api.v1.student.ai_tutor.AITutorService") as MockService:
        instance = MockService.return_value
        instance.chat_with_ai = AsyncMock(
            side_effect=RuntimeError("Provider timeout")
        )

        response = await async_client.post(
            f"{BASE}/chat",
            headers={"Authorization": "Bearer fake-token"},
            json={"message": "Hello"},
        )

    assert response.status_code == 500


# ──────────────────────────────────────────────────────────────
# GET /learning-path
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_learning_path_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student retrieves their AI-generated learning path."""
    mock_path = {
        "topics": ["Fractions", "Decimals"],
        "estimated_time_minutes": 45,
    }

    with patch("app.api.v1.student.ai_tutor.AITutorService") as MockService:
        instance = MockService.return_value
        instance.get_learning_path = AsyncMock(return_value=mock_path)

        response = await async_client.get(
            f"{BASE}/learning-path",
            headers={"Authorization": "Bearer fake-token"},
        )

    assert response.status_code == 200
    assert "topics" in response.json()


# ──────────────────────────────────────────────────────────────
# POST /journal
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_create_journal_entry_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student creates a journal entry and gets AI insights back."""
    mock_entry = MagicMock()
    mock_entry.id = uuid.uuid4()
    mock_entry.content = "Today I learned about photosynthesis."
    mock_entry.mood_tag = "excited"
    mock_entry.ai_insights = "Great reflection on biology!"
    mock_entry.created_at = "2026-02-15T10:00:00"

    with patch("app.api.v1.student.ai_tutor.AITutorService") as MockService:
        instance = MockService.return_value
        instance.create_journal_entry = AsyncMock(return_value=mock_entry)

        response = await async_client.post(
            f"{BASE}/journal",
            headers={"Authorization": "Bearer fake-token"},
            json={
                "content": "Today I learned about photosynthesis.",
                "mood_tag": "excited",
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Today I learned about photosynthesis."
    assert "message" in data


# ──────────────────────────────────────────────────────────────
# POST /explain
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_explain_concept_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Student asks AI to explain a concept."""
    mock_explanation = {
        "concept": "Photosynthesis",
        "explanation": "Photosynthesis is the process by which plants convert sunlight...",
        "examples": ["A green leaf absorbing sunlight"],
    }

    with patch("app.api.v1.student.ai_tutor.AITutorService") as MockService:
        instance = MockService.return_value
        instance.explain_concept = AsyncMock(return_value=mock_explanation)

        response = await async_client.post(
            f"{BASE}/explain",
            headers={"Authorization": "Bearer fake-token"},
            json={"concept": "Photosynthesis", "context": "Biology Grade 5"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "explanation" in data


# ──────────────────────────────────────────────────────────────
# POST /voice
# ──────────────────────────────────────────────────────────────

@pytest.mark.unit
@pytest.mark.asyncio
async def test_generate_voice_response_success(
    async_client: AsyncClient,
    override_current_user,
):
    """Voice endpoint returns audio URL."""
    mock_voice = {
        "audio_url": "https://api.elevenlabs.io/audio/abc123.mp3",
        "duration_seconds": 12,
    }

    with patch("app.api.v1.student.ai_tutor.AITutorService") as MockService:
        instance = MockService.return_value
        instance.generate_voice_response = AsyncMock(return_value=mock_voice)

        response = await async_client.post(
            f"{BASE}/voice",
            headers={"Authorization": "Bearer fake-token"},
            json={"text": "Hello, let me explain fractions."},
        )

    assert response.status_code == 200
    data = response.json()
    assert "audio_url" in data
