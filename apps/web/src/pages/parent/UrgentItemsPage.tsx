/**
 * Urgent Items Page
 *
 * Full-page expansion of the urgent items banner widget
 * from ParentDashboardHome. Displays all items grouped by
 * severity (critical, warning, info) with action links.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell, ArrowLeft, XCircle, AlertTriangle, Info,
  CheckCircle, ChevronRight, RefreshCw,
} from 'lucide-react';
import { getUrgentItems } from '../../services/parentDashboardService';
import type { UrgentItemsResponse } from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const UrgentItemsPage: React.FC = () => {
  const navigate = useNavigate();

  const [urgentItems, setUrgentItems] = useState<UrgentItemsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUrgentItems();
  }, []);

  const loadUrgentItems = async () => {
    try {
      setLoading(true);
      const data = await getUrgentItems();
      setUrgentItems(data);
    } catch (error) {
      console.error('Failed to load urgent items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-blue-500 bg-blue-500/10';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // Group items by severity
  const groupedItems = urgentItems?.items
    ? {
        critical: urgentItems.items.filter((item) => item.severity === 'critical'),
        warning: urgentItems.items.filter((item) => item.severity === 'warning'),
        info: urgentItems.items.filter((item) => item.severity === 'info'),
      }
    : { critical: [], warning: [], info: [] };

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Urgent Items</h1>
                  {urgentItems && urgentItems.total_count > 0 && (
                    <span className="px-3 py-1 bg-[#E40000] text-gray-900 dark:text-white text-sm font-semibold rounded-full">
                      {urgentItems.total_count}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 dark:text-white/60 mt-1">
                  Items requiring your attention
                </p>
              </div>
            </div>
            <button
              onClick={loadUrgentItems}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Empty State */}
        {(!urgentItems || urgentItems.total_count === 0) ? (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">All Clear!</h3>
              <p className="text-gray-500 dark:text-white/60 text-sm">
                No urgent items at this time. Everything is on track.
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Summary Bar */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#181C1F] border border-red-500/30 rounded-xl p-4 text-center">
                  <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{groupedItems.critical.length}</p>
                  <p className="text-xs text-gray-500 dark:text-white/60">Critical</p>
                </div>
                <div className="bg-white dark:bg-[#181C1F] border border-yellow-500/30 rounded-xl p-4 text-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{groupedItems.warning.length}</p>
                  <p className="text-xs text-gray-500 dark:text-white/60">Warning</p>
                </div>
                <div className="bg-white dark:bg-[#181C1F] border border-blue-500/30 rounded-xl p-4 text-center">
                  <Info className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{groupedItems.info.length}</p>
                  <p className="text-xs text-gray-500 dark:text-white/60">Info</p>
                </div>
              </div>
            </motion.div>

            {/* Critical Items */}
            {groupedItems.critical.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Critical</h2>
                    <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-500 rounded-full font-medium">
                      {groupedItems.critical.length}
                    </span>
                  </div>
                  <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                    {groupedItems.critical.map((item, index) => (
                      <motion.div
                        key={`critical-${index}`}
                        variants={fadeUp}
                        className={`border rounded-lg p-4 transition-colors ${getSeverityColor(item.severity)} ${
                          item.action_url ? 'cursor-pointer hover:brightness-110' : ''
                        }`}
                        onClick={() => item.action_url && navigate(item.action_url)}
                      >
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(item.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                              {item.child_name && (
                                <span className="text-xs text-gray-500 dark:text-white/50">
                                  {item.child_name}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-700 dark:text-white/80">{item.description || item.message}</p>
                            {item.due_date && (
                              <p className="text-xs text-gray-400 dark:text-white/40 mt-2">
                                Due: {new Date(item.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {item.action_url && (
                            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-white/40 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Warning Items */}
            {groupedItems.warning.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Warning</h2>
                    <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-500 rounded-full font-medium">
                      {groupedItems.warning.length}
                    </span>
                  </div>
                  <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                    {groupedItems.warning.map((item, index) => (
                      <motion.div
                        key={`warning-${index}`}
                        variants={fadeUp}
                        className={`border rounded-lg p-4 transition-colors ${getSeverityColor(item.severity)} ${
                          item.action_url ? 'cursor-pointer hover:brightness-110' : ''
                        }`}
                        onClick={() => item.action_url && navigate(item.action_url)}
                      >
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(item.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                              {item.child_name && (
                                <span className="text-xs text-gray-500 dark:text-white/50">
                                  {item.child_name}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-700 dark:text-white/80">{item.description || item.message}</p>
                            {item.due_date && (
                              <p className="text-xs text-gray-400 dark:text-white/40 mt-2">
                                Due: {new Date(item.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {item.action_url && (
                            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-white/40 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Info Items */}
            {groupedItems.info.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Info</h2>
                    <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-500 rounded-full font-medium">
                      {groupedItems.info.length}
                    </span>
                  </div>
                  <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
                    {groupedItems.info.map((item, index) => (
                      <motion.div
                        key={`info-${index}`}
                        variants={fadeUp}
                        className={`border rounded-lg p-4 transition-colors ${getSeverityColor(item.severity)} ${
                          item.action_url ? 'cursor-pointer hover:brightness-110' : ''
                        }`}
                        onClick={() => item.action_url && navigate(item.action_url)}
                      >
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(item.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                              {item.child_name && (
                                <span className="text-xs text-gray-500 dark:text-white/50">
                                  {item.child_name}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-700 dark:text-white/80">{item.description || item.message}</p>
                            {item.due_date && (
                              <p className="text-xs text-gray-400 dark:text-white/40 mt-2">
                                Due: {new Date(item.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {item.action_url && (
                            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-white/40 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default UrgentItemsPage;
