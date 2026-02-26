import React, { useState, useEffect, useCallback } from 'react';
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
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getReports,
  createReport,
  deleteReport,
  exportReport,
} from '@/services/staff/staffReportService';
import type { ReportDefinition } from '@/types/staff';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const typeIcons: Record<string, React.FC<{ className?: string }>> = {
  dashboard: LayoutGrid,
  table: Table,
  chart: BarChart3,
  mixed: FileText,
};

const typeColors: Record<string, string> = {
  dashboard: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  table: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  chart: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  mixed: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const WIDGET_TYPES = [
  { name: 'Metric Card', icon: Hash, color: 'text-blue-400' },
  { name: 'Line Chart', icon: LineChartIcon, color: 'text-emerald-400' },
  { name: 'Bar Chart', icon: BarChart3, color: 'text-yellow-400' },
  { name: 'Pie Chart', icon: PieChartIcon, color: 'text-purple-400' },
  { name: 'Data Table', icon: Table, color: 'text-cyan-400' },
  { name: 'Text Block', icon: Type, color: 'text-gray-500 dark:text-white/60' },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const CustomReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'shared' | 'templates' | 'schedules'>('my');
  const [search, setSearch] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Builder form state
  const [builderName, setBuilderName] = useState('');
  const [builderType, setBuilderType] = useState<'dashboard' | 'table' | 'chart' | 'mixed'>('dashboard');
  const [saving, setSaving] = useState(false);

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleReportId, setScheduleReportId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getReports();
      setReports(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getDisplayReports = (): ReportDefinition[] => {
    switch (activeTab) {
      case 'my': return reports.filter(r => !r.is_template && !r.is_shared);
      case 'shared': return reports.filter(r => r.is_shared);
      case 'templates': return reports.filter(r => r.is_template);
      case 'schedules': return reports;
      default: return reports;
    }
  };

  const filteredReports = getDisplayReports().filter(
    (r) => !search || r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveReport = async () => {
    if (!builderName.trim()) return;
    setSaving(true);
    try {
      await createReport({
        name: builderName,
        report_type: builderType,
        config: {
          widgets: [],
          layout: { columns: 12, row_height: 100 },
        },
      });
      setShowBuilder(false);
      setBuilderName('');
      setBuilderType('dashboard');
      await fetchReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (reportId: string) => {
    setActiveMenu(null);
    setActionLoading(reportId);
    try {
      const result = await exportReport(reportId, 'csv');
      if (result.download_url) {
        window.open(result.download_url, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (report: ReportDefinition) => {
    setActiveMenu(null);
    setActionLoading(report.id);
    try {
      await createReport({
        name: `${report.name} (Copy)`,
        report_type: report.report_type,
        config: report.config,
        filters: report.filters,
        is_template: report.is_template,
        is_shared: false,
      });
      await fetchReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reportId: string) => {
    setActiveMenu(null);
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;
    setActionLoading(reportId);
    try {
      await deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (reportId: string) => {
    setActiveMenu(null);
    navigate(`/dashboard/staff/reports/${reportId}/edit`);
  };

  const handleSchedule = (reportId: string) => {
    setActiveMenu(null);
    setScheduleReportId(reportId);
    setShowScheduleModal(true);
  };

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
        <div className="h-16 bg-gray-100 dark:bg-[#22272B] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={fetchReports}
          className="px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-white text-sm rounded-lg transition-colors"
        >
          Retry
        </button>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Report</h1>
            <p className="text-sm text-gray-500 dark:text-white/50 mt-1">Drag widgets onto the canvas to build your report</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBuilder(false)}
              className="px-4 py-2 text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveReport}
              disabled={saving || !builderName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-gray-900 dark:text-white text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Report'}
            </button>
          </div>
        </div>

        {/* Report name and type inputs */}
        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-white/50 block mb-1">Report Name</label>
            <input
              type="text"
              value={builderName}
              onChange={(e) => setBuilderName(e.target.value)}
              placeholder="Enter report name..."
              className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-white/50 block mb-1">Report Type</label>
            <select
              value={builderType}
              onChange={(e) => setBuilderType(e.target.value as 'dashboard' | 'table' | 'chart' | 'mixed')}
              className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50"
            >
              <option value="dashboard">Dashboard</option>
              <option value="table">Table</option>
              <option value="chart">Chart</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Widget Palette */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Widgets</h3>
              <div className="space-y-2">
                {WIDGET_TYPES.map((widget) => (
                  <div
                    key={widget.name}
                    className="flex items-center gap-3 px-3 py-2.5 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg cursor-grab hover:border-[#E40000]/40 transition-colors"
                  >
                    <widget.icon className={`w-4 h-4 ${widget.color}`} />
                    <span className="text-xs text-gray-600 dark:text-white/70">{widget.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-[#181C1F] border-2 border-dashed border-gray-300 dark:border-[#333] rounded-xl min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <LayoutGrid className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-gray-400 dark:text-white/30 text-sm mb-1">Drag widgets here</p>
                <p className="text-gray-400 dark:text-gray-300 dark:text-white/20 text-xs">Drop chart widgets, tables, and metrics to build your report</p>
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
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && scheduleReportId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schedule Report</h3>
            <p className="text-sm text-gray-500 dark:text-white/50 mb-4">
              Report scheduling configuration will be available soon. Report ID: {scheduleReportId}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => { setShowScheduleModal(false); setScheduleReportId(null); }}
                className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-[#2A2F34]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Reports</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">Build, schedule, and share custom analytics reports</p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-gray-900 dark:text-white text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Report
        </button>
      </motion.div>

      {/* Tabs + Search */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-1">
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
                activeTab === tab.key ? 'bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/50 hover:text-gray-600 dark:hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
          />
        </div>
      </motion.div>

      {/* Report Cards Grid */}
      {filteredReports.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-16">
          <FileText className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-white/40 text-sm">No reports found</p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => {
            const TypeIcon = typeIcons[report.report_type] || FileText;
            const isActionLoading = actionLoading === report.id;
            return (
              <div
                key={report.id}
                className={`bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 hover:border-gray-300 dark:hover:border-[#333] transition-colors group ${isActionLoading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 dark:bg-[#22272B] rounded-lg">
                      <TypeIcon className="w-4 h-4 text-gray-500 dark:text-white/50" />
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border capitalize ${typeColors[report.report_type] || typeColors.mixed}`}>
                      {report.report_type}
                    </span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === report.id ? null : report.id)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-400 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {activeMenu === report.id && (
                      <div className="absolute right-0 top-8 w-40 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg shadow-xl z-10 py-1">
                        <button
                          onClick={() => handleEdit(report.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-600 dark:text-white/70 hover:bg-[#333] transition-colors"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleExport(report.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-600 dark:text-white/70 hover:bg-[#333] transition-colors"
                        >
                          <Download className="w-3 h-3" /> Export
                        </button>
                        <button
                          onClick={() => handleSchedule(report.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-600 dark:text-white/70 hover:bg-[#333] transition-colors"
                        >
                          <Calendar className="w-3 h-3" /> Schedule
                        </button>
                        <button
                          onClick={() => handleDuplicate(report)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-600 dark:text-white/70 hover:bg-[#333] transition-colors"
                        >
                          <Copy className="w-3 h-3" /> Duplicate
                        </button>
                        <div className="border-t border-gray-300 dark:border-[#444] my-1" />
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-[#333] transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">{report.name}</h4>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-white/40">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(report.updated_at)}
                  </span>
                  {report.is_shared && (
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      Shared
                    </span>
                  )}
                </div>
                {report.is_template && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-cyan-400/70">
                    <Calendar className="w-3 h-3" />
                    Template
                  </div>
                )}
                <p className="text-[10px] text-gray-400 dark:text-white/30 mt-2">by {report.created_by.name}</p>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CustomReportsPage;
