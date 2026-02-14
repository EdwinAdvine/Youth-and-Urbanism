import { useCallback, useEffect, useRef, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace(/^http/, 'ws');

/**
 * Yjs binary message types (must match backend yjs_handler.py)
 */
const MSG_SYNC_STEP1 = 0;
const MSG_SYNC_STEP2 = 1;
const MSG_UPDATE = 2;
const MSG_AWARENESS = 3;

interface Collaborator {
  userId: string;
  name: string;
  color: string;
  cursor?: { index: number; length: number };
}

interface UseYjsCollaborationOptions {
  docId: string;
  token: string;
  userName?: string;
  userColor?: string;
  autoConnect?: boolean;
}

interface UseYjsCollaborationReturn {
  isConnected: boolean;
  collaborators: Collaborator[];
  content: string;
  connect: () => void;
  disconnect: () => void;
  sendUpdate: (content: string) => void;
  sendCursorUpdate: (index: number, length: number) => void;
}

/**
 * Hook for Yjs CRDT real-time collaborative editing.
 *
 * Connects to the backend Yjs WebSocket handler and manages:
 * - Document synchronization via Yjs binary protocol
 * - Awareness updates (cursor positions, user presence)
 * - Auto-reconnect with exponential backoff
 */
export function useYjsCollaboration({
  docId,
  token,
  userName = 'Anonymous',
  userColor = '#8B5CF6',
  autoConnect = false,
}: UseYjsCollaborationOptions): UseYjsCollaborationReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [content, setContent] = useState('');

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_URL}/ws/yjs/${docId}/${token}`);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;

      // Send sync step 1 to request current document state
      const syncRequest = new Uint8Array([MSG_SYNC_STEP1]);
      ws.send(syncRequest.buffer);

      // Send awareness update with user info
      const awarenessData = JSON.stringify({
        user: { name: userName, color: userColor },
      });
      const encoder = new TextEncoder();
      const awarenessBytes = encoder.encode(awarenessData);
      const awarenessMsg = new Uint8Array(1 + awarenessBytes.length);
      awarenessMsg[0] = MSG_AWARENESS;
      awarenessMsg.set(awarenessBytes, 1);
      ws.send(awarenessMsg.buffer);
    };

    ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        const data = new Uint8Array(event.data);
        if (data.length === 0) return;

        const msgType = data[0];
        const payload = data.slice(1);

        if (msgType === MSG_SYNC_STEP2 || msgType === MSG_UPDATE) {
          // Document state update - decode as text content
          try {
            const decoder = new TextDecoder();
            const text = decoder.decode(payload);
            if (text) setContent(text);
          } catch {
            // Binary Yjs update - in full integration this would be
            // applied to a Y.Doc instance
          }
        }

        if (msgType === MSG_AWARENESS) {
          // Awareness update from other peers
          try {
            const decoder = new TextDecoder();
            const awarenessJson = JSON.parse(decoder.decode(payload));
            if (awarenessJson.collaborators) {
              setCollaborators(awarenessJson.collaborators);
            }
          } catch {
            // Invalid awareness data
          }
        }
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Auto-reconnect with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
      reconnectAttemptsRef.current++;
      reconnectTimeoutRef.current = setTimeout(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          connect();
        }
      }, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [docId, token, userName, userColor]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectAttemptsRef.current = 999; // Prevent auto-reconnect
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
    setCollaborators([]);
  }, []);

  /**
   * Send a document content update to all peers.
   */
  const sendUpdate = useCallback((newContent: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    const encoder = new TextEncoder();
    const contentBytes = encoder.encode(newContent);
    const updateMsg = new Uint8Array(1 + contentBytes.length);
    updateMsg[0] = MSG_UPDATE;
    updateMsg.set(contentBytes, 1);
    wsRef.current.send(updateMsg.buffer);
  }, []);

  /**
   * Send a cursor position update for awareness.
   */
  const sendCursorUpdate = useCallback(
    (index: number, length: number) => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) return;

      const awarenessData = JSON.stringify({
        user: { name: userName, color: userColor },
        cursor: { index, length },
      });
      const encoder = new TextEncoder();
      const awarenessBytes = encoder.encode(awarenessData);
      const awarenessMsg = new Uint8Array(1 + awarenessBytes.length);
      awarenessMsg[0] = MSG_AWARENESS;
      awarenessMsg.set(awarenessBytes, 1);
      wsRef.current.send(awarenessMsg.buffer);
    },
    [userName, userColor]
  );

  useEffect(() => {
    if (autoConnect && docId && token) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, docId, token, connect, disconnect]);

  return {
    isConnected,
    collaborators,
    content,
    connect,
    disconnect,
    sendUpdate,
    sendCursorUpdate,
  };
}
