/**
 * Family Mood Snapshot Page
 *
 * Full-page expansion of the mood tracking widget from
 * ParentDashboardHome. Includes mood entry form, mood
 * history list with trends, and child filtering.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, ArrowLeft, Smile, Meh, Frown, Sparkles,
  AlertCircle, BatteryLow, Plus, TrendingUp, TrendingDown,
  Minus, RefreshCw, Calendar,
} from 'lucide-react';
import ChildSelector from '../../components/parent/ChildSelector';
import { useParentStore } from '../../store/parentStore';
import {
  getMoodHistory,
  createMoodEntry,
} from '../../services/parentDashboardService';
import type { MoodHistoryResponse, MoodEntry } from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const moodOptions = [
  { emoji: 'happy', icon: Smile, label: 'Happy', color: 'text-green-500' },
  { emoji: 'neutral', icon: Meh, label: 'Neutral', color: 'text-yellow-500' },
  { emoji: 'tired', icon: BatteryLow, label: 'Tired', color: 'text-orange-500' },
  { emoji: 'stressed', icon: Frown, label: 'Stressed', color: 'text-red-500' },
  { emoji: 'excited', icon: Sparkles, label: 'Excited', color: 'text-purple-500' },
  { emoji: 'anxious', icon: AlertCircle, label: 'Anxious', color: 'text-blue-500' },
];

const getMoodIcon = (emoji: string) => {
  const mood = moodOptions.find((m) => m.emoji === emoji);
  if (!mood) return { Icon: Smile, color: 'text-gray-500 dark:text-white/60' };
  return { Icon: mood.icon, color: mood.color };
};

const getMoodLabel = (emoji: string) => {
  const mood = moodOptions.find((m) => m.emoji === emoji);
  return mood?.label || emoji;
};

const MoodSnapshotPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedChildId } = useParentStore();

  const [moodHistory, setMoodHistory] = useState<MoodHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Mood entry form state
  const [showMoodInput, setShowMoodInput] = useState(false);
  const [selectedMoodEmoji, setSelectedMoodEmoji] = useState<string | null>(null);
  const [selectedEnergyLevel, setSelectedEnergyLevel] = useState<number>(3);
  const [moodNote, setMoodNote] = useState('');

  useEffect(() => {
    loadMoodHistory();
  }, [selectedChildId]);

  const loadMoodHistory = async () => {
    try {
      setLoading(true);
      const data = await getMoodHistory({
        child_id: selectedChildId || undefined,
        limit: 50,
      });
      setMoodHistory(data);
    } catch (error) {
      console.error('Failed to load mood history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSubmit = async () => {
    if (!selectedMoodEmoji) return;

    try {
      setSubmitting(true);
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

      // Reload history
      await loadMoodHistory();
    } catch (error) {
      console.error('Failed to submit mood entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getTrendIcon = (trend: string | undefined) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'stable':
      default:
        return <Minus className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getTrendLabel = (trend: string | undefined) => {
    switch (trend) {
      case 'improving':
        return { label: 'Improving', color: 'text-green-500' };
      case 'declining':
        return { label: 'Declining', color: 'text-red-500' };
      case 'stable':
      default:
        return { label: 'Stable', color: 'text-yellow-500' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
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
                <Heart className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Family Mood Snapshot</h1>
                <p className="text-gray-500 dark:text-white/60 mt-1">
                  Track and understand your family's emotional wellbeing
                </p>
              </div>
            </div>
            <button
              onClick={loadMoodHistory}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Child Selector + Trend */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChildSelector showFamilyOption={true} />

            {/* Trend Indicator */}
            {moodHistory?.trend && (
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg px-4 py-2.5 flex items-center gap-3">
                {getTrendIcon(moodHistory.trend)}
                <div>
                  <p className="text-xs text-gray-500 dark:text-white/60">Overall Trend</p>
                  <p className={`text-sm font-semibold ${getTrendLabel(moodHistory.trend).color}`}>
                    {getTrendLabel(moodHistory.trend).label}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Mood Entry Form */}
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
                    disabled={!selectedMoodEmoji || submitting}
                    className="flex-1 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    onClick={() => {
                      setShowMoodInput(false);
                      setSelectedMoodEmoji(null);
                      setSelectedEnergyLevel(3);
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

        {/* Mood History */}
        {moodHistory && moodHistory.entries && moodHistory.entries.length > 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#E40000]" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mood History</h2>
                <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 rounded-full">
                  {moodHistory.entries.length} entries
                </span>
              </div>

              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-2 gap-3"
              >
                {moodHistory.entries.map((entry: MoodEntry) => {
                  const { Icon, color } = getMoodIcon(entry.emoji);
                  return (
                    <motion.div
                      key={entry.id}
                      variants={fadeUp}
                      className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4 hover:bg-[#2A2E33] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {/* Mood Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-white dark:bg-[#181C1F] flex items-center justify-center">
                            <Icon className={`w-5 h-5 ${color}`} />
                          </div>
                        </div>

                        {/* Entry Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold ${color}`}>
                                {getMoodLabel(entry.emoji)}
                              </span>
                              {entry.child_id && (
                                <span className="text-xs text-gray-500 dark:text-white/50">
                                  {/* Child name shown if available on the entry */}
                                  {(entry as MoodEntry & { child_name?: string }).child_name || ''}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 dark:text-white/40">
                              {formatDate(entry.recorded_date || entry.created_at)}
                            </span>
                          </div>

                          {/* Energy Level Bar */}
                          {entry.energy_level && (
                            <div className="mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-white/50">Energy</span>
                                <div className="flex-1 bg-white dark:bg-[#181C1F] rounded-full h-1.5">
                                  <div
                                    className="bg-gradient-to-r from-[#E40000] to-[#FF0000] h-1.5 rounded-full transition-all"
                                    style={{ width: `${(entry.energy_level / 5) * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-white/60 font-medium">
                                  {entry.energy_level}/5
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Note */}
                          {entry.note && (
                            <p className="text-xs text-gray-500 dark:text-white/60 leading-relaxed">
                              {entry.note}
                            </p>
                          )}

                          {/* Timestamp */}
                          <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
                            {formatTime(entry.created_at)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <Heart className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No mood entries yet
              </h3>
              <p className="text-gray-500 dark:text-white/60 text-sm mb-4">
                Start tracking how your family is feeling!
              </p>
              {!showMoodInput && (
                <button
                  onClick={() => setShowMoodInput(true)}
                  className="px-6 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Log First Mood
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default MoodSnapshotPage;
