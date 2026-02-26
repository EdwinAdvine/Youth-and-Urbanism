# AI Providers

> **Source files**: `backend/app/services/ai_orchestrator.py`, `backend/app/models/ai_provider.py`
> **Last updated**: 2026-02-15

## Overview

Urban Bird v1 integrates with multiple AI providers to deliver a robust educational experience. Each provider is specialized for different aspects of the platform. Providers are managed through the `ai_providers` database table and initialized dynamically by the AI Orchestrator.

---

## Text AI Providers

### Google Gemini Pro

**Role**: Default primary model for general education and reasoning.

| Property | Value |
|---|---|
| Model | `gemini-2.5-flash` |
| SDK | `google.generativeai` |
| API Type | Google Generative AI SDK |
| Specialization | General, reasoning |
| Recommended | Yes |

**Initialization**:
```python
import google.generativeai as genai
genai.configure(api_key=decrypted_api_key)
client = genai.GenerativeModel('gemini-2.5-flash')
```

**Execution**:
```python
response = await asyncio.to_thread(client.generate_content, prompt)
text = response.text
```

**Notes**:
- Uses `asyncio.to_thread()` because the Google SDK is synchronous
- Primary fallback provider -- initialized from `settings.gemini_api_key` when the database is unavailable
- Best suited for general educational tutoring, math, science, and reasoning tasks
- Cost-effective for high-volume student interactions

**Configuration Options** (JSONB):
- `temperature`: Controls response randomness (0.0-1.0)
- `max_output_tokens`: Maximum response length
- `safety_settings`: Content filtering thresholds

---

### Anthropic Claude

**Role**: Creative tasks, detailed explanations, and nuanced content.

| Property | Value |
|---|---|
| Model | `claude-3-5-sonnet-20241022` |
| SDK | `anthropic` |
| API Type | Anthropic Messages API |
| Specialization | Creative, detailed explanations |
| Recommended | For creative tasks |

**Initialization**:
```python
from anthropic import Anthropic
client = Anthropic(api_key=decrypted_api_key)
```

**Execution**:
```python
message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": prompt}]
)
text = message.content[0].text
```

**Notes**:
- Synchronous SDK call (no `asyncio.to_thread` wrapper in current implementation)
- Excels at creative writing, story generation, poetry, and detailed educational explanations
- Higher per-request cost than Gemini; used selectively for creative tasks

**Configuration Options** (JSONB):
- `max_tokens`: Maximum response length (default: 1024)
- `temperature`: Controls response randomness
- `model_version`: Override default model name

---

### OpenAI GPT-4

**Role**: Fallback model with broad general capabilities.

| Property | Value |
|---|---|
| Model | `gpt-4` |
| SDK | `openai` |
| API Type | OpenAI Chat Completions |
| Specialization | General (fallback) |
| Recommended | No (fallback role) |

**Initialization**:
```python
from openai import OpenAI
client = OpenAI(api_key=decrypted_api_key)
```

**Execution**:
```python
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}]
)
text = response.choices[0].message.content
```

**Notes**:
- Serves as a general-purpose fallback when specialized providers are unavailable
- Higher cost per request; used sparingly
- No `asyncio.to_thread` wrapper in current implementation

---

### Grok (X.AI)

**Role**: Research and current events.

| Property | Value |
|---|---|
| Model | Configured via admin |
| SDK | OpenAI-compatible API |
| API Type | OpenAI Chat Completions (custom base URL) |
| Specialization | Research |
| Recommended | For research tasks |

**Initialization**:
```python
from openai import OpenAI
client = OpenAI(
    api_key=decrypted_api_key,
    base_url="https://api.x.ai/v1"  # configured via api_endpoint
)
```

**Notes**:
- Uses the OpenAI SDK with X.AI's compatible API endpoint
- Detected by the orchestrator when the provider name contains `grok`
- Best for queries about current events, research topics, and factual lookups
- Availability depends on X.AI API access

---

### Groq

**Role**: Fast inference for latency-sensitive requests.

| Property | Value |
|---|---|
| Model | `llama-3.3-70b-versatile` |
| SDK | `openai` (compatible) |
| API Type | OpenAI-compatible (Groq endpoint) |
| Base URL | `https://api.groq.com/openai/v1` |
| Specialization | General (fast inference) |

**Initialization**:
```python
from openai import OpenAI
client = OpenAI(
    api_key=decrypted_api_key,
    base_url="https://api.groq.com/openai/v1"
)
```

**Execution**:
```python
response = await asyncio.to_thread(
    client.chat.completions.create,
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": prompt}]
)
text = response.choices[0].message.content
```

**Notes**:
- Uses `asyncio.to_thread()` for async compatibility
- Secondary fallback provider (initialized from `settings.groq_api_key`)
- Extremely fast inference times; suitable for real-time conversational interactions
- Uses open-source Llama model, reducing vendor lock-in

