import React from 'react';
import { TrendingUp, Award, Clock, CheckCircle } from 'lucide-react';

const MyPerformancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Performance</h1>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">87</p>
                <p className="text-xs text-gray-400 dark:text-white/40">Tasks Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">2.5h</p>
                <p className="text-xs text-gray-400 dark:text-white/40">Avg Response Time</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">94%</p>
                <p className="text-xs text-gray-400 dark:text-white/40">Quality Score</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                <p className="text-xs text-gray-400 dark:text-white/40">Achievements</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Trends</h2>
          <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-[#22272B]/30 rounded-lg">
            <p className="text-sm text-gray-400 dark:text-white/30">Performance chart visualization</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPerformancePage;
