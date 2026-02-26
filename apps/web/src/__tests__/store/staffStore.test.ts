import { describe, it, expect, beforeEach } from 'vitest';
import { useStaffStore } from '../../store/staffStore';

describe('staffStore', () => {
  beforeEach(() => {
    // Reset the store to its initial state between tests
    const initialState = useStaffStore.getInitialState();
    useStaffStore.setState(initialState, true);
  });

  // ── Initial State ──────────────────────────────────────────────

  describe('initial state', () => {
    it('has default counter values of zero', () => {
      const { counters } = useStaffStore.getState();
      expect(counters.openTickets).toBe(0);
      expect(counters.moderationQueue).toBe(0);
      expect(counters.pendingApprovals).toBe(0);
      expect(counters.activeSessions).toBe(0);
      expect(counters.unreadNotifications).toBe(0);
      expect(counters.slaAtRisk).toBe(0);
    });

    it('defaults viewMode to teacher_focus', () => {
      const { viewMode } = useStaffStore.getState();
      expect(viewMode).toBe('teacher_focus');
    });

    it('has default openSidebarSections', () => {
      const { openSidebarSections } = useStaffStore.getState();
      expect(openSidebarSections).toEqual(['dashboard', 'moderation', 'support']);
    });

    it('has empty globalSearch by default', () => {
      const { globalSearch } = useStaffStore.getState();
      expect(globalSearch).toBe('');
    });

    it('defaults activeSection to dashboard', () => {
      const { activeSection } = useStaffStore.getState();
      expect(activeSection).toBe('dashboard');
    });

    it('starts with no notifications', () => {
      const { staffNotifications, unreadCount } = useStaffStore.getState();
      expect(staffNotifications).toEqual([]);
      expect(unreadCount).toBe(0);
    });

    it('defaults sidebarCollapsed to false', () => {
      const { sidebarCollapsed } = useStaffStore.getState();
      expect(sidebarCollapsed).toBe(false);
    });
  });

  // ── toggleSidebarSection ───────────────────────────────────────

  describe('toggleSidebarSection', () => {
    it('removes section when already present', () => {
      // 'dashboard' is in the default openSidebarSections
      useStaffStore.getState().toggleSidebarSection('dashboard');
      const { openSidebarSections } = useStaffStore.getState();
      expect(openSidebarSections).not.toContain('dashboard');
    });

    it('adds section when not present', () => {
      // 'insights' is NOT in the default set
      useStaffStore.getState().toggleSidebarSection('insights');
      const { openSidebarSections } = useStaffStore.getState();
      expect(openSidebarSections).toContain('insights');
    });

    it('toggling twice returns to original state', () => {
      const original = [...useStaffStore.getState().openSidebarSections];
      useStaffStore.getState().toggleSidebarSection('team');
      useStaffStore.getState().toggleSidebarSection('team');
      expect(useStaffStore.getState().openSidebarSections).toEqual(original);
    });
  });

  // ── setViewMode ────────────────────────────────────────────────

  describe('setViewMode', () => {
    it('sets viewMode to operations_focus', () => {
      useStaffStore.getState().setViewMode('operations_focus');
      expect(useStaffStore.getState().viewMode).toBe('operations_focus');
    });

    it('sets viewMode to custom', () => {
      useStaffStore.getState().setViewMode('custom');
      expect(useStaffStore.getState().viewMode).toBe('custom');
    });

    it('sets viewMode back to teacher_focus', () => {
      useStaffStore.getState().setViewMode('custom');
      useStaffStore.getState().setViewMode('teacher_focus');
      expect(useStaffStore.getState().viewMode).toBe('teacher_focus');
    });
  });

  // ── setGlobalSearch ────────────────────────────────────────────

  describe('setGlobalSearch', () => {
    it('updates the global search string', () => {
      useStaffStore.getState().setGlobalSearch('ticket 123');
      expect(useStaffStore.getState().globalSearch).toBe('ticket 123');
    });

    it('can be cleared back to empty string', () => {
      useStaffStore.getState().setGlobalSearch('some query');
      useStaffStore.getState().setGlobalSearch('');
      expect(useStaffStore.getState().globalSearch).toBe('');
    });
  });

  // ── Counter updates ────────────────────────────────────────────

  describe('counter updates', () => {
    it('updateCounters merges partial counters', () => {
      useStaffStore.getState().updateCounters({ openTickets: 5, slaAtRisk: 2 });
      const { counters } = useStaffStore.getState();
      expect(counters.openTickets).toBe(5);
      expect(counters.slaAtRisk).toBe(2);
      // Other counters remain at default
      expect(counters.moderationQueue).toBe(0);
      expect(counters.pendingApprovals).toBe(0);
    });

    it('incrementCounter increases counter by 1 by default', () => {
      useStaffStore.getState().incrementCounter('openTickets');
      expect(useStaffStore.getState().counters.openTickets).toBe(1);
    });

    it('incrementCounter increases counter by specified amount', () => {
      useStaffStore.getState().incrementCounter('moderationQueue', 7);
      expect(useStaffStore.getState().counters.moderationQueue).toBe(7);
    });

    it('decrementCounter decreases counter by 1 by default', () => {
      useStaffStore.getState().updateCounters({ openTickets: 10 });
      useStaffStore.getState().decrementCounter('openTickets');
      expect(useStaffStore.getState().counters.openTickets).toBe(9);
    });

    it('decrementCounter does not go below zero', () => {
      // Counter starts at 0
      useStaffStore.getState().decrementCounter('openTickets', 5);
      expect(useStaffStore.getState().counters.openTickets).toBe(0);
    });

    it('decrementCounter decreases by specified amount', () => {
      useStaffStore.getState().updateCounters({ activeSessions: 20 });
      useStaffStore.getState().decrementCounter('activeSessions', 8);
      expect(useStaffStore.getState().counters.activeSessions).toBe(12);
    });
  });

  // ── Notification actions ───────────────────────────────────────

  describe('notification actions', () => {
    const sampleNotification = {
      id: 'notif-1',
      type: 'ticket',
      priority: 'high' as const,
      title: 'New urgent ticket',
      message: 'Payment issue reported',
      category: 'support',
      action_url: '/tickets/1',
      read: false,
      created_at: '2024-01-15T08:00:00Z',
    };

    it('addNotification prepends to list and increments unreadCount', () => {
      useStaffStore.getState().addNotification(sampleNotification);
      const state = useStaffStore.getState();
      expect(state.staffNotifications).toHaveLength(1);
      expect(state.staffNotifications[0].id).toBe('notif-1');
      expect(state.unreadCount).toBe(1);
    });

    it('markNotificationRead marks a notification as read', () => {
      useStaffStore.getState().addNotification(sampleNotification);
      useStaffStore.getState().markNotificationRead('notif-1');
      const state = useStaffStore.getState();
      expect(state.staffNotifications[0].read).toBe(true);
      expect(state.unreadCount).toBe(0);
    });

    it('markAllNotificationsRead marks all as read and zeroes unreadCount', () => {
      useStaffStore.getState().addNotification(sampleNotification);
      useStaffStore.getState().addNotification({ ...sampleNotification, id: 'notif-2' });
      useStaffStore.getState().markAllNotificationsRead();
      const state = useStaffStore.getState();
      expect(state.staffNotifications.every((n) => n.read)).toBe(true);
      expect(state.unreadCount).toBe(0);
    });

    it('removeNotification removes from list', () => {
      useStaffStore.getState().addNotification(sampleNotification);
      useStaffStore.getState().removeNotification('notif-1');
      expect(useStaffStore.getState().staffNotifications).toHaveLength(0);
    });

    it('clearNotifications empties all notifications', () => {
      useStaffStore.getState().addNotification(sampleNotification);
      useStaffStore.getState().addNotification({ ...sampleNotification, id: 'notif-2' });
      useStaffStore.getState().clearNotifications();
      const state = useStaffStore.getState();
      expect(state.staffNotifications).toHaveLength(0);
      expect(state.unreadCount).toBe(0);
    });
  });
});
