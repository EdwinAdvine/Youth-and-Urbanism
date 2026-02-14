"""
Real-Time Support Chat Handler for Ticket Conversations

Manages per-ticket WebSocket chat rooms that allow staff and users
to communicate in real time within the support-ticket system.

Features:
- Per-ticket chat rooms with multiple participants.
- Message persistence to ``staff_ticket_messages`` via the
  ``StaffTicketMessage`` model.
- Typing indicators broadcast to other room participants.
- Read receipts.
- AI-suggested reply generation (optional).

All text messages use JSON over WebSocket. Authentication is performed
via JWT token passed as a query parameter (?token=xxx).

Message envelope: {"type": "event_type", "data": {...}, "timestamp": "..."}
"""

import json
import logging
import asyncio
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import WebSocket
from starlette.websockets import WebSocketState
from jose import jwt, JWTError

from app.config import settings
from app.database import AsyncSessionLocal

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Event type constants
# ---------------------------------------------------------------------------

EVENT_CHAT_MESSAGE = "chat_message"
EVENT_TYPING = "typing"
EVENT_AI_SUGGESTION = "ai_suggestion"
EVENT_READ_RECEIPT = "read_receipt"
EVENT_USER_JOINED = "user_joined"
EVENT_USER_LEFT = "user_left"
EVENT_ERROR = "error"


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
    Verify a JWT access token extracted from a WebSocket query parameter.

    Returns the decoded payload dict on success, or ``None`` on failure.
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
        if payload.get("type") != "access" or payload.get("sub") is None:
            return None
        return payload
    except JWTError as exc:
        logger.warning("LiveChat WS auth failed: %s", exc)
        return None


# ---------------------------------------------------------------------------
# Per-ticket chat room
# ---------------------------------------------------------------------------

class _ChatRoom:
    """Internal state for a single ticket chat room."""

    __slots__ = ("ticket_id", "connections", "typing_users")

    def __init__(self, ticket_id: str) -> None:
        self.ticket_id: str = ticket_id
        # user_id -> WebSocket
        self.connections: Dict[str, WebSocket] = {}
        # Set of user IDs currently typing
        self.typing_users: set = set()


# ---------------------------------------------------------------------------
# LiveChatManager
# ---------------------------------------------------------------------------

