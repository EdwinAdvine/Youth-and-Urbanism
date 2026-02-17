import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, FileText, List, Grid } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Assessment {
  id: string;
  title: string;
  description: string;
  assessment_type: 'quiz' | 'assignment' | 'project' | 'exam';
  course_id?: string;
  course_title?: string;
  total_questions?: number;
  max_score: number;
  time_limit?: number;
  status: 'draft' | 'published' | 'archived';
  submissions_count: number;
  pending_count: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export const AssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessments();
  }, [typeFilter, statusFilter]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await axios.get(`${API_URL}/api/v1/instructor/assessments`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setAssessments([
          {
            id: '1',
            title: 'Algebra Basics - Unit Test',
            description: 'Test covering linear equations and functions',
            assessment_type: 'quiz',
            course_id: '1',
            course_title: 'Introduction to Mathematics - Grade 7',
            total_questions: 20,
            max_score: 100,
            time_limit: 60,
            status: 'published',
            submissions_count: 35,
            pending_count: 5,
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            title: 'Creative Writing Assignment',
            description: 'Write a short story (500 words)',
            assessment_type: 'assignment',
            course_id: '2',
            course_title: 'English Language & Literature',
            max_score: 50,
            status: 'published',
            submissions_count: 28,
            pending_count: 12,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            title: 'Science Fair Project Proposal',
            description: 'Submit your project idea and experiment plan',
            assessment_type: 'project',
            course_id: '3',
            course_title: 'Science Experiments for Young Learners',
            max_score: 100,
            status: 'draft',
            submissions_count: 0,
            pending_count: 0,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      } else {
        setAssessments(response.data);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = () => {
    navigate('/dashboard/instructor/assessments/create');
  };

  const handleEditAssessment = (assessmentId: string) => {
    navigate(`/dashboard/instructor/assessments/${assessmentId}/edit`);
  };

  const handleViewSubmissions = (_assessmentId: string) => {
    navigate('/dashboard/instructor/submissions');
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: assessments.length,
    published: assessments.filter((a) => a.status === 'published').length,
    pending: assessments.reduce((sum, a) => sum + a.pending_count, 0),
    totalSubmissions: assessments.reduce((sum, a) => sum + a.submissions_count, 0),
  };

  const typeIcons = {
    quiz: '📝',
    assignment: '📋',
    project: '🎨',
    exam: '📊',
  };

  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-400 dark:text-gray-300 border-gray-500/30',
    published: 'bg-green-500/20 text-green-300 border-green-500/30',
    archived: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
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
        title="Assessments"
        description="Create and manage quizzes, assignments, projects, and exams"
        icon={<FileText className="w-6 h-6 text-purple-400" />}
        actions={
          <button
            onClick={handleCreateAssessment}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Assessment
          </button>
        }
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Published</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.published}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Pending Grading</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSubmissions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-white/60" />
            <span className="text-sm text-gray-500 dark:text-white/60">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
              <option value="project">Project</option>
              <option value="exam">Exam</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-white/60">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${
                viewMode === 'grid' ? 'bg-purple-500 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
              } transition-colors`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${
                viewMode === 'list' ? 'bg-purple-500 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
              } transition-colors`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Assessments Display */}
      {filteredAssessments.length === 0 ? (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Assessments Yet</h3>
          <p className="text-gray-500 dark:text-white/60 mb-6">
            {searchQuery
              ? 'No assessments match your search criteria'
              : 'Create your first assessment to evaluate student learning'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateAssessment}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
            >
              Create Your First Assessment
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => handleEditAssessment(assessment.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{typeIcons[assessment.assessment_type]}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {assessment.title}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">{assessment.course_title || 'No course'}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded border ${
                    statusColors[assessment.status]
                  }`}
                >
                  {assessment.status}
                </span>
              </div>

              <p className="text-sm text-gray-500 dark:text-white/60 mb-4 line-clamp-2">{assessment.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                {assessment.total_questions && (
                  <div>
                    <span className="text-gray-400 dark:text-gray-300 dark:text-white/40">Questions:</span>
                    <span className="ml-1 text-gray-900 dark:text-white">{assessment.total_questions}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-400 dark:text-gray-300 dark:text-white/40">Max Score:</span>
                  <span className="ml-1 text-gray-900 dark:text-white">{assessment.max_score}</span>
                </div>
                {assessment.time_limit && (
                  <div>
                    <span className="text-gray-400 dark:text-gray-300 dark:text-white/40">Time Limit:</span>
                    <span className="ml-1 text-gray-900 dark:text-white">{assessment.time_limit} min</span>
                  </div>
                )}
                {assessment.due_date && (
                  <div>
                    <span className="text-gray-400 dark:text-gray-300 dark:text-white/40">Due:</span>
                    <span className="ml-1 text-gray-900 dark:text-white">
                      {format(new Date(assessment.due_date), 'MMM d')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 dark:text-gray-300 dark:text-white/40">Submissions:</span>
                    <span className="ml-1 text-gray-900 dark:text-white font-medium">{assessment.submissions_count}</span>
                  </div>
                  {assessment.pending_count > 0 && (
                    <div>
                      <span className="text-orange-400">Pending:</span>
                      <span className="ml-1 text-orange-400 font-medium">
                        {assessment.pending_count}
                      </span>
                    </div>
                  )}
                </div>

                {assessment.status === 'published' && assessment.submissions_count > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewSubmissions(assessment.id);
                    }}
                    className="px-3 py-1.5 text-sm bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-lg transition-colors"
                  >
                    View Submissions
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
