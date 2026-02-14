"""
Yjs CRDT Synchronization Handler for Collaborative TipTap Editing

Manages per-document collaboration rooms where multiple users can
simultaneously edit a TipTap rich-text editor backed by Yjs CRDTs.

Protocol (binary WebSocket messages):
    0 - Sync Step 1: Client requests current document state.
    1 - Sync Step 2: Server sends full document state to client.
    2 - Update: Incremental Yjs update (broadcast to all peers).
    3 - Awareness: Cursor positions, selection, user presence.

Authentication is performed via JWT token passed as a query parameter
(?token=xxx). Document state is auto-saved to the database every
``SAVE_INTERVAL_SECONDS``.
"""

import asyncio
import logging
import struct
import time
from typing import Any, Dict, List, Optional, Set

from fastapi import WebSocket
from starlette.websockets import WebSocketState
from jose import jwt, JWTError

from app.config import settings
from app.database import AsyncSessionLocal

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Optional y-py import (pure-Python Yjs implementation)
# ---------------------------------------------------------------------------
try:
    import y_py as Y
except ImportError:
    Y = None
    logger.info(
        "y_py not installed; Yjs document merging will be unavailable. "
        "Binary updates will still be relayed to peers."
    )

# ---------------------------------------------------------------------------
# Protocol constants
# ---------------------------------------------------------------------------

MSG_SYNC_STEP1 = 0  # Request state
MSG_SYNC_STEP2 = 1  # Full state response
MSG_UPDATE = 2       # Incremental update
MSG_AWARENESS = 3    # Cursor / presence

# Auto-save interval in seconds
SAVE_INTERVAL_SECONDS = 5


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _verify_ws_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a JWT access token from WebSocket query parameters.

    Returns the decoded payload on success, or ``None`` on failure.
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
        logger.warning("Yjs WS auth failed: %s", exc)
        return None


# ---------------------------------------------------------------------------
# Per-document room state
# ---------------------------------------------------------------------------

class _DocumentRoom:
    """Internal state for a single collaborative document."""

    __slots__ = ("doc_id", "connections", "user_ids", "yjs_state", "dirty", "last_saved")

    def __init__(self, doc_id: str) -> None:
        self.doc_id: str = doc_id
        # ws -> user_id mapping
        self.connections: Dict[WebSocket, str] = {}
        # Quick lookup of connected user IDs
        self.user_ids: Set[str] = set()
        # Raw binary Yjs document state (bytes)
        self.yjs_state: bytes = b""
        # Whether state has changed since last save
        self.dirty: bool = False
        # Timestamp of last save
        self.last_saved: float = time.monotonic()


# ---------------------------------------------------------------------------
# YjsConnectionManager
# ---------------------------------------------------------------------------

