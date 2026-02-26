import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InstructorStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  subtitle?: string;
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'red';
  onClick?: () => void;
}

const colorClasses = {
  purple: 'bg-purple-500/10 text-purple-400',
  blue: 'bg-blue-500/10 text-blue-400',
  green: 'bg-green-500/10 text-green-400',
  orange: 'bg-orange-500/10 text-orange-400',
  red: 'bg-red-500/10 text-red-400',
};

export const InstructorStatsCard: React.FC<InstructorStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = 'purple',
  onClick,
}) => {
  return (
    <div
      className={`bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6 ${
        onClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 dark:text-white/60 text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
            {trend && (
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-gray-400 dark:text-gray-300 dark:text-white/40 text-xs mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className="text-gray-400 dark:text-gray-300 dark:text-white/40 text-xs mt-1">{trend.label}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
