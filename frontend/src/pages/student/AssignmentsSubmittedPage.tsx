// AssignmentsSubmittedPage - Student page at /dashboard/student/assignments-submitted.
// Lists all submitted assessments with grading status and scores from the DB.
import React, { useState, useEffect } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import apiClient from '../../services/api';

interface SubmittedAssignment {
  id: string;
  title: string;
  subject: string;
  course_title: string;
  submission_id: string;
  submitted_at: string | null;
  is_graded: boolean;
  score: number | null;
  total_points: number;
  status: string;
}

const AssignmentsSubmittedPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [assignments, setAssignments] = useState<SubmittedAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/api/v1/student/assessments/submitted');
        setAssignments(Array.isArray(res.data) ? res.data : []);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } }; message?: string };
        setError(e?.response?.data?.detail || e?.message || 'Failed to load submitted assignments.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#FF0000] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Submitted Assignments</h1>
        <p className="text-gray-600 dark:text-white/70">Track the status of your submissions</p>
      </div>

      {error && (
        <div className={`p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && assignments.length === 0 && !error && (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center text-gray-500 dark:text-white/50`}>
          No submitted assignments yet.
        </div>
      )}

      <div className="space-y-3">
        {assignments.map((assignment) => {
          const percentage = assignment.score != null
            ? Math.round((assignment.score / assignment.total_points) * 100)
            : null;
          return (
            <div key={assignment.submission_id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${borderRadius} flex items-center justify-center ${assignment.is_graded ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                  {assignment.is_graded
                    ? <CheckCircle2 className="w-6 h-6 text-green-400" />
                    : <Clock className="w-6 h-6 text-yellow-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 dark:text-white font-semibold">{assignment.title}</h3>
                  <p className="text-gray-400 dark:text-white/40 text-sm mt-0.5">{assignment.course_title} · {assignment.subject}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className={`px-2 py-0.5 ${borderRadius} text-xs ${assignment.is_graded ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {assignment.is_graded ? 'Graded' : 'Pending Review'}
                    </span>
                    {percentage != null && (
                      <span className="text-gray-500 dark:text-white/60">
                        Score: <span className="text-gray-900 dark:text-white font-medium">{percentage}%</span>
                        <span className="text-gray-400 dark:text-white/30 ml-1">({assignment.score}/{assignment.total_points})</span>
                      </span>
                    )}
                    {assignment.submitted_at && <span className="text-gray-400 dark:text-white/40">Submitted {formatDate(assignment.submitted_at)}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentsSubmittedPage;
