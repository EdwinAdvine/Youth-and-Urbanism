import React, { useState, useRef } from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Upload, X, FileText } from 'lucide-react';

interface FileUploaderProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesChange, maxFiles = 5, accept }) => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const all = [...files, ...Array.from(newFiles)].slice(0, maxFiles);
    setFiles(all);
    onFilesChange(all);
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesChange(updated);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`p-8 border-2 border-dashed ${borderRadius} text-center cursor-pointer transition-colors ${
          dragOver ? 'border-[#FF0000] bg-[#FF0000]/10' : 'border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 hover:border-white/30'
        }`}
      >
        <Upload className="w-8 h-8 text-gray-400 dark:text-white/40 mx-auto mb-2" />
        <p className="text-gray-500 dark:text-white/60 text-sm">Drag files here or click to upload</p>
        <p className="text-gray-400 dark:text-white/30 text-xs mt-1">Max {maxFiles} files</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => addFiles(e.target.files)}
          className="hidden"
        />
      </div>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => (
            <div key={i} className={`p-3 bg-gray-50 dark:bg-white/5 ${borderRadius} flex items-center gap-3`}>
              <FileText className="w-4 h-4 text-gray-400 dark:text-white/40 flex-shrink-0" />
              <span className="text-gray-600 dark:text-white/70 text-sm flex-1 truncate">{file.name}</span>
              <span className="text-gray-400 dark:text-white/30 text-xs">{(file.size / 1024).toFixed(0)}KB</span>
              <button onClick={() => removeFile(i)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded">
                <X className="w-3 h-3 text-gray-400 dark:text-white/40" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
