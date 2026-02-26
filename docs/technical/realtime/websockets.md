# WebSocket Real-Time Features

> **Source files**: `backend/app/websocket/connection_manager.py`, `backend/app/websocket/events.py`, `backend/app/websocket/yjs_handler.py`, `backend/app/websocket/live_chat_handler.py`, `backend/app/websocket/instructor_connection_manager.py`, `backend/app/websocket/parent_connection_manager.py`, `backend/app/websocket/staff_connection_manager.py`
> **Last updated**: 2026-02-15

## Overview

Urban Home School uses WebSocket connections to deliver real-time updates across all six user roles. The system supports role-specific dashboards, collaborative document editing (Yjs), live support chat, and WebRTC signaling for video sessions.

---

## WebSocket Endpoints

| Endpoint | Purpose | Authentication |
|---|---|---|
| `/ws/admin/{token}` | Admin real-time dashboard | JWT token in URL path |
| `/ws/staff/{token}` | Staff notifications and alerts | JWT token in URL path |
| `/ws/instructor/{token}` | Instructor class updates | JWT token in URL path |
| `/ws/parent/{token}` | Parent child-activity notifications | JWT token in URL path |
| `/ws/student/{token}` | Student achievement and progress updates | JWT token in URL path |
| `/ws/partner/{token}` | Partner collaboration notifications | JWT token in URL path |
| `/ws/yjs/{doc_id}/{token}` | Yjs collaborative document editing | JWT token in query param |
| `/ws/support-chat/{ticket_id}/{token}` | Live support ticket chat | JWT token in query param |

---

## Authentication

### Token-in-Path Pattern

For role-specific WebSocket connections, the JWT access token is passed as a URL path parameter:

```
wss://api.urbanhomeschool.co.ke/ws/admin/eyJhbGciOiJIUzI1NiIs...
```

The server extracts the token, verifies it via `verify_token()`, and extracts `sub` (user ID) and `role` claims.

### Token-in-Query Pattern

For Yjs and support chat connections, the JWT is passed as a query parameter:

```
wss://api.urbanhomeschool.co.ke/ws/yjs/doc123?token=eyJhbGciOiJIUzI1NiIs...
```

### Token Requirements

- Token must be a valid JWT access token (type: `access`)
- Token must contain a `sub` (user ID) claim
- Token must not be expired
- For role-specific endpoints, the token's `role` claim must match the endpoint

---

## Message Format

All WebSocket messages use JSON format with a consistent envelope:

```json
{
    "type": "event.type.name",
    "data": {
        "key": "value"
    },
    "timestamp": "2026-02-15T10:30:00.000Z"
}
```

The `type` field identifies the event category, `data` contains the payload, and `timestamp` records when the event was generated.

---

## Connection Manager

### Class: `ConnectionManager`

The centralized connection manager (`backend/app/websocket/connection_manager.py`) manages all role-specific WebSocket connections.

#### Architecture

```
ConnectionManager
  |
  +-- _connections: Dict[user_id, List[WebSocket]]  # User -> connections mapping
  +-- _role_map: Dict[role, Set[user_id]]            # Role -> user IDs mapping
  +-- _redis: Optional[Redis]                         # Redis Pub/Sub for multi-process
  |
  +-- connect(ws, user_id, role)          # Register connection
  +-- disconnect(ws, user_id, role)       # Remove connection
  +-- send_personal(user_id, type, data)  # Send to specific user
  +-- broadcast_to_role(role, type, data) # Send to all users with role
  +-- broadcast_to_admins(type, data)     # Shortcut for admin broadcasts
  +-- broadcast_all(type, data)           # Send to all connected users
```

#### Multi-Connection Support

A single user can have multiple active WebSocket connections (e.g., multiple browser tabs). Messages sent to a user are delivered to all their connections.

#### Redis Pub/Sub

For production deployments with multiple backend processes, the connection manager supports Redis Pub/Sub for cross-process message broadcasting:

```python
await manager.init_redis(redis_url)
```

When Redis is available:
- Messages are published to the `ws:admin:broadcast` channel
- A background listener task relays messages to local connections
- Special `_target_role` and `_target_user` fields enable targeted delivery

When Redis is unavailable, the manager falls back to in-process broadcasting only.

#### Cleanup

```python
await manager.shutdown()
```

This closes all WebSocket connections, cancels the Redis listener task, and clears all mappings.

---

## Ping/Pong Keep-Alive

WebSocket connections use a ping/pong mechanism to detect stale connections:

- Client sends `{"type": "ping"}` periodically
- Server responds with `{"type": "pong"}`
- If a client fails to respond, the connection is considered stale and cleaned up

---

## Event Types

### System Events (WSEventType enum)

| Event Type | Description | Target Role |
|---|---|---|
| `system.health.update` | System health metrics update | admin, staff |
| `system.alert` | Critical system alert | admin |
| `user.online` | User came online | admin |
| `user.offline` | User went offline | admin |
| `user.registered` | New user registration | admin |
| `course.submitted` | Course submitted for review | admin, staff |
| `content.flagged` | Content flagged for review | admin, staff |
| `ai.anomaly` | AI system anomaly detected | admin |
| `ai.safety_violation` | AI safety violation | admin |
| `payment.received` | Payment received | admin, parent |
| `refund.requested` | Refund request submitted | admin |
| `ticket.created` | Support ticket created | staff |
| `ticket.escalated` | Ticket escalated | admin |
| `safety.incident` | Child safety incident | admin |
| `moderation.reported` | Content reported by user | admin, staff |
| `notification` | General notification | All roles |

