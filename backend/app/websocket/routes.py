"""WebSocket route definitions — all WS endpoints registered as an APIRouter."""

import json as _json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends

from app.websocket.auth import ws_authenticate
from app.websocket.connection_manager import ws_manager
from app.config import settings
from app.utils.security import get_current_active_user

logger = logging.getLogger(__name__)

ws_router = APIRouter()


# ── Role-specific WebSocket endpoints ────────────────────────────────


@ws_router.websocket("/ws/admin")
@ws_router.websocket("/ws/admin/{token_path}")
async def admin_websocket(
    websocket: WebSocket,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for admin real-time updates. Token via ?token= query param."""
    payload = await ws_authenticate(websocket, token_path, token, allowed_roles=("admin", "staff"))
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")
    user_role = payload.get("role", "")

    await ws_manager.connect(websocket, user_id, user_role)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = _json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except _json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id, user_role)
    except Exception:
        ws_manager.disconnect(websocket, user_id, user_role)


@ws_router.websocket("/ws/staff")
@ws_router.websocket("/ws/staff/{token_path}")
async def staff_websocket(
    websocket: WebSocket,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for staff real-time updates (counters, notifications, SLA warnings)."""
    payload = await ws_authenticate(websocket, token_path, token, allowed_roles=("staff", "admin"))
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")
    user_role = payload.get("role", "")

    await ws_manager.connect(websocket, user_id, user_role)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = _json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except _json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id, user_role)
    except Exception:
        ws_manager.disconnect(websocket, user_id, user_role)


