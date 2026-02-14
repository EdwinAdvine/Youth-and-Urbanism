"""
WebRTC Signaling Server for Live Sessions

Handles peer-to-peer signaling for WebRTC video/audio sessions.
Mesh topology for up to 6 participants per room.
"""
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Optional, Set

from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class WebRTCRoom:
    """Represents a single WebRTC session room."""

    def __init__(self, room_id: str, max_participants: int = 6):
        self.room_id = room_id
        self.max_participants = max_participants
        self.participants: Dict[str, WebSocket] = {}  # user_id -> websocket
        self.participant_info: Dict[str, dict] = {}  # user_id -> {name, role, ...}
        self.created_at = datetime.now(timezone.utc)

    @property
    def is_full(self) -> bool:
        return len(self.participants) >= self.max_participants

    @property
    def participant_ids(self) -> Set[str]:
        return set(self.participants.keys())


class WebRTCSignalingManager:
    """
    Manages WebRTC signaling rooms and relays offer/answer/ICE candidates
    between peers in a mesh topology.
    """

    def __init__(self, max_participants: int = 6):
        self.rooms: Dict[str, WebRTCRoom] = {}
        self.max_participants = max_participants

    def get_or_create_room(self, room_id: str) -> WebRTCRoom:
        if room_id not in self.rooms:
            self.rooms[room_id] = WebRTCRoom(room_id, self.max_participants)
        return self.rooms[room_id]

    async def join_room(
        self,
        room_id: str,
        user_id: str,
        websocket: WebSocket,
        user_info: dict,
    ) -> bool:
        """Add a participant to a room. Returns False if room is full."""
        room = self.get_or_create_room(room_id)

        if room.is_full and user_id not in room.participants:
            return False

        # If reconnecting, close old connection
        if user_id in room.participants:
            try:
                await room.participants[user_id].close()
            except Exception:
                pass

        room.participants[user_id] = websocket
        room.participant_info[user_id] = {
            "user_id": user_id,
            "name": user_info.get("name", "Unknown"),
            "role": user_info.get("role", "student"),
            "joined_at": datetime.now(timezone.utc).isoformat(),
        }

        # Notify existing participants about the new peer
        await self._broadcast_to_room(
            room_id,
            {
                "type": "peer_joined",
                "peer_id": user_id,
                "peer_info": room.participant_info[user_id],
                "participants": list(room.participant_info.values()),
            },
            exclude_user=user_id,
        )

        # Send current participants list to the new peer
        await self._send_to_user(
            room_id,
            user_id,
            {
                "type": "room_state",
                "room_id": room_id,
                "participants": list(room.participant_info.values()),
                "your_id": user_id,
            },
        )

        logger.info(
            f"User {user_id} joined room {room_id} "
            f"({len(room.participants)}/{room.max_participants})"
        )
        return True

    async def leave_room(self, room_id: str, user_id: str):
        """Remove a participant from a room."""
        room = self.rooms.get(room_id)
        if not room:
            return

        room.participants.pop(user_id, None)
        room.participant_info.pop(user_id, None)

        # Notify remaining participants
        await self._broadcast_to_room(
            room_id,
            {
                "type": "peer_left",
                "peer_id": user_id,
                "participants": list(room.participant_info.values()),
            },
        )

        # Clean up empty rooms
        if not room.participants:
            del self.rooms[room_id]
            logger.info(f"Room {room_id} closed (empty)")
        else:
            logger.info(
                f"User {user_id} left room {room_id} "
                f"({len(room.participants)} remaining)"
            )

    async def relay_signal(
        self, room_id: str, from_user: str, to_user: str, signal_data: dict
    ):
        """Relay a signaling message (offer/answer/ice) from one peer to another."""
        room = self.rooms.get(room_id)
        if not room or to_user not in room.participants:
            return

        message = {
            "type": signal_data.get("type", "signal"),
            "from_peer": from_user,
            **signal_data,
        }

        try:
            await room.participants[to_user].send_json(message)
        except Exception as e:
            logger.error(f"Failed to relay signal to {to_user}: {e}")

    async def handle_message(self, room_id: str, user_id: str, raw_message: str):
        """Handle an incoming signaling message from a participant."""
        try:
            message = json.loads(raw_message)
        except json.JSONDecodeError:
            logger.warning(f"Invalid JSON from {user_id} in room {room_id}")
            return

        msg_type = message.get("type")
        target = message.get("target")

        if msg_type == "ping":
            room = self.rooms.get(room_id)
            if room and user_id in room.participants:
                try:
                    await room.participants[user_id].send_json({"type": "pong"})
                except Exception:
                    pass
            return

        if msg_type in ("offer", "answer", "ice_candidate"):
            if target:
                await self.relay_signal(room_id, user_id, target, message)
            else:
                logger.warning(
                    f"Signal '{msg_type}' from {user_id} missing target peer"
                )
            return

        if msg_type == "media_state":
            # Broadcast media state changes (mute/unmute, camera on/off)
            await self._broadcast_to_room(
                room_id,
                {
                    "type": "media_state",
                    "peer_id": user_id,
                    "video": message.get("video", True),
                    "audio": message.get("audio", True),
                    "screen_sharing": message.get("screen_sharing", False),
                },
                exclude_user=user_id,
            )
            return

        if msg_type == "chat":
            # Relay chat messages within the session
            await self._broadcast_to_room(
                room_id,
                {
                    "type": "chat",
                    "from_peer": user_id,
                    "from_name": message.get("from_name", "Unknown"),
                    "content": message.get("content", ""),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            )
            return

        logger.debug(f"Unknown message type '{msg_type}' from {user_id}")

    async def _send_to_user(self, room_id: str, user_id: str, message: dict):
        room = self.rooms.get(room_id)
        if not room or user_id not in room.participants:
            return
        try:
            await room.participants[user_id].send_json(message)
        except Exception as e:
            logger.error(f"Failed to send to {user_id} in room {room_id}: {e}")

    async def _broadcast_to_room(
        self, room_id: str, message: dict, exclude_user: Optional[str] = None
    ):
        room = self.rooms.get(room_id)
        if not room:
            return
        for uid, ws in list(room.participants.items()):
            if uid == exclude_user:
                continue
            try:
                await ws.send_json(message)
            except Exception as e:
                logger.error(f"Failed to broadcast to {uid}: {e}")


# Global signaling manager instance
webrtc_signaling_manager = WebRTCSignalingManager()
