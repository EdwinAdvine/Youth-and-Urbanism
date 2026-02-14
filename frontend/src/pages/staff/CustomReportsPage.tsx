import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Edit3,
  Download,
  Clock,
  Share2,
  MoreVertical,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Table,
  Type,
  Hash,
  Calendar,
  Copy,
  Trash2,
  LayoutGrid,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Report {
  id: string;
  name: string;
  type: 'dashboard' | 'tabular' | 'visual';
  last_modified: string;
  author: string;
  shared: boolean;
  scheduled: boolean;
  schedule_frequency?: string;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_REPORTS: Report[] = [
  { id: 'RPT-001', name: 'Weekly Student Progress Summary', type: 'dashboard', last_modified: '2025-01-15T14:30:00Z', author: 'Grace Njeri', shared: true, scheduled: true, schedule_frequency: 'Weekly on Monday' },
  { id: 'RPT-002', name: 'Monthly Revenue Breakdown', type: 'tabular', last_modified: '2025-01-14T09:00:00Z', author: 'James Odhiambo', shared: false, scheduled: true, schedule_frequency: 'Monthly 1st' },
  { id: 'RPT-003', name: 'AI Tutor Usage Analytics', type: 'visual', last_modified: '2025-01-13T16:45:00Z', author: 'Faith Wanjiku', shared: true, scheduled: false },
  { id: 'RPT-004', name: 'CBC Compliance Status', type: 'dashboard', last_modified: '2025-01-12T11:20:00Z', author: 'Peter Kamau', shared: true, scheduled: false },
  { id: 'RPT-005', name: 'Support Ticket Trends Q4', type: 'visual', last_modified: '2025-01-10T08:00:00Z', author: 'Grace Njeri', shared: false, scheduled: false },
  { id: 'RPT-006', name: 'Parent Engagement Report', type: 'tabular', last_modified: '2025-01-09T13:15:00Z', author: 'Amina Hassan', shared: true, scheduled: true, schedule_frequency: 'Bi-weekly' },
];

const SHARED_REPORTS: Report[] = [
  { id: 'RPT-101', name: 'Platform-Wide KPI Dashboard', type: 'dashboard', last_modified: '2025-01-15T10:00:00Z', author: 'System Admin', shared: true, scheduled: true, schedule_frequency: 'Daily' },
  { id: 'RPT-102', name: 'Team Performance Overview', type: 'visual', last_modified: '2025-01-14T15:30:00Z', author: 'James Odhiambo', shared: true, scheduled: false },
];

const TEMPLATE_REPORTS: Report[] = [
  { id: 'TPL-001', name: 'Student Assessment Summary', type: 'tabular', last_modified: '2025-01-01T00:00:00Z', author: 'Template', shared: false, scheduled: false },
  { id: 'TPL-002', name: 'Financial Overview', type: 'dashboard', last_modified: '2025-01-01T00:00:00Z', author: 'Template', shared: false, scheduled: false },
  { id: 'TPL-003', name: 'Content Performance Tracker', type: 'visual', last_modified: '2025-01-01T00:00:00Z', author: 'Template', shared: false, scheduled: false },
];

const WIDGET_TYPES = [
  { name: 'Metric Card', icon: Hash, color: 'text-blue-400' },
  { name: 'Line Chart', icon: LineChartIcon, color: 'text-emerald-400' },
  { name: 'Bar Chart', icon: BarChart3, color: 'text-yellow-400' },
  { name: 'Pie Chart', icon: PieChartIcon, color: 'text-purple-400' },
  { name: 'Data Table', icon: Table, color: 'text-cyan-400' },
  { name: 'Text Block', icon: Type, color: 'text-white/60' },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const typeIcons: Record<string, React.FC<{ className?: string }>> = {
  dashboard: LayoutGrid,
  tabular: Table,
  visual: BarChart3,
};

const typeColors: Record<string, string> = {
  dashboard: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  tabular: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  visual: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const CustomReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'shared' | 'templates' | 'schedules'>('my');
  const [search, setSearch] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const getReports = (): Report[] => {
    switch (activeTab) {
      case 'my': return MOCK_REPORTS;
      case 'shared': return SHARED_REPORTS;
      case 'templates': return TEMPLATE_REPORTS;
      case 'schedules': return MOCK_REPORTS.filter((r) => r.scheduled);
      default: return MOCK_REPORTS;
    }
  };

  const filteredReports = getReports().filter(
    (r) => !search || r.name.toLowerCase().includes(search.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-[#22272B] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (showBuilder) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Builder Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">New Report</h1>
            <p className="text-sm text-white/50 mt-1">Drag widgets onto the canvas to build your report</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBuilder(false)}
              className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-white text-sm rounded-lg transition-colors">
              Save Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Widget Palette */}
          <div className="lg:col-span-1">
            <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-4">
              <h3 className="text-sm font-medium text-white mb-3">Widgets</h3>
              <div className="space-y-2">
                {WIDGET_TYPES.map((widget) => (
                  <div
                    key={widget.name}
                    className="flex items-center gap-3 px-3 py-2.5 bg-[#22272B] border border-[#333] rounded-lg cursor-grab hover:border-[#E40000]/40 transition-colors"
                  >
                    <widget.icon className={`w-4 h-4 ${widget.color}`} />
                    <span className="text-xs text-white/70">{widget.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-4">
            <div className="bg-[#181C1F] border-2 border-dashed border-[#333] rounded-xl min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <LayoutGrid className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-white/30 text-sm mb-1">Drag widgets here</p>
                <p className="text-white/20 text-xs">Drop chart widgets, tables, and metrics to build your report</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
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
          <h1 className="text-2xl font-bold text-white">Custom Reports</h1>
          <p className="text-sm text-white/50 mt-1">Build, schedule, and share custom analytics reports</p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-white text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Report
        </button>
      </motion.div>

      {/* Tabs + Search */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-[#181C1F] border border-[#22272B] rounded-lg p-1">
          {([
            { key: 'my' as const, label: 'My Reports' },
            { key: 'shared' as const, label: 'Shared' },
            { key: 'templates' as const, label: 'Templates' },
            { key: 'schedules' as const, label: 'Schedules' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === tab.key ? 'bg-[#22272B] text-white' : 'text-white/50 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
          />
        </div>
      </motion.div>

      {/* Report Cards Grid */}
      {filteredReports.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-16">
          <FileText className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No reports found</p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => {
            const TypeIcon = typeIcons[report.type] || FileText;
            return (
              <div
                key={report.id}
                className="bg-[#181C1F] border border-[#22272B] rounded-xl p-4 hover:border-[#333] transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#22272B] rounded-lg">
                      <TypeIcon className="w-4 h-4 text-white/50" />
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border capitalize ${typeColors[report.type]}`}>
                      {report.type}
                    </span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === report.id ? null : report.id)}
                      className="p-1 rounded hover:bg-[#22272B] text-white/30 hover:text-white/60 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {activeMenu === report.id && (
                      <div className="absolute right-0 top-8 w-40 bg-[#22272B] border border-[#333] rounded-lg shadow-xl z-10 py-1">
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/70 hover:bg-[#333] transition-colors">
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/70 hover:bg-[#333] transition-colors">
                          <Download className="w-3 h-3" /> Export
                        </button>
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/70 hover:bg-[#333] transition-colors">
                          <Calendar className="w-3 h-3" /> Schedule
                        </button>
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/70 hover:bg-[#333] transition-colors">
                          <Copy className="w-3 h-3" /> Duplicate
                        </button>
                        <div className="border-t border-[#444] my-1" />
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-[#333] transition-colors">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <h4 className="text-sm font-medium text-white mb-2 line-clamp-2">{report.name}</h4>
                <div className="flex items-center gap-3 text-[10px] text-white/40">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(report.last_modified)}
                  </span>
                  {report.shared && (
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      Shared
                    </span>
                  )}
                </div>
                {report.scheduled && report.schedule_frequency && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-cyan-400/70">
                    <Calendar className="w-3 h-3" />
                    {report.schedule_frequency}
                  </div>
                )}
                <p className="text-[10px] text-white/30 mt-2">by {report.author}</p>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CustomReportsPage;
