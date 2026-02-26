/**
 * Goals Page
 *
 * Manages goals and expectations for a specific child or the entire family.
 * When a child is selected, shows that child's goals using GoalManager.
 * When no child is selected, shows all family goals grouped by child
 * plus family-wide goals.
 *
 * Route: /dashboard/parent/goals
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target, RefreshCw, CheckCircle, Clock,
  Users, BarChart3,
} from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import GoalManager from '../../components/parent/children/GoalManager';
import {
  getChildGoals,
  getAllGoals,
} from '../../services/parentChildrenService';
import type { GoalsListResponse } from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const GoalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedChildId, children } = useParentStore();

  const [goals, setGoals] = useState<GoalsListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedChild = children.find((c) => c.student_id === selectedChildId);

  useEffect(() => {
    loadGoals();
  }, [selectedChildId]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      if (selectedChildId) {
        const data = await getChildGoals(selectedChildId);
        setGoals(data);
      } else {
        const data = await getAllGoals();
        setGoals(data);
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Compute stats from goals
  const goalsList = goals?.goals || [];
  const activeGoals = goalsList.filter((g) => g.status === 'active');
  const completedGoals = goalsList.filter((g) => g.status === 'completed');
  const inProgressPercentage =
    goalsList.length > 0
      ? Math.round((activeGoals.length / goalsList.length) * 100)
      : 0;

  // Group goals by child for "all children" view
  const groupedGoals = goalsList.reduce<Record<string, typeof goalsList>>((acc, goal) => {
    const key = goal.child_name || goal.child_id || 'Family Goals';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(goal);
    return acc;
  }, {});

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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Goals & Expectations</h1>
                <p className="text-gray-500 dark:text-white/60 mt-1">
                  {selectedChild
                    ? selectedChild.full_name
                    : 'All Family Goals'}
                </p>
              </div>
            </div>
            <button
              onClick={loadGoals}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-gray-500 dark:text-white/60">Active Goals</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeGoals.length}</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Currently tracked</p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm text-gray-500 dark:text-white/60">Completed</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{completedGoals.length}</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Goals achieved</p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm text-gray-500 dark:text-white/60">In Progress</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{inProgressPercentage}%</p>
            </div>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Of all goals are active</p>
          </motion.div>
        </motion.div>

        {/* Child-Specific Goals (GoalManager) */}
        {selectedChildId && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <GoalManager
              goals={goalsList}
              childId={selectedChildId}
              onGoalsChange={loadGoals}
            />
          </motion.div>
        )}

        {/* All Family Goals (grouped by child) */}
        {!selectedChildId && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Family-wide goals (no child_id) */}
            {(() => {
              const familyWideGoals = goalsList.filter((g) => !g.child_id);
              if (familyWideGoals.length > 0) {
                return (
                  <motion.div variants={fadeUp}>
                    <div className="bg-gradient-to-r from-[#E40000]/15 to-transparent border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-[#E40000]" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Family-Wide Goals</h2>
                      </div>
                      <GoalManager
                        goals={familyWideGoals}
                        onGoalsChange={loadGoals}
                      />
                    </div>
                  </motion.div>
                );
              }
              return null;
            })()}

            {/* Goals grouped by child */}
            {Object.entries(groupedGoals)
              .filter(([key]) => {
                // Exclude family goals already shown above
                const childGoals = groupedGoals[key];
                return childGoals.some((g) => g.child_id);
              })
              .map(([childName, childGoals]) => (
                <motion.div key={childName} variants={fadeUp}>
                  <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E40000] to-[#FF0000] flex items-center justify-center text-gray-900 dark:text-white text-sm font-semibold flex-shrink-0">
                        {childName.charAt(0).toUpperCase()}
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{childName}</h2>
                      <span className="text-xs text-gray-400 dark:text-white/40 ml-auto">
                        {childGoals.length} goal{childGoals.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Goals list for this child */}
                    <div className="space-y-3">
                      {childGoals.map((goal) => (
                        <div
                          key={goal.id}
                          className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`px-2 py-0.5 text-xs rounded capitalize ${
                                    goal.status === 'completed'
                                      ? 'bg-green-500/20 text-green-500'
                                      : goal.status === 'paused'
                                      ? 'bg-yellow-500/20 text-yellow-500'
                                      : goal.status === 'cancelled'
                                      ? 'bg-red-500/20 text-red-500'
                                      : 'bg-blue-500/20 text-blue-500'
                                  }`}
                                >
                                  {goal.status}
                                </span>
                                <span className="px-2 py-0.5 text-xs rounded bg-white dark:bg-[#181C1F] text-gray-500 dark:text-white/60 capitalize">
                                  {goal.category}
                                </span>
                              </div>
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {goal.title}
                              </h4>
                              {goal.description && (
                                <p className="text-xs text-gray-500 dark:text-white/60 mt-1">
                                  {goal.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500 dark:text-white/60">Progress</span>
                              <span className="text-xs font-semibold text-[#E40000]">
                                {goal.progress_percentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-white dark:bg-[#181C1F] rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-[#E40000] to-[#FF0000] h-2 rounded-full transition-all"
                                style={{ width: `${goal.progress_percentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Target Date */}
                          {goal.target_date && (
                            <div className="flex items-center gap-1 mt-2">
                              <Clock className="w-3 h-3 text-gray-400 dark:text-white/40" />
                              <span className="text-xs text-gray-400 dark:text-white/40">
                                Target: {new Date(goal.target_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}

            {/* Empty State */}
            {goalsList.length === 0 && (
              <motion.div variants={fadeUp}>
                <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
                  <Target className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No goals set yet
                  </h3>
                  <p className="text-gray-500 dark:text-white/60 text-sm mb-4">
                    Select a child from the sidebar to create goals, or set family-wide goals here.
                  </p>
                  <button
                    onClick={() => navigate('/dashboard/parent/children')}
                    className="px-6 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
                  >
                    View Children
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
};

export default GoalsPage;
