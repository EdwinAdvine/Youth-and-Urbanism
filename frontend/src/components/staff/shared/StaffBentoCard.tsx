import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface StaffBentoCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  span?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
  headerAction?: React.ReactNode;
  isLoading?: boolean;
}

const colSpanClasses: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-1 md:col-span-2',
  3: 'col-span-1 md:col-span-2 lg:col-span-3',
};

const rowSpanClasses: Record<number, string> = {
  1: 'row-span-1',
  2: 'row-span-1 md:row-span-2',
};

const StaffBentoCard: React.FC<StaffBentoCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  span = 1,
  rowSpan = 1,
  headerAction,
  isLoading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden
        hover:border-[#333] transition-colors duration-200
        ${colSpanClasses[span]}
        ${rowSpanClasses[rowSpan]}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#22272B]">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && (
            <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>
          )}
        </div>
        {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
      </div>

      {/* Content */}
      <div className="p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
};

export default StaffBentoCard;
