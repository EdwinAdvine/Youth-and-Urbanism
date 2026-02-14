/**
 * Privacy & Data Page
 *
 * Shows data sharing overview, retention info, and GDPR-compliant
 * data export request functionality.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Download,
  Eye,
  Lock,
  Database,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  getSharedDataOverview,
  requestDataExport,
} from '../../services/parentSettingsService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface SharedDataOverview {
  total_consents_given: number;
  total_consents_revoked: number;
  active_third_party_shares: number;
  data_retention_days: number;
  last_data_export: string | null;
}

const DATA_CATEGORIES = [
  {
    icon: Database,
    title: 'Learning Data',
    description: 'Progress, grades, completion rates, learning patterns',
    purpose: 'To personalize the learning experience and generate reports',
    shared_with: 'Platform, AI system, Instructors',
    color: 'blue',
  },
  {
    icon: Eye,
    title: 'AI Interaction Data',
    description: 'Chat conversations, question history, tutoring sessions',
    purpose: 'To improve AI tutoring quality and personalize responses',
    shared_with: 'AI system',
    color: 'purple',
  },
  {
    icon: Lock,
    title: 'Assessment Scores',
    description: 'Quiz results, assignment grades, exam scores',
    purpose: 'To track academic performance and identify areas for improvement',
    shared_with: 'Platform, Instructors',
    color: 'green',
  },
  {
    icon: Clock,
    title: 'Activity & Behavioral',
    description: 'Login patterns, session duration, engagement metrics',
    purpose: 'To monitor usage and detect early warning signs',
    shared_with: 'Platform',
    color: 'orange',
  },
];

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  const [overview, setOverview] = useState<SharedDataOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const data = await getSharedDataOverview();
      setOverview(data);
    } catch (error) {
      console.error('Failed to load shared data overview:', error);
      setOverview({
        total_consents_given: 0,
        total_consents_revoked: 0,
        active_third_party_shares: 0,
        data_retention_days: 365,
        last_data_export: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportRequest = async () => {
    try {
      setExporting(true);
      setExportError(null);
      await requestDataExport();
      setExportSuccess(true);
    } catch (error) {
      console.error('Failed to request data export:', error);
      setExportError('Failed to submit data export request. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getColorClass = (color: string) => {
    const map: Record<string, string> = {
      blue: 'bg-blue-500/20 text-blue-500',
      purple: 'bg-purple-500/20 text-purple-500',
      green: 'bg-green-500/20 text-green-500',
      orange: 'bg-orange-500/20 text-orange-500',
    };
    return map[color] || 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white';
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
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy & Data</h1>
              <p className="text-sm text-gray-500 dark:text-white/60">
                Understand and control how your family's data is used
              </p>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        {overview && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
              <p className="text-2xl font-bold text-green-400">{overview.total_consents_given}</p>
              <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Consents Given</p>
            </div>
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
              <p className="text-2xl font-bold text-red-400">{overview.total_consents_revoked}</p>
              <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Consents Revoked</p>
            </div>
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
              <p className="text-2xl font-bold text-yellow-400">
                {overview.active_third_party_shares}
              </p>
              <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Third-Party Shares</p>
            </div>
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{overview.data_retention_days}</p>
              <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Retention (days)</p>
            </div>
          </motion.div>
        )}

        {/* Data Sharing Categories */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Sharing Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DATA_CATEGORIES.map((category) => (
              <div
                key={category.title}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClass(
                      category.color
                    )}`}
                  >
                    <category.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{category.title}</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-white/60 mb-3">{category.description}</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 dark:text-white/40 min-w-[60px]">Purpose:</span>
                    <span className="text-gray-500 dark:text-white/60">{category.purpose}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 dark:text-white/40 min-w-[60px]">Shared:</span>
                    <span className="text-gray-500 dark:text-white/60">{category.shared_with}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Data Retention Info */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Retention Policy</h2>
            <div className="space-y-3 text-sm text-gray-500 dark:text-white/60">
              <p>
                Your data is retained for{' '}
                <span className="text-gray-900 dark:text-white font-medium">
                  {overview?.data_retention_days || 365} days
                </span>{' '}
                after account closure. Active account data is retained indefinitely while your
                account is open.
              </p>
              <p>
                You can request full deletion at any time. Deletion requests are processed within 30
                business days in compliance with Kenya's Data Protection Act (DPA) and GDPR.
              </p>
              {overview?.last_data_export && (
                <p className="text-xs text-gray-400 dark:text-white/40">
                  Last data export: {new Date(overview.last_data_export).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Data Export Section */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gradient-to-r from-[#E40000]/10 to-transparent border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Request Data Export</h2>
                <p className="text-sm text-gray-500 dark:text-white/60">
                  Download a copy of all your family's data (GDPR/DPA compliant)
                </p>
              </div>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
              >
                <Download className="w-4 h-4" />
                Request Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Link to Consent Management */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <button
            onClick={() => navigate('/dashboard/parent/settings/consent')}
            className="flex items-center gap-2 text-sm text-[#E40000] hover:text-[#FF0000] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Manage detailed consent settings
          </button>
        </motion.div>

        {/* Export Confirmation Modal */}
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 max-w-md w-full mx-4">
              {exportSuccess ? (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Export Request Submitted
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-white/60 mb-6">
                    Your data export request has been submitted. You will receive an email with a
                    download link within 48 hours.
                  </p>
                  <button
                    onClick={() => {
                      setShowExportModal(false);
                      setExportSuccess(false);
                    }}
                    className="px-6 py-2 bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white rounded-lg hover:bg-[#333] transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirm Data Export</h3>
                  <p className="text-sm text-gray-500 dark:text-white/60 mb-6">
                    This will generate a complete export of all your family's data including
                    profiles, learning records, consent history, and AI interaction data. The export
                    file will be available for download within 48 hours.
                  </p>

                  {exportError && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/40 text-red-400 text-sm rounded-lg mb-4">
                      <AlertCircle className="w-4 h-4" />
                      <span>{exportError}</span>
                    </div>
                  )}

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowExportModal(false);
                        setExportError(null);
                      }}
                      className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 rounded-lg hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExportRequest}
                      disabled={exporting}
                      className="flex items-center gap-2 px-5 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {exporting ? 'Submitting...' : 'Confirm Export'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PrivacyPage;
