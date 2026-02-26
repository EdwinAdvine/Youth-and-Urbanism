"""
Avatar WebSocket streaming — real-time TTS audio + viseme data.

The client sends a text payload (with optional gesture annotations).
This handler streams audio chunks from ElevenLabs alongside estimated
viseme and gesture timing data so the frontend can drive lip-sync and
animations in real-time.

Fallback: if ElevenLabs streaming is unavailable, generates a full MP3
via the existing orchestrator path and sends it as a single chunk.
"""

from __future__ import annotations

import asyncio
import base64
import json
import logging
import time
from typing import Optional

from fastapi import WebSocket, WebSocketDisconnect, Query

from app.config import settings
from app.websocket.auth import ws_authenticate

logger = logging.getLogger(__name__)

# Oculus viseme mapping for basic phoneme groups (simplified)
# Used when ElevenLabs doesn't provide native viseme data.
_SILENCE_VISEME = 0
_OPEN_VISEME = 1  # aa
_NARROW_VISEME = 6  # oh
_CLOSED_VISEME = 13  # nn


async def avatar_stream_handler(
    websocket: WebSocket,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for streaming avatar narration data."""
    payload = await ws_authenticate(websocket, token_path, token)
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "data": "Invalid JSON"})
                continue

            msg_type = msg.get("type", "narrate")

            if msg_type == "narrate":
                text = msg.get("text", "")
                gesture_annotations = msg.get("gesture_annotations", [])
                if not text:
                    await websocket.send_json({"type": "error", "data": "Empty text"})
                    continue

                await _stream_narration(websocket, text, gesture_annotations)

            elif msg_type == "stop":
                # Client requested stop; we just acknowledge
                await websocket.send_json({"type": "end", "data": None})

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong", "data": None})

    except WebSocketDisconnect:
        logger.info("Avatar stream disconnected for user %s", user_id)
    except Exception:
        logger.exception("Avatar stream error for user %s", user_id)
        try:
            await websocket.close(code=1011)
        except Exception:
            pass


async def _stream_narration(
    websocket: WebSocket,
    text: str,
    gesture_annotations: list,
):
    """
    Stream TTS audio chunks alongside viseme and gesture data.

    Attempts ElevenLabs WebSocket streaming first. On failure, falls back
    to generating a complete audio file via the AI orchestrator.
    """

    try:
        if settings.elevenlabs_streaming_enabled and settings.elevenlabs_api_key:
            await _stream_elevenlabs(websocket, text, gesture_annotations)
        else:
            await _fallback_full_audio(websocket, text, gesture_annotations)
    except Exception as exc:
        logger.warning("Streaming failed, trying fallback: %s", exc)
        try:
            await _fallback_full_audio(websocket, text, gesture_annotations)
        except Exception:
            logger.exception("Fallback audio generation also failed")
            await websocket.send_json(
                {"type": "error", "data": "Audio generation failed"}
            )


async def _stream_elevenlabs(
    websocket: WebSocket,
    text: str,
    gesture_annotations: list,
):
    """
    Stream audio from ElevenLabs input-streaming WebSocket API.

    Sends text in chunks and forwards audio chunks + estimated visemes
    to the client in real-time.
    """
    import websockets

    voice_id = settings.elevenlabs_voice_id
    model_id = settings.elevenlabs_streaming_model
    api_key = settings.elevenlabs_api_key

    uri = (
        f"wss://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        f"/stream-input?model_id={model_id}"
    )

    # Send gesture annotations timeline to client first
    if gesture_annotations:
        await websocket.send_json({
            "type": "gesture_timeline",
            "data": gesture_annotations,
        })

    async with websockets.connect(uri) as el_ws:
        # Initialisation message
        await el_ws.send(json.dumps({
            "text": " ",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
            },
            "xi_api_key": api_key,
        }))

        # Send text in sentence chunks for natural pauses
        sentences = _split_sentences(text)
        send_task = asyncio.create_task(
            _send_text_chunks(el_ws, sentences)
        )

        # Receive audio chunks and forward to client
        chunk_index = 0
        try:
            async for message in el_ws:
                data = json.loads(message)
                audio_b64 = data.get("audio")

                if audio_b64:
                    # Forward audio chunk
                    await websocket.send_json({
                        "type": "audio_chunk",
                        "data": audio_b64,
                    })

                    # Send estimated viseme (simple amplitude-based placeholder)
                    await websocket.send_json({
                        "type": "viseme",
                        "data": {
                            "viseme_id": _OPEN_VISEME if chunk_index % 3 != 0 else _NARROW_VISEME,
                            "timestamp_ms": chunk_index * 80,
                            "duration_ms": 80,
                        },
                    })
                    chunk_index += 1

                # Check for alignment data (word timestamps)
                alignment = data.get("alignment")
                if alignment:
                    await websocket.send_json({
                        "type": "alignment",
                        "data": alignment,
                    })

                if data.get("isFinal"):
                    break
        finally:
            send_task.cancel()

    await websocket.send_json({"type": "end", "data": None})


async def _send_text_chunks(el_ws, sentences: list[str]):
    """Send text to ElevenLabs in sentence-sized chunks."""
    for sentence in sentences:
        await el_ws.send(json.dumps({"text": sentence + " "}))
        await asyncio.sleep(0.05)
    # Send empty string to signal end of input
    await el_ws.send(json.dumps({"text": ""}))


async def _fallback_full_audio(
    websocket: WebSocket,
    text: str,
    gesture_annotations: list,
):
    """Generate full audio via the AI orchestrator and send as one chunk."""
    from app.services.ai_orchestrator import AIOrchestrator

    orchestrator = AIOrchestrator()
    audio_url = await orchestrator._convert_to_voice(text)

    if gesture_annotations:
        await websocket.send_json({
            "type": "gesture_timeline",
            "data": gesture_annotations,
        })

    if audio_url:
        await websocket.send_json({
            "type": "audio_url",
            "data": audio_url,
        })
    else:
        await websocket.send_json({
            "type": "error",
            "data": "Could not generate audio",
        })

    await websocket.send_json({"type": "end", "data": None})


def _split_sentences(text: str) -> list[str]:
    """Split text into sentence-like chunks for streaming."""
    import re
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s for s in sentences if s.strip()]
