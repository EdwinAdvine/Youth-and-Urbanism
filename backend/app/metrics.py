"""
Prometheus metrics configuration.

Exposes /metrics endpoint with:
- Standard HTTP request metrics (duration, status codes) via instrumentator
- Custom DB connection pool gauges
- AI provider request counters and duration histograms
- Cache hit/miss counters
- Rate limit rejection counter

Gated by settings.enable_metrics (default: False).
"""
import logging

from prometheus_client import Counter, Histogram, Gauge, Info

logger = logging.getLogger(__name__)

# ── DB Connection Pool ────────────────────────────────────────────────
db_pool_size = Gauge(
    "db_pool_size_total",
    "Configured DB connection pool size",
)
db_pool_checked_in = Gauge(
    "db_pool_checked_in",
    "DB connections currently available in the pool",
)
db_pool_checked_out = Gauge(
    "db_pool_checked_out",
    "DB connections currently in use",
)
db_pool_overflow = Gauge(
    "db_pool_overflow",
    "DB connections in overflow beyond pool_size",
)

# ── AI Providers ──────────────────────────────────────────────────────
ai_request_duration = Histogram(
    "ai_request_duration_seconds",
    "AI provider request duration",
    labelnames=["provider", "task_type"],
    buckets=[0.5, 1.0, 2.0, 5.0, 10.0, 30.0],
)
ai_requests_total = Counter(
    "ai_requests_total",
    "Total AI provider requests",
    labelnames=["provider", "status"],
)

# ── Caching ───────────────────────────────────────────────────────────
cache_hits_total = Counter(
    "cache_hits_total",
    "Redis cache hits",
    labelnames=["key_prefix"],
)
cache_misses_total = Counter(
    "cache_misses_total",
    "Redis cache misses",
    labelnames=["key_prefix"],
)

# ── Rate Limiting ─────────────────────────────────────────────────────
rate_limit_rejections_total = Counter(
    "rate_limit_rejections_total",
    "Requests rejected by rate limiter",
)

# ── App Info ──────────────────────────────────────────────────────────
app_info = Info("app", "Application metadata")


def setup_metrics(app):
    """
    Initialize Prometheus instrumentation on the FastAPI app.

    Only activates when settings.enable_metrics is True.
    Exposes metrics at GET /metrics in Prometheus text format.
    """
    from app.config import settings

    if not settings.enable_metrics:
        logger.info("Prometheus metrics disabled (set ENABLE_METRICS=true to enable)")
        return

    from prometheus_fastapi_instrumentator import Instrumentator

    app_info.info({
        "version": settings.app_version,
        "environment": settings.environment,
    })

    instrumentator = Instrumentator(
        should_group_status_codes=True,
        should_ignore_untemplated=True,
        excluded_handlers=["/health", "/metrics", "/docs", "/redoc", "/openapi.json"],
    )
    instrumentator.instrument(app).expose(app, endpoint="/metrics")

    logger.info("Prometheus metrics enabled at /metrics")
