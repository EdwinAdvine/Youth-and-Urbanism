import api from '@/services/api';

export interface DiscussionStarter {
  topic: string;
  question: string;
  context: string;
}

export interface OfflineActivity {
  activity: string;
  description: string;
  materials_needed: string;
}

export interface WeeklySummary {
  id: string;
  week_start: string;
  week_end: string;
  summary_text: string;
  discussion_starters: DiscussionStarter[];
  offline_activities: OfflineActivity[];
  confidence_trend: 'improving' | 'stable' | 'declining';
  metrics: {
    topics_covered?: number;
    subjects?: string[];
    newly_mastered?: string[];
    total_minutes?: number;
    total_messages?: number;
    mood_trend?: string[];
  };
  created_at: string;
}

const weeklySummaryService = {
  /**
   * Get recent weekly summaries for a child.
   */
  async getSummaries(childId: string, limit = 4): Promise<WeeklySummary[]> {
    const response = await api.get(`/parent/weekly-summary/${childId}`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Generate a new weekly summary for a child.
   */
  async generateSummary(childId: string): Promise<WeeklySummary> {
    const response = await api.post(`/parent/weekly-summary/${childId}/generate`);
    return response.data;
  },
};

export default weeklySummaryService;
