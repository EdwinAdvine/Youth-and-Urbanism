import React from 'react';
import { GraduationCap, Settings, LayoutGrid } from 'lucide-react';
import { useStaffStore } from '../../../store/staffStore';

const ViewToggle: React.FC = () => {
  const { viewMode, setViewMode } = useStaffStore();

  const modes = [
    { key: 'teacher_focus' as const, label: 'Teacher Focus', icon: GraduationCap, description: 'Content, assessments, sessions' },
    { key: 'operations_focus' as const, label: 'Ops Focus', icon: Settings, description: 'Tickets, moderation, metrics' },
    { key: 'custom' as const, label: 'Custom', icon: LayoutGrid, description: 'Your custom layout' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-[#22272B] rounded-lg">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = viewMode === mode.key;
        return (
          <button
            key={mode.key}
            onClick={() => setViewMode(mode.key)}
            title={mode.description}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
              isActive
                ? 'bg-[#E40000]/20 text-[#FF4444] shadow-sm'
                : 'text-white/50 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewToggle;
