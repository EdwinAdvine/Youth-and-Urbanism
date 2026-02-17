import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Video, TrendingUp, Award } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { InstructorStatsCard } from '../../components/instructor/shared/InstructorStatsCard';
import { EarningsSnapshotCard } from '../../components/instructor/dashboard/EarningsSnapshotCard';
import { UpcomingSessionsCard } from '../../components/instructor/dashboard/UpcomingSessionsCard';
import { AIInsightsCard } from '../../components/instructor/dashboard/AIInsightsCard';
import { useInstructorStore } from '../../store/instructorStore';
import { useInstructorWebSocket } from '../../hooks/useInstructorWebSocket';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';


interface DashboardData {
  stats: {
    total_students: number;
    active_students_today: number;
    total_courses: number;
    published_courses: number;
    upcoming_sessions_count: number;
    earnings_this_month: number;
    earnings_total: number;
    average_rating: number;
    total_reviews: number;
    pending_submissions: number;
    ai_flagged_students: string[];
    current_streak: number;
    total_points: number;
    level: number;
  };
  upcoming_sessions: any[];
  pending_submissions: any[];
  ai_flagged_students: any[];
  quick_actions: any[];
}

export const InstructorDashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { counters } = useInstructorStore();
  const navigate = useNavigate();

  // Connect to WebSocket for real-time updates
  useInstructorWebSocket();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        '/api/v1/instructor/dashboard/overview'
      );
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/60">Failed to load dashboard data</p>
      </div>
    );
  }

  const { stats, upcoming_sessions } = dashboardData;

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your teaching activity."
        badge={`Level ${stats.level}`}
        icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InstructorStatsCard
          title="Total Students"
          value={stats.total_students}
          icon={Users}
          color="purple"
          subtitle={`${stats.active_students_today} active today`}
          onClick={() => navigate('/dashboard/instructor/progress-pulse')}
        />
        <InstructorStatsCard
          title="Published Courses"
          value={stats.published_courses}
          icon={BookOpen}
          color="blue"
          subtitle={`${stats.total_courses} total`}
          onClick={() => navigate('/dashboard/instructor/courses')}
        />
        <InstructorStatsCard
          title="Upcoming Sessions"
          value={stats.upcoming_sessions_count}
          icon={Video}
          color="green"
          onClick={() => navigate('/dashboard/instructor/sessions')}
        />
        <InstructorStatsCard
          title="Total Points"
          value={stats.total_points.toLocaleString()}
          icon={Award}
          color="orange"
          subtitle={`${stats.current_streak} day streak`}
          onClick={() => navigate('/dashboard/instructor/badges')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Earnings & Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <EarningsSnapshotCard
            thisMonth={stats.earnings_this_month}
            total={stats.earnings_total}
          />

          <UpcomingSessionsCard sessions={upcoming_sessions} />

          {/* Pending Submissions */}
          {counters.pendingSubmissions > 0 && (
            <div className="bg-orange-500/10 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Pending Submissions
                  </h3>
                  <p className="text-gray-500 dark:text-white/60 text-sm">
                    {counters.pendingSubmissions} assignments need grading
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/instructor/submissions')}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Grade Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - AI Insights */}
        <div className="space-y-6">
          <AIInsightsCard
            insights={[
              {
                priority: 'high',
                category: 'submissions',
                title: 'Grade pending assignments',
                description: `${counters.pendingSubmissions} submissions waiting for feedback`,
                action_url: '/dashboard/instructor/submissions',
              },
              {
                priority: 'medium',
                category: 'engagement',
                title: 'Review student progress',
                description: 'Check in on students with declining engagement',
                action_url: '/dashboard/instructor/progress-pulse',
              },
            ]}
          />

          {/* Quick Actions */}
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/dashboard/instructor/courses/create')}
                className="w-full p-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-lg transition-colors text-sm font-medium text-left"
              >
                + Create New Course
              </button>
              <button
                onClick={() => navigate('/dashboard/instructor/sessions/create')}
                className="w-full p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-lg transition-colors text-sm font-medium text-left"
              >
                + Schedule Live Session
              </button>
              <button
                onClick={() => navigate('/dashboard/instructor/assessments/create')}
                className="w-full p-3 bg-green-500/10 hover:bg-green-500/20 text-green-300 rounded-lg transition-colors text-sm font-medium text-left"
              >
                + Create Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
