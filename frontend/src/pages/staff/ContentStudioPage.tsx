import React from 'react';
import { Plus, Grid, List } from 'lucide-react';

const ContentStudioPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Content Studio</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#181C1F] border border-[#22272B] rounded-lg p-1">
              <button className="p-1.5 rounded bg-[#E40000]/20 text-[#FF4444]">
                <Grid className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded text-white/40">
                <List className="w-4 h-4" />
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30">
              <Plus className="w-4 h-4" />
              New Content
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#181C1F] border border-[#22272B] rounded-xl p-4 hover:border-[#E40000]/30 cursor-pointer">
              <div className="aspect-video bg-[#22272B] rounded-lg mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">Content Item {i}</h3>
              <p className="text-xs text-white/40">Grade 8 • Mathematics</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentStudioPage;
