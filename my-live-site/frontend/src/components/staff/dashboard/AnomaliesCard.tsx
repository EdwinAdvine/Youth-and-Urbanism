import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

interface Anomaly {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  trend: 'up' | 'down' | 'flat';
  metric: string;
  detectedAt: string;
}

interface AnomaliesCardProps {
  anomalies: Anomaly[];
  isLoading?: boolean;
}

/** Determine the navigation target based on the anomaly title/description. */
function getAnomalyRoute(anomaly: Anomaly): string {
  const text = `${anomaly.title} ${anomaly.description}`.toLowerCase();
  if (text.includes('login') || text.includes('security') || text.includes('auth')) {
    return '/dashboard/staff/account/security';
  }
  if (text.includes('ai') || text.includes('tutor') || text.includes('response')) {
    return '/dashboard/staff/insights/health';
  }
  if (text.includes('assessment') || text.includes('submission') || text.includes('answer')) {
    return '/dashboard/staff/moderation/review';
  }
  if (text.includes('content') || text.includes('performance')) {
    return '/dashboard/staff/insights/content';
  }
  // Default to platform health
  return '/dashboard/staff/insights/health';
}

const AnomaliesCard: React.FC<AnomaliesCardProps> = ({ anomalies, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 animate-pulse">
        <div className="h-5 w-40 bg-gray-100 dark:bg-[#22272B] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-gray-100 dark:bg-[#22272B] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const severityConfig: Record<string, { dot: string; bg: string }> = {
    high: { dot: 'bg-red-400 animate-pulse', bg: 'border-red-500/30' },
    medium: { dot: 'bg-yellow-400', bg: 'border-yellow-500/30' },
    low: { dot: 'bg-blue-400', bg: 'border-blue-500/30' },
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-red-400" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-green-400" />;
    return <AlertCircle className="w-3 h-3 text-yellow-400" />;
  };

  return (
    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          AI Anomalies
        </h3>
        <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
          AI Detected
        </span>
      </div>
      <div className="space-y-2">
        {anomalies.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-white/40 text-center py-4">No anomalies detected</p>
        ) : (
          anomalies.slice(0, 3).map((anomaly) => {
            const config = severityConfig[anomaly.severity] || severityConfig.low;
            return (
              <div
                key={anomaly.id}
                onClick={() => navigate(getAnomalyRoute(anomaly))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(getAnomalyRoute(anomaly));
                  }
                }}
                className={`p-3 rounded-lg bg-gray-100 dark:bg-[#22272B]/50 border ${config.bg} cursor-pointer hover:bg-gray-200 dark:hover:bg-[#22272B] transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{anomaly.title}</p>
                  </div>
                  <TrendIcon trend={anomaly.trend} />
                </div>
                <p className="text-xs text-gray-400 dark:text-white/40 mt-1 ml-4">{anomaly.description}</p>
                <div className="flex items-center gap-3 mt-1.5 ml-4">
                  <span className="text-[10px] text-gray-400 dark:text-white/30">{anomaly.metric}</span>
                  <span className="text-[10px] text-gray-400 dark:text-white/30">{anomaly.detectedAt}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AnomaliesCard;
