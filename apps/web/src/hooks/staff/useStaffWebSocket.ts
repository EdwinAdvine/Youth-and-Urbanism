/**
 * Staff WebSocket Hook
 *
 * Uses shared base hook with cookie-based auth (no token in URL).
 * Handles counter updates, notifications, SLA warnings, ticket assignments,
 * and moderation items via Zustand store integration.
 */

import { useEffect } from 'react';
import { useBaseWebSocket } from '../useBaseWebSocket';
import { useStaffStore } from '../../store/staffStore';
import type { StaffWebSocketEvent, StaffNotification } from '../../types/staff';

interface UseStaffWebSocketOptions {
  /** Whether the WebSocket connection is enabled (defaults to true) */
  enabled?: boolean;
}

interface UseStaffWebSocketReturn {
  /** Whether the WebSocket is currently connected */
  isConnected: boolean;
  /** The last message received from the WebSocket */
  lastMessage: StaffWebSocketEvent | null;
  /** Send a message through the WebSocket */
  sendMessage: (data: Record<string, unknown>) => void;
}

export function useStaffWebSocket(
  options?: UseStaffWebSocketOptions,
): UseStaffWebSocketReturn {
  const { enabled = true } = options ?? {};

  const {
    isConnected,
    lastMessage: rawMessage,
    sendMessage: baseSend,
  } = useBaseWebSocket({
    path: '/ws/staff',
    requiredRole: 'staff',
    autoConnect: enabled,
  });

  const updateCounters = useStaffStore((state) => state.updateCounters);
  const addNotification = useStaffStore((state) => state.addNotification);
  const incrementCounter = useStaffStore((state) => state.incrementCounter);

  // Cast the raw message to the staff-specific type for consumers
  const lastMessage = rawMessage as unknown as StaffWebSocketEvent | null;

  useEffect(() => {
    if (!lastMessage) return;
    const { type, data } = lastMessage;

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
        const slaEvent = new CustomEvent('staff:sla_warning', { detail: data });
        window.dispatchEvent(slaEvent);
        if (type === 'ticket.sla_warning') {
          incrementCounter('slaAtRisk');
        }
        break;
      }

      case 'ticket.assigned': {
        const notification: StaffNotification = {
          id: crypto.randomUUID(),
          type: 'ticket.assigned',
          priority: ((data as Record<string, unknown>).priority as StaffNotification['priority']) || 'medium',
          title: 'New Ticket Assigned',
          message: ((data as Record<string, unknown>).subject as string) || 'A ticket has been assigned to you.',
          category: 'tickets',
          action_url: ((data as Record<string, unknown>).action_url as string) || null,
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

      default:
        // Other event types (ticket.updated, session.starting, collab.*, etc.)
        // are consumed by page components via lastMessage — no global action needed
        break;
    }
  }, [lastMessage]);

  const sendMessage = (data: Record<string, unknown>) => {
    baseSend({ type: 'message', ...data });
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
}

export default useStaffWebSocket;
