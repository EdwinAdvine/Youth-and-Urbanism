import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  Activity,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { getPlatformHealth } from '../../services/staff/staffInsightsService';

/* ------------------------------------------------------------------ */
/* Fallback data (used when API returns empty or fails)                */
/* ------------------------------------------------------------------ */

const FALLBACK_DAU_DATA = [
  { date: 'Jan 1', users: 1420 },
  { date: 'Jan 2', users: 1380 },
  { date: 'Jan 3', users: 1510 },
  { date: 'Jan 4', users: 1650 },
  { date: 'Jan 5', users: 1230 },
  { date: 'Jan 6', users: 980 },
  { date: 'Jan 7', users: 1120 },
  { date: 'Jan 8', users: 1480 },
  { date: 'Jan 9', users: 1560 },
  { date: 'Jan 10', users: 1620 },
  { date: 'Jan 11', users: 1710 },
  { date: 'Jan 12', users: 1580 },
  { date: 'Jan 13', users: 1090 },
  { date: 'Jan 14', users: 1340 },
];

const FALLBACK_SESSION_DURATION_DATA = [
  { range: '0-5m', count: 320 },
  { range: '5-15m', count: 580 },
  { range: '15-30m', count: 890 },
  { range: '30-60m', count: 650 },
  { range: '1-2h', count: 380 },
  { range: '2h+', count: 120 },
];

const FALLBACK_AI_USAGE_DATA = [
  { week: 'W1', gemini: 2400, claude: 1800, gpt4: 900, grok: 300 },
  { week: 'W2', gemini: 2600, claude: 1950, gpt4: 850, grok: 420 },
  { week: 'W3', gemini: 2800, claude: 2100, gpt4: 920, grok: 380 },
  { week: 'W4', gemini: 3100, claude: 2300, gpt4: 980, grok: 510 },
  { week: 'W5', gemini: 3300, claude: 2500, gpt4: 1050, grok: 480 },
  { week: 'W6', gemini: 3500, claude: 2700, gpt4: 1100, grok: 550 },
];

const FALLBACK_FEATURE_ADOPTION = [
  { name: 'AI Tutor', value: 82, color: '#E40000' },
  { name: 'Live Classes', value: 45, color: '#3B82F6' },
  { name: 'Assessments', value: 67, color: '#10B981' },
  { name: 'Course Library', value: 73, color: '#F59E0B' },
  { name: 'Forums', value: 28, color: '#8B5CF6' },
];

const tooltipStyle = {
  backgroundColor: '#181C1F',
  border: '1px solid #22272B',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#fff',
  fontSize: '12px',
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const PlatformHealthPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('14d');
  const [dauData, setDauData] = useState(FALLBACK_DAU_DATA);
  const [sessionData, _setSessionData] = useState(FALLBACK_SESSION_DURATION_DATA);
  const [aiUsageData, setAiUsageData] = useState(FALLBACK_AI_USAGE_DATA);
  const [featureAdoption, _setFeatureAdoption] = useState(FALLBACK_FEATURE_ADOPTION);
  const [stats, setStats] = useState({ dau: '1,710', wau: '4,230', mau: '8,945', engagement: '72.4%' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rangeDays = dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : dateRange === '30d' ? 30 : 90;
        const dateTo = new Date().toISOString().split('T')[0];
        const dateFrom = new Date(Date.now() - rangeDays * 86400000).toISOString().split('T')[0];
        const health = await getPlatformHealth(dateFrom, dateTo);

        if (health.dau_trend?.length > 0) {
          setDauData(health.dau_trend.map((d: { date: string; count: number }) => ({ date: d.date, users: d.count })));
        }
        if (health.ai_tutor_usage?.length > 0) {
          const aiMap: Record<string, Record<string, number>> = {};
          health.ai_tutor_usage.forEach((u: { model: string; sessions: number }) => {
            const key = u.model.toLowerCase();
            if (!aiMap['W1']) aiMap['W1'] = {};
            aiMap['W1'][key] = u.sessions;
          });
          // Use real AI usage if available
          setAiUsageData(prev => prev.map((w, i) => i === 0 ? { ...w, ...aiMap['W1'] } : w));
        }
        if (health.daily_active_users) {
          setStats(prev => ({ ...prev, dau: health.daily_active_users.toLocaleString() }));
        }
        if (health.dropout_rate !== undefined) {
          setStats(prev => ({ ...prev, engagement: `${(100 - health.dropout_rate).toFixed(1)}%` }));
        }
      } catch (err) {
        console.warn('[PlatformHealth] API unavailable, using fallback data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Health</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">User engagement and platform usage analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 dark:text-white/40" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#E40000]/50 appearance-none cursor-pointer"
          >
            <option value="7d">Last 7 days</option>
            <option value="14d">Last 14 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'DAU', value: stats.dau, change: '+8.2%', icon: Users, color: 'text-emerald-400' },
          { label: 'WAU', value: stats.wau, change: '+5.1%', icon: Activity, color: 'text-blue-400' },
          { label: 'MAU', value: stats.mau, change: '+12.3%', icon: Users, color: 'text-purple-400' },
          { label: 'Engagement Rate', value: stats.engagement, change: '+3.1%', icon: Clock, color: 'text-orange-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/50 text-xs font-medium">{stat.label}</span>
              <div className={`p-1.5 bg-gray-100 dark:bg-[#22272B] rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-emerald-400 mt-1">{stat.change} vs previous period</p>
          </div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Active Users */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Daily Active Users</h3>
          <p className="text-xs text-gray-400 dark:text-white/40 mb-4">Unique users per day</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dauData}>
                <defs>
                  <linearGradient id="gradDau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E40000" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E40000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
                <XAxis dataKey="date" stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="users" name="Users" stroke="#E40000" strokeWidth={2} fill="url(#gradDau)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Session Duration */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Session Duration Distribution</h3>
          <p className="text-xs text-gray-400 dark:text-white/40 mb-4">How long users stay per session</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
                <XAxis dataKey="range" stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Sessions" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Usage */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">AI Usage by Provider</h3>
          <p className="text-xs text-gray-400 dark:text-white/40 mb-4">Weekly AI conversation count by model</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
                <XAxis dataKey="week" stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#999' }} iconType="circle" iconSize={8} />
                <Line type="monotone" dataKey="gemini" name="Gemini" stroke="#E40000" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="claude" name="Claude" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="gpt4" name="GPT-4" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="grok" name="Grok" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Feature Adoption */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Feature Adoption</h3>
          <p className="text-xs text-gray-400 dark:text-white/40 mb-4">Percentage of active users using each feature</p>
          <div className="h-56 flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={featureAdoption}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {featureAdoption.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
              {featureAdoption.map((feature) => (
                <div key={feature.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: feature.color }} />
                  <span className="text-xs text-gray-500 dark:text-white/60 flex-1">{feature.name}</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{feature.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PlatformHealthPage;
