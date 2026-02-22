/**
 * AI CoPilot sidebar store (upgraded for full multi-role support).
 *
 * Controls the collapsible CoPilot panel that appears on every dashboard.
 * Manages sessions, chat messages, agent profiles, insights, streaming responses,
 * and role-based context detection for all 6 user roles.
 *
 * NEW FEATURES:
 * - Agent profile management (custom name, persona, avatar)
 * - Role-specific contextual insights
 * - Real-time SSE streaming for AI responses
 * - Voice response mode
 * - Automatic role synchronization from auth state
 * - Integration with new CoPilot backend API
 *
 * Persisted fields (localStorage key "co-pilot-storage"):
 *  - isExpanded, activeRole, sessions, currentSessionId, agentProfile
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import React from 'react';
import copilotService, {
  CopilotChatRequest,
  CopilotChatResponse,
  CopilotInsight,
} from '../services/copilotService';

/** Supported user roles (standardized to 'instructor', not 'teacher'). */
export type UserRole = 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff';

/** Represents a single CoPilot conversation session. */
export interface CoPilotSession {
  id: string;
  title: string;
  createdAt: Date;
  lastActivity: Date;
  messages: number;
  role: UserRole;
}

/** A single chat message exchanged between the user and the AI CoPilot. */
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  audio_url?: string | null;
  /** Round-trip latency in ms (AI messages only) */
  response_time_ms?: number;
}

/** Agent profile summary (cached from backend). */
export interface AgentProfile {
  agent_name: string;
  avatar_url: string | null;
}

/** Full state shape and actions for the CoPilot sidebar store. */
export interface CoPilotState {
  // Core state
  isExpanded: boolean;
  activeRole: UserRole;
  isOnline: boolean;

  // Agent profile
  agentProfile: AgentProfile | null;

  // Insights
  insights: CopilotInsight[];

  // Pending AI prompt (from quick actions)
  pendingAiPrompt: string | null;

  // Response mode
  responseMode: 'text' | 'voice';

  // Sessions
  sessions: CoPilotSession[];
  currentSessionId: string | null;

  // UI state
  isMinimized: boolean;
  hasUnreadMessages: boolean;

  // Chat state
  isChatMode: boolean;
  chatMessages: ChatMessage[];
  currentDashboardType: 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff';
  detectedRole: UserRole;

  // Streaming state
  isStreaming: boolean;
  streamingContent: string;
  isAiTyping: boolean;

  // Actions
  toggleExpanded: () => void;
  setExpanded: (expanded: boolean) => void;
  setActiveRole: (role: UserRole) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  createSession: (role: UserRole) => string;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  markAsRead: () => void;
  minimize: () => void;
  maximize: () => void;

  // Agent profile actions
  setAgentProfile: (profile: AgentProfile | null) => void;

  // Insights actions
  setInsights: (insights: CopilotInsight[]) => void;

  // Pending AI prompt actions
  setPendingAiPrompt: (prompt: string | null) => void;

  // Response mode actions
  setResponseMode: (mode: 'text' | 'voice') => void;

  // Role sync actions
  syncRoleFromAuth: (authRole: string) => void;

  // Chat actions
  activateChatMode: () => void;
  sendMessage: (message: string) => Promise<void>;
  detectDashboardType: (pathname: string) => void;
  resetToNormalMode: () => void;
  addChatMessage: (message: ChatMessage) => void;
  updateMessageStatus: (messageId: string, status: ChatMessage['status']) => void;
  clearChatMessages: () => void;

  // Streaming actions
  startStreaming: () => void;
  appendStreamToken: (token: string) => void;
  finishStreaming: (response: CopilotChatResponse) => void;
}

