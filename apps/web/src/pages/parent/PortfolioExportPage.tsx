/**
 * Portfolio Export Page
 *
 * Allows parents to export child portfolios (certificates, projects, assessments).
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderDown, CheckSquare, Square, FileText, Award, BookOpen,
  Loader, CheckCircle, Users, Download,
} from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import { exportPortfolio, getExportStatus } from '../../services/parentReportsService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const EXPORT_ITEMS = [
  { id: 'certificates', label: 'Certificates', icon: Award, description: 'All earned certificates and awards' },
  { id: 'projects', label: 'Projects', icon: FileText, description: 'Completed project submissions' },
  { id: 'assessments', label: 'Assessments', icon: BookOpen, description: 'Quiz and exam results' },
  { id: 'progress_reports', label: 'Progress Reports', icon: FileText, description: 'Weekly and monthly progress reports' },
];

const PortfolioExportPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedChildId, children } = useParentStore();

  const [selectedItems, setSelectedItems] = useState<string[]>(['certificates', 'projects', 'assessments']);
  const [exporting, setExporting] = useState(false);
  const [, setExportJobId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedChild = children.find((c) => c.student_id === selectedChildId);

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    if (!selectedChildId || selectedItems.length === 0) return;

    try {
      setExporting(true);
      setError(null);
      const result = await exportPortfolio({
        child_id: selectedChildId,
        items: selectedItems,
      });
      setExportJobId(result.job_id);
      setExportStatus('processing');
      pollStatus(result.job_id);
    } catch (err) {
      console.error('Failed to initiate export:', err);
      setError('Failed to start export. Please try again.');
      setExporting(false);
    }
  };

  const pollStatus = async (jobId: string) => {
    try {
      const status = await getExportStatus(jobId);
      setExportStatus(status.status);
      if (status.status === 'completed') {
        setDownloadUrl(status.download_url || null);
        setExporting(false);
      } else if (status.status === 'failed') {
        setError('Export failed. Please try again.');
        setExporting(false);
      } else {
        setTimeout(() => pollStatus(jobId), 3000);
      }
    } catch {
      setExporting(false);
      setError('Failed to check export status.');
    }
  };

  if (!selectedChildId) {
    return (
      <>
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 dark:text-white/30 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60 mb-2">Select a child to export portfolio</p>
          <p className="text-sm text-gray-400 dark:text-white/40 mb-4">Use the child selector in the sidebar</p>
          <button onClick={() => navigate('/dashboard/parent/children')} className="px-6 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors">View Children</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-lg flex items-center justify-center">
              <FolderDown className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export Portfolio</h1>
              <p className="text-sm text-gray-500 dark:text-white/60">{selectedChild?.full_name || 'Selected child'}</p>
            </div>
          </div>
        </motion.div>

        {/* Export Items Selection */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Items to Export</h3>
            <div className="space-y-3">
              {EXPORT_ITEMS.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                      isSelected
                        ? 'border-[#E40000] bg-[#E40000]/10'
                        : 'border-gray-200 dark:border-[#22272B] bg-gray-100 dark:bg-[#22272B] hover:border-[#E40000]/50'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-[#E40000] flex-shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 dark:text-white/40 flex-shrink-0" />
                    )}
                    <Icon className="w-5 h-5 text-gray-500 dark:text-white/60 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-400 dark:text-white/40">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Export Status */}
        {exportStatus === 'completed' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-900 dark:text-white font-medium mb-1">Export Complete!</p>
              <p className="text-sm text-gray-500 dark:text-white/60 mb-4">Your portfolio has been exported successfully.</p>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors font-medium text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Portfolio
                </a>
              )}
            </div>
          </motion.div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Export Button */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <button
            onClick={handleExport}
            disabled={exporting || selectedItems.length === 0}
            className="w-full py-3 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FolderDown className="w-5 h-5" />
                <span>Export Portfolio as ZIP</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-400 dark:text-white/40 text-center mt-2">
            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default PortfolioExportPage;
