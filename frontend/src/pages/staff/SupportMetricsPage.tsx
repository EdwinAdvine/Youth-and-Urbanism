import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Shield,
  SmilePlus,
  Ticket,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const TICKET_VOLUME = [
  { date: 'Jan 1', tickets: 12 },
  { date: 'Jan 2', tickets: 18 },
  { date: 'Jan 3', tickets: 15 },
  { date: 'Jan 4', tickets: 22 },
  { date: 'Jan 5', tickets: 14 },
  { date: 'Jan 6', tickets: 8 },
  { date: 'Jan 7', tickets: 10 },
  { date: 'Jan 8', tickets: 19 },
  { date: 'Jan 9', tickets: 24 },
  { date: 'Jan 10', tickets: 21 },
  { date: 'Jan 11', tickets: 17 },
  { date: 'Jan 12', tickets: 20 },
  { date: 'Jan 13', tickets: 9 },
  { date: 'Jan 14', tickets: 16 },
];

const RESOLUTION_TREND = [
  { date: 'Jan 1', hours: 4.2 },
  { date: 'Jan 2', hours: 3.8 },
  { date: 'Jan 3', hours: 3.5 },
  { date: 'Jan 4', hours: 4.1 },
  { date: 'Jan 5', hours: 3.2 },
  { date: 'Jan 6', hours: 2.9 },
  { date: 'Jan 7', hours: 2.5 },
  { date: 'Jan 8', hours: 3.6 },
  { date: 'Jan 9', hours: 3.3 },
  { date: 'Jan 10', hours: 2.8 },
  { date: 'Jan 11', hours: 2.4 },
  { date: 'Jan 12', hours: 2.6 },
  { date: 'Jan 13', hours: 2.1 },
  { date: 'Jan 14', hours: 2.4 },
];

const CSAT_TREND = [
  { date: 'Jan 1', score: 4.2 },
  { date: 'Jan 2', score: 4.3 },
  { date: 'Jan 3', score: 4.1 },
  { date: 'Jan 4', score: 4.4 },
  { date: 'Jan 5', score: 4.5 },
  { date: 'Jan 6', score: 4.6 },
  { date: 'Jan 7', score: 4.5 },
  { date: 'Jan 8', score: 4.3 },
  { date: 'Jan 9', score: 4.4 },
  { date: 'Jan 10', score: 4.6 },
  { date: 'Jan 11', score: 4.7 },
  { date: 'Jan 12', score: 4.5 },
  { date: 'Jan 13', score: 4.6 },
  { date: 'Jan 14', score: 4.6 },
];

const TICKETS_BY_CATEGORY = [
  { name: 'Technical', value: 35, color: '#3B82F6' },
  { name: 'Billing', value: 22, color: '#E40000' },
  { name: 'Account', value: 18, color: '#10B981' },
  { name: 'Content', value: 12, color: '#F59E0B' },
  { name: 'Safety', value: 8, color: '#8B5CF6' },
  { name: 'Other', value: 5, color: '#6B7280' },
];

interface SLARow {
  priority: string;
  target_hours: number;
  actual_hours: number;
  compliance: number;
  total_tickets: number;
  breached: number;
}

