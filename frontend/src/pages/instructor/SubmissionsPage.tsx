import React, { useEffect, useState } from 'react';
import { Search, Filter, Sparkles, Download, CheckSquare } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { SubmissionRow } from '../../components/instructor/assessments/SubmissionRow';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';


interface Submission {
  id: string;
  assessment_id: string;
  assessment_title: string;
  student_id: string;
  student_name: string;
  student_avatar?: string;
  submitted_at: string;
  status: 'pending' | 'graded' | 'late' | 'requires_revision';
  score?: number;
  max_score?: number;
  days_pending?: number;
  has_ai_feedback?: boolean;
}

export const SubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchGrading, setBatchGrading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await apiClient.get('/api/v1/instructor/assessments/submissions', {
        params,
      });

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setSubmissions([
          {
            id: '1',
            assessment_id: '1',
            assessment_title: 'Algebra Basics - Unit Test',
            student_id: '101',
            student_name: 'Jane Mwangi',
            submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            max_score: 100,
            days_pending: 2,
            has_ai_feedback: true,
          },
          {
            id: '2',
            assessment_id: '2',
            assessment_title: 'Creative Writing Assignment',
            student_id: '102',
            student_name: 'John Kamau',
            submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            max_score: 50,
            days_pending: 5,
            has_ai_feedback: true,
          },
          {
            id: '3',
            assessment_id: '1',
            assessment_title: 'Algebra Basics - Unit Test',
            student_id: '103',
            student_name: 'Sarah Wanjiru',
            submitted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'graded',
            score: 85,
            max_score: 100,
          },
          {
            id: '4',
            assessment_id: '2',
            assessment_title: 'Creative Writing Assignment',
            student_id: '104',
            student_name: 'David Omondi',
            submitted_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'graded',
            score: 42,
            max_score: 50,
          },
          {
            id: '5',
            assessment_id: '1',
            assessment_title: 'Algebra Basics - Unit Test',
            student_id: '105',
            student_name: 'Grace Akinyi',
            submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'late',
            max_score: 100,
            days_pending: 1,
            has_ai_feedback: false,
          },
        ]);
      } else {
        setSubmissions(response.data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = (submissionId: string) => {
    navigate(`/dashboard/instructor/submissions/${submissionId}`);
  };

  const handleViewDetails = (submissionId: string) => {
    navigate(`/dashboard/instructor/submissions/${submissionId}`);
  };

  const handleBatchGrade = async () => {
    if (selectedIds.size === 0) {
      alert('Please select submissions to grade');
      return;
    }

    try {
      setBatchGrading(true);
      await apiClient.post(
        '/api/v1/instructor/assessments/batch-grade',
        { submission_ids: Array.from(selectedIds) }
      );

      alert('Batch grading initiated. AI feedback will be generated shortly.');
      setSelectedIds(new Set());
      fetchSubmissions();
    } catch (error) {
      console.error('Error batch grading:', error);
      alert('Failed to initiate batch grading');
    } finally {
      setBatchGrading(false);
    }
  };

  const handleExportResults = async () => {
    try {
      const response = await apiClient.get('/api/v1/instructor/assessments/export', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `submissions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting results:', error);
      alert('Failed to export results');
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSubmissions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSubmissions.map((s) => s.id)));
    }
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.assessment_title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === 'pending').length,
    graded: submissions.filter((s) => s.status === 'graded').length,
    late: submissions.filter((s) => s.status === 'late').length,
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
        title="Submissions"
        description="Review and grade student submissions across all assessments"
        icon={<CheckSquare className="w-6 h-6 text-purple-400" />}
        actions={
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBatchGrade}
                disabled={batchGrading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
              >
                <Sparkles className="w-5 h-5" />
                {batchGrading ? 'Processing...' : `AI Grade (${selectedIds.size})`}
              </button>
            )}
            <button
              onClick={handleExportResults}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        }
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CheckSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <CheckSquare className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckSquare className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Graded</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.graded}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <CheckSquare className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Late Submissions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.late}</p>
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
            placeholder="Search by student or assessment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-white/60" />
            <span className="text-sm text-gray-500 dark:text-white/60">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="graded">Graded</option>
              <option value="late">Late</option>
              <option value="requires_revision">Needs Revision</option>
            </select>
          </div>
        </div>
      </div>

      {/* Select All */}
      {filteredSubmissions.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedIds.size === filteredSubmissions.length && filteredSubmissions.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-purple-500 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-500 dark:text-white/60">
            Select all ({filteredSubmissions.length} submissions)
          </span>
        </div>
      )}

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
          <CheckSquare className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Submissions</h3>
          <p className="text-gray-500 dark:text-white/60">
            {searchQuery
              ? 'No submissions match your search criteria'
              : 'No submissions to review at this time'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <div key={submission.id} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedIds.has(submission.id)}
                onChange={() => toggleSelection(submission.id)}
                className="mt-6 w-4 h-4 rounded border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-purple-500 focus:ring-purple-500"
              />
              <div className="flex-1">
                <SubmissionRow
                  submission={submission}
                  onGrade={handleGradeSubmission}
                  onViewDetails={handleViewDetails}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
