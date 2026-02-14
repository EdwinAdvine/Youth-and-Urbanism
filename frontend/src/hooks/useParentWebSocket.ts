/**
 * useParentWebSocket Hook
 *
 * WebSocket hook for parent dashboard real-time features.
 * Handles connection, reconnection, and message parsing for:
 * - Counter updates (sidebar badges)
 * - New messages
 * - AI alerts
 * - Achievements
 * - Report notifications
 */

import { useEffect, useRef, useCallback } from 'react';
import { useParentStore } from '../store/parentStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
const RECONNECT_DELAY = 3000; // 3 seconds
const PING_INTERVAL = 30000; // 30 seconds

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

export const useParentWebSocket = (enabled: boolean = true) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const { updateCounters, incrementCounter, addNotification } = useParentStore();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'pong':
            // Pong response to our ping
            break;

          case 'counter_update':
            // Real-time counter update for sidebar badges
            if (message.data) {
              updateCounters(message.data);
            }
            break;

          case 'new_message':
            // New message received
            incrementCounter('unreadMessages');
            if (message.data) {
              addNotification({
                id: message.data.id || Date.now().toString(),
                type: 'message',
                title: 'New Message',
                message: message.data.preview || 'You have a new message',
                child_id: message.data.child_id,
                child_name: message.data.child_name,
                action_url: '/dashboard/parent/messages',
                is_read: false,
                created_at: message.timestamp || new Date().toISOString(),
              });
            }
            break;

          case 'new_alert':
            // New AI alert
            incrementCounter('unreadAlerts');
            if (message.data) {
              addNotification({
                id: message.data.id || Date.now().toString(),
                type: 'alert',
                severity: message.data.severity || 'info',
                title: message.data.title || 'New Alert',
                message: message.data.message || '',
                child_id: message.data.child_id,
                child_name: message.data.child_name,
                action_url: message.data.action_url || '/dashboard/parent/ai/warnings',
                is_read: false,
                created_at: message.timestamp || new Date().toISOString(),
              });
            }
            break;

          case 'new_achievement':
            // Child earned achievement
            incrementCounter('newAchievements');
            if (message.data) {
              addNotification({
                id: message.data.id || Date.now().toString(),
                type: 'achievement',
                title: 'New Achievement!',
                message: `${message.data.child_name} earned: ${message.data.title}`,
                child_id: message.data.child_id,
                child_name: message.data.child_name,
                action_url: '/dashboard/parent/achievements',
                is_read: false,
                created_at: message.timestamp || new Date().toISOString(),
              });
            }
            break;

          case 'report_ready':
            // Report generated and ready
            incrementCounter('newReports');
            if (message.data) {
              addNotification({
                id: message.data.id || Date.now().toString(),
                type: 'report',
                title: 'Report Ready',
                message: `${message.data.report_type} report is ready to view`,
                child_id: message.data.child_id,
                child_name: message.data.child_name,
                action_url: `/dashboard/parent/reports/${message.data.id}`,
                is_read: false,
                created_at: message.timestamp || new Date().toISOString(),
              });
            }
            break;

          default:
            console.log('Unknown WebSocket message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    },
    [updateCounters, incrementCounter, addNotification]
  );

  const connect = useCallback(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.log('No access token, skipping WebSocket connection');
      return;
    }

    const wsUrl = `${WS_URL}/ws/parent/${accessToken}`;
    console.log('Connecting to parent WebSocket...');

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Parent WebSocket connected');
      wsRef.current = ws;

      // Start ping/pong keepalive
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, PING_INTERVAL);
    };

    ws.onmessage = handleMessage;

    ws.onerror = (error) => {
      console.error('Parent WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log('Parent WebSocket closed:', event.code, event.reason);
      wsRef.current = null;

      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = undefined;
      }

      // Attempt reconnect if enabled
      if (enabled && event.code !== 4001 && event.code !== 4003) {
        console.log(`Reconnecting in ${RECONNECT_DELAY / 1000} seconds...`);
        reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
      }
    };
  }, [enabled, handleMessage]);

  const disconnect = useCallback(() => {
    console.log('Disconnecting parent WebSocket...');

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = undefined;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    disconnect,
    reconnect: connect,
  };
};
