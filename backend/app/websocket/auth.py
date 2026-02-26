"""WebSocket authentication helpers."""

from typing import Dict, Optional, Tuple

from fastapi import WebSocket

from app.utils.security import verify_token
from app.api.v1.auth import is_token_blacklisted as _is_token_blacklisted


def ws_extract_token(websocket: WebSocket, token_path: str = "", token_query: str = "") -> str:
    """
    Extract token from (in priority order):
    1. Query parameter ?token= (preferred for new clients)
    2. URL path /{token} (legacy, deprecated — will be removed)
    3. httpOnly cookie (automatic for browser clients)
    """
    return token_query or token_path or websocket.cookies.get("access_token", "")


async def ws_authenticate(
    websocket: WebSocket,
    token_path: str = "",
    token_query: str = "",
    allowed_roles: Optional[Tuple[str, ...]] = None,
) -> Optional[Dict]:
    """
    Authenticate a WebSocket connection:
    1. Extract token (query param / path / cookie)
    2. Verify JWT signature and claims
    3. Check token blacklist (logout invalidation)
    4. Optionally enforce role-based access

    Returns the JWT payload dict on success, or None after closing the socket on failure.
    """
    auth_token = ws_extract_token(websocket, token_path, token_query)

    if not auth_token:
        await websocket.close(code=4001, reason="Token required")
        return None

    try:
        payload = verify_token(auth_token)
    except Exception:
        await websocket.accept()
        await websocket.close(code=4001, reason="Invalid token")
        return None

    # Check blacklist — reject logged-out tokens
    if await _is_token_blacklisted(auth_token):
        await websocket.accept()
        await websocket.close(code=4001, reason="Token revoked")
        return None

    if allowed_roles:
        user_role = payload.get("role", "")
        if user_role not in allowed_roles:
            await websocket.accept()
            await websocket.close(code=4003, reason="Insufficient permissions")
            return None

    return payload
