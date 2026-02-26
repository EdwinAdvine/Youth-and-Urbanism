import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { AlertTriangle, Clock, FileText, Video } from 'lucide-react';

const UrgentItemsPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  const urgentItems = [
    { id: 1, type: 'assignment', title: 'Math Homework', due: '2 hours', path: '/dashboard/student/assignments/pending' },
    { id: 2, type: 'quiz', title: 'Science Quiz', due: 'Tomorrow', path: '/dashboard/student/quizzes/upcoming' },
    { id: 3, type: 'live_session', title: 'English Class', due: '30 mins', path: '/dashboard/student/live/join' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-8 h-8 text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Urgent Items</h1>
          <p className="text-gray-600 dark:text-white/70">Tasks that need your attention</p>
        </div>
      </div>

      <div className="space-y-3">
        {urgentItems.map((item) => (
          <div key={item.id} className={`p-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 ${borderRadius} border border-orange-500/30`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {item.type === 'assignment' && <FileText className="w-6 h-6 text-orange-400" />}
                {item.type === 'quiz' && <Clock className="w-6 h-6 text-orange-400" />}
                {item.type === 'live_session' && <Video className="w-6 h-6 text-orange-400" />}
                <div>
                  <div className="text-gray-900 dark:text-white font-medium">{item.title}</div>
                  <div className="text-sm text-gray-600 dark:text-white/70">Due in {item.due}</div>
                </div>
              </div>
              <button onClick={() => navigate(item.path)} className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius}`}>
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrgentItemsPage;
