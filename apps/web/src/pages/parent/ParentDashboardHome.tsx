/**
 * Parent Dashboard Home Page
 *
 * Comprehensive family overview with:
 * - Child quick-status cards
 * - Today's highlights (AI-generated)
 * - Urgent items banner
 * - Mood tracking input
 * - AI family summary with insights
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Clock, BookOpen, AlertCircle,
  Sparkles, Heart, Bell, Target, Activity,
  ChevronRight, Smile,
  Meh, Frown, Zap, BatteryLow,
  Plus
} from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import {
  getFamilyOverview,
  getTodayHighlights,
  getUrgentItems,
  createMoodEntry,
  getAIFamilySummary,
} from '../../services/parentDashboardService';
import type {
  FamilyOverviewResponse,
  TodayHighlightsResponse,
  UrgentItemsResponse,
  AIFamilySummaryResponse,
} from '../../types/parent';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ParentDashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { selectedChildId, setChildren } = useParentStore();

  // Data states
  const [overview, setOverview] = useState<FamilyOverviewResponse | null>(null);
  const [highlights, setHighlights] = useState<TodayHighlightsResponse | null>(null);
  const [urgentItems, setUrgentItems] = useState<UrgentItemsResponse | null>(null);
  const [aiSummary, setAiSummary] = useState<AIFamilySummaryResponse | null>(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [showMoodInput, setShowMoodInput] = useState(false);
  const [selectedMoodEmoji, setSelectedMoodEmoji] = useState<string | null>(null);
  const [selectedEnergyLevel, setSelectedEnergyLevel] = useState<number>(3);
  const [moodNote, setMoodNote] = useState('');

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [overviewData, highlightsData, urgentData, summaryData] = await Promise.all([
        getFamilyOverview(),
        getTodayHighlights(),
        getUrgentItems(),
        getAIFamilySummary(),
      ]);

      setOverview(overviewData);
      setHighlights(highlightsData);
      setUrgentItems(urgentData);
      setAiSummary(summaryData);

      // Update children in store
      if (overviewData.children) {
        setChildren(overviewData.children.map((child) => ({
          student_id: child.student_id || child.child_id,
          full_name: child.full_name,
          grade_level: child.grade_level,
          is_active: child.today_active,
        })));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSubmit = async () => {
    if (!selectedMoodEmoji) return;

    try {
      await createMoodEntry({
        child_id: selectedChildId || undefined,
        emoji: selectedMoodEmoji,
        energy_level: selectedEnergyLevel,
        note: moodNote || undefined,
      });

      // Reset form
      setSelectedMoodEmoji(null);
      setSelectedEnergyLevel(3);
      setMoodNote('');
      setShowMoodInput(false);
    } catch (error) {
      console.error('Failed to submit mood entry:', error);
    }
  };

  const moodOptions = [
    { emoji: 'happy', icon: Smile, label: 'Happy', color: 'text-green-500' },
    { emoji: 'neutral', icon: Meh, label: 'Neutral', color: 'text-yellow-500' },
    { emoji: 'tired', icon: BatteryLow, label: 'Tired', color: 'text-orange-500' },
    { emoji: 'stressed', icon: Frown, label: 'Stressed', color: 'text-red-500' },
    { emoji: 'excited', icon: Sparkles, label: 'Excited', color: 'text-purple-500' },
    { emoji: 'anxious', icon: AlertCircle, label: 'Anxious', color: 'text-blue-500' },
  ];

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
          <div className="bg-gradient-to-r from-[#E40000]/20 to-transparent border border-gray-200 dark:border-[#22272B] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Family Dashboard
                </h1>
                <p className="text-gray-700 dark:text-white/80">
                  {overview?.total_children || 0} {overview?.total_children === 1 ? 'child' : 'children'} •{' '}
                  {overview?.active_today || 0} active today •{' '}
                  {overview?.family_streak_days || 0} day streak
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="w-16 h-16 bg-[#E40000]/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-[#E40000]" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Urgent Items Banner */}
        {urgentItems && urgentItems.total_count > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-[#E40000]/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#E40000] animate-pulse" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {urgentItems.total_count} Urgent {urgentItems.total_count === 1 ? 'Item' : 'Items'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-white/60">Requires your attention</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/dashboard/parent/urgent')}
                  className="px-4 py-2 bg-[#E40000] text-gray-900 dark:text-white text-sm rounded-lg hover:bg-[#FF0000] transition-colors"
                >
                  Review
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Today's Highlights */}
        {highlights && highlights.highlights.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#E40000]" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Highlights</h2>
              </div>

              {highlights.ai_summary && (
                <p className="text-sm text-gray-600 dark:text-white/70 mb-4 p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                  {highlights.ai_summary}
                </p>
              )}

              <div className="space-y-3">
                {highlights.highlights.slice(0, 5).map((highlight) => (
                  <div
                    key={highlight.id}
                    className="flex items-start gap-3 p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg hover:bg-[#2A2E33] transition-colors cursor-pointer"
                    onClick={() => highlight.action_url && navigate(highlight.action_url)}
                  >
                    <span className="text-2xl">{highlight.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{highlight.title}</h4>
                        {highlight.child_name && (
                          <span className="text-xs text-gray-500 dark:text-white/50">• {highlight.child_name}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-white/60 mt-1">{highlight.description}</p>
                    </div>
                    {highlight.action_url && <ChevronRight className="w-4 h-4 text-gray-400 dark:text-white/40" />}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Family Quick Stats */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={fadeUp} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-white/60">Today's Time</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{overview?.total_minutes_today || 0}m</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-white/60">Sessions</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{overview?.total_sessions_today || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-white/60">This Week</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{overview?.this_week_lessons_completed || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-white/60">Streak</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{overview?.family_streak_days || 0}d</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Children Status Cards */}
        {overview && overview.children && overview.children.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Children Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {overview.children.map((child) => (
                  <div
                    key={child.student_id}
                    className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4 hover:bg-[#2A2E33] transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/parent/children/${child.student_id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E40000] to-[#FF0000] flex items-center justify-center text-gray-900 dark:text-white text-lg font-semibold">
                          {child.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{child.full_name}</h3>
                          <p className="text-xs text-gray-500 dark:text-white/60">{child.grade_level}</p>
                        </div>
                      </div>
                      {child.today_active && (
                        <span className="px-2 py-1 text-xs bg-green-500/20 text-green-500 rounded">
                          Active Today
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-white/50">Time</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{child.today_minutes}m</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-white/50">Sessions</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{child.today_sessions}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-white/50">Streak</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{child.current_streak_days}d</p>
                      </div>
                    </div>

                    {(child.has_urgent_alerts || (child.unread_messages ?? 0) > 0) && (
                      <div className="flex items-center gap-2">
                        {child.has_urgent_alerts && (
                          <span className="px-2 py-1 text-xs bg-red-500/20 text-red-500 rounded flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Alerts
                          </span>
                        )}
                        {(child.unread_messages ?? 0) > 0 && (
                          <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-500 rounded">
                            {child.unread_messages} Messages
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Mood Tracking */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#E40000]" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">How are we feeling today?</h2>
              </div>
              {!showMoodInput && (
                <button
                  onClick={() => setShowMoodInput(true)}
                  className="px-3 py-1.5 bg-[#E40000]/20 border border-[#E40000]/50 text-[#E40000] text-sm rounded-lg hover:bg-[#E40000]/30 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Log Mood
                </button>
              )}
            </div>

            {showMoodInput && (
              <div className="space-y-4">
                {/* Mood Emojis */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {moodOptions.map((mood) => {
                    const IconComponent = mood.icon;
                    return (
                      <button
                        key={mood.emoji}
                        onClick={() => setSelectedMoodEmoji(mood.emoji)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedMoodEmoji === mood.emoji
                            ? 'border-[#E40000] bg-[#E40000]/10'
                            : 'border-gray-200 dark:border-[#22272B] bg-gray-100 dark:bg-[#22272B] hover:border-[#E40000]/50'
                        }`}
                      >
                        <IconComponent className={`w-6 h-6 mx-auto ${mood.color}`} />
                        <p className="text-xs text-gray-700 dark:text-white/80 mt-1 text-center">{mood.label}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Energy Level */}
                <div>
                  <label className="text-sm text-gray-700 dark:text-white/80 mb-2 block">Energy Level</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={selectedEnergyLevel}
                    onChange={(e) => setSelectedEnergyLevel(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500 dark:text-white/50">Low</span>
                    <span className="text-xs text-gray-700 dark:text-white/80 font-semibold">{selectedEnergyLevel}/5</span>
                    <span className="text-xs text-gray-500 dark:text-white/50">High</span>
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="text-sm text-gray-700 dark:text-white/80 mb-2 block">Note (optional)</label>
                  <textarea
                    value={moodNote}
                    onChange={(e) => setMoodNote(e.target.value)}
                    placeholder="Add any notes about today..."
                    className="w-full p-3 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#E40000]/50"
                    rows={2}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleMoodSubmit}
                    disabled={!selectedMoodEmoji}
                    className="flex-1 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => {
                      setShowMoodInput(false);
                      setSelectedMoodEmoji(null);
                      setMoodNote('');
                    }}
                    className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] text-gray-700 dark:text-white/80 rounded-lg hover:bg-[#2A2E33] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Family Summary */}
        {aiSummary && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#E40000]" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Weekly Summary</h2>
              </div>

              <p className="text-gray-700 dark:text-white/80 mb-4">{aiSummary.summary}</p>

              {aiSummary.insights && aiSummary.insights.length > 0 && (
                <div className="space-y-2 mb-4">
                  {aiSummary.insights.map((insight, index) => (
                    <div key={index} className="p-3 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                      <div className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-[#E40000] mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{insight.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-white/60 mt-1">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {aiSummary.top_recommendations && aiSummary.top_recommendations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommendations</h3>
                  <ul className="space-y-1">
                    {aiSummary.top_recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-white/70 flex items-start gap-2">
                        <span className="text-[#E40000]">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default ParentDashboardHome;
