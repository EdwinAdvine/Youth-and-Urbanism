import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2, Check, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import HoneypotField from '../common/HoneypotField';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSignupSuccess?: (user: any) => void;
}

const COUNTRY_CODES = [
  { code: '+254', country: 'KE', label: 'Kenya (+254)' },
  { code: '+256', country: 'UG', label: 'Uganda (+256)' },
  { code: '+255', country: 'TZ', label: 'Tanzania (+255)' },
  { code: '+250', country: 'RW', label: 'Rwanda (+250)' },
  { code: '+251', country: 'ET', label: 'Ethiopia (+251)' },
  { code: '+252', country: 'SO', label: 'Somalia (+252)' },
  { code: '+211', country: 'SS', label: 'South Sudan (+211)' },
  { code: '+234', country: 'NG', label: 'Nigeria (+234)' },
  { code: '+233', country: 'GH', label: 'Ghana (+233)' },
  { code: '+27', country: 'ZA', label: 'South Africa (+27)' },
  { code: '+44', country: 'GB', label: 'UK (+44)' },
  { code: '+1', country: 'US', label: 'USA (+1)' },
];

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onSignupSuccess }) => {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<'student' | 'parent' | 'partner' | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+254',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [formError, setFormError] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const { register, isLoading, error, clearError } = useAuthStore();

  const handleRoleSelect = (role: 'student' | 'parent' | 'partner') => {
    setSelectedRole(role);
    setStep('form');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setFormError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setFormError('Password must contain at least one lowercase letter');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setFormError('Password must contain at least one number');
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/;'`~]/.test(password)) {
      setFormError('Password must contain at least one special character');
      return false;
    }
    setFormError('');
    return true;
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/;'`~]/.test(password)) strength++;

    if (strength < 2) return { strength: 1, text: 'Weak', color: 'bg-red-500' };
    if (strength < 4) return { strength: 2, text: 'Fair', color: 'bg-yellow-500' };
    return { strength: 3, text: 'Strong', color: 'bg-green-500' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Bot detection: honeypot should always be empty
    if (honeypot) return;
    clearError();
    setFormError('');

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (!validatePassword(formData.password)) {
      return;
    }

    if (!selectedRole) {
      setFormError('Please select a role');
      return;
    }

    const fullPhone = formData.phoneNumber.trim()
      ? `${formData.countryCode}${formData.phoneNumber.trim()}`
      : undefined;

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        role: selectedRole,
        phone_number: fullPhone,
      });

      const currentUser = useAuthStore.getState().user;
      if (onSignupSuccess) {
        onSignupSuccess(currentUser);
      }
    } catch {
      // Error is set in the store
    }
  };

  if (step === 'role') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Choose Your Role</h3>
          <p className="text-sm text-gray-500 dark:text-white/60">Select how you'll use Urban Home School</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {([
            { role: 'student' as const, label: 'Student', desc: 'Access courses and learning materials', color: 'bg-blue-500', letter: 'S' },
            { role: 'parent' as const, label: 'Parent', desc: "Monitor your child's progress", color: 'bg-green-500', letter: 'P' },
            { role: 'partner' as const, label: 'Partner/Stakeholder', desc: 'Community partner and supporter', color: 'bg-orange-500', letter: 'P' },
          ]).map(({ role, label, desc, color, letter }) => (
            <button
              key={role}
              onClick={() => handleRoleSelect(role)}
              className={`p-4 text-left rounded-lg border-2 transition-all ${
                selectedRole === role
                  ? 'border-[#FF0000] bg-[#FF0000]/10'
                  : 'border-[#2A3035] hover:border-[#FF0000]/50 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                    <span className="text-gray-900 dark:text-white font-bold">{letter}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
                    <p className="text-xs text-gray-500 dark:text-white/60">{desc}</p>
                  </div>
                </div>
                {selectedRole === role && <Check className="w-5 h-5 text-[#FF0000]" />}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-400">
            Note: Staff, admin, and instructor accounts are not created here.{' '}
            <a href="/become-instructor" className="underline hover:text-yellow-300">
              Instructors can apply here.
            </a>
          </p>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-white/60">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-[#FF0000] hover:text-[#E40000] transition-colors font-medium"
          >
            Log in here
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" style={{ position: 'relative' }}>
      <HoneypotField value={honeypot} onChange={setHoneypot} />
      {/* Back to role selection */}
      <button
        type="button"
        onClick={() => setStep('role')}
        className="text-sm text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        &larr; Change role ({selectedRole})
      </button>

      {/* First Name & Last Name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
            placeholder="First name"
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
            placeholder="Last name"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="signup-email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
          placeholder="Enter your email address"
          required
        />
      </div>

      {/* Phone Number with Country Code */}
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
          Phone Number
        </label>
        <div className="flex gap-2">
          {/* Country Code Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg text-gray-900 dark:text-white text-sm hover:border-[#FF0000]/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent min-w-[100px]"
            >
              <span>{formData.countryCode}</span>
              <ChevronDown className="w-3 h-3 text-gray-500 dark:text-white/60" />
            </button>
            {showCountryDropdown && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                {COUNTRY_CODES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, countryCode: item.code }));
                      setShowCountryDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ${
                      formData.countryCode === item.code ? 'text-[#FF0000] bg-gray-50 dark:bg-white/5' : 'text-gray-700 dark:text-white/80'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Phone Input */}
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
            placeholder="712 345 678"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="signup-password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent pr-10"
            placeholder="Create a password (min 8 characters)"
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

        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="mt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/60">
              <span>Strength:</span>
              <div className="flex-1 bg-[#2A3035] rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getPasswordStrength(formData.password).color}`}
                  style={{ width: `${(getPasswordStrength(formData.password).strength / 3) * 100}%` }}
                />
              </div>
              <span className={`font-medium ${
                getPasswordStrength(formData.password).strength === 3 ? 'text-green-400' : 'text-red-400'
              }`}>
                {getPasswordStrength(formData.password).text}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="signup-confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="signup-confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-[#2A3035] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent pr-10"
            placeholder="Confirm your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {formError && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{formError}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#FF0000] hover:bg-[#E40000] text-gray-900 dark:text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Sign Up'
        )}
      </button>

      {/* Login Link */}
      <div className="text-center text-sm text-gray-500 dark:text-white/60">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[#FF0000] hover:text-[#E40000] transition-colors font-medium"
        >
          Log in here
        </button>
      </div>
    </form>
  );
};

export default SignupForm;
