import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Layers,
  Target,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface CompetencyTag {
  id: string;
  tag_name: string;
  cbc_strand: string;
  sub_strand: string;
  grade_level: string;
  mapped_courses: number;
  coverage_percent: number;
}

interface GradeCoverage {
  grade: string;
  Language: number;
  Mathematics: number;
  Science: number;
  Social_Studies: number;
  Creative_Arts: number;
  Digital_Literacy: number;
  Religious_Ed: number;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const GRADE_COVERAGE_DATA: GradeCoverage[] = [
  { grade: 'Grade 1', Language: 92, Mathematics: 88, Science: 75, Social_Studies: 70, Creative_Arts: 85, Digital_Literacy: 60, Religious_Ed: 78 },
  { grade: 'Grade 2', Language: 90, Mathematics: 85, Science: 78, Social_Studies: 72, Creative_Arts: 82, Digital_Literacy: 65, Religious_Ed: 80 },
  { grade: 'Grade 3', Language: 88, Mathematics: 90, Science: 80, Social_Studies: 75, Creative_Arts: 78, Digital_Literacy: 70, Religious_Ed: 76 },
  { grade: 'Grade 4', Language: 85, Mathematics: 82, Science: 82, Social_Studies: 78, Creative_Arts: 72, Digital_Literacy: 75, Religious_Ed: 74 },
  { grade: 'Grade 5', Language: 82, Mathematics: 80, Science: 78, Social_Studies: 80, Creative_Arts: 68, Digital_Literacy: 78, Religious_Ed: 70 },
  { grade: 'Grade 6', Language: 80, Mathematics: 78, Science: 75, Social_Studies: 82, Creative_Arts: 65, Digital_Literacy: 80, Religious_Ed: 68 },
  { grade: 'Grade 7', Language: 78, Mathematics: 75, Science: 72, Social_Studies: 78, Creative_Arts: 60, Digital_Literacy: 82, Religious_Ed: 65 },
  { grade: 'Grade 8', Language: 75, Mathematics: 72, Science: 70, Social_Studies: 75, Creative_Arts: 58, Digital_Literacy: 85, Religious_Ed: 62 },
  { grade: 'Grade 9', Language: 72, Mathematics: 70, Science: 68, Social_Studies: 72, Creative_Arts: 55, Digital_Literacy: 88, Religious_Ed: 60 },
];

const STRAND_COLORS: Record<string, string> = {
  Language: '#E40000',
  Mathematics: '#3B82F6',
  Science: '#10B981',
  Social_Studies: '#F59E0B',
  Creative_Arts: '#8B5CF6',
  Digital_Literacy: '#06B6D4',
  Religious_Ed: '#EC4899',
};

const STRAND_LABELS: Record<string, string> = {
  Language: 'Language Activities',
  Mathematics: 'Mathematical Activities',
  Science: 'Science & Technology',
  Social_Studies: 'Social Studies',
  Creative_Arts: 'Creative Arts',
  Digital_Literacy: 'Digital Literacy',
  Religious_Ed: 'Religious Education',
};

const MOCK_COMPETENCIES: CompetencyTag[] = [
  { id: 'ct1', tag_name: 'Reading Comprehension', cbc_strand: 'Language Activities', sub_strand: 'Reading', grade_level: 'Grade 3-5', mapped_courses: 8, coverage_percent: 92 },
  { id: 'ct2', tag_name: 'Number Operations', cbc_strand: 'Mathematical Activities', sub_strand: 'Numbers', grade_level: 'Grade 1-4', mapped_courses: 12, coverage_percent: 95 },
  { id: 'ct3', tag_name: 'Scientific Inquiry', cbc_strand: 'Science & Technology', sub_strand: 'Investigation', grade_level: 'Grade 4-6', mapped_courses: 6, coverage_percent: 78 },
  { id: 'ct4', tag_name: 'Creative Expression', cbc_strand: 'Creative Arts', sub_strand: 'Visual Arts', grade_level: 'Grade 1-3', mapped_courses: 5, coverage_percent: 72 },
  { id: 'ct5', tag_name: 'Digital Communication', cbc_strand: 'Digital Literacy', sub_strand: 'ICT Skills', grade_level: 'Grade 5-9', mapped_courses: 7, coverage_percent: 85 },
  { id: 'ct6', tag_name: 'Oral Expression', cbc_strand: 'Language Activities', sub_strand: 'Speaking', grade_level: 'Grade 1-3', mapped_courses: 9, coverage_percent: 88 },
  { id: 'ct7', tag_name: 'Geometry & Measurement', cbc_strand: 'Mathematical Activities', sub_strand: 'Measurement', grade_level: 'Grade 4-7', mapped_courses: 10, coverage_percent: 90 },
  { id: 'ct8', tag_name: 'Environmental Awareness', cbc_strand: 'Science & Technology', sub_strand: 'Environment', grade_level: 'Grade 2-5', mapped_courses: 4, coverage_percent: 65 },
  { id: 'ct9', tag_name: 'Citizenship & Governance', cbc_strand: 'Social Studies', sub_strand: 'Civics', grade_level: 'Grade 6-9', mapped_courses: 3, coverage_percent: 58 },
  { id: 'ct10', tag_name: 'Musical Skills', cbc_strand: 'Creative Arts', sub_strand: 'Music', grade_level: 'Grade 1-6', mapped_courses: 4, coverage_percent: 62 },
  { id: 'ct11', tag_name: 'Writing Skills', cbc_strand: 'Language Activities', sub_strand: 'Writing', grade_level: 'Grade 2-6', mapped_courses: 11, coverage_percent: 94 },
  { id: 'ct12', tag_name: 'Data Handling', cbc_strand: 'Mathematical Activities', sub_strand: 'Statistics', grade_level: 'Grade 6-9', mapped_courses: 5, coverage_percent: 70 },
  { id: 'ct13', tag_name: 'Health & Hygiene', cbc_strand: 'Science & Technology', sub_strand: 'Health Education', grade_level: 'Grade 1-4', mapped_courses: 6, coverage_percent: 80 },
  { id: 'ct14', tag_name: 'Moral Values', cbc_strand: 'Religious Education', sub_strand: 'Ethics', grade_level: 'Grade 1-9', mapped_courses: 8, coverage_percent: 75 },
  { id: 'ct15', tag_name: 'Coding & Programming', cbc_strand: 'Digital Literacy', sub_strand: 'Programming', grade_level: 'Grade 7-9', mapped_courses: 3, coverage_percent: 48 },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const tooltipStyle = {
  backgroundColor: '#181C1F',
  border: '1px solid #22272B',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#fff',
  fontSize: '12px',
};

const CoverageBadge: React.FC<{ percent: number }> = ({ percent }) => {
  let color = 'text-red-400 bg-red-500/20 border-red-500/30';
  if (percent >= 80) color = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
  else if (percent >= 60) color = 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {percent}%
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const CBCAlignmentPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [strandFilter, setStrandFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const filteredCompetencies = MOCK_COMPETENCIES.filter((c) => {
    if (search && !c.tag_name.toLowerCase().includes(search.toLowerCase()) && !c.cbc_strand.toLowerCase().includes(search.toLowerCase())) return false;
    if (strandFilter && c.cbc_strand !== strandFilter) return false;
    return true;
  });

  const totalCompetencies = MOCK_COMPETENCIES.length;
  const avgCoverage = Math.round(MOCK_COMPETENCIES.reduce((sum, c) => sum + c.coverage_percent, 0) / totalCompetencies);
  const totalMappedCourses = new Set(MOCK_COMPETENCIES.flatMap((c) => Array.from({ length: c.mapped_courses }, (_, i) => `${c.id}-${i}`))).size;
  const gapCount = MOCK_COMPETENCIES.filter((c) => c.coverage_percent < 60).length;

  const uniqueStrands = Array.from(new Set(MOCK_COMPETENCIES.map((c) => c.cbc_strand)));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <AdminPageHeader
          title="CBC Alignment Dashboard"
          subtitle="Competency-Based Curriculum mapping and coverage analysis"
          breadcrumbs={[
            { label: 'Content & Learning', path: '/dashboard/admin' },
            { label: 'CBC Alignment' },
          ]}
          actions={
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          }
        />

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatsCard
            title="Total Competency Tags"
            value={totalCompetencies}
            icon={<Target className="w-5 h-5" />}
            trend={{ value: 8, label: 'vs last term', direction: 'up' }}
          />
          <AdminStatsCard
            title="Average Coverage"
            value={`${avgCoverage}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            trend={{ value: 3.5, label: 'vs last quarter', direction: 'up' }}
          />
          <AdminStatsCard
            title="Mapped Course Links"
            value={totalMappedCourses}
            icon={<Layers className="w-5 h-5" />}
            subtitle="Competency-to-course mappings"
          />
          <AdminStatsCard
            title="Coverage Gaps"
            value={gapCount}
            icon={<BookOpen className="w-5 h-5" />}
            subtitle="Competencies below 60% coverage"
          />
        </motion.div>

        {/* Coverage Bar Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">CBC Coverage by Grade Level</h2>
              <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
                Percentage of CBC strand competencies covered per grade
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={GRADE_COVERAGE_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
              <XAxis
                dataKey="grade"
                stroke="#333"
                tick={{ fill: '#666', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#333"
                tick={{ fill: '#666', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={((value: number) => [`${value}%`, '']) as any}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#999' }}
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => STRAND_LABELS[value] || value}
              />
              {Object.keys(STRAND_COLORS).map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={STRAND_COLORS[key]}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={12}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Search & Filter */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search competency tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
            />
          </div>
          <select
            value={strandFilter}
            onChange={(e) => setStrandFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[200px]"
          >
            <option value="">All Strands</option>
            {uniqueStrands.map((strand) => (
              <option key={strand} value={strand}>{strand}</option>
            ))}
          </select>
        </motion.div>

        {/* Competency Tags Table */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[#22272B]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Competency Tag Mapping</h2>
            <p className="text-sm text-gray-500 dark:text-white/50 mt-1">CBC competency tags and their course coverage</p>
          </div>

          {filteredCompetencies.length === 0 ? (
            <div className="text-center py-16">
              <Target className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Competencies Found</h3>
              <p className="text-gray-400 dark:text-white/40 text-sm">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                    <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Competency Tag</th>
                    <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">CBC Strand</th>
                    <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Sub-Strand</th>
                    <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Grade Level</th>
                    <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-center">Mapped Courses</th>
                    <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-center">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompetencies.map((comp) => (
                    <tr
                      key={comp.id}
                      className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-gray-900 dark:text-white font-medium">{comp.tag_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-400 dark:text-gray-300">{comp.cbc_strand}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{comp.sub_strand}</td>
                      <td className="px-4 py-3 text-gray-400">{comp.grade_level}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-900 dark:text-white font-medium">{comp.mapped_courses}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <CoverageBadge percent={comp.coverage_percent} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredCompetencies.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-[#22272B]">
              <p className="text-xs text-gray-400 dark:text-white/40">
                Showing {filteredCompetencies.length} of {MOCK_COMPETENCIES.length} competency tags
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
  );
};

export default CBCAlignmentPage;
