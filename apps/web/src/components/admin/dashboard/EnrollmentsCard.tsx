import React from 'react';
import { GraduationCap, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface EnrollmentsCardProps {
  count: number;
  isLoading?: boolean;
}

const EnrollmentsCard: React.FC<EnrollmentsCardProps> = ({ count, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-28 bg-gray-100 dark:bg-[#22272B] rounded" />
          <div className="h-10 w-16 bg-gray-100 dark:bg-[#22272B] rounded" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 hover:border-gray-300 dark:hover:border-[#333] transition-colors cursor-pointer group"
      onClick={() => navigate('/dashboard/admin/families')}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <GraduationCap className="w-5 h-5 text-blue-400" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-gray-400 dark:text-white/30 group-hover:text-gray-500 dark:group-hover:text-white/60 transition-colors" />
      </div>

      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{count}</div>
      <p className="text-sm text-gray-500 dark:text-white/50">New enrollments today</p>
    </motion.div>
  );
};

export default EnrollmentsCard;
