# AI Orchestrator

> **Source file**: `backend/app/services/ai_orchestrator.py`
> **Last updated**: 2026-02-15

## Overview

The AI Orchestrator is the central intelligence routing engine of Urban Bird v1. It manages interactions with multiple AI providers, dynamically routing student queries to the most appropriate model based on task type, provider availability, and configuration stored in the database.

The orchestrator is designed to be **admin-configurable**: providers can be added, removed, enabled, or disabled through the `ai_providers` database table without requiring code changes or redeployments.

### Key Capabilities

- Dynamic provider loading from the PostgreSQL `ai_providers` table
- Task-based intelligent routing (general, reasoning, creative, research)
- Multi-modal output support (text, voice, video)
- Provider client caching for performance
- Encrypted API key management via Fernet symmetric encryption
- Automatic failover to alternative providers on failure
- Singleton instance pattern for connection reuse

---

## Architecture

### Class: `AIOrchestrator`

```
AIOrchestrator
  |
  +-- db: AsyncSession                  # Database session for provider queries
  +-- providers_cache: Dict[str, Any]   # Cache of initialized SDK clients
  +-- text_providers: List[AIProvider]   # Active text AI providers
  +-- voice_providers: List[AIProvider]  # Active voice AI providers
  +-- video_providers: List[AIProvider]  # Active video AI providers
  |
  +-- load_providers()                  # Load and initialize all active providers
  +-- route_query()                     # Main entry point for AI interactions
  +-- chat()                            # Unified chat interface
  +-- process_request()                 # Instructor services interface
```

### Initialization

```python
orchestrator = AIOrchestrator(db=async_session)
await orchestrator.load_providers()
```

The constructor accepts an optional `AsyncSession`. If `None` is provided, only fallback providers from environment variables will be used.

### Singleton Management

The module provides two functions for global instance management:

```python
# Get or create the singleton orchestrator
orchestrator = await get_orchestrator(db)

# Reload providers after admin configuration change
await reload_providers(db)
```

The singleton pattern ensures that provider caches and SDK connections are reused across requests, avoiding the overhead of re-initializing clients on every query.

---

## Provider Initialization

### Database-Driven Loading

When `load_providers()` is called, the orchestrator:

1. Queries the `ai_providers` table for all rows where `is_active = True`
2. For each provider row:
   a. Decrypts the `api_key_encrypted` field using `decrypt_api_key()` (Fernet)
   b. Detects the provider type by matching against the provider name (case-insensitive)
   c. Initializes the appropriate SDK client
   d. Caches the client in `providers_cache` keyed by provider UUID
   e. Categorizes the provider into `text_providers`, `voice_providers`, or `video_providers` based on the `provider_type` column and the model properties `is_text_provider`, `is_voice_provider`, `is_video_provider`
3. If any individual provider fails to initialize, it logs the error and continues with the remaining providers

### Provider Type Detection

The orchestrator uses name-based pattern matching to determine which SDK to use:

| Name Pattern | SDK Used | Client Type |
|---|---|---|
| Contains `gemini` | `google.generativeai` | `genai.GenerativeModel('gemini-2.5-flash')` |
| Contains `claude` or `anthropic` | `anthropic.Anthropic` | Anthropic Messages API |
| Contains `gpt` or `openai` | `openai.OpenAI` | OpenAI Chat Completions |
| Contains `groq` | `openai.OpenAI` (base_url: `https://api.groq.com/openai/v1`) | OpenAI-compatible |
| Contains `openrouter` | `openai.OpenAI` (base_url: `https://openrouter.ai/api/v1`) | OpenAI-compatible |
| Contains `elevenlabs` | `elevenlabs.ElevenLabs` | ElevenLabs TTS |
| Other | Stored as `custom` type | Configuration stored, no SDK initialized |

### Fallback Providers

If the database is unavailable or contains no active providers, the orchestrator falls back to environment-variable-based initialization:

1. **Gemini** (primary fallback) -- from `settings.gemini_api_key`
2. **Groq** (secondary fallback) -- from `settings.groq_api_key`
3. **OpenRouter** (tertiary fallback) -- from `settings.openrouter_api_key`
4. **ElevenLabs** (voice fallback) -- from `settings.elevenlabs_api_key`

Each fallback provider creates an in-memory `AIProvider` instance (not persisted to the database) and caches it with a `fallback_` prefix.

---

## The `chat()` Method Flow

The `chat()` method serves as the unified interface used by different parts of the codebase:

```
chat(message, system_message, task_type, conversation_history, messages, max_tokens, response_mode)
  |
  +-- Normalize query from different parameter styles
  |     - Student services: message + system_message + task_type
  |     - Parent services: messages list + max_tokens
  |
  +-- Build context dict (system_message, history)
  |
  +-- route_query(query, context, response_mode)
        |
        +-- Ensure providers are loaded (lazy initialization)
        |
        +-- _classify_task(query) --> task_type
        |
        +-- Branch on response_mode:
              |
              +-- 'text' --> _handle_text_query()
              |     +-- _select_provider(task_type, 'text')
              |     +-- _execute_text_query(provider, query, context)
              |     +-- Return {message, response_mode, provider_used, metadata}
              |
              +-- 'voice' --> _handle_voice_query()
              |     +-- Get text response first
              |     +-- _convert_to_voice(text_response)
              |     +-- Return {message, audio_url, response_mode, provider_used}
              |
              +-- 'video' --> _handle_video_query()
                    +-- Get text response first
                    +-- Video generation (placeholder, not yet implemented)
                    +-- Return {message, video_url, response_mode, provider_used}
```

