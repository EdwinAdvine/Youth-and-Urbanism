import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PartnerNotification } from '../types/partner';

interface PartnerRealtimeCounters {
  pendingConsents: number;
  activeSponsorships: number;
  openTickets: number;
  childAlerts: number;
  pendingPayments: number;
  unreadMessages: number;
}

interface PartnerState {
  // UI State
  sidebarCollapsed: boolean;
  globalSearch: string;
  activeSection: string;
  openSidebarSections: string[];

  // Real-time counters (updated via WebSocket)
  counters: PartnerRealtimeCounters;

  // Notification center
  partnerNotifications: PartnerNotification[];
  unreadCount: number;

  // Partner-specific state
  selectedProgramId: string | null;
  selectedChildId: string | null;
  childViewMode: 'individual' | 'cohort';

  // Actions - UI
  setSidebarCollapsed: (collapsed: boolean) => void;
  setGlobalSearch: (search: string) => void;
  setActiveSection: (section: string) => void;
  toggleSidebarSection: (sectionId: string) => void;
  setOpenSidebarSections: (sections: string[]) => void;

  // Actions - Realtime
  updateCounters: (counters: Partial<PartnerRealtimeCounters>) => void;
  incrementCounter: (key: keyof PartnerRealtimeCounters, amount?: number) => void;
  decrementCounter: (key: keyof PartnerRealtimeCounters, amount?: number) => void;

  // Actions - Notifications
  addNotification: (notification: PartnerNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Actions - Partner-specific
  setSelectedProgramId: (id: string | null) => void;
  setSelectedChildId: (id: string | null) => void;
  setChildViewMode: (mode: 'individual' | 'cohort') => void;
}

export const usePartnerStore = create<PartnerState>()(
  persist(
    (set) => ({
      // UI State defaults
      sidebarCollapsed: false,
      globalSearch: '',
      activeSection: 'overview',
      openSidebarSections: ['dashboard', 'partnerships'],

      // Real-time counters defaults
      counters: {
        pendingConsents: 0,
        activeSponsorships: 0,
        openTickets: 0,
        childAlerts: 0,
        pendingPayments: 0,
        unreadMessages: 0,
      },

      // Notifications defaults
      partnerNotifications: [],
      unreadCount: 0,

      // Partner-specific defaults
      selectedProgramId: null,
      selectedChildId: null,
      childViewMode: 'individual',

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
          partnerNotifications: [notification, ...state.partnerNotifications].slice(0, 100),
          unreadCount: state.unreadCount + 1,
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          partnerNotifications: state.partnerNotifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - (state.partnerNotifications.find((n) => n.id === id && !n.read) ? 1 : 0)),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          partnerNotifications: state.partnerNotifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),
      removeNotification: (id) =>
        set((state) => ({
          partnerNotifications: state.partnerNotifications.filter((n) => n.id !== id),
          unreadCount: Math.max(0, state.unreadCount - (state.partnerNotifications.find((n) => n.id === id && !n.read) ? 1 : 0)),
        })),
      clearNotifications: () => set({ partnerNotifications: [], unreadCount: 0 }),

      // Partner-specific Actions
      setSelectedProgramId: (id) => set({ selectedProgramId: id }),
      setSelectedChildId: (id) => set({ selectedChildId: id }),
      setChildViewMode: (mode) => set({ childViewMode: mode }),
    }),
    {
      name: 'partner-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        openSidebarSections: state.openSidebarSections,
        childViewMode: state.childViewMode,
      }),
    }
  )
);
