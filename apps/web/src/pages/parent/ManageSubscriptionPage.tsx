/**
 * Manage Subscription Page
 *
 * Displays available plans, allows upgrade/downgrade with
 * confirmation, and provides pause/resume subscription controls.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings, ArrowLeft, Check, Star, RefreshCw, Pause, Play,
  X, AlertCircle,
} from 'lucide-react';
import {
  getAvailablePlans,
  changeSubscription,
  pauseSubscription,
  resumeSubscription,
} from '../../services/parentFinanceService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
  max_children: number;
  is_popular: boolean;
  is_current: boolean;
}

interface PlansData {
  plans: Plan[];
  current_plan_id: string | null;
}

const ManageSubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [plansData, setPlansData] = useState<PlansData | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getAvailablePlans();
      setPlansData(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    if (plan.is_current) return;
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  };

  const handleConfirmChange = async () => {
    if (!selectedPlan) return;
    try {
      setActionLoading(true);
      await changeSubscription({
        new_plan_id: selectedPlan.id,
        billing_cycle: billingCycle,
      });
      await loadPlans();
      setShowConfirmModal(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Failed to change subscription:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setActionLoading(true);
      await pauseSubscription({ reason: pauseReason });
      setShowPauseModal(false);
      setPauseReason('');
      await loadPlans();
    } catch (error) {
      console.error('Failed to pause subscription:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setActionLoading(true);
      await resumeSubscription();
      await loadPlans();
    } catch (error) {
      console.error('Failed to resume subscription:', error);
    } finally {
      setActionLoading(false);
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
          onClick={() => navigate('/dashboard/parent/finance/subscription')}
          className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Subscription</span>
        </button>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Subscription</h1>
              <p className="text-gray-500 dark:text-white/60 mt-1">
                Choose the best plan for your family
              </p>
            </div>
          </div>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/50'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingCycle === 'annual' ? 'bg-[#E40000]' : 'bg-gray-100 dark:bg-[#22272B]'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/50'}`}>
              Annual
            </span>
            {billingCycle === 'annual' && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </motion.div>

        {/* Plans Grid */}
        {plansData && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {plansData.plans.map((plan) => {
              const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_annual;
              return (
                <motion.div
                  key={plan.id}
                  variants={fadeUp}
                  className={`relative bg-gray-100 dark:bg-[#22272B] border rounded-xl p-6 transition-all ${
                    plan.is_current
                      ? 'border-[#E40000] ring-1 ring-[#E40000]'
                      : plan.is_popular
                      ? 'border-yellow-500/50'
                      : 'border-gray-200 dark:border-[#22272B] hover:border-[#E40000]/50'
                  }`}
                >
                  {plan.is_current && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#E40000] text-gray-900 dark:text-white text-xs font-medium rounded-full">
                      Current
                    </div>
                  )}
                  {plan.is_popular && !plan.is_current && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-yellow-500 text-black text-xs font-medium rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Popular
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                  <p className="text-gray-500 dark:text-white/50 text-xs mb-4">{plan.description}</p>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      KES {price.toLocaleString()}
                    </span>
                    <span className="text-gray-500 dark:text-white/50 text-sm">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 dark:text-white/40 mb-4">
                    Up to {plan.max_children} child{plan.max_children !== 1 ? 'ren' : ''}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-white/80">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={plan.is_current}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      plan.is_current
                        ? 'bg-white dark:bg-[#181C1F] text-gray-400 dark:text-white/40 cursor-not-allowed'
                        : 'bg-[#E40000] text-gray-900 dark:text-white hover:bg-[#C00]'
                    }`}
                  >
                    {plan.is_current ? 'Current Plan' : 'Select'}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Pause / Resume Section */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Pause or Resume Subscription
            </h3>
            <p className="text-gray-500 dark:text-white/60 text-sm mb-4">
              Need a break? Pause your subscription and resume anytime without losing your data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPauseModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg hover:bg-yellow-500/30 transition-colors"
              >
                <Pause className="w-4 h-4" />
                Pause Subscription
              </button>
              <button
                onClick={handleResume}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition-colors"
              >
                <Play className="w-4 h-4" />
                Resume Subscription
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirm Change Modal */}
      {showConfirmModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Plan Change</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-start gap-3 mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 dark:text-white/80">
                You are switching to <span className="font-semibold text-gray-900 dark:text-white">{selectedPlan.name}</span>{' '}
                ({billingCycle}). Changes will take effect at the end of your current billing period.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmChange}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-[#E40000] text-gray-900 dark:text-white text-sm rounded-lg hover:bg-[#C00] transition-colors disabled:opacity-50"
              >
                {actionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pause Subscription</h3>
              <button
                onClick={() => setShowPauseModal(false)}
                className="text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-white/60 mb-4">
              Tell us why you would like to pause. This helps us improve.
            </p>
            <textarea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              placeholder="Reason for pausing (optional)..."
              className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-900 dark:text-white text-sm rounded-lg p-3 mb-4 resize-none h-24 focus:outline-none focus:border-[#E40000]"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowPauseModal(false)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePause}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-yellow-500 text-black text-sm font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                {actionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Pause Now'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ManageSubscriptionPage;
