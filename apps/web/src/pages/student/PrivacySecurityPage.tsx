import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Shield, Lock, Eye, EyeOff, UserCheck, Download, AlertTriangle, CheckCircle, Key, Smartphone, ChevronRight } from 'lucide-react';

const PrivacySecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showProfile, setShowProfile] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [showStreak, setShowStreak] = useState(true);
  const [showOnline, setShowOnline] = useState(false);
  const [aiDataUsage, setAiDataUsage] = useState(true);

  const teacherAccess = [
    { name: 'Ms. Wanjiku', subject: 'Mathematics', canViewProgress: true, canViewMood: false, canMessage: true },
    { name: 'Mr. Ochieng', subject: 'Science', canViewProgress: true, canViewMood: true, canMessage: true },
    { name: 'Mrs. Kamau', subject: 'English', canViewProgress: true, canViewMood: false, canMessage: true },
  ];

  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full transition-colors relative ${enabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-white/20'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
        enabled ? 'translate-x-5' : 'translate-x-0.5'
      }`} />
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Shield className="w-8 h-8 text-green-400" /> Privacy & Security
        </h1>
        <p className="text-gray-600 dark:text-white/70">Manage your privacy settings and data</p>
      </div>

      {/* COPPA Consent Status */}
      <div className={`p-4 bg-green-500/10 ${borderRadius} border border-green-500/20 flex items-center gap-3`}>
        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
        <div>
          <p className="text-gray-900 dark:text-white text-sm font-medium">Parental Consent Active</p>
          <p className="text-gray-500 dark:text-white/50 text-xs">Approved by parent on Jan 15, 2025. Expires Jan 15, 2026.</p>
        </div>
      </div>

      {/* Profile Visibility */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-blue-400" />
          <h3 className="text-gray-900 dark:text-white font-medium">Profile Visibility</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-900 dark:text-white text-sm">Show Profile to Classmates</div>
              <div className="text-gray-400 dark:text-white/40 text-xs">Others can see your name and avatar</div>
            </div>
            <Toggle enabled={showProfile} onToggle={() => setShowProfile(!showProfile)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-900 dark:text-white text-sm">Show Progress</div>
              <div className="text-gray-400 dark:text-white/40 text-xs">Display your level, XP, and badges</div>
            </div>
            <Toggle enabled={showProgress} onToggle={() => setShowProgress(!showProgress)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-900 dark:text-white text-sm">Show Streak</div>
              <div className="text-gray-400 dark:text-white/40 text-xs">Display your current streak on leaderboard</div>
            </div>
            <Toggle enabled={showStreak} onToggle={() => setShowStreak(!showStreak)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-900 dark:text-white text-sm">Show Online Status</div>
              <div className="text-gray-400 dark:text-white/40 text-xs">Let friends see when you are online</div>
            </div>
            <Toggle enabled={showOnline} onToggle={() => setShowOnline(!showOnline)} />
          </div>
        </div>
      </div>

      {/* Teacher Access Controls */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="w-5 h-5 text-purple-400" />
          <h3 className="text-gray-900 dark:text-white font-medium">Teacher Access</h3>
        </div>
        <p className="text-gray-400 dark:text-white/40 text-xs mb-3">Control what teachers can see about your account</p>
        <div className="space-y-3">
          {teacherAccess.map((teacher) => (
            <div key={teacher.name} className={`p-3 bg-gray-50 dark:bg-white/5 ${borderRadius}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-gray-900 dark:text-white text-sm font-medium">{teacher.name}</span>
                  <span className={`ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs ${borderRadius}`}>{teacher.subject}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 text-xs ${borderRadius} ${
                  teacher.canViewProgress ? 'bg-green-500/20 text-green-400' : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40'
                }`}>
                  {teacher.canViewProgress ? 'Progress' : 'No Progress'}
                </span>
                <span className={`px-2 py-0.5 text-xs ${borderRadius} ${
                  teacher.canViewMood ? 'bg-green-500/20 text-green-400' : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40'
                }`}>
                  {teacher.canViewMood ? 'Mood' : 'No Mood'}
                </span>
                <span className={`px-2 py-0.5 text-xs ${borderRadius} ${
                  teacher.canMessage ? 'bg-green-500/20 text-green-400' : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40'
                }`}>
                  {teacher.canMessage ? 'Messages' : 'No Messages'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Data Usage */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-yellow-400" />
          <h3 className="text-gray-900 dark:text-white font-medium">AI & Data</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-900 dark:text-white text-sm">Allow AI to use my learning data</div>
            <div className="text-gray-400 dark:text-white/40 text-xs">Helps personalize your AI tutor experience</div>
          </div>
          <Toggle enabled={aiDataUsage} onToggle={() => setAiDataUsage(!aiDataUsage)} />
        </div>
      </div>

      {/* Security */}
      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-orange-400" />
          <h3 className="text-gray-900 dark:text-white font-medium">Security</h3>
        </div>
        <div className="space-y-3">
          <button onClick={() => setShowChangePassword(!showChangePassword)} className={`w-full p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius} flex items-center gap-3 text-left`}>
            <Lock className="w-4 h-4 text-gray-400 dark:text-white/40" />
            <div className="flex-1">
              <div className="text-gray-900 dark:text-white text-sm">Change Password</div>
              <div className="text-gray-400 dark:text-white/40 text-xs">Last changed 30 days ago</div>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 dark:text-white/30 transition-transform ${showChangePassword ? 'rotate-90' : ''}`} />
          </button>
          {showChangePassword && (
            <div className={`p-4 bg-gray-50 dark:bg-white/5 ${borderRadius} space-y-3`}>
              <input type="password" placeholder="Current password" className={`w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 text-sm`} />
              <input type="password" placeholder="New password" className={`w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 text-sm`} />
              <input type="password" placeholder="Confirm new password" className={`w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 text-sm`} />
              <button className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius}`}>Update Password</button>
            </div>
          )}
          <button onClick={() => navigate('/dashboard/student/privacy/teacher-access')} className={`w-full p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius} flex items-center gap-3 text-left`}>
            <Smartphone className="w-4 h-4 text-gray-400 dark:text-white/40" />
            <div className="flex-1">
              <div className="text-gray-900 dark:text-white text-sm">Two-Factor Authentication</div>
              <div className="text-gray-400 dark:text-white/40 text-xs">Not enabled</div>
            </div>
            <span className={`px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs ${borderRadius}`}>Recommended</span>
          </button>
          <button onClick={() => navigate('/dashboard/student/privacy/teacher-access')} className={`w-full p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius} flex items-center gap-3 text-left`}>
            <EyeOff className="w-4 h-4 text-gray-400 dark:text-white/40" />
            <div className="flex-1">
              <div className="text-gray-900 dark:text-white text-sm">Active Sessions</div>
              <div className="text-gray-400 dark:text-white/40 text-xs">1 active session</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-white/30" />
          </button>
        </div>
      </div>

      {/* Data Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            const data = JSON.stringify({ profile: { showProfile, showProgress, showStreak, showOnline }, aiDataUsage }, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my_data.json';
            a.click();
            URL.revokeObjectURL(url);
          }}
          className={`flex-1 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 ${borderRadius} flex items-center justify-center gap-2 text-sm`}
        >
          <Download className="w-4 h-4" /> Download My Data
        </button>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
              navigate('/');
            }
          }}
          className={`flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 ${borderRadius} flex items-center justify-center gap-2 text-sm`}
        >
          <AlertTriangle className="w-4 h-4" /> Delete Account
        </button>
      </div>
    </div>
  );
};

export default PrivacySecurityPage;
