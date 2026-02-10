import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Mock login delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation
      if (email && password) {
        setSuccess('Login successful! Redirecting...');
        // Mock user data based on email
        const mockUser = {
          email,
          role: email.includes('student') ? 'student' : 
                email.includes('parent') ? 'parent' :
                email.includes('instructor') ? 'instructor' :
                email.includes('admin') ? 'admin' : 'user'
        };
        
        // Call the success callback to trigger redirect with user data
        if (onLoginSuccess) {
          onLoginSuccess(mockUser);
        }
      } else {
        setError('Please enter both email and password');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-[#22272B] border border-[#2A3035] rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
          placeholder="Enter your email address"
          required
        />
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-[#22272B] border border-[#2A3035] rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent pr-10"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm text-white/80">
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
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
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
        className="w-full bg-[#FF0000] hover:bg-[#E40000] text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      {/* Sign Up Link */}
      <div className="text-center text-sm text-white/60">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-[#FF0000] hover:text-[#E40000] transition-colors font-medium"
        >
          Sign up here
        </button>
      </div>

      {/* Test Accounts Info */}
      <div className="mt-6 p-4 bg-[#22272B] rounded-lg border border-[#2A3035]">
        <p className="text-xs text-white/60 mb-2">Test accounts for demo:</p>
        <div className="space-y-1 text-xs text-white/80">
          <p><strong>Student:</strong> student@urbanhomeschool.com / password123</p>
          <p><strong>Parent:</strong> parent@urbanhomeschool.com / password123</p>
          <p><strong>Instructor:</strong> instructor@urbanhomeschool.com / password123</p>
          <p><strong>Admin:</strong> admin@urbanhomeschool.com / password123</p>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;