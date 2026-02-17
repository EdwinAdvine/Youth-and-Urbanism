# AI Tutor API Reference

**Urban Home School (UHS v1) / Urban Bird v1**
*AI Tutor Endpoints -- Core Feature*

Base Path: `/api/v1/ai-tutor`
Last Updated: 2026-02-15

---

## Table of Contents

1. [Overview](#overview)
2. [POST /ai-tutor/chat](#post-ai-tutorchat)
3. [GET /ai-tutor/history](#get-ai-tutorhistory)
4. [GET /ai-tutor/status](#get-ai-tutorstatus)
5. [PUT /ai-tutor/response-mode](#put-ai-tutorresponse-mode)
6. [POST /ai-tutor/reset](#post-ai-tutorreset)
7. [GET /ai-tutor/health](#get-ai-tutorhealth)

---

## Overview

The AI Tutor API is the core feature of the Urban Home School platform (branded as "The Bird AI" / "Urban Bird v1"). It provides personalized one-on-one AI tutoring for students using a multi-AI orchestration layer that dynamically routes queries to the most suitable AI provider.

**Key Features:**
- Multi-modal responses: text, voice (ElevenLabs TTS), and video (Synthesia)
- Automatic AI provider selection based on task classification
- Persistent conversation history stored in JSONB
- Grade-level-aware responses adjusted to the student's CBC grade
- Automatic failover across multiple AI providers

**Important:** All endpoints in this section require authentication with a **student** role. Non-student users will receive a `403 Forbidden` response.

### AI Provider Priority

| Priority | Provider | Model | Specialization |
|----------|----------|-------|----------------|
| Primary | Google Gemini | `gemini-2.5-flash` | General, default |
| Secondary | Groq | `llama-3.3-70b-versatile` | Fast inference |
| Tertiary | OpenRouter | `nvidia/nemotron-nano-9b-v2:free` | Cost-effective |
| Specialized | Anthropic Claude | `claude-3-5-sonnet` | Creative tasks |
| Specialized | OpenAI | `gpt-4` | Reasoning tasks |
| Voice | ElevenLabs | `eleven_multilingual_v2` | Text-to-speech |
| Video | Synthesia | -- | Video generation (planned) |

### Task Classification

The orchestrator classifies queries into task types using keyword analysis:

| Task Type | Trigger Keywords | Preferred Provider |
|-----------|-----------------|-------------------|
| `reasoning` | solve, calculate, prove, analyze, compare, explain, math, logic | Gemini / GPT-4 |
| `creative` | write, create, story, poem, imagine, compose, invent | Claude |
| `research` | research, find, search, latest, current, news | Gemini / Groq |
| `general` | (default) | Recommended provider |

---

## POST /ai-tutor/chat

Send a message to the student's personal AI tutor and receive a response. This is the primary interaction endpoint for the tutoring feature.

The endpoint performs the following steps:
1. Validates the user is a student
2. Retrieves the student's assigned AI tutor
3. Loads conversation history for context
4. Classifies the query task type (reasoning, creative, research, general)
5. Routes to the best AI provider
6. Generates response (with optional voice/video conversion)
7. Saves both messages to conversation history
8. Updates interaction metrics
9. Returns the AI response

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/ai-tutor/chat` |
| **Auth Required** | Yes (Bearer token, student role) |
| **Rate Limit** | 30 requests/minute |

### Request Body

```json
{
  "message": "Can you explain photosynthesis in simple terms for a Grade 7 student?",
  "include_context": true,
  "context_messages": 5
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `message` | string | Yes | -- | The student's question or message |
| `include_context` | boolean | No | `true` | Whether to include previous conversation for context |
| `context_messages` | integer | No | `5` | Number of recent messages to include as context |

### Response (200 OK)

```json
{
  "message": "Great question! Photosynthesis is the process by which plants make their own food using sunlight. Think of it like a recipe:\n\n**Ingredients:**\n- Sunlight (energy from the sun)\n- Water (H2O, absorbed by roots)\n- Carbon dioxide (CO2, from the air through leaves)\n\n**The Recipe:**\nPlants use sunlight to combine water and carbon dioxide to make glucose (sugar for energy) and oxygen (which they release into the air for us to breathe).\n\n**The equation:**\n6CO2 + 6H2O + light energy -> C6H12O6 + 6O2\n\nSo plants are like little food factories powered by the sun!",
  "response_mode": "text",
  "audio_url": null,
  "video_url": null,
  "conversation_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": "2026-02-15T14:30:00.000000"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | The AI tutor's text response |
| `response_mode` | string | Actual response mode delivered (`text`, `voice`, or `video`) |
| `audio_url` | string or null | URL to audio file (when response_mode is `voice`) |
| `video_url` | string or null | URL to video file (when response_mode is `video`) |
| `conversation_id` | UUID | The AI tutor's unique identifier |
| `timestamp` | datetime | Response generation timestamp |

### Response Modes

| Mode | Behavior | Dependencies |
|------|----------|-------------|
| `text` | Text-only response (fastest, lowest bandwidth) | Text AI provider |
| `voice` | Text response + audio narration URL | Text AI + ElevenLabs |
| `video` | Text response + AI-generated video URL | Text AI + Synthesia (planned) |

The response mode is determined by the student's AI tutor preference (set via `PUT /ai-tutor/response-mode`).

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `403` | User is not a student | `{"detail": "This endpoint is only accessible to students"}` |
| `404` | Student record not found | `{"detail": "Student record not found"}` |
| `404` | AI tutor not found | `{"detail": "AI tutor not found for this student"}` |
| `500` | AI service failure | Returns graceful fallback message within the `message` field |

**Note on AI failures:** When all AI providers fail, the endpoint still returns a 200 status with a user-friendly error message in the `message` field rather than throwing a 500 error. This provides a better student experience.

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/ai-tutor/chat \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Can you explain photosynthesis in simple terms?",
    "include_context": true,
    "context_messages": 5
  }'
```

---

## GET /ai-tutor/history

Retrieve the conversation history between the student and their AI tutor. Supports pagination for large conversation histories.

### Details

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Path** | `/api/v1/ai-tutor/history` |
| **Auth Required** | Yes (Bearer token, student role) |
| **Rate Limit** | 30 requests/minute |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | `50` | Maximum number of messages to return |
| `offset` | integer | No | `0` | Number of messages to skip (for pagination) |

### Response (200 OK)

```json
{
  "tutor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "student_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "messages": [
    {
      "role": "user",
      "content": "What is the capital of Kenya?",
      "timestamp": "2026-02-15T10:00:00.000000"
    },
    {
      "role": "assistant",
      "content": "The capital of Kenya is Nairobi! It is the largest city in Kenya and serves as both the capital city and the commercial hub of East Africa. Nairobi is sometimes called the 'Green City in the Sun' because of its pleasant climate and green spaces.",
      "timestamp": "2026-02-15T10:00:05.000000"
    },
    {
      "role": "user",
      "content": "Can you explain photosynthesis in simple terms?",
      "timestamp": "2026-02-15T14:30:00.000000"
    },
    {
      "role": "assistant",
      "content": "Photosynthesis is the process by which plants make their own food using sunlight...",
      "timestamp": "2026-02-15T14:30:03.000000"
    }
  ],
  "total_messages": 42,
  "oldest_message": "2026-02-01T08:00:00.000000",
  "newest_message": "2026-02-15T14:30:03.000000"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `tutor_id` | UUID | AI tutor's unique identifier |
| `student_id` | UUID | Student's unique identifier |
| `messages` | array | Array of chat messages |
| `messages[].role` | string | Either `"user"` or `"assistant"` |
| `messages[].content` | string | Message text content |
| `messages[].timestamp` | datetime | When the message was sent |
| `total_messages` | integer | Total number of messages in full history |
| `oldest_message` | datetime or null | Timestamp of the oldest message |
| `newest_message` | datetime or null | Timestamp of the newest message |

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `403` | User is not a student | `{"detail": "This endpoint is only accessible to students"}` |
| `404` | Student record not found | `{"detail": "Student record not found"}` |
| `404` | AI tutor not found | `{"detail": "AI tutor not found for this student"}` |

### cURL Example

```bash
# Get the 20 most recent messages
curl -X GET "http://localhost:8000/api/v1/ai-tutor/history?limit=20&offset=0" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get the next page
curl -X GET "http://localhost:8000/api/v1/ai-tutor/history?limit=20&offset=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## GET /ai-tutor/status

Get comprehensive status and metrics for the student's AI tutor, including interaction counts, response mode preferences, performance metrics, and learning path progress.

### Details

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Path** | `/api/v1/ai-tutor/status` |
| **Auth Required** | Yes (Bearer token, student role) |
| **Rate Limit** | 30 requests/minute |

### Response (200 OK)

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "student_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "name": "The Bird AI",
  "response_mode": "text",
  "total_interactions": 42,
  "last_interaction": "2026-02-15T14:30:03.000000",
  "performance_metrics": {
    "topics_covered": 15,
    "correct_answers": 38,
    "areas_of_strength": ["Mathematics", "Science"],
    "areas_for_improvement": ["Kiswahili", "Social Studies"]
  },
  "learning_path": {
    "current_topic": "Photosynthesis",
    "next_topics": ["Cell Structure", "Ecosystems"],
    "completed_topics": ["Basic Arithmetic", "Fractions"]
  },
  "created_at": "2026-02-01T08:00:00.000000"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | AI tutor's unique identifier |
| `student_id` | UUID | Student's unique identifier |
| `name` | string | AI tutor's display name (e.g., "The Bird AI") |
| `response_mode` | string | Current preference: `text`, `voice`, or `video` |
| `total_interactions` | integer | Total number of chat interactions |
| `last_interaction` | datetime or null | Timestamp of most recent interaction |
| `performance_metrics` | object or null | AI-tracked student performance data |
| `learning_path` | object or null | Personalized learning path progress |
| `created_at` | datetime | When the AI tutor was created |

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `403` | User is not a student | `{"detail": "This endpoint is only accessible to students"}` |
| `404` | Student record not found | `{"detail": "Student record not found"}` |
| `404` | AI tutor not found | `{"detail": "AI tutor not found for this student"}` |

### cURL Example

```bash
curl -X GET http://localhost:8000/api/v1/ai-tutor/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## PUT /ai-tutor/response-mode

Update the AI tutor's response mode preference. This controls how the AI tutor delivers responses to the student.

### Details

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **Path** | `/api/v1/ai-tutor/response-mode` |
| **Auth Required** | Yes (Bearer token, student role) |
| **Rate Limit** | 30 requests/minute |

### Request Body

```json
{
  "response_mode": "voice"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `response_mode` | string (enum) | Yes | One of: `text`, `voice`, `video` |

### Response Mode Options

| Mode | Description | Speed | Data Usage |
|------|-------------|-------|------------|
| `text` | Text-only responses | Fastest | Lowest |
| `voice` | Text with ElevenLabs audio narration | Moderate | Moderate |
| `video` | Text with Synthesia AI-generated video | Slowest | Highest |

### Response (200 OK)

```json
{
  "response_mode": "voice",
  "message": "Response mode updated to voice"
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `403` | User is not a student | `{"detail": "This endpoint is only accessible to students"}` |
| `404` | Student record not found | `{"detail": "Student record not found"}` |
| `404` | AI tutor not found | `{"detail": "AI tutor not found for this student"}` |
| `422` | Invalid response mode | `{"detail": "Validation error", "errors": [...]}` |

### cURL Example

```bash
curl -X PUT http://localhost:8000/api/v1/ai-tutor/response-mode \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "response_mode": "voice"
  }'
```

---

## POST /ai-tutor/reset

Reset the conversation history with the AI tutor. This clears all messages but preserves learning path progress and performance metrics.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/ai-tutor/reset` |
| **Auth Required** | Yes (Bearer token, student role) |
| **Rate Limit** | 30 requests/minute |

### Request Body

No request body required.

### What Gets Reset

| Data | Reset? | Description |
|------|--------|-------------|
| Conversation history | Yes | All chat messages are cleared |
| Total interactions counter | Yes | Reset to 0 |
| Last interaction timestamp | Yes | Set to null |
| Performance metrics | No | Preserved across resets |
| Learning path | No | Preserved across resets |

### Response (200 OK)

```json
{
  "message": "Conversation history reset successfully",
  "tutor_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `403` | User is not a student | `{"detail": "This endpoint is only accessible to students"}` |
| `404` | Student record not found | `{"detail": "Student record not found"}` |
| `404` | AI tutor not found | `{"detail": "AI tutor not found for this student"}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/ai-tutor/reset \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## GET /ai-tutor/health

Check the health status of the AI Tutor service. This is a public endpoint (no authentication required) used for monitoring and load balancer health checks.

### Details

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Path** | `/api/v1/ai-tutor/health` |
| **Auth Required** | No |
| **Rate Limit** | 100 requests/minute |

### Response (200 OK)

```json
{
  "status": "operational",
  "service": "AI Tutor",
  "version": "1.0.0",
  "features": {
    "chat": true,
    "history": true,
    "response_modes": ["text", "voice", "video"],
    "ai_orchestrator": false
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Service status: `operational` or `degraded` |
| `service` | string | Service name |
| `version` | string | Service version |
| `features.chat` | boolean | Whether chat is available |
| `features.history` | boolean | Whether history retrieval is available |
| `features.response_modes` | array | Supported response modes |
| `features.ai_orchestrator` | boolean | Whether the AI orchestrator is fully connected |

### cURL Example

```bash
curl -X GET http://localhost:8000/api/v1/ai-tutor/health
```

---

## Conversation Data Model

The AI tutor stores conversation history as a JSONB array in the `ai_tutors` table. Each message has the following structure:

```json
{
  "role": "user",
  "content": "The student's message text",
  "timestamp": "2026-02-15T14:30:00.000000"
}
```

or

```json
{
  "role": "assistant",
  "content": "The AI tutor's response text",
  "timestamp": "2026-02-15T14:30:03.000000"
}
```

Messages are appended in chronological order. The `total_interactions` counter on the AI tutor record tracks the total number of exchanges (each user message + AI response counts as one interaction).

---

## AI Orchestrator Integration

The chat endpoint integrates with the AI Orchestrator service (`app/services/ai_orchestrator.py`), which provides:

1. **Dynamic Provider Loading**: AI providers are loaded from the database, allowing admin-configured changes without code deployment.
2. **Task Classification**: Queries are classified into reasoning, creative, research, or general tasks.
3. **Intelligent Routing**: The best provider is selected based on task type, specialization, and recommendation priority.
4. **Failover Chain**: If the primary provider fails, the system automatically tries Gemini, then Groq, then OpenRouter.
5. **Context Building**: The orchestrator builds enhanced prompts with student grade level, conversation history, and system context.
6. **Multi-Modal Output**: Text responses can be converted to voice (ElevenLabs) or video (Synthesia, planned).
