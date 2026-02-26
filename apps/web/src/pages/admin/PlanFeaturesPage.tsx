/**
 * Plan Features Page
 *
 * Allows super admins to manage feature toggles for each subscription
 * plan — enabling, disabling, adding, or removing features.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings, ArrowLeft, RefreshCw, Plus, Trash2, ToggleLeft, ToggleRight,
} from 'lucide-react';
import planFeaturesService, {
  PlanFeature, AvailableFeature,
} from '../../services/admin/planFeaturesService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const PlanFeaturesPage: React.FC = () => {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const [planName, setPlanName] = useState('');
  const [features, setFeatures] = useState<PlanFeature[]>([]);
  const [available, setAvailable] = useState<AvailableFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedKey, setSelectedKey] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (planId) loadData();
  }, [planId]);

  const loadData = async () => {
    if (!planId) return;
    try {
      setLoading(true);
      const [planData, availData] = await Promise.all([
        planFeaturesService.getPlanFeatures(planId),
        planFeaturesService.getAvailableFeatures(),
      ]);
      setPlanName(planData.plan_name);
      setFeatures(planData.features);
      setAvailable(availData);
    } catch (error) {
      console.error('Failed to load plan features:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (feature: PlanFeature) => {
    if (!planId) return;
    try {
      const updated = await planFeaturesService.updateFeature(planId, feature.id, {
        is_enabled: !feature.is_enabled,
      });
      setFeatures((prev) =>
        prev.map((f) => (f.id === feature.id ? { ...f, is_enabled: updated.is_enabled } : f)),
      );
      setMessage({
        type: 'success',
        text: `${feature.feature_name} ${updated.is_enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Toggle failed:', error);
      setMessage({ type: 'error', text: 'Failed to toggle feature' });
    }
  };

  const handleAdd = async () => {
    if (!planId || !selectedKey) return;
    const avail = available.find((a) => a.key === selectedKey);
    if (!avail) return;
    try {
      const created = await planFeaturesService.addFeature(planId, {
        feature_key: avail.key,
        feature_name: avail.name,
        is_enabled: true,
        display_order: features.length,
      });
      setFeatures((prev) => [...prev, created]);
      setSelectedKey('');
      setShowAdd(false);
      setMessage({ type: 'success', text: `${avail.name} added to plan` });
    } catch (error: any) {
      const detail = error?.response?.data?.detail || 'Failed to add feature';
      setMessage({ type: 'error', text: detail });
    }
  };

  const handleRemove = async (feature: PlanFeature) => {
    if (!planId) return;
    try {
      await planFeaturesService.removeFeature(planId, feature.id);
      setFeatures((prev) => prev.filter((f) => f.id !== feature.id));
      setMessage({ type: 'success', text: `${feature.feature_name} removed` });
    } catch (error) {
      console.error('Remove failed:', error);
      setMessage({ type: 'error', text: 'Failed to remove feature' });
    }
  };

  // Features not yet assigned to this plan
  const unassigned = available.filter(
    (a) => !features.some((f) => f.feature_key === a.key),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/admin/finance/plans')}
        className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to Plans</span>
      </button>

      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plan Features</h1>
              <p className="text-gray-500 dark:text-white/60 mt-1">
                Manage features for <span className="text-gray-900 dark:text-white font-medium">{planName}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-[#2A2E33] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            {unassigned.length > 0 && (
              <button
                onClick={() => setShowAdd(!showAdd)}
                className="flex items-center gap-2 px-4 py-2 bg-[#E40000] hover:bg-[#FF0000] text-white text-sm rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className={`rounded-xl p-4 text-sm ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {message.text}
          </div>
        </motion.div>
      )}

      {/* Add Feature Panel */}
      {showAdd && unassigned.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <h3 className="text-gray-900 dark:text-white font-medium mb-3">Add Feature to Plan</h3>
            <div className="flex gap-3">
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#181C1F] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E40000]/50"
              >
                <option value="">Select a feature...</option>
                {unassigned.map((a) => (
                  <option key={a.key} value={a.key}>{a.name}</option>
                ))}
              </select>
              <button
                onClick={handleAdd}
                disabled={!selectedKey}
                className="px-5 py-2.5 bg-[#E40000] hover:bg-[#FF0000] disabled:bg-gray-300 dark:disabled:bg-[#181C1F] disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Features List */}
      {features.length > 0 ? (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={fadeUp}
              className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleToggle(feature)}
                  className="flex-shrink-0"
                  title={feature.is_enabled ? 'Disable' : 'Enable'}
                >
                  {feature.is_enabled ? (
                    <ToggleRight className="w-8 h-8 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-400 dark:text-white/30" />
                  )}
                </button>
                <div>
                  <p className={`font-medium ${feature.is_enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-white/40 line-through'}`}>
                    {feature.feature_name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-white/30">{feature.feature_key}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(feature)}
                className="p-2 text-gray-400 dark:text-white/30 hover:text-red-400 transition-colors"
                title="Remove feature"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
            <Settings className="w-16 h-16 text-gray-400 dark:text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No features configured
            </h3>
            <p className="text-gray-500 dark:text-white/60 text-sm mb-4">
              Add features to this plan to control what subscribers can access.
            </p>
            {unassigned.length > 0 && (
              <button
                onClick={() => setShowAdd(true)}
                className="px-5 py-2.5 bg-[#E40000] hover:bg-[#FF0000] text-white rounded-lg font-medium transition-colors"
              >
                Add First Feature
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PlanFeaturesPage;
