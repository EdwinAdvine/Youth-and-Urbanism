import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Flame, Shield, Calendar, Trophy, TrendingUp } from 'lucide-react';
import HeatmapChart from '../../components/student/charts/HeatmapChart';

const TrackStreaksPage: React.FC = () => {
  const { borderRadius, ageGroup } = useAgeAdaptiveUI();

  const heatmapData = Array.from({ length: 84 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (83 - i));
    return { date: date.toISOString().split('T')[0], value: Math.random() > 0.2 ? Math.ceil(Math.random() * 4) : 0 };
  });

  const streakStats = {
    current: 12,
    longest: 23,
    shields: 2,
    totalDays: 67,
    thisMonth: 14,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Flame className="w-8 h-8 text-orange-400" /> Streak Tracker
        </h1>
        <p className="text-gray-600 dark:text-white/70">Consistency is the key to mastery</p>
      </div>

      {/* Current Streak */}
      <div className={`p-8 bg-gradient-to-br from-orange-500/20 to-red-500/20 ${borderRadius} border border-orange-500/30 text-center`}>
        <Flame className="w-16 h-16 text-orange-400 mx-auto mb-3" />
        <div className="text-6xl font-bold text-gray-900 dark:text-white mb-1">{streakStats.current}</div>
        <div className="text-gray-500 dark:text-white/60 text-lg">day streak {ageGroup === 'young' ? '🔥' : ''}</div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-sm">{streakStats.shields} streak shields remaining</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Current Streak', value: `${streakStats.current} days`, icon: <Flame className="w-5 h-5 text-orange-400" /> },
          { label: 'Longest Streak', value: `${streakStats.longest} days`, icon: <Trophy className="w-5 h-5 text-yellow-400" /> },
          { label: 'Total Active Days', value: streakStats.totalDays, icon: <Calendar className="w-5 h-5 text-blue-400" /> },
          { label: 'This Month', value: `${streakStats.thisMonth} days`, icon: <TrendingUp className="w-5 h-5 text-green-400" /> },
        ].map((stat, i) => (
          <div key={i} className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
            <div className="flex justify-center mb-2">{stat.icon}</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-gray-400 dark:text-white/40 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Activity Heatmap */}
      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-medium mb-4">Activity History (Last 12 Weeks)</h3>
        <HeatmapChart data={heatmapData} weeks={12} colorScheme="red" />
      </div>

      {/* Streak Shields */}
      <div className={`p-4 bg-blue-500/10 ${borderRadius} border border-blue-500/20`}>
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-900 dark:text-white font-medium text-sm">Streak Shields</p>
            <p className="text-gray-500 dark:text-white/60 text-sm mt-1">You have {streakStats.shields} streak shields. A shield protects your streak if you miss a day. You earn a new shield every 30 days of activity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackStreaksPage;
