import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

const AdminStatsCard: React.FC<AdminStatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  className = '',
  onClick,
}) => {
  const trendColor = trend
    ? trend.direction === 'up'
      ? 'text-green-400'
      : trend.direction === 'down'
        ? 'text-red-400'
        : 'text-gray-500 dark:text-white/50'
    : '';

  const TrendIcon = trend
    ? trend.direction === 'up'
      ? TrendingUp
      : trend.direction === 'down'
        ? TrendingDown
        : Minus
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5
        hover:border-gray-300 dark:hover:border-[#333] transition-all duration-200
        ${onClick ? 'cursor-pointer hover:bg-[#1E2225]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-gray-500 dark:text-white/50 text-sm font-medium">{title}</span>
        <div className="p-2 bg-gray-100 dark:bg-[#22272B] rounded-lg text-gray-600 dark:text-white/70">{icon}</div>
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        {subtitle && <p className="text-xs text-gray-400 dark:text-white/40">{subtitle}</p>}
      </div>

      {trend && TrendIcon && (
        <div className={`flex items-center gap-1.5 mt-3 text-xs ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span className="font-medium">
            {trend.direction !== 'neutral' && (trend.value > 0 ? '+' : '')}
            {trend.value}%
          </span>
          <span className="text-gray-400 dark:text-white/40">{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
};

export default AdminStatsCard;
