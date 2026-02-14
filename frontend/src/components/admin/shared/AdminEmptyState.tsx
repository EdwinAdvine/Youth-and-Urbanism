import React from 'react';
import { Inbox } from 'lucide-react';

interface AdminEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="p-4 bg-[#22272B] rounded-2xl mb-4 text-white/30">
        {icon || <Inbox className="w-10 h-10" />}
      </div>
      <h3 className="text-lg font-semibold text-white/80 mb-1">{title}</h3>
      {description && <p className="text-sm text-white/40 max-w-sm mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

export default AdminEmptyState;
