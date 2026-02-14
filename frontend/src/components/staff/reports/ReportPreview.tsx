import React from 'react';
import { Eye, Download, Share2, FileText, Calendar } from 'lucide-react';

interface ReportPreviewProps {
  reportName: string;
  generatedAt: string;
  format: 'pdf' | 'csv' | 'excel';
  downloadUrl?: string;
  onShare?: () => void;
  previewData?: {
    widgets: Array<{
      type: string;
      data: any;
    }>;
  };
}

const ReportPreview: React.FC<ReportPreviewProps> = ({
  reportName,
  generatedAt,
  format,
  downloadUrl,
  onShare,
  previewData,
}) => {
  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#22272B]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            {reportName}
          </h3>
          <div className="flex items-center gap-2">
            {onShare && (
              <button
                onClick={onShare}
                className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/5"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/5"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(generatedAt).toLocaleString()}
          </span>
          <span className="px-2 py-0.5 bg-[#22272B] rounded-full">
            {format.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Preview */}
      <div className="p-4">
        {previewData ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {previewData.widgets.map((widget, i) => (
              <div key={i} className="p-3 bg-[#22272B]/50 rounded-lg border border-[#2A2F34]">
                <p className="text-xs text-white/40 mb-2">Widget {i + 1}: {widget.type}</p>
                <div className="bg-[#181C1F] rounded p-2">
                  <pre className="text-[10px] text-white/30 overflow-x-auto">
                    {JSON.stringify(widget.data, null, 2).slice(0, 200)}...
                  </pre>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Eye className="w-10 h-10 text-white/10 mb-3" />
            <p className="text-sm text-white/40 mb-1">Preview not available</p>
            <p className="text-xs text-white/30">
              Download the report to view full contents
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {downloadUrl && (
        <div className="p-3 border-t border-[#22272B] bg-[#0F1112]">
          <a
            href={downloadUrl}
            download
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#E40000]/20 text-[#FF4444] text-sm font-medium rounded-lg hover:bg-[#E40000]/30"
          >
            <Download className="w-4 h-4" />
            Download {format.toUpperCase()}
          </a>
        </div>
      )}
    </div>
  );
};

export default ReportPreview;
