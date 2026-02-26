import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { AlertTriangle, ArrowLeft, Send, CheckCircle, Phone } from 'lucide-react';

const UrgentFlagPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [issue, setIssue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!issue) return;
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-red-400" /> Urgent Support
          </h1>
          <p className="text-gray-600 dark:text-white/70">For issues that need immediate attention</p>
        </div>
      </div>

      {!submitted ? (
        <>
          <div className={`p-5 bg-red-500/10 ${borderRadius} border border-red-500/20`}>
            <p className="text-gray-600 dark:text-white/70 text-sm">Use this form only for urgent issues like account lockouts, payment problems, or safety concerns. For general questions, please use the regular support channels.</p>
          </div>

          <div className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
            <label className="text-gray-900 dark:text-white font-medium mb-2 block">Describe your urgent issue</label>
            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Please describe what happened..."
              rows={5}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-red-500 resize-none`}
            />
            <button
              onClick={handleSubmit}
              disabled={!issue}
              className={`w-full mt-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-gray-900 dark:text-white font-bold ${borderRadius} flex items-center justify-center gap-2`}
            >
              <Send className="w-5 h-5" /> Flag Urgent Issue
            </button>
          </div>

          <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center gap-3`}>
            <Phone className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-gray-900 dark:text-white font-medium text-sm">Need immediate help?</p>
              <p className="text-gray-400 dark:text-white/40 text-xs">Call our support line for urgent matters</p>
            </div>
            <button className={`px-3 py-1.5 bg-green-500 hover:bg-green-600 text-gray-900 dark:text-white text-sm ${borderRadius} ml-auto`}>
              Call Now
            </button>
          </div>
        </>
      ) : (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Issue Flagged</h2>
          <p className="text-gray-500 dark:text-white/60 mb-4">Our support team has been notified and will respond within 30 minutes.</p>
          <button onClick={() => navigate('/dashboard/student/support')} className={`px-6 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white ${borderRadius}`}>
            Back to Support
          </button>
        </div>
      )}
    </div>
  );
};

export default UrgentFlagPage;
