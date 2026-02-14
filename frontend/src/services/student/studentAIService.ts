/**
 * Student AI Tutor Service - API calls for AI interactions
 */
import axios from 'axios';
import type { MoodType, JournalEntry } from '../../types/student';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/chat`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
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
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/learning-path`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Get journal entries
 */
export const getJournalEntries = async (limit: number = 10): Promise<JournalEntry[]> => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/journal?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
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
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/journal`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
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
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/explain`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
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
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/teacher-question`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
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
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE}${API_PREFIX}/teacher-responses`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
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
  const token = localStorage.getItem('access_token');
  const response = await axios.post(`${API_BASE}${API_PREFIX}/voice`, { text }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
