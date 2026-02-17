import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Award, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getMyPerformance } from '@/services/staff/staffTeamService';
import type { MyPerformanceData } from '@/types/staff';

const MyPerformancePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MyPerformanceData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyPerformance();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-gray-100 dark:bg-[#22272B] rounded animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-20 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-white text-sm rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatMinutes = (mins: number): string => {
    if (mins < 60) return `${Math.round(mins)}m`;
    const hours = Math.floor(mins / 60);
    const remainder = Math.round(mins % 60);
    return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Performance</h1>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data?.tickets_resolved ?? 0}
                </p>
                <p className="text-xs text-gray-400 dark:text-white/40">Tickets Resolved</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatMinutes(data?.response_time_avg_minutes ?? 0)}
                </p>
                <p className="text-xs text-gray-400 dark:text-white/40">Avg Response Time</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data?.quality_score ?? 0}%
                </p>
                <p className="text-xs text-gray-400 dark:text-white/40">Quality Score</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data?.content_reviewed ?? 0}
                </p>
                <p className="text-xs text-gray-400 dark:text-white/40">Content Reviewed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Goals */}
        {data?.goals && data.goals.length > 0 && (
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Goals</h2>
            <div className="space-y-4">
              {data.goals.map((goal) => {
                const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
                return (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-white/70">{goal.metric}</span>
                      <span className="text-xs text-gray-400 dark:text-white/40">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-green-500' : progress >= 70 ? 'bg-blue-500' : 'bg-orange-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Trends</h2>
          {data?.trend && data.trend.length > 0 ? (
            <div className="space-y-2">
              {data.trend.slice(0, 10).map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-[#22272B]/30 rounded-lg">
                  <span className="text-xs text-gray-500 dark:text-white/50">{entry.date}</span>
                  <span className="text-xs text-gray-700 dark:text-white/70">{entry.metric}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{entry.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-[#22272B]/30 rounded-lg">
              <p className="text-sm text-gray-400 dark:text-white/30">No trend data available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPerformancePage;
