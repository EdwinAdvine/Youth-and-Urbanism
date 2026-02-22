import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { AlertTriangle, Clock, Upload, ChevronRight, Loader2 } from 'lucide-react';
import apiClient from '../../services/api';

interface DueSoonAssignment {
  id: string;
  title: string;
  subject: string;
  dueIn: string;
  dueDate: string;
  instructor: string;
  urgent: boolean;
}

const FALLBACK_ASSIGNMENTS: DueSoonAssignment[] = [
  { id: '1', title: 'Fractions Word Problems', subject: 'Mathematics', dueIn: '4 hours', dueDate: 'Today, 5:00 PM', instructor: 'Ms. Wanjiku', urgent: true },
  { id: '2', title: 'Water Cycle Essay', subject: 'Science', dueIn: '1 day', dueDate: 'Tomorrow, 11:59 PM', instructor: 'Mr. Ochieng', urgent: false },
  { id: '3', title: 'Creative Story Writing', subject: 'English', dueIn: '2 days', dueDate: 'Wed, Feb 19', instructor: 'Mrs. Kamau', urgent: false },
  { id: '4', title: 'Kenya Map Labeling', subject: 'Social Studies', dueIn: '3 days', dueDate: 'Thu, Feb 20', instructor: 'Ms. Njeri', urgent: false },
];

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
        const data = response.data;
        if (data && Array.isArray(data) && data.length > 0) {
          setAssignments(data);
        } else {
          setAssignments(FALLBACK_ASSIGNMENTS);
        }
      } catch {
        setAssignments(FALLBACK_ASSIGNMENTS);
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

      <div className="space-y-3">
        {assignments.map((assignment) => (
          <div key={assignment.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border ${assignment.urgent ? 'border-red-500/30' : 'border-gray-200 dark:border-[#22272B]'} hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            {assignment.urgent && (
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-xs font-medium">URGENT - Due in {assignment.dueIn}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white font-semibold">{assignment.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm mt-0.5">{assignment.instructor} · {assignment.subject}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-white/50">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {assignment.dueDate}</span>
                  {!assignment.urgent && <span className="flex items-center gap-1">In {assignment.dueIn}</span>}
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
