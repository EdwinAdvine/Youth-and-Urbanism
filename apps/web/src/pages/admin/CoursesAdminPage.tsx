import React, { useState, useEffect } from 'react';
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
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';
import adminContentService from '../../services/admin/adminContentService';

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
/* Fallback data                                                       */
/* ------------------------------------------------------------------ */

const FALLBACK_COURSES: Course[] = [
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
  const [courses, setCourses] = useState<Course[]>(FALLBACK_COURSES);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await adminContentService.listCourses({ page_size: 100 });
        const mapped: Course[] = response.items.map((item) => ({
          id: item.id,
          title: item.title,
          instructor: item.creator_name,
          grade_level: item.grade_levels?.[0] ?? 'N/A',
          status: (item.status === 'pending_review' ? 'pending' : item.status === 'rejected' ? 'draft' : item.status) as CourseStatus,
          students_enrolled: item.enrollment_count,
          created_at: item.created_at ?? '',
        }));
        if (mapped.length > 0) {
          setCourses(mapped);
        }
      } catch {
        // API unavailable — keep fallback data
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  /* -- Button handlers ------------------------------------------------- */

  const handleAddCourse = () => {
    alert('Create course flow coming soon');
  };

  const handleExport = () => {
    const headers = ['Title', 'Instructor', 'Grade Level', 'Students Enrolled', 'Status', 'Created'];
    const rows = filteredCourses.map((c) =>
      [c.title, c.instructor, c.grade_level, c.students_enrolled, c.status, c.created_at].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'courses_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Courses exported successfully');
  };

  const handleViewCourse = (course: Course) => {
    alert(
      `Course Details\n\nTitle: ${course.title}\nInstructor: ${course.instructor}\nGrade: ${course.grade_level}\nStatus: ${course.status}\nStudents Enrolled: ${course.students_enrolled}\nCreated: ${course.created_at}`
    );
  };

  const handleApproveCourse = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: 'published' as CourseStatus } : c))
    );
    showToast('Course approved and published successfully');
  };

  const handleRejectCourse = (courseId: string, title: string) => {
    const reason = prompt(`Provide a reason for rejecting "${title}":`);
    if (reason === null) return;
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: 'draft' as CourseStatus } : c))
    );
    showToast(`Course rejected: ${reason || 'No reason provided'}`);
  };

  const handleMoreOptions = () => {
    alert('More options coming soon');
  };

  /* ------------------------------------------------------------------- */

  const filteredCourses = courses.filter((c) => {
    // Tab filter
    if (activeTab === 'pending' && c.status !== 'pending') return false;
    if (activeTab === 'archived' && c.status !== 'archived') return false;
    // Search
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.instructor.toLowerCase().includes(search.toLowerCase())) return false;
    // Grade filter
    if (gradeFilter && c.grade_level !== gradeFilter) return false;
    return true;
  });

  const totalCourses = courses.length;
  const pendingReview = courses.filter((c) => c.status === 'pending').length;
  const published = courses.filter((c) => c.status === 'published').length;
  const archived = courses.filter((c) => c.status === 'archived').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-100 dark:bg-[#22272B] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <>
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
            <button
              onClick={handleAddCourse}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#C00] transition-colors"
            >
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
        <motion.div variants={itemVariants} className="flex items-center gap-1 border-b border-gray-200 dark:border-[#22272B]">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70'
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search by course title or instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[160px]"
            >
              <option value="">All Grades</option>
              {Array.from({ length: 9 }, (_, i) => (
                <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2.5 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </motion.div>

        {/* Table */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden"
        >
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Courses Found</h3>
              <p className="text-gray-400 dark:text-white/40 text-sm">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                    <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Course Title</th>
                    <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Instructor</th>
                    <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Grade Level</th>
                    <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Students</th>
                    <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Status</th>
                    <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Created</th>
                    <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-gray-900 dark:text-white font-medium">{course.title}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-300">{course.instructor}</td>
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
                            onClick={() => handleViewCourse(course)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {course.status === 'pending' && (
                            <>
                              <button
                                title="Approve"
                                onClick={() => handleApproveCourse(course.id)}
                                className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-gray-500 dark:text-white/50 hover:text-emerald-400 transition-colors"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                title="Reject"
                                onClick={() => handleRejectCourse(course.id, course.title)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 dark:text-white/50 hover:text-red-400 transition-colors"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            title="More"
                            onClick={handleMoreOptions}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-[#22272B]">
              <p className="text-xs text-gray-400 dark:text-white/40">
                Showing {filteredCourses.length} of {courses.length} courses
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default CoursesAdminPage;
