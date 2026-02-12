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

export { useCoPilotStore, useCoPilotInit, useAuthStore };

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

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  isDarkMode: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

// User Store with persistence
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
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
      partialize: (state) => ({
        preferences: state.preferences,
        notifications: state.notifications,
        courses: state.courses,
        assignments: state.assignments,
        quizzes: state.quizzes,
        certificates: state.certificates,
        transactions: state.transactions,
        forumPosts: state.forumPosts
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
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  }
}));

// Initialize theme on app start
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
  useThemeStore.getState().setTheme(savedTheme);
};

// Subscribe to system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const themeStore = useThemeStore.getState();
    if (themeStore.theme === 'system') {
      const newTheme = e.matches ? 'dark' : 'light';
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      themeStore.setTheme(newTheme);
    }
  });
}