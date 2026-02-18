/**
 * Student AI Tutor Service - API calls for AI interactions
 */
import apiClient from '../api';
import type { MoodType, JournalEntry } from '../../types/student';

const API_PREFIX = '/api/v1/student/ai';

/**
 * Chat with AI tutor
 */
export const chatWithAI = async (data: {
  message: string;
  conversation_history?: Array<{ role: string; content: string }>;
}): Promise<{
  message: string;
  conversation_id: string;
  provider: string;
  timestamp: Date;
}> => {
  const response = await apiClient.post(`${API_PREFIX}/chat`, data);
  return response.data;
};

/**
 * Get AI-generated learning path
 */
export const getLearningPath = async (): Promise<{
  learning_path: string;
  generated_at: Date;
  student_grade: number;
}> => {
  const response = await apiClient.get(`${API_PREFIX}/learning-path`);
  return response.data;
};

/**
 * Get journal entries
 */
export const getJournalEntries = async (limit: number = 10): Promise<JournalEntry[]> => {
  const response = await apiClient.get(`${API_PREFIX}/journal?limit=${limit}`);
  return response.data;
};

/**
 * Create journal entry
 */
export const createJournalEntry = async (data: {
  content: string;
  mood_tag?: MoodType;
}): Promise<{
  id: string;
  content: string;
  mood_tag: string | null;
  ai_insights: any;
  created_at: Date;
  message: string;
}> => {
  const response = await apiClient.post(`${API_PREFIX}/journal`, data);
  return response.data;
};

/**
 * Get AI explanation of a concept
 */
export const explainConcept = async (data: {
  concept: string;
  context?: string;
}): Promise<{
  explanation: string;
  concept: string;
  grade_level: number;
  timestamp: Date;
}> => {
  const response = await apiClient.post(`${API_PREFIX}/explain`, data);
  return response.data;
};

/**
 * Send question to teacher
 */
export const sendTeacherQuestion = async (data: {
  teacher_id: string;
  question: string;
}): Promise<{
  id: string;
  question: string;
  ai_summary: string;
  created_at: Date;
  message: string;
}> => {
  const response = await apiClient.post(`${API_PREFIX}/teacher-question`, data);
  return response.data;
};

/**
 * Get teacher responses
 */
export const getTeacherResponses = async (): Promise<Array<{
  id: string;
  question: string;
  question_summary: string;
  answer: string;
  answered_at: Date;
  is_public: boolean;
}>> => {
  const response = await apiClient.get(`${API_PREFIX}/teacher-responses`);
  return response.data;
};

/**
 * Generate voice response using TTS
 */
export const generateVoiceResponse = async (text: string): Promise<{
  audio_url: string | null;
  text: string;
  voice_id: string;
  timestamp: Date;
  message: string;
}> => {
  const response = await apiClient.post(`${API_PREFIX}/voice`, { text });
  return response.data;
};
