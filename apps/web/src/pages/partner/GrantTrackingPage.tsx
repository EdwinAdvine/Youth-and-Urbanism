import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  Calendar,
  Building2,
  TrendingUp,
  Filter,
} from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Grant {
  id: string;
  name: string;
  funder: string;
  amount: number;
  utilized: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'completed';
  description: string;
}

const GrantTrackingPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const grants: Grant[] = [
    {
      id: '1',
      name: 'Digital Education for Rural Kenya',
      funder: 'USAID Kenya',
      amount: 2500000,
      utilized: 1750000,
      startDate: 'Jan 2025',
      endDate: 'Dec 2026',
      status: 'active',
      description:
        'Providing digital learning devices and internet access to rural schools across 5 counties in Kenya.',
    },
    {
      id: '2',
      name: 'STEM Girls Empowerment Program',
      funder: 'UN Women',
      amount: 1500000,
      utilized: 900000,
      startDate: 'Mar 2025',
      endDate: 'Feb 2027',
      status: 'active',
      description:
        'Empowering girls through STEM education, mentorship, and access to technology resources.',
    },
    {
      id: '3',
      name: 'Early Childhood Learning Initiative',
      funder: 'World Bank',
      amount: 1200000,
      utilized: 1200000,
      startDate: 'Jun 2024',
      endDate: 'May 2025',
      status: 'completed',
      description:
        'Developing age-appropriate digital content and training teachers in early childhood education methodologies.',
    },
    {
      id: '4',
      name: 'Teacher Training Technology Fund',
      funder: 'British Council',
      amount: 800000,
      utilized: 0,
      startDate: 'Apr 2026',
      endDate: 'Mar 2027',
      status: 'pending',
      description:
        'Training 200 teachers in EdTech tools and methodologies for blended learning environments.',
    },
  ];

  const stats = [
    {
      label: 'Active Grants',
      value: '3',
      icon: FileText,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Total Received',
      value: 'KES 5,200,000',
      icon: DollarSign,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Pending Applications',
      value: '2',
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    const icons = {
      active: CheckCircle,
      pending: Clock,
      completed: CheckCircle,
    };
    const Icon = icons[status as keyof typeof icons];
    return (
      <span
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles]
        }`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const getUtilization = (utilized: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((utilized / total) * 100);
  };

  const filteredGrants = grants.filter((grant) => {
    return statusFilter === 'all' || grant.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Grant Tracking</h1>
          <p className="text-gray-500 dark:text-white/60">Track grants, donations, and funding applications</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {stats.map((stat, index) => (
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
              <p className="text-xs text-gray-500 dark:text-white/50">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filter */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4 text-gray-400 dark:text-white/40" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </motion.div>

        {/* Grant Cards */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
          {filteredGrants.map((grant) => {
            const utilization = getUtilization(grant.utilized, grant.amount);
            return (
              <motion.div
                key={grant.id}
                variants={fadeUp}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 hover:border-gray-200 dark:hover:border-[#2A2F34] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{grant.name}</h3>
                      {getStatusBadge(grant.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-white/70 mb-3">{grant.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-white/40 mb-1">Grant Amount</p>
                    <p className="text-gray-900 dark:text-white font-semibold">{formatCurrency(grant.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-white/40 mb-1">Utilized</p>
                    <p className="text-gray-900 dark:text-white font-semibold">{formatCurrency(grant.utilized)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-white/40 mb-1">Funder</p>
                    <p className="text-gray-900 dark:text-white font-medium flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 dark:text-white/40" />
                      {grant.funder}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-white/40 mb-1">Duration</p>
                    <p className="text-gray-900 dark:text-white font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-white/40" />
                      {grant.startDate} - {grant.endDate}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-white/70 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      Utilization
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">{utilization}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        utilization >= 90
                          ? 'bg-red-500'
                          : utilization >= 75
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default GrantTrackingPage;
