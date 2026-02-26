import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StaffNotification, StaffRealtimeCounters } from '../types/staff';

interface StaffState {
  // UI State
  sidebarCollapsed: boolean;
  globalSearch: string;
  activeSection: string;
  openSidebarSections: string[];
  viewMode: 'teacher_focus' | 'operations_focus' | 'custom';

  // Real-time counters (updated via WebSocket)
  counters: StaffRealtimeCounters;

  // Notification center
  staffNotifications: StaffNotification[];
  unreadCount: number;

  // Actions - UI
  setSidebarCollapsed: (collapsed: boolean) => void;
  setGlobalSearch: (search: string) => void;
  setActiveSection: (section: string) => void;
  toggleSidebarSection: (sectionId: string) => void;
  setOpenSidebarSections: (sections: string[]) => void;
  setViewMode: (mode: 'teacher_focus' | 'operations_focus' | 'custom') => void;

  // Actions - Realtime
  updateCounters: (counters: Partial<StaffRealtimeCounters>) => void;
  incrementCounter: (key: keyof StaffRealtimeCounters, amount?: number) => void;
  decrementCounter: (key: keyof StaffRealtimeCounters, amount?: number) => void;

  // Actions - Notifications
  addNotification: (notification: StaffNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useStaffStore = create<StaffState>()(
  persist(
    (set) => ({
      // UI State defaults
      sidebarCollapsed: false,
      globalSearch: '',
      activeSection: 'dashboard',
      openSidebarSections: ['dashboard', 'moderation', 'support'],
      viewMode: 'teacher_focus',

      // Real-time counters defaults
      counters: {
        openTickets: 0,
        moderationQueue: 0,
        pendingApprovals: 0,
        activeSessions: 0,
        unreadNotifications: 0,
        slaAtRisk: 0,
      },

      // Notifications defaults
      staffNotifications: [],
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
      setViewMode: (mode) => set({ viewMode: mode }),

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
          staffNotifications: [notification, ...state.staffNotifications].slice(0, 100),
          unreadCount: state.unreadCount + 1,
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          staffNotifications: state.staffNotifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - (state.staffNotifications.find((n) => n.id === id && !n.read) ? 1 : 0)),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          staffNotifications: state.staffNotifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),
      removeNotification: (id) =>
        set((state) => ({
          staffNotifications: state.staffNotifications.filter((n) => n.id !== id),
          unreadCount: Math.max(0, state.unreadCount - (state.staffNotifications.find((n) => n.id === id && !n.read) ? 1 : 0)),
        })),
      clearNotifications: () => set({ staffNotifications: [], unreadCount: 0 }),
    }),
    {
      name: 'staff-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        openSidebarSections: state.openSidebarSections,
        viewMode: state.viewMode,
      }),
    }
  )
);
