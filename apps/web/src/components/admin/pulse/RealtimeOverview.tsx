import React, { useEffect, useState } from 'react';
import { Users, Activity, MessageSquare, Zap, Clock, AlertTriangle } from 'lucide-react';
import AdminStatsCard from '../shared/AdminStatsCard';
import AdminChart from '../shared/AdminChart';
import adminPulseService, { RealtimeMetrics } from '../../../services/admin/adminPulseService';

const RealtimeOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const data = await adminPulseService.getRealtimeMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch realtime metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15_000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  const cards = [
    { title: 'Active Users', value: metrics.active_users.toLocaleString(), icon: <Users className="w-5 h-5" /> },
    { title: 'Sessions', value: metrics.concurrent_sessions.toLocaleString(), icon: <Activity className="w-5 h-5" /> },
    { title: 'AI Chats / hr', value: metrics.ai_conversations_per_hour.toLocaleString(), icon: <MessageSquare className="w-5 h-5" /> },
    { title: 'Requests / min', value: metrics.requests_per_minute.toLocaleString(), icon: <Zap className="w-5 h-5" /> },
    { title: 'Avg Response', value: `${metrics.avg_response_time_ms}ms`, icon: <Clock className="w-5 h-5" /> },
    { title: 'Error Rate', value: `${metrics.error_rate_percent}%`, icon: <AlertTriangle className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <AdminStatsCard key={c.title} title={c.title} value={c.value} icon={c.icon} />
        ))}
      </div>

      {/* Sessions sparkline chart */}
      {metrics.sessions_over_time && metrics.sessions_over_time.length > 0 && (
        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-500 dark:text-white/50 mb-4">
            Sessions Over Time
          </h3>
          <AdminChart
            data={metrics.sessions_over_time as unknown as Record<string, unknown>[]}
            type="area"
            xAxisKey="time"
            dataKeys={[
              { key: 'sessions', color: '#E40000' },
              { key: 'ai_chats', color: '#3B82F6' },
            ]}
            height={200}
          />
        </div>
      )}
    </div>
  );
};

export default RealtimeOverview;
