"""
Application configuration using Pydantic Settings.

This module provides type-safe configuration management with environment variable loading,
validation, and defaults. All settings are loaded from .env files or environment variables.
"""

from typing import List, Optional
from pydantic import Field, field_validator, PostgresDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings with type-safe environment variable loading.

    All settings can be overridden via environment variables or .env files.
    Required settings will raise validation errors if not provided.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Environment Configuration
    environment: str = Field(
        default="development",
        description="Application environment: development, staging, or production"
    )
    debug: bool = Field(
        default=False,
        description="Enable debug mode (disable in production)"
    )

    # Application Settings
    app_name: str = Field(
        default="Urban Home School",
        description="Application name"
    )
    app_version: str = Field(
        default="1.0.0",
        description="Application version"
    )
    api_v1_prefix: str = Field(
        default="/api/v1",
        description="API v1 route prefix"
    )

    # Database Configuration
    database_url: str = Field(
        ...,
        description="PostgreSQL database connection URL (required)"
    )
    database_read_url: Optional[str] = Field(
        default=None,
        description="Read replica database URL (optional, for read/write splitting)"
    )
    database_pool_size: int = Field(
        default=20,
        description="Database connection pool size per worker (production: 20-50)"
    )
    database_max_overflow: int = Field(
        default=30,
        description="Maximum overflow connections per worker for burst traffic"
    )
    database_pool_timeout: int = Field(
        default=10,
        description="Seconds to wait for a connection before raising an error (fail fast)"
    )
    database_pool_recycle: int = Field(
        default=1800,
        description="Recycle connections after N seconds to avoid stale connections"
    )
    database_echo: bool = Field(
        default=False,
        description="Log SQL queries (useful for debugging)"
    )
    database_statement_timeout: int = Field(
        default=30000,
        description="PostgreSQL statement_timeout in milliseconds (kills long-running queries)"
    )
    database_idle_in_transaction_timeout: int = Field(
        default=60000,
        description="PostgreSQL idle_in_transaction_session_timeout in milliseconds"
    )

    # Redis Configuration
    redis_url: str = Field(
        ...,
        description="Redis connection URL (required)"
    )
    redis_cache_ttl: int = Field(
        default=300,
        description="Default Redis cache TTL in seconds"
    )
    redis_session_ttl: int = Field(
        default=86400,
        description="Redis session TTL in seconds (24 hours)"
    )

    # Security Configuration
    secret_key: str = Field(
        ...,
        min_length=32,
        description="Secret key for JWT signing (required, min 32 chars)"
    )
    encryption_key: str = Field(
        ...,
        min_length=32,
        description="Encryption key for sensitive data (required, min 32 chars)"
    )
    algorithm: str = Field(
        default="HS256",
        description="JWT algorithm"
    )
    access_token_expire_minutes: int = Field(
        default=30,
        gt=0,
        description="Access token expiration in minutes"
    )
    refresh_token_expire_days: int = Field(
        default=7,
        gt=0,
        description="Refresh token expiration in days"
    )
    # Google OAuth
    google_client_id: str = Field(
        default="",
        description="Google OAuth client ID for Sign in with Google"
    )
    google_client_secret: str = Field(
        default="",
        description="Google OAuth client secret"
    )

    password_min_length: int = Field(
        default=8,
        description="Minimum password length"
    )
    password_require_uppercase: bool = Field(
        default=True,
        description="Require uppercase letters in passwords"
    )
    password_require_numbers: bool = Field(
        default=True,
        description="Require numbers in passwords"
    )
    password_require_special: bool = Field(
        default=True,
        description="Require special characters in passwords"
    )

    # CORS Configuration
    cors_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000,tauri://localhost,https://tauri.localhost",
        description="Comma-separated list of allowed CORS origins"
    )
    cors_allow_credentials: bool = Field(
        default=True,
        description="Allow credentials in CORS requests"
    )
    cors_allow_methods: List[str] = Field(
        default=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        description="Allowed HTTP methods for CORS"
    )
    cors_allow_headers: List[str] = Field(
        default=["Content-Type", "Authorization", "X-Requested-With", "X-CSRF-Token", "Accept", "Origin"],
        description="Allowed headers for CORS"
    )

    # AI Provider Configuration
    gemini_api_key: Optional[str] = Field(
        default=None,
        description="Google Gemini API key for AI tutoring"
    )
    anthropic_api_key: Optional[str] = Field(
        default=None,
        description="Anthropic Claude API key (optional)"
    )
    openai_api_key: Optional[str] = Field(
        default=None,
        description="OpenAI API key (optional fallback)"
    )
    grok_api_key: Optional[str] = Field(
        default=None,
        description="X.AI Grok API key (optional)"
    )
    groq_api_key: Optional[str] = Field(
        default=None,
        description="Groq API key for fast inference (optional)"
    )
    openrouter_api_key: Optional[str] = Field(
        default=None,
        description="OpenRouter API key for multi-model access (optional)"
    )
    elevenlabs_api_key: Optional[str] = Field(
        default=None,
        description="ElevenLabs API key for text-to-speech (optional)"
    )

    # ElevenLabs streaming (avatar mode)
    elevenlabs_streaming_enabled: bool = Field(
        default=True,
        description="Enable ElevenLabs WebSocket streaming for avatar lip sync"
    )
    elevenlabs_voice_id: str = Field(
        default="21m00Tcm4TlvDq8ikWAM",
        description="ElevenLabs voice ID (default: Rachel)"
    )
    elevenlabs_streaming_model: str = Field(
        default="eleven_multilingual_v2",
        description="ElevenLabs model for streaming TTS"
    )

    # Avatar / Ready Player Me
    rpm_subdomain: str = Field(
        default="demo",
        description="Ready Player Me subdomain for avatar editor"
    )
    rpm_api_key: Optional[str] = Field(
        default=None,
        description="Ready Player Me API key (optional)"
    )
    avatar_max_per_user: int = Field(
        default=10,
        description="Maximum avatars a user can save"
    )
    avatar_cdn_base_url: str = Field(
        default="",
        description="CDN base URL for preset avatar GLB files"
    )
    avatar_preset_config_path: str = Field(
        default="data/avatar_presets.json",
        description="Path to preset avatar catalogue JSON"
    )

    # M-Pesa Payment Configuration
    mpesa_consumer_key: Optional[str] = Field(
        default=None,
        description="M-Pesa Daraja API consumer key"
    )
    mpesa_consumer_secret: Optional[str] = Field(
        default=None,
        description="M-Pesa Daraja API consumer secret"
    )
    mpesa_shortcode: Optional[str] = Field(
        default=None,
        description="M-Pesa business shortcode"
    )
    mpesa_passkey: Optional[str] = Field(
        default=None,
        description="M-Pesa passkey for STK push"
    )
    mpesa_environment: str = Field(
        default="sandbox",
        description="M-Pesa environment: sandbox or production"
    )
    mpesa_callback_url: Optional[str] = Field(
        default=None,
        description="M-Pesa callback URL for payment notifications"
    )
    mpesa_timeout_url: Optional[str] = Field(
        default=None,
        description="M-Pesa timeout URL"
    )
    mpesa_initiator_password: Optional[str] = Field(
        default=None,
        description="M-Pesa B2C initiator password (required for B2C transactions)"
    )
    mpesa_certificate_path: Optional[str] = Field(
        default=None,
        description="Path to Safaricom public certificate for production RSA encryption"
    )

    # Flutterwave Payment Configuration
    flutterwave_secret_key: Optional[str] = Field(
        default=None,
        description="Flutterwave secret API key for bank transfers"
    )

    # Paystack Payment Configuration
    paystack_secret_key: Optional[str] = Field(
        default=None,
        description="Paystack secret API key for bank transfers"
    )

    # Stripe Payment Configuration
    stripe_secret_key: Optional[str] = Field(
        default=None,
        description="Stripe secret API key"
    )
    stripe_publishable_key: Optional[str] = Field(
        default=None,
        description="Stripe publishable API key"
    )
    stripe_webhook_secret: Optional[str] = Field(
        default=None,
        description="Stripe webhook signing secret"
    )
    stripe_currency: str = Field(
        default="kes",
        description="Default currency for Stripe payments"
    )

    # PayPal Payment Configuration
    paypal_client_id: Optional[str] = Field(
        default=None,
        description="PayPal REST API client ID"
    )
    paypal_client_secret: Optional[str] = Field(
        default=None,
        description="PayPal REST API client secret"
    )
    paypal_mode: str = Field(
        default="sandbox",
        description="PayPal mode: sandbox or live"
    )
    paypal_webhook_id: Optional[str] = Field(
        default=None,
        description="PayPal webhook ID for event verification"
    )

    # File Storage Configuration
    file_storage_type: str = Field(
        default="local",
        description="Storage type: local, s3, or azure"
    )
    upload_dir: str = Field(
        default="./uploads",
        description="Local upload directory (for local storage)"
    )
    max_upload_size: int = Field(
        default=10485760,  # 10 MB
        description="Maximum file upload size in bytes"
    )
    allowed_upload_extensions: List[str] = Field(
        default=[".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx", ".mp4", ".mp3"],
        description="Allowed file extensions for uploads"
    )

    # AWS S3 Configuration (optional)
    aws_access_key_id: Optional[str] = Field(
        default=None,
        description="AWS access key ID for S3 storage"
    )
    aws_secret_access_key: Optional[str] = Field(
        default=None,
        description="AWS secret access key for S3 storage"
    )
    aws_s3_bucket: Optional[str] = Field(
        default=None,
        description="AWS S3 bucket name"
    )
    aws_region: str = Field(
        default="us-east-1",
        description="AWS region"
    )

    # Azure Blob Storage Configuration (optional)
    azure_storage_account_name: Optional[str] = Field(
        default=None,
        description="Azure storage account name"
    )
    azure_storage_account_key: Optional[str] = Field(
        default=None,
        description="Azure storage account key"
    )
    azure_storage_container: Optional[str] = Field(
        default=None,
        description="Azure blob storage container name"
    )

    # Africa's Talking SMS Configuration
    africas_talking_username: str = Field(
        default="sandbox",
        description="Africa's Talking username (use 'sandbox' for testing)"
    )
    africas_talking_api_key: Optional[str] = Field(
        default=None,
        description="Africa's Talking API key"
    )
    africas_talking_sender_id: Optional[str] = Field(
        default=None,
        description="Africa's Talking sender ID (shortcode or alphanumeric)"
    )

    # Email Configuration
    smtp_host: Optional[str] = Field(
        default=None,
        description="SMTP server host"
    )
    smtp_port: int = Field(
        default=587,
        description="SMTP server port"
    )
    smtp_username: Optional[str] = Field(
        default=None,
        description="SMTP username"
    )
    smtp_password: Optional[str] = Field(
        default=None,
        description="SMTP password"
    )
    smtp_use_tls: bool = Field(
        default=True,
        description="Use TLS for SMTP connection"
    )
    from_email: Optional[str] = Field(
        default=None,
        description="Default from email address"
    )

    # Rate Limiting
    rate_limit_enabled: bool = Field(
        default=True,
        description="Enable rate limiting"
    )
    rate_limit_requests: int = Field(
        default=100,
        description="Maximum requests per time window"
    )
    rate_limit_window: int = Field(
        default=60,
        description="Rate limit time window in seconds"
    )

    # Logging Configuration
    log_level: str = Field(
        default="INFO",
        description="Logging level: DEBUG, INFO, WARNING, ERROR, CRITICAL"
    )
    log_format: str = Field(
        default="json",
        description="Log format: json or text"
    )
    log_file: Optional[str] = Field(
        default=None,
        description="Log file path (None for stdout only)"
    )

    # Session Configuration
    session_cookie_name: str = Field(
        default="tuhs_session",
        description="Session cookie name"
    )
    session_cookie_secure: bool = Field(
        default=False,
        description="Set secure flag on session cookie (enable in production with HTTPS)"
    )
    session_cookie_httponly: bool = Field(
        default=True,
        description="Set httponly flag on session cookie"
    )
    session_cookie_samesite: str = Field(
        default="lax",
        description="SameSite attribute for session cookie: strict, lax, or none"
    )

    # Celery Configuration (optional, for background tasks)
    celery_broker_url: Optional[str] = Field(
        default=None,
        description="Celery broker URL (e.g., Redis or RabbitMQ)"
    )
    celery_result_backend: Optional[str] = Field(
        default=None,
        description="Celery result backend URL"
    )

    # Monitoring and Observability
    sentry_dsn: Optional[str] = Field(
        default=None,
        description="Sentry DSN for error tracking"
    )
    enable_metrics: bool = Field(
        default=False,
        description="Enable Prometheus metrics at /metrics endpoint"
    )
    log_format: str = Field(
        default="text",
        description="Log format: 'text' for human-readable, 'json' for structured JSON logging"
    )

    @field_validator("environment")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        """Validate environment is one of the allowed values."""
        allowed = ["development", "staging", "production"]
        if v.lower() not in allowed:
            raise ValueError(f"Environment must be one of {allowed}")
        return v.lower()

    @field_validator("mpesa_environment")
    @classmethod
    def validate_mpesa_environment(cls, v: str) -> str:
        """Validate M-Pesa environment."""
        allowed = ["sandbox", "production"]
        if v.lower() not in allowed:
            raise ValueError(f"M-Pesa environment must be one of {allowed}")
        return v.lower()

    @field_validator("paypal_mode")
    @classmethod
    def validate_paypal_mode(cls, v: str) -> str:
        """Validate PayPal mode."""
        allowed = ["sandbox", "live"]
        if v.lower() not in allowed:
            raise ValueError(f"PayPal mode must be one of {allowed}")
        return v.lower()

    @field_validator("file_storage_type")
    @classmethod
    def validate_storage_type(cls, v: str) -> str:
        """Validate file storage type."""
        allowed = ["local", "s3", "azure"]
        if v.lower() not in allowed:
            raise ValueError(f"File storage type must be one of {allowed}")
        return v.lower()

    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level."""
        allowed = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in allowed:
            raise ValueError(f"Log level must be one of {allowed}")
        return v.upper()

    @field_validator("session_cookie_samesite")
    @classmethod
    def validate_samesite(cls, v: str) -> str:
        """Validate SameSite attribute."""
        allowed = ["strict", "lax", "none"]
        if v.lower() not in allowed:
            raise ValueError(f"SameSite must be one of {allowed}")
        return v.lower()

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment == "production"

    @property
    def is_testing(self) -> bool:
        """Check if running in test environment."""
        return self.environment == "testing"

    @property
    def mpesa_base_url(self) -> str:
        """Get M-Pesa API base URL based on environment."""
        if self.mpesa_environment == "production":
            return "https://api.safaricom.co.ke"
        return "https://sandbox.safaricom.co.ke"

    @property
    def paypal_base_url(self) -> str:
        """Get PayPal API base URL based on mode."""
        if self.paypal_mode == "live":
            return "https://api-m.paypal.com"
        return "https://api-m.sandbox.paypal.com"

    def validate_production_settings(self) -> None:
        """
        Validate critical settings for production environment.
        Raises ValueError if production requirements are not met.
        """
        if not self.is_production:
            return

        errors = []

        # Check debug mode is disabled
        if self.debug:
            errors.append("DEBUG must be False in production")

        # Check strong secret keys
        if len(self.secret_key) < 64:
            errors.append("SECRET_KEY must be at least 64 characters in production")

        if len(self.encryption_key) < 64:
            errors.append("ENCRYPTION_KEY must be at least 64 characters in production")

        # Check HTTPS settings
        if not self.session_cookie_secure:
            errors.append("SESSION_COOKIE_SECURE must be True in production")

        # Check database is not using default credentials
        if "tuhs_dev_password" in self.database_url:
            errors.append("DATABASE_URL must not use default development credentials")

        # Validate AI provider keys
        if not self.gemini_api_key:
            errors.append("GEMINI_API_KEY is required in production")

        # Check LiveKit secrets are not defaults
        if self.livekit_api_secret in ("secret", "changeme-generate-a-strong-secret"):
            errors.append("LIVEKIT_API_SECRET must be changed from default in production")

        # Check session cookie SameSite is strict in production
        if self.session_cookie_samesite != "strict":
            errors.append("SESSION_COOKIE_SAMESITE should be 'strict' in production")

        # Validate CORS origins don't contain localhost in production
        cors_origins_lower = self.cors_origins.lower()
        if "localhost" in cors_origins_lower or "127.0.0.1" in cors_origins_lower:
            errors.append("CORS_ORIGINS must not contain localhost or 127.0.0.1 in production")

        # Validate at least one payment gateway
        has_mpesa = self.mpesa_consumer_key and self.mpesa_consumer_secret
        has_stripe = self.stripe_secret_key
        has_paypal = self.paypal_client_id and self.paypal_client_secret

        if not (has_mpesa or has_stripe or has_paypal):
            errors.append("At least one payment gateway must be configured in production")

        if errors:
            raise ValueError(
                f"Production validation failed:\n" + "\n".join(f"  - {e}" for e in errors)
            )

    def get_database_url(self, async_driver: bool = True) -> str:
        """
        Get database URL with appropriate driver.

        Args:
            async_driver: If True, returns URL with asyncpg driver

        Returns:
            Database URL string
        """
        url = self.database_url

        # Convert to async driver if requested and not already set
        if async_driver and "postgresql://" in url and "asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://")

        return url


    # ─── WebRTC Configuration ────────────────────────────────────────────
    webrtc_stun_urls: list = Field(
        default=["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
        description="STUN server URLs for WebRTC ICE"
    )
    webrtc_turn_url: str = Field(
        default="",
        description="TURN server URL (optional, for NAT traversal)"
    )
    webrtc_turn_username: str = Field(
        default="",
        description="TURN server username"
    )
    webrtc_turn_credential: str = Field(
        default="",
        description="TURN server credential"
    )
    webrtc_max_participants: int = Field(
        default=6,
        description="Max participants per WebRTC room (mesh topology)"
    )

    # LiveKit Configuration (for staff live sessions)
    livekit_url: str = Field(
        default="http://localhost:7880",
        description="LiveKit server URL"
    )
    livekit_api_key: str = Field(
        default="devkey",
        description="LiveKit API key (override via LIVEKIT_API_KEY env var in production)"
    )
    livekit_api_secret: str = Field(
        default="changeme-generate-a-strong-secret",
        description="LiveKit API secret (override via LIVEKIT_API_SECRET env var in production)"
    )

    # VAPID Configuration (for push notifications)
    vapid_public_key: Optional[str] = Field(
        default=None,
        description="VAPID public key for web push notifications"
    )
    vapid_private_key: Optional[str] = Field(
        default=None,
        description="VAPID private key for web push notifications"
    )
    vapid_claims_email: str = Field(
        default="admin@urbanhomeschool.co.ke",
        description="VAPID claims email"
    )


# Create global settings instance
settings = Settings()


# Validate production settings on import if in production
if settings.is_production:
    settings.validate_production_settings()


def get_settings() -> Settings:
    """
    Dependency function to get settings instance.

    Usage in FastAPI:
        from fastapi import Depends
        from app.config import Settings, get_settings

        @app.get("/")
        def endpoint(settings: Settings = Depends(get_settings)):
            return {"app_name": settings.app_name}

    Returns:
        Settings instance
    """
    return settings
