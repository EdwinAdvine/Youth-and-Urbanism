"""CSRF origin validation middleware for cookie-authenticated mutating requests."""

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings


class CSRFMiddleware(BaseHTTPMiddleware):
    """
    Prevent cross-site request forgery on cookie-authenticated mutating requests.

    For POST/PUT/PATCH/DELETE requests that carry an access_token cookie,
    the Origin (or Referer) header must match one of the allowed CORS origins.
    Requests with an explicit Authorization header (API/mobile clients) are exempt
    because they don't rely on ambient cookie credentials.
    """

    MUTATING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

    async def dispatch(self, request: Request, call_next):
        if request.method in self.MUTATING_METHODS:
            has_cookie = "access_token" in request.cookies
            has_auth_header = "authorization" in request.headers

            # Only enforce for cookie-based auth (browser clients)
            if has_cookie and not has_auth_header:
                origin = request.headers.get("origin") or ""
                referer = request.headers.get("referer") or ""

                allowed = settings.cors_origins_list
                origin_ok = any(origin == o for o in allowed) if origin else False
                referer_ok = any(referer.startswith(o) for o in allowed) if referer else False

                if not origin_ok and not referer_ok:
                    return JSONResponse(
                        status_code=403,
                        content={"detail": "CSRF validation failed: origin not allowed"},
                    )

        return await call_next(request)
