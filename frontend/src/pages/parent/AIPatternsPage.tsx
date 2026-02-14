/**
 * AI Curiosity Patterns Page
 *
 * Displays child's curiosity patterns and question analysis.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, MessageCircle, TrendingUp, Lightbulb, Users, } from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import { getCuriosityPatterns } from '../../services/parentAIService';
import type { CuriosityPatternsResponse } from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AIPatternsPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { selectedChildId } = useParentStore();
  const effectiveChildId = childId || selectedChildId;

  const [patterns, setPatterns] = useState<CuriosityPatternsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (effectiveChildId) {
      loadPatterns();
    } else {
      setLoading(false);
    }
  }, [effectiveChildId]);

  const loadPatterns = async () => {
    if (!effectiveChildId) return;

    try {
      setLoading(true);
      const data = await getCuriosityPatterns(effectiveChildId);
      setPatterns(data);
    } catch (error) {
      console.error('Failed to load curiosity patterns:', error);
    } finally {
      setLoading(false);
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
          <p className="text-gray-500 dark:text-white/60 mb-2">Select a child to view this page</p>
          <p className="text-sm text-gray-400 dark:text-white/40 mb-4">Use the child selector in the sidebar</p>
          <button onClick={() => navigate('/dashboard/parent/children')} className="px-6 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors">View Children</button>
        </div>
      </>
    );
  }

  if (!patterns) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-white/60">Curiosity patterns not available</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/dashboard/parent/ai/summary/${effectiveChildId}`)}
          className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to AI Insights</span>
        </button>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Curiosity Patterns</h1>
              <p className="text-sm text-gray-500 dark:text-white/60">{patterns.student_name}</p>
            </div>
          </div>
        </motion.div>

        {/* Identified Patterns */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gradient-to-r from-[#E40000]/20 to-transparent border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#E40000]" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Key Patterns</h2>
            </div>
            <div className="space-y-2">
              {patterns.patterns_identified.map((pattern, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#E40000] mt-1">•</span>
                  <p className="text-gray-700 dark:text-white/80">{pattern}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Interest Areas */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interest Areas</h3>
            <div className="space-y-4">
              {patterns.interest_areas.map((area, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{area.topic}</span>
                    <span className="text-sm font-bold text-[#E40000]">
                      {area.engagement_score.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-[#22272B] rounded-full h-2 mb-1">
                    <div
                      className="bg-gradient-to-r from-[#E40000] to-[#FF0000] h-2 rounded-full transition-all"
                      style={{ width: `${area.engagement_score}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white/60">{area.question_count} questions asked</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Question Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Common Question Types */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Question Types</h3>
              </div>
              <div className="space-y-3">
                {patterns.common_question_types.map((type, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{type.type}</p>
                    <p className="text-xs text-gray-500 dark:text-white/60">{type.example}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Complexity Trend */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Complexity Trend</h3>
              </div>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-gray-900 dark:text-white capitalize mb-1">
                  {patterns.complexity_trend}
                </p>
                <p className="text-sm text-gray-500 dark:text-white/60">Question complexity over time</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-white/70">
                {patterns.complexity_trend === 'increasing'
                  ? 'Your child is asking progressively more complex questions, showing deeper engagement with topics.'
                  : patterns.complexity_trend === 'stable'
                  ? 'Your child maintains a consistent level of question complexity.'
                  : 'Questions are becoming simpler - this may indicate a need for more challenge or review of fundamentals.'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Nurturing Suggestions */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">How to Nurture Curiosity</h3>
            </div>
            <div className="space-y-3">
              {patterns.nurturing_suggestions.map((suggestion, i) => (
                <div key={i} className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-white/80">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AIPatternsPage;
