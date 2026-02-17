import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Calendar,
  Sparkles,
  Download,
  FileDown,
  Users,
  TrendingUp,
  CheckCircle,
  ChevronDown,
  Plus,
  BarChart3,
} from 'lucide-react';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

type ReportType = 'monthly' | 'termly' | 'annual' | 'custom';

interface ReportCard {
  id: string;
  title: string;
  type: ReportType;
  periodStart: string;
  periodEnd: string;
  summary: string;
  studentsImpacted: number;
  avgProgress: number;
  completionRate: number;
  generatedDate: string;
}

const mockReports: ReportCard[] = [
  {
    id: '1',
    title: 'January 2026 Impact Overview',
    type: 'monthly',
    periodStart: '2026-01-01',
    periodEnd: '2026-01-31',
    summary: 'Strong learner engagement across primary mathematics and science programs with a 12% increase in assessment completion rates compared to December.',
    studentsImpacted: 184,
    avgProgress: 78,
    completionRate: 92,
    generatedDate: '2026-02-03',
  },
  {
    id: '2',
    title: 'Term 3 2025 Comprehensive Report',
    type: 'termly',
    periodStart: '2025-09-01',
    periodEnd: '2025-11-30',
    summary: 'Overall academic performance improved by 15% across all enrolled students. Notable gains in Kiswahili literacy and creative arts participation.',
    studentsImpacted: 210,
    avgProgress: 72,
    completionRate: 88,
    generatedDate: '2025-12-10',
  },
  {
    id: '3',
    title: 'Annual Impact Report 2025',
    type: 'annual',
    periodStart: '2025-01-01',
    periodEnd: '2025-12-31',
    summary: 'Year-long analysis showing sustained growth in student outcomes. Total enrollment grew by 35% with consistent improvement in learning metrics.',
    studentsImpacted: 247,
    avgProgress: 75,
    completionRate: 85,
    generatedDate: '2026-01-15',
  },
  {
    id: '4',
    title: 'Custom: STEM Programs Analysis',
    type: 'custom',
    periodStart: '2025-06-01',
    periodEnd: '2025-12-31',
    summary: 'Focused analysis of STEM program outcomes including mathematics, science, and technology courses. Reveals high engagement among Grade 4-6 learners.',
    studentsImpacted: 132,
    avgProgress: 81,
    completionRate: 90,
    generatedDate: '2026-01-20',
  },
];

const stats = [
  { label: 'Total Reports', value: '12', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Monthly Reports', value: '8', icon: Calendar, color: 'text-green-400', bg: 'bg-green-500/10' },
  { label: 'Custom Reports', value: '4', icon: Sparkles, color: 'text-red-400', bg: 'bg-red-500/10' },
];

const typeBadge: Record<ReportType, { label: string; cls: string }> = {
  monthly: { label: 'Monthly', cls: 'bg-blue-500/10 text-blue-400' },
  termly: { label: 'Termly', cls: 'bg-purple-500/10 text-purple-400' },
  annual: { label: 'Annual', cls: 'bg-green-500/10 text-green-400' },
  custom: { label: 'Custom', cls: 'bg-amber-500/10 text-amber-400' },
};

const reportTypeOptions: { value: '' | ReportType; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'termly', label: 'Termly' },
  { value: 'annual', label: 'Annual' },
  { value: 'custom', label: 'Custom' },
];

