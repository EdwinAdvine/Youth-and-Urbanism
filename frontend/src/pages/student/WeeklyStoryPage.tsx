import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { BookOpen, Sparkles, Share2, ChevronLeft, ChevronRight, Trophy, TrendingUp, Clock } from 'lucide-react';

const WeeklyStoryPage: React.FC = () => {
  const { borderRadius, ageGroup } = useAgeAdaptiveUI();

  const weekMetrics = {
    totalMinutes: 245,
    lessonsCompleted: 12,
    quizzesTaken: 3,
    xpEarned: 580,
    streakDays: 7,
    topSubject: 'Mathematics',
    improvement: '+12%',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Weekly Learning Story</h1>
          <p className="text-gray-600 dark:text-white/70">Feb 10 - Feb 16, 2026</p>
        </div>
        <div className="flex gap-2">
          <button className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius} text-gray-900 dark:text-white`}><ChevronLeft className="w-5 h-5" /></button>
          <button className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius} text-gray-900 dark:text-white`}><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* AI-Generated Story */}
      <div className={`p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 ${borderRadius} border border-purple-500/30`}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-purple-300 text-sm font-medium">AI-Generated Weekly Summary</span>
        </div>
        <div className="text-gray-700 dark:text-white/80 leading-relaxed space-y-3">
          <p>{ageGroup === 'young'
            ? "What an amazing week you had! 🌟 You spent 4 hours and 5 minutes learning, which is fantastic! You were especially great at Mathematics this week, completing 12 lessons and 3 quizzes."
            : "This week you demonstrated consistent dedication to your studies. With 245 minutes of focused learning across multiple subjects, you showed particular strength in Mathematics."
          }</p>
          <p>{ageGroup === 'young'
            ? "Your 7-day streak shows how committed you are. Keep it up and you'll unlock the Month Champion badge! 🏆"
            : "Your 7-day learning streak reflects strong discipline. Your overall performance improved by 12% compared to last week, with notable gains in fractions and creative writing."
          }</p>
          <p>Keep up the momentum — your learning journey is inspiring!</p>
        </div>
      </div>

      {/* Week Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Study Time', value: `${Math.floor(weekMetrics.totalMinutes / 60)}h ${weekMetrics.totalMinutes % 60}m`, icon: <Clock className="w-5 h-5 text-blue-400" /> },
          { label: 'Lessons Done', value: weekMetrics.lessonsCompleted, icon: <BookOpen className="w-5 h-5 text-green-400" /> },
          { label: 'XP Earned', value: `+${weekMetrics.xpEarned}`, icon: <Trophy className="w-5 h-5 text-yellow-400" /> },
          { label: 'Improvement', value: weekMetrics.improvement, icon: <TrendingUp className="w-5 h-5 text-green-400" /> },
        ].map((metric, i) => (
          <div key={i} className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
            <div className="flex justify-center mb-2">{metric.icon}</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
            <div className="text-gray-400 dark:text-white/40 text-sm">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Share */}
      <div className="flex gap-3">
        <button className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}>
          <Share2 className="w-4 h-4" /> Share with Parent
        </button>
        <button className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}>
          <Share2 className="w-4 h-4" /> Download PDF
        </button>
      </div>
    </div>
  );
};

export default WeeklyStoryPage;
