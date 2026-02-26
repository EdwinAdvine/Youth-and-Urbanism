/**
 * Student WebSocket Hook - Real-time notifications via native WebSocket
 *
 * Uses shared base hook with cookie-based auth (no token in URL).
 * Maps incoming message types to Zustand store actions.
 */
import { useEffect } from 'react';
import { useBaseWebSocket } from './useBaseWebSocket';
import { useStudentStore } from '../store/studentStore';

export default function useStudentWebSocket() {
  const { isConnected, lastMessage, sendMessage, reconnect, disconnect } =
    useBaseWebSocket({
      path: '/ws/student',
      requiredRole: 'student',
    });

  const store = useStudentStore();

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'new_notification':
      case 'notification':
        store.incrementCounter('unreadNotifications');
        break;

      case 'new_assignment':
      case 'assignment_update':
        store.incrementCounter('pendingAssignments');
        break;

      case 'friend_request':
      case 'new_request':
        store.incrementCounter('friendRequests');
        break;

      case 'badge_earned':
      case 'achievement':
        // Badge/achievement — handled via notification toast by consumers
        break;

      case 'streak_update':
        if (typeof lastMessage.streak === 'number') {
          // Read longestStreak from current state to avoid stale closure
          const { longestStreak } = useStudentStore.getState();
          store.updateStreak(lastMessage.streak as number, longestStreak);
        }
        break;

      case 'xp_update':
        if (typeof lastMessage.xp === 'number') {
          store.updateXP(lastMessage.xp as number);
        }
        if (typeof lastMessage.level === 'number') {
          store.updateLevel(lastMessage.level as number);
        }
        break;

      case 'counter_update':
        // Generic counter update from backend
        if (lastMessage.data && typeof lastMessage.data === 'object') {
          const counters = lastMessage.data as Record<string, number>;
          const validKeys = [
            'unreadNotifications', 'pendingAssignments', 'upcomingQuizzes',
            'dueSoonCount', 'unreadMessages', 'friendRequests',
            'newShoutouts', 'activeLiveSessions',
          ] as const;
          Object.entries(counters).forEach(([key, value]) => {
            if (typeof value === 'number' && validKeys.includes(key as typeof validKeys[number])) {
              store.incrementCounter(key as typeof validKeys[number], value);
            }
          });
        }
        break;

      default:
        break;
    }
  }, [lastMessage]);

  return { isConnected, sendMessage, reconnect, disconnect };
}