const SLA_DATA: SLARow[] = [
  { priority: 'Critical', target_hours: 2, actual_hours: 1.8, compliance: 94.5, total_tickets: 18, breached: 1 },
  { priority: 'High', target_hours: 4, actual_hours: 3.2, compliance: 91.2, total_tickets: 45, breached: 4 },
  { priority: 'Medium', target_hours: 8, actual_hours: 5.6, compliance: 96.8, total_tickets: 89, breached: 3 },
  { priority: 'Low', target_hours: 24, actual_hours: 12.4, compliance: 98.5, total_tickets: 62, breached: 1 },
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

const SupportMetricsPage: React.FC = () => {
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
          <h1 className="text-2xl font-bold text-white">Support Metrics</h1>
          <p className="text-sm text-white/50 mt-1">Resolution times, SLA compliance, and satisfaction scores</p>
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
          { label: 'Avg Resolution Time', value: '2.4h', change: '-18% faster', icon: Clock, color: 'text-blue-400' },
          { label: 'SLA Compliance', value: '95.2%', change: '+2.1%', icon: Shield, color: 'text-emerald-400' },
          { label: 'CSAT Score', value: '4.6/5', change: '+0.2 pts', icon: SmilePlus, color: 'text-yellow-400' },
          { label: 'Open Tickets', value: '23', change: '-5 from yesterday', icon: Ticket, color: 'text-[#E40000]' },
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
        {/* Ticket Volume */}
        <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Ticket Volume Over Time</h3>
          <p className="text-xs text-white/40 mb-4">Daily new ticket count</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TICKET_VOLUME}>
                <defs>
                  <linearGradient id="gradTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E40000" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E40000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
                <XAxis dataKey="date" stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="tickets" name="Tickets" stroke="#E40000" strokeWidth={2} fill="url(#gradTickets)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Resolution Time */}
        <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Resolution Time Trend</h3>
          <p className="text-xs text-white/40 mb-4">Average hours to resolution</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RESOLUTION_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
                <XAxis dataKey="date" stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}h`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}h`, 'Avg Time']} />
                <Line type="monotone" dataKey="hours" name="Hours" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* CSAT Trend */}
        <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">CSAT Score Trend</h3>
          <p className="text-xs text-white/40 mb-4">Customer satisfaction over time</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CSAT_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
                <XAxis dataKey="date" stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#555" tick={{ fill: '#777', fontSize: 11 }} axisLine={false} tickLine={false} domain={[3.5, 5]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}/5`, 'CSAT']} />
                <Line type="monotone" dataKey="score" name="CSAT" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Tickets by Category */}
        <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Tickets by Category</h3>
          <p className="text-xs text-white/40 mb-4">Distribution of support categories</p>
          <div className="h-56 flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={TICKETS_BY_CATEGORY} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {TICKETS_BY_CATEGORY.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
              {TICKETS_BY_CATEGORY.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-white/60 flex-1">{cat.name}</span>
                  <span className="text-xs font-medium text-white">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* SLA Compliance Table */}
      <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#22272B]">
          <h3 className="text-sm font-semibold text-white">SLA Compliance Breakdown</h3>
          <p className="text-xs text-white/40 mt-1">Performance against service level agreements by priority</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#22272B] text-left">
                <th className="px-4 py-3 text-white/60 font-medium">Priority</th>
                <th className="px-4 py-3 text-white/60 font-medium text-right">Target</th>
                <th className="px-4 py-3 text-white/60 font-medium text-right">Actual Avg</th>
                <th className="px-4 py-3 text-white/60 font-medium text-right">Compliance</th>
                <th className="px-4 py-3 text-white/60 font-medium text-right">Total</th>
                <th className="px-4 py-3 text-white/60 font-medium text-right">Breached</th>
              </tr>
            </thead>
            <tbody>
              {SLA_DATA.map((row) => (
                <tr key={row.priority} className="border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      row.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      row.priority === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      row.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {row.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white/60">{row.target_hours}h</td>
                  <td className="px-4 py-3 text-right">
                    <span className={row.actual_hours <= row.target_hours ? 'text-emerald-400' : 'text-red-400'}>
                      {row.actual_hours}h
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-[#22272B] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.compliance >= 95 ? 'bg-emerald-400' : row.compliance >= 90 ? 'bg-yellow-400' : 'bg-red-400'}`}
                          style={{ width: `${row.compliance}%` }}
                        />
                      </div>
                      <span className="text-white/70 text-xs w-12 text-right">{row.compliance}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-white/70">{row.total_tickets}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={row.breached > 0 ? 'text-red-400' : 'text-emerald-400'}>
                      {row.breached}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SupportMetricsPage;
