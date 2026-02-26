import { create } from 'zustand';
import { ChatMessage, ChatState, BirdExpression } from '../types/chat';

interface SessionState {
  sessionStartTime: number | null;
  sessionMinutes: number;
  isOnBreak: boolean;
  pomodoroCount: number;
  dailyMinutesUsed: number;
  dailyLimitMinutes: number;
}

interface ChatStore extends ChatState, SessionState {
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateCurrentInput: (input: string) => void;
  setIsRecording: (isRecording: boolean) => void;
  setIsTyping: (isTyping: boolean) => void;
  setBirdExpression: (expression: BirdExpression) => void;
  clearChat: () => void;
  loadChatHistory: (messages: ChatMessage[]) => void;
  // Session tracking
  startSession: () => void;
  pauseForBreak: () => void;
  resumeSession: () => void;
  updateSessionStats: (stats: { minutes_used: number; daily_limit_minutes: number; pomodoro_completed: number }) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isRecording: false,
  isTyping: false,
  birdExpression: 'happy',
  currentInput: '',

  // Session tracking state
  sessionStartTime: null,
  sessionMinutes: 0,
  isOnBreak: false,
  pomodoroCount: 0,
  dailyMinutesUsed: 0,
  dailyLimitMinutes: 120,

  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
      currentInput: '',
    }));
  },

  updateCurrentInput: (input) => {
    set({ currentInput: input });
  },

  setIsRecording: (isRecording) => {
    set({ isRecording });
  },

  setIsTyping: (isTyping) => {
    set({ isTyping });
  },

  setBirdExpression: (expression) => {
    set({ birdExpression: expression });
  },

  clearChat: () => {
    set({
      messages: [],
      currentInput: '',
      birdExpression: 'happy',
    });
  },

  loadChatHistory: (messages) => {
    set({ messages });
  },

  startSession: () => {
    set({ sessionStartTime: Date.now(), isOnBreak: false });
  },

  pauseForBreak: () => {
    set((state) => ({
      isOnBreak: true,
      sessionMinutes: state.sessionStartTime
        ? Math.floor((Date.now() - state.sessionStartTime) / 60000)
        : state.sessionMinutes,
    }));
  },

  resumeSession: () => {
    set({ isOnBreak: false, sessionStartTime: Date.now() });
  },

  updateSessionStats: (stats) => {
    set({
      dailyMinutesUsed: stats.minutes_used,
      dailyLimitMinutes: stats.daily_limit_minutes,
      pomodoroCount: stats.pomodoro_completed,
    });
  },
}));