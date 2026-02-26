import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Users,
  CreditCard,
  Settings,
  ArrowRight,
  Inbox,
  Info,
} from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type NotificationType = 'sponsorship' | 'billing' | 'system' | 'general';
type FilterTab = 'all' | 'unread' | 'sponsorship' | 'billing' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
}

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'sponsorship',
      title: 'New Student Enrolled',
      message: 'Amara Ochieng has been successfully enrolled in the STEM Excellence Program. Parent consent received.',
      timestamp: '5 minutes ago',
      read: false,
      actionLabel: 'View Student',
    },
    {
      id: '2',
      type: 'billing',
      title: 'Payment Processed',
      message: 'Your monthly payment of KSh 845,000 for February 2026 has been successfully processed via bank transfer.',
      timestamp: '2 hours ago',
      read: false,
      actionLabel: 'View Receipt',
    },
    {
      id: '3',
      type: 'system',
      title: 'New Feature Available',
      message: 'AI-powered Student Insights is now available on your dashboard. View detailed analytics for all sponsored students.',
      timestamp: '6 hours ago',
      read: false,
      actionLabel: 'Explore Feature',
    },
    {
      id: '4',
      type: 'sponsorship',
      title: 'Student Progress Alert',
      message: 'David Mutua in Individual Scholarship program has shown declining engagement over the past 2 weeks. Intervention recommended.',
      timestamp: '1 day ago',
      read: true,
      actionLabel: 'View Details',
    },
    {
      id: '5',
      type: 'billing',
      title: 'Invoice Available',
      message: 'Your January 2026 invoice is ready for download. Total amount: KSh 815,000.',
      timestamp: '3 days ago',
      read: true,
      actionLabel: 'Download Invoice',
    },
    {
      id: '6',
      type: 'system',
      title: 'Scheduled Maintenance',
      message: 'Platform maintenance scheduled for Feb 20, 2026, 2:00 AM - 4:00 AM EAT. Some features may be temporarily unavailable.',
      timestamp: '4 days ago',
      read: true,
    },
    {
      id: '7',
      type: 'sponsorship',
      title: 'Monthly Impact Report Ready',
      message: 'Your January 2026 impact report is ready. 189 students showed improvement across your sponsorship programs.',
      timestamp: '5 days ago',
      read: false,
      actionLabel: 'View Report',
    },
    {
      id: '8',
      type: 'general',
      title: 'Partner Webinar Invitation',
      message: 'You are invited to "Maximizing Student Engagement Through Sponsorship" webinar on Feb 25, 2026 at 2:00 PM EAT.',
      timestamp: '1 week ago',
      read: true,
      actionLabel: 'RSVP',
    },
  ]);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'sponsorship', label: 'Sponsorship' },
    { key: 'billing', label: 'Billing' },
    { key: 'system', label: 'System' },
  ];

  const getTypeConfig = (type: NotificationType) => {
    const config: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
      sponsorship: { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
      billing: { icon: CreditCard, color: 'text-green-400', bg: 'bg-green-500/10' },
      system: { icon: Settings, color: 'text-purple-400', bg: 'bg-purple-500/10' },
      general: { icon: Info, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    };
    return config[type];
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.read;
    return notif.type === activeTab;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10 relative">
                <Bell className="w-6 h-6 text-red-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-[#E40000] text-gray-900 dark:text-white text-[10px] font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                <p className="text-gray-500 dark:text-white/60">{unreadCount} unread notifications</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] transition-colors text-sm"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All Read
              </button>
            )}
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-[#E40000] text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#22272B]'
                }`}
              >
                {tab.label}
                {tab.key === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notification List */}
        {filteredNotifications.length > 0 ? (
          <motion.div variants={stagger} className="space-y-2">
            {filteredNotifications.map((notif) => {
              const typeConfig = getTypeConfig(notif.type);
              const Icon = typeConfig.icon;

              return (
                <motion.div
                  key={notif.id}
                  variants={fadeUp}
                  onClick={() => handleMarkRead(notif.id)}
                  className={`bg-white dark:bg-[#181C1F] border rounded-xl p-4 cursor-pointer transition-colors hover:border-[#E40000]/30 ${
                    notif.read ? 'border-gray-200 dark:border-[#22272B]' : 'border-[#E40000]/20 bg-white dark:bg-[#181C1F]/80'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg ${typeConfig.bg} flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-5 h-5 ${typeConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-semibold ${notif.read ? 'text-gray-700 dark:text-white/80' : 'text-gray-900 dark:text-white'}`}>
                            {notif.title}
                          </h3>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-gray-400 dark:text-white/40 flex-shrink-0">{notif.timestamp}</span>
                      </div>
                      <p className={`text-sm leading-relaxed mb-3 ${notif.read ? 'text-gray-500 dark:text-white/50' : 'text-gray-600 dark:text-white/70'}`}>
                        {notif.message}
                      </p>
                      {notif.actionLabel && (
                        <button className="inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300 transition-colors">
                          {notif.actionLabel}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div variants={fadeUp}>
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <Inbox className="w-12 h-12 text-gray-400 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No notifications</h3>
              <p className="text-sm text-gray-500 dark:text-white/60">
                {activeTab === 'unread'
                  ? "You're all caught up! No unread notifications."
                  : 'No notifications in this category yet.'}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default NotificationsPage;
