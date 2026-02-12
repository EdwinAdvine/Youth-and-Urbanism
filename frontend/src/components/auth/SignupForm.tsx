import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<'student' | 'parent' | 'instructor' | 'partner' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    gradeLevel: '',
    numberOfChildren: '',
    subjects: '',
    position: '',
    partnerCredentials: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'student' | 'parent' | 'instructor' | 'partner') => {
    setSelectedRole(role);
    setStep('form');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setPasswordError('Password must contain at least one lowercase letter');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    if (!/[!@#$%^&*]/.test(password)) {
      setPasswordError('Password must contain at least one special character (!@#$%^&*)');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setPasswordError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setPasswordError('All required fields must be filled');
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (!validatePassword(formData.password)) {
      return;
    }

    if (!selectedRole) {
      setPasswordError('Please select a role');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.name,
        role: selectedRole,
        phone_number: formData.phone_number || undefined
      });

      // Navigate to appropriate dashboard
      navigate(`/dashboard/${selectedRole}`);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    if (strength < 2) return { strength: 1, text: 'Weak', color: 'bg-red-500' };
    if (strength < 4) return { strength: 2, text: 'Fair', color: 'bg-yellow-500' };
    return { strength: 3, text: 'Strong', color: 'bg-green-500' };
  };

  if (step === 'role') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Choose Your Role</h3>
          <p className="text-sm text-white/60">Select how you'll use Urban Home School</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Student Card */}
          <button
            onClick={() => handleRoleSelect('student')}
            className={`p-4 text-left rounded-lg border-2 transition-all ${
              selectedRole === 'student' 
                ? 'border-[#FF0000] bg-[#FF0000]/10' 
                : 'border-[#2A3035] hover:border-[#FF0000]/50 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">S</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Student</h4>
                    <p className="text-xs text-white/60">Access courses and learning materials</p>
                  </div>
                </div>
              </div>
              {selectedRole === 'student' && <Check className="w-5 h-5 text-[#FF0000]" />}
            </div>
          </button>

          {/* Parent Card */}
          <button
            onClick={() => handleRoleSelect('parent')}
            className={`p-4 text-left rounded-lg border-2 transition-all ${
              selectedRole === 'parent' 
                ? 'border-[#FF0000] bg-[#FF0000]/10' 
                : 'border-[#2A3035] hover:border-[#FF0000]/50 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">P</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Parent</h4>
                    <p className="text-xs text-white/60">Monitor your child's progress</p>
                  </div>
                </div>
              </div>
              {selectedRole === 'parent' && <Check className="w-5 h-5 text-[#FF0000]" />}
            </div>
          </button>

          {/* Instructor Card */}
          <button
            onClick={() => handleRoleSelect('instructor')}
            className={`p-4 text-left rounded-lg border-2 transition-all ${
              selectedRole === 'instructor' 
                ? 'border-[#FF0000] bg-[#FF0000]/10' 
                : 'border-[#2A3035] hover:border-[#FF0000]/50 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">I</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Instructor</h4>
                    <p className="text-xs text-white/60">Create and manage courses</p>
                  </div>
                </div>
              </div>
              {selectedRole === 'instructor' && <Check className="w-5 h-5 text-[#FF0000]" />}
            </div>
          </button>

          {/* Partner Card */}
          <button
            onClick={() => handleRoleSelect('partner')}
            className={`p-4 text-left rounded-lg border-2 transition-all ${
              selectedRole === 'partner' 
                ? 'border-[#FF0000] bg-[#FF0000]/10' 
                : 'border-[#2A3035] hover:border-[#FF0000]/50 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">P</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Partner/Stakeholder</h4>
                    <p className="text-xs text-white/60">Community partner and supporter</p>
                  </div>
                </div>
              </div>
              {selectedRole === 'partner' && <Check className="w-5 h-5 text-[#FF0000]" />}
            </div>
          </button>
        </div>

        {/* Staff/Admin Warning */}
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-400">
            Note: Staff and admin accounts are created by institutional administrators only.
          </p>
        </div>

        <div className="text-center text-sm text-white/60">
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 bg-[#22272B] border border-[#2A3035] rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
          placeholder="Enter your full name"
          required
        />
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-3 py-2 bg-[#22272B] border border-[#2A3035] rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
          placeholder="Enter your email address"
          required
        />
      </div>

      {/* Phone Number Field */}
      <div>
        <label htmlFor="phone_number" className="block text-sm font-medium text-white/80 mb-2">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleInputChange}
          className="w-full px-3 py-2 bg-[#22272B] border border-[#2A3035] rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
          placeholder="e.g., +254 712 345 678"
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
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-[#22272B] border border-[#2A3035] rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent pr-10"
            placeholder="Create a password (min 8 characters)"
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
        
        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="mt-2">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>Password strength:</span>
              <div className="flex-1 bg-[#2A3035] rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    getPasswordStrength(formData.password).color
                  }`}
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

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-[#22272B] border border-[#2A3035] rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent pr-10"
            placeholder="Confirm your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Role-Specific Fields */}
      {selectedRole === 'student' && (
        <div>
          <label htmlFor="gradeLevel" className="block text-sm font-medium text-white/80 mb-2">
            Grade Level (Optional)
          </label>
          <input
            type="text"
            id="gradeLevel"
            name="gradeLevel"
            value={formData.gradeLevel}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-[#22272B] border border-[#2A3035] rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
            placeholder="e.g., Grade 4, Form 2"
          />
        </div>
      )}

      {selectedRole === 'parent' && (
        <div>
          <label htmlFor="numberOfChildren" className="block text-sm font-medium text-white/80 mb-2">
            Number of Children (Optional)
          </label>
          <input
            type="text"
            id="numberOfChildren"
            name="numberOfChildren"
            value={formData.numberOfChildren}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-[#22272B] border border-[#2A3035] rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
            placeholder="e.g., 2 children"
          />
        </div>
      )}

      {selectedRole === 'instructor' && (
        <>
          <div>
            <label htmlFor="subjects" className="block text-sm font-medium text-white/80 mb-2">
              Subjects You Teach (Optional)
            </label>
            <input
              type="text"
              id="subjects"
              name="subjects"
              value={formData.subjects}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[#22272B] border border-[#2A3035] rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
              placeholder="e.g., Mathematics, Science"
            />
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-white/80 mb-2">
              Your Credentials/Position (Optional)
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[#22272B] border border-[#2A3035] rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
              placeholder="e.g., B.Ed, Certified Teacher"
            />
          </div>
        </>
      )}

      {selectedRole === 'partner' && (
        <div>
          <label htmlFor="partnerCredentials" className="block text-sm font-medium text-white/80 mb-2">
            Your Credentials/Position (Optional)
          </label>
          <input
            type="text"
            id="partnerCredentials"
            name="partnerCredentials"
            value={formData.partnerCredentials}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-[#22272B] border border-[#2A3035] rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
            placeholder="e.g., Community Partner, Sponsor"
          />
        </div>
      )}

      {/* Backend Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Password Error Message */}
      {passwordError && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{passwordError}</span>
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
            Creating account...
          </>
        ) : (
          'Sign Up'
        )}
      </button>

      {/* Login Link */}
      <div className="text-center text-sm text-white/60">
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