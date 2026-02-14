import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MoodEntry, DailyPlan, Badge, NotificationItem } from '../types/student';

interface StudentRealtimeCounters {
  unreadNotifications: number;
  pendingAssignments: number;
  upcomingQuizzes: number;
  dueSoonCount: number;
  unreadMessages: number;
  friendRequests: number;
  newShoutouts: number;
  activeLiveSessions: number;
}

interface StudentState {
  // UI State
  sidebarCollapsed: boolean;
  activeSection: string;
  openSidebarSections: string[];

  // Real-time counters (updated via WebSocket)
  counters: StudentRealtimeCounters;

  // Mood state
  currentMood?: MoodEntry;
  lastMoodCheckIn?: Date;
  showMoodModal: boolean;

  // Streak state
  currentStreak: number;
  longestStreak: number;

  // Gamification
  xp: number;
  level: number;
  recentBadges: Badge[];

  // Daily plan
  dailyPlan?: DailyPlan;
  dailyPlanLoaded: boolean;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;

  // Actions - UI
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveSection: (section: string) => void;
  toggleSidebarSection: (sectionId: string) => void;
  setOpenSidebarSections: (sections: string[]) => void;

  // Actions - Mood
  setCurrentMood: (mood: MoodEntry) => void;
  setShowMoodModal: (show: boolean) => void;

  // Actions - Streak
  updateStreak: (current: number, longest: number) => void;

  // Actions - Gamification
  updateXP: (xp: number) => void;
  updateLevel: (level: number) => void;
  addBadge: (badge: Badge) => void;
  clearRecentBadges: () => void;

  // Actions - Daily Plan
  setDailyPlan: (plan: DailyPlan) => void;
  updateDailyPlanItem: (itemId: string, updates: Partial<any>) => void;

  // Actions - Realtime Counters
  updateCounters: (counters: Partial<StudentRealtimeCounters>) => void;
  incrementCounter: (key: keyof StudentRealtimeCounters, amount?: number) => void;
  decrementCounter: (key: keyof StudentRealtimeCounters, amount?: number) => void;

  // Actions - Notifications
  addNotification: (notification: NotificationItem) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      // UI State defaults
      sidebarCollapsed: false,
      activeSection: 'dashboard',
      openSidebarSections: ['home', 'ai-tutor', 'learning', 'practice', 'progress'],

      // Real-time counters defaults
      counters: {
        unreadNotifications: 0,
        pendingAssignments: 0,
        upcomingQuizzes: 0,
        dueSoonCount: 0,
        unreadMessages: 0,
        friendRequests: 0,
        newShoutouts: 0,
        activeLiveSessions: 0,
      },

      // Mood defaults
      currentMood: undefined,
      lastMoodCheckIn: undefined,
      showMoodModal: false,

      // Streak defaults
      currentStreak: 0,
      longestStreak: 0,

      // Gamification defaults
      xp: 0,
      level: 1,
      recentBadges: [],

      // Daily plan defaults
      dailyPlan: undefined,
      dailyPlanLoaded: false,

      // Notifications defaults
      notifications: [],
      unreadNotificationCount: 0,

      // UI Actions
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setActiveSection: (section) => set({ activeSection: section }),
      toggleSidebarSection: (sectionId) =>
        set((state) => ({
          openSidebarSections: state.openSidebarSections.includes(sectionId)
            ? state.openSidebarSections.filter((id) => id !== sectionId)
            : [...state.openSidebarSections, sectionId],
        })),
      setOpenSidebarSections: (sections) => set({ openSidebarSections: sections }),

      // Mood Actions
      setCurrentMood: (mood) =>
        set({
          currentMood: mood,
          lastMoodCheckIn: new Date(),
          showMoodModal: false,
        }),
      setShowMoodModal: (show) => set({ showMoodModal: show }),

      // Streak Actions
      updateStreak: (current, longest) =>
        set({
          currentStreak: current,
          longestStreak: longest,
        }),

      // Gamification Actions
      updateXP: (xp) => set({ xp }),
      updateLevel: (level) => set({ level }),
      addBadge: (badge) =>
        set((state) => ({
          recentBadges: [badge, ...state.recentBadges].slice(0, 5), // Keep last 5
        })),
      clearRecentBadges: () => set({ recentBadges: [] }),

      // Daily Plan Actions
      setDailyPlan: (plan) =>
        set({
          dailyPlan: plan,
          dailyPlanLoaded: true,
        }),
      updateDailyPlanItem: (itemId, updates) =>
        set((state) => ({
          dailyPlan: state.dailyPlan
            ? {
                ...state.dailyPlan,
                items: state.dailyPlan.items.map((item) =>
                  item.id === itemId ? { ...item, ...updates } : item
                ),
              }
            : undefined,
        })),

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
          notifications: [notification, ...state.notifications].slice(0, 100),
          unreadNotificationCount: state.unreadNotificationCount + 1,
          counters: {
            ...state.counters,
            unreadNotifications: state.counters.unreadNotifications + 1,
          },
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
          counters: {
            ...state.counters,
            unreadNotifications: Math.max(0, state.counters.unreadNotifications - 1),
          },
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadNotificationCount: 0,
          counters: {
            ...state.counters,
            unreadNotifications: 0,
          },
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadNotificationCount: state.notifications.find((n) => n.id === id && !n.read)
            ? state.unreadNotificationCount - 1
            : state.unreadNotificationCount,
        })),
      clearNotifications: () =>
        set({
          notifications: [],
          unreadNotificationCount: 0,
          counters: (state) => ({
            ...state.counters,
            unreadNotifications: 0,
          }) as any,
        }),
    }),
    {
      name: 'student-storage',
      partialize: (state) => ({
        // Only persist these fields
        sidebarCollapsed: state.sidebarCollapsed,
        openSidebarSections: state.openSidebarSections,
        currentMood: state.currentMood,
        lastMoodCheckIn: state.lastMoodCheckIn,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        xp: state.xp,
        level: state.level,
      }),
    }
  )
);
