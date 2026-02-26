import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Upload, File, Image, FileText, X, CheckCircle2, Save } from 'lucide-react';

interface UploadedFile {
  name: string;
  size: string;
  type: string;
}

const ProjectUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [notes, setNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'submitted' | 'drafted'>('idle');

  const addFile = () => {
    setFiles(prev => [...prev, { name: `project_file_${prev.length + 1}.pdf`, size: '2.4 MB', type: 'pdf' }]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fileIcon = (type: string) => {
    if (type.includes('image')) return <Image className="w-5 h-5 text-blue-400" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />;
    return <File className="w-5 h-5 text-gray-400 dark:text-white/40" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upload Project</h1>
        <p className="text-gray-600 dark:text-white/70">Submit your project files for review</p>
      </div>

      {/* Drop Zone */}
      <div
        onClick={addFile}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFile(); }}
        className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border-2 border-dashed ${isDragging ? 'border-[#FF0000] bg-[#FF0000]/5' : 'border-gray-200 dark:border-[#22272B]'} text-center cursor-pointer hover:border-white/30 transition-colors`}
      >
        <Upload className="w-12 h-12 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-white/60 mb-2">Drag & drop files here, or click to browse</p>
        <p className="text-gray-400 dark:text-white/30 text-sm">Supports: PDF, DOC, Images, ZIP (max 25MB)</p>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
          <h3 className="text-gray-900 dark:text-white font-medium mb-3">Uploaded Files ({files.length})</h3>
          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={i} className={`p-3 bg-gray-50 dark:bg-white/5 ${borderRadius} flex items-center gap-3`}>
                {fileIcon(file.type)}
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white text-sm">{file.name}</p>
                  <p className="text-gray-400 dark:text-white/40 text-xs">{file.size}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <button onClick={() => removeFile(i)} className="text-gray-400 dark:text-white/30 hover:text-red-400"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="text-gray-900 dark:text-white font-medium mb-2 block">Submission Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes for your teacher about this submission..."
          className={`w-full h-24 px-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000] resize-none`}
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          disabled={files.length === 0 || submitStatus === 'submitting'}
          onClick={() => {
            setSubmitStatus('submitting');
            setTimeout(() => {
              setSubmitStatus('submitted');
              setTimeout(() => navigate('/dashboard/student/projects/active'), 1500);
            }, 1500);
          }}
          className={`px-6 py-3 ${submitStatus === 'submitted' ? 'bg-green-500' : 'bg-[#FF0000] hover:bg-[#FF0000]/80'} text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2 disabled:opacity-50`}
        >
          {submitStatus === 'submitting' ? <><Upload className="w-4 h-4 animate-pulse" /> Submitting...</> :
           submitStatus === 'submitted' ? <><CheckCircle2 className="w-4 h-4" /> Submitted!</> :
           <><Upload className="w-4 h-4" /> Submit Project</>}
        </button>
        <button
          onClick={() => {
            setSubmitStatus('drafted');
            setTimeout(() => setSubmitStatus('idle'), 2000);
          }}
          className={`px-6 py-3 ${submitStatus === 'drafted' ? 'bg-green-500/20 text-green-400' : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white'} ${borderRadius} flex items-center gap-2`}
        >
          {submitStatus === 'drafted' ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save as Draft</>}
        </button>
      </div>
    </div>
  );
};

export default ProjectUploadPage;
