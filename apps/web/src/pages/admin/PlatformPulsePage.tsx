import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Server,
  Shield,
  Wifi,
  Database,
  Brain,
  CreditCard,
  AlertTriangle,
  Clock,
  RefreshCw,
  Users,
  Zap,
  Radio,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AdminBadge from '../../components/admin/shared/AdminBadge';
import AdminLoadingSkeleton from '../../components/admin/shared/AdminLoadingSkeleton';
import adminPulseService from '../../services/admin/adminPulseService';
import type {
  RealtimeMetrics,
  HealthStatusResponse,
  ServiceHealth,
  UrgentFlagsResponse,
  UrgentFlag,
} from '../../services/admin/adminPulseService';

// ---------------------------------------------------------------------------
// Helper: icon for a service key
// ---------------------------------------------------------------------------
const serviceIcon: Record<string, React.ReactNode> = {
  database: <Database className="w-4 h-4" />,
  redis: <Server className="w-4 h-4" />,
  gemini: <Brain className="w-4 h-4" />,
  claude: <Brain className="w-4 h-4" />,
  gpt4: <Brain className="w-4 h-4" />,
  mpesa: <CreditCard className="w-4 h-4" />,
  elevenlabs: <Radio className="w-4 h-4" />,
};

const statusDot: Record<string, string> = {
  healthy: 'bg-green-400',
  degraded: 'bg-yellow-400',
  down: 'bg-red-400',
};

const statusLabel: Record<string, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Down',
};

const severityToBadge: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
};

const categoryIcon: Record<string, React.ReactNode> = {
  child_safety: <Shield className="w-4 h-4 text-red-400" />,
  policy_violation: <AlertTriangle className="w-4 h-4 text-orange-400" />,
  escalated_ticket: <Users className="w-4 h-4 text-yellow-400" />,
  system_alert: <Server className="w-4 h-4 text-blue-400" />,
};

