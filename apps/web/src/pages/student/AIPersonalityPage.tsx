import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft, Bot, CheckCircle } from 'lucide-react';

const personalities = [
  { id: 'friendly', label: 'Friendly Guide', description: 'Warm and encouraging, uses simple language', emoji: '😊' },
  { id: 'strict', label: 'Strict Teacher', description: 'Focused and disciplined, pushes you to do better', emoji: '📚' },
  { id: 'fun', label: 'Fun Buddy', description: 'Uses jokes and games, makes learning playful', emoji: '🎮' },
  { id: 'patient', label: 'Patient Mentor', description: 'Takes time to explain, never rushes', emoji: '🧘' },
];

const AIPersonalityPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [selected, setSelected] = useState('friendly');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Bot className="w-8 h-8 text-purple-400" /> AI Personality
          </h1>
          <p className="text-gray-600 dark:text-white/70">Choose how your AI tutor interacts with you</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {personalities.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`p-5 ${borderRadius} text-left transition-all ${
              selected === p.id
                ? 'bg-purple-500/10 border-2 border-purple-500/50 scale-[1.02]'
                : 'bg-white dark:bg-[#181C1F] border-2 border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20'
            }`}
          >
            <span className="text-3xl mb-3 block">{p.emoji}</span>
            <h3 className="text-gray-900 dark:text-white font-semibold">{p.label}</h3>
            <p className="text-gray-500 dark:text-white/50 text-sm mt-1">{p.description}</p>
          </button>
        ))}
      </div>

      <button
        onClick={handleSave}
        className={`w-full py-2.5 ${saved ? 'bg-green-600' : 'bg-purple-500 hover:bg-purple-600'} text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}
      >
        {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Personality'}
      </button>
    </div>
  );
};

export default AIPersonalityPage;
