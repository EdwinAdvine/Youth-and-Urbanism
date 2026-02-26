import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  FileText,
  Calendar,
  Download,
  FileSpreadsheet,
  File,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Inbox,
} from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface CustomReport {
  id: string;
  title: string;
  type: 'impact' | 'financial' | 'engagement';
  dateRange: string;
  program: string;
  summary: string;
  createdAt: string;
}

const CustomReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');

  const reports: CustomReport[] = [
    {
      id: '1',
      title: 'Q4 2025 Impact Assessment',
      type: 'impact',
      dateRange: 'Oct 2025 - Dec 2025',
      program: 'STEM Excellence Program',
      summary:
        'Comprehensive impact analysis showing 23% improvement in math scores and 18% improvement in science across 45 sponsored students.',
      createdAt: 'Jan 15, 2026',
    },
    {
      id: '2',
      title: 'January 2026 Financial Summary',
      type: 'financial',
      dateRange: 'Jan 1 - Jan 31, 2026',
      program: 'All Programs',
      summary:
        'Total disbursements of KSh 815,000 across 4 active programs. Cost per student completion decreased by 12% compared to previous period.',
      createdAt: 'Feb 2, 2026',
    },
    {
      id: '3',
      title: 'Student Engagement Deep Dive',
      type: 'engagement',
      dateRange: 'Nov 2025 - Jan 2026',
      program: 'Girls in Tech Initiative',
      summary:
        'Engagement rates peaked at 94% during coding workshops. Average session duration of 47 minutes, exceeding the 30-minute target by 56%.',
      createdAt: 'Feb 8, 2026',
    },
  ];

  const getTypeBadge = (type: string) => {
    const config: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
      impact: { label: 'Impact', bg: 'bg-green-500/10', text: 'text-green-400', icon: TrendingUp },
      financial: { label: 'Financial', bg: 'bg-blue-500/10', text: 'text-blue-400', icon: BarChart3 },
      engagement: { label: 'Engagement', bg: 'bg-purple-500/10', text: 'text-purple-400', icon: PieChart },
    };
    const c = config[type];
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  const filteredReports = reports.filter((report) => {
    const matchesType = reportType === 'all' || report.type === reportType;
    return matchesType;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Custom Reports</h1>
              <p className="text-gray-500 dark:text-white/60">Generate and view detailed reports for your sponsorship programs</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF4444] transition-colors">
              <Plus className="w-5 h-5" />
              Generate Report
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeUp}>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400 dark:text-white/40" />
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50"
                >
                  <option value="all">All Types</option>
                  <option value="impact">Impact</option>
                  <option value="financial">Financial</option>
                  <option value="engagement">Engagement</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400 dark:text-white/40" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50"
                >
                  <option value="all">All Dates</option>
                  <option value="last30">Last 30 Days</option>
                  <option value="last90">Last 90 Days</option>
                  <option value="last6m">Last 6 Months</option>
                  <option value="lastyear">Last Year</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400 dark:text-white/40" />
                <select
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50"
                >
                  <option value="all">All Programs</option>
                  <option value="stem">STEM Excellence Program</option>
                  <option value="early">Early Childhood Development</option>
                  <option value="girls">Girls in Tech Initiative</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reports Grid */}
        {filteredReports.length > 0 ? (
          <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredReports.map((report) => (
              <motion.div
                key={report.id}
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 hover:border-[#E40000]/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 mr-3">{report.title}</h3>
                  {getTypeBadge(report.type)}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/40">
                    <Calendar className="w-3.5 h-3.5" />
                    {report.dateRange}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/40">
                    <FileText className="w-3.5 h-3.5" />
                    {report.program}
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-white/70 mb-4 leading-relaxed">{report.summary}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#22272B]">
                  <span className="text-xs text-gray-400 dark:text-white/40">Created {report.createdAt}</span>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#22272B] text-gray-600 dark:text-white/70 rounded-lg hover:bg-[#2A2F34] transition-colors text-xs">
                      <File className="w-3.5 h-3.5" />
                      PDF
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#22272B] text-gray-600 dark:text-white/70 rounded-lg hover:bg-[#2A2F34] transition-colors text-xs">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      CSV
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#22272B] text-gray-600 dark:text-white/70 rounded-lg hover:bg-[#2A2F34] transition-colors text-xs">
                      <Download className="w-3.5 h-3.5" />
                      XLSX
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={fadeUp}>
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <Inbox className="w-12 h-12 text-gray-400 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No custom reports yet</h3>
              <p className="text-sm text-gray-500 dark:text-white/60">Generate your first report to gain insights into your sponsorship programs.</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CustomReportsPage;
