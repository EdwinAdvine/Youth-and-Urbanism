import React, { useEffect, useState } from 'react';
import { ArrowLeft, DollarSign, TrendingUp, Sparkles, Plus, Edit2, Trash2 } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';


interface RevenueSplit {
  id: string;
  course_id?: string;
  course_title?: string;
  session_type?: string;
  instructor_pct: number;
  platform_pct: number;
  partner_pct: number;
  effective_from: string;
  effective_until?: string;
  notes?: string;
}

interface RateRecommendation {
  type: string;
  current_rate: number;
  suggested_rate: number;
  reason: string;
  potential_increase: number;
}

export const RatesPage: React.FC = () => {
  const [splits, setSplits] = useState<RevenueSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIOptimizer, setShowAIOptimizer] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<RateRecommendation[]>([]);
  const [analyzingRates, setAnalyzingRates] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRevenueSplits();
  }, []);

  const fetchRevenueSplits = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/instructor/rates');

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setSplits([
          {
            id: '1',
            instructor_pct: 60,
            platform_pct: 30,
            partner_pct: 10,
            effective_from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Default platform rate',
          },
          {
            id: '2',
            course_id: 'course-1',
            course_title: 'Introduction to Mathematics - Grade 7',
            instructor_pct: 70,
            platform_pct: 25,
            partner_pct: 5,
            effective_from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Premium course - negotiated higher split',
          },
          {
            id: '3',
            session_type: 'one_on_one',
            instructor_pct: 75,
            platform_pct: 20,
            partner_pct: 5,
            effective_from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Private tutoring sessions',
          },
        ]);
      } else {
        setSplits(response.data);
      }
    } catch (error) {
      console.error('Error fetching revenue splits:', error);
      setSplits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAIOptimize = async () => {
    try {
      setAnalyzingRates(true);
      const response = await apiClient.post(
        '/api/v1/instructor/rates/ai-optimize',
        {}
      );

      // Mock recommendations for development
      if (!response.data || response.data.length === 0) {
        setAiRecommendations([
          {
            type: 'Premium Course',
            current_rate: 3000,
            suggested_rate: 3500,
            reason:
              'Your Mathematics course has a 4.8 rating and high completion rate. Market analysis shows similar courses at 3200-3800 KES.',
            potential_increase: 500,
          },
          {
            type: 'Group Sessions',
            current_rate: 1500,
            suggested_rate: 1800,
            reason:
              'Your group sessions have 95% attendance and strong engagement scores. Consider raising rates by 20%.',
            potential_increase: 300,
          },
          {
            type: 'One-on-One Sessions',
            current_rate: 2500,
            suggested_rate: 2500,
            reason:
              'Your current rate is optimal for the market. No change recommended at this time.',
            potential_increase: 0,
          },
        ]);
      } else {
        setAiRecommendations(response.data);
      }

      setShowAIOptimizer(true);
    } catch (error) {
      console.error('Error getting AI rate recommendations:', error);
      alert('Failed to get AI recommendations');
    } finally {
      setAnalyzingRates(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Rates & Revenue Splits"
        description="Configure custom revenue splits and optimize your pricing"
        icon={
          <button
            onClick={() => navigate('/dashboard/instructor/earnings')}
            className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white" />
          </button>
        }
        actions={
          <button
            onClick={handleAIOptimize}
            disabled={analyzingRates}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {analyzingRates ? 'Analyzing...' : 'AI Rate Optimizer'}
          </button>
        }
      />

      {/* Default Platform Split */}
      <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Default Platform Split</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-purple-200 mb-1">Your Share</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">60%</p>
          </div>
          <div>
            <p className="text-sm text-purple-200 mb-1">Platform Fee</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">30%</p>
          </div>
          <div>
            <p className="text-sm text-purple-200 mb-1">Partner Fee</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">10%</p>
          </div>
        </div>
        <p className="text-sm text-purple-200/70 mt-4">
          This is the default split applied to all courses and sessions unless you've configured a
          custom split below.
        </p>
      </div>

      {/* Custom Splits */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Revenue Splits</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-colors text-sm">
            <Plus className="w-4 h-4" />
            Add Custom Split
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10 text-left">
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Scope</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Your %</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Platform %</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Partner %</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Effective From</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Notes</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {splits.map((split) => {
                const isDefault = !split.course_id && !split.session_type;
                const scopeLabel = split.course_title
                  ? split.course_title
                  : split.session_type
                  ? split.session_type.replace('_', ' ')
                  : 'Default';

                return (
                  <tr key={split.id} className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{scopeLabel}</p>
                      {isDefault && (
                        <span className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40 italic">All content</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-green-400 font-semibold">
                        {split.instructor_pct}%
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-white/80">{split.platform_pct}%</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-white/80">{split.partner_pct}%</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500 dark:text-white/60">
                        {new Date(split.effective_from).toLocaleDateString('en-KE')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500 dark:text-white/60 max-w-xs truncate">
                        {split.notes || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white" />
                        </button>
                        {!isDefault && (
                          <button
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {splits.length === 0 && (
            <div className="p-12 text-center">
              <DollarSign className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/60">No custom revenue splits configured</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Optimizer Results */}
      {showAIOptimizer && aiRecommendations.length > 0 && (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Rate Optimization</h3>
          </div>

          <div className="space-y-4">
            {aiRecommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{rec.type}</h4>
                    <p className="text-sm text-gray-500 dark:text-white/60">{rec.reason}</p>
                  </div>
                  {rec.potential_increase > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-green-300">
                        +{formatCurrency(rec.potential_increase)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40 mb-1">Current Rate</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(rec.current_rate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40 mb-1">Suggested Rate</p>
                    <p className="text-lg font-semibold text-purple-300">
                      {formatCurrency(rec.suggested_rate)}
                    </p>
                  </div>
                </div>

                {rec.potential_increase > 0 && (
                  <button className="mt-3 w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-200 rounded-lg transition-colors text-sm font-medium">
                    Apply Recommendation
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-purple-200 mb-2">
          How Custom Revenue Splits Work
        </h4>
        <ul className="text-sm text-purple-200/80 space-y-1 list-disc list-inside">
          <li>Create custom splits for specific courses, session types, or content categories</li>
          <li>
            Higher-performing content can command better revenue share percentages (up to 80/15/5
            split)
          </li>
          <li>Splits are applied based on scope priority: course-specific → session-type → default</li>
          <li>
            Changes take effect immediately for new enrollments/sessions. Existing ones use the
            original split.
          </li>
          <li>Use the AI Rate Optimizer to get data-driven suggestions for pricing and splits</li>
        </ul>
      </div>
    </div>
  );
};
