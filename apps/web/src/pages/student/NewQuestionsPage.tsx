import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';

const NewQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!title || !body || !subject) return;
    setSubmitted(true);
    setTimeout(() => navigate('/dashboard/student/community/discussions'), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Ask a Question</h1>
          <p className="text-gray-600 dark:text-white/70">Get help from classmates and teachers</p>
        </div>
      </div>

      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] space-y-4`}>
        <div>
          <label className="text-gray-500 dark:text-white/60 text-sm mb-1 block">Subject</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white focus:outline-none focus:border-[#FF0000]`}>
            <option value="" className="bg-white dark:bg-[#181C1F]">Select subject...</option>
            <option value="math" className="bg-white dark:bg-[#181C1F]">Mathematics</option>
            <option value="science" className="bg-white dark:bg-[#181C1F]">Science</option>
            <option value="english" className="bg-white dark:bg-[#181C1F]">English</option>
            <option value="social" className="bg-white dark:bg-[#181C1F]">Social Studies</option>
            <option value="kiswahili" className="bg-white dark:bg-[#181C1F]">Kiswahili</option>
            <option value="general" className="bg-white dark:bg-[#181C1F]">General</option>
          </select>
        </div>
        <div>
          <label className="text-gray-500 dark:text-white/60 text-sm mb-1 block">Question Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's your question?" className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`} />
        </div>
        <div>
          <label className="text-gray-500 dark:text-white/60 text-sm mb-1 block">Details</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Provide more details about your question..." rows={5} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000] resize-none`} />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!title || !body || !subject || submitted}
          className={`w-full py-2.5 ${submitted ? 'bg-green-600' : 'bg-[#FF0000] hover:bg-[#FF0000]/80'} disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}
        >
          {submitted ? <><CheckCircle className="w-4 h-4" /> Posted!</> : <><Send className="w-4 h-4" /> Post Question</>}
        </button>
      </div>
    </div>
  );
};

export default NewQuestionsPage;
