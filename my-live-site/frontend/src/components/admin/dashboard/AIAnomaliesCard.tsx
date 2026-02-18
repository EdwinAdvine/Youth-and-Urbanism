import React from 'react';
import { Brain, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { AIAnomaly } from '../../../services/admin/adminDashboardService';
import AdminBadge from '../shared/AdminBadge';

interface AIAnomaliesCardProps {
  anomalies: AIAnomaly[];
  isLoading?: boolean;
}

const AIAnomaliesCard: React.FC<AIAnomaliesCardProps> = ({ anomalies, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-28 bg-gray-100 dark:bg-[#22272B] rounded" />
          <div className="h-10 w-16 bg-gray-100 dark:bg-[#22272B] rounded" />
          <div className="h-8 bg-gray-100 dark:bg-[#22272B] rounded-lg" />
        </div>
      </div>
    );
  }

  const criticalCount = anomalies.filter(
    (a) => a.severity === 'critical' || a.severity === 'high'
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 hover:border-gray-300 dark:hover:border-[#333] transition-colors cursor-pointer group"
      onClick={() => navigate('/dashboard/admin/ai-monitoring')}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-purple-500/10">
          <Brain className="w-5 h-5 text-purple-400" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-gray-400 dark:text-white/30 group-hover:text-gray-500 dark:group-hover:text-white/60 transition-colors" />
      </div>

      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{anomalies.length}</div>
      <p className="text-sm text-gray-500 dark:text-white/50 mb-3">AI anomalies detected</p>

      {criticalCount > 0 && (
        <AdminBadge variant="critical" size="sm">
          {criticalCount} critical
        </AdminBadge>
      )}

      {anomalies.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {anomalies.slice(0, 2).map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/50">
              <span className={`w-1.5 h-1.5 rounded-full ${
                a.severity === 'critical' ? 'bg-red-500' :
                a.severity === 'high' ? 'bg-orange-500' :
                a.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <span className="truncate">{a.title}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AIAnomaliesCard;
