/**
 * Today's Highlights Page
 *
 * Full-page expansion of the AI-generated highlights widget
 * from ParentDashboardHome. Shows all highlights with type
 * color coding, AI summary, and navigation actions.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ChevronRight, ArrowLeft, Trophy, TrendingUp,
  AlertCircle, Star, RefreshCw,
} from 'lucide-react';
import { getTodayHighlights } from '../../services/parentDashboardService';
import type { TodayHighlightsResponse } from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const HighlightsPage: React.FC = () => {
  const navigate = useNavigate();

  const [highlights, setHighlights] = useState<TodayHighlightsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHighlights();
  }, []);

  const loadHighlights = async () => {
    try {
      setLoading(true);
      const data = await getTodayHighlights();
      setHighlights(data);
    } catch (error) {
      console.error('Failed to load highlights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'milestone':
        return 'border-purple-500 bg-purple-500/10';
      case 'improvement':
        return 'border-green-500 bg-green-500/10';
      case 'concern':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-blue-500 bg-blue-500/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'milestone':
        return <Star className="w-5 h-5 text-purple-500" />;
      case 'improvement':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'concern':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'milestone':
        return 'bg-purple-500/20 text-purple-500';
      case 'improvement':
        return 'bg-green-500/20 text-green-500';
      case 'concern':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-blue-500/20 text-blue-500';
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

  return (
    <>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/parent')}
          className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </button>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Today's Highlights</h1>
                <p className="text-gray-500 dark:text-white/60 mt-1">
                  AI-generated summary of your family's day
                </p>
              </div>
            </div>
            <button
              onClick={loadHighlights}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* AI Summary */}
        {highlights?.ai_summary && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-gradient-to-r from-[#E40000]/10 to-transparent border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#E40000] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">AI Summary</h3>
                  <p className="text-gray-700 dark:text-white/80 text-sm leading-relaxed">
                    {highlights.ai_summary}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Highlights List */}
        {highlights && highlights.highlights.length > 0 ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {highlights.highlights.map((highlight) => (
              <motion.div
                key={highlight.id}
                variants={fadeUp}
                className={`border rounded-xl p-5 transition-colors ${getTypeColor(highlight.type)} ${
                  highlight.action_url ? 'cursor-pointer hover:brightness-110' : ''
                }`}
                onClick={() => highlight.action_url && navigate(highlight.action_url)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {highlight.icon ? (
                      <span className="text-2xl">{highlight.icon}</span>
                    ) : (
                      getTypeIcon(highlight.type)
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                        {highlight.title}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs rounded capitalize ${getTypeBadgeColor(highlight.type)}`}>
                        {highlight.type}
                      </span>
                    </div>

                    {highlight.child_name && (
                      <p className="text-xs text-gray-500 dark:text-white/50 mb-2">
                        {highlight.child_name}
                      </p>
                    )}

                    <p className="text-sm text-gray-700 dark:text-white/80 leading-relaxed">
                      {highlight.description}
                    </p>

                    {highlight.timestamp && (
                      <p className="text-xs text-gray-400 dark:text-white/40 mt-2">
                        {new Date(highlight.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>

                  {/* Action Arrow */}
                  {highlight.action_url && (
                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-white/40 flex-shrink-0 mt-1" />
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No highlights for today
              </h3>
              <p className="text-gray-500 dark:text-white/60 text-sm">
                Check back later as your children engage with their learning activities.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default HighlightsPage;
