"""
AI Orchestrator Service Tests

Tests for AI orchestrator business logic:
- Dynamic provider loading from database
- Query routing and task classification
- Provider selection based on specialization
- Multi-modal output (text, voice, video)
- Fallback strategies when providers fail
- Prompt building with context

Coverage target: 80%+ (core AI feature)
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from uuid import uuid4

from app.services.ai_orchestrator import AIOrchestrator, get_orchestrator, reload_providers
from app.models.ai_provider import AIProvider
from tests.factories import UserFactory


@pytest.mark.unit
class TestAIOrchestratorInitialization:
    """Test AI orchestrator initialization and provider loading."""

    async def test_orchestrator_initialization(self, db_session):
        """Test basic orchestrator initialization."""
        orchestrator = AIOrchestrator(db_session)

        assert orchestrator.db == db_session
        assert orchestrator.providers_cache == {}
        assert orchestrator.text_providers == []
        assert orchestrator.voice_providers == []
        assert orchestrator.video_providers == []

    @patch("app.services.ai_orchestrator.AIOrchestrator._initialize_provider")
    async def test_load_providers_from_database(self, mock_init, db_session):
        """Test loading active providers from database."""
        # Create test providers
        text_provider = AIProvider(
            name="Gemini Pro",
            provider_type="text",
            api_endpoint="https://generativelanguage.googleapis.com",
            api_key_encrypted="encrypted_key",
            specialization="general",
            is_active=True,
            is_recommended=True,
            is_text_provider=True
        )
        voice_provider = AIProvider(
            name="ElevenLabs",
            provider_type="voice",
            api_endpoint="https://api.elevenlabs.io",
            api_key_encrypted="encrypted_key",
            specialization="voice",
            is_active=True,
            is_voice_provider=True
        )

        db_session.add_all([text_provider, voice_provider])
        await db_session.commit()

        orchestrator = AIOrchestrator(db_session)
        await orchestrator.load_providers()

        assert mock_init.call_count == 2

    @patch("app.services.ai_orchestrator.AIOrchestrator._initialize_fallback_providers")
    async def test_load_providers_no_active_providers(self, mock_fallback, db_session):
        """Test fallback initialization when no active providers."""
        orchestrator = AIOrchestrator(db_session)
        await orchestrator.load_providers()

        mock_fallback.assert_called_once()

    @patch("app.services.ai_orchestrator.decrypt_api_key")
    @patch("app.services.ai_orchestrator.genai.configure")
    async def test_initialize_gemini_provider(
        self, mock_configure, mock_decrypt, db_session
    ):
        """Test Gemini provider initialization."""
        mock_decrypt.return_value = "test-api-key"

        provider = AIProvider(
            id=uuid4(),
            name="Gemini Pro",
            provider_type="text",
            api_endpoint="https://generativelanguage.googleapis.com",
            api_key_encrypted="encrypted_key",
            is_active=True,
            is_text_provider=True
        )

        orchestrator = AIOrchestrator(db_session)
        await orchestrator._initialize_provider(provider)

        mock_decrypt.assert_called_once()
        mock_configure.assert_called_once_with(api_key="test-api-key")
        assert str(provider.id) in orchestrator.providers_cache

    @patch("app.services.ai_orchestrator.decrypt_api_key")
    @patch("app.services.ai_orchestrator.Anthropic")
    async def test_initialize_claude_provider(
        self, mock_anthropic, mock_decrypt, db_session
    ):
        """Test Claude/Anthropic provider initialization."""
        mock_decrypt.return_value = "test-api-key"
        mock_client = MagicMock()
        mock_anthropic.return_value = mock_client

        provider = AIProvider(
            id=uuid4(),
            name="Claude 3.5 Sonnet",
            provider_type="text",
            api_endpoint="https://api.anthropic.com",
            api_key_encrypted="encrypted_key",
            is_active=True,
            is_text_provider=True
        )

        orchestrator = AIOrchestrator(db_session)
        await orchestrator._initialize_provider(provider)

        mock_anthropic.assert_called_once_with(api_key="test-api-key")
        assert str(provider.id) in orchestrator.providers_cache

    @patch("app.services.ai_orchestrator.decrypt_api_key")
    @patch("app.services.ai_orchestrator.OpenAI")
    async def test_initialize_openai_provider(
        self, mock_openai, mock_decrypt, db_session
    ):
        """Test OpenAI provider initialization."""
        mock_decrypt.return_value = "test-api-key"
        mock_client = MagicMock()
        mock_openai.return_value = mock_client

        provider = AIProvider(
            id=uuid4(),
            name="GPT-4",
            provider_type="text",
            api_endpoint="https://api.openai.com",
            api_key_encrypted="encrypted_key",
            is_active=True,
            is_text_provider=True
        )

        orchestrator = AIOrchestrator(db_session)
        await orchestrator._initialize_provider(provider)

        mock_openai.assert_called_once_with(api_key="test-api-key")

    @patch("app.services.ai_orchestrator.decrypt_api_key")
    @patch("app.services.ai_orchestrator.ElevenLabs")
    async def test_initialize_elevenlabs_provider(
        self, mock_elevenlabs, mock_decrypt, db_session
    ):
        """Test ElevenLabs provider initialization."""
        mock_decrypt.return_value = "test-api-key"
        mock_client = MagicMock()
        mock_elevenlabs.return_value = mock_client

        provider = AIProvider(
            id=uuid4(),
            name="ElevenLabs",
            provider_type="voice",
            api_endpoint="https://api.elevenlabs.io",
            api_key_encrypted="encrypted_key",
            is_active=True,
            is_voice_provider=True
        )

        orchestrator = AIOrchestrator(db_session)
        await orchestrator._initialize_provider(provider)

        mock_elevenlabs.assert_called_once_with(api_key="test-api-key")


@pytest.mark.unit
class TestTaskClassification:
    """Test query task classification."""

    def test_classify_reasoning_task(self, db_session):
        """Test classification of reasoning queries."""
        orchestrator = AIOrchestrator(db_session)

        queries = [
            "Solve this math problem",
            "Calculate the area of a circle",
            "Explain why the sky is blue",
            "Prove the Pythagorean theorem"
        ]

        for query in queries:
            assert orchestrator._classify_task(query) == "reasoning"

    def test_classify_creative_task(self, db_session):
        """Test classification of creative queries."""
        orchestrator = AIOrchestrator(db_session)

        queries = [
            "Write a story about dinosaurs",
            "Create a poem about friendship",
            "Imagine a new invention",
            "Generate ideas for a science project"
        ]

        for query in queries:
            assert orchestrator._classify_task(query) == "creative"

    def test_classify_research_task(self, db_session):
        """Test classification of research queries."""
        orchestrator = AIOrchestrator(db_session)

        queries = [
            "What is photosynthesis?",
            "Find information about Kenya",
            "Who is the president?",
            "What are the latest news about climate?"
        ]

        for query in queries:
            assert orchestrator._classify_task(query) == "research"

    def test_classify_general_task(self, db_session):
        """Test classification defaults to general."""
        orchestrator = AIOrchestrator(db_session)

        query = "Tell me about yourself"
        assert orchestrator._classify_task(query) == "general"


@pytest.mark.unit
class TestPromptBuilding:
    """Test prompt building with context."""

    def test_build_prompt_basic(self, db_session):
        """Test basic prompt building."""
        orchestrator = AIOrchestrator(db_session)

        query = "What is addition?"
        context = {}

        prompt = orchestrator._build_prompt(query, context)

        assert "The Bird AI" in prompt
        assert "What is addition?" in prompt

    def test_build_prompt_with_student_info(self, db_session):
        """Test prompt with student name and grade."""
        orchestrator = AIOrchestrator(db_session)

        query = "Explain photosynthesis"
        context = {
            "student_name": "John",
            "grade_level": 5
        }

        prompt = orchestrator._build_prompt(query, context)

        assert "John" in prompt
        assert "grade 5" in prompt

    def test_build_prompt_with_conversation_history(self, db_session):
        """Test prompt includes conversation history."""
        orchestrator = AIOrchestrator(db_session)

        query = "Tell me more"
        context = {
            "history": [
                {"role": "user", "message": "What is a volcano?"},
                {"role": "assistant", "message": "A volcano is a mountain..."},
                {"role": "user", "message": "How do they erupt?"}
            ]
        }

        prompt = orchestrator._build_prompt(query, context)

        assert "Recent conversation:" in prompt
        assert "volcano" in prompt.lower()


@pytest.mark.unit
class TestProviderSelection:
    """Test AI provider selection logic."""

    async def test_select_provider_specialized_recommended(self, db_session):
        """Test selection of specialized, recommended provider."""
        orchestrator = AIOrchestrator(db_session)

        # Add providers
        orchestrator.text_providers = [
            AIProvider(
                name="General AI",
                specialization="general",
                is_recommended=False,
                is_text_provider=True
            ),
            AIProvider(
                name="Math AI",
                specialization="reasoning, mathematics",
                is_recommended=True,
                is_text_provider=True
            )
        ]

        selected = await orchestrator._select_provider("reasoning", "text")

        assert selected is not None
        assert selected.name == "Math AI"

    async def test_select_provider_fallback_to_recommended(self, db_session):
        """Test fallback to recommended general provider."""
        orchestrator = AIOrchestrator(db_session)

        orchestrator.text_providers = [
            AIProvider(
                name="Basic AI",
                specialization="general",
                is_recommended=False,
                is_text_provider=True
            ),
            AIProvider(
                name="Premium AI",
                specialization="general",
                is_recommended=True,
                is_text_provider=True
            )
        ]

        selected = await orchestrator._select_provider("general", "text")

        assert selected is not None
        assert selected.name == "Premium AI"

    async def test_select_provider_no_providers(self, db_session):
        """Test provider selection returns None when no providers available."""
        orchestrator = AIOrchestrator(db_session)

        selected = await orchestrator._select_provider("general", "text")

        assert selected is None


@pytest.mark.unit
class TestQueryExecution:
    """Test query execution with different providers."""

    @patch("app.services.ai_orchestrator.genai.GenerativeModel")
    async def test_execute_text_query_gemini(
        self, mock_model_class, db_session
    ):
        """Test executing query with Gemini provider."""
        # Mock Gemini response
        mock_response = MagicMock()
        mock_response.text = "The Pythagorean theorem states a² + b² = c²"

        mock_model = MagicMock()
        mock_model.generate_content.return_value = mock_response
        mock_model_class.return_value = mock_model

        orchestrator = AIOrchestrator(db_session)

        provider = AIProvider(
            id=uuid4(),
            name="Gemini Pro",
            specialization="general",
            is_text_provider=True
        )

        orchestrator.providers_cache[str(provider.id)] = {
            'client': mock_model,
            'type': 'gemini',
            'provider': provider
        }

        result = await orchestrator._execute_text_query(
            provider,
            "Explain Pythagorean theorem",
            {}
        )

        assert "Pythagorean theorem" in result
        assert "a² + b² = c²" in result

    @patch("app.services.ai_orchestrator.Anthropic")
    async def test_execute_text_query_claude(
        self, mock_anthropic_class, db_session
    ):
        """Test executing query with Claude provider."""
        # Mock Claude response
        mock_content = MagicMock()
        mock_content.text = "Photosynthesis is how plants make food"

        mock_message = MagicMock()
        mock_message.content = [mock_content]

        mock_client = MagicMock()
        mock_client.messages.create.return_value = mock_message

        orchestrator = AIOrchestrator(db_session)

        provider = AIProvider(
            id=uuid4(),
            name="Claude",
            specialization="creative",
            is_text_provider=True
        )

        orchestrator.providers_cache[str(provider.id)] = {
            'client': mock_client,
            'type': 'anthropic',
            'provider': provider
        }

        result = await orchestrator._execute_text_query(
            provider,
            "Explain photosynthesis",
            {}
        )

        assert "Photosynthesis" in result

    @patch("app.services.ai_orchestrator.OpenAI")
    async def test_execute_text_query_openai(
        self, mock_openai_class, db_session
    ):
        """Test executing query with OpenAI provider."""
        # Mock OpenAI response
        mock_message = MagicMock()
        mock_message.content = "The water cycle involves evaporation and condensation"

        mock_choice = MagicMock()
        mock_choice.message = mock_message

        mock_response = MagicMock()
        mock_response.choices = [mock_choice]

        mock_client = MagicMock()
        mock_client.chat.completions.create.return_value = mock_response

        orchestrator = AIOrchestrator(db_session)

        provider = AIProvider(
            id=uuid4(),
            name="GPT-4",
            specialization="general",
            is_text_provider=True
        )

        orchestrator.providers_cache[str(provider.id)] = {
            'client': mock_client,
            'type': 'openai',
            'provider': provider
        }

        result = await orchestrator._execute_text_query(
            provider,
            "Explain the water cycle",
            {}
        )

        assert "water cycle" in result

    @patch("app.services.ai_orchestrator.AIOrchestrator._execute_fallback_query")
    async def test_execute_text_query_failure_triggers_fallback(
        self, mock_fallback, db_session
    ):
        """Test query execution failure triggers fallback."""
        mock_fallback.return_value = "Fallback response"

        orchestrator = AIOrchestrator(db_session)

        provider = AIProvider(
            id=uuid4(),
            name="Broken AI",
            is_text_provider=True
        )

        # Don't add to cache to simulate missing provider
        result = await orchestrator._execute_text_query(
            provider,
            "Test query",
            {}
        )

        mock_fallback.assert_called_once()
        assert result == "Fallback response"


@pytest.mark.unit
class TestQueryRouting:
    """Test main query routing logic."""

    @patch("app.services.ai_orchestrator.AIOrchestrator._handle_text_query")
    async def test_route_query_text_mode(self, mock_handle, db_session):
        """Test routing query in text mode."""
        mock_handle.return_value = {
            "message": "Test response",
            "response_mode": "text"
        }

        orchestrator = AIOrchestrator(db_session)
        orchestrator.text_providers = [
            AIProvider(name="Test AI", is_text_provider=True)
        ]

        result = await orchestrator.route_query(
            "Test question",
            response_mode="text"
        )

        assert result["response_mode"] == "text"
        mock_handle.assert_called_once()

    @patch("app.services.ai_orchestrator.AIOrchestrator._handle_voice_query")
    async def test_route_query_voice_mode(self, mock_handle, db_session):
        """Test routing query in voice mode."""
        mock_handle.return_value = {
            "message": "Test response",
            "response_mode": "voice",
            "audio_url": "https://example.com/audio.mp3"
        }

        orchestrator = AIOrchestrator(db_session)
        orchestrator.text_providers = [
            AIProvider(name="Test AI", is_text_provider=True)
        ]

        result = await orchestrator.route_query(
            "Test question",
            response_mode="voice"
        )

        assert result["response_mode"] == "voice"
        mock_handle.assert_called_once()

    @patch("app.services.ai_orchestrator.AIOrchestrator._handle_video_query")
    async def test_route_query_video_mode(self, mock_handle, db_session):
        """Test routing query in video mode."""
        mock_handle.return_value = {
            "message": "Test response",
            "response_mode": "video"
        }

        orchestrator = AIOrchestrator(db_session)
        orchestrator.text_providers = [
            AIProvider(name="Test AI", is_text_provider=True)
        ]

        result = await orchestrator.route_query(
            "Test question",
            response_mode="video"
        )

        assert result["response_mode"] == "video"
        mock_handle.assert_called_once()

    async def test_route_query_invalid_mode_raises_error(self, db_session):
        """Test routing with invalid response mode raises error."""
        orchestrator = AIOrchestrator(db_session)
        orchestrator.text_providers = [
            AIProvider(name="Test AI", is_text_provider=True)
        ]

        with pytest.raises(ValueError, match="Unsupported response mode"):
            await orchestrator.route_query(
                "Test question",
                response_mode="invalid"
            )


@pytest.mark.unit
class TestMultiModalHandling:
    """Test multi-modal response handling."""

    @patch("app.services.ai_orchestrator.AIOrchestrator._execute_text_query")
    @patch("app.services.ai_orchestrator.AIOrchestrator._select_provider")
    async def test_handle_text_query(
        self, mock_select, mock_execute, db_session
    ):
        """Test handling text query."""
        mock_provider = AIProvider(
            name="Test AI",
            is_text_provider=True
        )
        mock_select.return_value = mock_provider
        mock_execute.return_value = "This is the response"

        orchestrator = AIOrchestrator(db_session)

        result = await orchestrator._handle_text_query(
            "What is DNA?",
            {},
            "general"
        )

        assert result["message"] == "This is the response"
        assert result["response_mode"] == "text"
        assert result["audio_url"] is None
        assert result["provider_used"] == "Test AI"

    @patch("app.services.ai_orchestrator.AIOrchestrator._convert_to_voice")
    @patch("app.services.ai_orchestrator.AIOrchestrator._execute_text_query")
    @patch("app.services.ai_orchestrator.AIOrchestrator._select_provider")
    async def test_handle_voice_query(
        self, mock_select, mock_execute, mock_convert, db_session
    ):
        """Test handling voice query."""
        mock_provider = AIProvider(
            name="Test AI",
            is_text_provider=True
        )
        mock_select.return_value = mock_provider
        mock_execute.return_value = "Voice response text"
        mock_convert.return_value = "https://example.com/audio.mp3"

        orchestrator = AIOrchestrator(db_session)

        result = await orchestrator._handle_voice_query(
            "Tell me about cells",
            {},
            "general"
        )

        assert result["message"] == "Voice response text"
        assert result["response_mode"] == "voice"
        assert result["audio_url"] == "https://example.com/audio.mp3"

    async def test_convert_to_voice_no_providers(self, db_session):
        """Test voice conversion returns None when no voice providers."""
        orchestrator = AIOrchestrator(db_session)

        result = await orchestrator._convert_to_voice("Test text")

        assert result is None


@pytest.mark.unit
class TestSingletonManagement:
    """Test singleton orchestrator management."""

    @patch("app.services.ai_orchestrator.AIOrchestrator.load_providers")
    async def test_get_orchestrator_creates_instance(
        self, mock_load, db_session
    ):
        """Test get_orchestrator creates new instance."""
        from app.services import ai_orchestrator
        ai_orchestrator._orchestrator_instance = None

        orchestrator = await get_orchestrator(db_session)

        assert orchestrator is not None
        mock_load.assert_called_once()

    @patch("app.services.ai_orchestrator.AIOrchestrator.load_providers")
    async def test_reload_providers_existing_instance(
        self, mock_load, db_session
    ):
        """Test reload_providers reloads providers."""
        from app.services import ai_orchestrator
        ai_orchestrator._orchestrator_instance = AIOrchestrator(db_session)

        await reload_providers(db_session)

        mock_load.assert_called_once()


# Target: 80%+ coverage for ai_orchestrator.py
