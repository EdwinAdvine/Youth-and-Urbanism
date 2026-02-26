import React from 'react';
import { useUserStore } from '../../store';
import {
  BookOpen,
  Award,
  Wallet,
  Clock
} from 'lucide-react';

interface StatsCardsProps {
  onAction?: (action: string) => void;
}

const StatsCards: React.FC<StatsCardsProps> = ({ onAction }) => {
  const { courses, assignments, certificates, transactions } = useUserStore();
  
  // Calculate stats
  const activeCourses = courses.filter(c => c.status === 'in_progress').length;
  const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
  const totalCertificates = certificates.length;
  const walletBalance = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0) - 
    transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    {
      title: 'Active Courses',
      value: activeCourses,
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      action: 'view-courses'
    },
    {
      title: 'Assignments Due',
      value: pendingAssignments,
      icon: Clock,
      color: 'from-orange-500 to-red-500',
      action: 'view-assignments'
    },
    {
      title: 'Certificates Earned',
      value: totalCertificates,
      icon: Award,
      color: 'from-yellow-500 to-orange-500',
      action: 'view-certificates'
    },
    {
      title: 'Wallet Balance',
      value: `KES ${walletBalance.toLocaleString()}`,
      icon: Wallet,
      color: 'from-green-500 to-emerald-500',
      action: 'view-wallet'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, _index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="bg-gradient-to-br from-white dark:from-[#181C1F] to-[#22272B] border border-[#2A3035] rounded-xl p-6 hover:border-[#FF0000]/50 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
            onClick={() => onAction?.(stat.action)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-white/60 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
              </div>
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-gray-900 dark:text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-8 h-8" />
              </div>
            </div>
            
            {/* Decorative accent */}
            <div className={`w-full h-1 bg-gradient-to-r ${stat.color} rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;