"""
Gunicorn configuration for production deployment.

Each worker runs its own uvicorn event loop with uvloop for optimal
async performance. The app is preloaded once and forked into workers
for faster startup and shared memory.

Usage:
    gunicorn main:app -c gunicorn.conf.py
"""
import multiprocessing
import os

# ── Bind ──────────────────────────────────────────────────────────────
bind = f"{os.getenv('HOST', '0.0.0.0')}:{os.getenv('PORT', '8000')}"

# ── Workers ───────────────────────────────────────────────────────────
# Formula: 2 * CPU cores + 1
# Override with WEB_WORKERS env var for container resource limits
workers = int(os.getenv("WEB_WORKERS", 2 * multiprocessing.cpu_count() + 1))
worker_class = "uvicorn.workers.UvicornWorker"

# ── Timeouts ──────────────────────────────────────────────────────────
timeout = 120          # Max seconds a worker can take to handle a request
graceful_timeout = 30  # Grace period for in-flight requests during restart
keepalive = 5          # Keep-alive connections (seconds)

# ── Worker Recycling ──────────────────────────────────────────────────
# Restart workers after N requests to prevent memory leaks
max_requests = 10000
max_requests_jitter = 1000  # Randomize to avoid thundering herd restarts

# ── Preloading ────────────────────────────────────────────────────────
preload_app = True  # Load app before forking for faster worker startup

# ── Logging ───────────────────────────────────────────────────────────
accesslog = "-"  # stdout
errorlog = "-"   # stderr
loglevel = os.getenv("LOG_LEVEL", "info").lower()

# ── Process ───────────────────────────────────────────────────────────
proc_name = "urban-home-school"
