import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const BioPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [bio, setBio] = useState('I love learning Science and Math! Grade 7 student at Urban Home School. Aspiring scientist and coder.');
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Edit Bio</h1>
          <p className="text-gray-600 dark:text-white/70">Tell others about yourself</p>
        </div>
      </div>

      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <label className="text-gray-900 dark:text-white font-medium mb-2 block">About Me</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write a short bio about yourself..."
          rows={5}
          maxLength={300}
          className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000] resize-none`}
        />
        <p className="text-gray-400 dark:text-white/30 text-xs mt-1 text-right">{bio.length}/300</p>
      </div>

      <button
        onClick={handleSave}
        className={`w-full py-2.5 ${saved ? 'bg-green-600' : 'bg-[#FF0000] hover:bg-[#FF0000]/80'} text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}
      >
        {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Bio'}
      </button>
    </div>
  );
};

export default BioPage;
