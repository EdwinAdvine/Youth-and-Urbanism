# AI Agent Profile API Reference

> **Base URL:** `/api/v1/ai-agent-profile`
>
> **Authentication:** All endpoints require a valid JWT Bearer token.
>
> **Version:** 1.0 &mdash; Urban Home School (The Bird AI)

---

## Table of Contents

1. [Get AI Agent Profile](#1-get-ai-agent-profile)
2. [Update Agent Customization](#2-update-agent-customization)
3. [Customize Personality](#3-customize-personality)
4. [Error Codes](#error-codes)
5. [Data Models](#data-models)

---

## 1. Get AI Agent Profile

Retrieve the authenticated user's AI agent profile, including the agent name, avatar, personality settings, expertise focus, and response style.

Each user has a one-to-one relationship with their AI agent profile. If no profile exists yet, a default profile is created on first access.

### Request

```
GET /api/v1/ai-agent-profile/
```

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "agp1a2b3-c4d5-6789-0abc-def123456789",
    "user_id": "u1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "agent_name": "Birdy",
    "avatar_url": "https://cdn.urbanhomeschool.co.ke/avatars/birdy-default.webp",
    "persona": "A helpful, encouraging AI tutor who specializes in making mathematics fun and accessible for Kenyan students.",
    "preferred_language": "en",
    "expertise_focus": ["mathematics", "science", "technology"],
    "response_style": "conversational",
    "quick_action_shortcuts": [
      {
        "label": "Explain This",
        "action": "explain_topic"
      },
      {
        "label": "Quiz Me",
        "action": "generate_quiz"
      },
      {
        "label": "Summarize",
        "action": "summarize_lesson"
      }
    ],
    "created_at": "2025-09-01T08:00:00Z",
    "updated_at": "2026-02-10T14:30:00Z"
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/ai-agent-profile/" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 2. Update Agent Customization

Update the AI agent's name, avatar, preferred language, expertise focus, and quick action shortcuts.

### Request

```
PUT /api/v1/ai-agent-profile/
```

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |
| `Content-Type`  | `application/json`  |

### Request Body

```json
{
  "name": "Einstein",
  "avatar": "https://cdn.urbanhomeschool.co.ke/avatars/einstein-custom.webp",
  "preferred_language": "sw",
  "expertise_focus": ["mathematics", "physics"],
  "quick_action_shortcuts": [
    {
      "label": "Solve Step by Step",
      "action": "solve_step_by_step"
    },
    {
      "label": "Give Me a Hint",
      "action": "provide_hint"
    },
    {
      "label": "Practice Problems",
      "action": "generate_practice"
    },
    {
      "label": "Explain in Kiswahili",
      "action": "explain_kiswahili"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Custom name for the AI agent (max 100 characters). Default: "The Bird AI". |
| `avatar` | string | No | URL to a custom avatar image (max 500 characters). |
| `preferred_language` | string | No | Preferred response language code. Supported: `en` (English), `sw` (Kiswahili). Default: `en`. |
| `expertise_focus` | array of strings | No | Areas the agent should prioritize. Examples: `mathematics`, `science`, `english`, `kiswahili`, `technology`, `creative-arts`. |
| `quick_action_shortcuts` | array of objects | No | Custom quick action buttons for the chat interface. |
| `quick_action_shortcuts[].label` | string | Yes (if array provided) | Display label for the shortcut button. |
| `quick_action_shortcuts[].action` | string | Yes (if array provided) | Action identifier triggered when clicked. |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "agp1a2b3-c4d5-6789-0abc-def123456789",
    "agent_name": "Einstein",
    "avatar_url": "https://cdn.urbanhomeschool.co.ke/avatars/einstein-custom.webp",
    "preferred_language": "sw",
    "expertise_focus": ["mathematics", "physics"],
    "quick_action_shortcuts": [
      {"label": "Solve Step by Step", "action": "solve_step_by_step"},
      {"label": "Give Me a Hint", "action": "provide_hint"},
      {"label": "Practice Problems", "action": "generate_practice"},
      {"label": "Explain in Kiswahili", "action": "explain_kiswahili"}
    ],
    "updated_at": "2026-02-15T09:30:00Z"
  },
  "message": "AI agent profile updated successfully."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | No valid fields provided for update. |
| `401 Unauthorized` | Missing or invalid JWT token. |
| `422 Unprocessable Entity` | Invalid URL format or language code. |

### cURL Example

```bash
curl -X PUT "http://localhost:8000/api/v1/ai-agent-profile/" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Einstein",
    "avatar": "https://cdn.urbanhomeschool.co.ke/avatars/einstein-custom.webp",
    "preferred_language": "sw",
    "expertise_focus": ["mathematics", "physics"]
  }'
```

---

## 3. Customize Personality

Update the AI agent's personality traits and communication style. This affects how the AI tutor responds to the student's questions, including tone, verbosity, and teaching approach.

### Request

```
PUT /api/v1/ai-agent-profile/personality
```

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |
| `Content-Type`  | `application/json`  |

### Request Body

```json
{
  "personality_traits": {
    "encouragement_level": "high",
    "humor": "moderate",
    "formality": "casual",
    "patience": "high",
    "challenge_level": "moderate"
  },
  "communication_style": "conversational"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `personality_traits` | object | No | Personality configuration for the AI agent. |
| `personality_traits.encouragement_level` | string | No | How encouraging the agent is: `low`, `moderate`, `high`. |
| `personality_traits.humor` | string | No | Humor level in responses: `none`, `low`, `moderate`, `high`. |
| `personality_traits.formality` | string | No | Formality of language: `casual`, `moderate`, `formal`. |
| `personality_traits.patience` | string | No | How patient and repetitive explanations are: `low`, `moderate`, `high`. |
| `personality_traits.challenge_level` | string | No | How challenging the agent makes learning: `easy`, `moderate`, `challenging`. |
| `communication_style` | string | No | Overall response style. Allowed values: `concise`, `detailed`, `conversational`, `academic`. |

### Communication Styles

| Style | Description |
|-------|-------------|
| `concise` | Brief, to-the-point answers. Minimal elaboration. Best for quick reviews. |
| `detailed` | Thorough explanations with examples, step-by-step breakdowns, and context. |
| `conversational` | Friendly, dialog-like responses. Uses questions and encouragement. Default style. |
| `academic` | Formal, structured responses. Uses academic terminology and citations. |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "agp1a2b3-c4d5-6789-0abc-def123456789",
    "persona": "A friendly, encouraging AI tutor with a casual tone and moderate humor. Patiently explains concepts and provides moderate challenges.",
    "response_style": "conversational",
    "personality_traits": {
      "encouragement_level": "high",
      "humor": "moderate",
      "formality": "casual",
      "patience": "high",
      "challenge_level": "moderate"
    },
    "updated_at": "2026-02-15T09:45:00Z"
  },
  "message": "AI agent personality updated successfully."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | No valid fields provided or invalid trait values. |
| `401 Unauthorized` | Missing or invalid JWT token. |
| `422 Unprocessable Entity` | Invalid communication_style value. |

### cURL Example

```bash
curl -X PUT "http://localhost:8000/api/v1/ai-agent-profile/personality" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "personality_traits": {
      "encouragement_level": "high",
      "humor": "moderate",
      "formality": "casual",
      "patience": "high"
    },
    "communication_style": "conversational"
  }'
```

---

## Error Codes

All error responses follow a consistent format:

```json
{
  "status": "error",
  "message": "Human-readable error description.",
  "detail": "Optional technical detail."
}
```

| HTTP Status | Description |
|-------------|-------------|
| `400` | No valid fields provided or invalid values. |
| `401` | Authentication token missing, expired, or invalid. |
| `422` | Semantically invalid request (e.g., unknown communication style). |
| `500` | Unexpected server error. |

---

## Data Models

### AIAgentProfile

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique profile identifier. |
| `user_id` | UUID | FK to user. Unique (one profile per user). Indexed. |
| `agent_name` | string (max 100) | Custom agent display name (default: "The Bird AI"). |
| `avatar_url` | string (max 500) or null | URL to custom avatar image. |
| `persona` | text | Agent personality description used in system prompts. |
| `preferred_language` | string (max 10) | Language code (default: `en`). |
| `expertise_focus` | JSON array | List of learning areas the agent prioritizes. |
| `response_style` | enum | Communication style: `concise`, `detailed`, `conversational`, `academic`. |
| `quick_action_shortcuts` | JSON array | Custom quick action buttons for the chat interface. |
| `created_at` | datetime | Profile creation timestamp. |
| `updated_at` | datetime | Last modification timestamp. |

### ResponseStyle Enum

| Value | Description |
|-------|-------------|
| `concise` | Brief answers with minimal elaboration. |
| `detailed` | Thorough explanations with examples and step-by-step breakdowns. |
| `conversational` | Friendly, dialog-like responses (default). |
| `academic` | Formal, structured responses with academic terminology. |

### Quick Action Shortcut Object

| Field | Type | Description |
|-------|------|-------------|
| `label` | string | Display text for the shortcut button. |
| `action` | string | Action identifier. Predefined actions: `explain_topic`, `generate_quiz`, `summarize_lesson`, `solve_step_by_step`, `provide_hint`, `generate_practice`, `explain_kiswahili`, `create_flashcards`. |
