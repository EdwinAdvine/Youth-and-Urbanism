"""
AI Orchestrator Service - Dynamic Multi-AI Routing System

This is the CORE AI FEATURE that enables flexible, admin-configurable AI provider management.
The orchestrator dynamically routes queries to the best AI provider based on:
- Task type classification (general, reasoning, creative, research)
- Response mode requirements (text, voice, video)
- Provider availability and configuration from database
- Cost optimization and fallback strategies

Key Features:
- Dynamic provider loading from database (no hardcoded providers)
- Automatic failover to alternative providers
- Multi-modal output support (text/voice/video)
- Provider client caching for performance
- Encrypted API key management
- Task-based intelligent routing

Supported Providers (admin-configurable):
- Text AI: Gemini, Claude, GPT-4, Grok, Llama, etc.
- Voice AI: ElevenLabs, Google TTS, Azure Speech, etc.
- Video AI: Synthesia, D-ID, HeyGen, etc.
"""

import logging
from typing import Dict, Optional, Any, List
from datetime import datetime

# AI Provider SDKs
import google.generativeai as genai
from anthropic import Anthropic
from openai import OpenAI
from elevenlabs import ElevenLabs

# Database and models
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.ai_provider import AIProvider
from app.config import settings
from app.utils.security import decrypt_api_key

# Configure logging
logger = logging.getLogger(__name__)


