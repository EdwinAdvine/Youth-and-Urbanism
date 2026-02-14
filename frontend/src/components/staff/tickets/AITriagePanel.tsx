import React, { useState } from 'react';
import { Sparkles, Check, X, AlertTriangle, Tag, MessageSquare, Gauge } from 'lucide-react';

interface AITriageSuggestion {
  priority: string;
  category: string;
  suggestedResponse: string;
  confidence: number;
}

interface AITriagePanelProps {
  ticketId: string;
  suggestion?: AITriageSuggestion;
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'text-green-400';
  if (confidence >= 0.6) return 'text-amber-400';
  return 'text-orange-400';
};

const getConfidenceLabel = (confidence: number): string => {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.7) return 'High';
  if (confidence >= 0.5) return 'Medium';
  return 'Low';
};

const AITriagePanel: React.FC<AITriagePanelProps> = ({ ticketId: _ticketId, suggestion }) => {
  const [editedResponse, setEditedResponse] = useState(suggestion?.suggestedResponse || '');
  const [isApplied, setIsApplied] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !suggestion) {
    return (
      <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#22272B]">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">AI Triage</h3>
        </div>
        <div className="p-5 text-center">
          <Sparkles className="w-8 h-8 text-white/10 mx-auto mb-2" />
          <p className="text-sm text-white/40">
            {isDismissed ? 'Suggestion dismissed' : 'No AI suggestion available'}
          </p>
          {isDismissed && (
            <button
              onClick={() => setIsDismissed(false)}
              className="mt-2 text-xs text-[#E40000] hover:text-[#E40000]/80 transition-colors"
            >
              Show suggestion again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isApplied) {
    return (
      <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#22272B]">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">AI Triage</h3>
        </div>
        <div className="p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
            <Check className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-sm text-green-400 font-medium">Suggestion Applied</p>
          <p className="text-xs text-white/40 mt-1">Priority and response have been set</p>
        </div>
      </div>
    );
  }

  const confidencePct = Math.round(suggestion.confidence * 100);

  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#22272B]">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-white">AI Triage Suggestion</h3>
        <div className="ml-auto flex items-center gap-1">
          <Gauge className={`w-3 h-3 ${getConfidenceColor(suggestion.confidence)}`} />
          <span className={`text-[10px] font-medium ${getConfidenceColor(suggestion.confidence)}`}>
            {confidencePct}% {getConfidenceLabel(suggestion.confidence)}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Priority & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="w-3 h-3 text-white/40" />
              <span className="text-[10px] uppercase tracking-wider text-white/40">Priority</span>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                PRIORITY_COLORS[suggestion.priority.toLowerCase()] || PRIORITY_COLORS.medium
              }`}
            >
              {suggestion.priority}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Tag className="w-3 h-3 text-white/40" />
              <span className="text-[10px] uppercase tracking-wider text-white/40">Category</span>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {suggestion.category}
            </span>
          </div>
        </div>

        {/* Confidence bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/40">AI Confidence</span>
            <span className={`text-[10px] font-medium ${getConfidenceColor(suggestion.confidence)}`}>
              {confidencePct}%
            </span>
          </div>
          <div className="h-1.5 bg-[#22272B] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                suggestion.confidence >= 0.8 ? 'bg-green-500' :
                suggestion.confidence >= 0.6 ? 'bg-amber-500' : 'bg-orange-500'
              }`}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>

        {/* Suggested Response */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <MessageSquare className="w-3 h-3 text-white/40" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">
              Suggested Response
            </span>
          </div>
          <textarea
            value={editedResponse}
            onChange={(e) => setEditedResponse(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 bg-[#22272B]/50 border border-[#22272B] rounded-lg text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-500/50 resize-none transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsApplied(true)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-white bg-[#E40000] rounded-lg hover:bg-[#E40000]/90 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Apply Suggestion
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm text-white/50 border border-[#22272B] rounded-lg hover:bg-[#22272B]/50 hover:text-white/70 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITriagePanel;