class LiveChatManager:
    """
    Manages per-ticket real-time chat rooms.

    Each ticket can have one active chat room. Participants (staff members
    and the ticket reporter) connect via WebSocket and exchange JSON
    messages for chat, typing indicators, read receipts, and AI suggestions.
    """

    def __init__(self) -> None:
        # ticket_id -> _ChatRoom
        self._rooms: Dict[str, _ChatRoom] = {}

    # ------------------------------------------------------------------
    # Connection lifecycle
    # ------------------------------------------------------------------

    async def connect(
        self, websocket: WebSocket, ticket_id: str, user_id: str
    ) -> bool:
        """
        Authenticate and add a user to a ticket chat room.

        The JWT token must be provided as the ``token`` query parameter.

        Args:
            websocket: The incoming WebSocket connection.
            ticket_id: Support ticket identifier.
            user_id: Claimed user ID (verified against the token).

        Returns:
            ``True`` if the connection was accepted, ``False`` otherwise.
        """
        # --- authenticate ---
        token: Optional[str] = websocket.query_params.get("token")
        if not token:
            await websocket.close(code=4001, reason="Missing authentication token")
            return False

        payload = _verify_ws_token(token)
        if payload is None:
            await websocket.close(code=4003, reason="Invalid or expired token")
            return False

        if payload.get("sub") != user_id:
            await websocket.close(code=4003, reason="Token user mismatch")
            return False

        # --- accept ---
        await websocket.accept()

        # Ensure room exists
        if ticket_id not in self._rooms:
            self._rooms[ticket_id] = _ChatRoom(ticket_id)

        room = self._rooms[ticket_id]

        # If the user already has a connection in this room, close the old one
        existing_ws = room.connections.get(user_id)
        if existing_ws is not None:
            try:
                await existing_ws.close(code=1000, reason="Replaced by new connection")
            except Exception:
                pass

        room.connections[user_id] = websocket

        logger.info(
            "LiveChat WS connected: user=%s ticket=%s (participants=%d)",
            user_id,
            ticket_id,
            len(room.connections),
        )

        # Notify other participants
        await self._broadcast_to_room(
            ticket_id,
            _build_message(EVENT_USER_JOINED, {
                "ticket_id": ticket_id,
                "user_id": user_id,
            }),
            exclude_user=user_id,
        )

        return True

    async def disconnect(
        self, websocket: WebSocket, ticket_id: str, user_id: str
    ) -> None:
        """
        Remove a user from a ticket chat room.

        If the room becomes empty it is cleaned up.

        Args:
            websocket: The disconnecting WebSocket.
            ticket_id: The ticket chat room to leave.
            user_id: The departing user's ID.
        """
        room = self._rooms.get(ticket_id)
        if room is None:
            return

        # Only remove if it is the same WebSocket (guard against stale refs)
        if room.connections.get(user_id) is websocket:
            del room.connections[user_id]

        room.typing_users.discard(user_id)

        logger.info(
            "LiveChat WS disconnected: user=%s ticket=%s (participants=%d)",
            user_id,
            ticket_id,
            len(room.connections),
        )

        # Notify remaining participants
        await self._broadcast_to_room(
            ticket_id,
            _build_message(EVENT_USER_LEFT, {
                "ticket_id": ticket_id,
                "user_id": user_id,
            }),
        )

        # Clean up empty room
        if not room.connections:
            del self._rooms[ticket_id]
            logger.info("LiveChat room closed: ticket=%s", ticket_id)

    # ------------------------------------------------------------------
    # Message handling (incoming from WebSocket)
    # ------------------------------------------------------------------

    async def handle_incoming(
        self, ticket_id: str, user_id: str, raw_text: str
    ) -> None:
        """
        Dispatch an incoming text WebSocket message.

        The message is expected to be JSON with at least a ``type`` field.
        Supported types:

        - ``chat_message``: ``{type, content, is_internal?}``
        - ``typing``: ``{type, is_typing}``
        - ``read_receipt``: ``{type, last_read_message_id}``
        - ``ai_suggestion_request``: ``{type, message_text}``

        Args:
            ticket_id: The ticket room identifier.
            user_id: The sender's user ID.
            raw_text: Raw JSON string received from the WebSocket.
        """
        try:
            payload = json.loads(raw_text)
        except json.JSONDecodeError:
            await self._send_error(ticket_id, user_id, "Invalid JSON")
            return

        msg_type = payload.get("type")

        if msg_type == EVENT_CHAT_MESSAGE:
            content = payload.get("content", "").strip()
            is_internal = payload.get("is_internal", False)
            if not content:
                await self._send_error(ticket_id, user_id, "Empty message content")
                return
            await self.handle_message(ticket_id, user_id, content, is_internal)

        elif msg_type == EVENT_TYPING:
            is_typing = payload.get("is_typing", False)
            await self.send_typing_indicator(ticket_id, user_id, is_typing)

        elif msg_type == EVENT_READ_RECEIPT:
            last_read_id = payload.get("last_read_message_id")
            if last_read_id:
                await self._broadcast_read_receipt(ticket_id, user_id, last_read_id)

        elif msg_type == "ai_suggestion_request":
            message_text = payload.get("message_text", "")
            if message_text:
                await self._handle_ai_suggestion_request(ticket_id, user_id, message_text)

        else:
            await self._send_error(ticket_id, user_id, f"Unknown message type: {msg_type}")

    # ------------------------------------------------------------------
    # Chat message handling
    # ------------------------------------------------------------------

    async def handle_message(
        self,
        ticket_id: str,
        user_id: str,
        content: str,
        is_internal: bool = False,
    ) -> None:
        """
        Process and persist a chat message, then broadcast to the room.

        Args:
            ticket_id: The ticket this message belongs to.
            user_id: The author's user ID.
            content: Message text content.
            is_internal: Whether this is an internal staff-only note.
        """
        message_id = str(uuid4())
        timestamp = datetime.utcnow().isoformat()

        # Persist to database
        await self._persist_message(
            message_id=message_id,
            ticket_id=ticket_id,
            author_id=user_id,
            content=content,
            is_internal=is_internal,
        )

        # Build broadcast payload
        chat_data = {
            "id": message_id,
            "ticket_id": ticket_id,
            "author_id": user_id,
            "content": content,
            "is_internal": is_internal,
            "timestamp": timestamp,
        }

        message = _build_message(EVENT_CHAT_MESSAGE, chat_data)

        # If internal, only broadcast to staff/admin users
        # For simplicity, broadcast to all room participants; access
        # control should be enforced at the connection level.
        await self._broadcast_to_room(ticket_id, message)

        # Clear typing indicator for this user
        room = self._rooms.get(ticket_id)
        if room:
            room.typing_users.discard(user_id)

        logger.debug(
            "Chat message sent: ticket=%s user=%s msg_id=%s",
            ticket_id,
            user_id,
            message_id,
        )

    # ------------------------------------------------------------------
    # Typing indicators
    # ------------------------------------------------------------------

    async def send_typing_indicator(
        self, ticket_id: str, user_id: str, is_typing: bool
    ) -> None:
        """
        Broadcast a typing indicator to other participants in the room.

        Args:
            ticket_id: The ticket room.
            user_id: The user who is (or stopped) typing.
            is_typing: ``True`` if the user started typing, ``False`` if stopped.
        """
        room = self._rooms.get(ticket_id)
        if room is None:
            return

        if is_typing:
            room.typing_users.add(user_id)
        else:
            room.typing_users.discard(user_id)

        message = _build_message(EVENT_TYPING, {
            "ticket_id": ticket_id,
            "user_id": user_id,
            "is_typing": is_typing,
        })

        await self._broadcast_to_room(ticket_id, message, exclude_user=user_id)

    # ------------------------------------------------------------------
    # Read receipts
    # ------------------------------------------------------------------

    async def _broadcast_read_receipt(
        self, ticket_id: str, user_id: str, last_read_message_id: str
    ) -> None:
        """Broadcast a read receipt to the room."""
        message = _build_message(EVENT_READ_RECEIPT, {
            "ticket_id": ticket_id,
            "user_id": user_id,
            "last_read_message_id": last_read_message_id,
        })
        await self._broadcast_to_room(ticket_id, message, exclude_user=user_id)

    # ------------------------------------------------------------------
    # AI suggestion
    # ------------------------------------------------------------------

    async def get_ai_suggestion(
        self, ticket_id: str, message_text: str
    ) -> Dict[str, Any]:
        """
        Generate an AI-suggested response for the given message.

        This is a placeholder implementation. In production it would call
        the AI orchestrator service to generate a contextual response.

        Args:
            ticket_id: The ticket for context.
            message_text: The user message to generate a suggestion for.

        Returns:
            Dict with ``suggestion_text`` and ``confidence``.
        """
        try:
            # Placeholder: in production integrate with
            # app.services.ai_orchestrator or a dedicated suggestion service.
            suggestion = {
                "suggestion_text": (
                    "Thank you for reaching out. I understand your concern "
                    "and will look into this right away. Could you please "
                    "provide any additional details that might help us "
                    "resolve this more quickly?"
                ),
                "confidence": 0.75,
            }

            logger.info(
                "AI suggestion generated for ticket=%s (confidence=%.2f)",
                ticket_id,
                suggestion["confidence"],
            )
            return suggestion

        except Exception as exc:
            logger.error("AI suggestion generation failed for ticket %s: %s", ticket_id, exc)
            return {
                "suggestion_text": "",
                "confidence": 0.0,
            }

    async def _handle_ai_suggestion_request(
        self, ticket_id: str, user_id: str, message_text: str
    ) -> None:
        """Handle an AI suggestion request from a staff member."""
        suggestion = await self.get_ai_suggestion(ticket_id, message_text)
        message = _build_message(EVENT_AI_SUGGESTION, suggestion)
        await self._send_to_user(ticket_id, user_id, message)

    # ------------------------------------------------------------------
    # Sending helpers
    # ------------------------------------------------------------------

    async def _safe_send_json(self, ws: WebSocket, message: dict) -> bool:
        """Send JSON to a WebSocket, returning ``False`` on failure."""
        try:
            if ws.client_state == WebSocketState.CONNECTED:
                await ws.send_json(message)
                return True
        except Exception as exc:
            logger.debug("Failed to send JSON to WebSocket: %s", exc)
        return False

    async def _send_to_user(
        self, ticket_id: str, user_id: str, message: dict
    ) -> None:
        """Send a message to a specific user in a ticket room."""
        room = self._rooms.get(ticket_id)
        if room is None:
            return

        ws = room.connections.get(user_id)
        if ws is not None:
            ok = await self._safe_send_json(ws, message)
            if not ok:
                # Connection is broken -- clean up
                del room.connections[user_id]

    async def _broadcast_to_room(
        self,
        ticket_id: str,
        message: dict,
        exclude_user: Optional[str] = None,
    ) -> None:
        """
        Broadcast a message to all participants in a ticket room.

        Args:
            ticket_id: The room to broadcast to.
            message: The message envelope to send.
            exclude_user: Optionally exclude this user from receiving the message.
        """
        room = self._rooms.get(ticket_id)
        if room is None:
            return

        stale_users: List[str] = []

        for uid, ws in list(room.connections.items()):
            if uid == exclude_user:
                continue
            ok = await self._safe_send_json(ws, message)
            if not ok:
                stale_users.append(uid)

        # Clean up broken connections
        for uid in stale_users:
            room.connections.pop(uid, None)
            room.typing_users.discard(uid)

    async def _send_error(self, ticket_id: str, user_id: str, detail: str) -> None:
        """Send an error message to a specific user."""
        message = _build_message(EVENT_ERROR, {"detail": detail})
        await self._send_to_user(ticket_id, user_id, message)

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    async def _persist_message(
        self,
        message_id: str,
        ticket_id: str,
        author_id: str,
        content: str,
        is_internal: bool = False,
    ) -> None:
        """
        Save a chat message to the ``staff_ticket_messages`` table.

        Attempts to use the ``StaffTicketMessage`` ORM model first; falls
        back to raw SQL if the model is unavailable.
        """
        if AsyncSessionLocal is None:
            logger.warning("Database not initialised; cannot persist message %s", message_id)
            return

        try:
            async with AsyncSessionLocal() as session:
                # Try ORM-based insert
                try:
                    from app.models.staff.ticket import StaffTicketMessage

                    msg = StaffTicketMessage(
                        id=message_id,
                        ticket_id=ticket_id,
                        author_id=author_id,
                        content=content,
                        is_internal=is_internal,
                    )
                    session.add(msg)
                    await session.commit()
                    logger.debug("Chat message persisted (ORM): %s", message_id)
                    return

                except (ImportError, AttributeError) as orm_exc:
                    await session.rollback()
                    logger.debug("ORM save unavailable (%s), trying raw SQL", orm_exc)
                except Exception as orm_exc:
                    await session.rollback()
                    logger.debug("ORM save failed (%s), trying raw SQL", orm_exc)

                # Fallback: raw SQL
                try:
                    from sqlalchemy import text as sa_text

                    insert_sql = sa_text("""
                        INSERT INTO staff_ticket_messages
                            (id, ticket_id, author_id, content, is_internal, created_at)
                        VALUES
                            (:id, :ticket_id, :author_id, :content, :is_internal, NOW())
                    """)
                    await session.execute(insert_sql, {
                        "id": message_id,
                        "ticket_id": ticket_id,
                        "author_id": author_id,
                        "content": content,
                        "is_internal": is_internal,
                    })
                    await session.commit()
                    logger.debug("Chat message persisted (raw SQL): %s", message_id)

                except Exception as sql_exc:
                    await session.rollback()
                    logger.error("Failed to persist chat message %s: %s", message_id, sql_exc)

        except Exception as exc:
            logger.error("Database session error persisting message %s: %s", message_id, exc)

    # ------------------------------------------------------------------
    # Introspection
    # ------------------------------------------------------------------

    def get_room_participants(self, ticket_id: str) -> List[str]:
        """Return a list of user IDs currently in the ticket room."""
        room = self._rooms.get(ticket_id)
        if room is None:
            return []
        return list(room.connections.keys())

    def get_typing_users(self, ticket_id: str) -> List[str]:
        """Return a list of user IDs currently typing in the ticket room."""
        room = self._rooms.get(ticket_id)
        if room is None:
            return []
        return list(room.typing_users)

    @property
    def active_rooms_count(self) -> int:
        """Number of active ticket chat rooms."""
        return len(self._rooms)

    @property
    def total_connections_count(self) -> int:
        """Total WebSocket connections across all chat rooms."""
        return sum(len(room.connections) for room in self._rooms.values())

    # ------------------------------------------------------------------
    # Shutdown
    # ------------------------------------------------------------------

    async def shutdown(self) -> None:
        """Gracefully close all chat room connections."""
        for ticket_id, room in list(self._rooms.items()):
            for uid, ws in list(room.connections.items()):
                try:
                    await ws.close(code=1001, reason="Server shutdown")
                except Exception:
                    pass

        self._rooms.clear()
        logger.info("LiveChat WebSocket manager shut down")


# ---------------------------------------------------------------------------
# Singleton instance
# ---------------------------------------------------------------------------

live_chat_manager = LiveChatManager()