### Role-Specific Events

#### Student Events
- Achievement unlocked
- Assignment due reminder
- Quiz results available
- Course progress milestone
- AI tutor response ready

#### Parent Events
- Child activity summary
- Payment confirmation
- Academic progress update
- Safety notifications
- Weekly report available

#### Instructor Events
- New enrollment notification
- Student question received
- Course review status update
- Revenue update
- Class attendance update

#### Admin Events
- All system events listed above
- Platform metrics updates
- Provider health status
- Daily summary alerts

#### Partner Events
- Content submission status
- Revenue share update
- Collaboration requests
- API usage notifications

#### Staff Events
- Assigned ticket updates
- Content review assignments
- System monitoring alerts
- Team chat notifications

---

## Yjs Collaborative Editing

### Purpose

Enables multiple users to simultaneously edit rich text documents (TipTap editor) with real-time synchronization using Yjs CRDTs (Conflict-free Replicated Data Types).

### Endpoint

```
/ws/yjs/{doc_id}/{token}
```

### Protocol (Binary Messages)

| Byte | Message Type | Description |
|---|---|---|
| `0` | Sync Step 1 | Client requests current document state |
| `1` | Sync Step 2 | Server sends full document state |
| `2` | Update | Incremental Yjs update (broadcast to all peers) |
| `3` | Awareness | Cursor positions, selection, user presence |

### Manager: `YjsConnectionManager`

```
YjsConnectionManager
  |
  +-- _rooms: Dict[doc_id, _DocumentRoom]
  |     |
  |     +-- connections: Dict[WebSocket, user_id]
  |     +-- user_ids: Set[str]
  |     +-- yjs_state: bytes  # Current document state
  |     +-- dirty: bool        # Has unsaved changes
  |
  +-- connect(ws, doc_id, user_id)
  +-- disconnect(ws, doc_id, user_id)
  +-- handle_message(ws, doc_id, user_id, data)
```

### State Merging

If `y_py` is installed, proper CRDT merging is performed:
```python
doc = Y.YDoc()
Y.apply_update(doc, existing_state)
Y.apply_update(doc, incoming_update)
new_state = Y.encode_state_as_update(doc)
```

Without `y_py`, updates are concatenated as a best-effort fallback.

### Auto-Save

A background task persists dirty document states to the database every 5 seconds:

```python
SAVE_INTERVAL_SECONDS = 5
```

State is saved to the `yjs_documents` table or the `StaffCollabSession` model.

### Lifecycle

1. Client connects with JWT token
2. Server authenticates and accepts
3. Server loads persisted state from the database (if any)
4. Server sends current state to the new peer (Sync Step 2)
5. Client and server exchange incremental updates
6. On disconnect, if the room is empty, state is persisted and the room is cleaned up

---

## Live Support Chat

### Purpose

Real-time chat within support tickets, allowing staff and users to communicate in real time.

### Endpoint

```
/ws/support-chat/{ticket_id}/{token}
```

### Manager: `LiveChatManager`

```
LiveChatManager
  |
  +-- _rooms: Dict[ticket_id, _ChatRoom]
  |     |
  |     +-- connections: Dict[user_id, WebSocket]
  |     +-- typing_users: Set[str]
  |
  +-- connect(ws, ticket_id, user_id)
  +-- disconnect(ws, ticket_id, user_id)
  +-- handle_incoming(ticket_id, user_id, raw_text)
```

### Event Types

| Event Type | Direction | Description |
|---|---|---|
| `chat_message` | Client -> Server -> Room | Text message with optional `is_internal` flag |
| `typing` | Client -> Server -> Room | Typing indicator (`is_typing: true/false`) |
| `read_receipt` | Client -> Server -> Room | Read receipt (`last_read_message_id`) |
| `ai_suggestion_request` | Client -> Server | Request AI-generated reply suggestion |
| `ai_suggestion` | Server -> Client | AI-generated suggestion response |
| `user_joined` | Server -> Room | User joined the chat room |
| `user_left` | Server -> Room | User left the chat room |
| `error` | Server -> Client | Error message |

### Message Persistence

Chat messages are persisted to the `staff_ticket_messages` table via the `StaffTicketMessage` model. If the ORM model is unavailable, raw SQL is used as a fallback.

### AI Suggestions

Staff members can request AI-generated reply suggestions for customer messages. The current implementation returns a placeholder response; production integration with the AI Orchestrator is planned.

---

## Connection Management and Cleanup

### Stale Connection Detection

The managers detect stale connections by checking `ws.client_state == WebSocketState.CONNECTED` before each send. Failed sends result in the connection being removed from the room.

### Graceful Shutdown

All WebSocket managers provide a `shutdown()` method that:
1. Cancels background tasks (auto-save, Redis listener)
2. Persists any pending state
3. Closes all WebSocket connections with code `1001` (Going Away)
4. Clears all room and connection data

### Singleton Instances

```python
ws_manager = ConnectionManager()        # Role-specific connections
yjs_manager = YjsConnectionManager()    # Collaborative editing
live_chat_manager = LiveChatManager()   # Support chat
```

These are module-level singletons, shared across the application.
