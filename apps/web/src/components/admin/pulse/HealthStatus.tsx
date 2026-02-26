import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import AdminBadge from '../shared/AdminBadge';
import adminPulseService, { HealthStatusResponse, ServiceHealth } from '../../../services/admin/adminPulseService';

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  healthy: { icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-400' },
  degraded: { icon: <AlertCircle className="w-5 h-5" />, color: 'text-yellow-400' },
  down: { icon: <XCircle className="w-5 h-5" />, color: 'text-red-400' },
};

const HealthStatus: React.FC = () => {
  const [data, setData] = useState<HealthStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const result = await adminPulseService.getHealthStatus();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch health status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-green-400 font-medium">{data.summary.healthy} healthy</span>
        {data.summary.degraded > 0 && (
          <span className="text-yellow-400 font-medium">{data.summary.degraded} degraded</span>
        )}
        {data.summary.down > 0 && (
          <span className="text-red-400 font-medium">{data.summary.down} down</span>
        )}
        <button
          onClick={fetchHealth}
          className="ml-auto p-1.5 text-gray-400 dark:text-white/40 hover:text-white/70 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.services.map((svc: ServiceHealth) => {
          const cfg = STATUS_CONFIG[svc.status] || STATUS_CONFIG.healthy;
          return (
            <div
              key={svc.key}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 flex items-start gap-3"
            >
              <div className={cfg.color}>{cfg.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {svc.name}
                  </span>
                  <AdminBadge
                    variant={svc.status === 'healthy' ? 'low' : svc.status === 'degraded' ? 'medium' : 'critical'}
                  >
                    {svc.status}
                  </AdminBadge>
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-400 dark:text-white/40">
                  <span>{svc.response_time_ms}ms</span>
                  <span>{svc.uptime_percent}% uptime</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HealthStatus;
