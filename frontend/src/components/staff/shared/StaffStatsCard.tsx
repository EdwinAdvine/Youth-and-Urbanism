import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StaffStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

const StaffStatsCard: React.FC<StaffStatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  className = '',
  onClick,
}) => {
  const trendColor = trend
    ? trend.isPositive
      ? 'text-green-400'
      : 'text-red-400'
    : '';

  const TrendIcon = trend
    ? trend.isPositive
      ? TrendingUp
      : TrendingDown
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-[#181C1F] border border-[#22272B] rounded-xl p-5
        hover:border-[#333] transition-all duration-200
        ${onClick ? 'cursor-pointer hover:bg-[#1E2225]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-white/50 text-sm font-medium">{title}</span>
        <div className="p-2 bg-[#22272B] rounded-lg text-white/70">{icon}</div>
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
      </div>

      {trend && TrendIcon && (
        <div className={`flex items-center gap-1.5 mt-3 text-xs ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span className="font-medium">
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </span>
          <span className="text-white/40">vs last period</span>
        </div>
      )}
    </motion.div>
  );
};

export default StaffStatsCard;
