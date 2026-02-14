import React, { useState } from 'react';
import { Bell, Moon, Globe, Zap, Save } from 'lucide-react';

const StaffPreferencesPage: React.FC = () => {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="min-h-screen bg-[#0F1112] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Preferences</h1>

        <div className="space-y-4">
          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              Notifications
            </h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-[#22272B]/50 rounded-lg cursor-pointer">
                <span className="text-sm text-white">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="w-5 h-5 rounded bg-[#181C1F] border-[#2A2F34] text-[#E40000] focus:ring-[#E40000]"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-[#22272B]/50 rounded-lg cursor-pointer">
                <span className="text-sm text-white">Push Notifications</span>
                <input
                  type="checkbox"
                  checked={pushNotifs}
                  onChange={(e) => setPushNotifs(e.target.checked)}
                  className="w-5 h-5 rounded bg-[#181C1F] border-[#2A2F34] text-[#E40000] focus:ring-[#E40000]"
                />
              </label>
            </div>
          </div>

          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-400" />
              Appearance
            </h2>
            <label className="flex items-center justify-between p-3 bg-[#22272B]/50 rounded-lg cursor-pointer">
              <span className="text-sm text-white">Dark Mode</span>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="w-5 h-5 rounded bg-[#181C1F] border-[#2A2F34] text-[#E40000] focus:ring-[#E40000]"
              />
            </label>
          </div>

          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-400" />
              Language & Region
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/50 block mb-1.5">Language</label>
                <select className="w-full bg-[#22272B] border border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-white">
                  <option>English</option>
                  <option>Swahili</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1.5">Timezone</label>
                <select className="w-full bg-[#22272B] border border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-white">
                  <option>Africa/Nairobi (EAT)</option>
                </select>
              </div>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30">
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffPreferencesPage;