class YjsConnectionManager:
    """
    Manages per-document Yjs collaboration rooms.

    Each room tracks:
    - All connected ``WebSocket`` instances and their associated user IDs.
    - The latest aggregated Yjs binary state.
    - A dirty flag for periodic persistence.

    A background asyncio task periodically flushes dirty state to the
    database (``yjs_documents`` table / ``StaffCollabSession`` model).
    """

    def __init__(self) -> None:
        # doc_id -> _DocumentRoom
        self._rooms: Dict[str, _DocumentRoom] = {}
        # Background save task handle
        self._save_task: Optional[asyncio.Task] = None

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def start_background_save(self) -> None:
        """Start the periodic auto-save background task."""
        if self._save_task is None or self._save_task.done():
            self._save_task = asyncio.create_task(self._auto_save_loop())
            logger.info("Yjs auto-save background task started")

    async def shutdown(self) -> None:
        """Gracefully shut down: save all dirty docs and close connections."""
        # Cancel the background task
        if self._save_task and not self._save_task.done():
            self._save_task.cancel()
            try:
                await self._save_task
            except asyncio.CancelledError:
                pass

        # Persist any remaining dirty state
        for doc_id, room in list(self._rooms.items()):
            if room.dirty:
                await self._persist_state(doc_id, room.yjs_state)

        # Close all connections
        for room in self._rooms.values():
            for ws in list(room.connections.keys()):
                try:
                    await ws.close(code=1001, reason="Server shutdown")
                except Exception:
                    pass

        self._rooms.clear()
        logger.info("Yjs connection manager shut down")

    # ------------------------------------------------------------------
    # Connection management
    # ------------------------------------------------------------------

    async def connect(
        self, websocket: WebSocket, doc_id: str, user_id: str
    ) -> bool:
        """
        Authenticate and add a client to a document room.

        The JWT token is expected as the ``token`` query parameter.

        After acceptance the server sends the current document state
        (Sync Step 2) so the new peer can initialise its local Yjs doc.

        Args:
            websocket: Incoming WebSocket connection.
            doc_id: Document identifier to join.
            user_id: Claimed user ID (verified against token).

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
        if doc_id not in self._rooms:
            self._rooms[doc_id] = _DocumentRoom(doc_id)
            # Attempt to load persisted state from the database
            persisted = await self._load_state(doc_id)
            if persisted:
                self._rooms[doc_id].yjs_state = persisted

        room = self._rooms[doc_id]
        room.connections[websocket] = user_id
        room.user_ids.add(user_id)

        logger.info(
            "Yjs WS connected: user=%s doc=%s (peers=%d)",
            user_id,
            doc_id,
            len(room.connections),
        )

        # Send current state to the new peer (Sync Step 2)
        if room.yjs_state:
            try:
                state_msg = bytes([MSG_SYNC_STEP2]) + room.yjs_state
                await websocket.send_bytes(state_msg)
            except Exception as exc:
                logger.warning("Failed to send initial state to peer: %s", exc)

        # Ensure background save is running
        self.start_background_save()

        return True

    async def disconnect(
        self, websocket: WebSocket, doc_id: str, user_id: str
    ) -> None:
        """
        Remove a client from a document room.

        If the room becomes empty after removal, the document state is
        persisted and the room is cleaned up.

        Args:
            websocket: The disconnecting WebSocket.
            doc_id: The document room to leave.
            user_id: The user who is leaving.
        """
        room = self._rooms.get(doc_id)
        if room is None:
            return

        room.connections.pop(websocket, None)

        # Check if user still has other connections in this room
        remaining_user_ids = set(room.connections.values())
        if user_id not in remaining_user_ids:
            room.user_ids.discard(user_id)

        logger.info(
            "Yjs WS disconnected: user=%s doc=%s (peers=%d)",
            user_id,
            doc_id,
            len(room.connections),
        )

        # If room is empty, persist and clean up
        if not room.connections:
            if room.dirty:
                await self._persist_state(doc_id, room.yjs_state)
            del self._rooms[doc_id]
            logger.info("Yjs room closed: doc=%s", doc_id)

    # ------------------------------------------------------------------
    # Message handling
    # ------------------------------------------------------------------

    async def handle_message(
        self,
        websocket: WebSocket,
        doc_id: str,
        user_id: str,
        data: bytes,
    ) -> None:
        """
        Handle an incoming binary Yjs protocol message.

        The first byte indicates the message type:
        - 0 (Sync Step 1): Client requests state -> reply with Step 2.
        - 1 (Sync Step 2): Client sends full state -> merge.
        - 2 (Update): Incremental update -> merge + relay.
        - 3 (Awareness): Cursor/presence -> relay to peers.

        Args:
            websocket: The sending WebSocket.
            doc_id: The document room identifier.
            user_id: The sending user's ID.
            data: Raw binary message.
        """
        room = self._rooms.get(doc_id)
        if room is None:
            logger.warning("Message for unknown doc room: %s", doc_id)
            return

        if len(data) < 1:
            return

        msg_type = data[0]
        payload = data[1:]

        try:
            if msg_type == MSG_SYNC_STEP1:
                # Client is requesting current state
                if room.yjs_state:
                    response = bytes([MSG_SYNC_STEP2]) + room.yjs_state
                    await self._safe_send_bytes(websocket, response)

            elif msg_type == MSG_SYNC_STEP2:
                # Client sent full document state (e.g. after reconnect)
                self._merge_state(room, payload)
                room.dirty = True

            elif msg_type == MSG_UPDATE:
                # Incremental update -- merge locally and relay
                self._merge_state(room, payload)
                room.dirty = True
                await self._relay_to_peers(websocket, room, data)

            elif msg_type == MSG_AWARENESS:
                # Awareness info (cursors, selections) -- relay only
                await self._relay_to_peers(websocket, room, data)

            else:
                logger.debug("Unknown Yjs message type: %d", msg_type)

        except Exception as exc:
            logger.error(
                "Error handling Yjs message (type=%d, doc=%s): %s",
                msg_type,
                doc_id,
                exc,
            )

    # ------------------------------------------------------------------
    # State merge
    # ------------------------------------------------------------------

    @staticmethod
    def _merge_state(room: _DocumentRoom, update: bytes) -> None:
        """
        Merge a Yjs binary update into the room's state.

        If ``y_py`` is available we perform a proper CRDT merge;
        otherwise we simply overwrite with the latest update as a
        best-effort approach (peers still receive relayed updates).
        """
        if Y is not None:
            try:
                doc = Y.YDoc()
                # Apply existing state first
                if room.yjs_state:
                    Y.apply_update(doc, room.yjs_state)
                # Apply the incoming update
                Y.apply_update(doc, update)
                # Snapshot new state
                room.yjs_state = Y.encode_state_as_update(doc)
                return
            except Exception as exc:
                logger.debug("y_py merge failed, falling back to append: %s", exc)

        # Fallback: store the latest raw update
        # In practice this means we keep the latest update; full CRDT
        # semantics require y_py.
        if room.yjs_state:
            room.yjs_state = room.yjs_state + update
        else:
            room.yjs_state = update

    # ------------------------------------------------------------------
    # Relay / send helpers
    # ------------------------------------------------------------------

    async def _relay_to_peers(
        self, sender: WebSocket, room: _DocumentRoom, data: bytes
    ) -> None:
        """Send binary data to all peers in the room except the sender."""
        stale: List[WebSocket] = []
        for ws in list(room.connections.keys()):
            if ws is sender:
                continue
            ok = await self._safe_send_bytes(ws, data)
            if not ok:
                stale.append(ws)

        for ws in stale:
            user_id = room.connections.pop(ws, None)
            if user_id:
                remaining = set(room.connections.values())
                if user_id not in remaining:
                    room.user_ids.discard(user_id)

    @staticmethod
    async def _safe_send_bytes(ws: WebSocket, data: bytes) -> bool:
        """Send bytes to a WebSocket, returning ``False`` on failure."""
        try:
            if ws.client_state == WebSocketState.CONNECTED:
                await ws.send_bytes(data)
                return True
        except Exception as exc:
            logger.debug("Failed to send bytes to peer: %s", exc)
        return False

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    async def save_document_state(self, doc_id: str, state: bytes) -> None:
        """
        Public API to persist document state to the database.

        Delegates to the internal ``_persist_state`` method.
        """
        await self._persist_state(doc_id, state)

    async def _persist_state(self, doc_id: str, state: bytes) -> None:
        """
        Persist Yjs document state to the ``yjs_documents`` table.

        Uses a raw upsert approach so no ORM model dependency is required.
        If the ``StaffCollabSession`` model or ``yjs_documents`` table is
        available it will be used; otherwise a raw SQL fallback is provided.
        """
        if not state:
            return

        if AsyncSessionLocal is None:
            logger.warning("Database not initialised; cannot save Yjs state for doc %s", doc_id)
            return

        try:
            async with AsyncSessionLocal() as session:
                # Attempt ORM-based save first
                try:
                    from app.models.staff.content_item import StaffCollabSession
                    from sqlalchemy import select

                    result = await session.execute(
                        select(StaffCollabSession).where(
                            StaffCollabSession.document_id == doc_id
                        )
                    )
                    collab = result.scalar_one_or_none()

                    if collab is not None:
                        collab.yjs_state = state
                        collab.updated_at = __import__("datetime").datetime.utcnow()
                    else:
                        collab = StaffCollabSession(
                            document_id=doc_id,
                            yjs_state=state,
                        )
                        session.add(collab)

                    await session.commit()
                    logger.debug("Yjs state saved (ORM) for doc %s (%d bytes)", doc_id, len(state))
                    return

                except (ImportError, AttributeError, Exception) as orm_exc:
                    await session.rollback()
                    logger.debug("ORM save unavailable (%s), trying raw SQL", orm_exc)

                # Fallback: raw SQL upsert
                try:
                    from sqlalchemy import text as sa_text

                    upsert_sql = sa_text("""
                        INSERT INTO yjs_documents (document_id, yjs_state, updated_at)
                        VALUES (:doc_id, :state, NOW())
                        ON CONFLICT (document_id)
                        DO UPDATE SET yjs_state = :state, updated_at = NOW()
                    """)
                    await session.execute(upsert_sql, {"doc_id": doc_id, "state": state})
                    await session.commit()
                    logger.debug("Yjs state saved (raw SQL) for doc %s (%d bytes)", doc_id, len(state))

                except Exception as sql_exc:
                    await session.rollback()
                    logger.error("Failed to persist Yjs state for doc %s: %s", doc_id, sql_exc)

        except Exception as exc:
            logger.error("Database session error while saving Yjs state for doc %s: %s", doc_id, exc)

    async def _load_state(self, doc_id: str) -> Optional[bytes]:
        """
        Load persisted Yjs document state from the database.

        Returns raw bytes if found, otherwise ``None``.
        """
        if AsyncSessionLocal is None:
            return None

        try:
            async with AsyncSessionLocal() as session:
                # Try ORM first
                try:
                    from app.models.staff.content_item import StaffCollabSession
                    from sqlalchemy import select

                    result = await session.execute(
                        select(StaffCollabSession).where(
                            StaffCollabSession.document_id == doc_id
                        )
                    )
                    collab = result.scalar_one_or_none()
                    if collab and collab.yjs_state:
                        logger.debug("Loaded Yjs state (ORM) for doc %s", doc_id)
                        return collab.yjs_state
                except (ImportError, AttributeError, Exception):
                    pass

                # Fallback: raw SQL
                try:
                    from sqlalchemy import text as sa_text

                    result = await session.execute(
                        sa_text("SELECT yjs_state FROM yjs_documents WHERE document_id = :doc_id"),
                        {"doc_id": doc_id},
                    )
                    row = result.first()
                    if row and row[0]:
                        logger.debug("Loaded Yjs state (raw SQL) for doc %s", doc_id)
                        return bytes(row[0]) if not isinstance(row[0], bytes) else row[0]
                except Exception as exc:
                    logger.debug("Could not load Yjs state from raw SQL: %s", exc)

        except Exception as exc:
            logger.error("Failed to load Yjs state for doc %s: %s", doc_id, exc)

        return None

    # ------------------------------------------------------------------
    # Background auto-save
    # ------------------------------------------------------------------

    async def _auto_save_loop(self) -> None:
        """Periodically persist dirty document states."""
        try:
            while True:
                await asyncio.sleep(SAVE_INTERVAL_SECONDS)
                for doc_id, room in list(self._rooms.items()):
                    if room.dirty:
                        await self._persist_state(doc_id, room.yjs_state)
                        room.dirty = False
                        room.last_saved = time.monotonic()
        except asyncio.CancelledError:
            logger.info("Yjs auto-save loop cancelled")
        except Exception as exc:
            logger.error("Yjs auto-save loop error: %s", exc)

    # ------------------------------------------------------------------
    # Introspection
    # ------------------------------------------------------------------

    def get_room_info(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Return metadata about a document room, or ``None`` if not active."""
        room = self._rooms.get(doc_id)
        if room is None:
            return None
        return {
            "doc_id": doc_id,
            "peer_count": len(room.connections),
            "user_ids": list(room.user_ids),
            "state_size_bytes": len(room.yjs_state),
            "dirty": room.dirty,
        }

    @property
    def active_rooms_count(self) -> int:
        """Number of currently active document rooms."""
        return len(self._rooms)

    @property
    def total_connections_count(self) -> int:
        """Total WebSocket connections across all rooms."""
        return sum(len(room.connections) for room in self._rooms.values())


# ---------------------------------------------------------------------------
# Singleton instance
# ---------------------------------------------------------------------------

yjs_manager = YjsConnectionManager()
