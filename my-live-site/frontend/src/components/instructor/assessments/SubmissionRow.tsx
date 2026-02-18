import React from 'react';
import { Clock, CheckCircle, AlertCircle, User, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface SubmissionRowProps {
  submission: {
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
  };
  onGrade?: (submissionId: string) => void;
  onViewDetails?: (submissionId: string) => void;
}

export const SubmissionRow: React.FC<SubmissionRowProps> = ({
  submission,
  onGrade,
  onViewDetails,
}) => {
  const navigate = useNavigate();

  const statusConfig = {
    pending: {
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      label: 'Pending Review',
      icon: Clock,
    },
    graded: {
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      label: 'Graded',
      icon: CheckCircle,
    },
    late: {
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      label: 'Late Submission',
      icon: AlertCircle,
    },
    requires_revision: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      label: 'Needs Revision',
      icon: AlertCircle,
    },
  };

  const config = statusConfig[submission.status];
  const StatusIcon = config.icon;

  const handleRowClick = () => {
    if (onViewDetails) {
      onViewDetails(submission.id);
    } else {
      navigate(`/dashboard/instructor/submissions/${submission.id}`);
    }
  };

  return (
    <div
      className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all cursor-pointer group"
      onClick={handleRowClick}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Student Info */}
        <div className="flex items-start gap-4 flex-1">
          {/* Student Avatar */}
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {submission.student_avatar ? (
              <img
                src={submission.student_avatar}
                alt={submission.student_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-purple-400" />
            )}
          </div>

          {/* Student Details */}
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              {submission.student_name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-white/60 mb-2 line-clamp-1">
              {submission.assessment_title}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-4 flex-wrap text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Submitted {format(new Date(submission.submitted_at), 'MMM d, yyyy')}</span>
              </div>
              {submission.days_pending && submission.status === 'pending' && (
                <div className="flex items-center gap-1 text-orange-400">
                  <Clock className="w-3 h-3" />
                  <span>{submission.days_pending}d pending</span>
                </div>
              )}
              {submission.has_ai_feedback && (
                <div className="flex items-center gap-1 text-purple-400">
                  <FileText className="w-3 h-3" />
                  <span>AI Feedback Available</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-4">
          {/* Score */}
          {submission.status === 'graded' && submission.score !== undefined && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {submission.score}
                <span className="text-sm text-gray-400 dark:text-gray-300 dark:text-white/40">/{submission.max_score}</span>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                {((submission.score / (submission.max_score || 100)) * 100).toFixed(0)}%
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div
            className={`px-3 py-1.5 rounded-lg border ${config.bgColor} ${config.borderColor} flex items-center gap-2`}
          >
            <StatusIcon className={`w-4 h-4 ${config.color}`} />
            <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
          </div>

          {/* Grade Button (for pending submissions) */}
          {submission.status === 'pending' && onGrade && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGrade(submission.id);
              }}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
            >
              Grade Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
