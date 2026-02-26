import React from 'react';
import { motion } from 'framer-motion';

interface PartnerBentoCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  className?: string;
  headerClassName?: string;
  noPadding?: boolean;
}

const colSpanClasses: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-1 md:col-span-2',
  3: 'col-span-1 md:col-span-2 lg:col-span-3',
  4: 'col-span-1 md:col-span-2 lg:col-span-4',
};

const rowSpanClasses: Record<number, string> = {
  1: 'row-span-1',
  2: 'row-span-1 md:row-span-2',
};

const PartnerBentoCard: React.FC<PartnerBentoCardProps> = ({
  title,
  icon,
  children,
  action,
  colSpan = 1,
  rowSpan = 1,
  className = '',
  headerClassName = '',
  noPadding = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden
        hover:border-[#E40000]/30 transition-colors duration-200
        ${colSpanClasses[colSpan]}
        ${rowSpanClasses[rowSpan]}
        ${className}
      `}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-[#22272B] ${headerClassName}`}>
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-[#E40000]">{icon}</span>}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Content */}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </motion.div>
  );
};

export default PartnerBentoCard;
