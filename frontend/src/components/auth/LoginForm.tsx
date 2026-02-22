import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import apiClient from '../../services/api';

interface LoginFormProps {
  onPasswordReset: () => void;
  onSwitchToSignup: () => void;
  onLoginSuccess?: (user: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onPasswordReset, onSwitchToSignup, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [googleError, setGoogleError] = useState('');

  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess('');
    setGoogleError('');

    try {
      await login({ email, password, rememberMe });
      setSuccess('Login successful! Redirecting...');

      // Get the user from store after successful login
      const currentUser = useAuthStore.getState().user;

      // Notify parent (AuthModal -> App) to handle navigation
      if (onLoginSuccess) {
        onLoginSuccess(currentUser);
      }
    } catch {
      // Error is already set in store by useAuthStore
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    clearError();
    setGoogleError('');
    setSuccess('');

    if (!credentialResponse.credential) {
      setGoogleError('Google sign-in failed. No credential received.');
      return;
    }

    try {
      // Send the Google credential to our backend (sets httpOnly cookies)
      await apiClient.post('/api/v1/auth/google', {
        credential: credentialResponse.credential,
      });

      // Get user info after Google auth (cookies are set by backend)
      const userResponse = await apiClient.get('/api/v1/auth/me');
      const user = {
        ...userResponse.data,
        full_name: userResponse.data.full_name || userResponse.data.profile_data?.full_name || '',
      };

      // Update auth store
      useAuthStore.setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        rememberMe: true, // Google login always persists
      });

      setSuccess('Login successful! Redirecting...');

      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Google sign-in failed. Please try again.';
      setGoogleError(message);
    }
  };

  const handleGoogleError = () => {
    setGoogleError('Google sign-in was cancelled or failed. Please try again.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
          placeholder="Enter your email address"
          required
        />
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent pr-10"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm text-gray-700 dark:text-white/80">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2 text-[#FF0000] focus:ring-[#FF0000] border-[#2A3035] rounded"
          />
          Remember me
        </label>
        <button
          type="button"
          onClick={onPasswordReset}
          className="text-sm text-[#FF0000] hover:text-[#E40000] transition-colors"
        >
          Forgot password?
        </button>
      </div>

      {/* Error Message */}
      {(error || googleError) && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error || googleError}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/50 text-green-400 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#FF0000] hover:bg-[#E40000] text-gray-900 dark:text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Log In'
        )}
      </button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-[#2A3035]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-[#181C1F] text-gray-500 dark:text-white/60">or continue with</span>
        </div>
      </div>

      {/* Google Sign-In Button */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          theme="filled_black"
          size="large"
          width="100%"
          text="signin_with"
          shape="rectangular"
        />
      </div>

      {/* Sign Up Link */}
      <div className="text-center text-sm text-gray-500 dark:text-white/60">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-[#FF0000] hover:text-[#E40000] transition-colors font-medium"
        >
          Sign up here
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
