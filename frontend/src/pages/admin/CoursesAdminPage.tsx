import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  CheckCircle2,
  Archive,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Plus,
  Download,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type CourseStatus = 'published' | 'pending' | 'draft' | 'archived';
type TabKey = 'all' | 'pending' | 'archived';

interface Course {
  id: string;
  title: string;
  instructor: string;
  grade_level: string;
  status: CourseStatus;
  students_enrolled: number;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_COURSES: Course[] = [
  { id: 'c1', title: 'Introduction to Kiswahili Grammar', instructor: 'Jane Wanjiku', grade_level: 'Grade 4', status: 'published', students_enrolled: 128, created_at: '2025-11-14' },
  { id: 'c2', title: 'CBC Mathematics - Fractions & Decimals', instructor: 'David Ochieng', grade_level: 'Grade 5', status: 'published', students_enrolled: 95, created_at: '2025-11-02' },
  { id: 'c3', title: 'Environmental Science - Water Cycle', instructor: 'Mary Akinyi', grade_level: 'Grade 3', status: 'pending', students_enrolled: 0, created_at: '2025-12-20' },
  { id: 'c4', title: 'Creative Arts & Design Thinking', instructor: 'Peter Kamau', grade_level: 'Grade 6', status: 'pending', students_enrolled: 0, created_at: '2025-12-18' },
  { id: 'c5', title: 'Digital Literacy Basics', instructor: 'Sarah Njeri', grade_level: 'Grade 1', status: 'published', students_enrolled: 210, created_at: '2025-09-05' },
  { id: 'c6', title: 'Physical Education & Health', instructor: 'James Mwangi', grade_level: 'Grade 2', status: 'archived', students_enrolled: 45, created_at: '2025-06-12' },
  { id: 'c7', title: 'Religious Education - Moral Values', instructor: 'Grace Otieno', grade_level: 'Grade 7', status: 'published', students_enrolled: 67, created_at: '2025-10-30' },
  { id: 'c8', title: 'Agriculture & Nutrition', instructor: 'Francis Kiprop', grade_level: 'Grade 8', status: 'pending', students_enrolled: 0, created_at: '2026-01-05' },
  { id: 'c9', title: 'Home Science Practicals', instructor: 'Alice Wambui', grade_level: 'Grade 9', status: 'draft', students_enrolled: 0, created_at: '2026-01-12' },
  { id: 'c10', title: 'Social Studies - Kenyan History', instructor: 'Michael Oduor', grade_level: 'Grade 6', status: 'archived', students_enrolled: 32, created_at: '2025-04-20' },
  { id: 'c11', title: 'English Language Arts', instructor: 'Diana Chebet', grade_level: 'Grade 5', status: 'published', students_enrolled: 153, created_at: '2025-08-18' },
  { id: 'c12', title: 'Science & Technology - Simple Machines', instructor: 'Brian Wafula', grade_level: 'Grade 7', status: 'pending', students_enrolled: 0, created_at: '2026-02-01' },
];

/* ------------------------------------------------------------------ */
/* Badge helpers                                                       */
/* ------------------------------------------------------------------ */

const statusStyles: Record<CourseStatus, string> = {
  published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  archived: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const StatusBadge: React.FC<{ status: CourseStatus }> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusStyles[status]}`}
  >
    {status}
  </span>
);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

const TAB_CONFIG: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All Courses' },
  { key: 'pending', label: 'Pending Approval' },
  { key: 'archived', label: 'Archived' },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const CoursesAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  const filteredCourses = MOCK_COURSES.filter((c) => {
    // Tab filter
    if (activeTab === 'pending' && c.status !== 'pending') return false;
    if (activeTab === 'archived' && c.status !== 'archived') return false;
    // Search
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.instructor.toLowerCase().includes(search.toLowerCase())) return false;
    // Grade filter
    if (gradeFilter && c.grade_level !== gradeFilter) return false;
    return true;
  });

  const totalCourses = MOCK_COURSES.length;
  const pendingReview = MOCK_COURSES.filter((c) => c.status === 'pending').length;
  const published = MOCK_COURSES.filter((c) => c.status === 'published').length;
  const archived = MOCK_COURSES.filter((c) => c.status === 'archived').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <DashboardLayout role="admin">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <AdminPageHeader
          title="Course Management"
          subtitle="Review, approve, and manage all platform courses"
          breadcrumbs={[
            { label: 'Content & Learning', path: '/dashboard/admin' },
            { label: 'Courses' },
          ]}
          actions={
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-[#E40000] text-white rounded-lg hover:bg-[#C00] transition-colors">
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          }
        />

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatsCard
            title="Total Courses"
            value={totalCourses}
            icon={<BookOpen className="w-5 h-5" />}
            trend={{ value: 12, label: 'vs last term', direction: 'up' }}
          />
          <AdminStatsCard
            title="Pending Review"
            value={pendingReview}
            icon={<Clock className="w-5 h-5" />}
            subtitle="Awaiting admin approval"
          />
          <AdminStatsCard
            title="Published"
            value={published}
            icon={<CheckCircle2 className="w-5 h-5" />}
            trend={{ value: 5, label: 'vs last month', direction: 'up' }}
          />
          <AdminStatsCard
            title="Archived"
            value={archived}
            icon={<Archive className="w-5 h-5" />}
          />
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex items-center gap-1 border-b border-[#22272B]">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="courses-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E40000]"
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by course title or instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[160px]"
            >
              <option value="">All Grades</option>
              {Array.from({ length: 9 }, (_, i) => (
                <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
              ))}
            </select>
          </div>
          <button className="flex items-center gap-2 px-3 py-2.5 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </motion.div>

        {/* Table */}
        <motion.div
          variants={itemVariants}
          className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden"
        >
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Courses Found</h3>
              <p className="text-white/40 text-sm">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#22272B] text-left">
                    <th className="px-4 py-3 text-white/60 font-medium">Course Title</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Instructor</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Grade Level</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Students</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Status</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Created</th>
                    <th className="px-4 py-3 text-white/60 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">{course.title}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{course.instructor}</td>
                      <td className="px-4 py-3">
                        <span className="text-gray-400">{course.grade_level}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{course.students_enrolled}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={course.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-400">{formatDate(course.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="View"
                            className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {course.status === 'pending' && (
                            <>
                              <button
                                title="Approve"
                                className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/50 hover:text-emerald-400 transition-colors"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                title="Reject"
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            title="More"
                            className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {filteredCourses.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#22272B]">
              <p className="text-xs text-white/40">
                Showing {filteredCourses.length} of {MOCK_COURSES.length} courses
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default CoursesAdminPage;
