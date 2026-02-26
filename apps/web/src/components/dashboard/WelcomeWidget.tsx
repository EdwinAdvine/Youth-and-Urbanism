import React from 'react';
import { Calendar, Zap, Star, TrendingUp } from 'lucide-react';

interface WelcomeWidgetProps {
  onAction?: () => void;
}

const WelcomeWidget: React.FC<WelcomeWidgetProps> = ({ onAction }) => {
  // Mock user data for direct dashboard access
  const user = {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'student' as const,
    createdAt: new Date(),
    lastLogin: new Date(),
    preferences: {
      theme: 'light' as const,
      language: 'en' as const,
      notifications: true,
      emailNotifications: true,
      pushNotifications: false,
      dashboardWidgets: []
    }
  };

  // Mock data for demonstration
  const currentStreak = 15;
  const nextMilestone = 20;
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "The beautiful thing about learning is nobody can take it away from you.",
      "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
      "Your attitude, not your aptitude, will determine your altitude.",
      "The expert in anything was once a beginner.",
      "The only person who is educated is the one who has learned how to learn and change."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <div className="bg-gradient-to-br from-white dark:from-[#181C1F] to-[#22272B] border border-[#2A3035] rounded-2xl p-6 sm:p-8 shadow-lg shadow-black/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FF0000] to-[#E40000] rounded-full flex items-center justify-center text-gray-900 dark:text-white font-bold text-xl shadow-lg shadow-[#FF0000]/30">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {getGreeting()}, {user?.name}!
            </h2>
            <p className="text-gray-500 dark:text-white/60 text-sm sm:text-base mt-1">{today}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-[#2A3035] px-3 py-2 rounded-lg">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-gray-700 dark:text-white/80">Active Learner</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Learning Streak */}
        <div className="bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 uppercase tracking-wide">Learning Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{currentStreak} days</p>
              <p className="text-xs text-gray-500 dark:text-white/60 mt-1">Keep it going!</p>
            </div>
            <div className="text-right">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-white/60 mb-1">
              <span>Next milestone: {nextMilestone} days</span>
              <span>{Math.round((currentStreak / nextMilestone) * 100)}%</span>
            </div>
            <div className="w-full bg-[#2A3035] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#FF0000] to-[#E40000] h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((currentStreak / nextMilestone) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Today's Goal */}
        <div className="bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 uppercase tracking-wide">Today's Goal</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">3 lessons</p>
              <p className="text-xs text-green-400 mt-1">+2 completed</p>
            </div>
            <div className="text-right">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-white/60 mb-1">
              <span>Progress</span>
              <span>67%</span>
            </div>
            <div className="w-full bg-[#2A3035] rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-2/3"></div>
            </div>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 uppercase tracking-wide">Wallet Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">KES 1,250</p>
              <p className="text-xs text-green-400 mt-1">+KES 250 this month</p>
            </div>
            <div className="text-right">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="bg-gradient-to-r from-[#2A3035] to-[#22272B] border border-[#2A3035] rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Star className="w-4 h-4 text-gray-900 dark:text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-700 dark:text-white/80 italic">
              "{getMotivationalQuote()}"
            </p>
            <p className="text-xs text-gray-500 dark:text-white/60 mt-2">— Motivational Quote of the Day</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          onClick={onAction}
          className="flex-1 bg-gradient-to-r from-[#FF0000] to-[#E40000] hover:from-[#E40000] hover:to-[#CC0000] text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg shadow-[#FF0000]/30"
        >
          Continue Learning
        </button>
        <button
          className="flex-1 border border-[#2A3035] hover:border-[#FF0000] text-gray-900 dark:text-white hover:text-[#FF0000] font-semibold py-3 px-6 rounded-xl transition-all duration-200"
        >
          View Progress
        </button>
      </div>
    </div>
  );
};

export default WelcomeWidget;