import React, { useState } from 'react';
import {
  RefreshCw, Activity, AlertCircle, ThumbsUp,
  Clock, Zap, Server, CheckCircle, XCircle, Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
type ProviderStatus = 'operational' | 'degraded' | 'down';

interface PerformanceStats {
  avg_response_time: number;
  error_rate: number;
  avg_satisfaction: number;
  uptime: number;
}

interface ResponseTimeDataPoint {
  time: string;
  gemini: number;
  claude: number;
  gpt4: number;
  grok: number;
}

interface ProviderPerformance {
  id: string;
  provider: string;
  avg_latency_ms: number;
  p95_latency_ms: number;
  error_rate: number;
  satisfaction: number;
  total_requests_today: number;
  status: ProviderStatus;
  last_error: string | null;
  last_checked: string;
}

interface RecentIncident {
  id: string;
  provider: string;
  incident_type: string;
  description: string;
  started_at: string;
  resolved_at: string | null;
  duration_minutes: number | null;
}

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------
const mockStats: PerformanceStats = {
  avg_response_time: 1.24,
  error_rate: 0.8,
  avg_satisfaction: 4.7,
  uptime: 99.94,
};

const mockResponseTimeData: ResponseTimeDataPoint[] = [
  { time: '00:00', gemini: 1.2, claude: 1.4, gpt4: 1.8, grok: 2.1 },
  { time: '02:00', gemini: 1.1, claude: 1.3, gpt4: 1.6, grok: 1.9 },
  { time: '04:00', gemini: 1.0, claude: 1.2, gpt4: 1.5, grok: 1.8 },
  { time: '06:00', gemini: 1.3, claude: 1.5, gpt4: 1.7, grok: 2.0 },
  { time: '08:00', gemini: 1.8, claude: 2.0, gpt4: 2.3, grok: 2.8 },
  { time: '09:00', gemini: 2.2, claude: 2.4, gpt4: 2.8, grok: 3.2 },
  { time: '10:00', gemini: 1.9, claude: 2.1, gpt4: 2.5, grok: 2.9 },
  { time: '11:00', gemini: 1.6, claude: 1.8, gpt4: 2.2, grok: 2.5 },
  { time: '12:00', gemini: 2.0, claude: 2.2, gpt4: 2.6, grok: 3.0 },
  { time: '13:00', gemini: 1.7, claude: 1.9, gpt4: 2.3, grok: 2.7 },
  { time: '14:00', gemini: 1.4, claude: 1.6, gpt4: 2.0, grok: 2.3 },
  { time: '15:00', gemini: 1.3, claude: 1.5, gpt4: 1.9, grok: 2.2 },
  { time: '16:00', gemini: 1.5, claude: 1.7, gpt4: 2.1, grok: 2.4 },
  { time: '18:00', gemini: 1.2, claude: 1.4, gpt4: 1.7, grok: 2.0 },
  { time: '20:00', gemini: 1.1, claude: 1.3, gpt4: 1.6, grok: 1.9 },
  { time: '22:00', gemini: 1.0, claude: 1.2, gpt4: 1.5, grok: 1.7 },
];

const mockProviderPerformance: ProviderPerformance[] = [
  {
    id: 'pp-001',
    provider: 'Gemini Pro',
    avg_latency_ms: 1240,
    p95_latency_ms: 2100,
    error_rate: 0.3,
    satisfaction: 4.8,
    total_requests_today: 4521,
    status: 'operational',
    last_error: null,
    last_checked: '2025-01-15T14:55:00Z',
  },
  {
    id: 'pp-002',
    provider: 'Claude 3.5',
    avg_latency_ms: 1580,
    p95_latency_ms: 2800,
    error_rate: 0.5,
    satisfaction: 4.9,
    total_requests_today: 2134,
    status: 'operational',
    last_error: null,
    last_checked: '2025-01-15T14:55:00Z',
  },
  {
    id: 'pp-003',
    provider: 'GPT-4',
    avg_latency_ms: 2050,
    p95_latency_ms: 3600,
    error_rate: 1.2,
    satisfaction: 4.6,
    total_requests_today: 1287,
    status: 'degraded',
    last_error: 'Rate limit exceeded at 14:32 UTC',
    last_checked: '2025-01-15T14:55:00Z',
  },
  {
    id: 'pp-004',
    provider: 'Grok',
    avg_latency_ms: 2400,
    p95_latency_ms: 4200,
    error_rate: 2.8,
    satisfaction: 4.3,
    total_requests_today: 543,
    status: 'operational',
    last_error: null,
    last_checked: '2025-01-15T14:55:00Z',
  },
  {
    id: 'pp-005',
    provider: 'ElevenLabs (TTS)',
    avg_latency_ms: 890,
    p95_latency_ms: 1500,
    error_rate: 0.1,
    satisfaction: 4.7,
    total_requests_today: 876,
    status: 'operational',
    last_error: null,
    last_checked: '2025-01-15T14:55:00Z',
  },
  {
    id: 'pp-006',
    provider: 'Synthesia (Video)',
    avg_latency_ms: 15200,
    p95_latency_ms: 28000,
    error_rate: 3.5,
    satisfaction: 4.1,
    total_requests_today: 45,
    status: 'down',
    last_error: 'API returned 503 Service Unavailable',
    last_checked: '2025-01-15T14:50:00Z',
  },
];

const mockRecentIncidents: RecentIncident[] = [
  {
    id: 'ri-001',
    provider: 'GPT-4',
    incident_type: 'Rate Limiting',
    description: 'API rate limit exceeded during peak hours. Requests were routed to Gemini Pro as fallback.',
    started_at: '2025-01-15T14:32:00Z',
    resolved_at: '2025-01-15T14:45:00Z',
    duration_minutes: 13,
  },
  {
    id: 'ri-002',
    provider: 'Synthesia',
    incident_type: 'Service Outage',
    description: 'Synthesia API returning 503 errors. Video generation temporarily unavailable.',
    started_at: '2025-01-15T13:00:00Z',
    resolved_at: null,
    duration_minutes: null,
  },
  {
    id: 'ri-003',
    provider: 'Grok',
    incident_type: 'High Latency',
    description: 'Response times spiked to 5s+ for 20 minutes during morning peak.',
    started_at: '2025-01-15T09:15:00Z',
    resolved_at: '2025-01-15T09:35:00Z',
    duration_minutes: 20,
  },
];

// ------------------------------------------------------------------
// Badge helpers
// ------------------------------------------------------------------
const statusColors: Record<ProviderStatus, string> = {
  operational: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  degraded: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  down: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusIcons: Record<ProviderStatus, React.ReactNode> = {
  operational: <CheckCircle className="w-3 h-3" />,
  degraded: <AlertCircle className="w-3 h-3" />,
  down: <XCircle className="w-3 h-3" />,
};

const ProviderStatusBadge: React.FC<{ status: ProviderStatus }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColors[status]}`}>
    {statusIcons[status]}
    {status}
  </span>
);

// ------------------------------------------------------------------
// Stats card
// ------------------------------------------------------------------
const StatsCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}> = ({ label, value, icon, iconColor, change, changeType }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-500 dark:text-white/60 text-sm">{label}</span>
      <div className={iconColor}>{icon}</div>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    {change && (
      <p className={`text-xs mt-1 ${
        changeType === 'positive' ? 'text-emerald-400' :
        changeType === 'negative' ? 'text-red-400' :
        'text-gray-400 dark:text-white/40'
      }`}>
        {change}
      </p>
    )}
  </motion.div>
);

// ------------------------------------------------------------------
// Custom tooltip for chart
// ------------------------------------------------------------------
const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-3 shadow-xl">
      <p className="text-gray-900 dark:text-white font-medium text-sm mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs text-gray-500 dark:text-white/60">
          <span style={{ color: entry.color }}>{entry.name}</span>: {entry.value}s
        </p>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatLatency = (ms: number): string => {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${ms}ms`;
};

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
const AIPerformancePage: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('24h');
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Performance data refreshed', 'success');
    }, 1200);
  };

  const timeRanges = [
    { value: '1h', label: '1H' },
    { value: '6h', label: '6H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <AdminPageHeader
          title="AI Performance"
          subtitle="Monitor AI provider performance, response times, and system health"
          breadcrumbs={[
            { label: 'AI Systems', path: '/dashboard/admin' },
            { label: 'Performance' },
          ]}
          actions={
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Avg Response Time"
            value={`${mockStats.avg_response_time}s`}
            icon={<Clock className="w-5 h-5" />}
            iconColor="text-blue-400"
            change="-0.3s from yesterday"
            changeType="positive"
          />
          <StatsCard
            label="Error Rate"
            value={`${mockStats.error_rate}%`}
            icon={<AlertCircle className="w-5 h-5" />}
            iconColor="text-red-400"
            change="+0.2% from yesterday"
            changeType="negative"
          />
          <StatsCard
            label="Avg Satisfaction"
            value={`${mockStats.avg_satisfaction}/5`}
            icon={<ThumbsUp className="w-5 h-5" />}
            iconColor="text-emerald-400"
            change="+0.1 from last week"
            changeType="positive"
          />
          <StatsCard
            label="Uptime"
            value={`${mockStats.uptime}%`}
            icon={<Activity className="w-5 h-5" />}
            iconColor="text-purple-400"
            change="30-day rolling average"
            changeType="neutral"
          />
        </div>

        {/* Response Time Chart */}
        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Response Time Over Time</h3>
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedTimeRange(range.value)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    selectedTimeRange === range.value
                      ? 'bg-[#E40000] text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockResponseTimeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: '#ffffff66', fontSize: 12 }}
                  axisLine={{ stroke: '#22272B' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#ffffff66', fontSize: 12 }}
                  axisLine={{ stroke: '#22272B' }}
                  tickLine={false}
                  tickFormatter={(value: number) => `${value}s`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '16px' }}
                  formatter={(value: string) => (
                    <span className="text-xs text-gray-500 dark:text-white/60">{value}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="gemini"
                  name="Gemini Pro"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3B82F6' }}
                />
                <Line
                  type="monotone"
                  dataKey="claude"
                  name="Claude 3.5"
                  stroke="#A855F7"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#A855F7' }}
                />
                <Line
                  type="monotone"
                  dataKey="gpt4"
                  name="GPT-4"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#10B981' }}
                />
                <Line
                  type="monotone"
                  dataKey="grok"
                  name="Grok"
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#F97316' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Provider Performance Table */}
        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[#22272B]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Provider Performance</h3>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Real-time performance metrics for all AI providers</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Provider</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Avg Latency</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">P95 Latency</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Error Rate</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Satisfaction</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Requests Today</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Status</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockProviderPerformance.map((provider) => (
                  <tr
                    key={provider.id}
                    className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#22272B] flex items-center justify-center flex-shrink-0">
                          <Server className="w-4 h-4 text-gray-500 dark:text-white/60" />
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">{provider.provider}</p>
                          {provider.last_error && (
                            <p className="text-xs text-red-400 truncate max-w-[200px]">{provider.last_error}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        provider.avg_latency_ms <= 1500 ? 'text-emerald-400' :
                        provider.avg_latency_ms <= 3000 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {formatLatency(provider.avg_latency_ms)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-white/50">{formatLatency(provider.p95_latency_ms)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        provider.error_rate <= 1 ? 'text-emerald-400' :
                        provider.error_rate <= 3 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {provider.error_rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-gray-400 dark:text-white/40" />
                        <span className="text-gray-600 dark:text-white/70">{provider.satisfaction}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-white/50">{provider.total_requests_today.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <ProviderStatusBadge status={provider.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          title="View Details"
                          onClick={() => {
                            alert(
                              `Provider: ${provider.provider}\n\n` +
                              `Status: ${provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}\n` +
                              `Avg Latency: ${formatLatency(provider.avg_latency_ms)}\n` +
                              `P95 Latency: ${formatLatency(provider.p95_latency_ms)}\n` +
                              `Error Rate: ${provider.error_rate}%\n` +
                              `Satisfaction: ${provider.satisfaction}/5\n` +
                              `Requests Today: ${provider.total_requests_today.toLocaleString()}\n` +
                              `Last Checked: ${formatDate(provider.last_checked)}\n` +
                              `Last Error: ${provider.last_error ?? 'None'}`
                            );
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Incidents</h3>
          <div className="space-y-3">
            {mockRecentIncidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-start justify-between p-4 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    incident.resolved_at ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}>
                    <Zap className={`w-4 h-4 ${
                      incident.resolved_at ? 'text-emerald-400' : 'text-red-400'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{incident.incident_type}</h4>
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/50 border border-gray-300 dark:border-[#333]">
                        {incident.provider}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                        incident.resolved_at
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {incident.resolved_at ? 'Resolved' : 'Ongoing'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-white/50 mb-1">{incident.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-white/40">
                      <span>Started: {formatDate(incident.started_at)}</span>
                      {incident.duration_minutes !== null && (
                        <span>Duration: {incident.duration_minutes}min</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl ${
              toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}>
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default AIPerformancePage;