---

### OpenRouter

**Role**: Multi-model access gateway providing cost-optimized inference.

| Property | Value |
|---|---|
| Model | `nvidia/nemotron-nano-9b-v2:free` (default) |
| SDK | `openai` (compatible) |
| API Type | OpenAI-compatible (OpenRouter endpoint) |
| Base URL | `https://openrouter.ai/api/v1` |
| Specialization | General |

**Initialization**:
```python
from openai import OpenAI
client = OpenAI(
    api_key=decrypted_api_key,
    base_url="https://openrouter.ai/api/v1"
)
```

**Execution**:
```python
response = await asyncio.to_thread(
    client.chat.completions.create,
    model="nvidia/nemotron-nano-9b-v2:free",
    messages=[{"role": "user", "content": prompt}]
)
text = response.choices[0].message.content
```

**Notes**:
- Tertiary fallback provider (initialized from `settings.openrouter_api_key`)
- Provides access to many models through a single API key
- Free tier models available for development and testing
- Uses `asyncio.to_thread()` for async compatibility

---

## Voice AI Providers

### ElevenLabs

**Role**: Text-to-speech voice responses for auditory learners.

| Property | Value |
|---|---|
| SDK | `elevenlabs` |
| API Type | ElevenLabs REST API |
| Specialization | Voice synthesis |
| Default Voice | Rachel |
| Default Model | `eleven_multilingual_v2` |

**Initialization**:
```python
from elevenlabs import ElevenLabs
client = ElevenLabs(api_key=decrypted_api_key)
```

**Execution** (planned implementation):
```python
audio = client.generate(
    text=text_response,
    voice="Rachel",
    model="eleven_multilingual_v2"
)
# Save audio to file storage and return URL
```

**Current Status**: The voice conversion pipeline is scaffolded but not fully implemented. The `_convert_to_voice()` method in the orchestrator currently returns `None`. Full implementation requires:
1. Audio file generation via ElevenLabs SDK
2. Saving audio to file storage (local, S3, or Azure)
3. Returning a publicly accessible URL

**Configuration Options** (JSONB):
- `voice_id`: ElevenLabs voice identifier
- `model_id`: TTS model (e.g., `eleven_multilingual_v2`)
- `stability`: Voice stability setting (0.0-1.0)
- `similarity_boost`: Voice similarity setting (0.0-1.0)

---

## Video AI Providers

### Synthesia

**Role**: AI-generated video lessons with virtual presenters.

| Property | Value |
|---|---|
| SDK | REST API (via `requests`) |
| API Type | Synthesia REST API |
| Specialization | Video generation |

**Current Status**: Not yet implemented. The `_handle_video_query()` method returns a text response with a placeholder notice. The `settings.synthesia_api_key` configuration field is available.

**Planned Implementation**:
1. Accept text content for video narration
2. POST to Synthesia API to create video
3. Poll for video generation completion
4. Return download/streaming URL

---

## Provider Comparison Matrix

| Provider | Type | Model | Async | Fallback Priority | Cost Tier |
|---|---|---|---|---|---|
| Gemini Pro | Text | gemini-2.5-flash | to_thread | 1 (Primary) | Low |
| Groq | Text | llama-3.3-70b-versatile | to_thread | 2 (Secondary) | Low |
| OpenRouter | Text | nemotron-nano-9b-v2:free | to_thread | 3 (Tertiary) | Free |
| Claude | Text | claude-3-5-sonnet | Direct | DB only | Medium |
| GPT-4 | Text | gpt-4 | Direct | DB only | High |
| Grok | Text | (configurable) | DB only | DB only | Medium |
| ElevenLabs | Voice | eleven_multilingual_v2 | N/A | Voice primary | Per-character |
| Synthesia | Video | N/A | N/A | Not implemented | Per-video |

---

## Cost Tracking

Each provider has a `cost_per_request` field (Numeric(10,6)) in the `ai_providers` table. This allows administrators to:

- Track estimated costs per provider
- Make cost-informed routing decisions
- Set spending limits (future feature)
- Generate usage reports by provider

The orchestrator metadata response includes the provider name, enabling downstream cost aggregation.

---

## Adding a New Provider

To add a new AI provider:

1. **Via Admin Interface**: Insert a row into the `ai_providers` table with the provider's name, type, API endpoint, and encrypted API key.

2. **SDK Support**: If the provider uses an OpenAI-compatible API, it will work automatically via the OpenAI SDK with a custom `base_url`. For providers requiring a dedicated SDK:
   a. Add the SDK to `requirements.txt`
   b. Add an import at the top of `ai_orchestrator.py`
   c. Add a name-matching branch in `_initialize_provider()`

3. **Reload**: Call `reload_providers(db)` or restart the server to pick up the new configuration.
