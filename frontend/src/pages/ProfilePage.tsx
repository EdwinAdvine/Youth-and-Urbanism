import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Lock,
  Camera,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Trash2,
  Monitor
} from 'lucide-react';
import apiClient from '../services/api';

interface ProfileFormData {
  full_name: string;
  email: string;
  phone_number: string;
  bio: string;
  date_of_birth: string;
  grade_level: string;
  profile_image?: string;
}

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    email: '',
    phone_number: '',
    bio: '',
    date_of_birth: '',
    grade_level: '',
    profile_image: ''
  });
  const [originalData, setOriginalData] = useState<ProfileFormData>(formData);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Weak',
    color: 'bg-red-500'
  });

  // Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'Nairobi, Kenya',
      lastActive: '2 minutes ago',
      current: true
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'Mombasa, Kenya',
      lastActive: '2 hours ago',
      current: false
    }
  ]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Grade levels for students
  const gradeLevels = [
    'Pre-Primary 1',
    'Pre-Primary 2',
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Grade 8',
    'Grade 9',
    'Grade 10',
    'Grade 11',
    'Grade 12'
  ];

  // Load user data on mount
  useEffect(() => {
    if (user) {
      const userData: ProfileFormData = {
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        bio: user.profile_data?.bio || '',
        date_of_birth: user.profile_data?.date_of_birth || '',
        grade_level: user.profile_data?.grade_level || '',
        profile_image: user.profile_data?.profile_image || ''
      };
      setFormData(userData);
      setOriginalData(userData);
      if (userData.profile_image) {
        setImagePreview(userData.profile_image);
      }
    }
  }, [user]);

  // Calculate password strength
  useEffect(() => {
    const password = passwordData.new_password;
    if (!password) {
      setPasswordStrength({ score: 0, label: 'Weak', color: 'bg-red-500' });
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    let label = 'Weak';
    let color = 'bg-red-500';
    if (score >= 5) {
      label = 'Strong';
      color = 'bg-green-500';
    } else if (score >= 3) {
      label = 'Medium';
      color = 'bg-yellow-500';
    }

    setPasswordStrength({ score: Math.min(score, 6), label, color });
  }, [passwordData.new_password]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please upload a valid image file' });
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, profile_image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate phone number format (Kenya)
      if (formData.phone_number && !formData.phone_number.match(/^\+254[0-9]{9}$/)) {
        setMessage({
          type: 'error',
          text: 'Phone number must be in format +254XXXXXXXXX'
        });
        setLoading(false);
        return;
      }

      // Update profile via API
      await apiClient.put('/api/v1/users/me', {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        profile_data: {
          bio: formData.bio,
          date_of_birth: formData.date_of_birth,
          grade_level: formData.grade_level,
          profile_image: formData.profile_image
        }
      });

      setOriginalData(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate passwords
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      setLoading(false);
      return;
    }

    if (passwordStrength.score < 3) {
      setMessage({ type: 'error', text: 'Please use a stronger password' });
      setLoading(false);
      return;
    }

    try {
      await apiClient.put('/api/v1/users/me/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to change password. Please check your current password.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setImagePreview(originalData.profile_image || '');
    setMessage(null);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await apiClient.delete('/api/v1/users/me');
      setMessage({ type: 'success', text: 'Account deleted successfully. Redirecting...' });
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to delete account.'
      });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleLogoutSession = async (sessionId: string) => {
    // TODO: Implement session logout via API
    setSessions(sessions.filter(s => s.id !== sessionId));
    setMessage({ type: 'success', text: 'Session logged out successfully' });
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      student: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      parent: 'bg-green-500/20 text-green-400 border-green-500/30',
      instructor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      partner: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      staff: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    };
    return colors[role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-white/60">Manage your account settings and preferences</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-auto text-white/60 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Profile Photo Section */}
        <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden border-4 border-white/10">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-white" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors"
              >
                <Camera size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">{user?.full_name}</h3>
              <p className="text-white/60 mb-2">{user?.email}</p>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user?.role || '')}`}>
                <Shield size={14} />
                {user?.role?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'profile'
                ? 'text-blue-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Profile Info
            {activeTab === 'profile' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'password'
                ? 'text-blue-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Change Password
            {activeTab === 'password' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'security'
                ? 'text-blue-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Account Security
            {activeTab === 'security' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/60 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-white/40">Email cannot be changed</p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+254712345678"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="mt-1 text-xs text-white/40">Format: +254XXXXXXXXX</p>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Grade Level (Students only) */}
            {user?.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Grade Level
                </label>
                <select
                  value={formData.grade_level}
                  onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="" className="bg-gray-900">Select Grade Level</option>
                  {gradeLevels.map((grade) => (
                    <option key={grade} value={grade} className="bg-gray-900">
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                About Me
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium rounded-lg transition-colors"
              >
                <Save size={20} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 disabled:bg-white/5 text-white font-medium rounded-lg border border-white/10 transition-colors"
              >
                <X size={20} />
                Cancel
              </button>
            </div>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Current Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                New Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordData.new_password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/60">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Confirm New Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-sm font-medium text-blue-400 mb-2">Password Requirements:</h4>
              <ul className="text-xs text-white/60 space-y-1">
                <li className="flex items-center gap-2">
                  {passwordData.new_password.length >= 8 ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
                  )}
                  At least 8 characters long
                </li>
                <li className="flex items-center gap-2">
                  {/[A-Z]/.test(passwordData.new_password) ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
                  )}
                  Contains uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  {/[a-z]/.test(passwordData.new_password) ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
                  )}
                  Contains lowercase letter
                </li>
                <li className="flex items-center gap-2">
                  {/[0-9]/.test(passwordData.new_password) ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
                  )}
                  Contains number
                </li>
                <li className="flex items-center gap-2">
                  {/[^a-zA-Z0-9]/.test(passwordData.new_password) ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
                  )}
                  Contains special character
                </li>
              </ul>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium rounded-lg transition-colors"
              >
                <Lock size={20} />
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Two-Factor Authentication */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                    <Shield size={20} />
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-white/60">
                    Add an extra layer of security to your account. Coming soon!
                  </p>
                </div>
                <button
                  disabled
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    twoFactorEnabled ? 'bg-blue-500' : 'bg-white/20'
                  } opacity-50 cursor-not-allowed`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Monitor size={20} />
                Active Sessions
              </h3>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{session.device}</p>
                        {session.current && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/60 mt-1">{session.location}</p>
                      <p className="text-xs text-white/40 mt-1">Last active: {session.lastActive}</p>
                    </div>
                    {!session.current && (
                      <button
                        onClick={() => handleLogoutSession(session.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Delete Account */}
            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
              <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
                <Trash2 size={20} />
                Delete Account
              </h3>
              <p className="text-sm text-white/60 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-lg border border-red-500/30 transition-colors"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-lg">
                    <p className="text-sm text-red-300 font-medium">
                      Are you absolutely sure? This action cannot be undone.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-medium rounded-lg transition-colors"
                    >
                      {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={loading}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:bg-white/5 text-white font-medium rounded-lg border border-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
