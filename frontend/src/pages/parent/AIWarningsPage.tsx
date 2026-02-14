/**
 * AI Warning Signs Page
 *
 * Displays early warning signs and risk assessment.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, AlertTriangle, Shield, TrendingDown,
  CheckCircle, XCircle, AlertCircle,
  Users } from 'lucide-react';
import { useParentStore } from '../../store/parentStore';
import { getWarningSignsAnalysis } from '../../services/parentAIService';
import type { WarningSignsResponse } from '../../types/parent';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AIWarningsPage: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { selectedChildId } = useParentStore();
  const effectiveChildId = childId || selectedChildId;

  const [warnings, setWarnings] = useState<WarningSignsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (effectiveChildId) {
      loadWarnings();
    } else {
      setLoading(false);
    }
  }, [effectiveChildId]);

  const loadWarnings = async () => {
    if (!effectiveChildId) return;

    try {
      setLoading(true);
      const data = await getWarningSignsAnalysis(effectiveChildId);
      setWarnings(data);
    } catch (error) {
      console.error('Failed to load warning signs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
      default:
        return 'text-gray-500 dark:text-white/60';
    }
  };

  const getRiskLevelBg = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-green-500/20 border-green-500/50';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50';
      case 'high':
        return 'bg-red-500/20 border-red-500/50';
      default:
        return 'bg-gray-200 dark:bg-white/20 border-white/50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'high':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500 dark:text-white/60" />;
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

  if (!effectiveChildId) {
    return (
      <>
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 dark:text-white/30 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60 mb-2">Select a child to view this page</p>
          <p className="text-sm text-gray-400 dark:text-white/40 mb-4">Use the child selector in the sidebar</p>
          <button onClick={() => navigate('/dashboard/parent/children')} className="px-6 py-2 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF0000] transition-colors">View Children</button>
        </div>
      </>
    );
  }

  if (!warnings) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-white/60">Warning signs data not available</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/dashboard/parent/ai/summary/${effectiveChildId}`)}
          className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to AI Insights</span>
        </button>

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Early Warning Signs</h1>
              <p className="text-sm text-gray-500 dark:text-white/60">{warnings.student_name}</p>
            </div>
          </div>
        </motion.div>

        {/* Overall Risk Assessment */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className={`border rounded-xl p-6 ${getRiskLevelBg(warnings.overall_risk_level)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Overall Risk Level</p>
                  <p className={`text-3xl font-bold capitalize ${getRiskLevelColor(warnings.overall_risk_level)}`}>
                    {warnings.overall_risk_level}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm opacity-90">{warnings.risk_summary}</p>
          </div>
        </motion.div>

        {/* Active Warning Indicators */}
        {warnings.active_warnings.length > 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Indicators</h3>
              </div>
              <div className="space-y-3">
                {warnings.active_warnings.map((warning, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2 flex-1">
                        {getSeverityIcon(warning.severity)}
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{warning.indicator}</h4>
                          <p className="text-xs text-gray-500 dark:text-white/60 mb-2">{warning.description}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded capitalize ${
                        warning.severity === 'high'
                          ? 'bg-red-500/20 text-red-500'
                          : warning.severity === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-green-500/20 text-green-500'
                      }`}>
                        {warning.severity}
                      </span>
                    </div>
                    {warning.observed_behavior && (
                      <p className="text-xs text-gray-500 dark:text-white/50 italic">Observed: {warning.observed_behavior}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">All Clear!</h3>
              <p className="text-sm text-gray-600 dark:text-white/70">No active warning signs detected at this time.</p>
            </div>
          </motion.div>
        )}

        {/* Risk and Protective Factors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Factors */}
          {warnings.risk_factors.length > 0 && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Factors</h3>
                </div>
                <ul className="space-y-2">
                  {warnings.risk_factors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-white/80">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* Protective Factors */}
          {warnings.protective_factors.length > 0 && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Protective Factors</h3>
                </div>
                <ul className="space-y-2">
                  {warnings.protective_factors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-white/80">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        {/* Intervention Recommendations */}
        {warnings.intervention_recommendations.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommended Actions</h3>
              <div className="space-y-3">
                {warnings.intervention_recommendations.map((rec, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-[#22272B] rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <span className="text-[#E40000] font-bold">{i + 1}.</span>
                      <p className="text-sm text-gray-700 dark:text-white/80 flex-1">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Disclaimer */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-xs text-blue-300">
              <strong>Note:</strong> This AI-generated analysis is intended to support your awareness of your child's
              learning patterns. It is not a substitute for professional assessment. If you have serious concerns
              about your child's wellbeing or learning, please consult with educators or specialists.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AIWarningsPage;
