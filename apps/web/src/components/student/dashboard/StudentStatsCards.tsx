import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  path: string;
}

interface StudentStatsCardsProps {
  stats: StatCard[];
}

const StudentStatsCards: React.FC<StudentStatsCardsProps> = ({ stats }) => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <button
          key={index}
          onClick={() => navigate(stat.path)}
          className={`p-6 bg-gradient-to-br ${stat.color} ${borderRadius} border border-gray-200 dark:border-white/10
            hover:scale-105 transition-transform duration-200 text-left`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-gray-200 dark:bg-white/20 rounded-lg">
              {stat.icon}
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
          <div className="text-sm text-gray-700 dark:text-white/80">{stat.title}</div>
        </button>
      ))}
    </div>
  );
};

export default StudentStatsCards;
