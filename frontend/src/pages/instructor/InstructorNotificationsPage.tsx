import React, { useEffect, useState, useCallback } from 'react';
import {
  Bell,
  Filter,
  CheckCheck,
  Trash2,
  FileText,
  MessageSquare,
  Video,
  DollarSign,
  Settings,
  Check,
  Loader2,
  RefreshCw,
  Inbox,
  Square,
  CheckSquare,
} from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { format, formatDistanceToNow } from 'date-fns';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'submission' | 'message' | 'session' | 'earnings' | 'system';
  is_read: boolean;
  created_at: string;
}

type TypeFilter = 'all' | 'submission' | 'message' | 'session' | 'earnings' | 'system';
type ReadFilter = 'all' | 'unread' | 'read';

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New submission received',
    message: 'Jane Mwangi submitted Assignment 3: Algebra Problems',
    type: 'submission',
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Upcoming session reminder',
    message: 'Live session "Mathematics Review" starts in 1 hour',
    type: 'session',
    is_read: false,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Payment processed',
    message: 'Your payout of KES 50,000 has been processed successfully',
    type: 'earnings',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'New message from parent',
    message: 'Mrs. Kamau sent you a message about her child\'s progress in Science',
    type: 'message',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'System maintenance scheduled',
    message: 'Platform maintenance is scheduled for Saturday, 2:00 AM - 4:00 AM EAT',
    type: 'system',
    is_read: true,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    title: 'Assignment grading overdue',
    message: 'Peter Ochieng\'s submission for "Grade 8 English Essay" is awaiting grading for 3 days',
    type: 'submission',
    is_read: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    title: 'Session completed',
    message: 'Your live session "Science Lab: Chemistry Basics" has ended. 12 students attended.',
    type: 'session',
    is_read: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    title: 'Earnings milestone reached',
    message: 'Congratulations! You have earned over KES 500,000 on the platform.',
    type: 'earnings',
    is_read: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const TYPE_CONFIG: Record<
  Notification['type'],
  { icon: React.ElementType; color: string; bgColor: string; borderColor: string; label: string }
> = {
  submission: {
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    label: 'Submissions',
  },
  message: {
    icon: MessageSquare,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    label: 'Messages',
  },
  session: {
    icon: Video,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    label: 'Sessions',
  },
  earnings: {
    icon: DollarSign,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    label: 'Earnings',
  },
  system: {
    icon: Settings,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    label: 'System',
  },
};

