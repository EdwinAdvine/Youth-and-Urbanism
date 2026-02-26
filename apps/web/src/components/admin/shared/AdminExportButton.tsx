import React, { useState, useRef, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

interface AdminExportButtonProps {
  onExport: (format: ExportFormat) => void;
  isLoading?: boolean;
  formats?: ExportFormat[];
  className?: string;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: 'CSV',
  excel: 'Excel (.xlsx)',
  pdf: 'PDF',
};

const AdminExportButton: React.FC<AdminExportButtonProps> = ({
  onExport,
  isLoading = false,
  formats = ['csv', 'excel', 'pdf'],
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#333] rounded-lg text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-[#2A2F33] transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export
      </button>

      {isOpen && !isLoading && (
        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#1E2225] border border-gray-200 dark:border-[#333] rounded-lg shadow-lg z-50 overflow-hidden">
          {formats.map((format) => (
            <button
              key={format}
              onClick={() => {
                onExport(format);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-sm text-left text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-[#22272B] transition-colors"
            >
              {FORMAT_LABELS[format]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminExportButton;
