/**
 * AI Learning Style Page
 *
 * Displays learning style analysis and recommendations.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Eye, Ear, Hand, ArrowLeft, Lightbulb, Users } from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import { getLearningStyleAnalysis } from '../../services/parentAIService';
import type { LearningStyleAnalysis } from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AILearningStylePage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { selectedChildId } = useParentStore();
  const effectiveChildId = childId || selectedChildId;

  const [analysis, setAnalysis] = useState<LearningStyleAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (effectiveChildId) {
      loadAnalysis();
    } else {
      setLoading(false);
    }
  }, [effectiveChildId]);

  const loadAnalysis = async () => {
    if (!effectiveChildId) return;

    try {
      setLoading(true);
      const data = await getLearningStyleAnalysis(effectiveChildId);
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to load learning style analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStyleIcon = (style: string) => {
    switch (style.toLowerCase()) {
      case 'visual':
        return <Eye className="w-6 h-6" />;
      case 'auditory':
        return <Ear className="w-6 h-6" />;
      case 'kinesthetic':
        return <Hand className="w-6 h-6" />;
      default:
        return <Brain className="w-6 h-6" />;
    }
  };

  const getStyleColor = (style: string) => {
    switch (style.toLowerCase()) {
      case 'visual':
        return 'from-blue-500 to-cyan-500';
      case 'auditory':
        return 'from-purple-500 to-pink-500';
      case 'kinesthetic':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-[#E40000] to-[#FF0000]';
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
          <p className="text-gray-500 dark:text-white/60 mb-2">Select a child to view learning style</p>
          <p className="text-sm text-gray-400 dark:text-white/40 mb-4">Use the child selector in the sidebar</p>
          <button onClick={() => navigate('/dashboard/parent/children')} className="px-6 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors">View Children</button>
        </div>
      </>
    );
  }

  if (!analysis) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-white/60">Learning style analysis not available</p>
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
              <Brain className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Style Analysis</h1>
              <p className="text-sm text-gray-500 dark:text-white/60">{analysis.student_name}</p>
            </div>
          </div>
        </motion.div>

        {/* Primary Learning Style */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className={`bg-gradient-to-r ${getStyleColor(analysis.primary_style)} rounded-xl p-6 text-gray-900 dark:text-white`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-white/20 rounded-full flex items-center justify-center">
                {getStyleIcon(analysis.primary_style)}
              </div>
              <div>
                <p className="text-sm opacity-90">Primary Learning Style</p>
                <p className="text-3xl font-bold capitalize">{analysis.primary_style}</p>
              </div>
            </div>
            <p className="text-gray-800 dark:text-white/90">{analysis.style_description}</p>
          </div>
        </motion.div>

        {/* Learning Traits */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Traits</h3>
            <div className="space-y-4">
              {analysis.learning_traits.map((trait, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{trait.trait_name}</span>
                    <span className="text-sm font-bold text-[#E40000]">{trait.score.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-[#22272B] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#E40000] to-[#FF0000] h-2 rounded-full transition-all"
                      style={{ width: `${trait.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Preferred Activities & Optimal Learning Times */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preferred Activities */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferred Activities</h3>
              <ul className="space-y-2">
                {analysis.preferred_activities.map((activity, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-white/80">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Optimal Learning Times */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Best Learning Times</h3>
              <ul className="space-y-2">
                {analysis.optimal_learning_times.map((time, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-white/80">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Recommendations for Parents */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recommendations for You</h3>
            </div>
            <div className="space-y-3">
              {analysis.recommendations_for_parents.map((rec, i) => (
                <div key={i} className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-white/80">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AILearningStylePage;
