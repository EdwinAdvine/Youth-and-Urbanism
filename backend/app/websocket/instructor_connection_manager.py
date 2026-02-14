"""
Instructor-Specific WebSocket Connection Manager

Manages real-time WebSocket connections for instructor users, providing:
- Dashboard counter updates (pending submissions, unread messages, upcoming sessions)
- Real-time notification delivery
- Badge/points/achievement broadcasts
- AI-flagged student alerts

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
EVENT_SUBMISSION_RECEIVED = "submission_received"
EVENT_SESSION_STARTING = "session_starting"
EVENT_STUDENT_FLAGGED = "student_flagged"
EVENT_PAYOUT_STATUS = "payout_status"
EVENT_MESSAGE_RECEIVED = "message_received"
EVENT_BADGE_EARNED = "badge_earned"
EVENT_PRESENCE_UPDATE = "presence_update"

# Valid counter names that can be broadcast
VALID_COUNTERS = frozenset({
    "pendingSubmissions",
    "unreadMessages",
    "upcomingSessions",
    "aiFlaggedStudents",
    "unreadNotifications",
    "pendingPayouts",
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
# InstructorConnectionManager
# ---------------------------------------------------------------------------

class InstructorConnectionManager:
    """
    Manages WebSocket connections for all instructor dashboard users.

    This singleton class maintains a mapping of ``user_id -> WebSocket``
    and provides methods to:
    - Connect/disconnect clients
    - Broadcast messages to all connected instructors
    - Send messages to a specific instructor
    - Send counter updates for sidebar badges
    - Send real-time notifications
    """

    def __init__(self):
        # user_id (str) -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}

        # Heartbeat interval (seconds)
        self.heartbeat_interval = 30

        # user_id -> asyncio.Task (for heartbeat)
        self.heartbeat_tasks: Dict[str, asyncio.Task] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        """
        Accept a new WebSocket connection and register it for the given user_id.

        If the user is already connected, the old connection is closed and replaced.
        """
        await websocket.accept()

        # If user already connected, close old connection
        if user_id in self.active_connections:
            logger.info(f"Instructor {user_id} reconnecting; closing old connection")
            old_ws = self.active_connections[user_id]
            try:
                await old_ws.close()
            except Exception:
                pass
            # Cancel old heartbeat task
            if user_id in self.heartbeat_tasks:
                self.heartbeat_tasks[user_id].cancel()

        self.active_connections[user_id] = websocket

        # Start heartbeat
        task = asyncio.create_task(self._heartbeat(websocket, user_id))
        self.heartbeat_tasks[user_id] = task

        logger.info(f"Instructor {user_id} connected via WebSocket (total: {len(self.active_connections)})")

    def disconnect(self, user_id: str):
        """
        Remove the WebSocket connection for the given user_id.

        Call this when the WebSocket closes (disconnects, errors, etc.).
        """
        if user_id in self.active_connections:
            del self.active_connections[user_id]

        # Cancel heartbeat task
        if user_id in self.heartbeat_tasks:
            self.heartbeat_tasks[user_id].cancel()
            del self.heartbeat_tasks[user_id]

        logger.info(f"Instructor {user_id} disconnected (total: {len(self.active_connections)})")

    async def send_to_user(self, user_id: str, message: dict):
        """
        Send a JSON message to a specific instructor user.

        If the user is not connected or the send fails, this method logs the
        error but does not raise an exception.
        """
        websocket = self.active_connections.get(user_id)
        if not websocket:
            logger.debug(f"Cannot send to instructor {user_id}: not connected")
            return

        try:
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.send_json(message)
            else:
                logger.warning(f"WebSocket for instructor {user_id} not in CONNECTED state")
                self.disconnect(user_id)
        except Exception as e:
            logger.error(f"Failed to send message to instructor {user_id}: {e}")
            self.disconnect(user_id)

    async def broadcast(self, message: dict, exclude_user_id: Optional[str] = None):
        """
        Broadcast a JSON message to all connected instructors.

        Args:
            message: The message dict to send
            exclude_user_id: Optional user_id to exclude from broadcast
        """
        disconnected_users = []

        for user_id, websocket in self.active_connections.items():
            if exclude_user_id and user_id == exclude_user_id:
                continue

            try:
                if websocket.client_state == WebSocketState.CONNECTED:
                    await websocket.send_json(message)
                else:
                    disconnected_users.append(user_id)
            except Exception as e:
                logger.error(f"Failed to broadcast to instructor {user_id}: {e}")
                disconnected_users.append(user_id)

        # Clean up disconnected users
        for user_id in disconnected_users:
            self.disconnect(user_id)

    # -----------------------------------------------------------------------
    # Convenience methods for specific event types
    # -----------------------------------------------------------------------

    async def send_counter_update(
        self,
        user_id: str,
        counter_name: str,
        count: int
    ):
        """
        Send a counter update to a specific instructor.

        Args:
            user_id: Target instructor user_id
            counter_name: One of VALID_COUNTERS
            count: The new counter value
        """
        if counter_name not in VALID_COUNTERS:
            logger.warning(f"Invalid counter name: {counter_name}")
            return

        message = _build_message(
            EVENT_COUNTER_UPDATE,
            {"counter": counter_name, "count": count}
        )
        await self.send_to_user(user_id, message)

    async def send_notification(
        self,
        user_id: str,
        notification: dict
    ):
        """
        Send a notification to a specific instructor.

        Args:
            user_id: Target instructor user_id
            notification: Notification data dict
        """
        message = _build_message(EVENT_NOTIFICATION, notification)
        await self.send_to_user(user_id, message)

    async def send_badge_earned(
        self,
        user_id: str,
        badge: dict
    ):
        """
        Send a badge earned notification to a specific instructor.

        Args:
            user_id: Target instructor user_id
            badge: Badge data dict
        """
        message = _build_message(EVENT_BADGE_EARNED, badge)
        await self.send_to_user(user_id, message)

    async def _heartbeat(self, websocket: WebSocket, user_id: str):
        """
        Periodically send ping/heartbeat to keep connection alive.

        This task runs in the background for each connected user.
        """
        try:
            while True:
                await asyncio.sleep(self.heartbeat_interval)
                if websocket.client_state == WebSocketState.CONNECTED:
                    ping_msg = _build_message("ping", {})
                    await websocket.send_json(ping_msg)
                else:
                    break
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Heartbeat error for instructor {user_id}: {e}")
            self.disconnect(user_id)


# Singleton instance
instructor_ws_manager = InstructorConnectionManager()
