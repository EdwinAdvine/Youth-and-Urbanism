import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Save, AlertCircle } from 'lucide-react';
import { getProfile, updateProfile } from '@/services/staff/staffAccountService';
import type { StaffProfile } from '@/types/staff';

const StaffProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [specializations, setSpecializations] = useState('');

  // Original form values for cancel/reset
  const [originalValues, setOriginalValues] = useState({ department: '', position: '', specializations: '' });

  const initializeForm = (p: StaffProfile) => {
    const values = {
      department: p.department || '',
      position: p.position || '',
      specializations: p.specializations?.join(', ') || '',
    };
    setDepartment(values.department);
    setPosition(values.position);
    setSpecializations(values.specializations);
    setOriginalValues(values);
  };

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProfile();
      setProfile(result);
      initializeForm(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await updateProfile({
        department,
        position,
        specializations: specializations.split(',').map(s => s.trim()).filter(Boolean),
      });
      setProfile(result);
      initializeForm(result);
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDepartment(originalValues.department);
    setPosition(originalValues.position);
    setSpecializations(originalValues.specializations);
    setError(null);
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-32 bg-gray-100 dark:bg-[#22272B] rounded animate-pulse" />
          <div className="h-96 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-white text-sm rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const initials = (profile?.department || 'ST').slice(0, 2).toUpperCase();

  const formatJoinDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

        {/* Hidden file input for photo upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={() => {
            // Photo upload UI only for now
          }}
        />

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            {successMessage}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
          </div>
        )}

        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-[#22272B] flex items-center justify-center text-2xl text-gray-900 dark:text-white font-medium">
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile?.position || 'Staff Member'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-white/50">{profile?.department || 'No department'}</p>
              <button
                onClick={handleChangePhoto}
                className="mt-2 text-xs px-3 py-1.5 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30"
              >
                Change Photo
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50 flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5" />
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50 flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5" />
                Position
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50 flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5" />
                Specializations (comma-separated)
              </label>
              <input
                type="text"
                value={specializations}
                onChange={(e) => setSpecializations(e.target.value)}
                placeholder="e.g. Support, Content Review, CBC Alignment"
                className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50 flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Team
              </label>
              <input
                type="text"
                value={profile?.team_name || 'Not assigned'}
                disabled
                className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-500 dark:text-white/50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Joined
              </label>
              <input
                type="text"
                value={formatJoinDate(profile?.hired_at ?? profile?.created_at ?? null)}
                disabled
                className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-500 dark:text-white/50"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-[#22272B]">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/50 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfilePage;
