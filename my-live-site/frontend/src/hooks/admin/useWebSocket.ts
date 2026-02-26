/**
 * Admin WebSocket Hook
 *
 * Uses shared base hook with cookie-based auth (no token in URL).
 * Adds an event subscription system on top of the base hook for
 * component-level event handlers and wildcard subscribers.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useBaseWebSocket, type WebSocketMessage } from '../useBaseWebSocket';
import type { WSEventType } from '../../types/admin';

type EventHandler = (data: Record<string, unknown>) => void;

interface UseWebSocketOptions {
  /** Whether to auto-connect on mount */
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  /** Whether the WebSocket is currently connected */
  isConnected: boolean;
  /** Subscribe to a specific event type. Returns an unsubscribe function. */
  subscribe: (eventType: WSEventType | '*', handler: EventHandler) => () => void;
  /** Manually connect */
  connect: () => void;
  /** Manually disconnect */
  disconnect: () => void;
  /** Last received event (any type) */
  lastEvent: WebSocketMessage | null;
}

export function useWebSocket({
  autoConnect = true,
}: UseWebSocketOptions = {}): UseWebSocketReturn {
  const subscribersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const [lastEvent, setLastEvent] = useState<WebSocketMessage | null>(null);

  const { isConnected, lastMessage, reconnect, disconnect } =
    useBaseWebSocket({
      path: '/ws/admin',
      requiredRole: 'admin',
      autoConnect,
    });

  // Route incoming messages to subscribers
  useEffect(() => {
    if (!lastMessage) return;
    setLastEvent(lastMessage);

    // Notify type-specific subscribers
    const handlers = subscribersRef.current.get(lastMessage.type);
    if (handlers) {
      const data = (lastMessage.data ?? lastMessage) as Record<string, unknown>;
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (err) {
          console.error(`WebSocket handler error for ${lastMessage.type}:`, err);
        }
      });
    }

    // Notify wildcard subscribers
    const wildcardHandlers = subscribersRef.current.get('*');
    if (wildcardHandlers) {
      const payload = { type: lastMessage.type, ...(lastMessage.data as Record<string, unknown> ?? {}) };
      wildcardHandlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (err) {
          console.error('WebSocket wildcard handler error:', err);
        }
      });
    }
  }, [lastMessage]);

  const subscribe = useCallback(
    (eventType: WSEventType | '*', handler: EventHandler): (() => void) => {
      const key = eventType as string;
      if (!subscribersRef.current.has(key)) {
        subscribersRef.current.set(key, new Set());
      }
      subscribersRef.current.get(key)!.add(handler);

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
    [],
  );

  return {
    isConnected,
    subscribe,
    connect: reconnect,
    disconnect,
    lastEvent,
  };
}

export default useWebSocket;
