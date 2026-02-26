"""
Parent WebSocket Connection Manager

Manages WebSocket connections for parent dashboard real-time features.
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


class ParentConnectionManager:
    """Manages WebSocket connections for parent dashboard with Redis Pub/Sub."""

    def __init__(self):
        # parent_id -> list of active WebSocket connections
        self._connections: Dict[str, List[WebSocket]] = {}
        self._redis = None
        self._pubsub_task: Optional[asyncio.Task] = None

    async def init_redis(self, redis_url: str = ""):
        """Initialize Redis for Pub/Sub broadcasting using the global client."""
        try:
            from app.redis import get_redis
            self._redis = get_redis()
            # Start listening for published messages
            self._pubsub_task = asyncio.create_task(self._listen_redis())
            logger.info("Parent WebSocket Redis Pub/Sub initialized")
        except Exception as e:
            logger.warning(f"Redis Pub/Sub not available for parent WebSocket, using in-process only: {e}")

    async def _listen_redis(self):
        """Listen for Redis Pub/Sub messages and broadcast to local connections."""
        if not self._redis:
            return
        try:
            pubsub = self._redis.pubsub()
            await pubsub.subscribe("ws:parent:broadcast")
            async for message in pubsub.listen():
                if message["type"] == "message":
                    try:
                        data = json.loads(message["data"])
                        target_parent = data.pop("_target_parent", None)
                        if target_parent:
                            await self._send_to_parent(target_parent, data)
                        else:
                            await self._broadcast_all(data)
                    except json.JSONDecodeError:
                        logger.error("Invalid JSON in Parent Redis Pub/Sub message")
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Parent Redis Pub/Sub listener error: {e}")

    async def connect(self, websocket: WebSocket, parent_id: str):
        """Register a new parent WebSocket connection."""
        await websocket.accept()
        if parent_id not in self._connections:
            self._connections[parent_id] = []
        self._connections[parent_id].append(websocket)
        logger.info(f"Parent WebSocket connected: parent_id={parent_id}")

    def disconnect(self, websocket: WebSocket, parent_id: str):
        """Remove a parent WebSocket connection."""
        if parent_id in self._connections:
            self._connections[parent_id] = [
                ws for ws in self._connections[parent_id] if ws != websocket
            ]
            if not self._connections[parent_id]:
                del self._connections[parent_id]
        logger.info(f"Parent WebSocket disconnected: parent_id={parent_id}")

    async def send_to_parent(self, parent_id: str, event_type: str, data: dict):
        """Send a message to a specific parent (all their connections)."""
        message = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        }
        await self._send_to_parent(parent_id, message)

        # Also publish to Redis for other processes
        if self._redis:
            try:
                redis_msg = {**message, "_target_parent": parent_id}
                await self._redis.publish("ws:parent:broadcast", json.dumps(redis_msg))
            except Exception as e:
                logger.error(f"Failed to publish to Redis: {e}")

    async def _send_to_parent(self, parent_id: str, message: dict):
        """Internal method to send to a parent's local connections."""
        if parent_id in self._connections:
            disconnected = []
            for websocket in self._connections[parent_id]:
                try:
                    if websocket.client_state == WebSocketState.CONNECTED:
                        await websocket.send_json(message)
                    else:
                        disconnected.append(websocket)
                except Exception as e:
                    logger.error(f"Error sending to parent {parent_id}: {e}")
                    disconnected.append(websocket)

            # Clean up disconnected websockets
            for ws in disconnected:
                self.disconnect(ws, parent_id)

    async def broadcast_family(self, parent_id: str, event_type: str, data: dict):
        """Broadcast a message to a parent about their family (convenience method)."""
        await self.send_to_parent(parent_id, event_type, data)

    async def broadcast_counter_update(self, parent_id: str, counters: dict):
        """Send real-time counter updates to parent for sidebar badges."""
        await self.send_to_parent(parent_id, "counter_update", counters)

    async def broadcast_new_message(self, parent_id: str, message_data: dict):
        """Send notification of new message to parent."""
        await self.send_to_parent(parent_id, "new_message", message_data)

    async def broadcast_new_alert(self, parent_id: str, alert_data: dict):
        """Send notification of new AI alert to parent."""
        await self.send_to_parent(parent_id, "new_alert", alert_data)

    async def broadcast_achievement(self, parent_id: str, achievement_data: dict):
        """Send notification of child achievement to parent."""
        await self.send_to_parent(parent_id, "new_achievement", achievement_data)

    async def broadcast_report_ready(self, parent_id: str, report_data: dict):
        """Send notification that a report is ready."""
        await self.send_to_parent(parent_id, "report_ready", report_data)

    async def _broadcast_all(self, message: dict):
        """Broadcast to all connected parents (internal)."""
        for parent_id in list(self._connections.keys()):
            await self._send_to_parent(parent_id, message)

    async def ping_pong(self, websocket: WebSocket):
        """Send ping to keep connection alive."""
        try:
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.send_json({"type": "ping", "timestamp": datetime.utcnow().isoformat()})
        except Exception as e:
            logger.error(f"Ping failed: {e}")

    def get_connection_count(self) -> int:
        """Get total number of active parent connections."""
        return sum(len(conns) for conns in self._connections.values())

    def get_parent_count(self) -> int:
        """Get number of unique parents connected."""
        return len(self._connections)


# Global instance
parent_ws_manager = ParentConnectionManager()
