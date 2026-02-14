import React, { useEffect, useState } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, Award, AlertTriangle, Users } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface StudentProgress {
  student_id: string;
  student_name: string;
  student_avatar?: string;
  overall_progress: number;
  completion_rate: number;
  average_score: number;
  trend: 'up' | 'down' | 'stable';
  engagement_level: 'high' | 'medium' | 'low';
  at_risk: boolean;
  courses_enrolled: number;
  last_activity: string;
}

export const ProgressPulsePage: React.FC = () => {
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEngagement, setFilterEngagement] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/api/v1/instructor/students/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setStudents([
          {
            student_id: '1',
            student_name: 'Jane Mwangi',
            overall_progress: 85,
            completion_rate: 92,
            average_score: 88,
            trend: 'up',
            engagement_level: 'high',
            at_risk: false,
            courses_enrolled: 3,
            last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            student_id: '2',
            student_name: 'John Kamau',
            overall_progress: 62,
            completion_rate: 75,
            average_score: 70,
            trend: 'down',
            engagement_level: 'medium',
            at_risk: true,
            courses_enrolled: 2,
            last_activity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            student_id: '3',
            student_name: 'Sarah Wanjiru',
            overall_progress: 78,
            completion_rate: 85,
            average_score: 82,
            trend: 'stable',
            engagement_level: 'high',
            at_risk: false,
            courses_enrolled: 4,
            last_activity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            student_id: '4',
            student_name: 'David Omondi',
            overall_progress: 45,
            completion_rate: 58,
            average_score: 62,
            trend: 'down',
            engagement_level: 'low',
            at_risk: true,
            courses_enrolled: 2,
            last_activity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            student_id: '5',
            student_name: 'Grace Akinyi',
            overall_progress: 95,
            completion_rate: 98,
            average_score: 94,
            trend: 'up',
            engagement_level: 'high',
            at_risk: false,
            courses_enrolled: 5,
            last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
        ]);
      } else {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (studentId: string) => {
    navigate(`/dashboard/instructor/students/${studentId}/progress`);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEngagement =
      filterEngagement === 'all' || student.engagement_level === filterEngagement;
    const matchesRisk = filterRisk === null || student.at_risk === filterRisk;

    return matchesSearch && matchesEngagement && matchesRisk;
  });

  const stats = {
    total: students.length,
    highPerformers: students.filter((s) => s.average_score >= 80).length,
    atRisk: students.filter((s) => s.at_risk).length,
    avgCompletion: Math.round(
      students.reduce((sum, s) => sum + s.completion_rate, 0) / (students.length || 1)
    ),
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const engagementColors = {
    high: 'bg-green-500/10 text-green-400 border-green-500/30',
    medium: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    low: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Progress Pulse"
        description="Track student progress and identify learning trends"
        icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Award className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">High Performers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.highPerformers}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">At Risk</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.atRisk}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Avg Completion</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgCompletion}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterEngagement}
            onChange={(e) => setFilterEngagement(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">All Engagement</option>
            <option value="high">High Engagement</option>
            <option value="medium">Medium Engagement</option>
            <option value="low">Low Engagement</option>
          </select>

          <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-1">
            <button
              onClick={() => setFilterRisk(null)}
              className={`px-3 py-1 text-sm rounded ${
                filterRisk === null ? 'bg-purple-500 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/60'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRisk(true)}
              className={`px-3 py-1 text-sm rounded ${
                filterRisk === true ? 'bg-red-500 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/60'
              }`}
            >
              At Risk
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10 text-left">
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Student</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Progress</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Completion</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Avg Score</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Trend</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Engagement</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.student_id}
                  onClick={() => handleViewStudent(student.student_id)}
                  className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-300">
                          {student.student_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{student.student_name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                          {student.courses_enrolled} courses
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full max-w-[120px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-900 dark:text-white">{student.overall_progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${student.overall_progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 dark:text-white">{student.completion_rate}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 dark:text-white">{student.average_score}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(student.trend)}
                      <span className="text-sm text-gray-900 dark:text-white capitalize">{student.trend}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded border ${
                        engagementColors[student.engagement_level]
                      }`}
                    >
                      {student.engagement_level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {student.at_risk ? (
                      <span className="px-2 py-1 text-xs font-medium rounded border bg-red-500/10 text-red-400 border-red-500/30">
                        At Risk
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded border bg-green-500/10 text-green-400 border-green-500/30">
                        On Track
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-white/60">No students match your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
