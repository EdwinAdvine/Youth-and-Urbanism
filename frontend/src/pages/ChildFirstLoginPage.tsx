import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock,
  Eye,
  EyeOff,
  Bird,
  Loader2,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import apiClient from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function ChildFirstLoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing setup link. Please ask your parent for a new link.');
    }
  }, [token]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(async () => {
        await checkAuth();
        navigate('/dashboard/student', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, checkAuth, navigate]);

  const getPasswordStrength = (pw: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid setup link. Please ask your parent for a new link.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/auth/child-first-login', {
        token,
        password,
      });

      if (response.data?.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
      }

      setSuccess(true);
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Something went wrong. Please try again or ask your parent for a new link.';
      setError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0F1112] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#181C1F] rounded-2xl border border-white/10 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-400" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-2">You're All Set!</h2>
            <p className="text-gray-400 mb-4">
              Your password has been created. Redirecting you to your dashboard...
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting in 2 seconds...
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1112] flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#FF0000]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#FF0000]/3 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 bg-gradient-to-br from-[#FF0000]/20 to-[#FF0000]/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#FF0000]/20"
          >
            <Bird className="w-10 h-10 text-[#FF0000]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Welcome! Set Your Password
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-sm max-w-sm mx-auto"
          >
            Your parent created your account. Create a password to start learning!
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#181C1F] rounded-2xl border border-white/10 p-6"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  disabled={!token}
                  className="w-full pl-10 pr-10 py-3 bg-[#0F1112] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Choose a password you'll remember"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Password strength</span>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength.label === 'Weak'
                          ? 'text-red-400'
                          : passwordStrength.label === 'Fair'
                            ? 'text-yellow-400'
                            : passwordStrength.label === 'Good'
                              ? 'text-blue-400'
                              : 'text-green-400'
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#0F1112] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      className={`h-full rounded-full ${passwordStrength.color}`}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      { test: password.length >= 8, label: '8+ chars' },
                      { test: /[A-Z]/.test(password), label: 'Uppercase' },
                      { test: /[a-z]/.test(password), label: 'Lowercase' },
                      { test: /[0-9]/.test(password), label: 'Number' },
                      { test: /[^A-Za-z0-9]/.test(password), label: 'Symbol' },
                    ].map(({ test, label }) => (
                      <span
                        key={label}
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          test
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-white/5 text-gray-600 border border-white/5'
                        }`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  disabled={!token}
                  className="w-full pl-10 pr-10 py-3 bg-[#0F1112] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Type your password again"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1.5 text-xs text-red-400"
                >
                  Passwords do not match
                </motion.p>
              )}
              {confirmPassword && password === confirmPassword && confirmPassword.length >= 8 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1.5 text-xs text-green-400 flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  Passwords match
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting || !token || !password || !confirmPassword}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-[#FF0000] hover:bg-[#FF0000]/90 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting Up Your Account...
                </>
              ) : (
                <>
                  <Bird className="w-5 h-5" />
                  Start Learning
                </>
              )}
            </motion.button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-xs text-gray-500 text-center">
              Having trouble? Ask your parent to resend the setup link or contact{' '}
              <a
                href="mailto:support@urbanhomeschool.co.ke"
                className="text-[#FF0000] hover:underline"
              >
                support@urbanhomeschool.co.ke
              </a>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-gray-600 mt-6"
        >
          Urban Home School &mdash; The Bird AI
        </motion.p>
      </motion.div>
    </div>
  );
}
