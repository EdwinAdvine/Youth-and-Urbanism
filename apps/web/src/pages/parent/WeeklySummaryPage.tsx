import React, { useEffect, useState } from 'react';
import weeklySummaryService, { WeeklySummary } from '@/services/parent/weeklySummaryService';

/**
 * Parent Weekly Summary Page — AI-generated learning summaries with
 * discussion starter cards and offline activity suggestions.
 */
const WeeklySummaryPage: React.FC = () => {
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedChildId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedChildId) return;
    const load = async () => {
      try {
        const data = await weeklySummaryService.getSummaries(selectedChildId);
        setSummaries(data);
      } catch (err) {
        console.error('Failed to load weekly summaries:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedChildId]);

  const handleGenerate = async () => {
    if (!selectedChildId) return;
    setGenerating(true);
    try {
      const newSummary = await weeklySummaryService.generateSummary(selectedChildId);
      setSummaries((prev) => [newSummary, ...prev]);
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setGenerating(false);
    }
  };

  const trendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '📊';
    }
  };

  const trendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 dark:text-green-400';
      case 'declining': return 'text-red-600 dark:text-red-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Weekly Learning Summary
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            AI-generated insights to help you support learning at home
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || !selectedChildId}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generating ? 'Generating...' : 'Generate New'}
        </button>
      </div>

      {!selectedChildId && (
        <div className="text-center py-12">
          <span className="text-4xl mb-3 block">👨‍👩‍👧‍👦</span>
          <p className="text-gray-600 dark:text-gray-400">
            Select a child from your dashboard to view their weekly summary.
          </p>
        </div>
      )}

      {loading && selectedChildId && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-pulse">
              <div className="h-4 w-48 bg-gray-200 dark:bg-white/10 rounded mb-3" />
              <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded mb-2" />
              <div className="h-3 w-3/4 bg-gray-200 dark:bg-white/10 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Summaries List */}
      <div className="space-y-6">
        {summaries.map((summary) => (
          <div
            key={summary.id}
            className="rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  Week of {new Date(summary.week_start).toLocaleDateString()} - {new Date(summary.week_end).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Generated {new Date(summary.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className={`flex items-center gap-1 ${trendColor(summary.confidence_trend)}`}>
                <span>{trendIcon(summary.confidence_trend)}</span>
                <span className="text-xs font-medium capitalize">{summary.confidence_trend}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {summary.summary_text}
              </p>
            </div>

            {/* Discussion Starters */}
            {summary.discussion_starters.length > 0 && (
              <div className="px-4 pb-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Discussion Starters
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {summary.discussion_starters.map((starter, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20"
                    >
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                        {starter.topic}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                        "{starter.question}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Offline Activities */}
            {summary.offline_activities.length > 0 && (
              <div className="px-4 pb-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Try at Home
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {summary.offline_activities.map((activity, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20"
                    >
                      <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-1">
                        {activity.activity}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        {activity.description}
                      </p>
                      {activity.materials_needed && (
                        <p className="text-xs text-green-600 dark:text-green-500 mt-1 italic">
                          Materials: {activity.materials_needed}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics */}
            {summary.metrics && (
              <div className="px-4 pb-4 flex flex-wrap gap-3">
                {summary.metrics.topics_covered !== undefined && (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                    {summary.metrics.topics_covered} topics covered
                  </span>
                )}
                {summary.metrics.total_minutes !== undefined && (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                    {summary.metrics.total_minutes} minutes studied
                  </span>
                )}
                {summary.metrics.newly_mastered && summary.metrics.newly_mastered.length > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400">
                    {summary.metrics.newly_mastered.length} topics mastered
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {summaries.length === 0 && !loading && selectedChildId && (
        <div className="text-center py-12">
          <span className="text-4xl mb-3 block">📋</span>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No weekly summaries yet. Generate one to see your child's progress!
          </p>
        </div>
      )}
    </div>
  );
};

export default WeeklySummaryPage;
