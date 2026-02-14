import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../../store/studentStore';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { useTranslation } from 'react-i18next';
import {
  Sparkles, Rocket, Heart, BellRing, BookOpen, Trophy,
  Target, Play, Calendar, MessageCircle
} from 'lucide-react';

const StudentDashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    currentStreak,
    currentMood,
    setShowMoodModal,
    counters,
    xp,
    level
  } = useStudentStore();
  const { ageGroup, borderRadius, useEmojis } = useAgeAdaptiveUI();
  const [greeting, setGreeting] = useState('');

  // Time-adaptive greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('student.dashboard.welcome_morning'));
    else if (hour < 18) setGreeting(t('student.dashboard.welcome_afternoon'));
    else setGreeting(t('student.dashboard.welcome_evening'));
  }, [t]);

  // Show mood modal on first login if not checked in today
  useEffect(() => {
    const lastCheckIn = localStorage.getItem('last_mood_checkin');
    const today = new Date().toDateString();
    if (lastCheckIn !== today) {
      setShowMoodModal(true);
    }
  }, [setShowMoodModal]);

  const stats = [
    {
      title: 'XP Points',
      value: xp.toLocaleString(),
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500',
      onClick: () => navigate('/dashboard/student/learning-map')
    },
    {
      title: 'Current Level',
      value: level,
      icon: <Trophy className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      onClick: () => navigate('/dashboard/student/achievements/gallery')
    },
    {
      title: 'Streak Days',
      value: currentStreak,
      icon: <Rocket className="w-6 h-6" />,
      color: 'from-red-500 to-orange-500',
      onClick: () => navigate('/dashboard/student/today/streak')
    },
    {
      title: 'Due Soon',
      value: counters.dueSoonCount,
      icon: <BellRing className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      onClick: () => navigate('/dashboard/student/today/urgent')
    }
  ];

  const quickActions = [
    {
      title: 'Chat with AI',
      icon: <MessageCircle className="w-5 h-5" />,
      path: '/dashboard/student/ai-tutor/chat',
      color: 'bg-gradient-to-br from-blue-500 to-purple-500'
    },
    {
      title: "Today's Plan",
      icon: <Target className="w-5 h-5" />,
      path: '/dashboard/student/today/ai-plan',
      color: 'bg-gradient-to-br from-green-500 to-teal-500'
    },
    {
      title: 'Start Learning',
      icon: <Play className="w-5 h-5" />,
      path: '/dashboard/student/courses/enrolled',
      color: 'bg-gradient-to-br from-red-500 to-pink-500'
    },
    {
      title: 'Join Live',
      icon: <Calendar className="w-5 h-5" />,
      path: '/dashboard/student/live/join',
      color: 'bg-gradient-to-br from-orange-500 to-yellow-500',
      badge: counters.activeLiveSessions
    }
  ];

  return (
    <div className="space-y-6">
      {/* Time-adaptive Greeting */}
      <div className={`p-6 bg-gradient-to-r from-[#FF0000]/20 to-purple-500/20 ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {greeting}! {useEmojis && (ageGroup === 'young' ? '🌟' : ageGroup === 'tween' ? '👋' : '')}
        </h1>
        <p className="text-gray-600 dark:text-white/70">
          {ageGroup === 'young'
            ? "Let's have a great day of learning and fun!"
            : ageGroup === 'tween'
            ? "Ready to learn something amazing today?"
            : "Welcome back. Let's make today productive."}
        </p>
        {currentMood && (
          <div className="mt-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            <span className="text-gray-700 dark:text-white/80 text-sm">
              Feeling: <span className="capitalize text-gray-900 dark:text-white">{currentMood.moodType}</span>
            </span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <button
            key={index}
            onClick={stat.onClick}
            className={`p-6 bg-gradient-to-br ${stat.color} ${borderRadius} border border-gray-200 dark:border-white/10
              hover:scale-105 transition-transform duration-200 text-left`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gray-200 dark:bg-white/20 rounded-lg">
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-700 dark:text-white/80">{stat.title}</div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`relative p-6 ${action.color} ${borderRadius} hover:scale-105 transition-transform duration-200`}
            >
              {action.badge !== undefined && action.badge > 0 && (
                <span className="absolute top-2 right-2 px-2 py-1 text-xs bg-white text-black rounded-full font-bold">
                  {action.badge}
                </span>
              )}
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-gray-200 dark:bg-white/20 rounded-lg">
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{action.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity / Daily Plan Preview */}
      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today's Plan</h2>
          <button
            onClick={() => navigate('/dashboard/student/today/ai-plan')}
            className="text-sm text-[#FF0000] hover:text-[#FF0000]/80"
          >
            View Full Plan →
          </button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`p-4 bg-gray-50 dark:bg-white/5 ${borderRadius} border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-gray-900 dark:text-white font-medium">Sample Activity {item}</div>
                  <div className="text-sm text-gray-500 dark:text-white/60">30 minutes</div>
                </div>
                <button onClick={() => navigate('/dashboard/student/today/ai-plan')} className="px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm rounded-lg transition-colors">
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Quote */}
      <div className={`p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-start gap-4">
          <BookOpen className="w-8 h-8 text-purple-400 flex-shrink-0" />
          <div>
            <p className="text-lg text-gray-900 dark:text-white italic mb-2">
              "The beautiful thing about learning is that no one can take it away from you."
            </p>
            <p className="text-sm text-gray-500 dark:text-white/60">— B.B. King</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardHome;
