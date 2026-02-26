import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Ticket, Bell, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminBadge from '../shared/AdminBadge';
import adminPulseService, { UrgentFlagsResponse, UrgentFlag } from '../../../services/admin/adminPulseService';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  child_safety: <Shield className="w-4 h-4" />,
  policy_violation: <AlertTriangle className="w-4 h-4" />,
  escalated_ticket: <Ticket className="w-4 h-4" />,
  system_alert: <Bell className="w-4 h-4" />,
};

const UrgentFlags: React.FC = () => {
  const [data, setData] = useState<UrgentFlagsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const result = await adminPulseService.getUrgentFlags();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch urgent flags:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
    const interval = setInterval(fetchFlags, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-4 text-sm flex-wrap">
        <span className="text-gray-500 dark:text-white/50">
          {data.summary.total} flags
        </span>
        {data.summary.critical > 0 && (
          <span className="text-red-400 font-medium">{data.summary.critical} critical</span>
        )}
        {data.summary.high > 0 && (
          <span className="text-orange-400 font-medium">{data.summary.high} high</span>
        )}
        {data.summary.medium > 0 && (
          <span className="text-yellow-400 font-medium">{data.summary.medium} medium</span>
        )}
        {data.summary.pending_review > 0 && (
          <span className="text-blue-400 font-medium">{data.summary.pending_review} pending review</span>
        )}
      </div>

      {/* Flag list */}
      {data.flags.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-white/40 text-sm">
          No urgent flags at this time.
        </div>
      ) : (
        <div className="space-y-2">
          {data.flags.map((flag: UrgentFlag) => (
            <div
              key={flag.id}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 flex items-start gap-3 hover:border-gray-300 dark:hover:border-[#333] transition-colors"
            >
              {/* Category icon */}
              <div className="mt-0.5 text-gray-400 dark:text-white/40">
                {CATEGORY_ICONS[flag.category] || <Bell className="w-4 h-4" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {flag.title}
                  </span>
                  <AdminBadge variant={flag.severity as 'critical' | 'high' | 'medium' | 'low'}>{flag.severity}</AdminBadge>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-white/40 line-clamp-2">
                  {flag.description}
                </p>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-400 dark:text-white/30">
                  {flag.student_grade && <span>{flag.student_grade}</span>}
                  {flag.subject && <span>{flag.subject}</span>}
                  <span>{new Date(flag.flagged_at).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Action link */}
              <button
                onClick={() => navigate(flag.action_url)}
                className="mt-0.5 p-1.5 text-gray-400 dark:text-white/40 hover:text-red-400 dark:hover:text-red-400 transition-colors"
                title="View details"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UrgentFlags;
