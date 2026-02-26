/**
 * Activity Page
 *
 * Displays daily and weekly activity tracking for a selected child,
 * or an all-children activity overview when no child is selected.
 * Includes summary stats, activity timeline chart, activity feed,
 * and weekly summary.
 *
 * Route: /dashboard/parent/activity
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, RefreshCw, Clock, BookOpen, Target,
  Zap, Calendar, Users,
} from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import ActivityTimeline from '../../components/parent/children/ActivityTimeline';
import { getActivity, getChildrenList } from '../../services/parentChildrenService';
import type { ActivityResponse, ChildrenListResponse } from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const ActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedChildId, children } = useParentStore();

  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [childrenData, setChildrenData] = useState<ChildrenListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedChild = children.find((c) => c.student_id === selectedChildId);

  useEffect(() => {
    loadData();
  }, [selectedChildId]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (selectedChildId) {
        const data = await getActivity(selectedChildId);
        setActivity(data);
        setChildrenData(null);
      } else {
        // Show all children overview
        const data = await getChildrenList();
        setChildrenData(data);
        setActivity(null);
      }
    } catch (error) {
      console.error('Failed to load activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'quiz_taken':
        return <Target className="w-4 h-4 text-purple-500" />;
      case 'assignment_submitted':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'badge_earned':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'goal_progress':
        return <Target className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500 dark:text-white/60" />;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return 'bg-blue-500/20';
      case 'quiz_taken':
        return 'bg-purple-500/20';
      case 'assignment_submitted':
        return 'bg-green-500/20';
      case 'badge_earned':
        return 'bg-yellow-500/20';
      case 'goal_progress':
        return 'bg-orange-500/20';
      default:
        return 'bg-gray-100 dark:bg-white/10';
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
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Daily & Weekly Activity</h1>
                <p className="text-gray-500 dark:text-white/60 mt-1">
                  {selectedChild
                    ? selectedChild.full_name
                    : 'All Children Overview'}
                </p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Child-Specific Activity View */}
        {selectedChildId && activity && (
          <>
            {/* Summary Stats */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <motion.div
                variants={fadeUp}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-white/60">Total Time</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activity.summary?.daily_minutes || 0}m
                </p>
                <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Today</p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-white/60">Sessions</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activity.summary?.total_sessions || 0}
                </p>
                <p className="text-xs text-gray-400 dark:text-white/40 mt-1">This week</p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-white/60">Lessons</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activity.summary?.most_engaged_content?.length || 0}
                </p>
                <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Completed</p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-white/60">Streak</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activity.summary?.current_streak || 0}d
                </p>
                <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Current</p>
              </motion.div>
            </motion.div>

            {/* Activity Timeline Chart */}
            {activity.daily_activity && activity.daily_activity.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <ActivityTimeline dailyActivity={activity.daily_activity} />
              </motion.div>
            )}

            {/* Activity Feed */}
            {activity.recent_activities && activity.recent_activities.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl divide-y divide-gray-200 dark:divide-[#22272B]">
                  {activity.recent_activities.map((item, i) => (
                    <div key={item.id || i} className="p-4 flex items-start gap-4">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityTypeColor(item.activity_type)}`}>
                        {getActivityTypeIcon(item.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.title}
                          </h4>
                          <span className="text-xs text-gray-400 dark:text-white/40 flex-shrink-0">
                            {new Date(item.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-white/60 mt-1">{item.description}</p>
                        {item.course_name && (
                          <p className="text-xs text-[#E40000] mt-1">{item.course_name}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Weekly Summary */}
            {activity.summary && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Summary</h2>
                <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Weekly Total</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {activity.summary.weekly_minutes || 0}m
                      </p>
                      <p className="text-xs text-gray-400 dark:text-white/40">learning time</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Longest Streak</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {activity.summary.longest_streak || 0} days
                      </p>
                      <p className="text-xs text-gray-400 dark:text-white/40">consecutive</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Most Engaged</p>
                      {activity.summary.most_engaged_content && activity.summary.most_engaged_content.length > 0 ? (
                        <>
                          <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                            {activity.summary.most_engaged_content[0].title}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-white/40">
                            {activity.summary.most_engaged_content[0].time_minutes}m spent
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-white/40">No data</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Empty State - No Activity */}
            {(!activity.daily_activity || activity.daily_activity.length === 0) &&
              (!activity.recent_activities || activity.recent_activities.length === 0) && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No activity data yet
                  </h3>
                  <p className="text-gray-500 dark:text-white/60 text-sm">
                    Activity tracking will appear as your child engages with lessons and courses.
                  </p>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* All Children Overview (no child selected) */}
        {!selectedChildId && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <motion.div variants={fadeUp}>
              <div className="bg-gradient-to-r from-[#E40000]/15 to-transparent border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-[#E40000]" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Family Activity Overview</h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-white/60">
                  Select a specific child from the sidebar to see detailed activity data, or view the summary below.
                </p>
              </div>
            </motion.div>

            {/* Children Cards */}
            {childrenData && childrenData.children && childrenData.children.length > 0 ? (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {childrenData.children.map((child) => (
                  <motion.div
                    key={child.student_id}
                    variants={fadeUp}
                    className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-[#22272B] transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/parent/children/${child.student_id}#activity`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E40000] to-[#FF0000] flex items-center justify-center text-gray-900 dark:text-white text-lg font-semibold flex-shrink-0">
                        {child.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{child.full_name}</h3>
                        <p className="text-xs text-gray-500 dark:text-white/60">{child.grade_level}</p>
                        <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
                          {child.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <BarChart3 className="w-5 h-5 text-gray-400 dark:text-white/40 flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div variants={fadeUp}>
                <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
                  <Users className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No children found
                  </h3>
                  <p className="text-gray-500 dark:text-white/60 text-sm">
                    Add children to your account to start tracking their activity.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
};

export default ActivityPage;