class AIOrchestrator:
    """
    Dynamic AI routing orchestrator with admin-configured provider management.

    This class manages multiple AI providers and intelligently routes queries
    to the most appropriate provider based on task type, capabilities, and
    availability. All providers are loaded from the database, allowing admins
    to configure the AI ecosystem without code changes.

    Attributes:
        db: Async database session for provider queries
        providers_cache: Cache of initialized AI provider clients
        text_providers: List of active text AI providers
        voice_providers: List of active voice AI providers
        video_providers: List of active video AI providers
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize the AI Orchestrator.

        Args:
            db: Async database session for querying AI providers
        """
        self.db = db
        self.providers_cache: Dict[str, Any] = {}
        self.text_providers: List[AIProvider] = []
        self.voice_providers: List[AIProvider] = []
        self.video_providers: List[AIProvider] = []

        logger.info("AI Orchestrator initialized")

    async def load_providers(self) -> None:
        """
        Load active AI providers from database and initialize their clients.

        This method queries the database for all active providers, decrypts
        their API keys, initializes the appropriate SDK clients, and caches
        them for efficient reuse.

        The method categorizes providers by type (text, voice, video) and
        stores them in separate lists for quick lookup during routing.

        Raises:
            Exception: If critical providers (e.g., Gemini) fail to initialize
        """
        try:
            logger.info("Loading AI providers from database...")

            # Query active providers from database
            result = await self.db.execute(
                select(AIProvider).where(AIProvider.is_active == True)
            )
            providers = result.scalars().all()

            if not providers:
                logger.warning("No active AI providers found in database")
                await self._initialize_fallback_providers()
                return

            logger.info(f"Found {len(providers)} active providers")

            # Initialize each provider
            for provider in providers:
                try:
                    await self._initialize_provider(provider)

                    # Categorize by type
                    if provider.is_text_provider:
                        self.text_providers.append(provider)
                    if provider.is_voice_provider:
                        self.voice_providers.append(provider)
                    if provider.is_video_provider:
                        self.video_providers.append(provider)

                    logger.info(
                        f"Initialized provider: {provider.name} "
                        f"(type: {provider.provider_type}, "
                        f"specialization: {provider.specialization})"
                    )

                except Exception as e:
                    logger.error(
                        f"Failed to initialize provider {provider.name}: {str(e)}"
                    )
                    continue

            logger.info(
                f"Provider initialization complete: "
                f"{len(self.text_providers)} text, "
                f"{len(self.voice_providers)} voice, "
                f"{len(self.video_providers)} video"
            )

        except Exception as e:
            logger.error(f"Error loading providers: {str(e)}")
            # Initialize fallback providers if database loading fails
            await self._initialize_fallback_providers()

    async def _initialize_provider(self, provider: AIProvider) -> None:
        """
        Initialize a single AI provider client.

        Args:
            provider: AIProvider model instance from database

        Raises:
            ValueError: If provider type is unsupported or initialization fails
        """
        # Decrypt API key
        try:
            api_key = decrypt_api_key(provider.api_key_encrypted)
        except Exception as e:
            logger.error(f"Failed to decrypt API key for {provider.name}: {str(e)}")
            raise

        provider_name_lower = provider.name.lower()

        # Initialize appropriate SDK based on provider name
        if 'gemini' in provider_name_lower:
            genai.configure(api_key=api_key)
            self.providers_cache[str(provider.id)] = {
                'client': genai.GenerativeModel('gemini-pro'),
                'type': 'gemini',
                'provider': provider
            }

        elif 'claude' in provider_name_lower or 'anthropic' in provider_name_lower:
            client = Anthropic(api_key=api_key)
            self.providers_cache[str(provider.id)] = {
                'client': client,
                'type': 'anthropic',
                'provider': provider
            }

        elif 'gpt' in provider_name_lower or 'openai' in provider_name_lower:
            client = OpenAI(api_key=api_key)
            self.providers_cache[str(provider.id)] = {
                'client': client,
                'type': 'openai',
                'provider': provider
            }

        elif 'elevenlabs' in provider_name_lower:
            client = ElevenLabs(api_key=api_key)
            self.providers_cache[str(provider.id)] = {
                'client': client,
                'type': 'elevenlabs',
                'provider': provider
            }

        else:
            logger.warning(
                f"Unknown provider type for {provider.name}, "
                f"storing configuration for custom implementation"
            )
            self.providers_cache[str(provider.id)] = {
                'client': None,
                'type': 'custom',
                'provider': provider,
                'api_key': api_key
            }

    async def _initialize_fallback_providers(self) -> None:
        """
        Initialize fallback providers from environment variables.

        This method is called when database providers cannot be loaded.
        It uses API keys from settings/environment variables to initialize
        critical providers (primarily Gemini as the default).
        """
        logger.warning("Initializing fallback providers from environment")

        try:
            # Initialize Gemini as primary fallback
            if settings.gemini_api_key:
                genai.configure(api_key=settings.gemini_api_key)
                fallback_provider = AIProvider(
                    name="Gemini Pro (Fallback)",
                    provider_type="text",
                    api_endpoint="https://generativelanguage.googleapis.com",
                    api_key_encrypted="",
                    specialization="general",
                    is_active=True,
                    is_recommended=True
                )
                self.providers_cache['fallback_gemini'] = {
                    'client': genai.GenerativeModel('gemini-pro'),
                    'type': 'gemini',
                    'provider': fallback_provider
                }
                self.text_providers.append(fallback_provider)
                logger.info("Initialized Gemini fallback provider")

            # Initialize other fallback providers if available
            if settings.elevenlabs_api_key:
                client = ElevenLabs(api_key=settings.elevenlabs_api_key)
                fallback_voice = AIProvider(
                    name="ElevenLabs (Fallback)",
                    provider_type="voice",
                    api_endpoint="https://api.elevenlabs.io",
                    api_key_encrypted="",
                    specialization="voice",
                    is_active=True,
                    is_recommended=True
                )
                self.providers_cache['fallback_elevenlabs'] = {
                    'client': client,
                    'type': 'elevenlabs',
                    'provider': fallback_voice
                }
                self.voice_providers.append(fallback_voice)
                logger.info("Initialized ElevenLabs fallback provider")

        except Exception as e:
            logger.error(f"Failed to initialize fallback providers: {str(e)}")

    async def route_query(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None,
        response_mode: str = 'text'
    ) -> Dict[str, Any]:
        """
        Route query to best AI provider and return response.

        This is the main entry point for AI interactions. It classifies the
        query, selects the best provider, executes the query, and handles
        response mode conversion (text to voice/video if requested).

        Args:
            query: User's question or prompt
            context: Optional conversation context (history, user info, etc.)
            response_mode: Desired output format ('text', 'voice', 'video')

        Returns:
            Dictionary containing:
            - message: Text response from AI
            - response_mode: Actual response mode delivered
            - audio_url: URL to audio file (if voice mode)
            - video_url: URL to video file (if video mode)
            - provider_used: Name of the provider that handled the query
            - metadata: Additional information (cost, tokens, etc.)

        Raises:
            Exception: If all providers fail or no suitable provider found
        """
        try:
            logger.info(
                f"Routing query (mode: {response_mode}): {query[:100]}..."
            )

            # Ensure providers are loaded
            if not self.text_providers and not self.voice_providers:
                await self.load_providers()

            # Prepare context
            if context is None:
                context = {}

            # Classify the task type
            task_type = self._classify_task(query)
            logger.info(f"Query classified as: {task_type}")

            # Route based on response mode
            if response_mode == 'text':
                return await self._handle_text_query(query, context, task_type)
            elif response_mode == 'voice':
                return await self._handle_voice_query(query, context, task_type)
            elif response_mode == 'video':
                return await self._handle_video_query(query, context, task_type)
            else:
                raise ValueError(f"Unsupported response mode: {response_mode}")

        except Exception as e:
            logger.error(f"Error routing query: {str(e)}")
            raise

    async def _handle_text_query(
        self,
        query: str,
        context: Dict[str, Any],
        task_type: str
    ) -> Dict[str, Any]:
        """
        Handle text-based query routing and execution.

        Args:
            query: User's question
            context: Conversation context
            task_type: Classified task type (general, reasoning, etc.)

        Returns:
            Response dictionary with text message
        """
        # Select best text provider
        provider = await self._select_provider(task_type, 'text')

        if not provider:
            raise Exception("No text provider available")

        # Execute query with selected provider
        text_response = await self._execute_text_query(provider, query, context)

        return {
            'message': text_response,
            'response_mode': 'text',
            'audio_url': None,
            'video_url': None,
            'provider_used': provider.name,
            'metadata': {
                'task_type': task_type,
                'timestamp': datetime.utcnow().isoformat()
            }
        }

    async def _handle_voice_query(
        self,
        query: str,
        context: Dict[str, Any],
        task_type: str
    ) -> Dict[str, Any]:
        """
        Handle voice-based query routing and execution.

        This method first gets a text response, then converts it to voice.

        Args:
            query: User's question
            context: Conversation context
            task_type: Classified task type

        Returns:
            Response dictionary with text message and audio URL
        """
        # First, get text response
        text_provider = await self._select_provider(task_type, 'text')
        if not text_provider:
            raise Exception("No text provider available")

        text_response = await self._execute_text_query(
            text_provider, query, context
        )

        # Convert to voice
        audio_url = await self._convert_to_voice(text_response)

        return {
            'message': text_response,
            'response_mode': 'voice',
            'audio_url': audio_url,
            'video_url': None,
            'provider_used': f"{text_provider.name} + Voice AI",
            'metadata': {
                'task_type': task_type,
                'timestamp': datetime.utcnow().isoformat()
            }
        }

    async def _handle_video_query(
        self,
        query: str,
        context: Dict[str, Any],
        task_type: str
    ) -> Dict[str, Any]:
        """
        Handle video-based query routing and execution.

        This is a placeholder for future video AI integration.
        Currently returns text response with video generation notice.

        Args:
            query: User's question
            context: Conversation context
            task_type: Classified task type

        Returns:
            Response dictionary with video information
        """
        # Get text response first
        text_provider = await self._select_provider(task_type, 'text')
        if not text_provider:
            raise Exception("No text provider available")

        text_response = await self._execute_text_query(
            text_provider, query, context
        )

        # TODO: Implement Synthesia/video provider integration
        # For now, return placeholder
        return {
            'message': text_response,
            'response_mode': 'video',
            'audio_url': None,
            'video_url': None,  # TODO: Generate video URL
            'provider_used': f"{text_provider.name} (video pending)",
            'metadata': {
                'task_type': task_type,
                'timestamp': datetime.utcnow().isoformat(),
                'notice': 'Video generation not yet implemented'
            }
        }

    async def _select_provider(
        self,
        task_type: str,
        response_mode: str
    ) -> Optional[AIProvider]:
        """
        Select the best AI provider for a given task and response mode.

        Selection criteria (in order of priority):
        1. Active providers matching response_mode
        2. Specialization matching task_type
        3. Recommended providers first
        4. Fallback to general providers

        Args:
            task_type: Classification of the task (general, reasoning, etc.)
            response_mode: Required capability (text, voice, video)

        Returns:
            Best matching AIProvider or None if no suitable provider found
        """
        # Select provider pool based on response mode
        if response_mode == 'text':
            provider_pool = self.text_providers
        elif response_mode == 'voice':
            provider_pool = self.voice_providers
        elif response_mode == 'video':
            provider_pool = self.video_providers
        else:
            provider_pool = self.text_providers

        if not provider_pool:
            logger.warning(
                f"No providers available for mode: {response_mode}"
            )
            return None

        # Filter by specialization (if available)
        specialized = [
            p for p in provider_pool
            if p.specialization and task_type in p.specialization.lower()
        ]

        # Prioritize recommended providers
        if specialized:
            recommended = [p for p in specialized if p.is_recommended]
            if recommended:
                logger.info(
                    f"Selected recommended specialized provider: "
                    f"{recommended[0].name}"
                )
                return recommended[0]
            logger.info(f"Selected specialized provider: {specialized[0].name}")
            return specialized[0]

        # Fallback to recommended general provider
        recommended = [p for p in provider_pool if p.is_recommended]
        if recommended:
            logger.info(
                f"Selected recommended general provider: {recommended[0].name}"
            )
            return recommended[0]

        # Last resort: first available provider
        logger.info(f"Selected first available provider: {provider_pool[0].name}")
        return provider_pool[0]

    async def _execute_text_query(
        self,
        provider: AIProvider,
        query: str,
        context: Dict[str, Any]
    ) -> str:
        """
        Execute a text query with the specified AI provider.

        This method handles provider-specific API calls and returns
        the text response. It includes retry logic and error handling.

        Args:
            provider: The AIProvider to use for the query
            query: User's question
            context: Conversation context

        Returns:
            Text response from the AI provider

        Raises:
            Exception: If query execution fails
        """
        try:
            provider_id = str(provider.id) if hasattr(provider, 'id') else 'fallback'
            cached_provider = self.providers_cache.get(
                provider_id,
                self.providers_cache.get('fallback_gemini')
            )

            if not cached_provider:
                raise Exception(f"Provider {provider.name} not initialized")

            client = cached_provider['client']
            provider_type = cached_provider['type']

            # Build prompt with context
            prompt = self._build_prompt(query, context)

            # Execute based on provider type
            if provider_type == 'gemini':
                response = client.generate_content(prompt)
                return response.text

            elif provider_type == 'anthropic':
                message = client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=1024,
                    messages=[{"role": "user", "content": prompt}]
                )
                return message.content[0].text

            elif provider_type == 'openai':
                response = client.chat.completions.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.choices[0].message.content

            else:
                raise Exception(f"Unsupported provider type: {provider_type}")

        except Exception as e:
            logger.error(
                f"Error executing query with {provider.name}: {str(e)}"
            )
            # Attempt fallback
            return await self._execute_fallback_query(query, context)

    async def _execute_fallback_query(
        self,
        query: str,
        context: Dict[str, Any]
    ) -> str:
        """
        Execute query with fallback provider when primary provider fails.

        Args:
            query: User's question
            context: Conversation context

        Returns:
            Text response from fallback provider
        """
        logger.warning("Attempting fallback provider")

        # Try Gemini fallback
        if 'fallback_gemini' in self.providers_cache:
            try:
                client = self.providers_cache['fallback_gemini']['client']
                prompt = self._build_prompt(query, context)
                response = client.generate_content(prompt)
                return response.text
            except Exception as e:
                logger.error(f"Fallback provider also failed: {str(e)}")

        # Return error message if all providers fail
        return (
            "I apologize, but I'm currently unable to process your request. "
            "Please try again later."
        )

    async def _convert_to_voice(self, text_response: str) -> Optional[str]:
        """
        Convert text response to voice using available voice provider.

        Args:
            text_response: Text to convert to speech

        Returns:
            URL to audio file or None if conversion fails
        """
        try:
            if not self.voice_providers:
                logger.warning("No voice providers available")
                return None

            # Use first available voice provider (typically ElevenLabs)
            voice_provider_id = (
                str(self.voice_providers[0].id)
                if hasattr(self.voice_providers[0], 'id')
                else 'fallback_elevenlabs'
            )

            cached = self.providers_cache.get(voice_provider_id)
            if not cached or cached['type'] != 'elevenlabs':
                logger.warning("ElevenLabs client not available")
                return None

            client = cached['client']

            # Generate audio (this is a placeholder - actual implementation
            # would save to file storage and return URL)
            # audio = client.generate(
            #     text=text_response,
            #     voice="Rachel",  # Default voice
            #     model="eleven_multilingual_v2"
            # )

            # TODO: Save audio to storage and return URL
            # For now, return placeholder
            logger.info("Voice conversion requested (not yet fully implemented)")
            return None

        except Exception as e:
            logger.error(f"Error converting to voice: {str(e)}")
            return None

    def _classify_task(self, query: str) -> str:
        """
        Classify query into task type using keyword analysis.

        This is a simple keyword-based classifier. In production,
        this could be enhanced with ML-based classification.

        Args:
            query: User's question

        Returns:
            Task type: 'reasoning', 'creative', 'research', or 'general'
        """
        query_lower = query.lower()

        # Reasoning tasks
        reasoning_keywords = [
            'solve', 'calculate', 'prove', 'analyze', 'compare',
            'why', 'how does', 'explain', 'logic', 'math'
        ]
        if any(keyword in query_lower for keyword in reasoning_keywords):
            return 'reasoning'

        # Creative tasks
        creative_keywords = [
            'write', 'create', 'story', 'poem', 'imagine',
            'design', 'generate', 'compose', 'invent'
        ]
        if any(keyword in query_lower for keyword in creative_keywords):
            return 'creative'

        # Research tasks
        research_keywords = [
            'research', 'find', 'search', 'what is', 'who is',
            'when did', 'where is', 'latest', 'current', 'news'
        ]
        if any(keyword in query_lower for keyword in research_keywords):
            return 'research'

        # Default to general
        return 'general'

    def _build_prompt(self, query: str, context: Dict[str, Any]) -> str:
        """
        Build enhanced prompt with context for AI provider.

        Args:
            query: User's question
            context: Conversation context (history, student info, etc.)

        Returns:
            Formatted prompt string
        """
        # Extract relevant context
        student_name = context.get('student_name', 'Student')
        grade_level = context.get('grade_level', '')
        conversation_history = context.get('history', [])

        # Build prompt with context
        prompt_parts = []

        # Add system context
        prompt_parts.append(
            f"You are The Bird AI, a helpful educational tutor for "
            f"{student_name}"
        )

        if grade_level:
            prompt_parts.append(
                f"The student is in grade {grade_level}. "
                f"Adjust your explanations to their level."
            )

        # Add conversation history (last 3 exchanges)
        if conversation_history:
            prompt_parts.append("\nRecent conversation:")
            for entry in conversation_history[-3:]:
                role = entry.get('role', 'user')
                message = entry.get('message', '')
                prompt_parts.append(f"{role}: {message}")

        # Add current query
        prompt_parts.append(f"\nCurrent question: {query}")

        return "\n".join(prompt_parts)


# Singleton instance management
_orchestrator_instance: Optional[AIOrchestrator] = None


async def get_orchestrator(db: AsyncSession) -> AIOrchestrator:
    """
    Get or create singleton AI Orchestrator instance.

    This function ensures only one orchestrator instance exists,
    which maintains provider caches and connections.

    Args:
        db: Database session

    Returns:
        AIOrchestrator instance
    """
    global _orchestrator_instance

    if _orchestrator_instance is None:
        _orchestrator_instance = AIOrchestrator(db)
        await _orchestrator_instance.load_providers()

    return _orchestrator_instance


async def reload_providers(db: AsyncSession) -> None:
    """
    Reload AI providers from database.

    Call this function when admin updates provider configuration
    to refresh the orchestrator's provider cache.

    Args:
        db: Database session
    """
    global _orchestrator_instance

    if _orchestrator_instance:
        await _orchestrator_instance.load_providers()
        logger.info("AI providers reloaded")
