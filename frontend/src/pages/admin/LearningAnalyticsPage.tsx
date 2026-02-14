import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
/* Mock data                                                          */
/* ------------------------------------------------------------------ */

const CBC_STRANDS = [
  'Language Activities',
  'Mathematical Activities',
  'Environmental Activities',
  'Hygiene & Nutrition',
  'Creative Activities',
  'Religious Education',
  'Movement & Physical',
];

const STRAND_COLORS: Record<string, string> = {
  'Language Activities': '#E40000',
  'Mathematical Activities': '#3B82F6',
  'Environmental Activities': '#10B981',
  'Hygiene & Nutrition': '#F59E0B',
  'Creative Activities': '#8B5CF6',
  'Religious Education': '#EC4899',
  'Movement & Physical': '#06B6D4',
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildStrandProgress() {
  const rand = seededRandom(42);
  const data = [];
  for (let grade = 1; grade <= 9; grade++) {
    const entry: Record<string, string | number> = { grade: `Grade ${grade}` };
    for (const strand of CBC_STRANDS) {
      const base = 85 - grade * 3 + Math.floor(rand() * 17) - 8;
      entry[strand] = Math.max(25, Math.min(98, base));
    }
    data.push(entry);
  }
  return data;
}

function buildSkillCurves() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const rand = seededRandom(88);
  return months.map((month, i) => ({
    month,
    Literacy: Math.min(92, +(28 + i * 5.2 + (rand() * 8 - 4)).toFixed(1)),
    Numeracy: Math.min(88, +(25 + i * 5.0 + (rand() * 8 - 3)).toFixed(1)),
    'Digital Skills': Math.min(85, +(15 + i * 6.0 + (rand() * 8 - 5)).toFixed(1)),
    'Critical Thinking': Math.min(95, +(30 + i * 5.5 + (rand() * 6 - 3)).toFixed(1)),
  }));
}

const COHORT_DATA = [
  {
    cohort: 'Grade 1-3 (Lower Primary)',
    students: 1245,
    avgProgress: 78.3,
    avgScore: 74.1,
    completionRate: 82.5,
    aiEngagement: 91.2,
  },
  {
    cohort: 'Grade 4-6 (Upper Primary)',
    students: 1402,
    avgProgress: 71.6,
    avgScore: 67.8,
    completionRate: 74.3,
    aiEngagement: 85.7,
  },
  {
    cohort: 'Grade 7-9 (Junior Secondary)',
    students: 1200,
    avgProgress: 64.2,
    avgScore: 62.4,
    completionRate: 68.1,
    aiEngagement: 78.9,
  },
];

const STRAND_PROGRESS = buildStrandProgress();
const SKILL_CURVES = buildSkillCurves();

const tooltipStyle = {
  backgroundColor: '#181C1F',
  border: '1px solid #22272B',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#fff',
  fontSize: '12px',
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

const LearningAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-[#22272B] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-[#22272B] rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <AdminPageHeader
        title="Learning Impact Analytics"
        subtitle="CBC curriculum progress, skill acquisition, and cohort performance"
        breadcrumbs={[
          { label: 'Analytics', path: '/dashboard/admin' },
          { label: 'Learning Impact' },
        ]}
        actions={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Stats Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <AdminStatsCard
          title="Avg Completion Rate"
          value="72.4%"
          icon={<GraduationCap className="w-5 h-5" />}
          trend={{ value: 3.2, label: 'vs last term', direction: 'up' }}
        />
        <AdminStatsCard
          title="Active Learners"
          value="3,847"
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 8.1, label: 'vs last month', direction: 'up' }}
        />
        <AdminStatsCard
          title="CBC Coverage"
          value="89.2%"
          icon={<BookOpen className="w-5 h-5" />}
          trend={{ value: 2.4, label: 'vs last term', direction: 'up' }}
        />
        <AdminStatsCard
          title="Avg Assessment Score"
          value="68.7%"
          icon={<Award className="w-5 h-5" />}
          trend={{ value: 1.5, label: 'vs last term', direction: 'up' }}
        />
      </motion.div>

      {/* CBC Strand Progress Chart */}
      <motion.div
        variants={itemVariants}
        className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">CBC Strand Progress by Grade</h2>
            <p className="text-sm text-white/50 mt-1">
              Average completion percentage across CBC curriculum strands
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={STRAND_PROGRESS} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, '']} />
            <Legend
              wrapperStyle={{ fontSize: '11px', color: '#999' }}
              iconType="circle"
              iconSize={8}
            />
            {CBC_STRANDS.map((strand) => (
              <Bar
                key={strand}
                dataKey={strand}
                fill={STRAND_COLORS[strand]}
                radius={[2, 2, 0, 0]}
                maxBarSize={12}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Skill Acquisition Curves */}
      <motion.div
        variants={itemVariants}
        className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6"
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Skill Acquisition Curves</h2>
          <p className="text-sm text-white/50 mt-1">
            Progression of core skills over the academic year
          </p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={SKILL_CURVES} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
            <XAxis
              dataKey="month"
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
            <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, '']} />
            <Legend
              wrapperStyle={{ fontSize: '11px', color: '#999' }}
              iconType="circle"
              iconSize={8}
            />
            <Line
              type="monotone"
              dataKey="Literacy"
              stroke="#E40000"
              strokeWidth={2}
              dot={{ fill: '#E40000', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Numeracy"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Digital Skills"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Critical Thinking"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ fill: '#F59E0B', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Cohort Comparison Table */}
      <motion.div
        variants={itemVariants}
        className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6"
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Cohort Comparison</h2>
          <p className="text-sm text-white/50 mt-1">
            Performance comparison across grade-level cohorts
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#22272B]">
                <th className="text-left py-3 px-4 text-white/50 font-medium">Cohort</th>
                <th className="text-right py-3 px-4 text-white/50 font-medium">Students</th>
                <th className="text-right py-3 px-4 text-white/50 font-medium">Avg Progress</th>
                <th className="text-right py-3 px-4 text-white/50 font-medium">Avg Score</th>
                <th className="text-right py-3 px-4 text-white/50 font-medium">Completion</th>
                <th className="text-right py-3 px-4 text-white/50 font-medium">AI Engagement</th>
              </tr>
            </thead>
            <tbody>
              {COHORT_DATA.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#22272B]/50 hover:bg-[#22272B]/30 transition-colors"
                >
                  <td className="py-3 px-4 text-white font-medium">{row.cohort}</td>
                  <td className="py-3 px-4 text-right text-white/80">
                    {row.students.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="flex items-center justify-end gap-1">
                      {row.avgProgress >= 70 ? (
                        <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span className={row.avgProgress >= 70 ? 'text-green-400' : 'text-red-400'}>
                        {row.avgProgress}%
                      </span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={row.avgScore >= 70 ? 'text-green-400' : row.avgScore >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                      {row.avgScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-[#22272B] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#E40000]"
                          style={{ width: `${row.completionRate}%` }}
                        />
                      </div>
                      <span className="text-white/80 text-xs w-10 text-right">{row.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={row.aiEngagement >= 85 ? 'text-green-400' : 'text-yellow-400'}>
                      {row.aiEngagement}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LearningAnalyticsPage;
