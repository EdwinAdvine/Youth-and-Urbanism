import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Send, CheckCircle } from 'lucide-react';

interface TicketFormProps {
  onSubmit: (data: { category: string; subject: string; message: string; priority: string }) => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ onSubmit }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitted, setSubmitted] = useState(false);

  const priorityConfig = {
    low: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    high: { color: 'text-red-400', bg: 'bg-red-500/20' },
  };

  const handleSubmit = () => {
    if (!category || !subject || !message) return;
    onSubmit({ category, subject, message, priority });
    setCategory('');
    setSubject('');
    setMessage('');
    setPriority('medium');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <h3 className="text-gray-900 dark:text-white font-medium mb-4">Create Support Ticket</h3>
      <div className="space-y-4">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white focus:outline-none focus:border-green-500`}>
          <option value="" className="bg-white dark:bg-[#181C1F]">Select a category...</option>
          <option value="technical" className="bg-white dark:bg-[#181C1F]">Technical Issue</option>
          <option value="payment" className="bg-white dark:bg-[#181C1F]">Payment Problem</option>
          <option value="course" className="bg-white dark:bg-[#181C1F]">Course Access</option>
          <option value="account" className="bg-white dark:bg-[#181C1F]">Account Issue</option>
          <option value="other" className="bg-white dark:bg-[#181C1F]">Other</option>
        </select>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of your issue" className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-green-500`} />
        <div className="flex gap-2">
          {(['low', 'medium', 'high'] as const).map((p) => (
            <button key={p} onClick={() => setPriority(p)} className={`px-3 py-1.5 ${borderRadius} text-sm capitalize ${priority === p ? `${priorityConfig[p].bg} ${priorityConfig[p].color}` : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60'}`}>
              {p}
            </button>
          ))}
        </div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue in detail..." rows={4} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-green-500 resize-none`} />
        <button disabled={!subject || !message || !category} onClick={handleSubmit} className={`w-full py-2.5 ${submitted ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'} disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}>
          {submitted ? <><CheckCircle className="w-4 h-4" /> Ticket Submitted!</> : <><Send className="w-4 h-4" /> Submit Ticket</>}
        </button>
      </div>
    </div>
  );
};

export default TicketForm;
