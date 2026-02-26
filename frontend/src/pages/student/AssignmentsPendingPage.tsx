import React, { useState, useEffect } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { FileText, Clock, BookOpen, Loader2 } from 'lucide-react';
import apiClient from '../../services/api';

interface PendingAssignment {
  id: string;
  title: string;
  subject: string;
  available_until: string | null;
  assessment_type: string;
  course_title: string;
}

const AssignmentsPendingPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [assignments, setAssignments] = useState<PendingAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingAssignments = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/v1/student/assessments/pending');
        setAssignments(Array.isArray(response.data) ? response.data : []);
      } catch {
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingAssignments();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pending Assignments</h1>
        <p className="text-gray-600 dark:text-white/70">{assignments.length} assignments awaiting completion</p>
      </div>

      <div className="space-y-3">
        {assignments.map((assignment) => (
          <div key={assignment.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-blue-500/20 ${borderRadius} flex items-center justify-center`}>
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 dark:text-white font-semibold">{assignment.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm mt-0.5">{assignment.course_title} · {assignment.subject}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-white/50">
                  {assignment.available_until && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {new Date(assignment.available_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                  <span className={`px-2 py-0.5 ${borderRadius} text-xs bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40`}>
                    {assignment.assessment_type}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center gap-2`}>
                  <BookOpen className="w-4 h-4" /> Start
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentsPendingPage;
