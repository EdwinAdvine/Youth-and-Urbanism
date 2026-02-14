import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  path?: string;
}

interface StaffPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  className?: string;
}

const StaffPageHeader: React.FC<StaffPageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className = '',
}) => {
  const navigate = useNavigate();

  return (
    <div className={`mb-6 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          className="flex items-center gap-1.5 text-xs text-white/40 mb-2"
          aria-label="Breadcrumb"
        >
          <button
            onClick={() => navigate('/dashboard/staff')}
            className="hover:text-white/60 transition-colors"
          >
            Staff
          </button>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3" />
              {crumb.path ? (
                <button
                  onClick={() => navigate(crumb.path!)}
                  className="hover:text-white/60 transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-white/70 font-medium">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-white/60 mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPageHeader;
