import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handlePasswordReset = () => {
    setShowPasswordReset(true);
  };

  const handlePasswordResetClose = () => {
    setShowPasswordReset(false);
  };

  const handleAuthSuccess = (user: any) => {
    console.log('[Auth] AuthModal: handleAuthSuccess called, user:', user);
    onClose();
    // Call the parent's auth success handler if provided
    if (onAuthSuccess) {
      console.log('[Auth] AuthModal: calling onAuthSuccess');
      onAuthSuccess(user);
    } else {
      console.warn('[Auth] AuthModal: onAuthSuccess is not defined!');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-[#181C1F] rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/50 border border-gray-200 dark:border-[#22272B] w-full max-w-md sm:max-w-lg lg:max-w-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-[#22272B]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-10 bg-[#FF0000] rounded-xl flex items-center justify-center">
                  <span className="text-gray-900 dark:text-white font-bold text-lg">UHS</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Urban Home School</h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-white/60">Welcome back</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-[#22272B]">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-3 px-4 text-sm sm:text-base font-medium transition-colors ${
                  activeTab === 'login'
                    ? 'text-[#FF0000] border-b-2 border-[#FF0000] bg-white dark:bg-[#181C1F]'
                    : 'text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-3 px-4 text-sm sm:text-base font-medium transition-colors ${
                  activeTab === 'signup'
                    ? 'text-[#FF0000] border-b-2 border-[#FF0000] bg-white dark:bg-[#181C1F]'
                    : 'text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {activeTab === 'login' ? (
                <LoginForm
                  onPasswordReset={handlePasswordReset}
                  onSwitchToSignup={() => setActiveTab('signup')}
                  onLoginSuccess={handleAuthSuccess}
                />
              ) : (
                <SignupForm
                  onSwitchToLogin={() => setActiveTab('login')}
                  onSignupSuccess={handleAuthSuccess}
                />
              )}
            </div>
          </motion.div>

          {/* Password Reset Modal */}
          <AnimatePresence>
            {showPasswordReset && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white dark:bg-[#181C1F] rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/50 border border-gray-200 dark:border-[#22272B] w-full max-w-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-10 bg-[#FF0000] rounded-xl flex items-center justify-center">
                      <span className="text-gray-900 dark:text-white font-bold text-lg">UHS</span>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Reset Password</h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-white/60">Enter your email to receive reset instructions</p>
                    </div>
                  </div>
                  
                  <PasswordResetForm onClose={handlePasswordResetClose} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

// Password Reset Form Component
interface PasswordResetFormProps {
  onClose: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Mock password reset functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Reset link would be sent to your inbox' });
      // In a real app, you'd wait a bit then close the modal
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="reset-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
          placeholder="Enter your email address"
          required
        />
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-500/10 border border-green-500/50 text-green-400' : 'bg-red-500/10 border border-red-500/50 text-red-400'
        }`}>
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white border border-[#2A3035] rounded-lg hover:border-[#FF0000] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-[#FF0000] hover:bg-[#E40000] text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </div>
    </form>
  );
};

export default AuthModal;