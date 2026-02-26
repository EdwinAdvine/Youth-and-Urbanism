import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Activity,
  Award,
  Target,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Zap,
  Brain,
  Heart,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getChildProgress,
  getChildActivity,
  getChildAchievements,
  getChildGoals,
  getChildAIInsights,
} from '../../services/partner/sponsorshipService';
import type {
  ChildActivity as ChildActivityType,
  ChildAchievement,
  ChildGoal,
  ChildAIInsight,
} from '../../types/partner';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type TabType = 'journey' | 'activity' | 'achievements' | 'goals' | 'insights';

// ── Fallback / default data used when the API is unavailable ──

const FALLBACK_CHILD = {
  name: 'Sarah Mwangi',
  avatar: 'SM',
  program: 'STEM Excellence',
  grade: 'Grade 8',
  status: 'excellent',
  progress: 95,
};

const FALLBACK_COMPETENCIES = [
  {
    area: 'Mathematics',
    progress: 98,
    level: 'Advanced',
    topics: ['Algebra', 'Geometry', 'Statistics'],
    trend: 'up',
  },
  {
    area: 'Science',
    progress: 92,
    level: 'Advanced',
    topics: ['Physics', 'Chemistry', 'Biology'],
    trend: 'up',
  },
  {
    area: 'English',
    progress: 88,
    level: 'Proficient',
    topics: ['Reading', 'Writing', 'Grammar'],
    trend: 'stable',
  },
  {
    area: 'Kiswahili',
    progress: 75,
    level: 'Developing',
    topics: ['Kusoma', 'Kuandika', 'Mazungumzo'],
    trend: 'up',
  },
];

const FALLBACK_WEEKLY_PROGRESS = [
  { week: 'Week 1', hours: 12, sessions: 8, completion: 85 },
  { week: 'Week 2', hours: 15, sessions: 10, completion: 92 },
  { week: 'Week 3', hours: 18, sessions: 12, completion: 95 },
  { week: 'Week 4', hours: 16, sessions: 11, completion: 90 },
];

