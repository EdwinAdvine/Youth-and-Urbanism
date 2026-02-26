"""Cookie-to-header auth middleware — injects httpOnly cookie tokens as Authorization headers."""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


class CookieAuthMiddleware(BaseHTTPMiddleware):
    """
    Read access_token from httpOnly cookie and inject as Authorization header.

    This allows the existing HTTPBearer dependency to work unchanged while tokens
    are stored in secure httpOnly cookies instead of localStorage.
    If an Authorization header is already present (e.g. mobile apps), it takes precedence.

    Also populates request.state with user identity for audit logging.
    """

    async def dispatch(self, request: Request, call_next):
        token = None

        # Check for token in Authorization header first (mobile/API clients)
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]  # Strip "Bearer " prefix
        elif "authorization" not in request.headers:
            # Fall back to cookie-based auth (browser clients)
            token = request.cookies.get("access_token")
            if token:
                # Inject as Authorization header (scope headers are list of byte tuples)
                request.scope["headers"] = [
                    *request.scope["headers"],
                    (b"authorization", f"Bearer {token}".encode()),
                ]

        # Populate request.state for audit logging (all auth types)
        if token:
            try:
                from app.utils.security import decode_token
                payload = decode_token(token)
                request.state.user_id = payload.get("sub")
                request.state.user_email = payload.get("email")
                request.state.user_role = payload.get("role")
            except Exception:
                # If token decode fails, don't block the request
                # (let the auth dependency handle validation)
                pass

        return await call_next(request)
