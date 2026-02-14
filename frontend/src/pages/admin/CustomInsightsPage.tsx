import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Play,
  Save,
  Clock,
  FileText,
  Calendar,
  RefreshCw,
  Trash2,
  Mail,
  Sparkles,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface SavedQuery {
  id: string;
  name: string;
  query: string;
  createdAt: string;
  lastRun: string;
  resultCount: number;
}

interface ScheduledReport {
  id: string;
  name: string;
  schedule: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'pdf' | 'csv' | 'xlsx';
  isActive: boolean;
  lastSent: string | null;
  nextRun: string;
}

interface SampleChartData {
  label: string;
  value: number;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const SAMPLE_CHART_DATA: SampleChartData[] = [
  { label: 'Grade 1', value: 342 },
  { label: 'Grade 2', value: 285 },
  { label: 'Grade 3', value: 398 },
  { label: 'Grade 4', value: 456 },
  { label: 'Grade 5', value: 312 },
  { label: 'Grade 6', value: 267 },
  { label: 'Grade 7', value: 189 },
  { label: 'Grade 8', value: 145 },
  { label: 'Grade 9', value: 98 },
];

const SAVED_QUERIES: SavedQuery[] = [
  {
    id: 'sq-001',
    name: 'Active students by grade this term',
    query: 'Show me the number of active students grouped by grade level for the current term',
    createdAt: '2026-01-20',
    lastRun: '2026-02-13T08:00:00Z',
    resultCount: 3847,
  },
  {
    id: 'sq-002',
    name: 'Top performing AI tutor sessions',
    query: 'Which AI tutor sessions had the highest engagement scores in the last 30 days?',
    createdAt: '2026-01-28',
    lastRun: '2026-02-12T14:30:00Z',
    resultCount: 156,
  },
  {
    id: 'sq-003',
    name: 'Revenue by partner region',
    query: 'Show revenue breakdown by partner region for the last quarter',
    createdAt: '2026-02-01',
    lastRun: '2026-02-11T10:15:00Z',
    resultCount: 5,
  },
  {
    id: 'sq-004',
    name: 'Incomplete enrollments',
    query: 'List all students who started enrollment but did not complete payment in the last 7 days',
    createdAt: '2026-02-05',
    lastRun: '2026-02-13T06:00:00Z',
    resultCount: 42,
  },
  {
    id: 'sq-005',
    name: 'CBC strand completion gaps',
    query: 'Which CBC strands have the lowest completion rates across all grade levels?',
    createdAt: '2026-02-08',
    lastRun: '2026-02-10T16:45:00Z',
    resultCount: 7,
  },
];

const SCHEDULED_REPORTS: ScheduledReport[] = [
  {
    id: 'sr-001',
    name: 'Weekly Enrollment Summary',
    schedule: 'weekly',
    recipients: ['admin@urbanhomeschool.co.ke', 'ops@urbanhomeschool.co.ke'],
    format: 'pdf',
    isActive: true,
    lastSent: '2026-02-10T07:00:00Z',
    nextRun: '2026-02-17T07:00:00Z',
  },
  {
    id: 'sr-002',
    name: 'Monthly Revenue Report',
    schedule: 'monthly',
    recipients: ['finance@urbanhomeschool.co.ke', 'admin@urbanhomeschool.co.ke'],
    format: 'xlsx',
    isActive: true,
    lastSent: '2026-02-01T08:00:00Z',
    nextRun: '2026-03-01T08:00:00Z',
  },
  {
    id: 'sr-003',
    name: 'Daily AI Usage Metrics',
    schedule: 'daily',
    recipients: ['tech@urbanhomeschool.co.ke'],
    format: 'csv',
    isActive: true,
    lastSent: '2026-02-13T06:00:00Z',
    nextRun: '2026-02-14T06:00:00Z',
  },
  {
    id: 'sr-004',
    name: 'Partner Performance Digest',
    schedule: 'weekly',
    recipients: ['partnerships@urbanhomeschool.co.ke'],
    format: 'pdf',
    isActive: false,
    lastSent: '2026-01-27T07:00:00Z',
    nextRun: '2026-02-17T07:00:00Z',
  },
  {
    id: 'sr-005',
    name: 'Compliance Audit Trail',
    schedule: 'monthly',
    recipients: ['compliance@urbanhomeschool.co.ke', 'admin@urbanhomeschool.co.ke'],
    format: 'pdf',
    isActive: true,
    lastSent: '2026-02-01T09:00:00Z',
    nextRun: '2026-03-01T09:00:00Z',
  },
];

const EXAMPLE_QUERIES = [
  'Show student enrollment trends for the last 6 months',
  'Which courses have the highest completion rates?',
  'Compare AI tutor usage across grade levels',
  'Revenue forecast for next quarter based on current trends',
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
/* Badge helpers                                                       */
/* ------------------------------------------------------------------ */

const scheduleBadgeColors: Record<string, string> = {
  daily: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  weekly: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  monthly: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const formatBadgeColors: Record<string, string> = {
  pdf: 'bg-red-500/20 text-red-400 border-red-500/30',
  csv: 'bg-green-500/20 text-green-400 border-green-500/30',
  xlsx: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const Badge: React.FC<{ label: string; colorClass: string }> = ({ label, colorClass }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase ${colorClass}`}
  >
    {label}
  </span>
);

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

const CustomInsightsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleRunQuery = () => {
    if (!queryInput.trim()) return;
    setIsQuerying(true);
    setTimeout(() => {
      setIsQuerying(false);
      setShowChart(true);
    }, 1200);
  };

  const handleExampleClick = (example: string) => {
    setQueryInput(example);
  };

  const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatDateTime = (iso: string): string =>
    new Date(iso).toLocaleString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const totalQueries = SAVED_QUERIES.length + 23;
  const savedReportsCount = SAVED_QUERIES.length;
  const scheduledReportsCount = SCHEDULED_REPORTS.filter((r) => r.isActive).length;

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="h-16 bg-[#22272B] rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-[#22272B] rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-48 bg-[#22272B] rounded-xl animate-pulse" />
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
          title="Custom Insights"
          subtitle="AI-powered query builder, saved queries, and scheduled reports"
          breadcrumbs={[
            { label: 'Analytics', path: '/dashboard/admin' },
            { label: 'Custom Insights' },
          ]}
          actions={
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          }
        />

        {/* Stats Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <AdminStatsCard
            title="Total Queries"
            value={totalQueries}
            icon={<Search className="w-5 h-5" />}
            trend={{ value: 12, label: 'this month', direction: 'up' }}
          />
          <AdminStatsCard
            title="Saved Reports"
            value={savedReportsCount}
            icon={<FileText className="w-5 h-5" />}
            subtitle="Reusable query templates"
          />
          <AdminStatsCard
            title="Scheduled Reports"
            value={scheduledReportsCount}
            icon={<Calendar className="w-5 h-5" />}
            subtitle={`${SCHEDULED_REPORTS.length - scheduledReportsCount} paused`}
          />
        </motion.div>

        {/* AI Query Builder */}
        <motion.div
          variants={itemVariants}
          className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#E40000]" />
            <h2 className="text-lg font-semibold text-white">AI Query Builder</h2>
          </div>
          <p className="text-sm text-white/50 mb-4">
            Ask questions about your data in natural language. The AI will generate insights and visualizations.
          </p>

          {/* Query Input */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Ask a question about your data..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunQuery();
                }}
                className="w-full pl-10 pr-4 py-3 bg-[#0F1112] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
              />
            </div>
            <button
              onClick={handleRunQuery}
              disabled={!queryInput.trim() || isQuerying}
              className="flex items-center gap-2 px-4 py-3 text-sm bg-[#E40000] text-white rounded-lg hover:bg-[#E40000]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Play className={`w-4 h-4 ${isQuerying ? 'animate-pulse' : ''}`} />
              {isQuerying ? 'Running...' : 'Run Query'}
            </button>
            <button
              className="flex items-center gap-2 px-4 py-3 text-sm bg-[#22272B] border border-[#333] text-white/70 rounded-lg hover:text-white hover:border-[#444] transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>

          {/* Example Queries */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs text-white/30 py-1">Try:</span>
            {EXAMPLE_QUERIES.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(example)}
                className="px-3 py-1 text-xs bg-[#22272B] border border-[#333] text-white/50 rounded-full hover:text-white hover:border-[#444] transition-colors"
              >
                {example}
              </button>
            ))}
          </div>

          {/* Chart Area */}
          {showChart ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-white/70">
                  Results for: <span className="text-white font-medium">{queryInput}</span>
                </p>
                <button className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Export Results
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={SAMPLE_CHART_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
                  <XAxis
                    dataKey="label"
                    stroke="#333"
                    tick={{ fill: '#666', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#333"
                    tick={{ fill: '#666', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="value"
                    fill="#E40000"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-[#22272B] rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/40 text-sm">
                Enter a query above to generate insights and visualizations
              </p>
              <p className="text-white/25 text-xs mt-1">
                Results will appear here as interactive charts
              </p>
            </div>
          )}
        </motion.div>

        {/* Saved Queries */}
        <motion.div
          variants={itemVariants}
          className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Saved Queries</h2>
            <p className="text-sm text-white/50 mt-1">
              Previously saved queries for quick access
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#22272B]">
                  <th className="text-left py-3 px-4 text-white/50 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-white/50 font-medium">Query</th>
                  <th className="text-right py-3 px-4 text-white/50 font-medium">Results</th>
                  <th className="text-right py-3 px-4 text-white/50 font-medium">Last Run</th>
                  <th className="text-center py-3 px-4 text-white/50 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {SAVED_QUERIES.map((sq) => (
                  <tr
                    key={sq.id}
                    className="border-b border-[#22272B]/50 hover:bg-[#22272B]/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-white font-medium whitespace-nowrap">
                      {sq.name}
                    </td>
                    <td className="py-3 px-4 text-white/50 max-w-[300px] truncate text-xs">
                      {sq.query}
                    </td>
                    <td className="py-3 px-4 text-right text-white/80">
                      {sq.resultCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-white/40">
                      {formatDateTime(sq.lastRun)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setQueryInput(sq.query);
                            setShowChart(false);
                          }}
                          title="Load query"
                          className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Scheduled Reports */}
        <motion.div
          variants={itemVariants}
          className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Scheduled Reports</h2>
              <p className="text-sm text-white/50 mt-1">
                Automated report delivery to stakeholders
              </p>
            </div>
            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <span className="text-xs text-white/40">
                {scheduledReportsCount} active
              </span>
              <span className="text-xs text-white/30">|</span>
              <span className="text-xs text-white/40">
                {SCHEDULED_REPORTS.length - scheduledReportsCount} paused
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#22272B]">
                  <th className="text-left py-3 px-4 text-white/50 font-medium">Report Name</th>
                  <th className="text-center py-3 px-4 text-white/50 font-medium">Schedule</th>
                  <th className="text-left py-3 px-4 text-white/50 font-medium">Recipients</th>
                  <th className="text-center py-3 px-4 text-white/50 font-medium">Format</th>
                  <th className="text-center py-3 px-4 text-white/50 font-medium">Active</th>
                  <th className="text-right py-3 px-4 text-white/50 font-medium">Last Sent</th>
                  <th className="text-right py-3 px-4 text-white/50 font-medium">Next Run</th>
                </tr>
              </thead>
              <tbody>
                {SCHEDULED_REPORTS.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-[#22272B]/50 hover:bg-[#22272B]/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-white font-medium">{report.name}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        label={report.schedule}
                        colorClass={scheduleBadgeColors[report.schedule]}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-white/60 text-xs">
                          {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        label={report.format}
                        colorClass={formatBadgeColors[report.format]}
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            report.isActive ? 'bg-emerald-400' : 'bg-gray-500'
                          }`}
                        />
                        <span
                          className={`ml-1.5 text-xs ${
                            report.isActive ? 'text-emerald-400' : 'text-gray-500'
                          }`}
                        >
                          {report.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-white/40">
                      {report.lastSent ? formatDateTime(report.lastSent) : 'Never'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-white/40">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{formatDate(report.nextRun)}</span>
                      </div>
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

export default CustomInsightsPage;
