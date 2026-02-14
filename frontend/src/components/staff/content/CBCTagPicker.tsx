import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, Tag } from 'lucide-react';

interface CBCCompetency {
  code: string;
  name: string;
  learningArea: string;
}

interface CBCTagPickerProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

const CBC_COMPETENCIES: CBCCompetency[] = [
  // Language Activities
  { code: 'LA-001', name: 'Listening and Speaking', learningArea: 'Language Activities' },
  { code: 'LA-002', name: 'Reading', learningArea: 'Language Activities' },
  { code: 'LA-003', name: 'Writing', learningArea: 'Language Activities' },
  // Mathematics
  { code: 'MA-001', name: 'Number Sense', learningArea: 'Mathematics' },
  { code: 'MA-002', name: 'Measurement', learningArea: 'Mathematics' },
  { code: 'MA-003', name: 'Geometry', learningArea: 'Mathematics' },
  { code: 'MA-004', name: 'Data Handling', learningArea: 'Mathematics' },
  // Science & Technology
  { code: 'ST-001', name: 'Scientific Investigation', learningArea: 'Science & Technology' },
  { code: 'ST-002', name: 'Living Things', learningArea: 'Science & Technology' },
  { code: 'ST-003', name: 'Environment', learningArea: 'Science & Technology' },
  { code: 'ST-004', name: 'Digital Literacy', learningArea: 'Science & Technology' },
  // Social Studies
  { code: 'SS-001', name: 'Citizenship', learningArea: 'Social Studies' },
  { code: 'SS-002', name: 'People and Culture', learningArea: 'Social Studies' },
  { code: 'SS-003', name: 'Resources and Economic Activities', learningArea: 'Social Studies' },
  // Creative Arts
  { code: 'CA-001', name: 'Music', learningArea: 'Creative Arts' },
  { code: 'CA-002', name: 'Art and Craft', learningArea: 'Creative Arts' },
  { code: 'CA-003', name: 'Drama', learningArea: 'Creative Arts' },
  // Religious Education
  { code: 'RE-001', name: 'Christian Religious Education', learningArea: 'Religious Education' },
  { code: 'RE-002', name: 'Islamic Religious Education', learningArea: 'Religious Education' },
  // Physical & Health Education
  { code: 'PH-001', name: 'Movement and Physical Activities', learningArea: 'Physical & Health Education' },
  { code: 'PH-002', name: 'Health and Nutrition', learningArea: 'Physical & Health Education' },
];

const AREA_COLORS: Record<string, string> = {
  'Language Activities': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Mathematics: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Science & Technology': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Social Studies': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Creative Arts': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Religious Education': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Physical & Health Education': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const CBCTagPicker: React.FC<CBCTagPickerProps> = ({ selectedTags, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCompetencies = useMemo(() => {
    if (!searchQuery) return CBC_COMPETENCIES;
    const query = searchQuery.toLowerCase();
    return CBC_COMPETENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        c.learningArea.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const groupedCompetencies = useMemo(() => {
    const groups: Record<string, CBCCompetency[]> = {};
    filteredCompetencies.forEach((c) => {
      if (!groups[c.learningArea]) groups[c.learningArea] = [];
      groups[c.learningArea].push(c);
    });
    return groups;
  }, [filteredCompetencies]);

  const toggleTag = (code: string) => {
    if (selectedTags.includes(code)) {
      onChange(selectedTags.filter((t) => t !== code));
    } else {
      onChange([...selectedTags, code]);
    }
  };

  const removeTag = (code: string) => {
    onChange(selectedTags.filter((t) => t !== code));
  };

  const getCompetency = (code: string): CBCCompetency | undefined =>
    CBC_COMPETENCIES.find((c) => c.code === code);

  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden" ref={dropdownRef}>
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#22272B]">
        <Tag className="w-4 h-4 text-white/60" />
        <h3 className="text-sm font-semibold text-white">CBC Competency Tags</h3>
        <span className="ml-auto text-xs text-white/40">{selectedTags.length} selected</span>
      </div>

      {/* Selected Tags */}
      <div className="px-4 pt-3">
        {selectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {selectedTags.map((code) => {
              const comp = getCompetency(code);
              if (!comp) return null;
              const colorClass = AREA_COLORS[comp.learningArea] || 'bg-white/10 text-white/60 border-white/20';
              return (
                <span
                  key={code}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}
                >
                  <span className="opacity-70">{comp.code}</span>
                  <span>{comp.name}</span>
                  <button
                    onClick={() => removeTag(code)}
                    className="ml-0.5 hover:opacity-100 opacity-60 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-white/30 mb-3">No competencies selected</p>
        )}
      </div>

      {/* Search & Dropdown Trigger */}
      <div className="px-4 pb-3">
        <div
          className="flex items-center gap-2 px-3 py-2 bg-[#22272B]/50 rounded-lg border border-[#22272B] cursor-text"
          onClick={() => setIsOpen(true)}
        >
          <Search className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search competency codes or names..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          />
          <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-[#22272B] bg-[#1a1f23]">
            {Object.keys(groupedCompetencies).length === 0 ? (
              <p className="px-3 py-4 text-xs text-white/40 text-center">No competencies match your search</p>
            ) : (
              Object.entries(groupedCompetencies).map(([area, competencies]) => (
                <div key={area}>
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-white/40 uppercase tracking-wider bg-[#181C1F] sticky top-0">
                    {area}
                  </div>
                  {competencies.map((comp) => {
                    const isSelected = selectedTags.includes(comp.code);
                    return (
                      <button
                        key={comp.code}
                        onClick={() => toggleTag(comp.code)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                          isSelected
                            ? 'bg-[#E40000]/10 text-white'
                            : 'hover:bg-[#22272B]/50 text-white/70'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'bg-[#E40000] border-[#E40000]'
                              : 'border-[#333] bg-transparent'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs text-white/40 w-12 flex-shrink-0">{comp.code}</span>
                        <span className="text-xs">{comp.name}</span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CBCTagPicker;
