import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Send, CheckCircle } from 'lucide-react';

interface TeacherQuestionFormProps {
  onSubmit: (question: { subject: string; text: string }) => void;
}

const TeacherQuestionForm: React.FC<TeacherQuestionFormProps> = ({ onSubmit }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (subject && text.trim()) {
      onSubmit({ subject, text });
      setSubject('');
      setText('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    }
  };

  return (
    <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <h3 className="text-gray-900 dark:text-white font-medium mb-3">Ask Your Teacher</h3>
      <div className="space-y-3">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white focus:outline-none focus:border-[#FF0000]`}
        >
          <option value="" className="bg-white dark:bg-[#181C1F]">Select subject...</option>
          <option value="math" className="bg-white dark:bg-[#181C1F]">Mathematics</option>
          <option value="science" className="bg-white dark:bg-[#181C1F]">Science</option>
          <option value="english" className="bg-white dark:bg-[#181C1F]">English</option>
          <option value="social" className="bg-white dark:bg-[#181C1F]">Social Studies</option>
          <option value="kiswahili" className="bg-white dark:bg-[#181C1F]">Kiswahili</option>
        </select>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your question here..."
          rows={3}
          className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000] resize-none`}
        />
        <button
          onClick={handleSubmit}
          disabled={!subject || !text.trim()}
          className={`w-full py-2.5 ${submitted ? 'bg-green-600' : 'bg-[#FF0000] hover:bg-[#FF0000]/80'} disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}
        >
          {submitted ? <><CheckCircle className="w-4 h-4" /> Sent!</> : <><Send className="w-4 h-4" /> Send Question</>}
        </button>
      </div>
    </div>
  );
};

export default TeacherQuestionForm;
