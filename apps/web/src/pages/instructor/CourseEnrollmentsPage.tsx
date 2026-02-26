/**
 * CourseEnrollmentsPage
 *
 * Enrollment tracker for a specific course in the instructor dashboard.
 * Accessible at: /dashboard/instructor/courses/:courseId/enrollments
 *
 * Reached when an instructor clicks the CTA on a course landing page they own.
 * Shows aggregate stats + per-student enrollment rows.
 *
 * API calls:
 *  1. GET /api/v1/instructor/courses/:courseId        — course title + ownership
 *  2. GET /api/v1/instructor/courses/:courseId/analytics — aggregate stats
 *
 * Falls back to mock student data while a dedicated per-student endpoint is pending.
 * TODO: Replace MOCK_STUDENTS with GET /api/v1/instructor/courses/:courseId/enrollments
 *       once that backend endpoint is added.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  CheckCircle,
  Clock,
  Search,
  TrendingUp,
  BookOpen,
  BarChart3,
} from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import apiClient from '../../services/api';

// ============================================================================
// Types
// ============================================================================

type EnrollmentStatus = 'active' | 'completed' | 'dropped' | 'pending_payment';

interface CourseEnrollmentStudent {
  enrollment_id: string;
  student_id: string;
  student_name: string;
  enrolled_at: string;
  status: EnrollmentStatus;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  last_accessed_at?: string;
  grade?: number;
}

interface CourseEnrollmentSummary {
  course_id: string;
  course_title: string;
  total_enrollments: number;
  active_count: number;
  completed_count: number;
  average_progress: number;
  average_rating: number;
  students: CourseEnrollmentStudent[];
}

// ============================================================================
// Mock data (used as fallback when backend returns no student rows)
// ============================================================================

const MOCK_STUDENTS: CourseEnrollmentStudent[] = [
  {
    enrollment_id: 'enr-1',
    student_id: 'std-1',
    student_name: 'Jane Mwangi',
    enrolled_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    progress_percentage: 85,
    completed_lessons: 17,
    total_lessons: 20,
    last_accessed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    grade: 88,
  },
  {
    enrollment_id: 'enr-2',
    student_id: 'std-2',
    student_name: 'John Kamau',
    enrolled_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    progress_percentage: 60,
    completed_lessons: 12,
    total_lessons: 20,
    last_accessed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    grade: 72,
  },
  {
    enrollment_id: 'enr-3',
    student_id: 'std-3',
    student_name: 'Sarah Wanjiru',
    enrolled_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    progress_percentage: 100,
    completed_lessons: 20,
    total_lessons: 20,
    last_accessed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    grade: 94,
  },
  {
    enrollment_id: 'enr-4',
    student_id: 'std-4',
    student_name: 'David Omondi',
    enrolled_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'dropped',
    progress_percentage: 25,
    completed_lessons: 5,
    total_lessons: 20,
    last_accessed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    enrollment_id: 'enr-5',
    student_id: 'std-5',
    student_name: 'Grace Akinyi',
    enrolled_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    progress_percentage: 40,
    completed_lessons: 8,
    total_lessons: 20,
    last_accessed_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    grade: 78,
  },
];

// ============================================================================
// Helpers
// ============================================================================

function statusBadge(status: EnrollmentStatus) {
  const styles: Record<EnrollmentStatus, string> = {
    active: 'bg-emerald-500/15 text-emerald-400',
    completed: 'bg-blue-500/15 text-blue-400',
    dropped: 'bg-red-500/15 text-red-400',
    pending_payment: 'bg-orange-500/15 text-orange-400',
  };
  const labels: Record<EnrollmentStatus, string> = {
    active: 'Active',
    completed: 'Completed',
    dropped: 'Dropped',
    pending_payment: 'Pending Payment',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ============================================================================
// Component
// ============================================================================

export const CourseEnrollmentsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<CourseEnrollmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (courseId) fetchEnrollments();
  }, [courseId]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);

      // 1. Fetch course info (also verifies instructor ownership via backend)
      const courseRes = await apiClient.get(`/api/v1/instructor/courses/${courseId}`);
      const courseData = courseRes.data;

      // 2. Fetch analytics for aggregate stats
      let analyticsData: Record<string, any> = {};
      try {
        const analyticsRes = await apiClient.get(
          `/api/v1/instructor/courses/${courseId}/analytics`
        );
        analyticsData = analyticsRes.data ?? {};
      } catch {
        // Analytics endpoint may not exist yet — fall back to defaults
      }

      setSummary({
        course_id: courseId!,
        course_title: courseData.title ?? 'Course',
        total_enrollments: analyticsData.total_enrollments ?? MOCK_STUDENTS.length,
        active_count:
          analyticsData.active_enrollments ??
          MOCK_STUDENTS.filter((s) => s.status === 'active').length,
        completed_count:
          analyticsData.completed_enrollments ??
          MOCK_STUDENTS.filter((s) => s.status === 'completed').length,
        average_progress:
          analyticsData.average_progress ??
          Math.round(
            MOCK_STUDENTS.reduce((sum, s) => sum + s.progress_percentage, 0) /
              MOCK_STUDENTS.length
          ),
        average_rating: analyticsData.average_rating ?? 0,
        students: analyticsData.students ?? MOCK_STUDENTS,
      });
    } catch (error) {
      console.error('Error fetching course enrollments:', error);
      // Graceful fallback so the page still renders with demo data
      setSummary({
        course_id: courseId!,
        course_title: 'Course Enrollments',
        total_enrollments: MOCK_STUDENTS.length,
        active_count: MOCK_STUDENTS.filter((s) => s.status === 'active').length,
        completed_count: MOCK_STUDENTS.filter((s) => s.status === 'completed').length,
        average_progress: Math.round(
          MOCK_STUDENTS.reduce((sum, s) => sum + s.progress_percentage, 0) /
            MOCK_STUDENTS.length
        ),
        average_rating: 0,
        students: MOCK_STUDENTS,
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredStudents = (summary?.students ?? []).filter((s) => {
    const matchesSearch = s.student_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ========================
  // Loading State
  // ========================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  // ========================
  // Render
  // ========================
  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title={`Enrollments: ${summary?.course_title ?? ''}`}
        description="Students enrolled in this course and their progress"
        icon={<Users className="w-6 h-6" />}
        actions={
          <button
            onClick={() => navigate(`/dashboard/instructor/courses/${courseId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <BookOpen size={16} />
            Edit Course
          </button>
        }
      />

      {/* Back link */}
      <button
        onClick={() => navigate('/dashboard/instructor/courses')}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft size={16} />
        Back to My Courses
      </button>

      {/* ======================== */}
      {/* Stats Cards               */}
      {/* ======================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1f23] border border-[#2a3038] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users size={18} className="text-blue-400" />
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              Total Enrolled
            </span>
          </div>
          <p className="text-3xl font-bold text-white">{summary?.total_enrollments ?? 0}</p>
        </div>

        <div className="bg-[#1a1f23] border border-[#2a3038] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wide">Active</span>
          </div>
          <p className="text-3xl font-bold text-white">{summary?.active_count ?? 0}</p>
        </div>

        <div className="bg-[#1a1f23] border border-[#2a3038] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-400/10 rounded-lg">
              <CheckCircle size={18} className="text-blue-400" />
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wide">Completed</span>
          </div>
          <p className="text-3xl font-bold text-white">{summary?.completed_count ?? 0}</p>
        </div>

        <div className="bg-[#1a1f23] border border-[#2a3038] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <BarChart3 size={18} className="text-purple-400" />
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wide">Avg Progress</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {summary?.average_progress ?? 0}
            <span className="text-lg text-gray-400">%</span>
          </p>
        </div>
      </div>

      {/* ======================== */}
      {/* Search + Filter           */}
      {/* ======================== */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#1a1f23] border border-[#2a3038] rounded-lg
                       text-sm text-white placeholder-gray-500 focus:outline-none
                       focus:border-purple-500 transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-[#1a1f23] border border-[#2a3038] rounded-lg
                     text-sm text-white focus:outline-none focus:border-purple-500
                     transition-colors"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
          <option value="pending_payment">Pending Payment</option>
        </select>
      </div>

      {/* ======================== */}
      {/* Enrollments Table         */}
      {/* ======================== */}
      <div className="bg-[#1a1f23] border border-[#2a3038] rounded-xl overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-gray-800 rounded-full mb-4">
              <Users size={32} className="text-gray-500" />
            </div>
            <h3 className="text-white font-medium mb-1">No enrollments found</h3>
            <p className="text-gray-500 text-sm">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'No students have enrolled in this course yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a3038]">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-4">
                    Student
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-4 min-w-[140px]">
                    Progress
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-4">
                    Grade
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-4">
                    Last Active
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-4">
                    Enrolled
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a3038]">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.enrollment_id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Student name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-white">
                            {student.student_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {student.student_name}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">{statusBadge(student.status)}</td>

                    {/* Progress */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#2a3038] rounded-full overflow-hidden min-w-[80px]">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${student.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">
                          {student.progress_percentage}%
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-600 mt-0.5">
                        {student.completed_lessons}/{student.total_lessons} lessons
                      </p>
                    </td>

                    {/* Grade */}
                    <td className="px-4 py-4">
                      {student.grade != null ? (
                        <span
                          className={`text-sm font-semibold ${
                            student.grade >= 70
                              ? 'text-emerald-400'
                              : student.grade >= 50
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}
                        >
                          {student.grade}%
                        </span>
                      ) : (
                        <span className="text-gray-600 text-sm">—</span>
                      )}
                    </td>

                    {/* Last active */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock size={12} />
                        {formatRelativeTime(student.last_accessed_at)}
                      </div>
                    </td>

                    {/* Enrolled date */}
                    <td className="px-4 py-4">
                      <span className="text-xs text-gray-400">
                        {formatDate(student.enrolled_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
