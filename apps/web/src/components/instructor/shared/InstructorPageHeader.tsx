import React from 'react';

interface InstructorPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: string;
  icon?: React.ReactNode;
}

export const InstructorPageHeader: React.FC<InstructorPageHeaderProps> = ({
  title,
  description,
  actions,
  badge,
  icon,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="p-3 bg-purple-500/10 rounded-xl">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {badge && (
                <span className="px-3 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-gray-500 dark:text-white/60 text-sm mt-1 max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
