import { create } from 'zustand';
import { ChatMessage, ChatState, BirdExpression } from '../types/chat';

interface ChatStore extends ChatState {
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateCurrentInput: (input: string) => void;
  setIsRecording: (isRecording: boolean) => void;
  setIsTyping: (isTyping: boolean) => void;
  setBirdExpression: (expression: BirdExpression) => void;
  clearChat: () => void;
  loadChatHistory: (messages: ChatMessage[]) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isRecording: false,
  isTyping: false,
  birdExpression: 'happy',
  currentInput: '',

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
}));