export const useCoPilotStore = create<CoPilotState>()(
  persist(
    (set, get) => ({
      // Initial state
      isExpanded: false,
      activeRole: 'student',
      isOnline: navigator.onLine,
      agentProfile: null,
      insights: [],
      pendingAiPrompt: null,
      responseMode: 'text',
      sessions: [],
      currentSessionId: null,
      isMinimized: false,
      hasUnreadMessages: false,
      isChatMode: false,
      chatMessages: [],
      currentDashboardType: 'student',
      detectedRole: 'student',
      isStreaming: false,
      streamingContent: '',
      isAiTyping: false,

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

      setAgentProfile: (profile: AgentProfile | null) => {
        set({ agentProfile: profile });
      },

      setInsights: (insights: CopilotInsight[]) => {
        set({ insights });
      },

      setPendingAiPrompt: (prompt: string | null) => {
        set({ pendingAiPrompt: prompt });
      },

      setResponseMode: (mode: 'text' | 'voice') => {
        set({ responseMode: mode });
      },

      syncRoleFromAuth: (authRole: string) => {
        // Map auth role to CoPilot role (standardize 'teacher' -> 'instructor')
        const normalizedRole =
          authRole === 'teacher' ? 'instructor' :
          ['student', 'parent', 'instructor', 'admin', 'partner', 'staff'].includes(authRole)
            ? (authRole as UserRole)
            : 'student';

        const currentRole = get().activeRole;
        if (normalizedRole !== currentRole) {
          set({ activeRole: normalizedRole });
        }
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

        return newSession.id;
      },

      switchSession: (sessionId: string) => {
        set(() => ({
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

      sendMessage: async (message: string) => {
        const { currentSessionId, responseMode, pendingAiPrompt, activeRole: _activeRole } = get();

        // Use pending AI prompt if available
        const effectiveMessage = pendingAiPrompt
          ? `${pendingAiPrompt}\n\nUser question: ${message}`
          : message;

        // Clear pending prompt after using it
        if (pendingAiPrompt) {
          set({ pendingAiPrompt: null });
        }

        // Create user message
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          content: message,
          sender: 'user',
          timestamp: new Date(),
          status: 'sending'
        };

        set((state) => ({
          chatMessages: [...state.chatMessages, userMessage],
          isChatMode: true,
          isAiTyping: true
        }));

        const requestStartMs = Date.now();

        try {
          // Only send session_id if it's a backend UUID (contains dashes),
          // not a local store ID (numeric timestamp from Date.now())
          const isBackendSessionId = currentSessionId && currentSessionId.includes('-');
          const sessionId = isBackendSessionId ? currentSessionId : null;

          // Build chat request
          const request: CopilotChatRequest = {
            message: effectiveMessage,
            session_id: sessionId,
            response_mode: responseMode,
            include_context: true,
            context_messages: 10
          };

          // Call backend
          const response = await copilotService.chat(request);

          // Store the backend-assigned session ID for subsequent messages
          if (response.session_id) {
            set({ currentSessionId: response.session_id });
          }

          // Add AI response to chat
          const aiMessage: ChatMessage = {
            id: response.message_id,
            content: response.message,
            sender: 'ai',
            timestamp: new Date(response.timestamp),
            status: 'sent',
            audio_url: response.audio_url,
            response_time_ms: Date.now() - requestStartMs
          };

          set((state) => ({
            chatMessages: [...state.chatMessages, aiMessage],
            isAiTyping: false
          }));

          // Update user message status
          get().updateMessageStatus(userMessage.id, 'sent');

        } catch (error: any) {
          console.error('Failed to send message:', error);

          // Add error message
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: "I'm having trouble connecting to the AI service. Please try again later.",
            sender: 'ai',
            timestamp: new Date(),
            status: 'sent'
          };

          set((state) => ({
            chatMessages: [...state.chatMessages, errorMessage],
            isAiTyping: false
          }));
        }
      },

      detectDashboardType: (pathname: string) => {
        let dashboardType: 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff' = 'student';
        let detectedRole: UserRole = 'student';

        if (pathname.includes('/dashboard/parent')) {
          dashboardType = 'parent';
          detectedRole = 'parent';
        } else if (pathname.includes('/dashboard/teacher') || pathname.includes('/dashboard/instructor')) {
          dashboardType = 'instructor';
          detectedRole = 'instructor';
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

      // Streaming actions
      startStreaming: () => {
        set({ isStreaming: true, streamingContent: '', isAiTyping: true });
      },

      appendStreamToken: (token: string) => {
        set((state) => ({
          streamingContent: state.streamingContent + token
        }));
      },

      finishStreaming: (response: CopilotChatResponse) => {
        const aiMessage: ChatMessage = {
          id: response.message_id,
          content: response.message,
          sender: 'ai',
          timestamp: new Date(response.timestamp),
          status: 'sent',
          audio_url: response.audio_url,
        };

        set((state) => ({
          chatMessages: [...state.chatMessages, aiMessage],
          isStreaming: false,
          streamingContent: '',
          isAiTyping: false
        }));
      },
    }),
    {
      name: 'co-pilot-storage',
      partialize: (state) => ({
        isExpanded: state.isExpanded,
        activeRole: state.activeRole,
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        agentProfile: state.agentProfile,
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
