import React from 'react';

type BadgeVariant = 'critical' | 'high' | 'medium' | 'low' | 'success' | 'info' | 'warning' | 'default';

interface AdminBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  default: 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 border-gray-300 dark:border-white/20',
};

const dotColors: Record<BadgeVariant, string> = {
  critical: 'bg-red-400',
  high: 'bg-orange-400',
  medium: 'bg-yellow-400',
  low: 'bg-blue-400',
  success: 'bg-green-400',
  info: 'bg-cyan-400',
  warning: 'bg-amber-400',
  default: 'bg-white/60',
};

const AdminBadge: React.FC<AdminBadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  dot = false,
  size = 'sm',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        ${variantStyles[variant]}
        ${sizeClasses}
        ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

export default AdminBadge;
