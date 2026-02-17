// NotificationsPage - Authenticated page at /notifications. Shows all notifications grouped
// by type (courses, assignments, community, payments) with read/unread filtering and bulk actions.
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  ClipboardList,
  GraduationCap,
  MessageSquare,
  Users,
  Trophy,
  CreditCard,
  Eye,
  EyeOff,
  Trash2,
  CheckCheck,
  Filter,
  Loader2
} from 'lucide-react';

type NotificationType = 'assignment' | 'quiz' | 'course' | 'message' | 'forum' | 'achievement' | 'system' | 'payment';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

type FilterType = 'all' | 'unread' | 'read';

// Mock data generator
const generateMockNotifications = (): Notification[] => {
  const now = new Date();
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'quiz',
      title: 'Quiz Graded',
      message: "Your quiz 'Fractions and Decimals' has been graded. Score: 85%",
      timestamp: new Date(now.getTime() - 2 * 60 * 1000), // 2 minutes ago
      read: false,
      actionLabel: 'View Results',
      actionUrl: '/quizzes/1'
    },
    {
      id: '2',
      type: 'assignment',
      title: 'New Assignment',
      message: "New assignment: 'Essay on Photosynthesis' due in 3 days",
      timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      actionLabel: 'View Assignment',
      actionUrl: '/assignments/2'
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Certificate Earned',
      message: 'Congratulations! You earned a certificate for completing Grade 6 Math',
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      read: false,
      actionLabel: 'View Certificate',
      actionUrl: '/certificates'
    },
    {
      id: '4',
      type: 'forum',
      title: 'Forum Reply',
      message: "John Smith replied to your forum post 'Math Help'",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      actionLabel: 'View Post',
      actionUrl: '/forum/posts/123'
    },
    {
      id: '5',
      type: 'message',
      title: 'Instructor Message',
      message: 'Ms. Johnson sent you a message about your recent performance',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
      read: false,
      actionLabel: 'View Message',
      actionUrl: '/messages/5'
    },
    {
      id: '6',
      type: 'course',
      title: 'New Course Available',
      message: "New course published: 'Introduction to Computer Science'",
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
      read: true,
      actionLabel: 'Open Course',
      actionUrl: '/courses/12'
    },
    {
      id: '7',
      type: 'payment',
      title: 'Payment Successful',
      message: 'Payment of KES 5,000 for Term 1 fees received successfully',
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      read: true,
      actionLabel: 'View Receipt',
      actionUrl: '/payments/7'
    },
    {
      id: '8',
      type: 'assignment',
      title: 'Assignment Due Soon',
      message: "Reminder: 'History of Kenya' assignment due tomorrow",
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000), // Yesterday
      read: false,
      actionLabel: 'View Assignment',
      actionUrl: '/assignments/8'
    },
    {
      id: '9',
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Sunday, 2:00 AM - 4:00 AM EAT',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      actionLabel: undefined,
      actionUrl: undefined
    },
    {
      id: '10',
      type: 'quiz',
      title: 'New Quiz Available',
      message: "Your instructor posted a new quiz: 'Kenyan Wildlife'",
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000), // 2 days ago
      read: true,
      actionLabel: 'Take Quiz',
      actionUrl: '/quizzes/10'
    },
    {
      id: '11',
      type: 'achievement',
      title: 'Milestone Reached',
      message: 'You completed 10 quizzes this month! Keep up the great work!',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      actionLabel: 'View Progress',
      actionUrl: '/progress'
    },
    {
      id: '12',
      type: 'forum',
      title: 'New Forum Post',
      message: "Sarah Williams created a new post: 'Study Group for Math'",
      timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      read: true,
      actionLabel: 'View Post',
      actionUrl: '/forum/posts/456'
    },
    {
      id: '13',
      type: 'message',
      title: 'Parent Message',
      message: 'Your parent viewed your progress report',
      timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      read: true,
      actionLabel: undefined,
      actionUrl: undefined
    },
    {
      id: '14',
      type: 'course',
      title: 'Course Update',
      message: "New module added to 'Grade 6 Science': The Solar System",
      timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      read: true,
      actionLabel: 'View Module',
      actionUrl: '/courses/6'
    },
    {
      id: '15',
      type: 'assignment',
      title: 'Assignment Graded',
      message: "Your assignment 'Ecosystems and Biodiversity' has been graded: B+",
      timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      read: true,
      actionLabel: 'View Feedback',
      actionUrl: '/assignments/15'
    },
    {
      id: '16',
      type: 'payment',
      title: 'Payment Reminder',
      message: 'Term 2 fees payment due in 7 days',
      timestamp: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      read: true,
      actionLabel: 'Make Payment',
      actionUrl: '/payments'
    },
    {
      id: '17',
      type: 'quiz',
      title: 'Quiz Reminder',
      message: "Don't forget: Quiz on 'Grammar and Punctuation' closes in 2 days",
      timestamp: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
      read: true,
      actionLabel: 'Take Quiz',
      actionUrl: '/quizzes/17'
    },
    {
      id: '18',
      type: 'system',
      title: 'Welcome to Urban Home School',
      message: 'Welcome! Explore your courses and start learning today.',
      timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      read: true,
      actionLabel: 'Explore Courses',
      actionUrl: '/courses'
    },
    {
      id: '19',
      type: 'forum',
      title: 'Forum Activity',
      message: "Your post 'Help with Algebra' received 5 new replies",
      timestamp: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000), // 11 days ago
      read: true,
      actionLabel: 'View Post',
      actionUrl: '/forum/posts/789'
    },
    {
      id: '20',
      type: 'achievement',
      title: 'Perfect Score',
      message: "Outstanding! You scored 100% on 'Environmental Science Quiz'",
      timestamp: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      read: true,
      actionLabel: 'View Results',
      actionUrl: '/quizzes/20'
    },
    {
      id: '21',
      type: 'course',
      title: 'Course Completion',
      message: "You completed 'Grade 6 English Literature' - 100% progress",
      timestamp: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      read: true,
      actionLabel: 'View Certificate',
      actionUrl: '/certificates'
    },
    {
      id: '22',
      type: 'message',
      title: 'Feedback Received',
      message: 'Your instructor left feedback on your recent essay',
      timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      read: true,
      actionLabel: 'View Feedback',
      actionUrl: '/assignments/22'
    },
    {
      id: '23',
      type: 'system',
      title: 'New Features',
      message: 'Check out our new AI CoPilot feature for personalized learning!',
      timestamp: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      read: true,
      actionLabel: 'Learn More',
      actionUrl: '/copilot'
    },
    {
      id: '24',
      type: 'assignment',
      title: 'Assignment Posted',
      message: "New group assignment: 'Climate Change Research Project'",
      timestamp: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
      read: true,
      actionLabel: 'View Assignment',
      actionUrl: '/assignments/24'
    },
    {
      id: '25',
      type: 'achievement',
      title: 'Learning Streak',
      message: 'Amazing! You maintained a 30-day learning streak!',
      timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      read: true,
      actionLabel: 'View Stats',
      actionUrl: '/progress'
    }
  ];

  return notifications;
};

