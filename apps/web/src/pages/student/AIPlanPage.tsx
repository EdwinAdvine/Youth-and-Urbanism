/**
 * AIPlanPage — /dashboard/student/today/ai-plan
 *
 * Comprehensive merged learning plan page combining:
 *  1. Progress banner  — ahead / on track / catching up (from mastery data)
 *  2. Today's tasks    — daily plan items from the dashboard
 *  3. AI Learning Path — AI-generated curriculum activities
 *  4. Catch-up section — appears when student is behind on mastery
 *
 * Merges the former LearningPathPage (/ai-tutor/learning-path) into this page.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { getTodayDashboard } from '../../services/student/studentDashboardService';
import { getPlanWithProgress } from '../../services/student/studentAIService';
import {
  Clock, CheckCircle, GripVertical, Loader2, RefreshCw, AlertCircle,
  TrendingUp, TrendingDown, Minus, BookOpen, ChevronDown, ChevronUp,
  Sparkles, Bot, ArrowRight, Zap
} from 'lucide-react';
import type { DailyPlanItem } from '../../types/student';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface LearningActivity {
  topic: string;
  subject?: string;
  duration?: string;
  difficulty?: string;
  objective?: string;
}

interface PlanProgress {
  progress_status: 'ahead' | 'on_track' | 'catching_up';
  mastered_count: number;
  total_topics: number;
  catch_up_topics: Array<{ topic: string; subject: string; mastery_level: number }>;
  learning_path_text: string;
}

// ──────────────────────────────────────────────
// Progress banner config
// ──────────────────────────────────────────────
const progressConfig = {
  ahead: {
    icon: TrendingUp,
    label: 'Ahead of schedule',
    description: "You're doing great — you're ahead of the curriculum!",
    bgClass: 'bg-green-500/10 border-green-500/20',
    textClass: 'text-green-400',
    iconClass: 'text-green-400',
    pillClass: 'bg-green-500/20 text-green-300',
  },
  on_track: {
    icon: Minus,
    label: 'On track',
    description: "You're keeping up perfectly with your learning plan.",
    bgClass: 'bg-blue-500/10 border-blue-500/20',
    textClass: 'text-blue-400',
    iconClass: 'text-blue-400',
    pillClass: 'bg-blue-500/20 text-blue-300',
  },
  catching_up: {
    icon: TrendingDown,
    label: 'Catching up',
    description: "A little behind — no worries! Let's work through the catch-up topics below.",
    bgClass: 'bg-orange-500/10 border-orange-500/20',
    textClass: 'text-orange-400',
    iconClass: 'text-orange-400',
    pillClass: 'bg-orange-500/20 text-orange-300',
  },
};

// Parse AI-generated learning path text into structured activities
function parseActivities(text: string): LearningActivity[] {
  if (!text) return [];

  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 6).map((item: any) => ({
        topic: item.topic || item.title || String(item),
        subject: item.subject || item.learning_area || '',
        duration: item.duration ? `${item.duration} min` : '',
        difficulty: item.difficulty || '',
        objective: item.objective || item.learning_objective || '',
      }));
    }
  } catch {
    // Not JSON — parse as plain text
  }

  // Parse as numbered or bulleted list
  const lines = text.split(/\n/).filter((l) => l.trim());
  const activities: LearningActivity[] = [];

  for (const line of lines) {
    const clean = line.replace(/^[\d\-*•.]+\s*/, '').trim();
    if (clean.length > 5 && activities.length < 6) {
      activities.push({ topic: clean });
    }
  }

  return activities;
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────
const AIPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  const [planItems, setPlanItems] = useState<DailyPlanItem[]>([]);
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState<string | null>(null);

  const [progressData, setProgressData] = useState<PlanProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);

  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [showLearningPath, setShowLearningPath] = useState(true);
  const [showCatchUp, setShowCatchUp] = useState(true);

  const [regenerating, setRegenerating] = useState(false);

  // ── Fetch today's task plan ──
  const fetchPlan = useCallback(async () => {
    try {
      setPlanLoading(true);
      setPlanError(null);
      const data = await getTodayDashboard();
      if (data.daily_plan?.items) {
        setPlanItems(data.daily_plan.items);
      }
    } catch {
      setPlanError("Couldn't load today's plan — showing sample data");
      setPlanItems([
        { id: '1', title: 'Math Practice', duration: 30, type: 'lesson', completed: false, aiSuggested: true, priority: 'high', order: 1 },
        { id: '2', title: 'Reading Assignment', duration: 45, type: 'assignment', completed: false, aiSuggested: true, priority: 'medium', order: 2 },
        { id: '3', title: 'Science Quiz', duration: 20, type: 'quiz', completed: true, aiSuggested: true, priority: 'medium', order: 3 },
        { id: '4', title: 'Break Time', duration: 15, type: 'break', completed: false, aiSuggested: false, priority: 'low', order: 4 },
      ]);
    } finally {
      setPlanLoading(false);
    }
  }, []);

  // ── Fetch progress + AI learning path ──
  const fetchProgress = useCallback(async () => {
    try {
      setProgressLoading(true);
      const data = await getPlanWithProgress();
      setProgressData({
        progress_status: data.progress_status,
        mastered_count: data.mastered_count,
        total_topics: data.total_topics,
        catch_up_topics: data.catch_up_topics,
        learning_path_text: data.learning_path?.learning_path ?? '',
      });
      setActivities(parseActivities(data.learning_path?.learning_path ?? ''));
    } catch {
      // Fallback — show on_track without mastery data
      setProgressData({
        progress_status: 'on_track',
        mastered_count: 0,
        total_topics: 0,
        catch_up_topics: [],
        learning_path_text: '',
      });
    } finally {
      setProgressLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
    fetchProgress();
  }, [fetchPlan, fetchProgress]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    await Promise.all([fetchPlan(), fetchProgress()]);
    setRegenerating(false);
  };

  const handleToggleComplete = (itemId: string) => {
    setPlanItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleStart = (item: DailyPlanItem) => {
    if (item.type === 'lesson') {
      navigate(item.courseId ? `/dashboard/student/courses/${item.courseId}` : '/dashboard/student/courses/enrolled');
    } else if (item.type === 'assignment') {
      navigate('/dashboard/student/assignments/pending');
    } else if (item.type === 'quiz') {
      navigate('/dashboard/student/quizzes/practice');
    } else if (item.type === 'break') {
      navigate('/dashboard/student/today/mood');
    } else {
      navigate('/dashboard/student/courses/enrolled');
    }
  };

  const handleStartWithTutor = (topic: string) => {
    navigate(`/dashboard/student/ai-tutor/chat?topic=${encodeURIComponent(topic)}`);
  };

  const completedCount = planItems.filter((i) => i.completed).length;
  const progressPercent = planItems.length > 0 ? Math.round((completedCount / planItems.length) * 100) : 0;

  const statusCfg = progressConfig[progressData?.progress_status ?? 'on_track'];
  const StatusIcon = statusCfg.icon;

  const typeColors: Record<string, string> = {
    lesson: 'bg-blue-500/20 text-blue-400',
    assignment: 'bg-purple-500/20 text-purple-400',
    quiz: 'bg-orange-500/20 text-orange-400',
    break: 'bg-green-500/20 text-green-400',
  };

  const priorityDot: Record<string, string> = {
    high: 'bg-red-400',
    medium: 'bg-yellow-400',
    low: 'bg-green-400',
  };

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Today's Learning Plan</h1>
          <p className="text-gray-500 dark:text-white/60 text-sm">AI-curated plan based on your progress and curriculum</p>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 disabled:opacity-50 text-white ${borderRadius} flex items-center gap-2 text-sm`}
        >
          <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
      </div>

      {/* ── Section 1: Progress banner ── */}
      {progressLoading ? (
        <div className={`p-4 ${borderRadius} border border-gray-200 dark:border-[#22272B] bg-white dark:bg-[#181C1F] flex items-center gap-3`}>
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="text-gray-500 dark:text-white/60 text-sm">Analysing your progress…</span>
        </div>
      ) : progressData && (
        <div className={`p-5 ${borderRadius} border ${statusCfg.bgClass}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-6 h-6 ${statusCfg.iconClass}`} />
              <div>
                <span className={`text-base font-bold ${statusCfg.textClass}`}>{statusCfg.label}</span>
                <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5">{statusCfg.description}</p>
              </div>
            </div>
            {progressData.total_topics > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-3 py-1 ${borderRadius} font-mono text-sm ${statusCfg.pillClass}`}>
                  {progressData.mastered_count} / {progressData.total_topics} topics mastered
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Section 2: Today's tasks ── */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Today's Tasks
          </h2>
          <span className="text-sm text-gray-500 dark:text-white/60">
            {completedCount} / {planItems.length} done
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 mb-4">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {planError && (
          <div className={`mb-3 p-3 bg-yellow-500/10 ${borderRadius} border border-yellow-500/20 flex items-center gap-2 text-yellow-400 text-sm`}>
            <AlertCircle className="w-4 h-4" />
            {planError}
          </div>
        )}

        {planLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF0000]" />
          </div>
        ) : (
          <div className="space-y-2">
            {planItems.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 bg-gray-50 dark:bg-white/5 ${borderRadius} border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-400 dark:text-white/30 cursor-grab" />
                  <button onClick={() => handleToggleComplete(item.id)}>
                    {item.completed
                      ? <CheckCircle className="w-5 h-5 text-green-500" />
                      : <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-white/30" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {item.priority && (
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[item.priority] ?? 'bg-gray-400'}`} />
                      )}
                      <span className={`text-gray-900 dark:text-white text-sm font-medium truncate ${item.completed ? 'line-through opacity-50' : ''}`}>
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-white/50">
                      <span className={`px-2 py-0.5 rounded-full ${typeColors[item.type] ?? 'bg-gray-500/20 text-gray-400'}`}>
                        {item.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.duration} min
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => !item.completed && handleStart(item)}
                    disabled={item.completed}
                    className={`px-3 py-1.5 text-xs ${borderRadius} transition-colors ${
                      item.completed
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-[#FF0000] hover:bg-[#FF0000]/80 text-white'
                    }`}
                  >
                    {item.completed ? 'Done' : 'Start'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 3: AI Learning Path ── */}
      <div className={`bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <button
          onClick={() => setShowLearningPath((v) => !v)}
          className="w-full flex items-center justify-between p-5"
        >
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            AI-Generated Learning Path
            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">Today</span>
          </h2>
          {showLearningPath ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {showLearningPath && (
          <div className="px-5 pb-5">
            {progressLoading ? (
              <div className="flex items-center gap-3 text-gray-500 dark:text-white/60 text-sm py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating your personalised learning path…
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity, idx) => (
                  <div
                    key={idx}
                    className={`p-4 bg-gray-50 dark:bg-white/5 ${borderRadius} border border-gray-200 dark:border-white/10`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-purple-400 text-xs font-bold">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white text-sm font-medium">{activity.topic}</p>
                          {(activity.subject || activity.duration || activity.difficulty) && (
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {activity.subject && (
                                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{activity.subject}</span>
                              )}
                              {activity.duration && (
                                <span className="text-xs text-gray-400 dark:text-white/40 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />{activity.duration}
                                </span>
                              )}
                              {activity.difficulty && (
                                <span className="text-xs text-gray-400 dark:text-white/40 capitalize">{activity.difficulty}</span>
                              )}
                            </div>
                          )}
                          {activity.objective && (
                            <p className="text-xs text-gray-500 dark:text-white/50 mt-1">{activity.objective}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartWithTutor(activity.topic)}
                        className={`px-3 py-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 ${borderRadius} flex items-center gap-1 whitespace-nowrap flex-shrink-0 transition-colors`}
                      >
                        <Bot className="w-3 h-3" />
                        Ask Tutor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 bg-blue-500/10 ${borderRadius} border border-blue-500/20 flex items-start gap-3`}>
                <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 dark:text-white text-sm font-medium">Your AI tutor will generate a path here</p>
                  <p className="text-gray-500 dark:text-white/60 text-xs mt-1">
                    Start chatting with your AI tutor to build your personalised learning path.
                  </p>
                  <button
                    onClick={() => navigate('/dashboard/student/ai-tutor/chat')}
                    className={`mt-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs ${borderRadius} flex items-center gap-1 transition-colors`}
                  >
                    <Bot className="w-3 h-3" />
                    Open AI Tutor
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Section 4: Catch-up topics (only shown when behind) ── */}
      {progressData?.progress_status === 'catching_up' && progressData.catch_up_topics.length > 0 && (
        <div className={`bg-white dark:bg-[#181C1F] ${borderRadius} border border-orange-500/20`}>
          <button
            onClick={() => setShowCatchUp((v) => !v)}
            className="w-full flex items-center justify-between p-5"
          >
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-orange-400" />
              Catch-Up Topics
              <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">
                {progressData.catch_up_topics.length} topics
              </span>
            </h2>
            {showCatchUp ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showCatchUp && (
            <div className="px-5 pb-5 space-y-2">
              <p className="text-sm text-gray-500 dark:text-white/60 mb-3">
                These topics need more practice. Your AI tutor can help you work through them.
              </p>
              {progressData.catch_up_topics.map((topic, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 bg-orange-500/5 ${borderRadius} border border-orange-500/20 flex items-center justify-between`}
                >
                  <div>
                    <p className="text-gray-900 dark:text-white text-sm font-medium">{topic.topic}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-orange-400/80">{topic.subject}</span>
                      <span className="text-xs text-gray-400 dark:text-white/40">
                        Mastery: {topic.mastery_level}%
                      </span>
                      {/* Progress bar */}
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-400 rounded-full"
                          style={{ width: `${topic.mastery_level}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartWithTutor(topic.topic)}
                    className={`px-3 py-1.5 text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 ${borderRadius} flex items-center gap-1 whitespace-nowrap transition-colors`}
                  >
                    <Bot className="w-3 h-3" />
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIPlanPage;
