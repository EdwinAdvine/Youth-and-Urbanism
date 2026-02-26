import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Check } from 'lucide-react';

const avatarOptions = [
  { id: '1', emoji: '🦁', label: 'Lion' },
  { id: '2', emoji: '🦊', label: 'Fox' },
  { id: '3', emoji: '🐻', label: 'Bear' },
  { id: '4', emoji: '🐼', label: 'Panda' },
  { id: '5', emoji: '🦄', label: 'Unicorn' },
  { id: '6', emoji: '🐲', label: 'Dragon' },
  { id: '7', emoji: '🦅', label: 'Eagle' },
  { id: '8', emoji: '🐬', label: 'Dolphin' },
  { id: '9', emoji: '🦋', label: 'Butterfly' },
  { id: '10', emoji: '🐙', label: 'Octopus' },
  { id: '11', emoji: '🦉', label: 'Owl' },
  { id: '12', emoji: '🐺', label: 'Wolf' },
];

interface AvatarPickerProps {
  selectedId?: string;
  onSelect: (id: string) => void;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({ selectedId, onSelect }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
      {avatarOptions.map((avatar) => (
        <button
          key={avatar.id}
          onClick={() => onSelect(avatar.id)}
          className={`relative aspect-square ${borderRadius} flex flex-col items-center justify-center gap-1 transition-all ${
            selectedId === avatar.id
              ? 'bg-[#FF0000]/20 border-2 border-[#FF0000] scale-105'
              : 'bg-gray-50 dark:bg-white/5 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-white/10'
          }`}
        >
          <span className="text-3xl">{avatar.emoji}</span>
          <span className="text-[10px] text-gray-400 dark:text-white/40">{avatar.label}</span>
          {selectedId === avatar.id && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF0000] rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-gray-900 dark:text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default AvatarPicker;
