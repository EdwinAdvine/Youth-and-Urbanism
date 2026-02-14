/**
 * AI Insights Page
 *
 * Displays AI tutor summary and insights for selected child.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bot, TrendingUp, AlertCircle, Lightbulb, MessageSquare,
  BookOpen, Brain, Target, Users
} from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import { getAITutorSummary } from '../../services/parentAIService';
import type { AITutorSummary } from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AIInsightsPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { selectedChildId } = useParentStore();
  const effectiveChildId = childId || selectedChildId;

  const [summary, setSummary] = useState<AITutorSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (effectiveChildId) {
      loadSummary();
    } else {
      setLoading(false);
    }
  }, [effectiveChildId]);

  const loadSummary = async () => {
    if (!effectiveChildId) return;

    try {
      setLoading(true);
      const data = await getAITutorSummary(effectiveChildId);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load AI tutor summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-red-500';
      default:
        return 'text-gray-500 dark:text-white/60';
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
        </div>
      </>
    );
  }

  if (!effectiveChildId) {
    return (
      <>
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 dark:text-white/30 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60 mb-2">Select a child to view AI insights</p>
          <p className="text-sm text-gray-400 dark:text-white/40 mb-4">Use the child selector in the sidebar</p>
          <button
            onClick={() => navigate('/dashboard/parent/children')}
            className="px-6 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
          >
            View Children
          </button>
        </div>
      </>
    );
  }

  if (!summary) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-white/60">AI insights not available</p>
          <button
            onClick={() => navigate('/dashboard/parent/children')}
            className="mt-4 px-6 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
          >
            Back to Children
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Companion Insights</h1>
              <p className="text-sm text-gray-500 dark:text-white/60">{summary.student_name}</p>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Total Interactions */}
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-gray-500 dark:text-white/60">Total Interactions</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{summary.total_interactions}</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">with {summary.ai_tutor_name}</p>
          </div>

          {/* Engagement Level */}
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm text-gray-500 dark:text-white/60">Engagement</span>
            </div>
            <p className={`text-3xl font-bold capitalize ${getEngagementColor(summary.engagement_level)}`}>
              {summary.engagement_level}
            </p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Current level</p>
          </div>

          {/* Progress Rate */}
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm text-gray-500 dark:text-white/60">Progress Rate</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{(summary.progress_rate * 100).toFixed(0)}%</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Completion rate</p>
          </div>
        </motion.div>

        {/* AI Summary */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gradient-to-r from-[#E40000]/20 to-transparent border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-[#E40000]" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Summary</h2>
            </div>
            <p className="text-gray-700 dark:text-white/80 mb-4">{summary.parent_friendly_explanation}</p>
            {summary.summary && (
              <p className="text-sm text-gray-500 dark:text-white/60 italic">{summary.summary}</p>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {summary.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-white/80">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Areas for Improvement */}
          {summary.areas_for_improvement && summary.areas_for_improvement.length > 0 && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Growth Opportunities</h3>
                </div>
                <ul className="space-y-2">
                  {summary.areas_for_improvement.map((area, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-white/80">
                      <span className="text-orange-500 mt-0.5">→</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        {/* Recent Conversations */}
        {summary.recent_conversations.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Conversations</h3>
              </div>
              <div className="space-y-4">
                {summary.recent_conversations.map((conv, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{conv.topic}</span>
                      <span className="text-xs text-gray-400 dark:text-white/40">
                        {new Date(conv.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-white/60 mb-2">{conv.summary}</p>
                    {conv.key_insights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {conv.key_insights.map((insight, j) => (
                          <span
                            key={j}
                            className="px-2 py-1 bg-[#E40000]/20 text-[#E40000] text-xs rounded"
                          >
                            {insight}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Links */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate(`/dashboard/parent/ai/learning-style/${effectiveChildId}`)}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-[#22272B] transition-colors text-left"
            >
              <Brain className="w-5 h-5 text-[#E40000] mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Learning Style</p>
              <p className="text-xs text-gray-400 dark:text-white/40">Analysis</p>
            </button>

            <button
              onClick={() => navigate(`/dashboard/parent/ai/support-tips/${effectiveChildId}`)}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-[#22272B] transition-colors text-left"
            >
              <Lightbulb className="w-5 h-5 text-yellow-500 mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Support Tips</p>
              <p className="text-xs text-gray-400 dark:text-white/40">For home</p>
            </button>

            <button
              onClick={() => navigate(`/dashboard/parent/ai/planning/${effectiveChildId}`)}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-[#22272B] transition-colors text-left"
            >
              <Target className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">AI Planning</p>
              <p className="text-xs text-gray-400 dark:text-white/40">Upcoming topics</p>
            </button>

            <button
              onClick={() => navigate(`/dashboard/parent/ai/patterns/${effectiveChildId}`)}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-[#22272B] transition-colors text-left"
            >
              <MessageSquare className="w-5 h-5 text-purple-500 mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Curiosity Patterns</p>
              <p className="text-xs text-gray-400 dark:text-white/40">Analysis</p>
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AIInsightsPage;
