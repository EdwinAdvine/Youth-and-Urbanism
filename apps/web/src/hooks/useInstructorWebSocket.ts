/**
 * Instructor WebSocket Hook
 *
 * Uses shared base hook with cookie-based auth (no token in URL).
 * Manages real-time WebSocket connection for instructor dashboard:
 * - Counter updates (sidebar badges)
 * - Real-time notifications
 * - Badge/achievement alerts
 * - Payout status updates
 */

import { useEffect } from 'react';
import { useBaseWebSocket } from './useBaseWebSocket';
import { useInstructorStore } from '../store/instructorStore';
import type { InstructorNotification } from '../types/instructor';

export const useInstructorWebSocket = () => {
  const { isConnected, lastMessage, sendMessage, reconnect, disconnect } =
    useBaseWebSocket({
      path: '/ws/instructor',
      requiredRole: 'instructor',
    });

  const {
    updateCounters,
    addNotification,
    incrementCounter,
  } = useInstructorStore();

  useEffect(() => {
    if (!lastMessage) return;
    const data = (lastMessage.data ?? {}) as Record<string, unknown>;
    const ts = (lastMessage.timestamp as string) || new Date().toISOString();

    switch (lastMessage.type) {
      case 'counter_update':
        updateCounters({ [(data.counter as string)]: data.count as number });
        break;

      case 'notification':
        addNotification(data as unknown as InstructorNotification);
        break;

      case 'submission_received':
        incrementCounter('pendingSubmissions');
        addNotification({
          id: (data.id as string) || Date.now().toString(),
          type: 'submission_received',
          title: 'New Submission',
          message: (data.message as string) || 'A student submitted an assignment',
          data,
          read: false,
          created_at: ts,
        });
        break;

      case 'session_starting':
        addNotification({
          id: (data.id as string) || Date.now().toString(),
          type: 'session_starting',
          title: 'Session Starting Soon',
          message: (data.message as string) || 'Your session starts in 15 minutes',
          data,
          read: false,
          action_url: `/dashboard/instructor/sessions/${data.session_id}`,
          created_at: ts,
        });
        break;

      case 'student_flagged':
        incrementCounter('aiFlaggedStudents');
        addNotification({
          id: (data.id as string) || Date.now().toString(),
          type: 'student_flagged',
          title: 'Student Needs Attention',
          message: (data.message as string) || 'AI flagged a student for intervention',
          data,
          read: false,
          action_url: `/dashboard/instructor/students/${data.student_id}`,
          created_at: ts,
        });
        break;

      case 'payout_status':
        addNotification({
          id: (data.id as string) || Date.now().toString(),
          type: 'payout_status',
          title: 'Payout Update',
          message: (data.message as string) || 'Payout status changed',
          data,
          read: false,
          action_url: '/dashboard/instructor/earnings/payouts',
          created_at: ts,
        });
        break;

      case 'message_received':
        incrementCounter('unreadMessages');
        addNotification({
          id: (data.id as string) || Date.now().toString(),
          type: 'message_received',
          title: 'New Message',
          message: (data.message as string) || 'You have a new message',
          data,
          read: false,
          action_url: '/dashboard/instructor/messages',
          created_at: ts,
        });
        break;

      case 'badge_earned':
        addNotification({
          id: (data.id as string) || Date.now().toString(),
          type: 'badge_earned',
          title: 'Achievement Unlocked!',
          message: `You earned the "${data.badge_name}" badge!`,
          data,
          read: false,
          action_url: '/dashboard/instructor/impact/badges',
          created_at: ts,
        });
        break;

      case 'ping':
        // Server heartbeat — respond with pong
        sendMessage({ type: 'pong' });
        break;

      default:
        break;
    }
  }, [lastMessage]);

  return { isConnected, reconnect, disconnect, sendMessage };
};
