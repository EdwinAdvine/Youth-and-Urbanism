import React, { useState } from 'react';
import { User, Save, Upload, Plus, X } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState({
    display_name: 'John Instructor',
    bio: 'Experienced mathematics teacher with 10+ years helping students excel.',
    tagline: 'Making math fun and accessible for all learners',
    specializations: ['Mathematics', 'Science'],
    qualifications: ['BSc Mathematics', 'PGDE'],
    languages: ['English', 'Swahili'],
  });

  const [newSpecialization, setNewSpecialization] = useState('');

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Instructor Profile"
        description="Manage your professional profile and credentials"
        icon={<User className="w-6 h-6 text-purple-400" />}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo */}
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Photo</h3>
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-purple-500/20 flex items-center justify-center">
              <User className="w-16 h-16 text-purple-400" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg transition-colors text-sm">
              <Upload className="w-4 h-4" />
              Upload Photo
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="lg:col-span-2 bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">Display Name</label>
            <input
              type="text"
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">Tagline</label>
            <input
              type="text"
              value={profile.tagline}
              onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Specializations */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Specializations</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.specializations.map((spec, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg flex items-center gap-2"
            >
              {spec}
              <button className="hover:text-purple-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSpecialization}
            onChange={(e) => setNewSpecialization(e.target.value)}
            placeholder="Add specialization..."
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          />
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Qualifications */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Qualifications</h3>
        <div className="space-y-2">
          {profile.qualifications.map((qual, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
              <span className="text-gray-900 dark:text-white">{qual}</span>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded">
                <X className="w-4 h-4 text-gray-500 dark:text-white/60" />
              </button>
            </div>
          ))}
          <button className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg transition-colors text-sm">
            + Add Qualification
          </button>
        </div>
      </div>
    </div>
  );
};
