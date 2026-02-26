/**
 * Revenue Split Configuration Page
 *
 * Super Admin page for configuring the default revenue split
 * between instructors, platform, and partners.
 */

import { useState, useEffect } from 'react';
import { PieChart, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import superAdminService, { RevenueSplit } from '../../services/admin/superAdminService';
import { useAuthStore } from '../../store/authStore';

export default function RevenueSplitConfigPage() {
  const [split, setSplit] = useState<RevenueSplit>({
    instructor_pct: 70,
    platform_pct: 20,
    partner_pct: 10,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    loadSplit();
  }, []);

  const loadSplit = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getRevenueSplit();
      setSplit(data);
    } catch {
      // Use defaults if not configured
    } finally {
      setLoading(false);
    }
  };

  const total = split.instructor_pct + split.platform_pct + split.partner_pct;
  const isValid = Math.abs(total - 100) < 0.01;

  const handleSave = async () => {
    if (!isValid) return;
    setError(null);
    setSuccess(false);

    try {
      setSaving(true);
      await superAdminService.updateRevenueSplit(split);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save revenue split');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser?.is_super_admin) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-400">
        <PieChart className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Super Admin Access Required</h2>
        <p>Only the Super Admin can configure revenue splits.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <PieChart className="w-7 h-7 text-copilot-cyan" />
          Revenue Split Configuration
        </h1>
        <p className="text-zinc-400 mt-1">
          Set the default revenue split for course sales. Changes apply to new courses.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          Revenue split saved successfully.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-copilot-cyan" />
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
          {/* Visual Bar */}
          <div className="h-8 rounded-lg overflow-hidden flex">
            <div
              className="bg-copilot-cyan transition-all flex items-center justify-center text-xs font-medium text-zinc-900"
              style={{ width: `${split.instructor_pct}%` }}
            >
              {split.instructor_pct}%
            </div>
            <div
              className="bg-copilot-purple transition-all flex items-center justify-center text-xs font-medium text-white"
              style={{ width: `${split.platform_pct}%` }}
            >
              {split.platform_pct}%
            </div>
            <div
              className="bg-copilot-orange transition-all flex items-center justify-center text-xs font-medium text-zinc-900"
              style={{ width: `${split.partner_pct}%` }}
            >
              {split.partner_pct}%
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-copilot-cyan font-medium">Instructor</label>
                <span className="text-sm text-white font-mono">{split.instructor_pct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={split.instructor_pct}
                onChange={(e) => setSplit((s) => ({ ...s, instructor_pct: Number(e.target.value) }))}
                className="w-full accent-copilot-cyan"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-copilot-purple font-medium">Platform</label>
                <span className="text-sm text-white font-mono">{split.platform_pct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={split.platform_pct}
                onChange={(e) => setSplit((s) => ({ ...s, platform_pct: Number(e.target.value) }))}
                className="w-full accent-purple-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-copilot-orange font-medium">Partner</label>
                <span className="text-sm text-white font-mono">{split.partner_pct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={split.partner_pct}
                onChange={(e) => setSplit((s) => ({ ...s, partner_pct: Number(e.target.value) }))}
                className="w-full accent-orange-500"
              />
            </div>
          </div>

          {/* Total Validation */}
          <div className={`flex items-center justify-between p-3 rounded-lg ${
            isValid ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
          }`}>
            <span className={`text-sm ${isValid ? 'text-green-400' : 'text-red-400'}`}>
              Total: {total.toFixed(0)}%
            </span>
            {!isValid && (
              <span className="text-xs text-red-400">Must equal 100%</span>
            )}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="w-full py-3 bg-copilot-cyan text-zinc-900 font-semibold rounded-lg hover:bg-copilot-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Revenue Split
          </button>
        </div>
      )}
    </div>
  );
}
