import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContentEditorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Studio
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30">
            <Save className="w-4 h-4" />
            Save Content
          </button>
        </div>

        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Title</label>
              <input
                type="text"
                placeholder="Content title..."
                className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Description</label>
              <textarea
                placeholder="Content description..."
                rows={4}
                className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-white/30 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEditorPage;
