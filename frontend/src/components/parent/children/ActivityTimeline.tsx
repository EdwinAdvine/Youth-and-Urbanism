/**
 * Activity Timeline Component
 *
 * Displays daily activity data using Recharts area chart.
 */

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Clock, BookOpen, Target } from 'lucide-react';
import type { ActivityDay } from '../../../types/parent';

interface ActivityTimelineProps {
  dailyActivity: ActivityDay[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ dailyActivity }) => {
  // Format data for chart
  const chartData = dailyActivity.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    minutes: day.total_minutes,
    sessions: day.sessions_count,
    lessons: day.lessons_completed,
  })).reverse(); // Reverse to show oldest to newest

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-3 shadow-xl">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{data.date}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-gray-700 dark:text-white/80">{data.minutes} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3 text-green-500" />
              <span className="text-xs text-gray-700 dark:text-white/80">{data.sessions} sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-3 h-3 text-purple-500" />
              <span className="text-xs text-gray-700 dark:text-white/80">{data.lessons} lessons</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate totals
  const totalMinutes = dailyActivity.reduce((sum, day) => sum + (day.total_minutes ?? day.minutes ?? 0), 0);
  const totalSessions = dailyActivity.reduce((sum, day) => sum + (day.sessions_count ?? day.sessions ?? 0), 0);
  const totalLessons = dailyActivity.reduce((sum, day) => sum + (day.lessons_completed ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-xs text-gray-500 dark:text-white/60">Total Time</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMinutes}m</p>
          <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Last 7 days</p>
        </div>

        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-xs text-gray-500 dark:text-white/60">Sessions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSessions}</p>
          <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Last 7 days</p>
        </div>

        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-xs text-gray-500 dark:text-white/60">Lessons</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLessons}</p>
          <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Completed</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Daily Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E40000" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E40000" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#ffffff80', fontSize: 12 }}
              stroke="#22272B"
            />
            <YAxis
              tick={{ fill: '#ffffff80', fontSize: 12 }}
              stroke="#22272B"
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#ffffff60' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#E40000"
              fillOpacity={1}
              fill="url(#colorMinutes)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityTimeline;
