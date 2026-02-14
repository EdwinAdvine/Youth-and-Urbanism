import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  UserCheck,
  FileText,
  Shield,
  Brain,
  CheckCheck,
  Check,
  Filter,
  X,
  ChevronDown,
  Clock,
  Trash2,
} from 'lucide-react';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

type NotificationType =
  | 'system_alert'
  | 'user_activity'
  | 'content_update'
  | 'security'
  | 'ai_alert';

type Priority = 'critical' | 'high' | 'medium' | 'low';

interface Notification {
  id: string;
  type: NotificationType;
  priority: Priority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const TYPE_CONFIG: Record<
  NotificationType,
  { label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }
> = {
  system_alert: {
    label: 'System Alert',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500',
    icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
  },
  user_activity: {
    label: 'User Activity',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
    icon: <UserCheck className="w-5 h-5 text-blue-400" />,
  },
  content_update: {
    label: 'Content Update',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500',
    icon: <FileText className="w-5 h-5 text-green-400" />,
  },
  security: {
    label: 'Security',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500',
    icon: <Shield className="w-5 h-5 text-orange-400" />,
  },
  ai_alert: {
    label: 'AI Alert',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500',
    icon: <Brain className="w-5 h-5 text-purple-400" />,
  },
};

const PRIORITY_BADGE: Record<Priority, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  high: { label: 'High', className: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
  medium: { label: 'Medium', className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  low: { label: 'Low', className: 'bg-white/10 text-white/50 border border-white/10' },
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------

const now = Date.now();
const mins = (m: number) => new Date(now - m * 60 * 1000);
const hours = (h: number) => new Date(now - h * 60 * 60 * 1000);
const days = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000);

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'system_alert',
    priority: 'critical',
    title: 'Database Connection Pool Exhausted',
    message: 'PostgreSQL connection pool reached 95% capacity. Immediate action required to prevent service disruption.',
    timestamp: mins(3),
    read: false,
  },
  {
    id: '2',
    type: 'security',
    priority: 'critical',
    title: 'Multiple Failed Login Attempts Detected',
    message: '47 failed login attempts from IP 102.89.45.xx in the last 10 minutes. Auto-ban threshold triggered.',
    timestamp: mins(8),
    read: false,
  },
  {
    id: '3',
    type: 'ai_alert',
    priority: 'high',
    title: 'Gemini API Rate Limit Warning',
    message: 'Gemini Pro API usage at 85% of daily quota. Consider enabling Claude fallback to maintain tutor availability.',
    timestamp: mins(22),
    read: false,
  },
  {
    id: '4',
    type: 'system_alert',
    priority: 'high',
    title: 'Redis Cache Memory Alert',
    message: 'Redis memory usage has exceeded 80%. Session caching may degrade. Consider increasing memory allocation.',
    timestamp: mins(45),
    read: false,
  },
  {
    id: '5',
    type: 'user_activity',
    priority: 'high',
    title: 'New Instructor Registration Pending',
    message: 'Mary Wanjiku has applied as an instructor specialising in CBC Mathematics (Grade 4-6). Requires verification.',
    timestamp: hours(1),
    read: false,
  },
  {
    id: '6',
    type: 'content_update',
    priority: 'medium',
    title: 'Course Published: CBC English Grade 5',
    message: 'Instructor James Ochieng published "English Language Arts - Term 2" with 24 lessons and 6 assessments.',
    timestamp: hours(2),
    read: false,
  },
  {
    id: '7',
    type: 'ai_alert',
    priority: 'medium',
    title: 'AI Tutor Performance Dip Detected',
    message: 'Student satisfaction scores for AI tutor "Ndege" dropped 12% in Science sessions over the past 24 hours.',
    timestamp: hours(3),
    read: true,
  },
  {
    id: '8',
    type: 'user_activity',
    priority: 'medium',
    title: 'Parent Account Linked 3 Students',
    message: 'Grace Kamau linked students Amani, Baraka, and Imani to her parent account. All in Grade 3-5.',
    timestamp: hours(4),
    read: true,
  },
  {
    id: '9',
    type: 'security',
    priority: 'medium',
    title: 'SSL Certificate Renewal in 14 Days',
    message: 'The TLS certificate for api.urbanhomeschool.co.ke expires on March 1st. Auto-renewal is configured.',
    timestamp: hours(5),
    read: false,
  },
  {
    id: '10',
    type: 'content_update',
    priority: 'medium',
    title: 'Assessment Results: Grade 6 Mathematics',
    message: '132 students completed the Term 1 assessment. Average score: 72%. 18 students flagged for remedial support.',
    timestamp: hours(6),
    read: true,
  },
  {
    id: '11',
    type: 'system_alert',
    priority: 'medium',
    title: 'Backup Completed Successfully',
    message: 'Nightly database backup completed. Size: 2.4 GB. Uploaded to offsite storage. Retention: 30 days.',
    timestamp: hours(8),
    read: true,
  },
  {
    id: '12',
    type: 'user_activity',
    priority: 'low',
    title: 'Partner Organisation Onboarded',
    message: 'Elimu Foundation has been verified as a partner organisation. 5 sponsored student slots allocated.',
    timestamp: hours(10),
    read: true,
  },
  {
    id: '13',
    type: 'ai_alert',
    priority: 'low',
    title: 'ElevenLabs Voice Usage Report',
    message: 'Monthly voice synthesis: 12,450 requests (62% of quota). Most used voice: "Amara" for Swahili lessons.',
    timestamp: hours(14),
    read: true,
  },
  {
    id: '14',
    type: 'content_update',
    priority: 'low',
    title: 'New Learning Resources Uploaded',
    message: '8 new PDF worksheets and 3 video lessons added to the Grade 4 Kiswahili course by instructor team.',
    timestamp: days(1),
    read: true,
  },
  {
    id: '15',
    type: 'security',
    priority: 'low',
    title: 'Quarterly Security Audit Reminder',
    message: 'Scheduled security audit for Q1 2026 is due next week. Previous audit found 0 critical vulnerabilities.',
    timestamp: days(1),
    read: true,
  },
  {
    id: '16',
    type: 'user_activity',
    priority: 'low',
    title: 'Staff Member Role Updated',
    message: 'Daniel Mwangi role changed from Support Agent to Content Moderator by admin@urbanhomeschool.co.ke.',
    timestamp: days(2),
    read: true,
  },
  {
    id: '17',
    type: 'system_alert',
    priority: 'low',
    title: 'Scheduled Maintenance Window',
    message: 'Server maintenance planned for Sunday 02:00-04:00 EAT. Expected downtime: 15 minutes for OS patching.',
    timestamp: days(2),
    read: true,
  },
  {
    id: '18',
    type: 'ai_alert',
    priority: 'medium',
    title: 'New AI Model Available: Claude 4',
    message: 'Anthropic released Claude 4. Consider adding it to the orchestrator for improved creative and reasoning tasks.',
    timestamp: days(3),
    read: true,
  },
];

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Derived counts
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // Filtered + sorted
  const sortedNotifications = useMemo(() => {
    let filtered = notifications;
    if (filterType !== 'all') {
      filtered = notifications.filter((n) => n.type === filterType);
    }
    return [...filtered].sort((a, b) => {
      // Unread first, then by priority, then by time
      if (a.read !== b.read) return a.read ? 1 : -1;
      const pDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (pDiff !== 0) return pDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [notifications, filterType]);

  // Actions
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-[#E40000]" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1 px-2.5 py-0.5 text-sm font-semibold rounded-full bg-[#E40000] text-white">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Stay on top of platform events and alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">
                {filterType === 'all' ? 'All Types' : TYPE_CONFIG[filterType].label}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showFilterDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilterDropdown(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-1 z-20 w-52 bg-[#1E2328] border border-[#333] rounded-lg shadow-xl overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#22272B] transition-colors ${
                      filterType === 'all' ? 'text-white bg-[#22272B]' : 'text-white/60'
                    }`}
                  >
                    All Types
                  </button>
                  {(Object.keys(TYPE_CONFIG) as NotificationType[]).map((type) => {
                    const cfg = TYPE_CONFIG[type];
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          setFilterType(type);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm hover:bg-[#22272B] transition-colors ${
                          filterType === type ? 'text-white bg-[#22272B]' : 'text-white/60'
                        }`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </div>

          {/* Mark all as read */}
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TYPE_CONFIG) as NotificationType[]).map((type) => {
          const cfg = TYPE_CONFIG[type];
          const count = notifications.filter((n) => n.type === type).length;
          const unread = notifications.filter((n) => n.type === type && !n.read).length;
          return (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filterType === type
                  ? `${cfg.bgColor} ${cfg.color} ${cfg.borderColor}`
                  : 'bg-[#22272B] border-[#333] text-white/50 hover:text-white/70 hover:border-[#444]'
              }`}
            >
              {cfg.icon}
              {cfg.label}
              <span className="opacity-60">{count}</span>
              {unread > 0 && (
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#E40000] text-white text-[10px] font-bold">
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications list */}
      {sortedNotifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#181C1F] border border-[#22272B] rounded-xl p-12 text-center"
        >
          <Bell className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">No notifications</h3>
          <p className="text-white/50 text-sm">
            {filterType !== 'all'
              ? `No ${TYPE_CONFIG[filterType].label.toLowerCase()} notifications found.`
              : 'You are all caught up.'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <AnimatePresence mode="popLayout">
            {sortedNotifications.map((notification) => {
              const cfg = TYPE_CONFIG[notification.type];
              const badge = PRIORITY_BADGE[notification.priority];

              return (
                <motion.div
                  key={notification.id}
                  variants={itemVariants}
                  exit="exit"
                  layout
                  className={`group relative bg-[#181C1F] border rounded-xl overflow-hidden transition-colors ${
                    notification.read
                      ? 'border-[#22272B] opacity-60 hover:opacity-80'
                      : `border-l-4 ${cfg.borderColor} border-t-[#22272B] border-r-[#22272B] border-b-[#22272B]`
                  }`}
                >
                  <div className="flex items-start gap-4 p-4 sm:p-5">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${cfg.bgColor}`}
                    >
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3
                          className={`text-sm font-semibold ${
                            notification.read ? 'text-white/70' : 'text-white'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${cfg.bgColor} ${cfg.color}`}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p
                        className={`text-sm leading-relaxed ${
                          notification.read ? 'text-white/40' : 'text-white/60'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-xs text-white/30">
                          {timeAgo(notification.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 rounded-lg hover:bg-[#22272B] text-white/40 hover:text-green-400 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 rounded-lg hover:bg-[#22272B] text-white/40 hover:text-red-400 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Unread dot */}
                    {!notification.read && (
                      <div className="absolute top-4 right-4 sm:hidden">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#E40000]" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default AdminNotificationsPage;
