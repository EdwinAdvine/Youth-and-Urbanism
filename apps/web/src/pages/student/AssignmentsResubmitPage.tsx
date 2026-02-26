import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import FileUploader from '../../components/student/practice/FileUploader';

const AssignmentsResubmitPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: _id } = useParams();
  const { borderRadius } = useAgeAdaptiveUI();
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => navigate('/dashboard/student/assignments/feedback'), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Resubmit Assignment</h1>
          <p className="text-gray-600 dark:text-white/70">Upload your revised work</p>
        </div>
      </div>

      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-medium mb-3">Upload Revised Files</h3>
        <FileUploader onFilesChange={setFiles} maxFiles={3} />
      </div>

      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-medium mb-3">Note to Teacher (Optional)</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe what you changed or improved..."
          rows={4}
          className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000] resize-none`}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={files.length === 0 || submitted}
        className={`w-full py-3 ${submitted ? 'bg-green-600' : 'bg-[#FF0000] hover:bg-[#FF0000]/80'} disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-white/30 text-gray-900 dark:text-white font-bold ${borderRadius} flex items-center justify-center gap-2`}
      >
        {submitted ? <><CheckCircle className="w-5 h-5" /> Resubmitted!</> : <><Send className="w-5 h-5" /> Resubmit Assignment</>}
      </button>
    </div>
  );
};

export default AssignmentsResubmitPage;
