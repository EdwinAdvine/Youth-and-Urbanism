import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Hand } from 'lucide-react';

interface HandRaiseProps {
  onRaise?: () => void;
  onLower?: () => void;
}

const HandRaise: React.FC<HandRaiseProps> = ({ onRaise, onLower }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [raised, setRaised] = useState(false);

  const toggle = () => {
    if (raised) {
      onLower?.();
    } else {
      onRaise?.();
    }
    setRaised(!raised);
  };

  return (
    <button
      onClick={toggle}
      className={`px-4 py-2 ${borderRadius} flex items-center gap-2 text-sm transition-colors ${
        raised
          ? 'bg-yellow-500 text-black font-medium'
          : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
      }`}
    >
      <Hand className="w-4 h-4" />
      {raised ? 'Hand Raised' : 'Raise Hand'}
    </button>
  );
};

export default HandRaise;
