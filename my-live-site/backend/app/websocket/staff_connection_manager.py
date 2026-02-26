"""
Staff-Specific WebSocket Connection Manager

Manages real-time WebSocket connections for staff users, providing:
- Dashboard counter updates (open tickets, moderation queue, pending approvals, etc.)
- Real-time notification delivery
- SLA breach warning broadcasts
- Staff presence/status tracking

All messages use a JSON envelope: {"type": "event_type", "data": {...}, "timestamp": "..."}
Authentication is performed via JWT token passed as a query parameter (?token=xxx).
"""

import json
import logging
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime

from fastapi import WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState
from jose import jwt, JWTError

from app.config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Event type constants
# ---------------------------------------------------------------------------

EVENT_COUNTER_UPDATE = "counter_update"
EVENT_NOTIFICATION = "notification"
EVENT_SLA_WARNING = "sla_warning"
EVENT_TICKET_ASSIGNED = "ticket_assigned"
EVENT_MODERATION_ITEM = "moderation_item"
EVENT_PRESENCE_UPDATE = "presence_update"

# Valid counter names that can be broadcast
VALID_COUNTERS = frozenset({
    "openTickets",
    "moderationQueue",
    "pendingApprovals",
    "activeSessions",
    "unreadNotifications",
    "slaAtRisk",
})


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_message(event_type: str, data: dict) -> dict:
    """Build a standardised WebSocket message envelope."""
    return {
        "type": event_type,
        "data": data,
        "timestamp": datetime.utcnow().isoformat(),
    }


def _verify_ws_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a JWT token extracted from a WebSocket query parameter.

    Returns the decoded payload dict on success, or ``None`` on failure.
    Unlike the HTTP-based ``verify_token`` in ``app.utils.security``, this
    function does *not* raise ``HTTPException`` because WebSocket handlers
    must close the connection explicitly rather than returning an HTTP error.
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )

        # Must be an access token with a subject claim
        if payload.get("type") != "access":
            logger.warning("WebSocket auth failed: token is not an access token")
            return None

        if payload.get("sub") is None:
            logger.warning("WebSocket auth failed: missing subject claim")
            return None

        return payload

    except JWTError as exc:
        logger.warning("WebSocket auth failed: %s", exc)
        return None


# ---------------------------------------------------------------------------
# StaffConnectionManager
# ---------------------------------------------------------------------------

