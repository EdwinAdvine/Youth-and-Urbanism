import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle, ArrowRight, Filter } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface DailyInsight {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  title: string;
  description: string;
  action_url: string;
  ai_rationale: string;
}

interface InsightData {
  id: string;
  insight_date: string;
  insights: DailyInsight[];
  generated_at: string;
  ai_model_used: string;
}

const priorityColors = {
  urgent: 'bg-red-500/20 text-red-300 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  medium: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  low: 'bg-gray-500/20 text-gray-400 dark:text-gray-300 border-gray-500/30',
};

const categoryIcons: { [key: string]: string } = {
  submissions: '📝',
  sessions: '🎥',
  students: '👥',
  earnings: '💰',
  content: '📚',
  engagement: '📊',
};

export const AIInsightsPage: React.FC = () => {
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${API_URL}/api/v1/instructor/insights/daily`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // For demo, use mock data if API fails
      if (!response.data) {
        setInsightData({
          id: '1',
          insight_date: new Date().toISOString().split('T')[0],
          insights: [
            {
              priority: 'high',
              category: 'submissions',
              title: 'Grade pending assignments',
              description: '5 submissions are waiting for your feedback',
              action_url: '/dashboard/instructor/submissions',
              ai_rationale: 'These assignments have been pending for over 48 hours',
            },
            {
              priority: 'medium',
              category: 'engagement',
              title: 'Check student progress',
              description: '3 students showing declining engagement',
              action_url: '/dashboard/instructor/students/progress',
              ai_rationale: 'Early intervention can improve outcomes',
            },
            {
              priority: 'low',
              category: 'content',
              title: 'Update course materials',
              description: 'Course "Math 101" could use fresh examples',
              action_url: '/dashboard/instructor/courses/math-101',
              ai_rationale: 'Student feedback suggests content is outdated',
            },
          ],
          generated_at: new Date().toISOString(),
          ai_model_used: 'gemini-pro',
        });
      } else {
        setInsightData(response.data);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      // Use mock data on error
      setInsightData({
        id: '1',
        insight_date: new Date().toISOString().split('T')[0],
        insights: [],
        generated_at: new Date().toISOString(),
        ai_model_used: 'gemini-pro',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!insightData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/60">Failed to load insights</p>
      </div>
    );
  }

  const filteredInsights =
    filterPriority === 'all'
      ? insightData.insights
      : insightData.insights.filter((i) => i.priority === filterPriority);

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="AI Daily Insights"
        description={`Powered by ${insightData.ai_model_used} • Generated ${format(
          new Date(insightData.generated_at),
          'MMM d, yyyy'
        )}`}
        badge="AI Powered"
        icon={<Sparkles className="w-6 h-6 text-purple-400" />}
      />

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-5 h-5 text-gray-500 dark:text-white/60" />
        <span className="text-sm text-gray-500 dark:text-white/60">Priority:</span>
        {['all', 'urgent', 'high', 'medium', 'low'].map((priority) => (
          <button
            key={priority}
            onClick={() => setFilterPriority(priority)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              filterPriority === priority
                ? 'bg-purple-500 text-gray-900 dark:text-white'
                : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
          >
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </button>
        ))}
      </div>

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-400/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">All Caught Up!</h3>
          <p className="text-gray-500 dark:text-white/60">No insights for this priority level.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInsights.map((insight, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{categoryIcons[insight.category] || '📋'}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        priorityColors[insight.priority]
                      } border`}
                    >
                      {insight.priority}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">{insight.category}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{insight.title}</h3>
                  <p className="text-gray-600 dark:text-white/70 mb-3">{insight.description}</p>
                  <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-white/5 rounded-lg mb-4">
                    <Sparkles className="w-4 h-4 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40 mb-1">AI Rationale</p>
                      <p className="text-sm text-gray-500 dark:text-white/60">{insight.ai_rationale}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(insight.action_url)}
                    className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Take Action
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
