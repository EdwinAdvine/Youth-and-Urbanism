import React from 'react';
import { Users, TrendingUp, MessageSquare, Heart } from 'lucide-react';

const TeamPulsePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Team Pulse</h1>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">8.5/10</p>
                <p className="text-xs text-white/40">Team Morale</p>
              </div>
            </div>
          </div>
          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">92%</p>
                <p className="text-xs text-white/40">Productivity</p>
              </div>
            </div>
          </div>
          <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">45</p>
                <p className="text-xs text-white/40">Active Discussions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Team Members
          </h2>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#22272B]/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#2A2F34] flex items-center justify-center text-white font-medium">
                  TM
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">Team Member {i}</p>
                  <p className="text-xs text-white/40">Support Specialist</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-400">Active</p>
                  <p className="text-xs text-white/40">15 tasks this week</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPulsePage;
