# Environment Variables Reference

**Project**: Urban Home School (The Bird AI)
**Last Updated**: 2026-02-15

This document is the complete reference for all environment variables used across the Urban Home School platform, covering both frontend and backend configurations.

---

## Table of Contents

- [Frontend Environment Variables](#frontend-environment-variables)
- [Backend Environment Variables](#backend-environment-variables)
  - [Application](#application)
  - [Database](#database)
  - [Cache](#cache)
  - [Security and Authentication](#security-and-authentication)
  - [AI Service Providers](#ai-service-providers)
  - [Payment Providers](#payment-providers)
  - [Monitoring and Error Tracking](#monitoring-and-error-tracking)
- [Security Notes](#security-notes)
- [Environment-Specific Configuration](#environment-specific-configuration)

---

## Frontend Environment Variables

Frontend variables are defined in `frontend/.env` and must be prefixed with `VITE_` to be accessible in client-side code (Vite requirement).

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `VITE_PORT` | Port for the Vite development server | No | `3000` | `3000` |
| `VITE_API_URL` | Base URL for the backend API. Used by all API service calls. | Yes | `http://localhost:8000` | `https://api.urbanhomeschool.co.ke` |
| `VITE_APP_TITLE` | Application title displayed in browser tabs and headers. | No | `Urban Home School` | `Urban Home School` |

### Frontend .env Example (Development)

```env
VITE_PORT=3000
VITE_API_URL=http://localhost:8000
VITE_APP_TITLE=Urban Home School
```

### Frontend .env Example (Production)

```env
VITE_PORT=3000
VITE_API_URL=https://yourdomain.co.ke
VITE_APP_TITLE=Urban Home School
```

**Important**: Frontend environment variables are embedded into the JavaScript bundle at build time. Changing them requires rebuilding the frontend. Never store secrets in frontend environment variables as they are visible to end users.

---

## Backend Environment Variables

Backend variables are defined in `backend/.env` and loaded by the `app/config.py` settings module.

### Application

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `DEBUG` | Enable debug mode with detailed error messages and auto-reload. Set to `False` in production. | No | `True` | `True` or `False` |
| `APP_NAME` | Application name used in logs and metadata. | No | `Urban Home School` | `Urban Home School` |
| `APP_VERSION` | Application version string. | No | `1.0.0` | `1.2.0` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins. | No | `http://localhost:3000,http://127.0.0.1:3000` | `https://yourdomain.co.ke` |

### Database

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string. Uses `asyncpg` driver for async operations. | Yes | None | `postgresql+asyncpg://tuhs_user:tuhs_dev_password_123@localhost:5432/tuhs_db` |
| `DATABASE_POOL_SIZE` | Maximum number of connections in the SQLAlchemy pool. | No | `10` | `20` |
| `DATABASE_MAX_OVERFLOW` | Maximum overflow connections beyond pool size. | No | `20` | `30` |
| `DATABASE_POOL_TIMEOUT` | Seconds to wait for a connection from the pool before raising an error. | No | `30` | `30` |
| `DATABASE_ECHO` | Log all SQL statements (useful for debugging, disable in production). | No | `False` | `False` |

**Connection String Format:**

```
postgresql+asyncpg://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

- **Development**: Host is `localhost` (connecting from host machine)
- **Docker (internal)**: Host is `postgres` (Docker service name)
- **Production**: Host is `localhost` or `postgres` depending on architecture

### Cache

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `REDIS_URL` | Redis connection string for caching and session management. | Yes | None | `redis://localhost:6379` |
| `REDIS_PASSWORD` | Password for Redis authentication. Not needed in development. | No | None | `your-redis-password` |
| `REDIS_DB` | Redis database number (0-15). | No | `0` | `0` |
| `CACHE_TTL` | Default cache time-to-live in seconds. | No | `3600` | `3600` |

### Security and Authentication

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `SECRET_KEY` | Secret key for JWT token signing. Must be a strong, randomly generated string. **Critical for security.** | Yes | `urbanhomeschool-secret-key-change-in-production` | `a1b2c3d4e5f6...` (64+ characters) |
| `ALGORITHM` | JWT signing algorithm. | No | `HS256` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT access token expiration time in minutes. | No | `30` | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | JWT refresh token expiration time in days. | No | `7` | `7` |

**Generating a Strong Secret Key:**

```bash
# Using Python
python -c "import secrets; print(secrets.token_urlsafe(64))"

# Using OpenSSL
openssl rand -hex 64
```

### AI Service Providers

These are API keys for the multi-AI orchestration layer. The orchestrator routes requests to different providers based on the task type.

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `GEMINI_API_KEY` | Google Gemini Pro API key. Primary model for reasoning and general education tasks. | Yes | None | `AIzaSy...` |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key. Used for creative tasks and detailed explanations. | Yes | None | `sk-ant-...` |
| `OPENAI_API_KEY` | OpenAI GPT-4 API key. Fallback model when other providers are unavailable. | No | None | `sk-...` |
| `GROK_API_KEY` | X.AI Grok API key. Used for research tasks and current events. | No | None | `xai-...` |
| `ELEVENLABS_API_KEY` | ElevenLabs API key for text-to-speech voice responses. | No | None | `xi-...` |
| `SYNTHESIA_API_KEY` | Synthesia API key for AI-generated video lessons. | No | None | `syn-...` |

**Provider Priority and Fallback:**

1. **Gemini Pro** (default) -- general education, reasoning
2. **Claude 3.5 Sonnet** -- creative tasks, detailed explanations
3. **Grok** -- research, current events (when available)
4. **GPT-4** -- fallback model

If a provider's API key is not set, that provider is skipped in the routing logic and the next available provider is used.

### Payment Providers

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `MPESA_CONSUMER_KEY` | Safaricom M-Pesa consumer key from the Daraja API portal. | No | None | `abc123...` |
| `MPESA_CONSUMER_SECRET` | Safaricom M-Pesa consumer secret. | No | None | `def456...` |
| `MPESA_SHORTCODE` | M-Pesa business shortcode (paybill or till number). | No | None | `174379` |
| `MPESA_PASSKEY` | M-Pesa online passkey for STK push. | No | None | `bfb279f9...` |
| `MPESA_CALLBACK_URL` | Publicly accessible URL for M-Pesa payment confirmation callbacks. | No | None | `https://yourdomain.co.ke/api/v1/payments/mpesa/callback` |
| `MPESA_ENVIRONMENT` | M-Pesa environment. Use `sandbox` for testing, `production` for live. | No | `sandbox` | `production` |
| `PAYPAL_CLIENT_ID` | PayPal application client ID. | No | None | `AW...` |
| `PAYPAL_CLIENT_SECRET` | PayPal application client secret. | No | None | `EL...` |
| `PAYPAL_MODE` | PayPal environment. Use `sandbox` for testing, `live` for production. | No | `sandbox` | `live` |
| `STRIPE_SECRET_KEY` | Stripe secret API key (server-side). | No | None | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable API key (client-side). | No | None | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret for verifying webhook events. | No | None | `whsec_...` |

**Payment Provider Notes:**

- M-Pesa is the primary payment method for Kenyan users.
- At least one payment provider must be configured for paid course enrollment.
- Use sandbox/test credentials during development and staging.
- Production keys should only be used on the production server.

### Monitoring and Error Tracking

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `SENTRY_DSN` | Sentry Data Source Name for error tracking and performance monitoring. | No | None | `https://examplePublicKey@o0.ingest.sentry.io/0` |
| `SENTRY_ENVIRONMENT` | Sentry environment tag (development, staging, production). | No | `development` | `production` |
| `SENTRY_TRACES_SAMPLE_RATE` | Percentage of transactions to trace (0.0 to 1.0). | No | `0.1` | `0.1` |
| `LOG_LEVEL` | Application log level. | No | `INFO` | `DEBUG`, `INFO`, `WARNING`, `ERROR` |

---

## Security Notes

### Never Commit .env Files

The `.env` files are included in `.gitignore` and must never be committed to version control. They contain secrets that could compromise the application and its users if exposed.

### Use Different Keys for Each Environment

| Environment | SECRET_KEY | API Keys | Payment Keys |
|-------------|-----------|----------|--------------|
| Development | Default or simple key | Test/free-tier keys | Sandbox credentials |
| Staging | Unique random key | Test/free-tier keys | Sandbox credentials |
| Production | Strong random key (64+ chars) | Production keys | Live credentials |

### Rotate Secrets Regularly

- Rotate the `SECRET_KEY` every 6 months. Note that rotating the secret key invalidates all existing JWT tokens, forcing users to re-authenticate.
- Rotate AI API keys if you suspect a leak.
- Rotate payment credentials according to each provider's security guidelines.

### Principle of Least Privilege

- Only set environment variables that are required for the environment.
- If a feature is not used (e.g., Synthesia video), do not set the corresponding API key.
- Use read-only API keys where possible (not applicable for all providers).

### Secure Storage in Production

On the production server, restrict file permissions:

```bash
chmod 600 /opt/tuhs/backend/.env
chmod 600 /opt/tuhs/frontend/.env
chown tuhs:tuhs /opt/tuhs/backend/.env
chown tuhs:tuhs /opt/tuhs/frontend/.env
```

---

## Environment-Specific Configuration

### Development (.env)

```env
# Application
DEBUG=True

# Database (Docker)
DATABASE_URL=postgresql+asyncpg://tuhs_user:tuhs_dev_password_123@localhost:5432/tuhs_db
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=urbanhomeschool-dev-key-not-for-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# AI Providers (use test keys)
GEMINI_API_KEY=your-dev-gemini-key
ANTHROPIC_API_KEY=your-dev-anthropic-key

# Payments (sandbox)
MPESA_ENVIRONMENT=sandbox
PAYPAL_MODE=sandbox
```

### Production (.env)

```env
# Application
DEBUG=False
ALLOWED_ORIGINS=https://yourdomain.co.ke,https://www.yourdomain.co.ke

# Database
DATABASE_URL=postgresql+asyncpg://tuhs_user:STRONG_PRODUCTION_PASSWORD@postgres:5432/tuhs_db
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=randomly-generated-64-character-string-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Providers (production keys)
GEMINI_API_KEY=production-gemini-key
ANTHROPIC_API_KEY=production-anthropic-key
OPENAI_API_KEY=production-openai-key
GROK_API_KEY=production-grok-key
ELEVENLABS_API_KEY=production-elevenlabs-key
SYNTHESIA_API_KEY=production-synthesia-key

# Payments (live)
MPESA_CONSUMER_KEY=production-consumer-key
MPESA_CONSUMER_SECRET=production-consumer-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=https://yourdomain.co.ke/api/v1/payments/mpesa/callback
MPESA_ENVIRONMENT=production
PAYPAL_CLIENT_ID=production-client-id
PAYPAL_CLIENT_SECRET=production-client-secret
PAYPAL_MODE=live
STRIPE_SECRET_KEY=sk_live_your-stripe-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
SENTRY_ENVIRONMENT=production
LOG_LEVEL=WARNING
```

---

## Related Documentation

- [Docker Setup Guide](./docker-setup.md)
- [Contabo Deployment Guide](./contabo-deployment.md)
- [Security - Authentication Flow](../security/authentication-flow.md)
- [Payment Integrations](../payments/overview.md)
