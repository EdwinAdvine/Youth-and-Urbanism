import React from 'react';
import { Monitor, MonitorOff, StopCircle } from 'lucide-react';

interface ScreenSharePanelProps {
  isSharing: boolean;
  onToggle: () => void;
}

const ScreenSharePanel: React.FC<ScreenSharePanelProps> = ({ isSharing, onToggle }) => {
  return (
    <div
      className={`rounded-xl border overflow-hidden transition-colors ${
        isSharing
          ? 'bg-[#E40000]/5 border-[#E40000]/30'
          : 'bg-white dark:bg-[#181C1F] border-gray-200 dark:border-[#22272B]'
      }`}
    >
      <div className="p-4">
        {isSharing ? (
          <div className="space-y-3">
            {/* Active sharing indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E40000] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E40000]" />
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">You are sharing your screen</span>
            </div>

            {/* Screen preview placeholder */}
            <div className="aspect-video bg-gray-100 dark:bg-[#22272B]/50 rounded-lg border border-gray-200 dark:border-[#22272B] flex items-center justify-center">
              <div className="text-center">
                <Monitor className="w-8 h-8 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 dark:text-white/30">Screen preview</span>
              </div>
            </div>

            {/* Stop sharing button */}
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#E40000] text-gray-900 dark:text-white text-sm font-medium hover:bg-[#E40000]/90 transition-colors"
            >
              <StopCircle className="w-4 h-4" />
              Stop Sharing
            </button>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#22272B] flex items-center justify-center mx-auto">
              <MonitorOff className="w-6 h-6 text-gray-400 dark:text-white/30" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Not sharing screen</p>
              <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">Share your screen with participants</p>
            </div>
            <button
              onClick={onToggle}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-900 dark:text-white text-sm font-medium hover:bg-[#333] hover:border-gray-300 dark:hover:border-[#333] transition-colors"
            >
              <Monitor className="w-4 h-4" />
              Share Screen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenSharePanel;
