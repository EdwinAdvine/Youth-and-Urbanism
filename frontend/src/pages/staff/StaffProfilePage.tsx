import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, Save } from 'lucide-react';

const StaffProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F1112] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

        <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 rounded-full bg-[#22272B] flex items-center justify-center text-2xl text-white font-medium">
              JD
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">Jane Doe</h2>
              <p className="text-sm text-white/50">Support Specialist</p>
              <button className="mt-2 text-xs px-3 py-1.5 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30">
                Change Photo
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/50 flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5" />
                Full Name
              </label>
              <input
                type="text"
                defaultValue="Jane Doe"
                className="w-full bg-[#22272B] border border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5" />
                Email
              </label>
              <input
                type="email"
                defaultValue="jane.doe@tuhs.co.ke"
                className="w-full bg-[#22272B] border border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5" />
                Phone
              </label>
              <input
                type="tel"
                defaultValue="+254 700 000 000"
                className="w-full bg-[#22272B] border border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Location
              </label>
              <input
                type="text"
                defaultValue="Nairobi, Kenya"
                className="w-full bg-[#22272B] border border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Joined
              </label>
              <input
                type="text"
                defaultValue="January 15, 2024"
                disabled
                className="w-full bg-[#22272B] border border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-white/50"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6 pt-6 border-t border-[#22272B]">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button className="px-4 py-2.5 bg-white/5 text-white/50 rounded-lg hover:bg-white/10">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfilePage;
