import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, BookOpen, Activity, Brain,
  RefreshCw, Wifi, WifiOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';
import AdminLoadingSkeleton from '../../components/admin/shared/AdminLoadingSkeleton';
import BentoGrid from '../../components/admin/dashboard/BentoGrid';
import AlertsCard from '../../components/admin/dashboard/AlertsCard';
import PendingItemsCard from '../../components/admin/dashboard/PendingItemsCard';
import RevenueCard from '../../components/admin/dashboard/RevenueCard';
import EnrollmentsCard from '../../components/admin/dashboard/EnrollmentsCard';
import AIAnomaliesCard from '../../components/admin/dashboard/AIAnomaliesCard';
import adminDashboardService from '../../services/admin/adminDashboardService';
import type {
  DashboardOverview,
  DashboardAlert,
  PendingItems,
  RevenueSnapshot,
  AIAnomaly,
} from '../../services/admin/adminDashboardService';

const AdminDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItems | null>(null);
  const [revenue, setRevenue] = useState<RevenueSnapshot | null>(null);
  const [anomalies, setAnomalies] = useState<AIAnomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [overviewData, alertsData, pendingData, revenueData, anomalyData] =
        await Promise.allSettled([
          adminDashboardService.getOverview(),
          adminDashboardService.getAlerts(),
          adminDashboardService.getPendingItems(),
          adminDashboardService.getRevenueSnapshot(),
          adminDashboardService.getAIAnomalies(),
        ]);

      if (overviewData.status === 'fulfilled') setOverview(overviewData.value);
      if (alertsData.status === 'fulfilled') setAlerts(alertsData.value);
      if (pendingData.status === 'fulfilled') setPendingItems(pendingData.value);
      if (revenueData.status === 'fulfilled') setRevenue(revenueData.value);
      if (anomalyData.status === 'fulfilled') setAnomalies(anomalyData.value);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Using cached data if available.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => fetchDashboardData(true), 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Command Center</h1>
          <p className="text-white/50 text-sm mt-1">
            Real-time overview of your platform
            {lastUpdated && (
              <span className="ml-2 text-white/30">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live</span>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors disabled:opacity-50"
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

      {/* Stats Row */}
      {loading ? (
        <AdminLoadingSkeleton variant="stats-row" count={4} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <AdminStatsCard
            title="Total Users"
            value={overview?.total_users?.toLocaleString() ?? '0'}
            icon={<Users className="w-5 h-5" />}
            trend={overview?.active_users_today ? {
              direction: 'up' as const,
              value: overview.active_users_today,
              label: 'active today',
            } : undefined}
          />
          <AdminStatsCard
            title="Active Courses"
            value={overview?.active_courses?.toLocaleString() ?? '0'}
            icon={<BookOpen className="w-5 h-5" />}
            trend={{
              direction: 'neutral' as const,
              value: overview?.total_courses ?? 0,
              label: 'total',
            }}
          />
          <AdminStatsCard
            title="AI Sessions Today"
            value={overview?.ai_sessions_today?.toLocaleString() ?? '0'}
            icon={<Brain className="w-5 h-5" />}
          />
          <AdminStatsCard
            title="Platform Activity"
            value={overview?.active_users_today?.toLocaleString() ?? '0'}
            icon={<Activity className="w-5 h-5" />}
            trend={{
              direction: 'up' as const,
              value: 0,
              label: 'online now',
            }}
          />
        </motion.div>
      )}

      {/* Bento Grid */}
      <BentoGrid>
        {/* Alerts Card - 2 columns */}
        <AlertsCard alerts={alerts} isLoading={loading} />

        {/* Revenue Card - 2 columns */}
        <RevenueCard data={revenue} isLoading={loading} />

        {/* Pending Items - 2 columns */}
        <PendingItemsCard data={pendingItems} isLoading={loading} />

        {/* Enrollments Card - 1 column */}
        <EnrollmentsCard
          count={overview?.new_enrollments_today ?? 0}
          isLoading={loading}
        />

        {/* AI Anomalies Card - 1 column */}
        <AIAnomaliesCard anomalies={anomalies} isLoading={loading} />
      </BentoGrid>
    </div>
  );
};

export default AdminDashboardPage;
