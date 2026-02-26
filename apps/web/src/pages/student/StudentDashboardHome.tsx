// StudentDashboardHome - Main student dashboard at /dashboard/student. Shows today's tasks,
// AI insights, progress snapshot, learning streaks, and quick-action navigation cards.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../../store/studentStore';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { useTranslation } from 'react-i18next';
import {
  Sparkles, Rocket, Heart, BellRing, BookOpen, Trophy,
  Target, Play, Calendar, MessageCircle, Loader2, CheckCircle2
} from 'lucide-react';
import { getTodayDashboard } from '../../services/student/studentDashboardService';
import MoodCheckInModal from '../../components/student/MoodCheckInModal';
import type { MoodType } from '../../types/student';

interface DailyPlanItem {
  title: string;
  duration: number;
  type: string;
  completed: boolean;
}

const StudentDashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    setCurrentMood,
    counters,
    updateCounters,
    xp,
    level,
    currentStreak,
    updateXP,
    updateLevel,
    updateStreak,
  } = useStudentStore();
  const { ageGroup, borderRadius, useEmojis } = useAgeAdaptiveUI();

  const [greeting, setGreeting] = useState('');
  const [studentName, setStudentName] = useState('');
  const [planItems, setPlanItems] = useState<DailyPlanItem[]>([]);
  const [dailyQuote, setDailyQuote] = useState<{ quote: string; author: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMoodModal, setShowMoodModal] = useState(false);

  // Show mood modal on first login of the day
  useEffect(() => {
    const lastCheckIn = localStorage.getItem('last_mood_checkin');
    const today = new Date().toDateString();
    if (lastCheckIn !== today) {
      setShowMoodModal(true);
    }
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getTodayDashboard();

        setGreeting(data.greeting || '');
        setStudentName(data.student_name || '');

        // Sync XP/level/streak to store
        if (data.xp_data) {
          updateXP(data.xp_data.current_xp);
          updateLevel(data.xp_data.level);
        }
        if (data.streak) {
          updateStreak(data.streak.current_streak, data.streak.longest_streak || 0);
        }
        if (data.mood) {
          setCurrentMood({ id: '', studentId: '', moodType: data.mood.mood_type as MoodType, energyLevel: data.mood.energy_level, timestamp: new Date() });
        }
        if (data.urgent_items) {
          updateCounters({ dueSoonCount: data.urgent_items.length });
        }

        // Daily plan items
        if (data.daily_plan?.items) {
          setPlanItems(data.daily_plan.items.slice(0, 3));
        }

        // Daily quote
        if (data.daily_quote) {
          setDailyQuote({
            quote: data.daily_quote.quote || (data.daily_quote as any).text || '',
            author: data.daily_quote.author || '',
          });
        }
      } catch {
        // Non-fatal — dashboard still shows store values
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Time-adaptive greeting fallback
  useEffect(() => {
    if (greeting) return;
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('student.dashboard.welcome_morning'));
    else if (hour < 18) setGreeting(t('student.dashboard.welcome_afternoon'));
    else setGreeting(t('student.dashboard.welcome_evening'));
  }, [greeting, t]);

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

  const getPlanItemColor = (type: string) => {
    const map: Record<string, string> = {
      lesson: 'bg-blue-500',
      assignment: 'bg-orange-500',
      quiz: 'bg-purple-500',
      revision: 'bg-green-500',
    };
    return map[type] || 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Mood Check-In Modal */}
      {showMoodModal && <MoodCheckInModal onClose={() => setShowMoodModal(false)} />}

      {/* Time-adaptive Greeting */}
      <div className={`p-6 bg-gradient-to-r from-[#FF0000]/20 to-purple-500/20 ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 dark:text-white/60">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading your dashboard…</span>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {greeting}{studentName ? `, ${studentName}` : ''}!{' '}
              {useEmojis && (ageGroup === 'young' ? '🌟' : ageGroup === 'tween' ? '👋' : '')}
            </h1>
            <p className="text-gray-600 dark:text-white/70">
              {ageGroup === 'young'
                ? "Let's have a great day of learning and fun!"
                : ageGroup === 'tween'
                ? "Ready to learn something amazing today?"
                : "Welcome back. Let's make today productive."}
            </p>
          </>
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

      {/* Today's Plan */}
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
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 dark:text-white/60 py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading plan…</span>
          </div>
        ) : planItems.length > 0 ? (
          <div className="space-y-3">
            {planItems.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 bg-gray-50 dark:bg-white/5 ${borderRadius} border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 ${item.completed ? 'bg-green-500' : getPlanItemColor(item.type)} rounded-full`} />
                  <div className="flex-1">
                    <div className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                      {item.title}
                      {item.completed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-white/60">{item.duration} min · {item.type}</div>
                  </div>
                  {!item.completed && (
                    <button
                      onClick={() => navigate('/dashboard/student/today/ai-plan')}
                      className="px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-white text-sm rounded-lg transition-colors"
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-white/50 text-sm py-2">
            No plan for today yet.{' '}
            <button onClick={() => navigate('/dashboard/student/today/ai-plan')} className="text-[#FF0000] underline">Generate one →</button>
          </p>
        )}
      </div>

      {/* Daily Quote */}
      <div className={`p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-start gap-4">
          <BookOpen className="w-8 h-8 text-purple-400 shrink-0" />
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500 dark:text-white/60">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading quote…
            </div>
          ) : dailyQuote?.quote ? (
            <div>
              <p className="text-lg text-gray-900 dark:text-white italic mb-2">"{dailyQuote.quote}"</p>
              {dailyQuote.author && (
                <p className="text-sm text-gray-500 dark:text-white/60">— {dailyQuote.author}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-white/60 italic">
              "The beautiful thing about learning is that no one can take it away from you."
            </p>
          )}
        </div>
      </div>

      {/* Mood update link */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/dashboard/student/today/mood')}
          className="text-sm text-gray-400 dark:text-white/40 hover:text-[#FF0000] flex items-center gap-1"
        >
          <Heart className="w-4 h-4" /> Update mood
        </button>
      </div>
    </div>
  );
};

export default StudentDashboardHome;
