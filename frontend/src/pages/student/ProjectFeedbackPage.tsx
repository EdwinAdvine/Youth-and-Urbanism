import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft, MessageSquare, FolderOpen, Loader2, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import apiClient from '../../services/api';

interface ProjectFeedback {
  id: string;
  title: string;
  subject: string;
  course_title: string;
  submission_id: string;
  submitted_at: string | null;
  graded_at: string | null;
  score: number;
  total_points: number;
  percentage: number | null;
  is_graded: boolean;
  feedback: string | null;
  passed: boolean | null;
}

const ProjectFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [projects, setProjects] = useState<ProjectFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/api/v1/student/assessments/projects/feedback');
        setProjects(Array.isArray(res.data) ? res.data : []);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } }; message?: string };
        setError(e?.response?.data?.detail || e?.message || 'Failed to load project feedback.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Project Feedback</h1>
          <p className="text-gray-600 dark:text-white/70">Teacher feedback on your projects</p>
        </div>
      </div>

      {error && (
        <div className={`p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && projects.length === 0 && !error && (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center text-gray-500 dark:text-white/50`}>
          No submitted projects yet.
        </div>
      )}

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.submission_id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 bg-orange-500/20 ${borderRadius} flex items-center justify-center flex-shrink-0`}>
                <FolderOpen className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white font-semibold">{project.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm">{project.course_title} · {project.subject}</p>
              </div>
              {project.is_graded && project.percentage !== null && (
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${project.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {project.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span className="font-bold text-lg">{project.percentage}%</span>
                  </div>
                  <p className="text-gray-400 dark:text-white/40 text-xs">{project.score}/{project.total_points} pts</p>
                </div>
              )}
              {!project.is_graded && (
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">Pending Review</span>
              )}
            </div>

            {project.feedback ? (
              <div className={`p-4 bg-blue-500/10 ${borderRadius} border border-blue-500/20`}>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">Teacher Feedback</span>
                </div>
                <p className="text-gray-600 dark:text-white/70 text-sm">{project.feedback}</p>
              </div>
            ) : (
              <div className={`p-4 bg-gray-50 dark:bg-white/5 ${borderRadius}`}>
                <p className="text-gray-400 dark:text-white/30 text-sm italic">
                  {project.is_graded ? 'No written feedback provided.' : 'Awaiting teacher review.'}
                </p>
              </div>
            )}

            <span className="flex items-center gap-1 text-gray-400 dark:text-white/30 text-xs mt-3">
              <Clock className="w-3 h-3" />
              {project.graded_at
                ? `Graded ${formatDate(project.graded_at)}`
                : project.submitted_at
                ? `Submitted ${formatDate(project.submitted_at)}`
                : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectFeedbackPage;