### Response Format

All methods return a consistent dictionary:

```python
{
    "message": str,           # Text response from AI
    "response_mode": str,     # 'text', 'voice', or 'video'
    "audio_url": Optional[str],  # URL to audio file (voice mode)
    "video_url": Optional[str],  # URL to video file (video mode)
    "provider_used": str,     # Name of the provider that handled the query
    "metadata": {
        "task_type": str,     # Classified task type
        "timestamp": str      # ISO timestamp
    }
}
```

### The `process_request()` Method

An alternative interface used by instructor services. It wraps `chat()` and returns a response with a `response` key for backward compatibility:

```python
{
    "response": str,       # Same as 'message'
    "message": str,        # Text response
    "provider": str,       # Provider name
    "metadata": dict       # Additional metadata
}
```

---

## Provider Selection Algorithm

The `_select_provider()` method implements priority-based selection:

```
_select_provider(task_type, response_mode)
  |
  +-- 1. Select provider pool by response_mode
  |     - 'text' --> text_providers
  |     - 'voice' --> voice_providers
  |     - 'video' --> video_providers
  |
  +-- 2. Filter by specialization
  |     - Find providers whose specialization contains the task_type
  |     - e.g., task_type='reasoning' matches specialization='reasoning'
  |
  +-- 3. Within specialized matches, prefer is_recommended=True
  |
  +-- 4. If no specialized match, use recommended general providers
  |
  +-- 5. Last resort: first available provider in the pool
```

### Selection Priority (Highest to Lowest)

1. Specialized + Recommended
2. Specialized (any)
3. General + Recommended
4. First available

---

## Task Classification

The `_classify_task()` method uses keyword analysis on the query text:

| Task Type | Keywords |
|---|---|
| `reasoning` | solve, calculate, prove, analyze, compare, why, how does, explain, logic, math |
| `creative` | write, create, story, poem, imagine, design, generate, compose, invent |
| `research` | research, find, search, what is, who is, when did, where is, latest, current, news |
| `general` | Default -- when no keywords match |

This is a simple keyword-based classifier. The docstring notes that in production, this could be enhanced with ML-based classification.

---

## Prompt Building

The `_build_prompt()` method constructs the full prompt sent to the AI provider:

```
[System Message or Default]
  "You are The Bird AI, a helpful educational tutor for {student_name}"
[Grade Level Context]
  "The student is in grade {grade_level}. Adjust your explanations to their level."
[Conversation History -- last 3 exchanges]
  "user: ..."
  "assistant: ..."
[Current Question]
  "Current question: {query}"
```

Context fields supported:
- `student_name` -- defaults to "Student"
- `grade_level` -- optional, omitted if not provided
- `history` -- list of `{role, message}` dicts; last 3 are included
- `system_message` -- custom system prompt, overrides the default

---

## API Key Security

API keys stored in the `ai_providers` table are encrypted at rest using Fernet symmetric encryption.

### Encryption Flow

1. Admin enters a plaintext API key via the admin interface
2. `encrypt_api_key(plain_key)` encrypts using Fernet with the `ENCRYPTION_KEY` setting
3. The encrypted string is stored in `ai_providers.api_key_encrypted`

### Decryption Flow

1. `load_providers()` reads encrypted keys from the database
2. `decrypt_api_key(encrypted_key)` decrypts using the same Fernet key
3. The plaintext key is passed to the SDK client constructor
4. Plaintext keys are only held in memory within `providers_cache`

### Key Derivation

The Fernet key is derived from `settings.encryption_key`:
- If the key is already a valid Fernet key (44 chars, base64), it is used directly
- Otherwise, SHA-256 is applied to derive a 32-byte key, then URL-safe base64 encoded

See `backend/app/utils/security.py` for the full implementation.

---

## Configuration

### Database Table: `ai_providers`

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | String(100) | Provider display name (used for SDK detection) |
| `provider_type` | String(50) | `text`, `voice`, `video`, or `multimodal` |
| `api_endpoint` | String(255) | API base URL |
| `api_key_encrypted` | String(500) | Fernet-encrypted API key |
| `specialization` | String(100) | Task specialization (e.g., `reasoning`, `creative`, `research`, `general`) |
| `is_active` | Boolean | Whether the provider is enabled |
| `is_recommended` | Boolean | Platform recommendation flag (higher priority in selection) |
| `cost_per_request` | Numeric(10,6) | Average cost per API request in USD |
| `configuration` | JSONB | Provider-specific settings (model name, temperature, etc.) |
| `description` | String(500) | Human-readable description |
| `created_at` | DateTime | Creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

### Hot Reload

When an admin updates provider configuration, `reload_providers(db)` can be called to refresh the orchestrator's cache without restarting the server.
