import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { AlertTriangle, Clock, Upload, ChevronRight, Loader2 } from 'lucide-react';
import apiClient from '../../services/api';

interface DueSoonAssignment {
  id: string;
  title: string;
  subject: string;
  due_in: string;
  available_until: string | null;
  course_title: string;
  urgent: boolean;
}

const AssignmentsDueSoonPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [assignments, setAssignments] = useState<DueSoonAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDueSoonAssignments = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/v1/student/assessments/due-soon');
        setAssignments(Array.isArray(response.data) ? response.data : []);
      } catch {
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDueSoonAssignments();
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Assignments Due Soon</h1>
        <p className="text-gray-600 dark:text-white/70">{assignments.length} assignments need your attention</p>
      </div>

      {assignments.length === 0 && (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center text-gray-500 dark:text-white/50`}>
          No assignments due soon.
        </div>
      )}

      <div className="space-y-3">
        {assignments.map((assignment) => (
          <div key={assignment.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border ${assignment.urgent ? 'border-red-500/30' : 'border-gray-200 dark:border-[#22272B]'} hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            {assignment.urgent && (
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-xs font-medium">URGENT - Due in {assignment.due_in}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white font-semibold">{assignment.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm mt-0.5">{assignment.course_title} · {assignment.subject}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-white/50">
                  {assignment.available_until && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {new Date(assignment.available_until).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                  {assignment.due_in && <span>In {assignment.due_in}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate('/dashboard/student/projects/upload')} className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center gap-2`}>
                  <Upload className="w-4 h-4" /> Submit
                </button>
                <button onClick={() => navigate(`/dashboard/student/assignments/pending`)} className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 text-sm ${borderRadius}`}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentsDueSoonPage;
