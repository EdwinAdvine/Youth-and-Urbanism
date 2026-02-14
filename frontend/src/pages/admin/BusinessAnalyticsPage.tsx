import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingDown,
  UserPlus,
  Heart,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface MonthlyMetric {
  month: string;
  mrr: number;
  churn: number;
  ltv: number;
  signups: number;
}

interface PartnerPerformance {
  id: string;
  name: string;
  region: string;
  studentsReferred: number;
  revenue: number;
  conversionRate: number;
  churnRate: number;
  status: 'active' | 'inactive' | 'probation';
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MONTHLY_METRICS: MonthlyMetric[] = [
  { month: 'Aug', mrr: 1240000, churn: 3.2, ltv: 48500, signups: 312 },
  { month: 'Sep', mrr: 1385000, churn: 2.9, ltv: 51200, signups: 387 },
  { month: 'Oct', mrr: 1520000, churn: 2.7, ltv: 53800, signups: 445 },
  { month: 'Nov', mrr: 1670000, churn: 3.1, ltv: 52100, signups: 398 },
  { month: 'Dec', mrr: 1450000, churn: 4.2, ltv: 49700, signups: 276 },
  { month: 'Jan', mrr: 1820000, churn: 2.4, ltv: 56300, signups: 521 },
];

const PARTNER_DATA: PartnerPerformance[] = [
  {
    id: 'p1',
    name: 'Nairobi Learning Hub',
    region: 'Nairobi',
    studentsReferred: 342,
    revenue: 4250000,
    conversionRate: 68.5,
    churnRate: 2.1,
    status: 'active',
  },
  {
    id: 'p2',
    name: 'Mombasa Academy Partners',
    region: 'Mombasa',
    studentsReferred: 218,
    revenue: 2780000,
    conversionRate: 61.2,
    churnRate: 3.8,
    status: 'active',
  },
  {
    id: 'p3',
    name: 'Kisumu Education Alliance',
    region: 'Kisumu',
    studentsReferred: 156,
    revenue: 1920000,
    conversionRate: 54.7,
    churnRate: 4.5,
    status: 'probation',
  },
  {
    id: 'p4',
    name: 'Nakuru Tutoring Network',
    region: 'Nakuru',
    studentsReferred: 189,
    revenue: 2340000,
    conversionRate: 72.3,
    churnRate: 1.9,
    status: 'active',
  },
  {
    id: 'p5',
    name: 'Eldoret Scholars Initiative',
    region: 'Eldoret',
    studentsReferred: 97,
    revenue: 1150000,
    conversionRate: 48.2,
    churnRate: 5.7,
    status: 'inactive',
  },
];

const tooltipStyle = {
  backgroundColor: '#181C1F',
  border: '1px solid #22272B',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#fff',
  fontSize: '12px',
};

const formatKES = (value: number): string => {
  if (value >= 1000000) return `KES ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `KES ${(value / 1000).toFixed(0)}K`;
  return `KES ${value.toLocaleString()}`;
};

/* ------------------------------------------------------------------ */
/* Status Badge                                                        */
/* ------------------------------------------------------------------ */

const PartnerStatusBadge: React.FC<{ status: PartnerPerformance['status'] }> = ({ status }) => {
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    inactive: 'bg-red-500/20 text-red-400 border-red-500/30',
    probation: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Animation variants                                                  */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const BusinessAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const latestMonth = MONTHLY_METRICS[MONTHLY_METRICS.length - 1];
  const prevMonth = MONTHLY_METRICS[MONTHLY_METRICS.length - 2];
  const mrrChange = ((latestMonth.mrr - prevMonth.mrr) / prevMonth.mrr) * 100;
  const churnChange = latestMonth.churn - prevMonth.churn;
  const ltvChange = ((latestMonth.ltv - prevMonth.ltv) / prevMonth.ltv) * 100;
  const signupChange = ((latestMonth.signups - prevMonth.signups) / prevMonth.signups) * 100;

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="h-16 bg-[#22272B] rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-[#22272B] rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-80 bg-[#22272B] rounded-xl animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <AdminPageHeader
          title="Business Analytics"
          subtitle="Revenue metrics, churn analysis, and partner performance"
          breadcrumbs={[
            { label: 'Analytics', path: '/dashboard/admin' },
            { label: 'Business Analytics' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          }
        />

        {/* Stats Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <AdminStatsCard
            title="Monthly Recurring Revenue"
            value={formatKES(latestMonth.mrr)}
            icon={<DollarSign className="w-5 h-5" />}
            trend={{ value: +mrrChange.toFixed(1), label: 'vs last month', direction: mrrChange >= 0 ? 'up' : 'down' }}
          />
          <AdminStatsCard
            title="Churn Rate"
            value={`${latestMonth.churn}%`}
            icon={<TrendingDown className="w-5 h-5" />}
            trend={{ value: Math.abs(+churnChange.toFixed(1)), label: 'vs last month', direction: churnChange <= 0 ? 'up' : 'down' }}
          />
          <AdminStatsCard
            title="Lifetime Value"
            value={formatKES(latestMonth.ltv)}
            icon={<Heart className="w-5 h-5" />}
            trend={{ value: +ltvChange.toFixed(1), label: 'vs last month', direction: ltvChange >= 0 ? 'up' : 'down' }}
          />
          <AdminStatsCard
            title="New Signups"
            value={latestMonth.signups.toLocaleString()}
            icon={<UserPlus className="w-5 h-5" />}
            trend={{ value: +signupChange.toFixed(1), label: 'vs last month', direction: signupChange >= 0 ? 'up' : 'down' }}
          />
        </motion.div>

        {/* MRR & Signups Area Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Revenue & Signups Trend</h2>
              <p className="text-sm text-white/50 mt-1">
                Monthly recurring revenue and new user signups over 6 months
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={MONTHLY_METRICS} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gradientMRR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E40000" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E40000" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientSignups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
              <XAxis
                dataKey="month"
                stroke="#333"
                tick={{ fill: '#666', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#333"
                tick={{ fill: '#666', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatKES(v)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#333"
                tick={{ fill: '#666', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [
                  name === 'mrr' ? formatKES(value) : value,
                  name === 'mrr' ? 'MRR' : 'Signups',
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#999' }}
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (value === 'mrr' ? 'MRR' : 'Signups')}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="mrr"
                stroke="#E40000"
                strokeWidth={2}
                fill="url(#gradientMRR)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="signups"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#gradientSignups)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Churn & LTV Line Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Churn Rate & Lifetime Value</h2>
            <p className="text-sm text-white/50 mt-1">
              Monthly churn rate percentage and customer lifetime value
            </p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={MONTHLY_METRICS} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
              <XAxis
                dataKey="month"
                stroke="#333"
                tick={{ fill: '#666', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#333"
                tick={{ fill: '#666', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v}%`}
                domain={[0, 6]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#333"
                tick={{ fill: '#666', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatKES(v)}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [
                  name === 'churn' ? `${value}%` : formatKES(value),
                  name === 'churn' ? 'Churn Rate' : 'LTV',
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#999' }}
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (value === 'churn' ? 'Churn Rate' : 'LTV')}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="churn"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ fill: '#F59E0B', r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ltv"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Partner Performance Table */}
        <motion.div
          variants={itemVariants}
          className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Partner Performance</h2>
            <p className="text-sm text-white/50 mt-1">
              Revenue contribution and conversion metrics by partner
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#22272B]">
                  <th className="text-left py-3 px-4 text-white/50 font-medium">Partner</th>
                  <th className="text-left py-3 px-4 text-white/50 font-medium">Region</th>
                  <th className="text-right py-3 px-4 text-white/50 font-medium">Students</th>
                  <th className="text-right py-3 px-4 text-white/50 font-medium">Revenue</th>
                  <th className="text-right py-3 px-4 text-white/50 font-medium">Conversion</th>
                  <th className="text-right py-3 px-4 text-white/50 font-medium">Churn</th>
                  <th className="text-center py-3 px-4 text-white/50 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {PARTNER_DATA.map((partner) => (
                  <tr
                    key={partner.id}
                    className="border-b border-[#22272B]/50 hover:bg-[#22272B]/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-white font-medium">{partner.name}</td>
                    <td className="py-3 px-4 text-white/60">{partner.region}</td>
                    <td className="py-3 px-4 text-right text-white/80">
                      {partner.studentsReferred.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-white/80">
                      {formatKES(partner.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={
                          partner.conversionRate >= 65
                            ? 'text-green-400'
                            : partner.conversionRate >= 50
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }
                      >
                        {partner.conversionRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={
                          partner.churnRate <= 3
                            ? 'text-green-400'
                            : partner.churnRate <= 5
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }
                      >
                        {partner.churnRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <PartnerStatusBadge status={partner.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default BusinessAnalyticsPage;
