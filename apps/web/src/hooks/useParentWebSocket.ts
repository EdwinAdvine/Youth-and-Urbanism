/**
 * useParentWebSocket Hook
 *
 * WebSocket hook for parent dashboard real-time features.
 * Uses shared base hook with cookie-based auth (no token in URL).
 * Handles:
 * - Counter updates (sidebar badges)
 * - New messages
 * - AI alerts
 * - Achievements
 * - Report notifications
 */

import { useEffect } from 'react';
import { useBaseWebSocket } from './useBaseWebSocket';
import { useParentStore } from '../store/parentStore';

export const useParentWebSocket = (enabled: boolean = true) => {
  const { isConnected, lastMessage, sendMessage, reconnect, disconnect } =
    useBaseWebSocket({
      path: '/ws/parent',
      requiredRole: 'parent',
      autoConnect: enabled,
    });

  const { updateCounters, incrementCounter, addNotification } = useParentStore();

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'counter_update':
        if (lastMessage.data) {
          updateCounters(lastMessage.data as Record<string, number>);
        }
        break;

      case 'new_message':
        incrementCounter('unreadMessages');
        if (lastMessage.data) {
          const d = lastMessage.data as Record<string, unknown>;
          addNotification({
            id: (d.id as string) || Date.now().toString(),
            type: 'message',
            title: 'New Message',
            message: (d.preview as string) || 'You have a new message',
            child_id: d.child_id as string,
            child_name: d.child_name as string,
            action_url: '/dashboard/parent/messages',
            is_read: false,
            created_at: (lastMessage.timestamp as string) || new Date().toISOString(),
          });
        }
        break;

      case 'new_alert':
        incrementCounter('unreadAlerts');
        if (lastMessage.data) {
          const d = lastMessage.data as Record<string, unknown>;
          addNotification({
            id: (d.id as string) || Date.now().toString(),
            type: 'alert',
            severity: (d.severity as 'critical' | 'info' | 'warning') || 'info',
            title: (d.title as string) || 'New Alert',
            message: (d.message as string) || '',
            child_id: d.child_id as string,
            child_name: d.child_name as string,
            action_url: (d.action_url as string) || '/dashboard/parent/ai/warnings',
            is_read: false,
            created_at: (lastMessage.timestamp as string) || new Date().toISOString(),
          });
        }
        break;

      case 'new_achievement':
        incrementCounter('newAchievements');
        if (lastMessage.data) {
          const d = lastMessage.data as Record<string, unknown>;
          addNotification({
            id: (d.id as string) || Date.now().toString(),
            type: 'achievement',
            title: 'New Achievement!',
            message: `${d.child_name} earned: ${d.title}`,
            child_id: d.child_id as string,
            child_name: d.child_name as string,
            action_url: '/dashboard/parent/achievements',
            is_read: false,
            created_at: (lastMessage.timestamp as string) || new Date().toISOString(),
          });
        }
        break;

      case 'report_ready':
        incrementCounter('newReports');
        if (lastMessage.data) {
          const d = lastMessage.data as Record<string, unknown>;
          addNotification({
            id: (d.id as string) || Date.now().toString(),
            type: 'report',
            title: 'Report Ready',
            message: `${d.report_type} report is ready to view`,
            child_id: d.child_id as string,
            child_name: d.child_name as string,
            action_url: `/dashboard/parent/reports/${d.id}`,
            is_read: false,
            created_at: (lastMessage.timestamp as string) || new Date().toISOString(),
          });
        }
        break;

      default:
        break;
    }
  }, [lastMessage]);

  return { isConnected, disconnect, reconnect, sendMessage };
};
