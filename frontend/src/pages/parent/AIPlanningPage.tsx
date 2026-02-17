/**
 * AI Planning Page
 *
 * Displays topics AI is planning for the child.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import { getAIPlanning } from '../../services/parentAIService';
import type { AIPlanningResponse } from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AIPlanningPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { selectedChildId } = useParentStore();
  const effectiveChildId = childId || selectedChildId;

  const [planning, setPlanning] = useState<AIPlanningResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (effectiveChildId) {
      loadPlanning();
    } else {
      setLoading(false);
    }
  }, [effectiveChildId]);

  const loadPlanning = async () => {
    if (!effectiveChildId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getAIPlanning(effectiveChildId);
      setPlanning(data);
    } catch (error) {
      console.error('Failed to load AI planning:', error);
      setError('Failed to load AI planning data. Please try again.');
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

  if (error) {
    return (
      <>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white font-medium mb-2">Something went wrong</p>
          <p className="text-gray-500 dark:text-white/60 mb-4">{error}</p>
          <button
            onClick={loadPlanning}
            className="px-6 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
          >
            Try Again
          </button>
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

  if (!planning) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-white/60">AI planning data not available</p>
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
              <Target className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Learning Plan</h1>
              <p className="text-sm text-gray-500 dark:text-white/60">{planning.student_name}</p>
            </div>
          </div>
        </motion.div>

        {/* Learning Trajectory */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gradient-to-r from-[#E40000]/20 to-transparent border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#E40000]" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Trajectory</h2>
            </div>
            <p className="text-gray-700 dark:text-white/80 mb-2">{planning.current_trajectory}</p>
            <p className="text-sm text-gray-500 dark:text-white/60">Pacing: <span className="capitalize font-medium">{planning.pacing_level}</span></p>
          </div>
        </motion.div>

        {/* Upcoming Topics */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Topics</h3>
            <div className="space-y-4">
              {planning.upcoming_topics.map((topic, i) => (
                <div key={i} className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{topic.topic}</h4>
                      <p className="text-xs text-gray-500 dark:text-white/60 mb-2">{topic.subject}</p>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-white/40">{topic.estimated_weeks} weeks</div>
                  </div>

                  {topic.learning_objectives.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 dark:text-white/80 mb-1">Learning Objectives:</p>
                      <ul className="space-y-1">
                        {topic.learning_objectives.map((obj, j) => (
                          <li key={j} className="text-xs text-gray-500 dark:text-white/60 flex items-start gap-2">
                            <span className="text-[#E40000] mt-0.5">→</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.prerequisites.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-white/80 mb-1">Prerequisites:</p>
                      <div className="flex flex-wrap gap-1">
                        {topic.prerequisites.map((prereq, j) => (
                          <span
                            key={j}
                            className="px-2 py-0.5 bg-blue-500/20 text-blue-500 text-xs rounded"
                          >
                            {prereq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* AI Rationale */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Why This Plan?</h3>
            <p className="text-gray-700 dark:text-white/80">{planning.ai_rationale}</p>
          </div>
        </motion.div>

        {/* Parent Involvement Opportunities */}
        {planning.parent_involvement_opportunities.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">How You Can Help</h3>
              </div>
              <div className="space-y-3">
                {planning.parent_involvement_opportunities.map((opp, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4">
                    <p className="text-sm text-gray-700 dark:text-white/80">{opp}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default AIPlanningPage;
