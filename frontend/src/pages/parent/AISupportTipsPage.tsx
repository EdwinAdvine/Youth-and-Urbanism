/**
 * AI Support Tips Page
 *
 * Displays practical home support tips for parents.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Heart, Lightbulb, Zap,
  Star, ExternalLink,
  Users } from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import { getSupportTips } from '../../services/parentAIService';
import type { SupportTipsResponse } from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AISupportTipsPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { selectedChildId } = useParentStore();
  const effectiveChildId = childId || selectedChildId;

  const [tips, setTips] = useState<SupportTipsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (effectiveChildId) {
      loadTips();
    } else {
      setLoading(false);
    }
  }, [effectiveChildId]);

  const loadTips = async () => {
    if (!effectiveChildId) return;

    try {
      setLoading(true);
      const data = await getSupportTips(effectiveChildId);
      setTips(data);
    } catch (error) {
      console.error('Failed to load support tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic':
        return <BookOpen className="w-5 h-5" />;
      case 'emotional':
        return <Heart className="w-5 h-5" />;
      case 'practical':
        return <Lightbulb className="w-5 h-5" />;
      case 'motivational':
        return <Zap className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      case 'emotional':
        return 'bg-pink-500/20 text-pink-500 border-pink-500/50';
      case 'practical':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'motivational':
        return 'bg-purple-500/20 text-purple-500 border-purple-500/50';
      default:
        return 'bg-gray-200 dark:bg-white/20 text-gray-900 dark:text-white border-white/50';
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

  if (!tips) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-white/60">Support tips not available</p>
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
              <Lightbulb className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Home Support Tips</h1>
              <p className="text-sm text-gray-500 dark:text-white/60">{tips.student_name}</p>
            </div>
          </div>
        </motion.div>

        {/* This Week's Focus */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gradient-to-r from-[#E40000]/20 to-transparent border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-[#E40000]" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">This Week's Focus</h2>
            </div>
            <p className="text-gray-700 dark:text-white/80 mb-4">{tips.this_week_focus}</p>
            {tips.priority_actions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Priority Actions:</h3>
                <ul className="space-y-2">
                  {tips.priority_actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-white/80">
                      <span className="text-[#E40000] mt-0.5">→</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>

        {/* Categorized Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tips.tips_by_category.map((category, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-lg border ${getCategoryColor(category.category)}`}>
                  {getCategoryIcon(category.category)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{category.category}</h3>
              </div>
              <div className="space-y-3">
                {category.tips.map((tip, j) => (
                  <div key={j} className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4">
                    <p className="text-sm text-gray-700 dark:text-white/80">{tip}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recommended Resources */}
        {tips.recommended_resources.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommended Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tips.recommended_resources.map((resource, i) => (
                  <a
                    key={i}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4 hover:bg-[#2A2E33] transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#E40000] transition-colors">
                        {resource.title}
                      </h4>
                      <ExternalLink className="w-4 h-4 text-gray-400 dark:text-white/40 group-hover:text-[#E40000] transition-colors" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-white/60 mb-2">{resource.description}</p>
                    <span className="text-xs text-[#E40000] capitalize">{resource.resource_type}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default AISupportTipsPage;
