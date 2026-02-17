# Failover Mechanism

> **Source file**: `backend/app/services/ai_orchestrator.py`
> **Last updated**: 2026-02-15

## Overview

The AI Orchestrator implements a multi-level failover system to ensure that student queries always receive a response, even when individual AI providers experience outages. The system cascades through alternative providers in a defined priority order.

---

## Failover Architecture

```
Primary Provider Attempt
  |
  +-- Success --> Return response
  |
  +-- Failure (any exception)
        |
        +-- _execute_fallback_query()
              |
              +-- Gemini Fallback --> Success --> Return response
              |     |
              |     +-- Failure
              |
              +-- Groq Fallback --> Success --> Return response
              |     |
              |     +-- Failure
              |
              +-- OpenRouter Fallback --> Success --> Return response
              |     |
              |     +-- Failure
              |
              +-- Return error message to user
                    "I apologize, but I'm currently unable to
                     process your request. Please try again later."
```

---

## Primary Provider Attempt

When a query is routed to a provider via `_execute_text_query()`:

1. The cached provider client is retrieved from `providers_cache`
2. The prompt is built with context via `_build_prompt()`
3. The appropriate SDK method is called based on provider type
4. If the call succeeds, the response text is returned immediately

If any exception occurs during steps 1-3, the method catches it and delegates to `_execute_fallback_query()`.

### Error Detection

The failover is triggered by any exception during query execution. This includes:
- Network timeouts and connection errors
- API rate limiting (HTTP 429)
- Authentication failures (expired/invalid API key)
- Model-specific errors (content filtering, token limits)
- SDK exceptions (malformed responses, serialization errors)
- Provider-side server errors (HTTP 500/502/503)

```python
except Exception as e:
    logger.error(
        f"Error executing query with {provider.name}: {str(e)}"
    )
    return await self._execute_fallback_query(query, context)
```

---

## Fallback Provider Chain

The `_execute_fallback_query()` method attempts providers in a fixed priority order:

### Priority 1: Gemini Fallback

```python
if 'fallback_gemini' in self.providers_cache:
    client = self.providers_cache['fallback_gemini']['client']
    prompt = self._build_prompt(query, context)
    response = await asyncio.to_thread(client.generate_content, prompt)
    return response.text
```

- Uses the Gemini client initialized from `settings.gemini_api_key`
- Wrapped in `asyncio.to_thread()` for async compatibility
- Most reliable fallback; typically available even when database providers fail

### Priority 2: Groq Fallback

```python
if 'fallback_groq' in self.providers_cache:
    client = self.providers_cache['fallback_groq']['client']
    prompt = self._build_prompt(query, context)
    response = await asyncio.to_thread(
        client.chat.completions.create,
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
```

- Uses the Groq client initialized from `settings.groq_api_key`
- OpenAI-compatible API via `https://api.groq.com/openai/v1`
- Fast inference times; good fallback for latency-sensitive scenarios

### Priority 3: OpenRouter Fallback

```python
if 'fallback_openrouter' in self.providers_cache:
    client = self.providers_cache['fallback_openrouter']['client']
    prompt = self._build_prompt(query, context)
    response = await asyncio.to_thread(
        client.chat.completions.create,
        model="nvidia/nemotron-nano-9b-v2:free",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
```

- Uses the OpenRouter client initialized from `settings.openrouter_api_key`
- Uses a free-tier model (`nemotron-nano-9b-v2:free`) for zero-cost fallback
- Last resort before returning an error message

### Final Fallback: Error Message

If all providers fail, a friendly error message is returned to the user:

```
"I apologize, but I'm currently unable to process your request.
 Please try again later."
```

This ensures the application never throws an unhandled exception to the frontend.

---

## Provider Initialization Failover

The failover system also applies during provider initialization:

### Database Loading Failure

```
load_providers()
  |
  +-- Query database for active providers
  |     |
  |     +-- Success --> Initialize each provider individually
  |     |     |
  |     |     +-- Individual failure --> Log error, skip, continue with others
  |     |
  |     +-- Exception (DB connection, query error)
  |           |
  |           +-- _initialize_fallback_providers()
  |
  +-- No database session (db=None)
        |
        +-- _initialize_fallback_providers()
```

### No Active Providers in Database

If the database query returns zero active providers:

```python
if not providers:
    logger.warning("No active AI providers found in database")
    await self._initialize_fallback_providers()
    return
```

### Individual Provider Initialization Failure

If a specific provider fails to initialize (e.g., invalid encrypted key, unsupported SDK), it is skipped and the remaining providers continue to be initialized:

```python
for provider in providers:
    try:
        await self._initialize_provider(provider)
        # ... categorize provider
    except Exception as e:
        logger.error(f"Failed to initialize provider {provider.name}: {str(e)}")
        continue  # Skip this provider, continue with others
```

---

## Logging and Monitoring

### Log Levels

| Level | When |
|---|---|
| `INFO` | Provider initialized successfully, query routed, fallback provider used |
| `WARNING` | No providers available, fallback mode activated, no voice providers |
| `ERROR` | Provider initialization failure, query execution failure, fallback failure |

### Key Log Messages

```
# Initialization
"Loading AI providers from database..."
"Found {n} active providers"
"Initialized provider: {name} (type: {type}, specialization: {spec})"
"Failed to initialize provider {name}: {error}"
"No active AI providers found in database"
"Initializing fallback providers from environment"

# Query routing
"Routing query (mode: {mode}): {query_preview}..."
"Query classified as: {task_type}"
"Selected recommended specialized provider: {name}"
"Selected first available provider: {name}"

# Failover
"Error executing query with {name}: {error}"
"Attempting fallback provider"
"Gemini fallback failed: {error}"
"Groq fallback failed: {error}"
"OpenRouter fallback failed: {error}"
```

---

## Admin Notification on Provider Outages

Currently, the system logs all provider failures but does not actively notify administrators. The following notification channels are recommended for production:

### Recommended Implementation

1. **WebSocket Events**: Broadcast `ai.anomaly` events to admin WebSocket connections when a provider fails repeatedly
2. **Email Alerts**: Send email notifications when a provider has failed more than N times within a time window
3. **Dashboard Indicators**: Show provider health status on the admin dashboard
4. **Sentry Integration**: If `settings.sentry_dsn` is configured, provider failures are captured as exceptions

### Provider Health Monitoring (Future)

A potential health check system could:
- Periodically ping each provider with a lightweight test query
- Track success/failure rates per provider
- Auto-disable providers that exceed a failure threshold
- Auto-re-enable providers after a cooldown period
- Report provider availability metrics to the admin dashboard

---

## Retry Strategy

### Current Behavior

The current implementation uses a **single-attempt-then-failover** strategy:
- Each provider gets exactly one attempt
- On failure, the system immediately moves to the next provider in the chain
- There is no retry-with-backoff for the same provider

### Rationale

This approach prioritizes response latency over provider-specific recovery:
- Students waiting for a tutoring response should not experience long delays
- If a provider is down, retrying it is unlikely to succeed immediately
- The fallback chain provides 3 alternative providers, making single-attempt-per-provider sufficient

### Future Enhancements

- Configurable retry count per provider
- Exponential backoff for intermittent failures
- Circuit breaker pattern: temporarily disable a provider after N consecutive failures
- Health-check-based routing: skip providers known to be unhealthy
