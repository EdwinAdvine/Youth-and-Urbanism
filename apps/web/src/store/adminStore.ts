import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminNotification } from '../types/admin';

interface RealtimeCounters {
  pendingApprovals: number;
  activeAlerts: number;
  openTickets: number;
  activeUsers: number;
  moderationQueue: number;
  pendingEnrollments: number;
}

interface AdminState {
  // UI State
  sidebarCollapsed: boolean;
  globalSearch: string;
  activeSection: string;
  openSidebarSections: string[];

  // Real-time counters (updated via WebSocket)
  counters: RealtimeCounters;

  // Notification center
  adminNotifications: AdminNotification[];
  unreadCount: number;

  // Actions - UI
  setSidebarCollapsed: (collapsed: boolean) => void;
  setGlobalSearch: (search: string) => void;
  setActiveSection: (section: string) => void;
  toggleSidebarSection: (sectionId: string) => void;
  setOpenSidebarSections: (sections: string[]) => void;

  // Actions - Realtime
  updateCounters: (counters: Partial<RealtimeCounters>) => void;
  incrementCounter: (key: keyof RealtimeCounters, amount?: number) => void;
  decrementCounter: (key: keyof RealtimeCounters, amount?: number) => void;

  // Actions - Notifications
  addNotification: (notification: AdminNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      // UI State defaults
      sidebarCollapsed: false,
      globalSearch: '',
      activeSection: 'at-a-glance',
      openSidebarSections: ['today', 'platform-pulse', 'people-access'],

      // Real-time counters defaults
      counters: {
        pendingApprovals: 0,
        activeAlerts: 0,
        openTickets: 0,
        activeUsers: 0,
        moderationQueue: 0,
        pendingEnrollments: 0,
      },

      // Notifications defaults
      adminNotifications: [],
      unreadCount: 0,

      // UI Actions
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setGlobalSearch: (search) => set({ globalSearch: search }),
      setActiveSection: (section) => set({ activeSection: section }),
      toggleSidebarSection: (sectionId) =>
        set((state) => ({
          openSidebarSections: state.openSidebarSections.includes(sectionId)
            ? state.openSidebarSections.filter((id) => id !== sectionId)
            : [...state.openSidebarSections, sectionId],
        })),
      setOpenSidebarSections: (sections) => set({ openSidebarSections: sections }),

      // Realtime Actions
      updateCounters: (counters) =>
        set((state) => ({
          counters: { ...state.counters, ...counters },
        })),
      incrementCounter: (key, amount = 1) =>
        set((state) => ({
          counters: { ...state.counters, [key]: state.counters[key] + amount },
        })),
      decrementCounter: (key, amount = 1) =>
        set((state) => ({
          counters: { ...state.counters, [key]: Math.max(0, state.counters[key] - amount) },
        })),

      // Notification Actions
      addNotification: (notification) =>
        set((state) => ({
          adminNotifications: [notification, ...state.adminNotifications].slice(0, 100),
          unreadCount: state.unreadCount + 1,
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          adminNotifications: state.adminNotifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - (state.adminNotifications.find((n) => n.id === id && !n.read) ? 1 : 0)),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          adminNotifications: state.adminNotifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),
      removeNotification: (id) =>
        set((state) => ({
          adminNotifications: state.adminNotifications.filter((n) => n.id !== id),
          unreadCount: Math.max(0, state.unreadCount - (state.adminNotifications.find((n) => n.id === id && !n.read) ? 1 : 0)),
        })),
      clearNotifications: () => set({ adminNotifications: [], unreadCount: 0 }),
    }),
    {
      name: 'admin-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        openSidebarSections: state.openSidebarSections,
      }),
    }
  )
);
