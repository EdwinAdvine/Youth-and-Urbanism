/**
 * Add-ons & Extras Page
 *
 * Displays available add-ons for purchase, active add-ons,
 * and M-Pesa payment flow with STK push and status polling.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowLeft, RefreshCw, Check, X, Phone,
  Loader2, ShoppingCart, CheckCircle,
} from 'lucide-react';
import {
  getAvailableAddons,
  initiateMpesaPayment,
  checkMpesaStatus,
} from '../../services/parentFinanceService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_months: number;
  features: string[];
  is_purchased: boolean;
}

interface AddOnsData {
  addons: AddOn[];
  active_addons: string[];
}

const AddonsPage: React.FC = () => {
  const navigate = useNavigate();
  const [addonsData, setAddonsData] = useState<AddOnsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<AddOn | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStep, setPaymentStep] = useState<'input' | 'processing' | 'success' | 'failed'>('input');
  const [, setCheckoutId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadAddons();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const loadAddons = async () => {
    try {
      setLoading(true);
      const data = await getAvailableAddons();
      setAddonsData(data);
    } catch (error) {
      console.error('Failed to load add-ons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseClick = (addon: AddOn) => {
    setSelectedAddon(addon);
    setPaymentStep('input');
    setPhoneNumber('');
    setCheckoutId(null);
    setShowPaymentModal(true);
  };

  const handleInitiatePayment = async () => {
    if (!selectedAddon || !phoneNumber) return;

    try {
      setPaymentStep('processing');

      // Initiate STK push
      const result = await initiateMpesaPayment({
        phone_number: phoneNumber,
        amount: selectedAddon.price,
        account_reference: `ADDON-${selectedAddon.id}`,
        transaction_desc: `Purchase ${selectedAddon.name}`,
      });

      setCheckoutId(result.checkout_request_id);

      // Start polling for status
      pollRef.current = setInterval(async () => {
        try {
          const status = await checkMpesaStatus(result.checkout_request_id);
          if (status.status === 'completed') {
            setPaymentStep('success');
            if (pollRef.current) clearInterval(pollRef.current);
            await loadAddons();
          } else if (status.status === 'failed' || status.status === 'cancelled') {
            setPaymentStep('failed');
            if (pollRef.current) clearInterval(pollRef.current);
          }
        } catch {
          // Continue polling on error
        }
      }, 3000);

      // Stop polling after 2 minutes
      setTimeout(() => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          // Use functional update to avoid stale closure
          setPaymentStep((current) => current === 'processing' ? 'failed' : current);
        }
      }, 120000);
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      setPaymentStep('failed');
    }
  };

  const closeModal = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setShowPaymentModal(false);
    setSelectedAddon(null);
    setCheckoutId(null);
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
                <Sparkles className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add-ons & Extras</h1>
                <p className="text-gray-500 dark:text-white/60 mt-1">
                  Enhance your family's learning experience
                </p>
              </div>
            </div>
            <button
              onClick={loadAddons}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Active Add-ons */}
        {addonsData && addonsData.active_addons.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Active Add-ons</h3>
            <div className="flex flex-wrap gap-2">
              {addonsData.active_addons.map((addonId) => {
                const addon = addonsData.addons.find((a) => a.id === addonId);
                return (
                  <div
                    key={addonId}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 text-sm rounded-full"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {addon?.name || addonId}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Add-on Cards Grid */}
        {addonsData && addonsData.addons.length > 0 ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {addonsData.addons.map((addon) => (
              <motion.div
                key={addon.id}
                variants={fadeUp}
                className={`bg-gray-100 dark:bg-[#22272B] border rounded-xl p-6 transition-colors ${
                  addon.is_purchased
                    ? 'border-green-500/30'
                    : 'border-gray-200 dark:border-[#22272B] hover:border-[#E40000]/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{addon.name}</h3>
                  {addon.is_purchased && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-gray-500 dark:text-white/60 text-sm mb-4">{addon.description}</p>

                <ul className="space-y-1.5 mb-4">
                  {addon.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-white/80">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#181C1F]">
                  <div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      KES {addon.price.toLocaleString()}
                    </span>
                    <span className="text-gray-400 dark:text-white/40 text-xs">
                      /{addon.duration_months} mo
                    </span>
                  </div>
                  <button
                    onClick={() => handlePurchaseClick(addon)}
                    disabled={addon.is_purchased}
                    className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                      addon.is_purchased
                        ? 'bg-white dark:bg-[#181C1F] text-gray-400 dark:text-white/40 cursor-not-allowed'
                        : 'bg-[#E40000] text-gray-900 dark:text-white hover:bg-[#C00]'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {addon.is_purchased ? 'Owned' : 'Purchase'}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No add-ons available
              </h3>
              <p className="text-gray-500 dark:text-white/60 text-sm">
                Check back later for new add-ons and extras.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* M-Pesa Payment Modal */}
      {showPaymentModal && selectedAddon && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {paymentStep === 'input' && 'M-Pesa Payment'}
                {paymentStep === 'processing' && 'Processing Payment'}
                {paymentStep === 'success' && 'Payment Successful'}
                {paymentStep === 'failed' && 'Payment Failed'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentStep === 'input' && (
              <>
                <div className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-500 dark:text-white/60">Purchasing</p>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedAddon.name}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    KES {selectedAddon.price.toLocaleString()}
                  </p>
                </div>
                <label className="block text-sm text-gray-500 dark:text-white/60 mb-2">M-Pesa Phone Number</label>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-lg p-3 mb-4 focus-within:border-[#E40000]">
                  <Phone className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="254712345678"
                    className="bg-transparent text-gray-900 dark:text-white text-sm flex-1 outline-none placeholder:text-gray-400 dark:placeholder:text-white/30"
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-white/40 mb-4">
                  Enter your phone number in the format 254XXXXXXXXX
                </p>
                <button
                  onClick={handleInitiatePayment}
                  disabled={!phoneNumber || phoneNumber.length < 12}
                  className="w-full py-3 bg-[#E40000] text-gray-900 dark:text-white font-medium rounded-lg hover:bg-[#C00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pay with M-Pesa
                </button>
              </>
            )}

            {paymentStep === 'processing' && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-[#E40000] animate-spin mx-auto mb-4" />
                <p className="text-gray-900 dark:text-white font-medium mb-2">
                  Check your phone for the M-Pesa prompt
                </p>
                <p className="text-gray-500 dark:text-white/60 text-sm">
                  Enter your M-Pesa PIN to complete the payment.
                </p>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-gray-900 dark:text-white font-medium mb-2">Payment Successful!</p>
                <p className="text-gray-500 dark:text-white/60 text-sm mb-6">
                  {selectedAddon.name} has been activated on your account.
                </p>
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
                >
                  Done
                </button>
              </div>
            )}

            {paymentStep === 'failed' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-gray-900 dark:text-white font-medium mb-2">Payment Failed</p>
                <p className="text-gray-500 dark:text-white/60 text-sm mb-6">
                  The payment could not be processed. Please try again.
                </p>
                <button
                  onClick={() => setPaymentStep('input')}
                  className="px-6 py-2.5 bg-[#E40000] text-gray-900 dark:text-white text-sm rounded-lg hover:bg-[#C00] transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default AddonsPage;
