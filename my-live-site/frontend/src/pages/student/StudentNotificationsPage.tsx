import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { useStudentStore } from '../../store/studentStore';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/student/studentAccountService';
import { Bell, Check, CheckCheck, Trash2, Settings, BookOpen, Award, MessageCircle, CreditCard, AlertCircle, Clock, Loader2 } from 'lucide-react';

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: string;
  created_at?: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  assignment_due: { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  assignment: { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  achievement_unlocked: { icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  achievement: { icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  friend_request: { icon: MessageCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  shoutout_received: { icon: MessageCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  social: { icon: MessageCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  grade_published: { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  payment: { icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  course_update: { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  live_session_starting: { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  course: { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  streak_milestone: { icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  teacher_message: { icon: MessageCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  quiz_available: { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  system: { icon: AlertCircle, color: 'text-gray-500 dark:text-white/60', bg: 'bg-gray-100 dark:bg-white/10' },
};

const StudentNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const { markAllNotificationsRead: storeMarkAllRead } = useStudentStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [items, setItems] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getNotifications({});
        const notifications = Array.isArray(data) ? data : (data?.notifications || []);
        setItems(notifications.map((n: any) => ({
          id: n.id,
          type: n.category || n.type || 'system',
          title: n.title,
          message: n.message,
          time: n.created_at ? new Date(n.created_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }) : '',
          read: n.read ?? false,
          priority: n.priority || 'normal',
        })));
      } catch {
        setError('Failed to load notifications');
        setItems([
          { id: '1', type: 'assignment', title: 'New Assignment: Essay on Climate Change', message: 'Mrs. Kamau posted a new English assignment due Feb 18', time: '10 min ago', read: false, priority: 'high' },
          { id: '2', type: 'achievement', title: 'Badge Earned: Quiz Master!', message: 'You scored above 90% on 5 consecutive quizzes', time: '1 hour ago', read: false, priority: 'normal' },
          { id: '3', type: 'social', title: 'Grace W. sent you a friend request', message: 'Accept or decline the request', time: '2 hours ago', read: false, priority: 'normal' },
          { id: '4', type: 'payment', title: 'M-Pesa Top-up Successful', message: 'KES 1,000 has been added to your wallet', time: '5 hours ago', read: true, priority: 'normal' },
          { id: '5', type: 'course', title: 'Live Session Starting in 30 min', message: 'Science class with Mr. Ochieng at 2:00 PM', time: '6 hours ago', read: true, priority: 'high' },
          { id: '6', type: 'assignment', title: 'Assignment Graded: Math Homework', message: 'Ms. Wanjiku graded your submission - Score: 85%', time: '1 day ago', read: true, priority: 'normal' },
          { id: '7', type: 'social', title: 'New reply on your discussion post', message: 'Kevin O. replied to "How to solve fraction word problems?"', time: '1 day ago', read: true, priority: 'normal' },
          { id: '8', type: 'system', title: 'Weekly Progress Report Ready', message: 'Your AI-generated weekly story is available', time: '2 days ago', read: true, priority: 'normal' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = items.filter(n => !n.read).length;
  const filtered = filter === 'unread' ? items.filter(n => !n.read) : items;

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      storeMarkAllRead();
    } catch {
      // Continue with local update even on API failure
    }
    setItems(items.map(n => ({ ...n, read: true })));
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
    } catch {
      // Continue with local update
    }
    setItems(items.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const removeNotification = (id: string) => {
    setItems(items.filter(n => n.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#FF0000] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Bell className="w-8 h-8 text-yellow-400" /> Notifications
          </h1>
          <p className="text-gray-600 dark:text-white/70">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllRead}
            className={`px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 text-sm ${borderRadius} flex items-center gap-1`}
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
          <button
            onClick={() => navigate('/dashboard/student/notifications/settings')}
            className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}
          >
            <Settings className="w-4 h-4 text-gray-500 dark:text-white/60" />
          </button>
        </div>
      </div>

      {error && (
        <div className={`p-3 bg-yellow-500/10 ${borderRadius} border border-yellow-500/20 flex items-center gap-2`}>
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm">{error} - showing sample data</span>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 ${borderRadius} text-sm ${
            filter === 'all' ? 'bg-[#FF0000] text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'
          }`}
        >
          All ({items.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 ${borderRadius} text-sm ${
            filter === 'unread' ? 'bg-[#FF0000] text-gray-900 dark:text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className={`bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] divide-y divide-white/5`}>
        {filtered.map((notif) => {
          const config = typeConfig[notif.type] || typeConfig['system'];
          const Icon = config.icon;

          return (
            <div
              key={notif.id}
              className={`p-4 flex items-start gap-3 ${!notif.read ? 'bg-white/[0.02]' : ''}`}
            >
              <div className={`w-10 h-10 ${borderRadius} flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-[#FF0000] flex-shrink-0" />}
                  {notif.priority === 'high' && (
                    <span className={`px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] ${borderRadius}`}>Urgent</span>
                  )}
                </div>
                <h3 className={`text-sm font-medium ${notif.read ? 'text-gray-600 dark:text-white/70' : 'text-gray-900 dark:text-white'}`}>{notif.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-xs mt-0.5">{notif.message}</p>
                <span className="text-gray-400 dark:text-white/30 text-xs">{notif.time}</span>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className={`p-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}
                    title="Mark as read"
                  >
                    <Check className="w-3 h-3 text-gray-400 dark:text-white/40" />
                  </button>
                )}
                <button
                  onClick={() => removeNotification(notif.id)}
                  className={`p-1.5 bg-gray-50 dark:bg-white/5 hover:bg-red-500/20 ${borderRadius}`}
                  title="Remove"
                >
                  <Trash2 className="w-3 h-3 text-gray-400 dark:text-white/40" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-white/60">No notifications to show</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotificationsPage;
