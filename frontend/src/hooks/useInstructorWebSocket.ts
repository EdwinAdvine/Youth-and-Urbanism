/**
 * Instructor WebSocket Hook
 *
 * Manages real-time WebSocket connection for instructor dashboard:
 * - Counter updates (sidebar badges)
 * - Real-time notifications
 * - Badge/achievement alerts
 * - Payout status updates
 *
 * Features:
 * - Auto-reconnect with exponential backoff
 * - Heartbeat/ping-pong
 * - Type-safe event handling
 * - Zustand store integration
 */

import { useEffect, useRef, useCallback } from 'react';
import { useInstructorStore } from '../store/instructorStore';
import { useAuthStore } from '../store/authStore';

const WS_BASE_URL = import.meta.env.VITE_API_URL?.replace('http', 'ws') || 'ws://localhost:8000';
const RECONNECT_INTERVAL = 3000; // 3 seconds
const MAX_RECONNECT_INTERVAL = 30000; // 30 seconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export const useInstructorWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const { token, user } = useAuthStore();
  const {
    updateCounters,
    addNotification,
    incrementCounter,
    decrementCounter,
  } = useInstructorStore();

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'counter_update':
          // Update specific counter
          const { counter, count } = message.data;
          updateCounters({ [counter]: count });
          break;

        case 'notification':
          // Add new notification
          addNotification(message.data);
          break;

        case 'submission_received':
          // Increment pending submissions counter
          incrementCounter('pendingSubmissions');
          addNotification({
            id: message.data.id || Date.now().toString(),
            type: 'submission_received',
            title: 'New Submission',
            message: message.data.message || 'A student submitted an assignment',
            data: message.data,
            read: false,
            created_at: message.timestamp,
          });
          break;

        case 'session_starting':
          // Notify about upcoming session
          addNotification({
            id: message.data.id || Date.now().toString(),
            type: 'session_starting',
            title: 'Session Starting Soon',
            message: message.data.message || 'Your session starts in 15 minutes',
            data: message.data,
            read: false,
            action_url: `/dashboard/instructor/sessions/${message.data.session_id}`,
            created_at: message.timestamp,
          });
          break;

        case 'student_flagged':
          // AI-flagged student alert
          incrementCounter('aiFlaggedStudents');
          addNotification({
            id: message.data.id || Date.now().toString(),
            type: 'student_flagged',
            title: 'Student Needs Attention',
            message: message.data.message || 'AI flagged a student for intervention',
            data: message.data,
            read: false,
            action_url: `/dashboard/instructor/students/${message.data.student_id}`,
            created_at: message.timestamp,
          });
          break;

        case 'payout_status':
          // Payout status update
          addNotification({
            id: message.data.id || Date.now().toString(),
            type: 'payout_status',
            title: 'Payout Update',
            message: message.data.message || 'Payout status changed',
            data: message.data,
            read: false,
            action_url: '/dashboard/instructor/earnings/payouts',
            created_at: message.timestamp,
          });
          break;

        case 'message_received':
          // New message received
          incrementCounter('unreadMessages');
          addNotification({
            id: message.data.id || Date.now().toString(),
            type: 'message_received',
            title: 'New Message',
            message: message.data.message || 'You have a new message',
            data: message.data,
            read: false,
            action_url: '/dashboard/instructor/messages',
            created_at: message.timestamp,
          });
          break;

        case 'badge_earned':
          // Badge/achievement earned
          addNotification({
            id: message.data.id || Date.now().toString(),
            type: 'badge_earned',
            title: 'Achievement Unlocked!',
            message: `You earned the "${message.data.badge_name}" badge!`,
            data: message.data,
            read: false,
            action_url: '/dashboard/instructor/impact/badges',
            created_at: message.timestamp,
          });
          break;

        case 'ping':
          // Server heartbeat - respond with pong
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'pong' }));
          }
          break;

        case 'pong':
          // Server acknowledged our ping
          break;

        default:
          console.warn('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }, [updateCounters, addNotification, incrementCounter, decrementCounter]);

  const connect = useCallback(() => {
    if (!token || !user || user.role !== 'instructor') {
      return;
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = `${WS_BASE_URL}/ws/instructor/${token}`;
    console.log('Connecting to instructor WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Instructor WebSocket connected');
      reconnectAttemptsRef.current = 0;

      // Start heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, HEARTBEAT_INTERVAL);
    };

    ws.onmessage = handleMessage;

    ws.onerror = (error) => {
      console.error('Instructor WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Instructor WebSocket closed');

      // Clear heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      // Attempt to reconnect with exponential backoff
      reconnectAttemptsRef.current++;
      const delay = Math.min(
        RECONNECT_INTERVAL * Math.pow(2, reconnectAttemptsRef.current - 1),
        MAX_RECONNECT_INTERVAL
      );

      console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  }, [token, user, handleMessage]);

  const disconnect = useCallback(() => {
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Clear heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    reconnectAttemptsRef.current = 0;
  }, []);

  // Connect on mount if authenticated as instructor
  useEffect(() => {
    if (token && user?.role === 'instructor') {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, user?.role, connect, disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnect: connect,
    disconnect,
  };
};