@ws_router.websocket("/ws/instructor")
@ws_router.websocket("/ws/instructor/{token_path}")
async def instructor_websocket(
    websocket: WebSocket,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for instructor real-time updates (counters, notifications, badges)."""
    from app.websocket.instructor_connection_manager import instructor_ws_manager

    payload = await ws_authenticate(websocket, token_path, token, allowed_roles=("instructor",))
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")

    await instructor_ws_manager.connect(websocket, user_id)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = _json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except _json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        instructor_ws_manager.disconnect(user_id)
    except Exception:
        instructor_ws_manager.disconnect(user_id)


@ws_router.websocket("/ws/parent")
@ws_router.websocket("/ws/parent/{token_path}")
async def parent_websocket(
    websocket: WebSocket,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for parent real-time updates (messages, alerts, achievements, counters)."""
    from app.websocket.parent_connection_manager import parent_ws_manager

    payload = await ws_authenticate(websocket, token_path, token, allowed_roles=("parent",))
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")

    await parent_ws_manager.connect(websocket, user_id)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = _json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except _json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        parent_ws_manager.disconnect(websocket, user_id)
    except Exception:
        parent_ws_manager.disconnect(websocket, user_id)


@ws_router.websocket("/ws/student")
@ws_router.websocket("/ws/student/{token_path}")
async def student_websocket(
    websocket: WebSocket,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for student real-time updates (notifications, progress, achievements)."""
    payload = await ws_authenticate(websocket, token_path, token, allowed_roles=("student",))
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")
    user_role = payload.get("role", "")

    await ws_manager.connect(websocket, user_id, user_role)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = _json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except _json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id, user_role)
    except Exception:
        ws_manager.disconnect(websocket, user_id, user_role)


@ws_router.websocket("/ws/partner")
@ws_router.websocket("/ws/partner/{token_path}")
async def partner_websocket(
    websocket: WebSocket,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for partner real-time updates (notifications, analytics)."""
    payload = await ws_authenticate(websocket, token_path, token, allowed_roles=("partner",))
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")
    user_role = payload.get("role", "")

    await ws_manager.connect(websocket, user_id, user_role)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = _json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except _json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id, user_role)
    except Exception:
        ws_manager.disconnect(websocket, user_id, user_role)


# ── Avatar streaming WebSocket endpoint ───────────────────────────────


@ws_router.websocket("/ws/avatar-stream")
@ws_router.websocket("/ws/avatar-stream/{token_path}")
async def avatar_stream_websocket(
    websocket: WebSocket,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for streaming avatar TTS audio + viseme data."""
    from app.websocket.avatar_stream import avatar_stream_handler
    await avatar_stream_handler(websocket, token_path, token)


# ── Collaborative / Signaling WebSocket endpoints ───────────────────


@ws_router.websocket("/ws/yjs/{doc_id}")
@ws_router.websocket("/ws/yjs/{doc_id}/{token_path}")
async def yjs_websocket(
    websocket: WebSocket,
    doc_id: str,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for Yjs CRDT collaborative document editing."""
    payload = await ws_authenticate(websocket, token_path, token, allowed_roles=("staff", "admin", "instructor"))
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")

    try:
        from app.websocket.yjs_handler import yjs_manager
        await yjs_manager.connect(websocket, doc_id, user_id)

        try:
            while True:
                data = await websocket.receive_bytes()
                await yjs_manager.handle_message(websocket, doc_id, user_id, data)
        except WebSocketDisconnect:
            await yjs_manager.disconnect(websocket, doc_id, user_id)
        except Exception:
            await yjs_manager.disconnect(websocket, doc_id, user_id)
    except ImportError:
        await websocket.accept()
        await websocket.send_json({"error": "Yjs handler not available"})
        await websocket.close(code=4500, reason="Yjs handler not configured")


@ws_router.websocket("/ws/support-chat/{ticket_id}")
@ws_router.websocket("/ws/support-chat/{ticket_id}/{token_path}")
async def support_chat_websocket(
    websocket: WebSocket,
    ticket_id: str,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for real-time support chat on tickets."""
    payload = await ws_authenticate(websocket, token_path, token)
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")

    try:
        from app.websocket.live_chat_handler import live_chat_manager
        await live_chat_manager.connect(websocket, ticket_id, user_id)

        try:
            while True:
                data = await websocket.receive_text()
                try:
                    msg = _json.loads(data)
                    await live_chat_manager.handle_message(ticket_id, user_id, msg)
                except _json.JSONDecodeError:
                    pass
        except WebSocketDisconnect:
            await live_chat_manager.disconnect(websocket, ticket_id, user_id)
        except Exception:
            await live_chat_manager.disconnect(websocket, ticket_id, user_id)
    except ImportError:
        await websocket.accept()
        await websocket.send_json({"error": "Live chat handler not available"})
        await websocket.close(code=4500, reason="Live chat handler not configured")


@ws_router.websocket("/ws/webrtc/{room_id}")
@ws_router.websocket("/ws/webrtc/{room_id}/{token_path}")
async def webrtc_signaling_websocket(
    websocket: WebSocket,
    room_id: str,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for WebRTC signaling (offer/answer/ICE candidates)."""
    payload = await ws_authenticate(
        websocket, token_path, token,
        allowed_roles=("instructor", "student", "staff", "admin"),
    )
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")
    user_role = payload.get("role", "")
    user_name = payload.get("name", payload.get("email", "Unknown"))

    try:
        from app.websocket.webrtc_signaling import webrtc_signaling_manager

        await websocket.accept()

        joined = await webrtc_signaling_manager.join_room(
            room_id,
            user_id,
            websocket,
            {"name": user_name, "role": user_role},
        )

        if not joined:
            await websocket.send_json({"type": "error", "message": "Room is full"})
            await websocket.close(code=4004, reason="Room full")
            return

        try:
            while True:
                data = await websocket.receive_text()
                await webrtc_signaling_manager.handle_message(room_id, user_id, data)
        except WebSocketDisconnect:
            await webrtc_signaling_manager.leave_room(room_id, user_id)
        except Exception:
            await webrtc_signaling_manager.leave_room(room_id, user_id)
    except ImportError:
        await websocket.accept()
        await websocket.send_json({"error": "WebRTC signaling not available"})
        await websocket.close(code=4500, reason="WebRTC signaling not configured")


# ── ICE configuration endpoint ──────────────────────────────────────


@ws_router.get("/api/v1/instructor/sessions/{session_id}/ice-config")
async def get_ice_config(
    session_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Return STUN/TURN server configuration for WebRTC.

    CRITICAL FIX (H-10): Added authentication - only logged-in users can access ICE config.
    This prevents exposing TURN credentials to unauthenticated users.

    Args:
        session_id: Session identifier
        current_user: Authenticated user from get_current_active_user dependency

    Returns:
        ICE server configuration with STUN/TURN details
    """
    ice_servers = [{"urls": settings.webrtc_stun_urls}]

    if settings.webrtc_turn_url:
        ice_servers.append({
            "urls": settings.webrtc_turn_url,
            "username": settings.webrtc_turn_username,
            "credential": settings.webrtc_turn_credential,
        })

    return {
        "ice_servers": ice_servers,
        "max_participants": settings.webrtc_max_participants,
    }
