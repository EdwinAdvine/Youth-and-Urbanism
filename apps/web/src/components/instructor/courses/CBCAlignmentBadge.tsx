import React from 'react';
import { Sparkles, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface CBCAlignmentBadgeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const CBCAlignmentBadge: React.FC<CBCAlignmentBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const getScoreConfig = (score: number) => {
    if (score >= 80) {
      return {
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        label: 'Excellent',
        icon: CheckCircle,
      };
    } else if (score >= 60) {
      return {
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        label: 'Good',
        icon: Sparkles,
      };
    } else if (score >= 40) {
      return {
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        label: 'Fair',
        icon: AlertCircle,
      };
    } else {
      return {
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        label: 'Needs Work',
        icon: XCircle,
      };
    }
  };

  const config = getScoreConfig(score);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 ${config.bgColor} ${config.borderColor} ${config.color} ${sizeClasses[size]} rounded-lg border font-medium ${className}`}
      title={`CBC Alignment Score: ${score}%`}
    >
      <Icon className={iconSizes[size]} />
      <span>{score}%</span>
      {showLabel && <span className="text-gray-500 dark:text-white/60">CBC Aligned</span>}
    </div>
  );
};
