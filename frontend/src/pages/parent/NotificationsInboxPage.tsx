/**
 * Notifications & Inbox Page
 *
 * Full notifications center for the parent dashboard.
 * Shows filterable notifications with type icons, read/unread
 * indicators, and a mark-all-read action.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell, Trophy, AlertTriangle, FileText, MessageSquare, Settings,
  ArrowLeft, CheckCheck, Filter, ChevronDown,
} from 'lucide-react';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getNotificationCounts,
} from '../../services/parentCommunicationsService';
import type {
  NotificationsListResponse,
  ParentNotificationResponse,
  NotificationCountsResponse,
} from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

type FilterTab = 'all' | 'achievement' | 'alert' | 'report' | 'message' | 'system';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'achievement', label: 'Achievements' },
  { key: 'alert', label: 'Alerts' },
  { key: 'report', label: 'Reports' },
  { key: 'message', label: 'Messages' },
  { key: 'system', label: 'System' },
];

const PAGE_SIZE = 20;

/* ------------------------------------------------------------------ */
/* Helper: relative time string                                       */
/* ------------------------------------------------------------------ */
function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(dateString).toLocaleDateString();
}

/* ------------------------------------------------------------------ */
/* Helper: icon per notification type                                 */
/* ------------------------------------------------------------------ */
function typeIcon(type: string) {
  switch (type) {
    case 'achievement':
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 'alert':
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    case 'report':
      return <FileText className="w-5 h-5 text-blue-400" />;
    case 'message':
      return <MessageSquare className="w-5 h-5 text-green-400" />;
    case 'system':
      return <Settings className="w-5 h-5 text-gray-400" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500 dark:text-white/60" />;
  }
}

/* ================================================================== */
/* Component                                                          */
/* ================================================================== */

const NotificationsInboxPage: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<NotificationsListResponse | null>(null);
  const [counts, setCounts] = useState<NotificationCountsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);

  /* ---- initial load ---- */
  const loadNotifications = useCallback(
    async (reset = true) => {
      try {
        if (reset) {
          setLoading(true);
          setOffset(0);
        } else {
          setLoadingMore(true);
        }

        const currentOffset = reset ? 0 : offset;
        const params: Record<string, any> = {
          limit: PAGE_SIZE,
          offset: currentOffset,
        };
        if (activeTab !== 'all') params.notificationType = activeTab;

        const [notifData, countsData] = await Promise.all([
          getNotifications(params),
          reset ? getNotificationCounts() : Promise.resolve(counts),
        ]);

        if (reset) {
          setData(notifData);
        } else {
          setData((prev) =>
            prev
              ? {
                  ...notifData,
                  notifications: [...prev.notifications, ...notifData.notifications],
                }
              : notifData
          );
        }

        if (countsData) setCounts(countsData);
        setOffset(currentOffset + PAGE_SIZE);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeTab, offset, counts]
  );

  useEffect(() => {
    loadNotifications(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  /* ---- actions ---- */
  const handleMarkRead = async (notification: ParentNotificationResponse) => {
    if (notification.is_read) return;
    try {
      await markNotificationRead(notification.id);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          unread_count: Math.max(0, prev.unread_count - 1),
          notifications: prev.notifications.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          ),
        };
      });
      setCounts((prev) =>
        prev ? { ...prev, total_unread: Math.max(0, prev.total_unread - 1) } : prev
      );
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          unread_count: 0,
          notifications: prev.notifications.map((n) => ({ ...n, is_read: true })),
        };
      });
      setCounts((prev) => (prev ? { ...prev, total_unread: 0, urgent_count: 0 } : prev));
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  };

  const hasMore = data ? data.notifications.length < data.total_count : false;

  /* ---- loading state ---- */
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
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard/parent')}
          className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </button>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications &amp; Alerts</h1>
                <p className="text-gray-500 dark:text-white/60 mt-1">Stay informed about your children's progress</p>
              </div>
            </div>

            {data && data.unread_count > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All Read
              </button>
            )}
          </div>
        </motion.div>

        {/* Counts Summary Bar */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.total_count ?? 0}</p>
              <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Total</p>
            </div>
            <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{data?.unread_count ?? 0}</p>
              <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Unread</p>
            </div>
            <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{counts?.urgent_count ?? 0}</p>
              <p className="text-xs text-gray-500 dark:text-white/50 mt-1">Critical</p>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-gray-400 dark:text-white/40 flex-shrink-0" />
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'bg-[#E40000] text-gray-900 dark:text-white'
                    : 'bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-[#2A2E33]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notification List */}
        {data && data.notifications.length > 0 ? (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
            {data.notifications.map((notification) => (
              <motion.div
                key={notification.id}
                variants={fadeUp}
                onClick={() => handleMarkRead(notification)}
                className={`bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 cursor-pointer transition-colors hover:bg-[#2A2E33] ${
                  !notification.is_read ? 'border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Type Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {typeIcon(notification.notification_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`text-sm truncate ${
                          !notification.is_read ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-white/80'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-white/60 line-clamp-2">{notification.message}</p>

                    <div className="flex items-center gap-3 mt-2">
                      {notification.child_name && (
                        <span className="text-xs text-gray-400 dark:text-white/40">{notification.child_name}</span>
                      )}
                      <span className="text-xs text-gray-400 dark:text-white/30">
                        {timeAgo(notification.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Load More */}
            {hasMore && (
              <motion.div variants={fadeUp} className="text-center pt-2">
                <button
                  onClick={() => loadNotifications(false)}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-600 dark:text-white/70 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white/50" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No notifications</h3>
              <p className="text-gray-500 dark:text-white/60 text-sm">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default NotificationsInboxPage;
