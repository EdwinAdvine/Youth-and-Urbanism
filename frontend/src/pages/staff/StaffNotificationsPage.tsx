import React, { useState } from 'react';
import { Bell, Check, Trash2, Filter } from 'lucide-react';

const StaffNotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions'>('all');

  const notifications = [
    {
      id: '1',
      title: 'New ticket assigned',
      message: 'Ticket #1234 has been assigned to you',
      time: '5 minutes ago',
      isRead: false,
      type: 'assignment',
    },
    {
      id: '2',
      title: 'Content approved',
      message: 'Your content "Math Lesson 1" has been approved',
      time: '1 hour ago',
      isRead: true,
      type: 'success',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="mentions">Mentions</option>
            </select>
            <button className="p-2 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-white/5">
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                notif.isRead
                  ? 'bg-white dark:bg-[#181C1F] border-gray-200 dark:border-[#22272B]'
                  : 'bg-white dark:bg-[#181C1F] border-[#E40000]/30'
              }`}
            >
              <div className={`p-2 rounded-lg ${notif.isRead ? 'bg-gray-100 dark:bg-[#22272B]' : 'bg-[#E40000]/20'}`}>
                <Bell className={`w-4 h-4 ${notif.isRead ? 'text-gray-400 dark:text-white/40' : 'text-[#FF4444]'}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</h3>
                <p className="text-sm text-gray-500 dark:text-white/50 mt-0.5">{notif.message}</p>
                <p className="text-xs text-gray-400 dark:text-white/30 mt-1">{notif.time}</p>
              </div>
              <button className="p-1.5 text-gray-400 dark:text-white/30 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffNotificationsPage;