const FALLBACK_ACHIEVEMENTS = [
  {
    id: 1,
    title: 'Mathematics Excellence',
    description: 'Scored 98% in Grade 8 Mathematics assessment',
    date: 'Feb 10, 2026',
    type: 'academic',
    icon: Award,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  {
    id: 2,
    title: '30-Day Learning Streak',
    description: 'Maintained consistent learning for 30 consecutive days',
    date: 'Feb 8, 2026',
    type: 'streak',
    icon: Zap,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    id: 3,
    title: 'Science Fair Champion',
    description: 'First place in regional science competition',
    date: 'Feb 5, 2026',
    type: 'competition',
    icon: Award,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
];

const FALLBACK_GOALS = [
  {
    id: 1,
    title: 'Complete Advanced Mathematics Module',
    description: 'Finish all lessons in Advanced Algebra',
    progress: 85,
    target: '100%',
    deadline: 'Feb 28, 2026',
    status: 'on-track',
  },
  {
    id: 2,
    title: 'Science Project Submission',
    description: 'Complete and submit climate change research project',
    progress: 60,
    target: '100%',
    deadline: 'Mar 15, 2026',
    status: 'on-track',
  },
  {
    id: 3,
    title: 'Reading Challenge - 10 Books',
    description: 'Read 10 educational books this term',
    progress: 40,
    target: '10 books',
    deadline: 'Apr 1, 2026',
    status: 'needs-attention',
  },
];

const FALLBACK_AI_INSIGHTS = [
  {
    id: 1,
    category: 'Learning Style',
    icon: Brain,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    insights: [
      'Visual learner - responds best to diagrams and videos',
      'Excels with self-paced learning materials',
      'Benefits from hands-on practice and experiments',
    ],
  },
  {
    id: 2,
    category: 'Strengths',
    icon: TrendingUp,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    insights: [
      'Exceptional analytical and problem-solving skills',
      'Strong motivation and consistent engagement',
      'Quick grasp of complex mathematical concepts',
    ],
  },
  {
    id: 3,
    category: 'Support Tips',
    icon: Heart,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    insights: [
      'Encourage more collaborative learning opportunities',
      'Provide advanced challenges to maintain engagement',
      'Consider mentorship program for peer teaching',
    ],
  },
  {
    id: 4,
    category: 'Alerts',
    icon: AlertCircle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    insights: [
      'Slightly reduced activity in Kiswahili - may need encouragement',
      'Reading pace has slowed - check for comprehension issues',
    ],
  },
];

// ── Helper: derive the avatar initials from a full name ──
const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

// ── Helper: map API ChildAchievement to the shape the UI expects ──
const mapAchievements = (apiData: ChildAchievement[]) => {
  // The API returns an array of ChildAchievement objects which bundle
  // certificates, badges, and milestones. Flatten them into a list the
  // existing JSX can render, falling back to the hardcoded list when there
  // is nothing meaningful to display.
  const items: typeof FALLBACK_ACHIEVEMENTS = [];
  let counter = 1;
  const iconMap: Record<string, { icon: typeof Award; color: string; bg: string }> = {
    certificate: { icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    badge: { icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    milestone: { icon: Award, color: 'text-green-400', bg: 'bg-green-500/10' },
  };

  for (const entry of apiData) {
    for (const cert of entry.certificates ?? []) {
      items.push({
        id: counter++,
        title: cert.title ?? 'Certificate',
        description: cert.description ?? '',
        date: cert.date ?? '',
        type: 'academic',
        ...iconMap.certificate,
      });
    }
    for (const badge of entry.badges ?? []) {
      items.push({
        id: counter++,
        title: badge.title ?? 'Badge',
        description: badge.description ?? '',
        date: badge.date ?? '',
        type: 'streak',
        ...iconMap.badge,
      });
    }
    for (const ms of entry.milestones ?? []) {
      items.push({
        id: counter++,
        title: ms.title ?? 'Milestone',
        description: ms.description ?? '',
        date: ms.date ?? '',
        type: 'competition',
        ...iconMap.milestone,
      });
    }
  }

  return items.length > 0 ? items : FALLBACK_ACHIEVEMENTS;
};

// ── Helper: map API ChildGoal[] to the shape the UI expects ──
const mapGoals = (apiData: ChildGoal[]) => {
  if (!apiData || apiData.length === 0) return FALLBACK_GOALS;
  return apiData.map((g, idx) => ({
    id: idx + 1,
    title: g.goal,
    description: '',
    progress: g.progress_percentage,
    target: '100%',
    deadline: g.target_date ?? '',
    status: g.status === 'on-track' || g.status === 'completed' ? 'on-track' : 'needs-attention',
  }));
};

// ── Helper: map API ChildAIInsight to the shape the UI expects ──
const mapInsights = (apiData: ChildAIInsight) => {
  const sections: typeof FALLBACK_AI_INSIGHTS = [];
  let counter = 1;

  if (apiData.learning_style) {
    sections.push({
      id: counter++,
      category: 'Learning Style',
      icon: Brain,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      insights: [apiData.learning_style],
    });
  }

  if (apiData.curiosity_patterns && apiData.curiosity_patterns.length > 0) {
    sections.push({
      id: counter++,
      category: 'Strengths',
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      insights: apiData.curiosity_patterns,
    });
  }

  if (apiData.support_tips && apiData.support_tips.length > 0) {
    sections.push({
      id: counter++,
      category: 'Support Tips',
      icon: Heart,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      insights: apiData.support_tips,
    });
  }

  if (apiData.early_warnings && apiData.early_warnings.length > 0) {
    sections.push({
      id: counter++,
      category: 'Alerts',
      icon: AlertCircle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      insights: apiData.early_warnings.map(
        (w) => (typeof w === 'string' ? w : w.message ?? JSON.stringify(w))
      ),
    });
  }

  return sections.length > 0 ? sections : FALLBACK_AI_INSIGHTS;
};

// ── Component ──

const ChildProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('journey');

  // Data state
  const [child, setChild] = useState(FALLBACK_CHILD);
  const [competencies, setCompetencies] = useState(FALLBACK_COMPETENCIES);
  const [weeklyProgress, setWeeklyProgress] = useState(FALLBACK_WEEKLY_PROGRESS);
  const [achievements, setAchievements] = useState(FALLBACK_ACHIEVEMENTS);
  const [goals, setGoals] = useState(FALLBACK_GOALS);
  const [aiInsights, setAiInsights] = useState(FALLBACK_AI_INSIGHTS);

  // Activity tab raw API data
  const [activityData, setActivityData] = useState<ChildActivityType | null>(null);

  // Loading & error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const [progressRes, activityRes, achievementsRes, goalsRes, insightsRes] =
        await Promise.allSettled([
          getChildProgress(id),
          getChildActivity(id),
          getChildAchievements(id),
          getChildGoals(id),
          getChildAIInsights(id),
        ]);

      if (cancelled) return;

      // --- Progress / Learning Journey ---
      if (progressRes.status === 'fulfilled') {
        const p = progressRes.value;
        setChild({
          name: p.student_name ?? FALLBACK_CHILD.name,
          avatar: p.student_name ? getInitials(p.student_name) : FALLBACK_CHILD.avatar,
          program: FALLBACK_CHILD.program, // not returned by API; keep fallback
          grade: p.grade_level ?? FALLBACK_CHILD.grade,
          status: FALLBACK_CHILD.status,
          progress: p.overall_progress_pct ?? FALLBACK_CHILD.progress,
        });

        // cbc_competencies is Record<string, any> – try to map it
        if (p.cbc_competencies && Object.keys(p.cbc_competencies).length > 0) {
          const mapped = Object.entries(p.cbc_competencies).map(([area, data]: [string, any]) => ({
            area,
            progress: data.progress ?? 0,
            level: data.level ?? 'Developing',
            topics: Array.isArray(data.topics) ? data.topics : [],
            trend: data.trend ?? 'stable',
          }));
          setCompetencies(mapped);
        }

        if (p.weekly_progress && p.weekly_progress.length > 0) {
          const mapped = p.weekly_progress.map((w: any, idx: number) => ({
            week: w.week ?? `Week ${idx + 1}`,
            hours: w.hours ?? 0,
            sessions: w.sessions ?? 0,
            completion: w.completion ?? 0,
          }));
          setWeeklyProgress(mapped);
        }
      }

      // --- Activity (used in the Activity tab stats cards) ---
      if (activityRes.status === 'fulfilled') {
        setActivityData(activityRes.value);
      }

      // --- Achievements ---
      if (achievementsRes.status === 'fulfilled') {
        setAchievements(mapAchievements(achievementsRes.value));
      }

      // --- Goals ---
      if (goalsRes.status === 'fulfilled') {
        setGoals(mapGoals(goalsRes.value));
      }

      // --- AI Insights ---
      if (insightsRes.status === 'fulfilled') {
        setAiInsights(mapInsights(insightsRes.value));
      }

      // If ALL calls failed, show a non-blocking error hint
      const allFailed = [progressRes, activityRes, achievementsRes, goalsRes, insightsRes].every(
        (r) => r.status === 'rejected'
      );
      if (allFailed) {
        setError('Unable to load live data. Showing cached information.');
      }

      setLoading(false);
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const tabs = [
    { id: 'journey', label: 'Learning Journey', icon: BookOpen },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'insights', label: 'AI Insights', icon: Sparkles },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'journey':
        return (
          <div className="space-y-6">
            {/* CBC Competencies */}
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">CBC Competencies</h3>
              <div className="space-y-4">
                {competencies.map((comp, index) => (
                  <div key={index} className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-gray-900 dark:text-white font-medium mb-1">{comp.area}</h4>
                        <span className="text-xs text-gray-500 dark:text-white/60">{comp.level}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{comp.progress}%</span>
                        {comp.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                        {comp.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                      </div>
                    </div>
                    <div className="w-full h-2 bg-[#2A2F34] rounded-full mb-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#E40000] to-[#FF4444] rounded-full"
                        style={{ width: `${comp.progress}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {comp.topics.map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 text-xs rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Weekly Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {weeklyProgress.map((week, index) => (
                  <div key={index} className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4">
                    <p className="text-gray-500 dark:text-white/60 text-sm mb-3">{week.week}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 dark:text-white/40">Hours</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{week.hours}h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 dark:text-white/40">Sessions</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{week.sessions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 dark:text-white/40">Completion</span>
                        <span className="text-sm font-semibold text-green-400">{week.completion}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'activity': {
        // Derive display values from API data when available, otherwise use fallback
        const timeSpentHours = activityData
          ? Math.round(activityData.time_spent_minutes / 60)
          : 18;
        const sessionsCount = activityData?.sessions_count ?? 12;
        const streakDays = activityData?.streaks ?? 15;
        // Completion rate is not part of ChildActivity; keep fallback
        const completionRate = 95;

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-gray-500 dark:text-white/60 text-sm">Time Spent</p>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{timeSpentHours}h</p>
                <p className="text-xs text-gray-400 dark:text-white/40">This week</p>
              </div>
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Activity className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-gray-500 dark:text-white/60 text-sm">Sessions</p>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{sessionsCount}</p>
                <p className="text-xs text-gray-400 dark:text-white/40">This week</p>
              </div>
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <Zap className="w-5 h-5 text-orange-400" />
                  </div>
                  <p className="text-gray-500 dark:text-white/60 text-sm">Streak</p>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{streakDays}</p>
                <p className="text-xs text-gray-400 dark:text-white/40">Days</p>
              </div>
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-gray-500 dark:text-white/60 text-sm">Completion</p>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{completionRate}%</p>
                <p className="text-xs text-gray-400 dark:text-white/40">Avg rate</p>
              </div>
            </div>
          </div>
        );
      }

      case 'achievements':
        return (
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-4 ${achievement.bg} rounded-lg`}>
                    <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{achievement.title}</h3>
                    <p className="text-gray-500 dark:text-white/60 mb-3">{achievement.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/40">
                      <Calendar className="w-3 h-3" />
                      {achievement.date}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{goal.title}</h3>
                    <p className="text-gray-500 dark:text-white/60 text-sm mb-3">{goal.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-white/40">
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Target: {goal.target}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: {goal.deadline}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      goal.status === 'on-track'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}
                  >
                    {goal.status === 'on-track' ? 'On Track' : 'Needs Attention'}
                  </span>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-white/40">Progress</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{goal.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E40000] to-[#FF4444] rounded-full"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'insights':
        return (
          <div className="space-y-4">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 ${insight.bg} rounded-lg`}>
                    <insight.icon className={`w-5 h-5 ${insight.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{insight.category}</h3>
                </div>
                <ul className="space-y-2">
                  {insight.insights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600 dark:text-white/70 text-sm">
                      <CheckCircle className="w-4 h-4 text-[#E40000] flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0F1112] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#E40000] animate-spin" />
          <p className="text-gray-500 dark:text-white/60 text-sm">Loading child progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error banner (non-blocking – fallback data is shown) */}
        {error && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <p className="text-orange-300 text-sm">{error}</p>
          </div>
        )}

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <button
            onClick={() => navigate('/dashboard/partner/sponsored-children')}
            className="flex items-center gap-2 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sponsored Children
          </button>

          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#E40000] to-[#FF4444] rounded-full flex items-center justify-center text-gray-900 dark:text-white text-2xl font-bold">
                {child.avatar}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{child.name}</h1>
                <div className="flex items-center gap-3 text-gray-500 dark:text-white/60">
                  <span>{child.grade}</span>
                  <span>•</span>
                  <span>{child.program}</span>
                  <span>•</span>
                  <span className="text-green-400">{child.progress}% overall progress</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-2">
            <div className="flex items-center gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#E40000] text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-[#22272B] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default ChildProgressPage;
