import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp, RotateCcw, User, Clock } from 'lucide-react';

interface VersionItem {
  version: number;
  createdBy: string;
  createdAt: string;
  changesSummary: string;
}

interface ContentVersionHistoryProps {
  versions: VersionItem[];
  onRollback: (versionNumber: number) => void;
  currentVersion: number;
}

const ContentVersionHistory: React.FC<ContentVersionHistoryProps> = ({
  versions,
  onRollback,
  currentVersion,
}) => {
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
  const [confirmRollback, setConfirmRollback] = useState<number | null>(null);

  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  const toggleExpand = (version: number) => {
    setExpandedVersion(expandedVersion === version ? null : version);
    setConfirmRollback(null);
  };

  const handleRollback = (versionNumber: number) => {
    if (confirmRollback === versionNumber) {
      onRollback(versionNumber);
      setConfirmRollback(null);
    } else {
      setConfirmRollback(versionNumber);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#22272B]">
        <History className="w-4 h-4 text-white/60" />
        <h3 className="text-sm font-semibold text-white">Version History</h3>
        <span className="ml-auto text-xs text-white/40">
          {versions.length} version{versions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Timeline */}
      <div className="p-4">
        {sortedVersions.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-6">No version history available</p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-3 bottom-3 w-px bg-[#22272B]" />

            <div className="space-y-1">
              {sortedVersions.map((version) => {
                const isCurrent = version.version === currentVersion;
                const isExpanded = expandedVersion === version.version;

                return (
                  <div key={version.version} className="relative pl-8">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-1.5 top-3 w-3 h-3 rounded-full border-2 ${
                        isCurrent
                          ? 'bg-[#E40000] border-[#E40000]'
                          : 'bg-[#22272B] border-[#333]'
                      }`}
                    />

                    <button
                      onClick={() => toggleExpand(version.version)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isExpanded ? 'bg-[#22272B]' : 'hover:bg-[#22272B]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            v{version.version}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E40000]/20 text-[#E40000] font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-white/40" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {version.createdBy}
                        </span>
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(version.createdAt)}
                        </span>
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="mx-3 mb-2 px-3 pb-3">
                        <p className="text-xs text-white/60 leading-relaxed mb-3">
                          {version.changesSummary}
                        </p>
                        {!isCurrent && (
                          <button
                            onClick={() => handleRollback(version.version)}
                            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                              confirmRollback === version.version
                                ? 'bg-[#E40000] text-white'
                                : 'bg-[#E40000]/10 text-[#E40000] hover:bg-[#E40000]/20'
                            }`}
                          >
                            <RotateCcw className="w-3 h-3" />
                            {confirmRollback === version.version
                              ? 'Click again to confirm rollback'
                              : 'Restore this version'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentVersionHistory;
