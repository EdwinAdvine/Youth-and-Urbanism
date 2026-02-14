import React from 'react';
import { Plus, Save, Eye } from 'lucide-react';

const AssessmentBuilderPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assessment Builder</h1>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30">
              <Save className="w-4 h-4" />
              Save Assessment
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Assessment Title</label>
              <input
                type="text"
                placeholder="Enter assessment title..."
                className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30"
              />
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-[#22272B] border border-dashed border-gray-200 dark:border-[#2A2F34] rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:border-[#E40000]/30">
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentBuilderPage;
