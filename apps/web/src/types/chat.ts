export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  avatarExpression?: BirdExpression;
  audioUrl?: string;
  /** Round-trip latency in ms (AI messages only) */
  response_time_ms?: number;
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