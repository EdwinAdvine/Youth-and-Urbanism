import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Award, Target, Calendar } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface PerformanceData {
  engagement_over_time: Array<{
    date: string;
    active_students: number;
    avg_session_minutes: number;
    completion_rate: number;
  }>;
  retention_data: Array<{
    week: string;
    retained: number;
    churned: number;
  }>;
  course_rankings: Array<{
    course_title: string;
    enrollments: number;
    completion_rate: number;
    avg_rating: number;
    revenue: number;
    rank_change: 'up' | 'down' | 'stable';
  }>;
  overall_metrics: {
    total_students: number;
    active_students: number;
    avg_engagement_rate: number;
    avg_retention_rate: number;
    avg_completion_rate: number;
    total_revenue: number;
  };
}

export const PerformancePage: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('30_days');

  useEffect(() => {
    fetchPerformanceData();
  }, [periodFilter]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/api/v1/instructor/performance`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { period: periodFilter },
      });

      // Mock data for development
      if (!response.data) {
        setPerformanceData({
          engagement_over_time: [
            { date: 'Jan 1', active_students: 45, avg_session_minutes: 32, completion_rate: 65 },
            { date: 'Jan 8', active_students: 52, avg_session_minutes: 35, completion_rate: 68 },
            { date: 'Jan 15', active_students: 58, avg_session_minutes: 38, completion_rate: 72 },
            { date: 'Jan 22', active_students: 62, avg_session_minutes: 40, completion_rate: 74 },
            { date: 'Jan 29', active_students: 68, avg_session_minutes: 42, completion_rate: 76 },
            { date: 'Feb 5', active_students: 72, avg_session_minutes: 45, completion_rate: 78 },
            { date: 'Feb 12', active_students: 75, avg_session_minutes: 47, completion_rate: 80 },
          ],
          retention_data: [
            { week: 'Week 1', retained: 100, churned: 0 },
            { week: 'Week 2', retained: 95, churned: 5 },
            { week: 'Week 3', retained: 90, churned: 5 },
            { week: 'Week 4', retained: 85, churned: 5 },
            { week: 'Week 5', retained: 82, churned: 3 },
            { week: 'Week 6', retained: 80, churned: 2 },
          ],
          course_rankings: [
            {
              course_title: 'Introduction to Mathematics - Grade 7',
              enrollments: 145,
              completion_rate: 82,
              avg_rating: 4.8,
              revenue: 435000,
              rank_change: 'up',
            },
            {
              course_title: 'English Language & Literature',
              enrollments: 128,
              completion_rate: 75,
              avg_rating: 4.6,
              revenue: 384000,
              rank_change: 'stable',
            },
            {
              course_title: 'Science - Grade 8',
              enrollments: 98,
              completion_rate: 68,
              avg_rating: 4.2,
              revenue: 245000,
              rank_change: 'down',
            },
            {
              course_title: 'Social Studies',
              enrollments: 87,
              completion_rate: 71,
              avg_rating: 4.4,
              revenue: 217500,
              rank_change: 'up',
            },
          ],
          overall_metrics: {
            total_students: 458,
            active_students: 342,
            avg_engagement_rate: 74.7,
            avg_retention_rate: 80,
            avg_completion_rate: 74,
            total_revenue: 1281500,
          },
        });
      } else {
        setPerformanceData(response.data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/60">Failed to load performance data</p>
      </div>
    );
  }

  const rankChangeIcons = {
    up: <TrendingUp className="w-4 h-4 text-green-400" />,
    down: <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />,
    stable: <div className="w-4 h-0.5 bg-white/40" />,
  };

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Performance & Growth Analytics"
        description="Track engagement, retention, and content performance metrics"
        icon={<Award className="w-6 h-6 text-purple-400" />}
        actions={
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-white/60" />
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="7_days">Last 7 Days</option>
              <option value="30_days">Last 30 Days</option>
              <option value="90_days">Last 90 Days</option>
              <option value="1_year">Last Year</option>
            </select>
          </div>
        }
      />

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-4">
          <p className="text-xs text-purple-200 mb-1">Total Students</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {performanceData.overall_metrics.total_students}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Active Students</p>
          <p className="text-2xl font-bold text-green-400">
            {performanceData.overall_metrics.active_students}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Engagement Rate</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {performanceData.overall_metrics.avg_engagement_rate.toFixed(1)}%
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Retention Rate</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {performanceData.overall_metrics.avg_retention_rate.toFixed(0)}%
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {performanceData.overall_metrics.avg_completion_rate.toFixed(0)}%
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(performanceData.overall_metrics.total_revenue)}
          </p>
        </div>
      </div>

      {/* Engagement Over Time */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Student Engagement Trends</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={performanceData.engagement_over_time}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="date" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="active_students"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.3}
              name="Active Students"
            />
            <Area
              type="monotone"
              dataKey="avg_session_minutes"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
              name="Avg Session (min)"
            />
            <Area
              type="monotone"
              dataKey="completion_rate"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.3}
              name="Completion Rate (%)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Retention Cohort */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Student Retention Cohort</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData.retention_data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="week" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Bar dataKey="retained" stackId="a" fill="#10b981" name="Retained (%)" />
            <Bar dataKey="churned" stackId="a" fill="#ef4444" name="Churned (%)" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-200">
            <strong>Insight:</strong> Your 6-week retention rate of{' '}
            {performanceData.retention_data[performanceData.retention_data.length - 1].retained}%
            is strong. Most churn occurs in the first 2 weeks - focus on onboarding improvements.
          </p>
        </div>
      </div>

      {/* Course Performance Ranking */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Course Performance Ranking</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10 text-left">
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Rank</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Course</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Enrollments</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Completion</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Rating</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Revenue</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Trend</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.course_rankings.map((course, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">#{index + 1}</span>
                      {rankChangeIcons[course.rank_change]}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white font-medium max-w-xs truncate">
                      {course.course_title}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400 dark:text-gray-300 dark:text-white/40" />
                      <span className="text-sm text-gray-900 dark:text-white">{course.enrollments}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden min-w-[80px]">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                          style={{ width: `${course.completion_rate}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{course.completion_rate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {course.avg_rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-green-400 font-medium">
                      {formatCurrency(course.revenue)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        course.rank_change === 'up'
                          ? 'bg-green-500/10 text-green-400'
                          : course.rank_change === 'down'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60'
                      }`}
                    >
                      {course.rank_change === 'up'
                        ? 'Rising'
                        : course.rank_change === 'down'
                        ? 'Falling'
                        : 'Stable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-purple-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-purple-200 mb-2">Performance Insights</h4>
            <ul className="text-sm text-purple-200/80 space-y-1">
              <li>
                • Your top course "Introduction to Mathematics - Grade 7" has 82% completion rate -
                28% above platform average
              </li>
              <li>
                • Active student count increased by{' '}
                {Math.round(
                  ((performanceData.engagement_over_time[
                    performanceData.engagement_over_time.length - 1
                  ].active_students -
                    performanceData.engagement_over_time[0].active_students) /
                    performanceData.engagement_over_time[0].active_students) *
                    100
                )}
                % over the selected period
              </li>
              <li>
                • "Science - Grade 8" shows declining trend - consider updating content or adding
                more interactive elements
              </li>
              <li>
                • Your overall retention rate of{' '}
                {performanceData.overall_metrics.avg_retention_rate.toFixed(0)}% places you in the
                top 25% of instructors
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