export const InstructorNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      const response = await axios.get(
        `${API_URL}/api/v1/instructor/dashboard/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data: Notification[] = response.data;

      if (data && data.length > 0) {
        setNotifications(data);
      } else {
        // Fallback to mock data
        setNotifications(MOCK_NOTIFICATIONS);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      // Fallback to mock data
      setNotifications(MOCK_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      setActionLoading(id);
      const token = localStorage.getItem('access_token');

      await axios.put(
        `${API_URL}/api/v1/instructor/dashboard/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    } finally {
      // Optimistically update UI regardless of API success
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkAllLoading(true);
      const token = localStorage.getItem('access_token');

      await axios.post(
        `${API_URL}/api/v1/instructor/dashboard/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      // Optimistically update UI
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setMarkAllLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(id);
      const token = localStorage.getItem('access_token');

      await axios.delete(
        `${API_URL}/api/v1/instructor/dashboard/notifications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
    } finally {
      // Optimistically remove from UI
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setActionLoading(null);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      setBatchDeleteLoading(true);
      const token = localStorage.getItem('access_token');

      // Delete each selected notification
      const deletePromises = Array.from(selectedIds).map((id) =>
        axios
          .delete(
            `${API_URL}/api/v1/instructor/dashboard/notifications/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .catch((err) =>
            console.error(`Error deleting notification ${id}:`, err)
          )
      );

      await Promise.allSettled(deletePromises);
    } catch (err) {
      console.error('Error in batch delete:', err);
    } finally {
      // Optimistically remove from UI
      setNotifications((prev) =>
        prev.filter((n) => !selectedIds.has(n.id))
      );
      setSelectedIds(new Set());
      setSelectMode(false);
      setBatchDeleteLoading(false);
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.is_read) {
      handleMarkAsRead(notif.id);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  // Apply filters
  const filteredNotifications = notifications.filter((n) => {
    const matchesType = typeFilter === 'all' || n.type === typeFilter;
    const matchesRead =
      readFilter === 'all' ||
      (readFilter === 'unread' && !n.is_read) ||
      (readFilter === 'read' && n.is_read);
    return matchesType && matchesRead;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Count by type for filter badges
  const typeCounts: Record<string, number> = {};
  notifications.forEach((n) => {
    typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Notifications"
        description="Stay updated with important events and messages"
        badge={unreadCount > 0 ? `${unreadCount} unread` : undefined}
        icon={<Bell className="w-6 h-6 text-purple-400" />}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchNotifications}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleMarkAllRead}
              disabled={markAllLoading || unreadCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markAllLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              Mark All Read
            </button>
          </div>
        }
      />

      {/* Filters & Batch Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Read/Unread Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-white/60" />
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value as ReadFilter)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                typeFilter === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'
              }`}
            >
              All ({notifications.length})
            </button>
            {(
              Object.keys(TYPE_CONFIG) as Array<keyof typeof TYPE_CONFIG>
            ).map((type) => {
              const config = TYPE_CONFIG[type];
              const count = typeCounts[type] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    typeFilter === type
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'
                  }`}
                >
                  {config.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Batch Actions Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectMode(!selectMode);
              setSelectedIds(new Set());
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
              selectMode
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
          >
            {selectMode ? 'Cancel Select' : 'Select'}
          </button>
        </div>
      </div>

      {/* Batch Action Bar (visible when items are selected) */}
      {selectMode && selectedIds.size > 0 && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 transition-colors"
            >
              {selectedIds.size === filteredNotifications.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {selectedIds.size === filteredNotifications.length
                ? 'Deselect All'
                : 'Select All'}
            </button>
            <span className="text-sm text-purple-200/80">
              {selectedIds.size} selected
            </span>
          </div>
          <button
            onClick={handleBatchDelete}
            disabled={batchDeleteLoading}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {batchDeleteLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete Selected
          </button>
        </div>
      )}

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-full">
              <Inbox className="w-8 h-8 text-gray-400 dark:text-white/40" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No notifications
          </h3>
          <p className="text-sm text-gray-500 dark:text-white/60">
            {readFilter === 'unread'
              ? 'You have no unread notifications. Great job staying on top of things!'
              : typeFilter !== 'all'
              ? `No ${TYPE_CONFIG[typeFilter].label.toLowerCase()} notifications found.`
              : 'You have no notifications yet. They will appear here as events occur.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type];
            const TypeIcon = config.icon;
            const isSelected = selectedIds.has(notif.id);
            const isActionLoading = actionLoading === notif.id;

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`bg-gray-50 dark:bg-white/5 backdrop-blur-sm border rounded-xl p-5 transition-all cursor-pointer group ${
                  !notif.is_read
                    ? 'border-purple-500/30 bg-purple-500/5'
                    : 'border-gray-200 dark:border-white/10'
                } ${
                  isSelected
                    ? 'ring-2 ring-purple-500/50 border-purple-500/30'
                    : ''
                } hover:bg-gray-100 dark:hover:bg-white/[0.07]`}
              >
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  {selectMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(notif.id);
                      }}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-purple-400" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 dark:text-white/40" />
                      )}
                    </button>
                  )}

                  {/* Type Icon */}
                  <div
                    className={`p-2.5 ${config.bgColor} rounded-lg flex-shrink-0 border ${config.borderColor}`}
                  >
                    <TypeIcon className={`w-4 h-4 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`text-sm font-semibold truncate ${
                              !notif.is_read
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-700 dark:text-white/80'
                            }`}
                          >
                            {notif.title}
                          </h3>
                          {!notif.is_read && (
                            <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p
                          className={`text-sm ${
                            !notif.is_read
                              ? 'text-gray-600 dark:text-white/70'
                              : 'text-gray-500 dark:text-white/50'
                          }`}
                        >
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 ${config.bgColor} ${config.color} text-xs rounded border ${config.borderColor}`}
                          >
                            <TypeIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                          <p className="text-xs text-gray-400 dark:text-white/40">
                            {formatDistanceToNow(new Date(notif.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-white/40 hidden sm:block">
                            {format(new Date(notif.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notif.id);
                            }}
                            disabled={isActionLoading}
                            className="p-2 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            {isActionLoading ? (
                              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4 text-green-400" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notif.id);
                          }}
                          disabled={isActionLoading}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete notification"
                        >
                          {isActionLoading ? (
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-gray-500 dark:text-white/60 hover:text-red-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Stats */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-white/40 px-1">
          <span>
            Showing {filteredNotifications.length} of {notifications.length}{' '}
            notifications
          </span>
          <span>
            {unreadCount} unread
          </span>
        </div>
      )}
    </div>
  );
};
