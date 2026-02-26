import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
  Target,
  Percent,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface ProgramROI {
  id: string;
  name: string;
  investment: number;
  students: number;
  avgProgress: number;
  completionRate: number;
  costPerCompletion: number;
}

interface Comparison {
  metric: string;
  current: string;
  previous: string;
  change: number;
  isPositive: boolean;
}

const ROIMetricsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const kpiCards = [
    {
      label: 'Total Invested',
      value: 'KES 1,847,500',
      icon: DollarSign,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Students Supported',
      value: '247',
      icon: Users,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Avg Progress',
      value: '72%',
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Cost per Student',
      value: 'KES 7,480',
      icon: Target,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Completion Rate',
      value: '78%',
      icon: Percent,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'Engagement Rate',
      value: '85%',
      icon: Activity,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ];

  const programROI: ProgramROI[] = [
    {
      id: '1',
      name: 'STEM Excellence Program',
      investment: 637500,
      students: 85,
      avgProgress: 76,
      completionRate: 82,
      costPerCompletion: 9150,
    },
    {
      id: '2',
      name: 'Girls in Tech Initiative',
      investment: 375000,
      students: 62,
      avgProgress: 71,
      completionRate: 75,
      costPerCompletion: 8065,
    },
    {
      id: '3',
      name: 'Early Childhood Development',
      investment: 520000,
      students: 100,
      avgProgress: 68,
      completionRate: 70,
      costPerCompletion: 7429,
    },
  ];

  const comparisons: Comparison[] = [
    {
      metric: 'Completion Rate',
      current: '78%',
      previous: '72%',
      change: 8.3,
      isPositive: true,
    },
    {
      metric: 'Cost per Student',
      current: 'KES 7,480',
      previous: 'KES 8,150',
      change: -8.2,
      isPositive: true,
    },
    {
      metric: 'Avg Progress',
      current: '72%',
      previous: '65%',
      change: 10.8,
      isPositive: true,
    },
    {
      metric: 'Engagement Rate',
      current: '85%',
      previous: '88%',
      change: -3.4,
      isPositive: false,
    },
    {
      metric: 'Students Supported',
      current: '247',
      previous: '198',
      change: 24.7,
      isPositive: true,
    },
  ];

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">ROI Metrics</h1>
              <p className="text-gray-500 dark:text-white/60">Return on investment analytics for your programs</p>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
            >
              <option value="current">Current Term</option>
              <option value="last-term">Last Term</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {kpiCards.map((kpi, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{kpi.value}</p>
              <p className="text-xs text-gray-500 dark:text-white/50">{kpi.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ROI Trend Chart Placeholder */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">ROI Trend</h2>
              <BarChart3 className="w-5 h-5 text-gray-400 dark:text-white/40" />
            </div>
            <div className="h-64 flex items-center justify-center border border-dashed border-gray-200 dark:border-[#22272B] rounded-lg">
              <p className="text-gray-400 dark:text-white/40 text-sm">
                ROI trend chart - integrate with PartnerChart component
              </p>
            </div>
          </div>
        </motion.div>

        {/* Breakdown Table */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Program Breakdown</h2>
            <div className="overflow-x-auto">
              <div className="overflow-x-auto"><table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#22272B]">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">
                      Program
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">
                      Investment
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">
                      Students
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">
                      Avg Progress
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">
                      Completion Rate
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">
                      Cost per Completion
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {programROI.map((program) => (
                    <tr
                      key={program.id}
                      className="border-b border-gray-200 dark:border-[#22272B] hover:bg-gray-100 dark:hover:bg-[#22272B] transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{program.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {formatCurrency(program.investment)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{program.students}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${program.avgProgress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{program.avgProgress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${program.completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{program.completionRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {formatCurrency(program.costPerCompletion)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          </div>
        </motion.div>

        {/* vs Last Term Comparison */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">vs Last Term</h2>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {comparisons.map((comp, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg p-4"
                >
                  <p className="text-xs text-gray-400 dark:text-white/40 mb-2">{comp.metric}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{comp.current}</p>
                      <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Previous: {comp.previous}</p>
                    </div>
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        comp.isPositive
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {comp.isPositive ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {Math.abs(comp.change)}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ROIMetricsPage;
