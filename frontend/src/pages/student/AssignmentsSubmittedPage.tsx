import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { CheckCircle2, Clock, MessageSquare, RotateCcw, Eye } from 'lucide-react';

const submittedAssignments = [
  { id: '1', title: 'Multiplication Tables Practice', subject: 'Mathematics', submittedAt: '2 hours ago', status: 'Graded', grade: '92%', feedback: true, instructor: 'Ms. Wanjiku' },
  { id: '2', title: 'Parts of a Plant Diagram', subject: 'Science', submittedAt: '1 day ago', status: 'Pending Review', grade: null, feedback: false, instructor: 'Mr. Ochieng' },
  { id: '3', title: 'Paragraph Writing Exercise', subject: 'English', submittedAt: '3 days ago', status: 'Graded', grade: '78%', feedback: true, instructor: 'Mrs. Kamau' },
  { id: '4', title: 'Kenya Counties Map', subject: 'Social Studies', submittedAt: '5 days ago', status: 'Graded', grade: '85%', feedback: true, instructor: 'Ms. Njeri' },
  { id: '5', title: 'Methali na Nahau', subject: 'Kiswahili', submittedAt: '1 week ago', status: 'Resubmit', grade: '55%', feedback: true, instructor: 'Mwl. Otieno' },
];

const statusStyles: Record<string, string> = {
  'Graded': 'bg-green-500/20 text-green-400',
  'Pending Review': 'bg-yellow-500/20 text-yellow-400',
  'Resubmit': 'bg-red-500/20 text-red-400',
};

const AssignmentsSubmittedPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Submitted Assignments</h1>
        <p className="text-gray-600 dark:text-white/70">Track the status of your submissions</p>
      </div>

      <div className="space-y-3">
        {submittedAssignments.map((assignment) => (
          <div key={assignment.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${borderRadius} flex items-center justify-center ${assignment.status === 'Graded' && parseInt(assignment.grade!) >= 80 ? 'bg-green-500/20' : assignment.status === 'Resubmit' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                {assignment.status === 'Graded' ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : assignment.status === 'Resubmit' ? <RotateCcw className="w-6 h-6 text-red-400" /> : <Clock className="w-6 h-6 text-yellow-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 dark:text-white font-semibold">{assignment.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm mt-0.5">{assignment.instructor} · {assignment.subject}</p>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className={`px-2 py-0.5 ${borderRadius} text-xs ${statusStyles[assignment.status]}`}>{assignment.status}</span>
                  {assignment.grade && <span className="text-gray-500 dark:text-white/60">Grade: <span className="text-gray-900 dark:text-white font-medium">{assignment.grade}</span></span>}
                  <span className="text-gray-400 dark:text-white/40">Submitted {assignment.submittedAt}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {assignment.feedback && (
                  <button className={`px-3 py-2 bg-purple-500/20 text-purple-400 text-sm ${borderRadius} flex items-center gap-1`}>
                    <MessageSquare className="w-4 h-4" /> Feedback
                  </button>
                )}
                {assignment.status === 'Resubmit' && (
                  <button className={`px-3 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center gap-1`}>
                    <RotateCcw className="w-4 h-4" /> Resubmit
                  </button>
                )}
                <button className={`px-3 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 text-sm ${borderRadius}`}>
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentsSubmittedPage;
