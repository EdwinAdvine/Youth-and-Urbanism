import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Users,
  Baby,
  Calendar,
  GraduationCap,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import apiClient from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import HoneypotField from '../common/HoneypotField';

interface ParentRegistrationWizardProps {
  onSwitchToLogin: () => void;
  onSignupSuccess?: (user: any) => void;
}

interface ChildForm {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  grade_level: string;
  username: string;
  suggestedUsernames: string[];
  loadingSuggestions: boolean;
  showManualUsername: boolean;
}

interface ParentForm {
  first_name: string;
  last_name: string;
  email: string;
  phone_country_code: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

const COUNTRY_CODES = [
  { code: '+254', country: 'KE', flag: '🇰🇪', name: 'Kenya' },
  { code: '+256', country: 'UG', flag: '🇺🇬', name: 'Uganda' },
  { code: '+255', country: 'TZ', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+251', country: 'ET', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+250', country: 'RW', flag: '🇷🇼', name: 'Rwanda' },
  { code: '+252', country: 'SO', flag: '🇸🇴', name: 'Somalia' },
  { code: '+253', country: 'DJ', flag: '🇩🇯', name: 'Djibouti' },
  { code: '+257', country: 'BI', flag: '🇧🇮', name: 'Burundi' },
  { code: '+211', country: 'SS', flag: '🇸🇸', name: 'South Sudan' },
  { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+233', country: 'GH', flag: '🇬🇭', name: 'Ghana' },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
];

const GRADE_LEVELS = [
  { value: 'PP1', label: 'PP1 (Pre-Primary 1)' },
  { value: 'PP2', label: 'PP2 (Pre-Primary 2)' },
  { value: 'Grade 1', label: 'Grade 1' },
  { value: 'Grade 2', label: 'Grade 2' },
  { value: 'Grade 3', label: 'Grade 3' },
  { value: 'Grade 4', label: 'Grade 4' },
  { value: 'Grade 5', label: 'Grade 5' },
  { value: 'Grade 6', label: 'Grade 6' },
  { value: 'Grade 7', label: 'Grade 7' },
  { value: 'Grade 8', label: 'Grade 8' },
  { value: 'Grade 9', label: 'Grade 9' },
];

const createEmptyChild = (): ChildForm => ({
  id: crypto.randomUUID(),
  first_name: '',
  last_name: '',
  date_of_birth: '',
  grade_level: '',
  username: '',
  suggestedUsernames: [],
  loadingSuggestions: false,
  showManualUsername: false,
});

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
  if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
};

const isChildUnder18 = (dob: string): boolean => {
  if (!dob) return false;
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 < 18;
  }
  return age < 18;
};

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function ParentRegistrationWizard({
  onSwitchToLogin,
  onSignupSuccess,
}: ParentRegistrationWizardProps) {
  const { checkAuth } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredChildren, setRegisteredChildren] = useState<
    { name: string; username: string }[]
  >([]);
  const [copiedUsername, setCopiedUsername] = useState<string | null>(null);

  const [parentForm, setParentForm] = useState<ParentForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone_country_code: '+254',
    phone_number: '',
    password: '',
    confirm_password: '',
  });

  const [children, setChildren] = useState<ChildForm[]>([createEmptyChild()]);

  const passwordStrength = getPasswordStrength(parentForm.password);

  const updateParentField = (field: keyof ParentForm, value: string) => {
    setParentForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const updateChildField = (childId: string, field: keyof ChildForm, value: any) => {
    setChildren((prev) =>
      prev.map((child) => (child.id === childId ? { ...child, [field]: value } : child))
    );
    setError('');
  };

  const addChild = () => {
    if (children.length < 5) {
      setChildren((prev) => [...prev, createEmptyChild()]);
    }
  };

  const removeChild = (childId: string) => {
    if (children.length > 1) {
      setChildren((prev) => prev.filter((c) => c.id !== childId));
    }
  };

  const suggestUsernames = useCallback(
    async (childId: string) => {
      const child = children.find((c) => c.id === childId);
      if (!child || !child.first_name || !child.last_name) {
        setError('Please enter the child\'s first and last name first.');
        return;
      }

      updateChildField(childId, 'loadingSuggestions', true);
      try {
        const response = await apiClient.post('/auth/generate-username', {
          first_name: child.first_name,
          last_name: child.last_name,
        });
        updateChildField(childId, 'suggestedUsernames', response.data.usernames || response.data);
        updateChildField(childId, 'showManualUsername', false);
      } catch (err: any) {
        setError('Failed to generate username suggestions. You can enter one manually.');
        updateChildField(childId, 'showManualUsername', true);
      } finally {
        updateChildField(childId, 'loadingSuggestions', false);
      }
    },
    [children]
  );

  const validateStep1 = (): boolean => {
    if (!parentForm.first_name.trim()) {
      setError('First name is required.');
      return false;
    }
    if (!parentForm.last_name.trim()) {
      setError('Last name is required.');
      return false;
    }
    if (!parentForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentForm.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!parentForm.phone_number.trim() || parentForm.phone_number.length < 6) {
      setError('Please enter a valid phone number.');
      return false;
    }
    if (parentForm.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }
    if (parentForm.password !== parentForm.confirm_password) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child.first_name.trim()) {
        setError(`Child ${i + 1}: First name is required.`);
        return false;
      }
      if (!child.last_name.trim()) {
        setError(`Child ${i + 1}: Last name is required.`);
        return false;
      }
      if (!child.date_of_birth) {
        setError(`Child ${i + 1}: Date of birth is required.`);
        return false;
      }
      if (!isChildUnder18(child.date_of_birth)) {
        setError(`Child ${i + 1}: Must be under 18 years old.`);
        return false;
      }
      if (!child.grade_level) {
        setError(`Child ${i + 1}: Grade level is required.`);
        return false;
      }
      if (!child.username.trim()) {
        setError(`Child ${i + 1}: Please select or enter a username.`);
        return false;
      }
    }
    return true;
  };

  const goToStep = (step: number) => {
    if (step > currentStep) {
      if (currentStep === 1 && !validateStep1()) return;
      if (currentStep === 2 && !validateStep2()) return;
      setDirection(1);
    } else {
      setDirection(-1);
    }
    setError('');
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    if (honeypot) return;
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        parent: {
          first_name: parentForm.first_name.trim(),
          last_name: parentForm.last_name.trim(),
          email: parentForm.email.trim().toLowerCase(),
          phone: `${parentForm.phone_country_code}${parentForm.phone_number.trim()}`,
          password: parentForm.password,
        },
        children: children.map((child) => ({
          first_name: child.first_name.trim(),
          last_name: child.last_name.trim(),
          date_of_birth: child.date_of_birth,
          grade_level: child.grade_level,
          username: child.username.trim(),
        })),
      };

      const response = await apiClient.post('/auth/register-parent', payload);

      setRegisteredChildren(
        children.map((child) => ({
          name: `${child.first_name} ${child.last_name}`,
          username: child.username,
        }))
      );

      setRegistrationComplete(true);

      if (response.data?.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        await checkAuth();
      }

      if (onSignupSuccess) {
        onSignupSuccess(response.data);
      }
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyUsername = (username: string) => {
    navigator.clipboard.writeText(username);
    setCopiedUsername(username);
    setTimeout(() => setCopiedUsername(null), 2000);
  };

  const maxDob = new Date().toISOString().split('T')[0];
  const minDob = new Date(
    new Date().getFullYear() - 18,
    new Date().getMonth(),
    new Date().getDate()
  )
    .toISOString()
    .split('T')[0];

  if (registrationComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-auto"
      >
        <div className="bg-[#181C1F] rounded-2xl border border-white/10 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-400" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">Family Account Created!</h2>
          <p className="text-gray-400 mb-6">
            Your account and your children's accounts are ready. Save the usernames below:
          </p>

          <div className="space-y-3 mb-8">
            {registeredChildren.map((child, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="bg-[#22272B] rounded-xl p-4 flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-white font-medium">{child.name}</p>
                  <p className="text-sm text-gray-400">
                    Username: <span className="text-[#FF0000] font-mono">{child.username}</span>
                  </p>
                </div>
                <button
                  onClick={() => copyUsername(child.username)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Copy username"
                >
                  {copiedUsername === child.username ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mb-6">
            Each child will set their own password when they log in for the first time using a link
            sent to your email.
          </p>

          <button
            onClick={onSwitchToLogin}
            className="w-full py-3 bg-[#FF0000] hover:bg-[#FF0000]/90 text-white font-semibold rounded-xl transition-colors"
          >
            Go to Login
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === currentStep
                  ? 'bg-[#FF0000] text-white scale-110'
                  : step < currentStep
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-[#22272B] text-gray-500 border border-white/10'
              }`}
            >
              {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-0.5 mx-1 ${
                  step < currentStep ? 'bg-green-500/50' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center mb-2">
        <p className="text-xs text-gray-500">
          {currentStep === 1 && 'Step 1 of 3 — Parent Info'}
          {currentStep === 2 && 'Step 2 of 3 — Add Children'}
          {currentStep === 3 && 'Step 3 of 3 — Review'}
        </p>
      </div>

      <HoneypotField value={honeypot} onChange={setHoneypot} />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </motion.div>
      )}

      <div className="bg-[#181C1F] rounded-2xl border border-white/10 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {/* Step 1: Parent Info */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FF0000]/10 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-[#FF0000]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Parent Information</h3>
                  <p className="text-xs text-gray-500">Tell us about yourself</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={parentForm.first_name}
                        onChange={(e) => updateParentField('first_name', e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-[#0F1112] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-none transition-colors text-sm"
                        placeholder="First name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={parentForm.last_name}
                        onChange={(e) => updateParentField('last_name', e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-[#0F1112] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-none transition-colors text-sm"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={parentForm.email}
                      onChange={(e) => updateParentField('email', e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#0F1112] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-none transition-colors text-sm"
                      placeholder="parent@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={parentForm.phone_country_code}
                      onChange={(e) => updateParentField('phone_country_code', e.target.value)}
                      className="w-32 px-2 py-2.5 bg-[#0F1112] border border-white/10 rounded-xl text-white focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-none transition-colors text-sm"
                    >
                      {COUNTRY_CODES.map((cc) => (
                        <option key={cc.code} value={cc.code}>
                          {cc.flag} {cc.code}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="tel"
                        value={parentForm.phone_number}
                        onChange={(e) =>
                          updateParentField('phone_number', e.target.value.replace(/\D/g, ''))
                        }
                        className="w-full pl-10 pr-3 py-2.5 bg-[#0F1112] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-none transition-colors text-sm"
                        placeholder="712345678"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={parentForm.password}
                      onChange={(e) => updateParentField('password', e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#0F1112] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-none transition-colors text-sm"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {parentForm.password && (
                    <div className="mt-2">
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
                          animate={{
                            width: `${(passwordStrength.score / 6) * 100}%`,
                          }}
                          className={`h-full rounded-full ${passwordStrength.color}`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={parentForm.confirm_password}
                      onChange={(e) => updateParentField('confirm_password', e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#0F1112] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-none transition-colors text-sm"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {parentForm.confirm_password && parentForm.password !== parentForm.confirm_password && (
                    <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                  )}
                </div>
              </div>

              {/* Step 1 Navigation */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={onSwitchToLogin}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Already have an account?{' '}
                  <span className="text-[#FF0000] font-medium">Sign in</span>
                </button>
                <button
                  onClick={() => goToStep(2)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#FF0000] hover:bg-[#FF0000]/90 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Add Children */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FF0000]/10 rounded-xl flex items-center justify-center">
                  <Baby className="w-5 h-5 text-[#FF0000]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add Your Children</h3>
                  <p className="text-xs text-gray-500">
                    Add 1-5 children to your family account
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {children.map((child, index) => (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-[#0F1112] rounded-xl border border-white/10 p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#FF0000]" />
                        Child {index + 1}
                      </h4>
                      {children.length > 1 && (
                        <button
                          onClick={() => removeChild(child.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-gray-500 hover:text-red-400"
                          title="Remove child"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Name Row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={child.first_name}
                            onChange={(e) =>
                              updateChildField(child.id, 'first_name', e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[#181C1F] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-none transition-colors text-sm"
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={child.last_name}
                            onChange={(e) =>
                              updateChildField(child.id, 'last_name', e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[#181C1F] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-none transition-colors text-sm"
                            placeholder="Last name"
                          />
                        </div>
                      </div>

                      {/* DOB & Grade */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={child.date_of_birth}
                            onChange={(e) =>
                              updateChildField(child.id, 'date_of_birth', e.target.value)
                            }
                            min={minDob}
                            max={maxDob}
                            className="w-full px-3 py-2 bg-[#181C1F] border border-white/10 rounded-lg text-white focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-none transition-colors text-sm [color-scheme:dark]"
                          />
                          {child.date_of_birth && !isChildUnder18(child.date_of_birth) && (
                            <p className="mt-1 text-xs text-red-400">Must be under 18</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            <GraduationCap className="w-3 h-3 inline mr-1" />
                            Grade Level
                          </label>
                          <select
                            value={child.grade_level}
                            onChange={(e) =>
                              updateChildField(child.id, 'grade_level', e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[#181C1F] border border-white/10 rounded-lg text-white focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-none transition-colors text-sm"
                          >
                            <option value="" disabled>
                              Select grade
                            </option>
                            {GRADE_LEVELS.map((gl) => (
                              <option key={gl.value} value={gl.value}>
                                {gl.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Username */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Username
                        </label>
                        <div className="flex gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => suggestUsernames(child.id)}
                            disabled={child.loadingSuggestions}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF0000]/10 hover:bg-[#FF0000]/20 text-[#FF0000] rounded-lg transition-colors text-xs font-medium disabled:opacity-50"
                          >
                            {child.loadingSuggestions ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            Suggest Usernames
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateChildField(
                                child.id,
                                'showManualUsername',
                                !child.showManualUsername
                              )
                            }
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors text-xs"
                          >
                            Enter manually
                          </button>
                        </div>

                        {/* Suggested Usernames */}
                        {child.suggestedUsernames.length > 0 && !child.showManualUsername && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {child.suggestedUsernames.map((uname) => (
                              <button
                                key={uname}
                                type="button"
                                onClick={() => updateChildField(child.id, 'username', uname)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  child.username === uname
                                    ? 'bg-[#FF0000] text-white ring-2 ring-[#FF0000]/50'
                                    : 'bg-[#22272B] text-gray-300 hover:bg-[#22272B]/80 border border-white/10'
                                }`}
                              >
                                {uname}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Manual Username Input */}
                        {(child.showManualUsername || child.suggestedUsernames.length === 0) && (
                          <input
                            type="text"
                            value={child.username}
                            onChange={(e) =>
                              updateChildField(
                                child.id,
                                'username',
                                e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '')
                              )
                            }
                            className="w-full px-3 py-2 bg-[#181C1F] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/30 focus:outline-none transition-colors text-sm font-mono"
                            placeholder="e.g., bird_learner_01"
                          />
                        )}

                        {child.username && (
                          <p className="mt-1 text-xs text-gray-500">
                            Selected:{' '}
                            <span className="text-[#FF0000] font-mono">{child.username}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Child Button */}
              {children.length < 5 && (
                <button
                  type="button"
                  onClick={addChild}
                  className="mt-4 w-full py-2.5 border border-dashed border-white/20 hover:border-[#FF0000]/40 rounded-xl text-gray-400 hover:text-[#FF0000] transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Child ({children.length}/5)
                </button>
              )}

              {/* Step 2 Navigation */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => goToStep(1)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#22272B] hover:bg-[#22272B]/80 text-gray-300 rounded-xl transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={() => goToStep(3)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#FF0000] hover:bg-[#FF0000]/90 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FF0000]/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#FF0000]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Review & Confirm</h3>
                  <p className="text-xs text-gray-500">
                    Please verify all details before submitting
                  </p>
                </div>
              </div>

              {/* Parent Summary */}
              <div className="bg-[#0F1112] rounded-xl border border-white/10 p-4 mb-4">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-[#FF0000]" />
                  Parent Account
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-gray-500">Name</span>
                  <span className="text-white">
                    {parentForm.first_name} {parentForm.last_name}
                  </span>
                  <span className="text-gray-500">Email</span>
                  <span className="text-white text-xs">{parentForm.email}</span>
                  <span className="text-gray-500">Phone</span>
                  <span className="text-white">
                    {parentForm.phone_country_code} {parentForm.phone_number}
                  </span>
                </div>
              </div>

              {/* Children Summary */}
              <div className="space-y-3">
                {children.map((child, index) => (
                  <div
                    key={child.id}
                    className="bg-[#0F1112] rounded-xl border border-white/10 p-4"
                  >
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                      <Baby className="w-4 h-4 text-[#FF0000]" />
                      Child {index + 1}
                    </h4>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-gray-500">Name</span>
                      <span className="text-white">
                        {child.first_name} {child.last_name}
                      </span>
                      <span className="text-gray-500">Date of Birth</span>
                      <span className="text-white">
                        {child.date_of_birth
                          ? new Date(child.date_of_birth).toLocaleDateString('en-KE', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : '-'}
                      </span>
                      <span className="text-gray-500">Grade</span>
                      <span className="text-white">{child.grade_level}</span>
                      <span className="text-gray-500">Username</span>
                      <span className="text-[#FF0000] font-mono">{child.username}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Step 3 Navigation */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => goToStep(2)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#22272B] hover:bg-[#22272B]/80 text-gray-300 rounded-xl transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#FF0000] hover:bg-[#FF0000]/90 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Create Family Account
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
