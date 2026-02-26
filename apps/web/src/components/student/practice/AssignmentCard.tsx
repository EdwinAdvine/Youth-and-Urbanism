import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { FileText, Clock, ChevronRight } from 'lucide-react';

interface AssignmentCardProps {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  grade?: string;
}

const statusStyles = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  submitted: 'bg-blue-500/20 text-blue-400',
  graded: 'bg-green-500/20 text-green-400',
  overdue: 'bg-red-500/20 text-red-400',
};

const AssignmentCard: React.FC<AssignmentCardProps> = ({ title, subject, dueDate, status, grade }) => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 bg-blue-500/20 ${borderRadius} flex items-center justify-center flex-shrink-0`}>
          <FileText className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 dark:text-white font-medium truncate">{title}</h3>
          <p className="text-gray-400 dark:text-white/40 text-sm">{subject}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-gray-500 dark:text-white/50 text-xs">
              <Clock className="w-3 h-3" /> {dueDate}
            </span>
            <span className={`px-2 py-0.5 ${borderRadius} text-xs capitalize ${statusStyles[status]}`}>
              {status}
            </span>
            {grade && <span className="text-green-400 text-xs font-bold">{grade}</span>}
          </div>
        </div>
        <button
          onClick={() => navigate(`/dashboard/student/assignments/pending`)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
        >
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-white/40" />
        </button>
      </div>
    </div>
  );
};

export default AssignmentCard;
