/**
 * Reports List Page
 *
 * Lists all generated reports with filters by child and type,
 * shows report status, and provides a generate-report modal.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, ArrowLeft, Plus, X, Download,
  CheckCircle, Loader2, Filter,
} from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import { getReportsList, generateReport } from '../../services/parentReportsService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

interface ReportSummary {
  id: string;
  child_id: string;
  child_name: string;
  report_type: string;
  title: string;
  period_start: string;
  period_end: string;
  status: string;
  pdf_url: string | null;
  created_at: string;
}

interface ReportsData {
  reports: ReportSummary[];
  total_count: number;
}

const ReportsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { children, selectedChildId } = useParentStore();

  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterChildId, setFilterChildId] = useState<string>(selectedChildId || '');
  const [filterType, setFilterType] = useState<string>('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genChildId, setGenChildId] = useState<string>(selectedChildId || '');
  const [genType, setGenType] = useState<string>('weekly');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, [filterChildId, filterType]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterChildId) params.child_id = filterChildId;
      if (filterType) params.report_type = filterType;
      const data = await getReportsList(params);
      setReportsData(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!genChildId || !genType) return;
    try {
      setGenerating(true);
      await generateReport({
        child_id: genChildId,
        report_type: genType,
      });
      setShowGenerateModal(false);
      await loadReports();
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'bg-blue-500/20 text-blue-400';
      case 'monthly':
        return 'bg-purple-500/20 text-purple-400';
      case 'term':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIndicator = (status: string) => {
    if (status === 'generating') {
      return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
    }
    if (status === 'ready') {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    return null;
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/parent')}
          className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </button>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
                <p className="text-gray-500 dark:text-white/60 mt-1">
                  View and generate learning reports
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#E40000] text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-[#C00] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </motion.div>

        {/* Filter Controls */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-gray-500 dark:text-white/50">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filters:</span>
            </div>
            <select
              value={filterChildId}
              onChange={(e) => setFilterChildId(e.target.value)}
              className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#E40000]"
            >
              <option value="">All Children</option>
              {children.map((child) => (
                <option key={child.student_id} value={child.student_id}>
                  {child.full_name}
                </option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#E40000]"
            >
              <option value="">All Types</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="term">Term</option>
            </select>
          </div>
        </motion.div>

        {/* Reports List */}
        {reportsData && reportsData.reports.length > 0 ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {reportsData.reports.map((report) => (
              <motion.div
                key={report.id}
                variants={fadeUp}
                className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 hover:border-[#E40000]/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                        {report.title}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${getTypeBadge(report.report_type)}`}>
                        {report.report_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-white/50 mb-1">{report.child_name}</p>
                    <p className="text-xs text-gray-400 dark:text-white/40">
                      {new Date(report.period_start).toLocaleDateString()} -{' '}
                      {new Date(report.period_end).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusIndicator(report.status)}
                    <span className="text-xs text-gray-400 dark:text-white/40 capitalize">{report.status}</span>
                    {report.pdf_url && report.status === 'ready' && (
                      <a
                        href={report.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-[#181C1F] text-[#E40000] text-xs rounded-lg hover:bg-[#E40000]/10 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No reports generated yet
              </h3>
              <p className="text-gray-500 dark:text-white/60 text-sm mb-6">
                Generate your first report to track your child's progress.
              </p>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="px-6 py-3 bg-[#E40000] text-gray-900 dark:text-white font-medium rounded-lg hover:bg-[#C00] transition-colors"
              >
                Generate Report
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generate Report</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-white/60 mb-2">Select Child</label>
                <select
                  value={genChildId}
                  onChange={(e) => setGenChildId(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#E40000]"
                >
                  <option value="">Choose a child...</option>
                  {children.map((child) => (
                    <option key={child.student_id} value={child.student_id}>
                      {child.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-white/60 mb-2">Report Type</label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#E40000]"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="term">Term</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!genChildId || generating}
                className="flex-1 py-2.5 bg-[#E40000] text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-[#C00] transition-colors disabled:opacity-50"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ReportsListPage;
