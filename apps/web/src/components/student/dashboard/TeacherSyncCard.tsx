import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { MessageSquare } from 'lucide-react';

interface TeacherNote {
  id: string;
  teacher: string;
  message: string;
  timestamp: string;
}

interface TeacherSyncCardProps {
  notes: TeacherNote[];
}

const TeacherSyncCard: React.FC<TeacherSyncCardProps> = ({ notes }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  if (notes.length === 0) return null;

  return (
    <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-5 h-5 text-blue-400" />
        <h3 className="text-gray-900 dark:text-white font-semibold">Teacher Notes</h3>
      </div>
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className={`p-3 bg-gray-50 dark:bg-white/5 ${borderRadius}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-900 dark:text-white text-sm font-medium">{note.teacher}</span>
              <span className="text-gray-400 dark:text-white/30 text-xs">{note.timestamp}</span>
            </div>
            <p className="text-gray-500 dark:text-white/60 text-sm">{note.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherSyncCard;
