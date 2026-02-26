/**
 * Parent Dashboard Zustand Store
 *
 * Manages parent dashboard state including:
 * - Selected child context
 * - Real-time counters for badge notifications
 * - Parent notifications
 * - UI state (sidebar, sections)
 *
 * Follows the staffStore.ts pattern with persist middleware
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ChildSummary,
  ParentRealtimeCounters,
  ParentNotification,
} from '../types/parent';

interface ParentState {
  // ========== Child Context ==========
  selectedChildId: string | null;
  children: ChildSummary[];

  // ========== Real-time Counters ==========
  // Updated via WebSocket for sidebar badges
  counters: ParentRealtimeCounters;

  // ========== UI State ==========
  sidebarCollapsed: boolean;
  globalSearch: string;
  openSidebarSections: string[];

  // ========== Notification Center ==========
  parentNotifications: ParentNotification[];
  unreadCount: number;

  // ========== Actions - Child Context ==========
  setSelectedChild: (childId: string | null) => void;
  setChildren: (children: ChildSummary[]) => void;
  addChild: (child: ChildSummary) => void;
  removeChild: (childId: string) => void;

  // ========== Actions - Counters ==========
  updateCounters: (counters: Partial<ParentRealtimeCounters>) => void;
  incrementCounter: (key: keyof ParentRealtimeCounters, amount?: number) => void;
  decrementCounter: (key: keyof ParentRealtimeCounters, amount?: number) => void;
  resetCounters: () => void;

  // ========== Actions - UI ==========
  setSidebarCollapsed: (collapsed: boolean) => void;
  setGlobalSearch: (search: string) => void;
  toggleSidebarSection: (sectionId: string) => void;
  setOpenSidebarSections: (sections: string[]) => void;

  // ========== Actions - Notifications ==========
  addNotification: (notification: ParentNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useParentStore = create<ParentState>()(
  persist(
    (set) => ({
      // ========== Initial State - Child Context ==========
      selectedChildId: null,
      children: [],

      // ========== Initial State - Counters ==========
      counters: {
        unreadMessages: 0,
        unreadAlerts: 0,
        pendingConsents: 0,
        upcomingDeadlines: 0,
        newAchievements: 0,
        newReports: 0,
      },

      // ========== Initial State - UI ==========
      sidebarCollapsed: false,
      globalSearch: '',
      openSidebarSections: ['dashboard', 'children', 'ai-companion', 'communications'],

      // ========== Initial State - Notifications ==========
      parentNotifications: [],
      unreadCount: 0,

      // ========== Actions - Child Context ==========
      setSelectedChild: (childId) => set({ selectedChildId: childId }),

      setChildren: (children) => set({ children }),

      addChild: (child) =>
        set((state) => ({ children: [...state.children, child] })),

      removeChild: (childId) =>
        set((state) => ({
          children: state.children.filter((c) => c.student_id !== childId),
          selectedChildId:
            state.selectedChildId === childId ? null : state.selectedChildId,
        })),

      // ========== Actions - Counters ==========
      updateCounters: (counters) =>
        set((state) => ({
          counters: { ...state.counters, ...counters },
        })),

      incrementCounter: (key, amount = 1) =>
        set((state) => ({
          counters: {
            ...state.counters,
            [key]: state.counters[key] + amount,
          },
        })),

      decrementCounter: (key, amount = 1) =>
        set((state) => ({
          counters: {
            ...state.counters,
            [key]: Math.max(0, state.counters[key] - amount),
          },
        })),

      resetCounters: () =>
        set({
          counters: {
            unreadMessages: 0,
            unreadAlerts: 0,
            pendingConsents: 0,
            upcomingDeadlines: 0,
            newAchievements: 0,
            newReports: 0,
          },
        }),

      // ========== Actions - UI ==========
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setGlobalSearch: (search) => set({ globalSearch: search }),

      toggleSidebarSection: (sectionId) =>
        set((state) => ({
          openSidebarSections: state.openSidebarSections.includes(sectionId)
            ? state.openSidebarSections.filter((id) => id !== sectionId)
            : [...state.openSidebarSections, sectionId],
        })),

      setOpenSidebarSections: (sections) =>
        set({ openSidebarSections: sections }),

      // ========== Actions - Notifications ==========
      addNotification: (notification) =>
        set((state) => ({
          parentNotifications: [notification, ...state.parentNotifications],
          unreadCount: notification.is_read
            ? state.unreadCount
            : state.unreadCount + 1,
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          parentNotifications: state.parentNotifications.map((n) =>
            n.id === id ? { ...n, is_read: true } : n
          ),
          unreadCount: Math.max(
            0,
            state.unreadCount -
              (state.parentNotifications.find((n) => n.id === id && !n.is_read)
                ? 1
                : 0)
          ),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          parentNotifications: state.parentNotifications.map((n) => ({
            ...n,
            is_read: true,
          })),
          unreadCount: 0,
        })),

      removeNotification: (id) =>
        set((state) => ({
          parentNotifications: state.parentNotifications.filter(
            (n) => n.id !== id
          ),
          unreadCount: Math.max(
            0,
            state.unreadCount -
              (state.parentNotifications.find((n) => n.id === id && !n.is_read)
                ? 1
                : 0)
          ),
        })),

      clearNotifications: () =>
        set({ parentNotifications: [], unreadCount: 0 }),
    }),
    {
      name: 'parent-storage', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        sidebarCollapsed: state.sidebarCollapsed,
        openSidebarSections: state.openSidebarSections,
        selectedChildId: state.selectedChildId,
      }),
    }
  )
);
