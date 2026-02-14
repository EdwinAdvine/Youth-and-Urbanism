import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import AvatarPicker from '../../components/student/account/AvatarPicker';

const AvatarPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [selectedAvatar, setSelectedAvatar] = useState('1');
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Choose Your Avatar</h1>
          <p className="text-gray-600 dark:text-white/70">Pick an avatar that represents you</p>
        </div>
      </div>

      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <AvatarPicker selectedId={selectedAvatar} onSelect={setSelectedAvatar} />
      </div>

      <button
        onClick={handleSave}
        className={`w-full py-2.5 ${saved ? 'bg-green-600' : 'bg-[#FF0000] hover:bg-[#FF0000]/80'} text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}
      >
        {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Avatar'}
      </button>
    </div>
  );
};

export default AvatarPage;
