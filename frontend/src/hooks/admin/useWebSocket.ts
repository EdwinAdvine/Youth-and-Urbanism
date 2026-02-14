/**
 * Admin WebSocket Hook
 *
 * Connects to the FastAPI WebSocket endpoint for real-time admin updates.
 * Features: auto-reconnect with exponential backoff, event subscription system.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { WSEventType } from '../../types/admin';

interface WebSocketMessage {
  type: WSEventType;
  data: Record<string, unknown>;
  timestamp: string;
}

type EventHandler = (data: Record<string, unknown>) => void;

interface UseWebSocketOptions {
  /** JWT token for authentication */
  token: string | null;
  /** Whether to auto-connect on mount */
  autoConnect?: boolean;
  /** Base URL override (defaults to VITE_API_URL) */
  baseUrl?: string;
}

interface UseWebSocketReturn {
  /** Whether the WebSocket is currently connected */
  isConnected: boolean;
  /** Subscribe to a specific event type */
  subscribe: (eventType: WSEventType, handler: EventHandler) => () => void;
  /** Manually connect */
  connect: () => void;
  /** Manually disconnect */
  disconnect: () => void;
  /** Last received event (any type) */
  lastEvent: WebSocketMessage | null;
}

const MAX_RECONNECT_DELAY = 30000; // 30 seconds
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export function useWebSocket({
  token,
  autoConnect = true,
  baseUrl,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebSocketMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shouldReconnectRef = useRef(true);
  const mountedRef = useRef(true);

  const getWsUrl = useCallback(() => {
    const apiUrl = baseUrl || import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
    const host = apiUrl.replace(/^https?:\/\//, '');
    return `${wsProtocol}://${host}/ws/admin/${token}`;
  }, [token, baseUrl]);

  const clearHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    clearHeartbeat();
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, HEARTBEAT_INTERVAL);
  }, [clearHeartbeat]);

  const notifySubscribers = useCallback((message: WebSocketMessage) => {
    const handlers = subscribersRef.current.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message.data);
        } catch (err) {
          console.error(`WebSocket handler error for ${message.type}:`, err);
        }
      });
    }

    // Also notify wildcard subscribers
    const wildcardHandlers = subscribersRef.current.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler({ type: message.type, ...message.data });
        } catch (err) {
          console.error('WebSocket wildcard handler error:', err);
        }
      });
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (!shouldReconnectRef.current || !mountedRef.current) return;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = reconnectDelayRef.current;
    console.log(`WebSocket reconnecting in ${delay}ms...`);

    reconnectTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current && shouldReconnectRef.current) {
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
        reconnectDelayRef.current = Math.min(
          reconnectDelayRef.current * 2,
          MAX_RECONNECT_DELAY
        );
        connectWs();
      }
    }, delay);
  }, []);

  const connectWs = useCallback(() => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.onclose = null; // Prevent reconnect loop
      wsRef.current.close();
    }

    try {
      const url = getWsUrl();
      const ws = new WebSocket(url);

      ws.onopen = () => {
        if (!mountedRef.current) {
          ws.close();
          return;
        }
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY; // Reset backoff
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          if (message.type === ('pong' as WSEventType)) return; // Ignore heartbeat responses
          setLastEvent(message);
          notifySubscribers(message);
        } catch (err) {
          console.error('WebSocket message parse error:', err);
        }
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        console.log(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
        setIsConnected(false);
        clearHeartbeat();

        // Don't reconnect on normal close (1000) or auth failure (4001/4003)
        if (event.code !== 1000 && event.code !== 4001 && event.code !== 4003) {
          scheduleReconnect();
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('WebSocket connection error:', err);
      scheduleReconnect();
    }
  }, [token, getWsUrl, startHeartbeat, clearHeartbeat, notifySubscribers, scheduleReconnect]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    clearHeartbeat();

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.onclose = null; // Prevent reconnect
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
  }, [clearHeartbeat]);

  const connect = useCallback(() => {
    shouldReconnectRef.current = true;
    reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
    connectWs();
  }, [connectWs]);

  const subscribe = useCallback(
    (eventType: WSEventType | '*', handler: EventHandler): (() => void) => {
      const key = eventType as string;
      if (!subscribersRef.current.has(key)) {
        subscribersRef.current.set(key, new Set());
      }
      subscribersRef.current.get(key)!.add(handler);

      // Return unsubscribe function
      return () => {
        const handlers = subscribersRef.current.get(key);
        if (handlers) {
          handlers.delete(handler);
          if (handlers.size === 0) {
            subscribersRef.current.delete(key);
          }
        }
      };
    },
    []
  );

  // Auto-connect on mount if token is available
  useEffect(() => {
    mountedRef.current = true;

    if (autoConnect && token) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [token, autoConnect]);

  return {
    isConnected,
    subscribe: subscribe as (eventType: WSEventType, handler: EventHandler) => () => void,
    connect,
    disconnect,
    lastEvent,
  };
}

export default useWebSocket;
