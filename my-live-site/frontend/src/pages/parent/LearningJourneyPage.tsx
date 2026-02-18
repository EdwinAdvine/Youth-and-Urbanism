/**
 * Learning Journey Page
 *
 * Full-page view of a child's learning journey including focus areas,
 * CBC competency radar preview, weekly narrative, and learning path.
 * Uses selectedChildId from the parent store.
 *
 * Route: /dashboard/parent/learning-journey
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, RefreshCw, CheckCircle, Clock,
  ArrowRight, Sparkles, ChevronRight,
} from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import CBCRadarChart from '../../components/parent/children/CBCRadarChart';
import { getLearningJourney } from '../../services/parentChildrenService';
import type { LearningJourneyResponse } from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const LearningJourneyPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedChildId, children } = useParentStore();

  const [journey, setJourney] = useState<LearningJourneyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedChild = children.find((c) => c.student_id === selectedChildId);

  useEffect(() => {
    if (selectedChildId) {
      loadJourney();
    } else {
      setLoading(false);
    }
  }, [selectedChildId]);

  const loadJourney = async () => {
    if (!selectedChildId) return;

    try {
      setLoading(true);
      const data = await getLearningJourney(selectedChildId);
      setJourney(data);
    } catch (error) {
      console.error('Failed to load learning journey:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'upcoming':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-blue-500/20 text-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'upcoming':
        return <ArrowRight className="w-4 h-4 text-gray-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-blue-500" />;
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

  if (!selectedChildId) {
    return (
      <>
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 dark:text-white/30 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60 mb-2">Select a child to view their learning journey</p>
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

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Journey</h1>
                {selectedChild && (
                  <p className="text-gray-500 dark:text-white/60 mt-1">{selectedChild.full_name}</p>
                )}
              </div>
            </div>
            <button
              onClick={loadJourney}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Focus Areas */}
        {journey && journey.current_focus_areas && journey.current_focus_areas.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Focus Areas</h2>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {journey.current_focus_areas.map((area, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{area.subject}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded capitalize ${getStatusColor(area.status || 'in_progress')}`}>
                      {area.status || 'In Progress'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-white/70 mb-3">{area.topic}</p>
                  <div className="w-full bg-white dark:bg-[#181C1F] rounded-full h-2 mb-1">
                    <div
                      className="bg-gradient-to-r from-[#E40000] to-[#FF0000] h-2 rounded-full transition-all"
                      style={{ width: `${area.progress_percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white/60 mt-1">
                    {area.progress_percentage.toFixed(0)}% complete
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Weekly Narrative */}
        {journey && journey.weekly_narrative && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-gradient-to-r from-[#E40000]/15 to-[#FF0000]/5 border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#E40000]" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Narrative</h2>
              </div>
              <p className="text-gray-700 dark:text-white/80 leading-relaxed mb-4">
                {journey.weekly_narrative.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Highlights */}
                {journey.weekly_narrative.highlights && journey.weekly_narrative.highlights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Highlights</h4>
                    <ul className="space-y-1">
                      {journey.weekly_narrative.highlights.map((h, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-white/70 flex items-start gap-2">
                          <span className="text-green-500 flex-shrink-0">&#10003;</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Growth Areas */}
                {journey.weekly_narrative.areas_of_growth && journey.weekly_narrative.areas_of_growth.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Growth Areas</h4>
                    <ul className="space-y-1">
                      {journey.weekly_narrative.areas_of_growth.map((g, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-white/70 flex items-start gap-2">
                          <span className="text-blue-500 flex-shrink-0">&rarr;</span>
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {journey.weekly_narrative.recommendations && journey.weekly_narrative.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {journey.weekly_narrative.recommendations.map((r, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-white/70 flex items-start gap-2">
                          <span className="text-yellow-500 flex-shrink-0">&#9733;</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* CBC Competency Radar Preview */}
        {journey && journey.cbc_competencies && journey.cbc_competencies.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">CBC Competencies</h2>
              <button
                onClick={() => navigate('/dashboard/parent/cbc-competencies')}
                className="flex items-center gap-1 text-sm text-[#E40000] hover:text-[#FF0000] transition-colors"
              >
                Full view
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <CBCRadarChart competencies={journey.cbc_competencies} showLegend={false} />
          </motion.div>
        )}

        {/* Learning Path */}
        {journey && journey.learning_path && journey.learning_path.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Path</h2>
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="space-y-4">
                {journey.learning_path.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(item.status)}
                    </div>

                    {/* Connector Line */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      {i < journey.learning_path.length - 1 && (
                        <div
                          className={`w-px h-8 mt-2 ${
                            item.status === 'completed' ? 'bg-green-500/40' : 'bg-gray-100 dark:bg-[#22272B]'
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-medium ${
                            item.status === 'completed'
                              ? 'text-gray-500 dark:text-white/60 line-through'
                              : item.status === 'in_progress'
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-400 dark:text-white/40'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs rounded capitalize ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      {item.subject && (
                        <p className="text-xs text-gray-500 dark:text-white/50 mt-1">{item.subject}</p>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-400 dark:text-white/40 mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {journey && !journey.current_focus_areas?.length && !journey.learning_path?.length && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No learning journey data yet
              </h3>
              <p className="text-gray-500 dark:text-white/60 text-sm">
                Learning journey information will appear as your child engages with courses and lessons.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default LearningJourneyPage;
