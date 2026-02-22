/**
 * Subscription Page
 *
 * Shows the parent's current subscription plan, usage stats,
 * billing cycle, and quick actions to manage the plan.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard, ArrowLeft, Users, HardDrive, Sparkles,
  Calendar, ChevronRight, RefreshCw,
} from 'lucide-react';
import { getCurrentSubscription } from '../../services/parentFinanceService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface SubscriptionData {
  plan_id: string;
  plan_name: string;
  status: string;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  next_billing_date: string | null;
  amount: number;
  children_count: number;
  max_children: number;
  auto_renew: boolean;
  payment_method: string;
  storage_used_gb?: number;
  storage_limit_gb?: number;
  ai_queries_used?: number;
  ai_queries_limit?: number;
}

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await getCurrentSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (planName: string) => {
    const lower = planName.toLowerCase();
    if (lower.includes('enterprise')) return 'bg-purple-500/20 text-purple-400';
    if (lower.includes('premium')) return 'bg-yellow-500/20 text-yellow-400';
    if (lower.includes('basic')) return 'bg-blue-500/20 text-blue-400';
    return 'bg-gray-500/20 text-gray-400';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled':
      case 'expired':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/parent')}
          className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </button>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Current Plan</h1>
                <p className="text-gray-500 dark:text-white/60 mt-1">
                  Manage your subscription and billing
                </p>
              </div>
            </div>
            <button
              onClick={loadSubscription}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {subscription ? (
          <>
            {/* Current Subscription Card */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {subscription.plan_name}
                      </h2>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getTierBadge(subscription.plan_name)}`}>
                        {subscription.plan_name.split(' ')[0]}
                      </span>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      KES {subscription.amount.toLocaleString()}
                    </p>
                    <p className="text-gray-500 dark:text-white/60 text-sm capitalize">
                      /{subscription.billing_cycle}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white dark:bg-[#181C1F] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-white/60" />
                      <span className="text-sm text-gray-500 dark:text-white/60">Billing Cycle</span>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium capitalize">
                      {subscription.billing_cycle}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#181C1F] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-white/60" />
                      <span className="text-sm text-gray-500 dark:text-white/60">Next Payment</span>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {subscription.next_billing_date
                        ? new Date(subscription.next_billing_date).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#181C1F] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-4 h-4 text-gray-500 dark:text-white/60" />
                      <span className="text-sm text-gray-500 dark:text-white/60">Payment Method</span>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium capitalize">
                      {subscription.payment_method}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Usage Stats */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Usage</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-gray-500 dark:text-white/60 text-sm">Children Enrolled</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {subscription.children_count}{' '}
                    <span className="text-sm font-normal text-gray-400 dark:text-white/40">
                      / {subscription.max_children}
                    </span>
                  </p>
                  <div className="mt-2 w-full bg-white dark:bg-[#181C1F] rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (subscription.children_count / subscription.max_children) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <HardDrive className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-gray-500 dark:text-white/60 text-sm">Storage Used</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {subscription.storage_used_gb ?? 0} GB{' '}
                    <span className="text-sm font-normal text-gray-400 dark:text-white/40">/ {subscription.storage_limit_gb ?? 10} GB</span>
                  </p>
                  <div className="mt-2 w-full bg-white dark:bg-[#181C1F] rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((subscription.storage_used_gb ?? 0) / (subscription.storage_limit_gb || 10)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-gray-500 dark:text-white/60 text-sm">AI Queries Remaining</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(subscription.ai_queries_limit ?? 1000) - (subscription.ai_queries_used ?? 0)}{' '}
                    <span className="text-sm font-normal text-gray-400 dark:text-white/40">/ {(subscription.ai_queries_limit ?? 1000).toLocaleString()}</span>
                  </p>
                  <div className="mt-2 w-full bg-white dark:bg-[#181C1F] rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (((subscription.ai_queries_limit ?? 1000) - (subscription.ai_queries_used ?? 0)) / (subscription.ai_queries_limit || 1000)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <button
                onClick={() => navigate('/dashboard/parent/finance/manage')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#E40000] text-gray-900 dark:text-white font-medium rounded-lg hover:bg-[#C00] transition-colors"
              >
                Manage Plan
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </>
        ) : (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Active Subscription
              </h3>
              <p className="text-gray-500 dark:text-white/60 text-sm mb-6">
                Choose a plan to get started with Urban Home School.
              </p>
              <button
                onClick={() => navigate('/dashboard/parent/finance/manage')}
                className="px-6 py-3 bg-[#E40000] text-gray-900 dark:text-white font-medium rounded-lg hover:bg-[#C00] transition-colors"
              >
                View Plans
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default SubscriptionPage;