class StaffConnectionManager:
    """
    Manages WebSocket connections exclusively for staff users.

    Connections are keyed by ``user_id`` (a string, typically a UUID).
    A single user may have multiple open connections (e.g. multiple tabs),
    so the internal structure is ``{user_id: [ws, ...]}``.

    Presence data is tracked per user:
    ``{user_id: {"status": "online", "last_seen": "..."}}``
    """

    def __init__(self) -> None:
        # user_id -> list of active WebSocket connections
        self._connections: Dict[str, List[WebSocket]] = {}
        # user_id -> presence metadata
        self._presence: Dict[str, Dict[str, Any]] = {}

    # ------------------------------------------------------------------
    # Connection lifecycle
    # ------------------------------------------------------------------

    async def connect(self, websocket: WebSocket, user_id: str) -> bool:
        """
        Authenticate and register a staff WebSocket connection.

        The JWT token is expected as the ``token`` query parameter on the
        WebSocket URL, e.g. ``ws://host/ws/staff?token=<jwt>``.

        Args:
            websocket: The incoming ``WebSocket`` instance.
            user_id: The user ID extracted by the caller (or from the token).

        Returns:
            ``True`` if the connection was accepted, ``False`` otherwise.
        """
        # Extract token from query params
        token: Optional[str] = websocket.query_params.get("token")

        if not token:
            logger.warning(
                "Staff WS connection rejected for user %s: missing token", user_id
            )
            await websocket.close(code=4001, reason="Missing authentication token")
            return False

        payload = _verify_ws_token(token)

        if payload is None:
            await websocket.close(code=4003, reason="Invalid or expired token")
            return False

        # Ensure the token belongs to the claimed user
        token_user_id = payload.get("sub")
        if token_user_id != user_id:
            logger.warning(
                "Staff WS token mismatch: token sub=%s, claimed user_id=%s",
                token_user_id,
                user_id,
            )
            await websocket.close(code=4003, reason="Token user mismatch")
            return False

        # Optionally enforce staff/admin role
        token_role = payload.get("role", "")
        if token_role not in ("staff", "admin"):
            logger.warning(
                "Staff WS connection rejected: role '%s' is not staff/admin", token_role
            )
            await websocket.close(code=4003, reason="Insufficient role")
            return False

        # Accept the WebSocket handshake
        await websocket.accept()

        if user_id not in self._connections:
            self._connections[user_id] = []
        self._connections[user_id].append(websocket)

        # Update presence
        self._presence[user_id] = {
            "status": "online",
            "last_seen": datetime.utcnow().isoformat(),
        }

        logger.info("Staff WS connected: user=%s (total connections: %d)", user_id, len(self._connections[user_id]))

        # Notify other staff about this user coming online
        await self._broadcast_presence(user_id, "online")

        return True

    async def disconnect(self, user_id: str, websocket: Optional[WebSocket] = None) -> None:
        """
        Remove a staff member's WebSocket connection(s).

        If *websocket* is provided only that specific connection is removed;
        otherwise **all** connections for the user are dropped.

        Args:
            user_id: The staff member's user ID.
            websocket: Optionally, the specific ``WebSocket`` to remove.
        """
        if user_id not in self._connections:
            return

        if websocket is not None:
            self._connections[user_id] = [
                ws for ws in self._connections[user_id] if ws is not websocket
            ]
        else:
            self._connections[user_id] = []

        # If no more connections remain, clean up
        if not self._connections[user_id]:
            del self._connections[user_id]
            self._presence[user_id] = {
                "status": "offline",
                "last_seen": datetime.utcnow().isoformat(),
            }
            await self._broadcast_presence(user_id, "offline")

        logger.info("Staff WS disconnected: user=%s", user_id)

    # ------------------------------------------------------------------
    # Sending helpers
    # ------------------------------------------------------------------

    async def _safe_send_json(self, ws: WebSocket, message: dict) -> bool:
        """Send JSON to a single WebSocket, returning ``False`` on failure."""
        try:
            if ws.client_state == WebSocketState.CONNECTED:
                await ws.send_json(message)
                return True
        except Exception as exc:
            logger.debug("Failed to send to WebSocket: %s", exc)
        return False

    async def send_to_user(self, user_id: str, message: dict) -> None:
        """
        Send a message to a specific staff member (all their connections).

        Args:
            user_id: Target user ID.
            message: Pre-built message envelope.
        """
        connections = self._connections.get(user_id, [])
        if not connections:
            return

        stale: List[WebSocket] = []
        for ws in connections:
            ok = await self._safe_send_json(ws, message)
            if not ok:
                stale.append(ws)

        # Prune broken connections
        for ws in stale:
            if ws in self._connections.get(user_id, []):
                self._connections[user_id].remove(ws)
        if user_id in self._connections and not self._connections[user_id]:
            del self._connections[user_id]

    async def broadcast_to_staff(self, message: dict) -> None:
        """
        Broadcast a message to every connected staff member.

        Args:
            message: Pre-built message envelope.
        """
        for user_id in list(self._connections.keys()):
            await self.send_to_user(user_id, message)

    # ------------------------------------------------------------------
    # High-level broadcast helpers
    # ------------------------------------------------------------------

    async def broadcast_counter_update(self, counter_name: str, value: int) -> None:
        """
        Broadcast a counter change to all connected staff.

        Args:
            counter_name: One of the recognised counter keys
                          (e.g. ``"openTickets"``, ``"moderationQueue"``).
            value: The new counter value.
        """
        if counter_name not in VALID_COUNTERS:
            logger.warning("Unknown counter name: %s", counter_name)

        message = _build_message(EVENT_COUNTER_UPDATE, {
            "counter": counter_name,
            "value": value,
        })
        await self.broadcast_to_staff(message)

    async def broadcast_sla_warning(
        self,
        ticket_id: str,
        time_remaining: int,
        severity: str = "warning",
    ) -> None:
        """
        Broadcast an SLA breach warning to all staff.

        Args:
            ticket_id: The ticket approaching or breaching SLA.
            time_remaining: Seconds remaining before SLA breach.
            severity: ``"warning"`` or ``"critical"``.
        """
        message = _build_message(EVENT_SLA_WARNING, {
            "ticket_id": ticket_id,
            "time_remaining_seconds": time_remaining,
            "severity": severity,
        })
        await self.broadcast_to_staff(message)

    async def broadcast_notification(
        self,
        user_id: str,
        notification: Dict[str, Any],
    ) -> None:
        """
        Send a notification to a specific staff member.

        Args:
            user_id: The target staff user.
            notification: A dict containing at least
                          ``{id, type, title, message, priority}``.
        """
        message = _build_message(EVENT_NOTIFICATION, notification)
        await self.send_to_user(user_id, message)

    async def broadcast_ticket_assigned(
        self,
        user_id: str,
        ticket_id: str,
        subject: str,
        priority: str,
    ) -> None:
        """
        Notify a staff member that a ticket has been assigned to them.

        Args:
            user_id: The assignee's user ID.
            ticket_id: The assigned ticket ID.
            subject: Ticket subject line.
            priority: Ticket priority level.
        """
        message = _build_message(EVENT_TICKET_ASSIGNED, {
            "ticket_id": ticket_id,
            "subject": subject,
            "priority": priority,
        })
        await self.send_to_user(user_id, message)

    async def broadcast_moderation_item(
        self,
        item_id: str,
        content_type: str,
        priority: str,
    ) -> None:
        """
        Broadcast a new moderation queue item to all staff.

        Args:
            item_id: Moderation item identifier.
            content_type: Type of content (e.g. ``"course"``, ``"comment"``).
            priority: Priority level.
        """
        message = _build_message(EVENT_MODERATION_ITEM, {
            "item_id": item_id,
            "content_type": content_type,
            "priority": priority,
        })
        await self.broadcast_to_staff(message)

    # ------------------------------------------------------------------
    # Presence tracking
    # ------------------------------------------------------------------

    async def _broadcast_presence(self, user_id: str, status: str) -> None:
        """Broadcast a presence change to all other staff connections."""
        message = _build_message(EVENT_PRESENCE_UPDATE, {
            "user_id": user_id,
            "status": status,
            "last_seen": datetime.utcnow().isoformat(),
        })
        # Send to everyone except the user whose presence changed
        for uid in list(self._connections.keys()):
            if uid != user_id:
                await self.send_to_user(uid, message)

    def get_presence(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Return the current presence data for a user, or ``None``."""
        return self._presence.get(user_id)

    def get_all_online_staff(self) -> List[str]:
        """Return a list of user IDs for all currently connected staff."""
        return list(self._connections.keys())

    # ------------------------------------------------------------------
    # Introspection
    # ------------------------------------------------------------------

    @property
    def active_connections_count(self) -> int:
        """Total number of active WebSocket connections across all staff."""
        return sum(len(conns) for conns in self._connections.values())

    @property
    def connected_users_count(self) -> int:
        """Number of unique staff users with at least one open connection."""
        return len(self._connections)

    # ------------------------------------------------------------------
    # Shutdown
    # ------------------------------------------------------------------

    async def shutdown(self) -> None:
        """Gracefully close all staff WebSocket connections."""
        for user_id, connections in list(self._connections.items()):
            for ws in connections:
                try:
                    await ws.close(code=1001, reason="Server shutdown")
                except Exception:
                    pass
        self._connections.clear()
        self._presence.clear()
        logger.info("Staff WebSocket manager shut down")


# ---------------------------------------------------------------------------
# Singleton instance
# ---------------------------------------------------------------------------

staff_ws_manager = StaffConnectionManager()
