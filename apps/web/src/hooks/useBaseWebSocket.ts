import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace(/^http/, 'ws');

const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const HEARTBEAT_INTERVAL = 30000;

/** Close codes that should NOT trigger reconnection */
const NO_RECONNECT_CODES = [
  1000, // Normal closure
  4001, // Auth failure
  4003, // Wrong role / forbidden
];

export interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

interface UseBaseWebSocketOptions {
  /** WebSocket path, e.g. "/ws/student" */
  path: string;
  /** Role required to connect (optional guard) */
  requiredRole?: string;
  /** Connect automatically on mount (default: true) */
  autoConnect?: boolean;
  /** Called when connection opens */
  onOpen?: () => void;
  /** Called when connection closes */
  onClose?: (code: number) => void;
  /** Called on connection error */
  onError?: () => void;
}

interface UseBaseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (data: WebSocketMessage) => void;
  reconnect: () => void;
  disconnect: () => void;
}

/**
 * Shared base hook for native WebSocket connections.
 *
 * - Uses httpOnly cookies for auth (no token in URL).
 * - Exponential backoff reconnection (1s → 30s, max 10 attempts).
 * - Ping/pong heartbeat every 30s.
 * - Auth guard via useAuthStore.
 * - Cleans up on unmount.
 */
export function useBaseWebSocket({
  path,
  requiredRole,
  autoConnect = true,
  onOpen,
  onClose,
  onError,
}: UseBaseWebSocketOptions): UseBaseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const { isAuthenticated, user } = useAuthStore();

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback((ws: WebSocket) => {
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    heartbeatTimerRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Auth guard
    if (!isAuthenticated) return;
    if (requiredRole && user?.role !== requiredRole) return;

    // Close any lingering connection
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    // No token in URL — httpOnly cookie sent automatically on same-origin
    const url = `${WS_URL}${path}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) { ws.close(); return; }
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      startHeartbeat(ws);
      onOpen?.();
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        if (data.type === 'pong') return; // heartbeat response
        setLastMessage(data);
      } catch {
        // Non-JSON message — ignore
      }
    };

    ws.onclose = (event) => {
      if (!mountedRef.current) return;
      setIsConnected(false);
      clearTimers();
      onClose?.(event.code);

      // Don't reconnect on intentional close or auth failure
      if (NO_RECONNECT_CODES.includes(event.code)) return;
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) return;

      const delay = Math.min(
        INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
        MAX_RECONNECT_DELAY,
      );
      reconnectAttemptsRef.current++;
      reconnectTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connect();
      }, delay);
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      onError?.();
    };
  }, [isAuthenticated, user?.role, requiredRole, path, startHeartbeat, clearTimers, onOpen, onClose, onError]);

  const disconnect = useCallback(() => {
    clearTimers();
    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS; // prevent auto-reconnect
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, [clearTimers]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  const sendMessage = useCallback((data: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  // Auto-connect on mount, cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    if (autoConnect) connect();
    return () => {
      mountedRef.current = false;
      clearTimers();
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [autoConnect, connect, clearTimers]);

  return { isConnected, lastMessage, sendMessage, reconnect, disconnect };
}
