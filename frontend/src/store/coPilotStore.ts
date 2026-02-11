import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import React from 'react';

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin' | 'partner' | 'staff';

export interface CoPilotSession {
  id: string;
  title: string;
  createdAt: Date;
  lastActivity: Date;
  messages: number;
  role: UserRole;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface CoPilotState {
  // Core state
  isExpanded: boolean;
  activeRole: UserRole;
  isOnline: boolean;
  
  // Sessions
  sessions: CoPilotSession[];
  currentSessionId: string | null;
  
  // UI state
  isMinimized: boolean;
  hasUnreadMessages: boolean;
  
  // Chat state
  isChatMode: boolean;
  chatMessages: ChatMessage[];
  currentDashboardType: 'student' | 'parent' | 'teacher' | 'admin' | 'partner' | 'staff';
  detectedRole: UserRole;
  
  // Actions
  toggleExpanded: () => void;
  setExpanded: (expanded: boolean) => void;
  setActiveRole: (role: UserRole) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  createSession: (role: UserRole) => void;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  markAsRead: () => void;
  minimize: () => void;
  maximize: () => void;
  
  // Chat actions
  activateChatMode: () => void;
  sendMessage: (message: string) => void;
  detectDashboardType: (pathname: string) => void;
  resetToNormalMode: () => void;
  addChatMessage: (message: ChatMessage) => void;
  updateMessageStatus: (messageId: string, status: ChatMessage['status']) => void;
  clearChatMessages: () => void;
}

export const useCoPilotStore = create<CoPilotState>()(
  persist(
    (set, get) => ({
      // Initial state
      isExpanded: false,
      activeRole: 'student',
      isOnline: navigator.onLine,
      sessions: [],
      currentSessionId: null,
      isMinimized: false,
      hasUnreadMessages: false,
      isChatMode: false,
      chatMessages: [],
      currentDashboardType: 'student',
      detectedRole: 'student',

      // Actions
      toggleExpanded: () => {
        set((state) => ({
          isExpanded: !state.isExpanded,
          hasUnreadMessages: false, // Mark as read when opening
        }));
      },

      setExpanded: (expanded: boolean) => {
        set({ isExpanded: expanded, hasUnreadMessages: false });
      },

      setActiveRole: (role: UserRole) => {
        set({ activeRole: role });
        
        // Create new session if role changes and sidebar is expanded
        const state = get();
        if (state.isExpanded) {
          get().createSession(role);
        }
      },

      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
      },

      createSession: (role: UserRole) => {
        const newSession: CoPilotSession = {
          id: Date.now().toString(),
          title: `Session ${new Date().toLocaleDateString()}`,
          createdAt: new Date(),
          lastActivity: new Date(),
          messages: 0,
          role,
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
          hasUnreadMessages: false,
        }));
      },

      switchSession: (sessionId: string) => {
        set((state) => ({
          currentSessionId: sessionId,
          hasUnreadMessages: false,
          isExpanded: true, // Ensure sidebar is open when switching
        }));
      },

      deleteSession: (sessionId: string) => {
        set((state) => {
          const newSessions = state.sessions.filter(s => s.id !== sessionId);
          const newCurrentSessionId = state.currentSessionId === sessionId 
            ? newSessions[0]?.id || null 
            : state.currentSessionId;

          return {
            sessions: newSessions,
            currentSessionId: newCurrentSessionId,
          };
        });
      },

      markAsRead: () => {
        set({ hasUnreadMessages: false });
      },

      minimize: () => {
        set({ isMinimized: true });
      },

      maximize: () => {
        set({ isMinimized: false });
      },

      // Chat actions
      activateChatMode: () => {
        set({ isChatMode: true });
      },

      sendMessage: (message: string) => {
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          content: message,
          sender: 'user',
          timestamp: new Date(),
          status: 'sending'
        };

        set((state) => ({
          chatMessages: [...state.chatMessages, userMessage],
          isChatMode: true
        }));

        // Simulate AI response
        setTimeout(() => {
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: "I'm processing your request. How can I help you with your learning journey today?",
            sender: 'ai',
            timestamp: new Date(),
            status: 'sent'
          };

          set((state) => ({
            chatMessages: [...state.chatMessages, aiMessage]
          }));
        }, 1000);
      },

      detectDashboardType: (pathname: string) => {
        let dashboardType: 'student' | 'parent' | 'teacher' | 'admin' | 'partner' | 'staff' = 'student';
        let detectedRole: UserRole = 'student';

        if (pathname.includes('/dashboard/parent')) {
          dashboardType = 'parent';
          detectedRole = 'parent';
        } else if (pathname.includes('/dashboard/teacher') || pathname.includes('/dashboard/instructor')) {
          dashboardType = 'teacher';
          detectedRole = 'teacher';
        } else if (pathname.includes('/dashboard/admin')) {
          dashboardType = 'admin';
          detectedRole = 'admin';
        } else if (pathname.includes('/dashboard/partner')) {
          dashboardType = 'partner';
          detectedRole = 'partner';
        } else if (pathname.includes('/dashboard/staff')) {
          dashboardType = 'staff';
          detectedRole = 'staff';
        }

        set({ currentDashboardType: dashboardType, detectedRole });
      },

      resetToNormalMode: () => {
        set({ isChatMode: false });
      },

      addChatMessage: (message: ChatMessage) => {
        set((state) => ({
          chatMessages: [...state.chatMessages, message]
        }));
      },

      updateMessageStatus: (messageId: string, status: ChatMessage['status']) => {
        set((state) => ({
          chatMessages: state.chatMessages.map(msg =>
            msg.id === messageId ? { ...msg, status } : msg
          )
        }));
      },

      clearChatMessages: () => {
        set({ chatMessages: [] });
      },
    }),
    {
      name: 'co-pilot-storage',
      partialize: (state) => ({
        isExpanded: state.isExpanded,
        activeRole: state.activeRole,
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
      }),
      // Rehydrate function to convert string dates back to Date objects
      onRehydrateStorage: () => (state) => {
        if (state?.sessions) {
          state.sessions = state.sessions.map(session => ({
            ...session,
            createdAt: new Date(session.createdAt),
            lastActivity: new Date(session.lastActivity)
          }));
        }
      }
    }
  )
);

// Auto-create initial session when role is set
export const useCoPilotInit = () => {
  const { activeRole, sessions, createSession } = useCoPilotStore();
  
  React.useEffect(() => {
    if (sessions.length === 0) {
      createSession(activeRole);
    }
  }, [activeRole, sessions.length, createSession]);
};