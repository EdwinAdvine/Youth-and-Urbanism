import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Trash2, AlertCircle } from 'lucide-react';
import {
  getNotifications,
  markAllRead,
  deleteNotification,
} from '@/services/staff/staffNotificationService';
import type { StaffNotification } from '@/types/staff';

const StaffNotificationsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions'>('all');
  const [notifications, setNotifications] = useState<StaffNotification[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getNotifications();
      setNotifications(response.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    setActionLoading('mark-all');
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (notificationId: string) => {
    setActionLoading(notificationId);
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'mentions') return notif.type === 'mention';
    return true;
  });

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-8 w-40 bg-gray-100 dark:bg-[#22272B] rounded animate-pulse" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-white text-sm rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Error banner */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'mentions')}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="mentions">Mentions</option>
            </select>
            <button
              onClick={handleMarkAllRead}
              disabled={actionLoading === 'mark-all'}
              title="Mark all as read"
              className="p-2 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-10 h-10 text-gray-300 dark:text-white/10 mx-auto mb-3" />
              <p className="text-sm text-gray-400 dark:text-white/40">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                  notif.read
                    ? 'bg-white dark:bg-[#181C1F] border-gray-200 dark:border-[#22272B]'
                    : 'bg-white dark:bg-[#181C1F] border-[#E40000]/30'
                } ${actionLoading === notif.id ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className={`p-2 rounded-lg ${notif.read ? 'bg-gray-100 dark:bg-[#22272B]' : 'bg-[#E40000]/20'}`}>
                  <Bell className={`w-4 h-4 ${notif.read ? 'text-gray-400 dark:text-white/40' : 'text-[#FF4444]'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-white/50 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 dark:text-white/30 mt-1">{formatTime(notif.created_at)}</p>
                </div>
                <button
                  onClick={() => handleDelete(notif.id)}
                  disabled={actionLoading === notif.id}
                  className="p-1.5 text-gray-400 dark:text-white/30 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffNotificationsPage;
