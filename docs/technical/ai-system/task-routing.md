# Task Routing

> **Source file**: `backend/app/services/ai_orchestrator.py`
> **Last updated**: 2026-02-15

## Overview

The AI Orchestrator routes student queries to the most appropriate AI provider based on a task classification system. This ensures that each query is handled by the provider best suited for that type of work, optimizing both response quality and cost.

---

## Task Classification

### Classification Method

The `_classify_task()` method performs keyword-based analysis on the query text. It scans the lowercased query for keywords associated with each task type and returns the first match.

### Task Types and Keywords

| Task Type | Keywords | Best Provider |
|---|---|---|
| `reasoning` | solve, calculate, prove, analyze, compare, why, how does, explain, logic, math | Gemini Pro (default), Claude (if specialized) |
| `creative` | write, create, story, poem, imagine, design, generate, compose, invent | Claude (preferred for creative tasks) |
| `research` | research, find, search, what is, who is, when did, where is, latest, current, news | Grok (if available), Gemini (fallback) |
| `general` | Default when no keywords match | Gemini Pro (recommended general provider) |

### Classification Priority

Keywords are checked in this order: reasoning, creative, research. The first match wins. If no keywords match, the query defaults to `general`.

### Examples

| Query | Classified As | Reason |
|---|---|---|
| "Solve this equation: 2x + 5 = 15" | `reasoning` | Contains "solve" |
| "Write a story about a lion" | `creative` | Contains "write" and "story" |
| "What is photosynthesis?" | `research` | Contains "what is" |
| "Help me study for my exam" | `general` | No matching keywords |
| "Explain why the sky is blue" | `reasoning` | Contains "explain" and "why" |
| "Create a poem about Kenya" | `creative` | Contains "create" and "poem" |

---

## Provider Specialization Matching

Each AI provider in the `ai_providers` table has a `specialization` field (e.g., `"reasoning"`, `"creative"`, `"research"`, `"general"`). The orchestrator matches the classified task type against this field.

### Matching Logic

```python
specialized = [
    p for p in provider_pool
    if p.specialization and task_type in p.specialization.lower()
]
```

The match is a substring check, so a provider with `specialization="general,reasoning"` would match both `general` and `reasoning` task types.

---

## Priority-Based Selection

When multiple providers match a task type, the selection algorithm applies priority ordering:

```
1. Specialized providers with is_recommended=True
   |
   +-- Return first match
   |
2. Specialized providers (any)
   |
   +-- Return first match
   |
3. General providers with is_recommended=True
   |
   +-- Return first match
   |
4. First available provider in the pool
   |
   +-- Return first
```

### The `is_recommended` Flag

Administrators can mark specific providers as "recommended" in the `ai_providers` table. This flag gives the provider higher priority during selection. For example:

- If Gemini and Claude both support `reasoning`, and Gemini is marked `is_recommended=True`, Gemini will be selected for reasoning tasks.
- An admin can change the recommendation to Claude by updating the database, without any code changes.

---

## Response Mode Routing

Before task-based selection occurs, the orchestrator first selects the appropriate provider pool based on the requested response mode:

| Response Mode | Provider Pool | Processing |
|---|---|---|
| `text` | `text_providers` | Direct text generation |
| `voice` | `text_providers` + `voice_providers` | Generate text first, then convert to speech |
| `video` | `text_providers` + `video_providers` | Generate text first, then create video |

For `voice` and `video` modes, the orchestrator chains two providers:
1. A text provider generates the response content
2. A voice/video provider converts it to the target format

---

## Cost Optimization Considerations

### Provider Cost Tiers

| Tier | Providers | Use Case |
|---|---|---|
| Free | OpenRouter (nemotron-nano) | Development, testing, low-priority queries |
| Low | Gemini Pro, Groq | Default for most student queries |
| Medium | Claude, Grok | Specialized tasks (creative, research) |
| High | GPT-4 | Fallback only |

### Optimization Strategies

1. **Default to low-cost providers**: Gemini Pro is the recommended default for `general` queries, keeping costs minimal for the majority of interactions.

2. **Selective specialization**: Higher-cost providers like Claude are only invoked when the task type specifically benefits from their capabilities (e.g., creative writing).

3. **Free tier fallbacks**: OpenRouter with free models serves as the last-resort fallback, ensuring the system always provides a response even at zero marginal cost.

4. **Admin configurability**: The `cost_per_request` field in the database allows administrators to track and compare provider costs, informing future routing decisions.

---

## Usage Tracking

### Per-Request Tracking

Each response from the orchestrator includes metadata that identifies the provider used:

```python
{
    "provider_used": "Gemini Pro (Fallback)",
    "metadata": {
        "task_type": "reasoning",
        "timestamp": "2026-02-15T10:30:00.000Z"
    }
}
```

### Aggregation Points

Usage can be tracked at multiple levels:
- **Per student**: Track which providers serve each student's queries
- **Per task type**: Monitor distribution of reasoning/creative/research/general queries
- **Per provider**: Aggregate request counts and estimated costs
- **Per time period**: Daily/weekly/monthly usage patterns

### Future Enhancements

The classification system is noted in the codebase as a candidate for enhancement:

> "This is a simple keyword-based classifier. In production, this could be enhanced with ML-based classification."

Potential improvements include:
- ML-based intent classification using a lightweight model
- Contextual classification that considers conversation history
- Student-specific routing based on learning profile and preferences
- A/B testing framework for comparing provider quality per task type
