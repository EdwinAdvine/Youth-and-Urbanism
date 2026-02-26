import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Calendar,
  AlertTriangle,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface ProgramBudget {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
}

interface BudgetAlert {
  id: string;
  type: 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

const BudgetManagementPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const topStats = [
    {
      label: 'Total Budget',
      value: 'KES 2,500,000',
      icon: Wallet,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      sub: 'FY 2025-2026',
    },
    {
      label: 'Spent',
      value: 'KES 1,847,500',
      icon: TrendingUp,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      sub: '73.9% utilized',
    },
    {
      label: 'Remaining',
      value: 'KES 652,500',
      icon: CreditCard,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      sub: '26.1% available',
    },
    {
      label: 'Next Payment',
      value: 'KES 185,000',
      icon: Calendar,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      sub: 'Due Mar 1, 2026',
    },
  ];

  const programBudgets: ProgramBudget[] = [
    {
      id: '1',
      name: 'STEM Excellence Program',
      allocated: 850000,
      spent: 637500,
      remaining: 212500,
    },
    {
      id: '2',
      name: 'Early Childhood Development',
      allocated: 650000,
      spent: 520000,
      remaining: 130000,
    },
    {
      id: '3',
      name: 'Girls in Tech Initiative',
      allocated: 500000,
      spent: 375000,
      remaining: 125000,
    },
    {
      id: '4',
      name: 'Rural Education Access',
      allocated: 350000,
      spent: 227500,
      remaining: 122500,
    },
    {
      id: '5',
      name: 'Operational & Admin',
      allocated: 150000,
      spent: 87500,
      remaining: 62500,
    },
  ];

  const alerts: BudgetAlert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'Budget 74% utilized',
      description:
        'Your total budget utilization has reached 74%. Consider reviewing program allocations to ensure funds last through the fiscal year.',
      timestamp: 'Feb 14, 2026',
    },
    {
      id: '2',
      type: 'info',
      title: 'Next payment due in 5 days',
      description:
        'A scheduled payment of KES 185,000 for STEM Excellence and Girls in Tech programs is due on March 1, 2026.',
      timestamp: 'Feb 14, 2026',
    },
  ];

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const getUtilization = (spent: number, allocated: number) => {
    return Math.round((spent / allocated) * 100);
  };

  const getUtilizationColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 75) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Budget Management</h1>
              <p className="text-gray-500 dark:text-white/60">Track allocations, spending, and upcoming payments</p>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
            >
              <option value="current">Current FY (2025-2026)</option>
              <option value="previous">Previous FY (2024-2025)</option>
            </select>
          </div>
        </motion.div>

        {/* Top Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {topStats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-white/50 mb-1">{stat.label}</p>
              <p className="text-xs text-gray-400 dark:text-white/40">{stat.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Budget Allocation */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Budget Allocation by Program</h2>
            <div className="space-y-5">
              {programBudgets.map((program) => {
                const utilization = getUtilization(program.spent, program.allocated);
                return (
                  <div key={program.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{program.name}</h3>
                      <span className="text-sm text-gray-600 dark:text-white/70">{utilization}% utilized</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getUtilizationColor(
                          utilization
                        )}`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-white/40">
                      <span>Allocated: {formatCurrency(program.allocated)}</span>
                      <span>Spent: {formatCurrency(program.spent)}</span>
                      <span>Remaining: {formatCurrency(program.remaining)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Monthly Spending Chart Placeholder */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Spending Trend</h2>
              <BarChart3 className="w-5 h-5 text-gray-400 dark:text-white/40" />
            </div>
            <div className="h-64 flex items-center justify-center border border-dashed border-gray-200 dark:border-[#22272B] rounded-lg">
              <p className="text-gray-400 dark:text-white/40 text-sm">
                Spending trend chart - integrate with PartnerChart component
              </p>
            </div>
          </div>
        </motion.div>

        {/* Budget Alerts */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Budget Alerts</h2>
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  variants={fadeUp}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    alert.type === 'warning'
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-blue-500/5 border-blue-500/20'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      alert.type === 'warning' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                    }`}
                  >
                    <AlertTriangle
                      className={`w-5 h-5 ${
                        alert.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{alert.title}</h3>
                      <span className="text-xs text-gray-400 dark:text-white/40">{alert.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-white/70">{alert.description}</p>
                  </div>
                  <button className="shrink-0 p-1 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BudgetManagementPage;
