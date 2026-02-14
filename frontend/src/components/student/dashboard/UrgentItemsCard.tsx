import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { AlertTriangle, ChevronRight } from 'lucide-react';

interface UrgentItem {
  id: string;
  title: string;
  dueDate: string;
  type: 'assignment' | 'quiz' | 'session';
}

interface UrgentItemsCardProps {
  items: UrgentItem[];
}

const UrgentItemsCard: React.FC<UrgentItemsCardProps> = ({ items }) => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  if (items.length === 0) return null;

  return (
    <div className={`p-5 bg-red-500/10 ${borderRadius} border border-red-500/20`}>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <h3 className="text-gray-900 dark:text-white font-semibold">Urgent Items ({items.length})</h3>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate('/dashboard/student/today/urgent')}
            className={`w-full p-3 bg-gray-50 dark:bg-white/5 ${borderRadius} flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/10 transition-colors`}
          >
            <div className="text-left">
              <div className="text-gray-900 dark:text-white text-sm font-medium">{item.title}</div>
              <div className="text-gray-400 dark:text-white/40 text-xs">Due: {item.dueDate}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-white/40" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default UrgentItemsCard;
