import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  CheckCircle,
  Star,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
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
  Legend,
} from 'recharts';

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const VIEWS_OVER_TIME = [
  { date: 'Jan 1', views: 2800 },
  { date: 'Jan 2', views: 3100 },
  { date: 'Jan 3', views: 3400 },
  { date: 'Jan 4', views: 3200 },
  { date: 'Jan 5', views: 2600 },
  { date: 'Jan 6', views: 2100 },
  { date: 'Jan 7', views: 2900 },
  { date: 'Jan 8', views: 3500 },
  { date: 'Jan 9', views: 3800 },
  { date: 'Jan 10', views: 4100 },
  { date: 'Jan 11', views: 3900 },
  { date: 'Jan 12', views: 3600 },
  { date: 'Jan 13', views: 2400 },
  { date: 'Jan 14', views: 3300 },
];

const COMPLETION_BY_TYPE = [
  { type: 'Video Lessons', rate: 78 },
  { type: 'Interactive', rate: 85 },
  { type: 'Quizzes', rate: 92 },
  { type: 'Reading', rate: 64 },
  { type: 'Projects', rate: 58 },
  { type: 'Live Class', rate: 88 },
];

const RATINGS_DISTRIBUTION = [
  { rating: '1 Star', count: 45 },
  { rating: '2 Stars', count: 89 },
  { rating: '3 Stars', count: 234 },
  { rating: '4 Stars', count: 567 },
  { rating: '5 Stars', count: 890 },
];

const TOP_CONTENT = [
  { name: 'Grade 4 Math: Fractions Made Easy', views: 4520 },
  { name: 'Kiswahili Stories: Hekaya za Abunuwasi', views: 3890 },
  { name: 'Science Gr. 5: The Water Cycle', views: 3456 },
  { name: 'English Creative Writing Workshop', views: 3120 },
  { name: 'CBC Music: Traditional Instruments', views: 2890 },
  { name: 'Grade 3 Environmental Activities', views: 2670 },
];

interface ContentItem {
  id: string;
  title: string;
  type: string;
  views: number;
  completions: number;
  avg_score: number;
  rating: number;
  grade_level: string;
}

const CONTENT_TABLE: ContentItem[] = [
  { id: 'C-001', title: 'Grade 4 Math: Fractions Made Easy', type: 'Video Lesson', views: 4520, completions: 3280, avg_score: 78.5, rating: 4.7, grade_level: 'Grade 4' },
  { id: 'C-002', title: 'Kiswahili Stories: Hekaya za Abunuwasi', type: 'Interactive', views: 3890, completions: 3100, avg_score: 82.1, rating: 4.8, grade_level: 'Grade 6' },
  { id: 'C-003', title: 'Science Gr. 5: The Water Cycle', type: 'Video Lesson', views: 3456, completions: 2800, avg_score: 75.3, rating: 4.5, grade_level: 'Grade 5' },
  { id: 'C-004', title: 'English Creative Writing Workshop', type: 'Project', views: 3120, completions: 1890, avg_score: 71.2, rating: 4.3, grade_level: 'Grade 7' },
  { id: 'C-005', title: 'CBC Music: Traditional Instruments', type: 'Interactive', views: 2890, completions: 2400, avg_score: 86.7, rating: 4.9, grade_level: 'Grade 8' },
  { id: 'C-006', title: 'Grade 3 Environmental Activities', type: 'Reading', views: 2670, completions: 1560, avg_score: 68.4, rating: 4.1, grade_level: 'Grade 3' },
  { id: 'C-007', title: 'Grade 2 Numeracy: Counting Patterns', type: 'Quiz', views: 2450, completions: 2100, avg_score: 89.2, rating: 4.6, grade_level: 'Grade 2' },
  { id: 'C-008', title: 'Religious Education: Values & Morals', type: 'Reading', views: 2100, completions: 1340, avg_score: 73.8, rating: 4.2, grade_level: 'Grade 5' },
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

const ContentPerformancePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('14d');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

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
        <div className="h-16 bg-[#22272B] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-[#22272B] rounded-xl animate-pulse" />
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
          <h1 className="text-2xl font-bold text-white">Content Performance</h1>
          <p className="text-sm text-white/50 mt-1">Track views, completions, and content ratings</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/40" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-[#181C1F] border border-[#22272B] rounded-lg text-white text-sm focus:outline-none focus:border-[#E40000]/50 appearance-none cursor-pointer"
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
          { label: 'Total Views', value: '45.2K', change: '+12.4%', icon: Eye, color: 'text-blue-400' },
          { label: 'Completion Rate', value: '74.8%', change: '+3.2%', icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Avg Rating', value: '4.5/5', change: '+0.2', icon: Star, color: 'text-yellow-400' },
          { label: 'Top Performing', value: 'Fractions', change: '4,520 views', icon: TrendingUp, color: 'text-[#E40000]' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#181C1F] border border-[#22272B] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/50 text-xs font-medium">{stat.label}</span>
              <div className={`p-1.5 bg-[#22272B] rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-emerald-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Content Views Over Time</h3>
          <p className="text-xs text-white/40 mb-4">Daily content view count</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VIEWS_OVER_TIME}>
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
          </div>
        </motion.div>

        {/* Completion Rates by Type */}
        <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Completion Rates by Type</h3>
          <p className="text-xs text-white/40 mb-4">Average completion rate per content type</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COMPLETION_BY_TYPE} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#22272B" horizontal={false} />
                <XAxis type="number" stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="type" stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, 'Rate']} />
                <Bar dataKey="rate" name="Completion %" fill="#10B981" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Ratings Distribution */}
        <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Content Ratings Distribution</h3>
          <p className="text-xs text-white/40 mb-4">Number of ratings per star level</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RATINGS_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
                <XAxis dataKey="rating" stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Ratings" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Content */}
        <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Top Content</h3>
          <p className="text-xs text-white/40 mb-4">Most viewed content items</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOP_CONTENT} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#22272B" horizontal={false} />
                <XAxis type="number" stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#555" tick={{ fill: '#777', fontSize: 10 }} axisLine={false} tickLine={false} width={160} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="views" name="Views" fill="#E40000" radius={[0, 4, 4, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Content Performance Table */}
      <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#22272B]">
          <h3 className="text-sm font-semibold text-white">Content Performance Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#22272B] text-left">
                <th className="px-4 py-3 text-white/60 font-medium">Title</th>
                <th className="px-4 py-3 text-white/60 font-medium text-right">Views</th>
                <th className="px-4 py-3 text-white/60 font-medium text-right">Completions</th>
                <th className="px-4 py-3 text-white/60 font-medium text-right">Avg Score</th>
                <th className="px-4 py-3 text-white/60 font-medium text-right">Rating</th>
              </tr>
            </thead>
            <tbody>
              {CONTENT_TABLE.map((item) => (
                <tr key={item.id} className="border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-white font-medium">{item.title}</span>
                      <span className="block text-xs text-white/40">{item.type} - {item.grade_level}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-white/70">{item.views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-white/70">{item.completions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={item.avg_score >= 80 ? 'text-emerald-400' : item.avg_score >= 70 ? 'text-yellow-400' : 'text-red-400'}>
                      {item.avg_score}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-white/70">{item.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#22272B]">
          <p className="text-xs text-white/40">Showing 1-{CONTENT_TABLE.length} of {CONTENT_TABLE.length}</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 disabled:opacity-30 transition-colors" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg text-xs font-medium bg-[#E40000] text-white">1</button>
            <button className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 disabled:opacity-30 transition-colors" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContentPerformancePage;
