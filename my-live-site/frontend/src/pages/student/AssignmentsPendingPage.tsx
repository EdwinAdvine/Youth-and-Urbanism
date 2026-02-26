import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { FileText, Clock, Upload, BookOpen } from 'lucide-react';

const pendingAssignments = [
  { id: '1', title: 'Fractions Word Problems', subject: 'Mathematics', dueDate: 'Feb 15', status: 'Not started', progress: 0, instructor: 'Ms. Wanjiku' },
  { id: '2', title: 'Water Cycle Essay', subject: 'Science', dueDate: 'Feb 16', status: 'Draft saved', progress: 40, instructor: 'Mr. Ochieng' },
  { id: '3', title: 'Creative Story Writing', subject: 'English', dueDate: 'Feb 19', status: 'In progress', progress: 65, instructor: 'Mrs. Kamau' },
  { id: '4', title: 'Kenya Map Labeling', subject: 'Social Studies', dueDate: 'Feb 20', status: 'Not started', progress: 0, instructor: 'Ms. Njeri' },
  { id: '5', title: 'Insha ya Masimulizi', subject: 'Kiswahili', dueDate: 'Feb 22', status: 'Not started', progress: 0, instructor: 'Mwl. Otieno' },
];

const AssignmentsPendingPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pending Assignments</h1>
        <p className="text-gray-600 dark:text-white/70">{pendingAssignments.length} assignments awaiting completion</p>
      </div>

      <div className="space-y-3">
        {pendingAssignments.map((assignment) => (
          <div key={assignment.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-blue-500/20 ${borderRadius} flex items-center justify-center`}>
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 dark:text-white font-semibold">{assignment.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm mt-0.5">{assignment.instructor} · {assignment.subject}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-white/50">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {assignment.dueDate}</span>
                  <span className={`px-2 py-0.5 ${borderRadius} text-xs ${assignment.progress > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40'}`}>
                    {assignment.status}
                  </span>
                </div>
                {assignment.progress > 0 && (
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${assignment.progress}%` }} />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center gap-2`}>
                  {assignment.progress > 0 ? <><Upload className="w-4 h-4" /> Continue</> : <><BookOpen className="w-4 h-4" /> Start</>}
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
