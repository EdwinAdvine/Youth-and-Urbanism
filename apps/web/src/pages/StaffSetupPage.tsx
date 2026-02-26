// StaffSetupPage - Token-based staff account setup page at /staff-setup.
// Reached via the one-time invite link emailed after account creation by admin.
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../services/api';
import { useAuthStore } from '../store/authStore';

const StaffSetupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState({ full_name: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      // The endpoint returns tokens AND sets httpOnly cookies
      await apiClient.post('/auth/staff-setup', {
        token,
        password: formData.password,
        full_name: formData.full_name,
      });

      // Populate auth store from the cookies that were just set
      await checkAuth();

      setDone(true);
      setTimeout(() => navigate('/dashboard/staff', { replace: true }), 2000);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(detail || 'Setup failed. The link may be expired or already used.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F1112] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-[#181C1F] border-2 border-green-500/40 rounded-2xl p-10 text-center max-w-md w-full"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-green-400 mb-3">Account Ready!</h2>
          <p className="text-gray-600 dark:text-white/70">
            Redirecting you to your staff dashboard…
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F1112] px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-2xl p-8 sm:p-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#FF0000]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-[#FF0000]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Set Up Your Staff Account
          </h1>
          <p className="text-sm text-gray-500 dark:text-white/60">
            Your account has been created! Set a password to activate it.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Display name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
              Display Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="How your name will appear on the platform"
              className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white/70"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
              Confirm Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Repeat your password"
                className="w-full bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-xl px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white/70"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#E40000] disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Activating Account…
              </>
            ) : (
              <>
                Activate My Account
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default StaffSetupPage;
