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
 * Update an existing journal entry
 */
export const updateJournalEntry = async (
  entryId: string,
  data: { content: string; mood_tag?: MoodType }
): Promise<{
  id: string;
  content: string;
  mood_tag: string | null;
  ai_insights: any;
  updated_at: Date;
  message: string;
}> => {
  const response = await apiClient.put(`${API_PREFIX}/journal/${entryId}`, data);
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
 * Get teachers available to receive questions from this student
 */
export const getAvailableTeachers = async (): Promise<Array<{
  id: string;
  name: string;
  role: 'class_teacher' | 'subject_head';
  subject: string | null;
  label: string;
}>> => {
  const response = await apiClient.get(`${API_PREFIX}/available-teachers`);
  return response.data;
};

/**
 * Get all teacher Q&A threads for this student (pending + answered)
 */
export const getTeacherQuestions = async (): Promise<Array<{
  id: string;
  question: string;
  ai_summary: string | null;
  answer: string | null;
  teacher_name: string;
  status: 'pending' | 'answered';
  created_at: string;
  answered_at: string | null;
}>> => {
  const response = await apiClient.get(`${API_PREFIX}/teacher-questions`);
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

/**
 * Get the student's AI tutor identity information (name, AIT code, stats)
 */
export const getTutorInfo = async (): Promise<{
  tutor_name: string;
  ait_code: string | null;
  response_mode: string;
  total_interactions: number;
  last_interaction: Date | null;
  admission_number: string;
  grade_level: string;
}> => {
  const response = await apiClient.get(`${API_PREFIX}/tutor-info`);
  return response.data;
};

/**
 * Get AI learning plan combined with mastery progress data
 */
export const getPlanWithProgress = async (): Promise<{
  progress_status: 'ahead' | 'on_track' | 'catching_up';
  mastered_count: number;
  total_topics: number;
  catch_up_topics: Array<{ topic: string; subject: string; mastery_level: number }>;
  learning_path: { learning_path: string; generated_at: Date; student_grade: string };
  generated_at: Date;
}> => {
  const response = await apiClient.get(`${API_PREFIX}/plan-with-progress`);
  return response.data;
};

/**
 * Chat with AI tutor — extended version with optional screen context
 */
export const chatWithAIExtended = async (data: {
  message: string;
  conversation_history?: Array<{ role: string; content: string }>;
  screen_context?: string;
}): Promise<{
  message: string;
  ait_code: string | null;
  tutor_name: string;
  conversation_id: string;
  provider: string;
  timestamp: Date;
}> => {
  const response = await apiClient.post(`${API_PREFIX}/chat`, data);
  return response.data;
};
