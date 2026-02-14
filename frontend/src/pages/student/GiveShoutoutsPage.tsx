import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft, Star, Send, CheckCircle } from 'lucide-react';

const classmates = ['Amina W.', 'Brian K.', 'Jane M.', 'Peter O.', 'Sarah N.', 'David T.', 'Grace A.', 'Samuel L.'];

const GiveShoutoutsPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [selectedClassmate, setSelectedClassmate] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!selectedClassmate || !message) return;
    setSent(true);
    setTimeout(() => { setSent(false); setSelectedClassmate(''); setMessage(''); }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2"><Star className="w-8 h-8 text-yellow-400" /> Give a Shoutout</h1>
          <p className="text-gray-600 dark:text-white/70">Encourage and celebrate your classmates</p>
        </div>
      </div>

      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] space-y-4`}>
        <div>
          <label className="text-gray-500 dark:text-white/60 text-sm mb-2 block">Who do you want to encourage?</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {classmates.map((c) => (
              <button key={c} onClick={() => setSelectedClassmate(c)} className={`px-3 py-2 ${borderRadius} text-sm ${selectedClassmate === c ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-gray-500 dark:text-white/60 text-sm mb-1 block">Your message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write something encouraging..." rows={3} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-yellow-500 resize-none`} />
        </div>
        <button
          onClick={handleSend}
          disabled={!selectedClassmate || !message || sent}
          className={`w-full py-2.5 ${sent ? 'bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-black font-medium ${borderRadius} flex items-center justify-center gap-2`}
        >
          {sent ? <><CheckCircle className="w-4 h-4" /> Sent!</> : <><Send className="w-4 h-4" /> Send Shoutout</>}
        </button>
      </div>
    </div>
  );
};

export default GiveShoutoutsPage;
