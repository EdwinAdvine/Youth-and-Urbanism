/**
 * Central store barrel file for the Urban Home School frontend.
 *
 * Re-exports all role-specific Zustand stores and defines the two
 * core global stores used across every dashboard:
 *  - useUserStore  -- user preferences, notifications, courses, assignments,
 *                     quizzes, certificates, transactions, and forum posts.
 *                     Persisted to localStorage under "user-storage".
 *  - useThemeStore -- light / dark / system theme management with DOM class
 *                     toggling and localStorage persistence.
 *
 * Also exports the initializeTheme() helper that should be called once on
 * application startup to apply the saved (or default dark) theme.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  UserPreferences,
  Notification,
  Course,
  Assignment,
  Quiz,
  Certificate,
  Transaction,
  ForumPost,
  ForumReply
} from '../types/index';
import { useCoPilotStore, useCoPilotInit } from './coPilotStore';
import { useAuthStore } from './authStore';
import { useInstructorStore } from './instructorStore';

// Re-export all role-specific stores so consumers can import from a single path
export { useCoPilotStore, useCoPilotInit, useAuthStore, useInstructorStore };
export { useStaffStore } from './staffStore';
export { useAdminStore } from './adminStore';
export { useParentStore } from './parentStore';
export { usePartnerStore } from './partnerStore';

/** Shape of the global user store -- preferences, content, and related actions. */
interface UserState {
  preferences: UserPreferences;
  notifications: Notification[];
  courses: Course[];
  assignments: Assignment[];
  quizzes: Quiz[];
  certificates: Certificate[];
  transactions: Transaction[];
  forumPosts: ForumPost[];
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  updateCourseProgress: (courseId: string, progress: number) => void;
  updateAssignment: (assignmentId: string, updates: Partial<Assignment>) => void;
  addQuizResult: (quizId: string, result: any) => void;
  addCertificate: (certificate: Omit<Certificate, 'id' | 'createdAt'>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  addForumPost: (post: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'views' | 'likes'>) => void;
  addForumReply: (postId: string, reply: Omit<ForumReply, 'id' | 'createdAt' | 'isEdited'>) => void;
}

/** Shape of the theme store -- current theme choice and computed dark-mode flag. */
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  isDarkMode: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

// User Store with persistence
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      preferences: {
        theme: 'system',
        language: 'en',
        notifications: true,
        emailNotifications: true,
        pushNotifications: false,
        dashboardWidgets: []
      },
      notifications: [],
      courses: [],
      assignments: [],
      quizzes: [],
      certificates: [],
      transactions: [],
      forumPosts: [],
      updatePreferences: (preferences) => 
        set((state) => ({
          preferences: { ...state.preferences, ...preferences }
        })),
      addNotification: (notification) => 
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: Date.now().toString(),
              createdAt: new Date(),
              read: false
            },
            ...state.notifications
          ]
        })),
      markNotificationAsRead: (notificationId) => 
        set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        })),
      markAllNotificationsAsRead: () => 
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true }))
        })),
      removeNotification: (notificationId) => 
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== notificationId)
        })),
      updateCourseProgress: (courseId, progress) => 
        set((state) => ({
          courses: state.courses.map(course => 
            course.id === courseId ? { ...course, progress } : course
          )
        })),
      updateAssignment: (assignmentId, updates) => 
        set((state) => ({
          assignments: state.assignments.map(assignment => 
            assignment.id === assignmentId ? { ...assignment, ...updates } : assignment
          )
        })),
      addQuizResult: (quizId, result) => 
        set((state) => ({
          quizzes: state.quizzes.map(quiz => 
            quiz.id === quizId 
              ? { ...quiz, results: [...quiz.results, result] }
              : quiz
          )
        })),
      addCertificate: (certificate) => 
        set((state) => ({
          certificates: [
            {
              ...certificate,
              id: Date.now().toString(),
              createdAt: new Date()
            },
            ...state.certificates
          ]
        })),
      addTransaction: (transaction) => 
        set((state) => ({
          transactions: [
            {
              ...transaction,
              id: Date.now().toString(),
              createdAt: new Date()
            },
            ...state.transactions
          ]
        })),
      addForumPost: (post) => 
        set((state) => ({
          forumPosts: [
            {
              ...post,
              id: Date.now().toString(),
              createdAt: new Date(),
              updatedAt: new Date(),
              replies: [],
              views: 0,
              likes: []
            },
            ...state.forumPosts
          ]
        })),
      addForumReply: (postId, reply) => 
        set((state) => ({
          forumPosts: state.forumPosts.map(post => 
            post.id === postId 
              ? {
                  ...post,
                  replies: [
                    {
                      ...reply,
                      id: Date.now().toString(),
                      createdAt: new Date(),
                      isEdited: false
                    },
                    ...post.replies
                  ],
                  updatedAt: new Date()
                }
              : post
          )
        }))
    }),
    {
      name: 'user-storage',
      // Only persist non-sensitive UI preferences.
      // Courses, assignments, transactions, etc. are fetched from the API per session.
      partialize: (state) => ({
        preferences: state.preferences,
      })
    }
  )
);

// Theme Store
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  isDarkMode: false,
  setTheme: (theme) => {
    set({ theme });
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
      set({ isDarkMode: systemTheme === 'dark' });
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      set({ isDarkMode: theme === 'dark' });
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  },
  toggleTheme: () => {
    const { isDarkMode } = get();
    const newTheme = isDarkMode ? 'light' : 'dark';
    get().setTheme(newTheme);
  }
}));

// Initialize theme on app start (defaults to dark if no saved preference)
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
  useThemeStore.getState().setTheme(savedTheme || 'dark');
};

// Subscribe to system theme changes — update DOM and isDarkMode
// WITHOUT overwriting the 'system' preference stored in theme state.
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const { theme } = useThemeStore.getState();
    if (theme === 'system') {
      const resolved = e.matches ? 'dark' : 'light';
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      // Only update isDarkMode — keep theme as 'system'
      useThemeStore.setState({ isDarkMode: resolved === 'dark' });
    }
  });
}