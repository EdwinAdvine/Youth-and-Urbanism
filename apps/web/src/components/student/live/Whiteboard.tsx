import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Pencil } from 'lucide-react';

const Whiteboard: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <div className="flex items-center gap-2 mb-3">
        <Pencil className="w-4 h-4 text-gray-500 dark:text-white/60" />
        <h3 className="text-gray-900 dark:text-white font-medium text-sm">Collaborative Whiteboard</h3>
      </div>
      <div className={`w-full aspect-video bg-gray-50 dark:bg-white/5 ${borderRadius} flex items-center justify-center border border-dashed border-gray-300 dark:border-white/20`}>
        <p className="text-gray-400 dark:text-white/30 text-sm">Whiteboard canvas — Yjs integration pending</p>
      </div>
    </div>
  );
};

export default Whiteboard;
