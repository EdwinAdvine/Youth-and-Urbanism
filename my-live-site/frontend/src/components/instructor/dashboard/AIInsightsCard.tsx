import React from 'react';
import { Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DailyInsight {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  title: string;
  description: string;
  action_url: string;
}

interface AIInsightsCardProps {
  insights: DailyInsight[];
}

const priorityColors = {
  urgent: 'bg-red-500/20 text-red-300 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  medium: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  low: 'bg-gray-500/20 text-gray-400 dark:text-gray-300 border-gray-500/30',
};

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ insights }) => {
  const navigate = useNavigate();

  // Show top 3 insights
  const topInsights = insights.slice(0, 3);

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Daily Insights</h3>
            <p className="text-xs text-gray-500 dark:text-white/60">Powered by AI</p>
          </div>
        </div>
        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full">
          {insights.length}
        </span>
      </div>

      {topInsights.length === 0 ? (
        <div className="text-center py-6">
          <AlertCircle className="w-10 h-10 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-2" />
          <p className="text-gray-400 dark:text-gray-300 dark:text-white/40 text-sm">No insights available yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topInsights.map((insight, index) => (
            <div
              key={index}
              onClick={() => navigate(insight.action_url)}
              className="p-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg border border-gray-100 dark:border-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${
                    priorityColors[insight.priority]
                  } border`}
                >
                  {insight.priority}
                </span>
                <div className="flex-1">
                  <h4 className="text-gray-900 dark:text-white font-medium text-sm mb-1">{insight.title}</h4>
                  <p className="text-gray-500 dark:text-white/60 text-xs">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {insights.length > 3 && (
        <button
          onClick={() => navigate('/dashboard/instructor/insights')}
          className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          View All Insights
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
