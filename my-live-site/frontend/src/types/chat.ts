export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  avatarExpression?: BirdExpression;
  audioUrl?: string;
  videoUrl?: string;
}

export type BirdExpression = 'happy' | 'thinking' | 'excited' | 'listening';

export interface ChatState {
  messages: ChatMessage[];
  isRecording: boolean;
  isTyping: boolean;
  birdExpression: BirdExpression;
  currentInput: string;
}

export interface QuickAction {
  id: string;
  title: string;
  emoji: string;
  description: string;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  emoji: string;
  lastMessage: Date;
}