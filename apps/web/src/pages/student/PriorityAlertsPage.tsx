import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Bell } from 'lucide-react';
import NotificationCard from '../../components/student/account/NotificationCard';

const alerts = [
  { title: 'Quiz in 30 minutes', message: 'Fractions & Decimals Quiz starts at 3:00 PM today', timeAgo: '5 min ago', type: 'warning' as const, isRead: false },
  { title: 'Assignment Due Tomorrow', message: 'Your Science Lab Report is due by 5:00 PM tomorrow', timeAgo: '1 hour ago', type: 'assignment' as const, isRead: false },
  { title: 'New Badge Earned!', message: "Congratulations! You've earned the 'Quiz Master' badge", timeAgo: '2 hours ago', type: 'achievement' as const, isRead: false },
  { title: 'Teacher Message', message: 'Ms. Wanjiku left feedback on your Math homework', timeAgo: '3 hours ago', type: 'message' as const, isRead: true },
];

const PriorityAlertsPage: React.FC = () => {
  useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Bell className="w-8 h-8 text-red-400" /> Priority Alerts
        </h1>
        <p className="text-gray-600 dark:text-white/70">Important notifications that need your attention</p>
      </div>

      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <NotificationCard key={i} {...alert} />
        ))}
      </div>
    </div>
  );
};

export default PriorityAlertsPage;
