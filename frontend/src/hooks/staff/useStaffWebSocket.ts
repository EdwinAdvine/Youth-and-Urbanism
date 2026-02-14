/**
 * Staff WebSocket Hook
 *
 * Connects to the FastAPI WebSocket endpoint for real-time staff updates.
 * Handles counter updates, notifications, SLA warnings, ticket assignments,
 * and moderation items. Features auto-reconnect with exponential backoff.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useStaffStore } from '../../store/staffStore';
import type { StaffWSEventType, StaffWebSocketEvent, StaffNotification } from '../../types/staff';

interface UseStaffWebSocketOptions {
  /** Whether the WebSocket connection is enabled (defaults to true) */
  enabled?: boolean;
  /** Base URL override (defaults to VITE_API_URL) */
  baseUrl?: string;
}

interface UseStaffWebSocketReturn {
  /** Whether the WebSocket is currently connected */
  isConnected: boolean;
  /** The last message received from the WebSocket */
  lastMessage: StaffWebSocketEvent | null;
  /** Send a message through the WebSocket */
  sendMessage: (data: Record<string, unknown>) => void;
}

const MAX_RECONNECT_DELAY = 30000; // 30 seconds
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export function useStaffWebSocket(
  options?: UseStaffWebSocketOptions
): UseStaffWebSocketReturn {
  const { enabled = true, baseUrl } = options ?? {};

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<StaffWebSocketEvent | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shouldReconnectRef = useRef(true);
  const mountedRef = useRef(true);

  const updateCounters = useStaffStore((state) => state.updateCounters);
  const addNotification = useStaffStore((state) => state.addNotification);
  const incrementCounter = useStaffStore((state) => state.incrementCounter);

  const getToken = useCallback((): string | null => {
    try {
      const stored = localStorage.getItem('auth-store');
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return parsed?.state?.token || parsed?.token || null;
    } catch {
      return null;
    }
  }, []);

  const getWsUrl = useCallback((): string | null => {
    const token = getToken();
    if (!token) return null;

    const apiUrl = baseUrl || import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
    const host = apiUrl.replace(/^https?:\/\//, '');
    return `${wsProtocol}://${host}/ws/staff/${token}`;
  }, [getToken, baseUrl]);

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

  const handleMessage = useCallback(
    (event: StaffWebSocketEvent) => {
      const { type, data } = event;

      switch (type) {
        case 'counter.update':
          updateCounters(data as Record<string, number>);
          break;

        case 'notification.new':
          if (data && typeof data === 'object') {
            addNotification(data as unknown as StaffNotification);
          }
          break;

        case 'ticket.sla_warning':
        case 'ticket.sla_breached': {
          // Dispatch a custom DOM event for components that listen to SLA changes
          const slaEvent = new CustomEvent('staff:sla_warning', { detail: data });
          window.dispatchEvent(slaEvent);
          // Also update the SLA at-risk counter
          if (type === 'ticket.sla_warning') {
            incrementCounter('slaAtRisk');
          }
          break;
        }

        case 'ticket.assigned': {
          const notification: StaffNotification = {
            id: crypto.randomUUID(),
            type: 'ticket.assigned',
            priority: (data.priority as StaffNotification['priority']) || 'medium',
            title: 'New Ticket Assigned',
            message: (data.subject as string) || 'A ticket has been assigned to you.',
            category: 'tickets',
            action_url: (data.action_url as string) || null,
            data,
            read: false,
            created_at: new Date().toISOString(),
          };
          addNotification(notification);
          incrementCounter('openTickets');
          break;
        }

        case 'moderation.new_item':
          incrementCounter('moderationQueue');
          break;

        case 'ticket.updated':
        case 'ticket.escalated':
        case 'moderation.decided':
        case 'content.updated':
        case 'content.approved':
        case 'content.rejected':
        case 'session.starting':
        case 'session.participant_joined':
        case 'session.ended':
        case 'kb.article_suggested':
        case 'collab.user_joined':
        case 'collab.user_left':
          // These event types are handled by specific page components
          // via the lastMessage state; no global store action needed
          break;

        default:
          break;
      }
    },
    [updateCounters, addNotification, incrementCounter]
  );

  const scheduleReconnect = useCallback(() => {
    if (!shouldReconnectRef.current || !mountedRef.current) return;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const delay = reconnectDelayRef.current;

    reconnectTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current && shouldReconnectRef.current) {
        reconnectDelayRef.current = Math.min(
          reconnectDelayRef.current * 2,
          MAX_RECONNECT_DELAY
        );
        connectWs();
      }
    }, delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectWs = useCallback(() => {
    const url = getWsUrl();
    if (!url || wsRef.current?.readyState === WebSocket.OPEN) return;

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        if (!mountedRef.current) {
          ws.close();
          return;
        }
        setIsConnected(true);
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const message: StaffWebSocketEvent = JSON.parse(event.data);
          // Ignore heartbeat responses
          if ((message.type as string) === 'pong') return;
          setLastMessage(message);
          handleMessage(message);
        } catch (err) {
          console.error('Staff WebSocket message parse error:', err);
        }
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        clearHeartbeat();

        // Don't reconnect on normal close (1000) or auth failure (4001/4003)
        if (event.code !== 1000 && event.code !== 4001 && event.code !== 4003) {
          scheduleReconnect();
        }
      };

      ws.onerror = () => {
        // onerror is always followed by onclose, so reconnect logic is handled there
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Staff WebSocket connection error:', err);
      scheduleReconnect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getWsUrl, startHeartbeat, clearHeartbeat, handleMessage, scheduleReconnect]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    clearHeartbeat();

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
  }, [clearHeartbeat]);

  const sendMessage = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (enabled) {
      shouldReconnectRef.current = true;
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
      connectWs();
    }

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
}

export default useStaffWebSocket;
