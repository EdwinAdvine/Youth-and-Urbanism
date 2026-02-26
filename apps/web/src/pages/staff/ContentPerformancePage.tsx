import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  CheckCircle,
  Star,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { getContentPerformance } from '@/services/staff/staffInsightsService';
import type { ContentPerformanceData } from '@/types/staff';

const tooltipStyle = {
  backgroundColor: '#181C1F',
  border: '1px solid #22272B',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#fff',
  fontSize: '12px',
};

const ITEMS_PER_PAGE = 8;

const ContentPerformancePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('14d');
  const [data, setData] = useState<ContentPerformanceData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const getDateRange = useCallback(
    (range: string): { dateFrom: string; dateTo: string } => {
      const now = new Date();
      const dateTo = now.toISOString().split('T')[0];
      const daysMap: Record<string, number> = {
        '7d': 7,
        '14d': 14,
        '30d': 30,
        '90d': 90,
      };
      const days = daysMap[range] || 14;
      const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const dateFrom = from.toISOString().split('T')[0];
      return { dateFrom, dateTo };
    },
    [],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { dateFrom, dateTo } = getDateRange(dateRange);
      const result = await getContentPerformance(dateFrom, dateTo);
      // The API may return a single object or an array; normalize to array
      const items = Array.isArray(result) ? result : [result];
      setData(items);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  }, [dateRange, getDateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
  };

  // Derived chart data from API response
  const viewsChartData = data.map((item) => ({
    date: item.title.length > 12 ? item.title.substring(0, 12) + '...' : item.title,
    views: item.view_count,
  }));

  const completionChartData = data.reduce<{ type: string; rate: number }[]>((acc, item) => {
    const existing = acc.find((a) => a.type === item.content_type);
    if (existing) {
      existing.rate = Math.round((existing.rate + item.completion_rate) / 2);
    } else {
      acc.push({ type: item.content_type, rate: Math.round(item.completion_rate) });
    }
    return acc;
  }, []);

  const sentimentChartData = data
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 6)
    .map((item) => ({
      name: item.title.length > 25 ? item.title.substring(0, 25) + '...' : item.title,
      views: item.view_count,
    }));

  // Summary stats
  const totalViews = data.reduce((s, i) => s + i.view_count, 0);
  const avgCompletion =
    data.length > 0
      ? Math.round(data.reduce((s, i) => s + i.completion_rate, 0) / data.length)
      : 0;
  const avgEngagement =
    data.length > 0
      ? (data.reduce((s, i) => s + i.engagement_score, 0) / data.length).toFixed(1)
      : '0';
  const topItem = data.length > 0 ? [...data].sort((a, b) => b.view_count - a.view_count)[0] : null;

  // Table pagination
  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  const paginatedData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-100 dark:bg-[#22272B] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-lg text-gray-900 dark:text-white font-medium mb-2">Failed to load performance data</p>
        <p className="text-sm text-gray-500 dark:text-white/50 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Performance</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">Track views, completions, and content ratings</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 dark:text-white/40" />
          <select
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#E40000]/50 appearance-none cursor-pointer"
          >
            <option value="7d">Last 7 days</option>
            <option value="14d">Last 14 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Views',
            value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : String(totalViews),
            change: `${data.length} items`,
            icon: Eye,
            color: 'text-blue-400',
          },
          {
            label: 'Completion Rate',
            value: `${avgCompletion}%`,
            change: 'average',
            icon: CheckCircle,
            color: 'text-emerald-400',
          },
          {
            label: 'Engagement Score',
            value: `${avgEngagement}/10`,
            change: 'average',
            icon: Star,
            color: 'text-yellow-400',
          },
          {
            label: 'Top Performing',
            value: topItem ? (topItem.title.length > 12 ? topItem.title.substring(0, 12) + '...' : topItem.title) : '--',
            change: topItem ? `${topItem.view_count.toLocaleString()} views` : '',
            icon: TrendingUp,
            color: 'text-[#E40000]',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/50 text-xs font-medium">{stat.label}</span>
              <div className={`p-1.5 bg-gray-100 dark:bg-[#22272B] rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-emerald-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views by Content */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Content Views</h3>
          <p className="text-xs text-gray-400 dark:text-white/40 mb-4">View count per content item</p>
          <div className="h-56">
            {viewsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={viewsChartData}>
                  <defs>
                    <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
                  <XAxis dataKey="date" stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="views" name="Views" stroke="#3B82F6" strokeWidth={2} fill="url(#gradViews)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400 dark:text-white/30">
                No data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Completion Rates by Type */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Completion Rates by Type</h3>
          <p className="text-xs text-gray-400 dark:text-white/40 mb-4">Average completion rate per content type</p>
          <div className="h-56">
            {completionChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#22272B" horizontal={false} />
                  <XAxis type="number" stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="type" stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value ?? 0}%`, 'Rate']} />
                  <Bar dataKey="rate" name="Completion %" fill="#10B981" radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400 dark:text-white/30">
                No data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Engagement Scores */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Engagement Scores</h3>
          <p className="text-xs text-gray-400 dark:text-white/40 mb-4">Engagement score per content item</p>
          <div className="h-56">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.map((d) => ({ name: d.title.length > 15 ? d.title.substring(0, 15) + '...' : d.title, score: d.engagement_score }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
                  <XAxis dataKey="name" stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="score" name="Engagement" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400 dark:text-white/30">
                No data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Content */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Top Content</h3>
          <p className="text-xs text-gray-400 dark:text-white/40 mb-4">Most viewed content items</p>
          <div className="h-56">
            {sentimentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#22272B" horizontal={false} />
                  <XAxis type="number" stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#555" tick={{ fill: '#777', fontSize: 10 }} axisLine={false} tickLine={false} width={160} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="views" name="Views" fill="#E40000" radius={[0, 4, 4, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400 dark:text-white/30">
                No data available
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Content Performance Table */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#22272B]">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Content Performance Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Title</th>
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-right">Views</th>
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-right">Completion</th>
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-right">Avg Score</th>
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-right">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-white/40">
                    No performance data available
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-gray-900 dark:text-white font-medium">{item.title}</span>
                        <span className="block text-xs text-gray-400 dark:text-white/40 capitalize">{item.content_type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-white/70">{item.view_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={item.completion_rate >= 80 ? 'text-emerald-400' : item.completion_rate >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                        {Math.round(item.completion_rate)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.avg_score !== null ? (
                        <span className={item.avg_score >= 80 ? 'text-emerald-400' : item.avg_score >= 70 ? 'text-yellow-400' : 'text-red-400'}>
                          {item.avg_score}%
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-white/30">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-gray-600 dark:text-white/70">{item.engagement_score.toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-[#22272B]">
          <p className="text-xs text-gray-400 dark:text-white/40">
            Showing {data.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(currentPage * ITEMS_PER_PAGE, data.length)} of {data.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-medium ${
                  page === currentPage
                    ? 'bg-[#E40000] text-gray-900 dark:text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContentPerformancePage;
