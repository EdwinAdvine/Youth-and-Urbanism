"""
Centralized WebSocket Connection Manager

Manages all WebSocket connections for admin real-time features.
Uses Redis Pub/Sub for cross-process broadcasting in production.
"""

import json
import logging
import asyncio
from typing import Dict, List, Optional
from datetime import datetime

from fastapi import WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections with optional Redis Pub/Sub."""

    def __init__(self):
        # user_id -> list of active WebSocket connections
        self._connections: Dict[str, List[WebSocket]] = {}
        # role -> set of user_ids
        self._role_map: Dict[str, set] = {}
        self._redis = None
        self._pubsub_task: Optional[asyncio.Task] = None

    async def init_redis(self, redis_url: str):
        """Initialize Redis for Pub/Sub broadcasting."""
        try:
            import redis.asyncio as aioredis
            self._redis = aioredis.from_url(redis_url, decode_responses=True)
            # Start listening for published messages
            self._pubsub_task = asyncio.create_task(self._listen_redis())
            logger.info("WebSocket Redis Pub/Sub initialized")
        except Exception as e:
            logger.warning(f"Redis Pub/Sub not available, using in-process only: {e}")

    async def _listen_redis(self):
        """Listen for Redis Pub/Sub messages and broadcast to local connections."""
        if not self._redis:
            return
        try:
            pubsub = self._redis.pubsub()
            await pubsub.subscribe("ws:admin:broadcast")
            async for message in pubsub.listen():
                if message["type"] == "message":
                    try:
                        data = json.loads(message["data"])
                        target_role = data.pop("_target_role", None)
                        target_user = data.pop("_target_user", None)
                        if target_user:
                            await self._send_to_user(target_user, data)
                        elif target_role:
                            await self._send_to_role(target_role, data)
                        else:
                            await self._broadcast_all(data)
                    except json.JSONDecodeError:
                        logger.error("Invalid JSON in Redis Pub/Sub message")
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Redis Pub/Sub listener error: {e}")

    async def connect(self, websocket: WebSocket, user_id: str, role: str):
        """Register a new WebSocket connection."""
        await websocket.accept()
        if user_id not in self._connections:
            self._connections[user_id] = []
        self._connections[user_id].append(websocket)

        if role not in self._role_map:
            self._role_map[role] = set()
        self._role_map[role].add(user_id)

        logger.info(f"WebSocket connected: user={user_id}, role={role}")

    def disconnect(self, websocket: WebSocket, user_id: str, role: str):
        """Remove a WebSocket connection."""
        if user_id in self._connections:
            self._connections[user_id] = [
                ws for ws in self._connections[user_id] if ws != websocket
            ]
            if not self._connections[user_id]:
                del self._connections[user_id]
                if role in self._role_map:
                    self._role_map[role].discard(user_id)

        logger.info(f"WebSocket disconnected: user={user_id}")

    async def send_personal(self, user_id: str, event_type: str, data: dict):
        """Send a message to a specific user (all their connections)."""
        message = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        }
        if self._redis:
            message["_target_user"] = user_id
            await self._redis.publish("ws:admin:broadcast", json.dumps(message))
        else:
            await self._send_to_user(user_id, message)

    async def broadcast_to_role(self, role: str, event_type: str, data: dict):
        """Broadcast a message to all users with a specific role."""
        message = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        }
        if self._redis:
            message["_target_role"] = role
            await self._redis.publish("ws:admin:broadcast", json.dumps(message))
        else:
            await self._send_to_role(role, message)

    async def broadcast_to_admins(self, event_type: str, data: dict):
        """Broadcast to all admin users."""
        await self.broadcast_to_role("admin", event_type, data)

    async def broadcast_all(self, event_type: str, data: dict):
        """Broadcast to all connected users."""
        message = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        }
        if self._redis:
            await self._redis.publish("ws:admin:broadcast", json.dumps(message))
        else:
            await self._broadcast_all(message)

    async def _send_to_user(self, user_id: str, message: dict):
        """Internal: send to all connections of a user."""
        if user_id not in self._connections:
            return
        disconnected = []
        for ws in self._connections[user_id]:
            try:
                if ws.client_state == WebSocketState.CONNECTED:
                    await ws.send_json(message)
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            self._connections[user_id].remove(ws)

    async def _send_to_role(self, role: str, message: dict):
        """Internal: send to all users with a specific role."""
        user_ids = self._role_map.get(role, set())
        for user_id in user_ids:
            await self._send_to_user(user_id, message)

    async def _broadcast_all(self, message: dict):
        """Internal: broadcast to all connections."""
        for user_id in list(self._connections.keys()):
            await self._send_to_user(user_id, message)

    @property
    def active_connections_count(self) -> int:
        """Total number of active WebSocket connections."""
        return sum(len(conns) for conns in self._connections.values())

    @property
    def connected_users_count(self) -> int:
        """Number of unique connected users."""
        return len(self._connections)

    async def shutdown(self):
        """Clean shutdown of all connections and Redis."""
        if self._pubsub_task:
            self._pubsub_task.cancel()
        if self._redis:
            await self._redis.close()
        # Close all WebSocket connections
        for user_id, connections in self._connections.items():
            for ws in connections:
                try:
                    await ws.close()
                except Exception:
                    pass
        self._connections.clear()
        self._role_map.clear()


# Singleton instance
ws_manager = ConnectionManager()
