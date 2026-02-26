"""
Circuit breaker and retry utilities for external service calls.

Provides a circuit breaker (pybreaker) that opens after repeated failures
and a retry decorator (tenacity) with exponential backoff for transient errors.

Usage in AI orchestrator:
    from app.utils.circuit_breaker import ai_provider_breaker, ai_retry

    @ai_retry
    async def call_provider(...):
        return await ai_provider_breaker.call_async(actual_api_call, ...)
"""
import logging

import pybreaker
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)

logger = logging.getLogger(__name__)

# Circuit breaker for AI providers.
# Opens after 5 failures within the monitoring window, stays open for 30s.
# While open, all calls fail immediately with CircuitBreakerError,
# preventing cascading failures when a provider is down.
ai_provider_breaker = pybreaker.CircuitBreaker(
    fail_max=5,
    reset_timeout=30,
    name="ai_providers",
)

# Retry decorator for transient network/timeout errors.
# Retries up to 3 times with exponential backoff (1s, 2s, 4s, capped at 10s).
# Only retries on network-level errors, NOT on API errors (4xx).
ai_retry = retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((TimeoutError, ConnectionError, OSError)),
    before_sleep=before_sleep_log(logger, logging.WARNING),
    reraise=True,
)
