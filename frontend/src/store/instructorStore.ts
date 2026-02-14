import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  InstructorNotification,
  InstructorRealtimeCounters,
  InstructorWSEventType,
} from '../types/instructor';

export type ViewMode = 'teaching_focus' | 'earnings_focus' | 'custom';

interface InstructorState {
  // UI State
  sidebarCollapsed: boolean;
  globalSearch: string;
  activeSection: string;
  openSidebarSections: string[];
  viewMode: ViewMode;

  // Real-time counters (updated via WebSocket)
  counters: InstructorRealtimeCounters;

  // Notification center
  instructorNotifications: InstructorNotification[];
  unreadCount: number;

  // UI Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setGlobalSearch: (search: string) => void;
  setActiveSection: (section: string) => void;
  toggleSidebarSection: (sectionId: string) => void;
  setOpenSidebarSections: (sections: string[]) => void;
  setViewMode: (mode: ViewMode) => void;

  // Real-time Actions
  updateCounters: (counters: Partial<InstructorRealtimeCounters>) => void;
  incrementCounter: (key: keyof InstructorRealtimeCounters, amount?: number) => void;
  decrementCounter: (key: keyof InstructorRealtimeCounters, amount?: number) => void;

  // Notification Actions
  addNotification: (notification: InstructorNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useInstructorStore = create<InstructorState>()(
  persist(
    (set, get) => ({
      // UI State defaults
      sidebarCollapsed: false,
      globalSearch: '',
      activeSection: 'dashboard',
      openSidebarSections: ['dashboard', 'teaching', 'students', 'earnings'],
      viewMode: 'teaching_focus',

      // Real-time counters defaults
      counters: {
        pendingSubmissions: 0,
        unreadMessages: 0,
        upcomingSessions: 0,
        aiFlaggedStudents: 0,
        unreadNotifications: 0,
        pendingPayouts: 0,
      },

      // Notifications defaults
      instructorNotifications: [],
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

      // Real-time Actions
      updateCounters: (counters) =>
        set((state) => ({
          counters: { ...state.counters, ...counters },
        })),

      incrementCounter: (key, amount = 1) =>
        set((state) => ({
          counters: {
            ...state.counters,
            [key]: Math.max(0, state.counters[key] + amount),
          },
        })),

      decrementCounter: (key, amount = 1) =>
        set((state) => ({
          counters: {
            ...state.counters,
            [key]: Math.max(0, state.counters[key] - amount),
          },
        })),

      // Notification Actions
      addNotification: (notification) =>
        set((state) => {
          const newNotifications = [notification, ...state.instructorNotifications];
          const unreadCount = newNotifications.filter((n) => !n.read).length;
          return {
            instructorNotifications: newNotifications,
            unreadCount,
            counters: { ...state.counters, unreadNotifications: unreadCount },
          };
        }),

      markNotificationRead: (id) =>
        set((state) => {
          const newNotifications = state.instructorNotifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          const unreadCount = newNotifications.filter((n) => !n.read).length;
          return {
            instructorNotifications: newNotifications,
            unreadCount,
            counters: { ...state.counters, unreadNotifications: unreadCount },
          };
        }),

      markAllNotificationsRead: () =>
        set((state) => ({
          instructorNotifications: state.instructorNotifications.map((n) => ({
            ...n,
            read: true,
          })),
          unreadCount: 0,
          counters: { ...state.counters, unreadNotifications: 0 },
        })),

      removeNotification: (id) =>
        set((state) => {
          const newNotifications = state.instructorNotifications.filter(
            (n) => n.id !== id
          );
          const unreadCount = newNotifications.filter((n) => !n.read).length;
          return {
            instructorNotifications: newNotifications,
            unreadCount,
            counters: { ...state.counters, unreadNotifications: unreadCount },
          };
        }),

      clearNotifications: () =>
        set({
          instructorNotifications: [],
          unreadCount: 0,
          counters: { ...get().counters, unreadNotifications: 0 },
        }),
    }),
    {
      name: 'instructor-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        openSidebarSections: state.openSidebarSections,
        viewMode: state.viewMode,
      }),
    }
  )
);
