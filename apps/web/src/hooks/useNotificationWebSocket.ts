import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store';

interface NotificationMessage {
  type: string;
  data?: {
    id?: string;
    title?: string;
    message?: string;
    notification_type?: string;
    action_url?: string;
    created_at?: string;
    metadata?: Record<string, unknown>;
  };
  timestamp?: string;
}

interface UseNotificationWebSocketResult {
  isConnected: boolean;
  unreadCount: number;
  lastMessage: NotificationMessage | null;
}

const WS_BASE = import.meta.env.VITE_API_URL?.replace(/^http/, 'ws') || 'ws://localhost:8000';

const getWsPath = (role: string): string => {
  switch (role) {
    case 'admin': return '/ws/admin';
    case 'staff': return '/ws/staff';
    case 'instructor': return '/ws/instructor';
    case 'parent': return '/ws/parent';
    default: return '/ws/student';
  }
};

export function useNotificationWebSocket(): UseNotificationWebSocketResult {
  const { user } = useAuthStore();
  const { addNotification, notifications } = useUserStore();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<NotificationMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const mountedRef = useRef(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  const connect = useCallback(() => {
    if (!user || !mountedRef.current) return;

    // Get token from auth storage
    const stored = localStorage.getItem('auth-storage');
    let token = '';
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        token = parsed?.state?.token || '';
      } catch {
        return;
      }
    }
    if (!token) return;

    const role = user.role || 'student';
    const wsPath = getWsPath(role);
    const url = `${WS_BASE}${wsPath}/${token}`;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg: NotificationMessage = JSON.parse(event.data);
          setLastMessage(msg);

          if (msg.type === 'notification' && msg.data) {
            addNotification({
              userId: user?.id || '',
              type: (msg.data.notification_type as 'assignment_due' | 'grade_published' | 'forum_reply' | 'course_update' | 'system') || 'system',
              title: msg.data.title || 'Notification',
              message: msg.data.message || '',
              data: {
                actionUrl: msg.data.action_url,
              },
            });
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        wsRef.current = null;

        // Reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current += 1;
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);

      ws.addEventListener('close', () => clearInterval(pingInterval));
    } catch {
      // connection failed, will retry via onclose
    }
  }, [user, addNotification]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { isConnected, unreadCount, lastMessage };
}
