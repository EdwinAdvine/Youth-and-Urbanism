import React from 'react';
import { Inbox } from 'lucide-react';

interface StaffEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const StaffEmptyState: React.FC<StaffEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      <div className="p-4 bg-gray-100 dark:bg-[#22272B] rounded-2xl mb-4 text-gray-400 dark:text-white/30">
        {icon || <Inbox className="w-10 h-10" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-white/50 max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white bg-[#E40000] hover:bg-[#FF4444] rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default StaffEmptyState;
