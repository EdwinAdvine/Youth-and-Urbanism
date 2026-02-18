"""
Services package for Urban Home School backend.

This package contains business logic modules that handle complex operations
across multiple models and implement core platform features.

Available Services:
    - auth_service: Authentication and authorization logic
    - ai_orchestrator: Dynamic multi-AI routing and orchestration (CORE FEATURE)
    - payment_service: Multi-gateway payment processing and wallet management
"""

from app.services.auth_service import (
    register_user,
    authenticate_user,
    refresh_access_token,
    get_current_user,
    initiate_password_reset,
    confirm_password_reset,
)

from app.services.ai_orchestrator import (
    AIOrchestrator,
    get_orchestrator,
    reload_providers,
)

from app.services.payment_service import PaymentService

from app.services.email_service import (
    send_verification_email,
    send_password_reset_email,
)

__all__ = [
    # Auth services
    "register_user",
    "authenticate_user",
    "refresh_access_token",
    "get_current_user",
    "initiate_password_reset",
    "confirm_password_reset",

    # AI orchestrator services
    "AIOrchestrator",
    "get_orchestrator",
    "reload_providers",

    # Payment services
    "PaymentService",

    # Email services
    "send_verification_email",
    "send_password_reset_email",
]
