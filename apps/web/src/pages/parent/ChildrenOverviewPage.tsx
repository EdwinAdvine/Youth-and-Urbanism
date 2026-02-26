/**
 * Children Overview Page
 *
 * Grid view of all children with quick stats and navigation to child detail.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, Clock, Zap, ChevronRight,
  BookOpen, Target, Award
} from 'lucide-react';
import { getChildrenList } from '../../services/parentChildrenService';
import type { ChildSummaryCard, ChildrenListResponse } from '../../types/parent';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ChildrenOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<ChildSummaryCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const data: ChildrenListResponse = await getChildrenList();
      setChildren(data.children);
    } catch (error) {
      console.error('Failed to load children:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (score: number | null | undefined) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
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
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Children</h1>
              <p className="text-gray-500 dark:text-white/60 mt-1">
                {children.length} {children.length === 1 ? 'child' : 'children'} • View profiles and track progress
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-14 h-14 bg-[#E40000]/20 rounded-full flex items-center justify-center">
                <Users className="w-7 h-7 text-[#E40000]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Children Grid */}
        {children.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Children Linked</h3>
              <p className="text-gray-500 dark:text-white/60 mb-4">Link a child using their admission number</p>
              <button
                onClick={() => navigate('/dashboard/parent/settings/family')}
                className="px-6 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
              >
                Link Child
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {children.map((child) => (
              <motion.div
                key={child.student_id}
                variants={fadeUp}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 hover:border-[#E40000]/50 transition-all cursor-pointer"
                onClick={() => navigate(`/dashboard/parent/children/${child.student_id}`)}
              >
                {/* Child Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E40000] to-[#FF0000] flex items-center justify-center text-gray-900 dark:text-white text-xl font-semibold">
                      {child.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {child.full_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-white/60">{child.grade_level}</p>
                    </div>
                  </div>
                  {child.today_active && (
                    <span className="px-2 py-1 text-xs bg-green-500/20 text-green-500 rounded">
                      Active
                    </span>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Average Grade */}
                  <div className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-gray-500 dark:text-white/60">Average</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {child.average_grade ? `${child.average_grade.toFixed(0)}%` : 'N/A'}
                    </p>
                  </div>

                  {/* Streak */}
                  <div className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="text-xs text-gray-500 dark:text-white/60">Streak</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {child.current_streak_days}d
                    </p>
                  </div>
                </div>

                {/* Engagement Score */}
                {child.engagement_score !== null && child.engagement_score !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 dark:text-white/60">Engagement</span>
                      <span className={`text-xs font-semibold ${getEngagementColor(child.engagement_score)}`}>
                        {child.engagement_score.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-[#22272B] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#E40000] to-[#FF0000] h-2 rounded-full transition-all"
                        style={{ width: `${child.engagement_score}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Quick Links */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-[#22272B]">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/parent/children/${child.student_id}#learning`);
                      }}
                      className="p-2 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-[#2A2E33] transition-colors"
                      title="Learning Journey"
                    >
                      <BookOpen className="w-4 h-4 text-gray-700 dark:text-white/80" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/parent/children/${child.student_id}#activity`);
                      }}
                      className="p-2 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-[#2A2E33] transition-colors"
                      title="Activity"
                    >
                      <Clock className="w-4 h-4 text-gray-700 dark:text-white/80" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/parent/children/${child.student_id}#achievements`);
                      }}
                      className="p-2 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-[#2A2E33] transition-colors"
                      title="Achievements"
                    >
                      <Award className="w-4 h-4 text-gray-700 dark:text-white/80" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/parent/children/${child.student_id}#goals`);
                      }}
                      className="p-2 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-[#2A2E33] transition-colors"
                      title="Goals"
                    >
                      <Target className="w-4 h-4 text-gray-700 dark:text-white/80" />
                    </button>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-white/40" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
};

export default ChildrenOverviewPage;
