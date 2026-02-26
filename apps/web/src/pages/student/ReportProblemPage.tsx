import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { reportProblem } from '../../services/student/studentSupportService';
import { ArrowLeft, Bug, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ReportProblemPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!category || !description) return;

    setLoading(true);
    setError(null);

    try {
      await reportProblem({
        problem_type: category,
        description: steps ? `${description}\n\nSteps to reproduce:\n${steps}` : description,
        urgency: 'normal',
      });

      setSubmitted(true);
      setTimeout(() => navigate('/dashboard/student/support'), 2000);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to submit report. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Bug className="w-8 h-8 text-orange-400" /> Report a Problem
          </h1>
          <p className="text-gray-600 dark:text-white/70">Help us fix issues by reporting them</p>
        </div>
      </div>

      <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] space-y-4`}>
        <div>
          <label className="text-gray-500 dark:text-white/60 text-sm mb-1 block">Problem Type</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white focus:outline-none focus:border-[#FF0000]`}>
            <option value="" className="bg-white dark:bg-[#181C1F]">Select type...</option>
            <option value="bug" className="bg-white dark:bg-[#181C1F]">Bug / Something is broken</option>
            <option value="ui" className="bg-white dark:bg-[#181C1F]">Display / UI issue</option>
            <option value="performance" className="bg-white dark:bg-[#181C1F]">Slow / Not loading</option>
            <option value="content" className="bg-white dark:bg-[#181C1F]">Wrong content / Errors in material</option>
            <option value="other" className="bg-white dark:bg-[#181C1F]">Other</option>
          </select>
        </div>
        <div>
          <label className="text-gray-500 dark:text-white/60 text-sm mb-1 block">What went wrong?</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the problem..." rows={4} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000] resize-none`} />
        </div>
        <div>
          <label className="text-gray-500 dark:text-white/60 text-sm mb-1 block">Steps to reproduce (optional)</label>
          <textarea value={steps} onChange={(e) => setSteps(e.target.value)} placeholder="1. Go to...\n2. Click on...\n3. See error" rows={3} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000] resize-none`} />
        </div>

        {error && (
          <div className={`p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!category || !description || submitted || loading}
          className={`w-full py-2.5 ${submitted ? 'bg-green-600' : 'bg-[#FF0000] hover:bg-[#FF0000]/80'} disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
          ) : submitted ? (
            <><CheckCircle className="w-4 h-4" /> Report Submitted!</>
          ) : (
            <><Send className="w-4 h-4" /> Submit Report</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReportProblemPage;
