import React from 'react';
import { ClipboardList, Users, BookOpen, Headset, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { PendingItems } from '../../../services/admin/adminDashboardService';

interface PendingItemsCardProps {
  data: PendingItems | null;
  isLoading?: boolean;
}

const CATEGORY_CONFIG = [
  {
    key: 'pending_enrollments' as const,
    label: 'Pending Enrollments',
    icon: <Users className="w-4 h-4" />,
    path: '/dashboard/admin/families',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    key: 'pending_courses' as const,
    label: 'Courses to Review',
    icon: <BookOpen className="w-4 h-4" />,
    path: '/dashboard/admin/courses',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    key: 'open_tickets' as const,
    label: 'Open Tickets',
    icon: <Headset className="w-4 h-4" />,
    path: '/dashboard/admin/tickets',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
  {
    key: 'moderation_items' as const,
    label: 'Moderation Queue',
    icon: <Scale className="w-4 h-4" />,
    path: '/dashboard/admin/moderation',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
];

const PendingItemsCard: React.FC<PendingItemsCardProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="col-span-1 sm:col-span-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-36 bg-gray-100 dark:bg-[#22272B] rounded" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-100 dark:bg-[#22272B] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const categories = data?.categories;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="col-span-1 sm:col-span-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-yellow-400" />
          Pending Items
        </h3>
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {data?.total ?? 0}
        </span>
      </div>

      <div className="space-y-2">
        {CATEGORY_CONFIG.map((cat) => {
          const count = categories?.[cat.key] ?? 0;
          return (
            <button
              key={cat.key}
              onClick={() => navigate(cat.path)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-[#22272B]/50 border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-[#333] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${cat.bgColor} ${cat.color}`}>
                  {cat.icon}
                </div>
                <span className="text-sm text-gray-600 dark:text-white/70 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {cat.label}
                </span>
              </div>
              <span className={`text-sm font-semibold ${count > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-white/30'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PendingItemsCard;