// ---------------------------------------------------------------------------
// Custom Recharts tooltip
// ---------------------------------------------------------------------------
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-500 dark:text-white/60 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-gray-900 dark:text-white" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ---------------------------------------------------------------------------
// Service Health Card
// ---------------------------------------------------------------------------
const ServiceHealthCard: React.FC<{ service: ServiceHealth }> = ({ service }) => (
  <motion.div
    variants={itemVariants}
    className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 hover:border-gray-300 dark:hover:border-[#333] transition-colors"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-gray-100 dark:bg-[#22272B] rounded-lg text-gray-600 dark:text-white/70">
          {serviceIcon[service.key] ?? <Server className="w-4 h-4" />}
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${statusDot[service.status]} ${service.status === 'healthy' ? 'animate-pulse' : ''}`} />
        <span className={`text-xs font-medium ${service.status === 'healthy' ? 'text-green-400' : service.status === 'degraded' ? 'text-yellow-400' : 'text-red-400'}`}>
          {statusLabel[service.status]}
        </span>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div>
        <p className="text-gray-400 dark:text-white/40">Response</p>
        <p className="text-gray-900 dark:text-white font-medium">{service.response_time_ms}ms</p>
      </div>
      <div>
        <p className="text-gray-400 dark:text-white/40">Uptime</p>
        <p className="text-gray-900 dark:text-white font-medium">{service.uptime_percent}%</p>
      </div>
    </div>
  </motion.div>
);

// ---------------------------------------------------------------------------
// Urgent Flag Row
// ---------------------------------------------------------------------------
const UrgentFlagRow: React.FC<{ flag: UrgentFlag }> = ({ flag }) => {
  const timeDiff = Math.round(
    (Date.now() - new Date(flag.flagged_at).getTime()) / 60000
  );
  const timeLabel =
    timeDiff < 60
      ? `${timeDiff}m ago`
      : `${Math.round(timeDiff / 60)}h ago`;

  return (
    <motion.div
      variants={itemVariants}
      className="flex items-start gap-3 p-3 rounded-lg bg-[#1E2225] hover:bg-gray-100 dark:hover:bg-[#22272B] transition-colors"
    >
      <div className="mt-0.5">
        {categoryIcon[flag.category] ?? <AlertTriangle className="w-4 h-4 text-gray-400 dark:text-white/40" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{flag.title}</span>
          <AdminBadge variant={severityToBadge[flag.severity]} size="sm" dot>
            {flag.severity}
          </AdminBadge>
        </div>
        <p className="text-xs text-gray-400 dark:text-white/40 line-clamp-2">{flag.description}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-white/30 whitespace-nowrap mt-0.5">
        <Clock className="w-3 h-3" />
        {timeLabel}
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------
const PlatformPulsePage: React.FC = () => {
  const [realtime, setRealtime] = useState<RealtimeMetrics | null>(null);
  const [health, setHealth] = useState<HealthStatusResponse | null>(null);
  const [urgentFlags, setUrgentFlags] = useState<UrgentFlagsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ---------- Fetch data ----------
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [realtimeData, healthData, flagsData] = await Promise.allSettled([
        adminPulseService.getRealtimeMetrics(),
        adminPulseService.getHealthStatus(),
        adminPulseService.getUrgentFlags(),
      ]);

      if (realtimeData.status === 'fulfilled') setRealtime(realtimeData.value);
      if (healthData.status === 'fulfilled') setHealth(healthData.value);
      if (flagsData.status === 'fulfilled') setUrgentFlags(flagsData.value);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Pulse fetch error:', err);
      setError('Failed to load pulse data. Using cached data if available.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* ====== Header ====== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Platform Pulse</h1>
          <p className="text-gray-500 dark:text-white/50 text-sm mt-1">
            Real-time system monitoring and urgent flags
            {lastUpdated && (
              <span className="ml-2 text-gray-400 dark:text-white/30">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/40">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live &middot; 30s refresh</span>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ====== Stats Row ====== */}
      {loading ? (
        <AdminLoadingSkeleton variant="stats-row" count={4} />
      ) : realtime && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Active Users */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/50 text-xs font-medium">Active Users</span>
              <div className="p-1.5 bg-gray-100 dark:bg-[#22272B] rounded-lg text-emerald-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{realtime.active_users}</p>
            <p className="text-xs text-gray-400 dark:text-white/30 mt-1">{realtime.concurrent_sessions} concurrent sessions</p>
          </motion.div>

          {/* AI Conversations */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/50 text-xs font-medium">AI Chats / hr</span>
              <div className="p-1.5 bg-gray-100 dark:bg-[#22272B] rounded-lg text-cyan-400">
                <Brain className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{realtime.ai_conversations_per_hour}</p>
            <p className="text-xs text-gray-400 dark:text-white/30 mt-1">{realtime.requests_per_minute} req/min</p>
          </motion.div>

          {/* Avg Response Time */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/50 text-xs font-medium">Avg Response</span>
              <div className="p-1.5 bg-gray-100 dark:bg-[#22272B] rounded-lg text-blue-400">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{realtime.avg_response_time_ms}ms</p>
            <p className="text-xs text-gray-400 dark:text-white/30 mt-1">API latency</p>
          </motion.div>

          {/* Error Rate */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/50 text-xs font-medium">Error Rate</span>
              <div className="p-1.5 bg-gray-100 dark:bg-[#22272B] rounded-lg text-orange-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{realtime.error_rate_percent}%</p>
            <p className="text-xs text-gray-400 dark:text-white/30 mt-1">
              {realtime.error_rate_percent < 1 ? 'Within threshold' : 'Above normal'}
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* ====== Three-Panel Layout ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---------- Left Panel: Real-time Overview + Chart ---------- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sessions Over Time Chart */}
          {loading ? (
            <AdminLoadingSkeleton variant="chart" />
          ) : realtime && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Sessions Over Time</h2>
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">Last 60 minutes (5-min intervals)</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-gray-500 dark:text-white/50">Sessions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="text-gray-500 dark:text-white/50">AI Chats</span>
                  </div>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={realtime.sessions_over_time}>
                    <defs>
                      <linearGradient id="gradientSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradientAI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
                    <XAxis
                      dataKey="time"
                      stroke="#555"
                      tick={{ fill: '#777', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#555"
                      tick={{ fill: '#777', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      name="Sessions"
                      stroke="#34d399"
                      strokeWidth={2}
                      fill="url(#gradientSessions)"
                    />
                    <Area
                      type="monotone"
                      dataKey="ai_chats"
                      name="AI Chats"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      fill="url(#gradientAI)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Urgent Flags */}
          {loading ? (
            <AdminLoadingSkeleton variant="card" count={3} />
          ) : urgentFlags && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Urgent Flags</h2>
                </div>
                <div className="flex items-center gap-2">
                  {urgentFlags.summary.critical > 0 && (
                    <AdminBadge variant="critical" size="sm" dot>
                      {urgentFlags.summary.critical} critical
                    </AdminBadge>
                  )}
                  {urgentFlags.summary.high > 0 && (
                    <AdminBadge variant="high" size="sm" dot>
                      {urgentFlags.summary.high} high
                    </AdminBadge>
                  )}
                  <AdminBadge variant="default" size="sm">
                    {urgentFlags.summary.pending_review} pending
                  </AdminBadge>
                </div>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                {urgentFlags.flags.map((flag) => (
                  <UrgentFlagRow key={flag.id} flag={flag} />
                ))}
              </motion.div>

              {urgentFlags.flags.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="w-8 h-8 text-green-400/40 mx-auto mb-2" />
                  <p className="text-gray-400 dark:text-white/40 text-sm">No urgent flags. All clear.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* ---------- Right Panel: Health Status ---------- */}
        <div className="space-y-6">
          {/* Health Status */}
          {loading ? (
            <AdminLoadingSkeleton variant="card" count={4} />
          ) : health && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Service Health</h2>
                </div>
                <div className="flex items-center gap-2">
                  <AdminBadge
                    variant={
                      health.summary.down > 0
                        ? 'critical'
                        : health.summary.degraded > 0
                          ? 'warning'
                          : 'success'
                    }
                    size="sm"
                    dot
                  >
                    {health.summary.down > 0
                      ? `${health.summary.down} down`
                      : health.summary.degraded > 0
                        ? `${health.summary.degraded} degraded`
                        : 'All healthy'}
                  </AdminBadge>
                </div>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {health.services.map((svc) => (
                  <ServiceHealthCard key={svc.key} service={svc} />
                ))}
              </motion.div>

              {/* Health Summary Bar */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#22272B]">
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-white/40 mb-2">
                  <span>Overall Status</span>
                  <span>{health.summary.healthy}/{health.summary.total} services healthy</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden flex">
                  {health.summary.healthy > 0 && (
                    <div
                      className="bg-green-400 h-full transition-all duration-500"
                      style={{ width: `${(health.summary.healthy / health.summary.total) * 100}%` }}
                    />
                  )}
                  {health.summary.degraded > 0 && (
                    <div
                      className="bg-yellow-400 h-full transition-all duration-500"
                      style={{ width: `${(health.summary.degraded / health.summary.total) * 100}%` }}
                    />
                  )}
                  {health.summary.down > 0 && (
                    <div
                      className="bg-red-400 h-full transition-all duration-500"
                      style={{ width: `${(health.summary.down / health.summary.total) * 100}%` }}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformPulsePage;