const ImpactReportsPage: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<'' | ReportType>('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const filteredReports = typeFilter
    ? mockReports.filter((r) => r.type === typeFilter)
    : mockReports;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Impact Reports</h1>
            <p className="text-gray-400 dark:text-white/40 mt-1">View and generate AI-powered impact reports</p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-900 dark:text-white bg-red-500 hover:bg-red-600 transition-colors self-start"
          >
            <Plus className="w-4 h-4" />
            Generate Report
          </button>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 flex items-center gap-4"
            >
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 dark:text-white/40">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Filter Bar */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as '' | ReportType)}
              className="appearance-none bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50 cursor-pointer"
            >
              {reportTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#181C1F]">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40 pointer-events-none" />
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg px-4 py-2.5">
            <Calendar className="w-4 h-4 text-gray-400 dark:text-white/40" />
            <span className="text-sm text-gray-400 dark:text-white/40">Date Range: All Time</span>
          </div>
        </motion.div>

        {/* Report Cards Grid */}
        <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <motion.div
              key={report.id}
              variants={fadeUp}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 flex flex-col gap-4 hover:border-[#2a3035] transition-colors"
            >
              {/* Title and Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-white font-semibold text-lg leading-tight">{report.title}</h3>
                  <p className="text-gray-400 dark:text-white/40 text-sm mt-1">
                    {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                  </p>
                </div>
                <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeBadge[report.type].cls}`}>
                  {typeBadge[report.type].label}
                </span>
              </div>

              {/* Summary */}
              <p className="text-gray-600 dark:text-white/70 text-sm leading-relaxed line-clamp-3">{report.summary}</p>

              {/* Metrics Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 dark:bg-[#0F1112] rounded-lg p-3 text-center">
                  <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <p className="text-gray-900 dark:text-white font-bold text-lg">{report.studentsImpacted}</p>
                  <p className="text-gray-400 dark:text-white/40 text-xs">Students Impacted</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#0F1112] rounded-lg p-3 text-center">
                  <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
                  <p className="text-gray-900 dark:text-white font-bold text-lg">{report.avgProgress}%</p>
                  <p className="text-gray-400 dark:text-white/40 text-xs">Avg Progress</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#0F1112] rounded-lg p-3 text-center">
                  <CheckCircle className="w-4 h-4 text-red-400 mx-auto mb-1" />
                  <p className="text-gray-900 dark:text-white font-bold text-lg">{report.completionRate}%</p>
                  <p className="text-gray-400 dark:text-white/40 text-xs">Completion Rate</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-[#22272B]">
                <p className="text-gray-400 dark:text-white/40 text-xs">Generated {formatDate(report.generatedDate)}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `#`;
                      link.download = `${report.title.replace(/\s+/g, '-')}.pdf`;
                      link.click();
                      alert(`Downloading PDF: ${report.title}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-white/70 bg-gray-100 dark:bg-[#22272B] hover:bg-[#2a3035] transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    PDF
                  </button>
                  <button
                    onClick={() => {
                      const csvContent = `Report: ${report.title}\nPeriod: ${formatDate(report.periodStart)} - ${formatDate(report.periodEnd)}\nStudents Impacted: ${report.studentsImpacted}\nAvg Progress: ${report.avgProgress}%\nCompletion Rate: ${report.completionRate}%\n`;
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${report.title.replace(/\s+/g, '-')}.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-white/70 bg-gray-100 dark:bg-[#22272B] hover:bg-[#2a3035] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredReports.length === 0 && (
          <motion.div variants={fadeUp} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
            <BarChart3 className="w-10 h-10 text-gray-400 dark:text-white/20 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-white/40">No reports match the selected filter.</p>
          </motion.div>
        )}

        {/* Generate Report Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 max-w-lg w-full"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Generate Impact Report</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-white/70 block mb-2">Report Type</label>
                  <select className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50">
                    <option value="monthly">Monthly Report</option>
                    <option value="termly">Termly Report</option>
                    <option value="annual">Annual Report</option>
                    <option value="custom">Custom Report</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-white/70 block mb-2">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-white/70 block mb-2">End Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-white/70 block mb-2">Report Title</label>
                  <input
                    type="text"
                    placeholder="Enter custom report title"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => {
                    alert('Report generation started! You will be notified when it is ready.');
                    setShowGenerateModal(false);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Generate Report
                </button>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white rounded-lg hover:bg-[#2a3035] transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ImpactReportsPage;