// Notification icon and color mapping
const getNotificationStyle = (type: NotificationType) => {
  const styles: Record<NotificationType, { icon: React.ComponentType<any>; color: string; bgColor: string }> = {
    assignment: { icon: BookOpen, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    quiz: { icon: ClipboardList, color: 'text-green-400', bgColor: 'bg-green-500/10' },
    course: { icon: GraduationCap, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    message: { icon: MessageSquare, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
    forum: { icon: Users, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    achievement: { icon: Trophy, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
    system: { icon: Bell, color: 'text-gray-400', bgColor: 'bg-gray-500/10' },
    payment: { icon: CreditCard, color: 'text-red-400', bgColor: 'bg-red-500/10' }
  };
  return styles[type];
};

// Format timestamp
const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
};

// Group notifications by time period
const groupNotifications = (notifications: Notification[]) => {
  const now = new Date();
  const groups: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Older: []
  };

  notifications.forEach((notification) => {
    const diffMs = now.getTime() - notification.timestamp.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      groups.Today.push(notification);
    } else if (diffDays === 1) {
      groups.Yesterday.push(notification);
    } else if (diffDays < 7) {
      groups['This Week'].push(notification);
    } else {
      groups.Older.push(notification);
    }
  });

  return groups;
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(generateMockNotifications());
      setLoading(false);
    }, 800);
  }, []);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.read);
    if (filter === 'read') return notifications.filter(n => n.read);
    return notifications;
  }, [notifications, filter]);

  // Group filtered notifications
  const groupedNotifications = useMemo(() => {
    return groupNotifications(filteredNotifications);
  }, [filteredNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Toggle read status
  const handleToggleRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: !n.read } : n
    ));
  };

  // Delete notification
  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleToggleRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Notifications</h1>
            <p className="text-gray-400">
              {unreadCount > 0 ? (
                <>
                  You have <span className="text-copilot-blue-400 font-semibold">{unreadCount}</span> unread notification{unreadCount > 1 ? 's' : ''}
                </>
              ) : (
                'All caught up!'
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-copilot-blue-500/10 hover:bg-copilot-blue-500/20 text-copilot-blue-400 rounded-lg transition-colors duration-200"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="font-medium">Mark all as read</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
            {(['all', 'unread', 'read'] as FilterType[]).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === filterType
                    ? 'bg-copilot-blue-500 text-gray-900 dark:text-white shadow-lg shadow-copilot-blue-500/20'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                {filterType === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-copilot-blue-400 text-gray-900 rounded-full text-xs font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-copilot-blue-400 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredNotifications.length === 0 && (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'unread' ? "You're all caught up!" : 'Check back later for updates'}
            </p>
          </div>
        )}

        {/* Notifications Timeline */}
        {!loading && filteredNotifications.length > 0 && (
          <div className="space-y-8">
            {Object.entries(groupedNotifications).map(([groupName, groupNotifications]) => {
              if (groupNotifications.length === 0) return null;

              return (
                <div key={groupName}>
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    {groupName}
                  </h2>
                  <div className="relative pl-6 border-l-2 border-gray-700 space-y-4">
                    {groupNotifications.map((notification) => {
                      const style = getNotificationStyle(notification.type);
                      const Icon = style.icon;

                      return (
                        <div
                          key={notification.id}
                          className={`relative group transition-all duration-200 ${
                            notification.read ? 'opacity-75' : ''
                          }`}
                        >
                          {/* Timeline dot */}
                          <div
                            className={`absolute -left-[29px] w-4 h-4 rounded-full border-2 border-gray-900 ${
                              notification.read ? 'bg-gray-700' : 'bg-copilot-blue-500 animate-pulse'
                            }`}
                          />

                          {/* Notification card */}
                          <div
                            className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border transition-all duration-200 cursor-pointer ${
                              notification.read
                                ? 'border-gray-700 hover:border-gray-600'
                                : 'border-copilot-blue-500/30 bg-copilot-blue-500/5 hover:border-copilot-blue-500/50'
                            } hover:shadow-lg hover:shadow-black/20`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-4">
                              {/* Icon */}
                              <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${style.bgColor} flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${style.color}`} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h3 className={`font-semibold ${notification.read ? 'text-gray-400 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                    {notification.title}
                                  </h3>
                                  <span className="text-xs text-gray-500 whitespace-nowrap">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-400 mb-3">{notification.message}</p>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                  {notification.actionLabel && notification.actionUrl && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleNotificationClick(notification);
                                      }}
                                      className="text-xs px-3 py-1.5 bg-copilot-blue-500 hover:bg-copilot-blue-600 text-gray-900 dark:text-white rounded-md font-medium transition-colors duration-200"
                                    >
                                      {notification.actionLabel}
                                    </button>
                                  )}

                                  <div className="flex-1" />

                                  {/* Toggle read/unread */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleRead(notification.id);
                                    }}
                                    className="p-1.5 text-gray-500 hover:text-copilot-blue-400 hover:bg-gray-700 rounded transition-colors duration-200"
                                    title={notification.read ? 'Mark as unread' : 'Mark as read'}
                                  >
                                    {notification.read ? (
                                      <EyeOff className="w-4 h-4" />
                                    ) : (
                                      <Eye className="w-4 h-4" />
                                    )}
                                  </button>

                                  {/* Delete */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(notification.id);
                                    }}
                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded transition-colors duration-200"
                                    title="Delete notification"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More (for pagination) */}
        {!loading && filteredNotifications.length >= 25 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors duration-200">
              Load More Notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
}
