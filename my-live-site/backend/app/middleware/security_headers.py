"""Security headers middleware — adds protective headers to every HTTP response."""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to every HTTP response."""

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # CRITICAL FIX (C-10): Allow camera/microphone for same-origin (WebRTC)
        # camera=(self) allows WebRTC within our app, but blocks third-party iframes
        response.headers["Permissions-Policy"] = "camera=(self), microphone=(self), geolocation=()"

        # Content Security Policy — applied to API JSON responses.
        # The frontend SPA's CSP should be set by the web server (Nginx/Vite).
        # CRITICAL FIX (H-09): Remove 'unsafe-inline' from script-src
        # Use nonces or hashes in production, or rely on frontend CSP from web server
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "  # Removed 'unsafe-inline' for XSS protection
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "  # Styles can keep unsafe-inline (lower risk)
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://api.stripe.com https://api-m.paypal.com https://api-m.sandbox.paypal.com wss:; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        if not settings.debug:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        return response
