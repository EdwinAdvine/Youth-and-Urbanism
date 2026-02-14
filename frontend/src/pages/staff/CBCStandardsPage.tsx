import React, { useState, useEffect } from 'react';

interface CBCCompetencyArea {
  id: string;
  name: string;
  code: string;
  alignmentScore: number;
  totalStrands: number;
  coveredStrands: number;
  strands: CBCStrand[];
}

interface CBCStrand {
  id: string;
  name: string;
  alignmentScore: number;
  subStrands: CBCSubStrand[];
}

interface CBCSubStrand {
  id: string;
  name: string;
  alignmentScore: number;
  contentCount: number;
  assessmentCount: number;
  status: 'fully_aligned' | 'partially_aligned' | 'gap' | 'not_started';
}

const CBCStandardsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [areas, setAreas] = useState<CBCCompetencyArea[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const [expandedStrand, setExpandedStrand] = useState<string | null>(null);

  const mockAreas: CBCCompetencyArea[] = [
    {
      id: 'LA-001', name: 'Mathematics', code: 'MATH', alignmentScore: 82, totalStrands: 5, coveredStrands: 4,
      strands: [
        {
          id: 'S-001', name: 'Numbers', alignmentScore: 95,
          subStrands: [
            { id: 'SS-001', name: 'Whole Numbers', alignmentScore: 100, contentCount: 24, assessmentCount: 8, status: 'fully_aligned' },
            { id: 'SS-002', name: 'Fractions', alignmentScore: 90, contentCount: 18, assessmentCount: 6, status: 'fully_aligned' },
            { id: 'SS-003', name: 'Decimals', alignmentScore: 85, contentCount: 15, assessmentCount: 5, status: 'partially_aligned' },
          ],
        },
        {
          id: 'S-002', name: 'Geometry', alignmentScore: 78,
          subStrands: [
            { id: 'SS-004', name: '2D Shapes', alignmentScore: 90, contentCount: 12, assessmentCount: 4, status: 'fully_aligned' },
            { id: 'SS-005', name: '3D Shapes', alignmentScore: 65, contentCount: 8, assessmentCount: 2, status: 'partially_aligned' },
            { id: 'SS-006', name: 'Symmetry', alignmentScore: 40, contentCount: 3, assessmentCount: 1, status: 'gap' },
          ],
        },
        {
          id: 'S-003', name: 'Measurement', alignmentScore: 72,
          subStrands: [
            { id: 'SS-007', name: 'Length', alignmentScore: 88, contentCount: 10, assessmentCount: 4, status: 'fully_aligned' },
            { id: 'SS-008', name: 'Mass', alignmentScore: 70, contentCount: 7, assessmentCount: 2, status: 'partially_aligned' },
            { id: 'SS-009', name: 'Capacity', alignmentScore: 55, contentCount: 4, assessmentCount: 1, status: 'gap' },
          ],
        },
        {
          id: 'S-004', name: 'Data Handling', alignmentScore: 85,
          subStrands: [
            { id: 'SS-010', name: 'Data Collection', alignmentScore: 92, contentCount: 8, assessmentCount: 3, status: 'fully_aligned' },
            { id: 'SS-011', name: 'Data Representation', alignmentScore: 78, contentCount: 6, assessmentCount: 2, status: 'partially_aligned' },
          ],
        },
        {
          id: 'S-005', name: 'Algebra', alignmentScore: 0,
          subStrands: [
            { id: 'SS-012', name: 'Patterns', alignmentScore: 0, contentCount: 0, assessmentCount: 0, status: 'not_started' },
            { id: 'SS-013', name: 'Equations', alignmentScore: 0, contentCount: 0, assessmentCount: 0, status: 'not_started' },
          ],
        },
      ],
    },
    {
      id: 'LA-002', name: 'English', code: 'ENG', alignmentScore: 88, totalStrands: 4, coveredStrands: 4,
      strands: [
        {
          id: 'S-006', name: 'Listening & Speaking', alignmentScore: 92,
          subStrands: [
            { id: 'SS-014', name: 'Listening Comprehension', alignmentScore: 95, contentCount: 20, assessmentCount: 7, status: 'fully_aligned' },
            { id: 'SS-015', name: 'Oral Communication', alignmentScore: 88, contentCount: 16, assessmentCount: 5, status: 'fully_aligned' },
          ],
        },
        {
          id: 'S-007', name: 'Reading', alignmentScore: 90,
          subStrands: [
            { id: 'SS-016', name: 'Reading Comprehension', alignmentScore: 95, contentCount: 25, assessmentCount: 10, status: 'fully_aligned' },
            { id: 'SS-017', name: 'Vocabulary', alignmentScore: 85, contentCount: 18, assessmentCount: 6, status: 'partially_aligned' },
          ],
        },
        {
          id: 'S-008', name: 'Writing', alignmentScore: 82,
          subStrands: [
            { id: 'SS-018', name: 'Creative Writing', alignmentScore: 80, contentCount: 14, assessmentCount: 5, status: 'partially_aligned' },
            { id: 'SS-019', name: 'Functional Writing', alignmentScore: 85, contentCount: 12, assessmentCount: 4, status: 'partially_aligned' },
          ],
        },
        {
          id: 'S-009', name: 'Grammar', alignmentScore: 87,
          subStrands: [
            { id: 'SS-020', name: 'Parts of Speech', alignmentScore: 92, contentCount: 22, assessmentCount: 8, status: 'fully_aligned' },
            { id: 'SS-021', name: 'Sentence Structure', alignmentScore: 82, contentCount: 15, assessmentCount: 5, status: 'partially_aligned' },
          ],
        },
      ],
    },
    {
      id: 'LA-003', name: 'Kiswahili', code: 'KSW', alignmentScore: 74, totalStrands: 4, coveredStrands: 3,
      strands: [
        {
          id: 'S-010', name: 'Kusikiliza na Kuzungumza', alignmentScore: 80,
          subStrands: [
            { id: 'SS-022', name: 'Kusikiliza', alignmentScore: 85, contentCount: 12, assessmentCount: 4, status: 'partially_aligned' },
            { id: 'SS-023', name: 'Kuzungumza', alignmentScore: 75, contentCount: 10, assessmentCount: 3, status: 'partially_aligned' },
          ],
        },
        {
          id: 'S-011', name: 'Kusoma', alignmentScore: 78,
          subStrands: [
            { id: 'SS-024', name: 'Ufahamu', alignmentScore: 82, contentCount: 14, assessmentCount: 5, status: 'partially_aligned' },
          ],
        },
        {
          id: 'S-012', name: 'Kuandika', alignmentScore: 65,
          subStrands: [
            { id: 'SS-025', name: 'Insha', alignmentScore: 65, contentCount: 8, assessmentCount: 2, status: 'gap' },
          ],
        },
        {
          id: 'S-013', name: 'Sarufi', alignmentScore: 0,
          subStrands: [
            { id: 'SS-026', name: 'Nomino na Vitenzi', alignmentScore: 0, contentCount: 0, assessmentCount: 0, status: 'not_started' },
          ],
        },
      ],
    },
    {
      id: 'LA-004', name: 'Science & Technology', code: 'SCI', alignmentScore: 79, totalStrands: 4, coveredStrands: 3,
      strands: [
        {
          id: 'S-014', name: 'Living Things', alignmentScore: 88,
          subStrands: [
            { id: 'SS-027', name: 'Plants', alignmentScore: 90, contentCount: 16, assessmentCount: 6, status: 'fully_aligned' },
            { id: 'SS-028', name: 'Animals', alignmentScore: 85, contentCount: 14, assessmentCount: 5, status: 'partially_aligned' },
          ],
        },
        {
          id: 'S-015', name: 'The Environment', alignmentScore: 75,
          subStrands: [
            { id: 'SS-029', name: 'Weather & Climate', alignmentScore: 78, contentCount: 10, assessmentCount: 3, status: 'partially_aligned' },
            { id: 'SS-030', name: 'Conservation', alignmentScore: 72, contentCount: 8, assessmentCount: 2, status: 'partially_aligned' },
          ],
        },
        {
          id: 'S-016', name: 'Matter & Energy', alignmentScore: 70,
          subStrands: [
            { id: 'SS-031', name: 'Properties of Matter', alignmentScore: 75, contentCount: 9, assessmentCount: 3, status: 'partially_aligned' },
            { id: 'SS-032', name: 'Energy Forms', alignmentScore: 65, contentCount: 6, assessmentCount: 2, status: 'gap' },
          ],
        },
        {
          id: 'S-017', name: 'Technology & Innovation', alignmentScore: 0,
          subStrands: [
            { id: 'SS-033', name: 'Simple Machines', alignmentScore: 0, contentCount: 0, assessmentCount: 0, status: 'not_started' },
          ],
        },
      ],
    },
    {
      id: 'LA-005', name: 'Social Studies', code: 'SS', alignmentScore: 71, totalStrands: 3, coveredStrands: 3,
      strands: [
        {
          id: 'S-018', name: 'People & Population', alignmentScore: 76,
          subStrands: [
            { id: 'SS-034', name: 'Family & Community', alignmentScore: 80, contentCount: 10, assessmentCount: 3, status: 'partially_aligned' },
          ],
        },
        {
          id: 'S-019', name: 'Governance', alignmentScore: 68,
          subStrands: [
            { id: 'SS-035', name: 'Leadership', alignmentScore: 70, contentCount: 7, assessmentCount: 2, status: 'partially_aligned' },
            { id: 'SS-036', name: 'Rights & Responsibilities', alignmentScore: 65, contentCount: 5, assessmentCount: 2, status: 'gap' },
          ],
        },
        {
          id: 'S-020', name: 'Culture & Heritage', alignmentScore: 70,
          subStrands: [
            { id: 'SS-037', name: 'Kenyan Cultures', alignmentScore: 75, contentCount: 8, assessmentCount: 3, status: 'partially_aligned' },
          ],
        },
      ],
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setAreas(mockAreas);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const getAlignmentColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 30) return 'text-orange-400';
    if (score > 0) return 'text-red-400';
    return 'text-white/20';
  };

  const getAlignmentBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 30) return 'bg-orange-500';
    if (score > 0) return 'bg-red-500';
    return 'bg-white/10';
  };

  const getStatusBadge = (status: CBCSubStrand['status']) => {
    const config: Record<string, { label: string; color: string }> = {
      fully_aligned: { label: 'Fully Aligned', color: 'bg-green-500/20 text-green-400' },
      partially_aligned: { label: 'Partial', color: 'bg-yellow-500/20 text-yellow-400' },
      gap: { label: 'Gap', color: 'bg-red-500/20 text-red-400' },
      not_started: { label: 'Not Started', color: 'bg-white/10 text-white/30' },
    };
    const { label, color } = config[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  const filteredAreas = areas.filter((area) => {
    if (searchTerm && !area.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !area.code.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const overallScore = areas.length > 0
    ? Math.round(areas.reduce((sum, a) => sum + a.alignmentScore, 0) / areas.length)
    : 0;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-7 w-56 bg-[#181C1F] rounded animate-pulse" />
        <div className="h-10 w-full bg-[#181C1F] rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-[#181C1F] rounded-xl border border-[#22272B] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">CBC & Standards Alignment</h1>
          <p className="text-sm text-white/50 mt-1">
            Monitor and manage Competency-Based Curriculum alignment across all learning areas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-white/40">Overall Alignment</p>
            <p className={`text-2xl font-bold ${getAlignmentColor(overallScore)}`}>{overallScore}%</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-[#181C1F] rounded-xl border border-[#22272B]">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search competencies, strands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0F1112] border border-[#22272B] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
          />
        </div>
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="px-3 py-2 bg-[#0F1112] border border-[#22272B] rounded-lg text-sm text-white/70 focus:outline-none focus:border-[#E40000]/50"
        >
          <option value="all">All Grades</option>
          {[...Array(9)].map((_, i) => (
            <option key={i} value={`grade_${i + 1}`}>Grade {i + 1}</option>
          ))}
        </select>
      </div>

      {/* Learning Areas */}
      <div className="space-y-3">
        {filteredAreas.map((area) => (
          <div key={area.id} className="bg-[#181C1F] rounded-xl border border-[#22272B] overflow-hidden">
            {/* Area Header */}
            <button
              className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left"
              onClick={() => setExpandedArea(expandedArea === area.id ? null : area.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${getAlignmentBarColor(area.alignmentScore)}/20 ${getAlignmentColor(area.alignmentScore)}`}
                  style={{ backgroundColor: area.alignmentScore >= 80 ? 'rgba(34,197,94,0.1)' : area.alignmentScore >= 60 ? 'rgba(234,179,8,0.1)' : area.alignmentScore >= 30 ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.05)' }}
                >
                  {area.code.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{area.name}</h3>
                  <p className="text-xs text-white/40">{area.coveredStrands}/{area.totalStrands} strands covered</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-32">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/40">Alignment</span>
                    <span className={`text-sm font-bold ${getAlignmentColor(area.alignmentScore)}`}>{area.alignmentScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#0F1112] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${getAlignmentBarColor(area.alignmentScore)}`} style={{ width: `${area.alignmentScore}%` }} />
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-white/30 transition-transform ${expandedArea === area.id ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded Strands */}
            {expandedArea === area.id && (
              <div className="border-t border-[#22272B]">
                {area.strands.map((strand) => (
                  <div key={strand.id}>
                    <button
                      className="w-full px-4 py-3 pl-10 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left border-b border-[#22272B]/50"
                      onClick={() => setExpandedStrand(expandedStrand === strand.id ? null : strand.id)}
                    >
                      <div className="flex items-center gap-3">
                        <svg className={`w-4 h-4 transition-transform ${expandedStrand === strand.id ? 'rotate-90' : ''} text-white/30`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-sm text-white/80">{strand.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-[#0F1112] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${getAlignmentBarColor(strand.alignmentScore)}`} style={{ width: `${strand.alignmentScore}%` }} />
                        </div>
                        <span className={`text-xs font-medium w-8 text-right ${getAlignmentColor(strand.alignmentScore)}`}>{strand.alignmentScore}%</span>
                      </div>
                    </button>

                    {/* Sub-strands */}
                    {expandedStrand === strand.id && (
                      <div className="bg-[#0F1112]/50">
                        {strand.subStrands.map((sub) => (
                          <div key={sub.id} className="px-4 py-2.5 pl-20 flex items-center justify-between border-b border-[#22272B]/30">
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-white/60">{sub.name}</span>
                              {getStatusBadge(sub.status)}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-white/30">{sub.contentCount} content</span>
                              <span className="text-xs text-white/30">{sub.assessmentCount} assessments</span>
                              <div className="w-16 h-1.5 bg-[#22272B] rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${getAlignmentBarColor(sub.alignmentScore)}`} style={{ width: `${sub.alignmentScore}%` }} />
                              </div>
                              <span className={`text-xs font-medium w-8 text-right ${getAlignmentColor(sub.alignmentScore)}`}>{sub.alignmentScore}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CBCStandardsPage;
