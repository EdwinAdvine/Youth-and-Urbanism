import React from 'react';
import { AlertTriangle, ShieldAlert, CreditCard, Users, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardAlert } from '../../../services/admin/adminDashboardService';
import AdminBadge from '../shared/AdminBadge';

interface AlertsCardProps {
  alerts: DashboardAlert[];
  isLoading?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  safety: <ShieldAlert className="w-4 h-4" />,
  system: <AlertTriangle className="w-4 h-4" />,
  payment: <CreditCard className="w-4 h-4" />,
  user: <Users className="w-4 h-4" />,
};

const AlertsCard: React.FC<AlertsCardProps> = ({ alerts, isLoading }) => {
  if (isLoading) {
    return (
      <div className="col-span-1 sm:col-span-2 bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-32 bg-[#22272B] rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-[#22272B] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical' || a.severity === 'high');
  const otherAlerts = alerts.filter((a) => a.severity !== 'critical' && a.severity !== 'high');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="col-span-1 sm:col-span-2 bg-[#181C1F] border border-[#22272B] rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#E40000]" />
          Active Alerts
        </h3>
        <span className="text-xs text-white/50">
          {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {alerts.length === 0 ? (
        <p className="text-white/40 text-sm py-4 text-center">No active alerts</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-[#333]">
          {[...criticalAlerts, ...otherAlerts].map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                alert.severity === 'critical'
                  ? 'bg-red-500/5 border-red-500/20'
                  : alert.severity === 'high'
                  ? 'bg-orange-500/5 border-orange-500/20'
                  : 'bg-[#22272B]/50 border-[#22272B]'
              }`}
            >
              <div className="mt-0.5 text-white/60">
                {ICON_MAP[alert.type] || <AlertTriangle className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-white truncate">
                    {alert.title}
                  </span>
                  <AdminBadge variant={alert.severity} size="sm">
                    {alert.severity}
                  </AdminBadge>
                </div>
                <p className="text-xs text-white/50 line-clamp-1">{alert.message}</p>
              </div>
              {alert.action_url && (
                <a
                  href={alert.action_url}
                  className="text-white/40 hover:text-white transition-colors flex-shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AlertsCard;
