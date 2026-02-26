import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  TrendingUp,
  Star,
  Search,
  Filter,
  GraduationCap,
  BarChart3,
} from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface SponsoredCourse {
  id: string;
  name: string;
  enrolledStudents: number;
  completionRate: number;
  averageScore: number;
  program: string;
  gradeLevel: string;
  rating: number;
}

const SponsoredCoursesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  const courses: SponsoredCourse[] = [
    {
      id: '1',
      name: 'Introduction to Coding with Scratch',
      enrolledStudents: 42,
      completionRate: 85,
      averageScore: 78,
      program: 'STEM Excellence Program',
      gradeLevel: 'Grade 4-6',
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Basic Mathematics Mastery',
      enrolledStudents: 38,
      completionRate: 72,
      averageScore: 74,
      program: 'Early Childhood Development',
      gradeLevel: 'Grade 1-3',
      rating: 4.5,
    },
    {
      id: '3',
      name: 'Creative Writing Workshop',
      enrolledStudents: 29,
      completionRate: 88,
      averageScore: 82,
      program: 'Girls in Tech Initiative',
      gradeLevel: 'Grade 5-7',
      rating: 4.7,
    },
    {
      id: '4',
      name: 'Environmental Science Explorer',
      enrolledStudents: 31,
      completionRate: 65,
      averageScore: 71,
      program: 'STEM Excellence Program',
      gradeLevel: 'Grade 4-6',
      rating: 4.3,
    },
    {
      id: '5',
      name: 'Digital Literacy Foundations',
      enrolledStudents: 25,
      completionRate: 79,
      averageScore: 76,
      program: 'Rural Education Access',
      gradeLevel: 'Grade 3-5',
      rating: 4.6,
    },
    {
      id: '6',
      name: 'Robotics & Engineering Basics',
      enrolledStudents: 22,
      completionRate: 70,
      averageScore: 80,
      program: 'Girls in Tech Initiative',
      gradeLevel: 'Grade 6-8',
      rating: 4.9,
    },
  ];

  const stats = [
    {
      label: 'Total Courses',
      value: '15',
      icon: BookOpen,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Active Enrollments',
      value: '187',
      icon: Users,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Avg Completion Rate',
      value: '78%',
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Top Rated',
      value: '4.6/5',
      icon: Star,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
  ];

  const programs = [
    'all',
    'STEM Excellence Program',
    'Early Childhood Development',
    'Girls in Tech Initiative',
    'Rural Education Access',
  ];

  const gradeLevels = ['all', 'Grade 1-3', 'Grade 3-5', 'Grade 4-6', 'Grade 5-7', 'Grade 6-8'];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProgram = programFilter === 'all' || course.program === programFilter;
    const matchesGrade = gradeFilter === 'all' || course.gradeLevel === gradeFilter;
    return matchesSearch && matchesProgram && matchesGrade;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sponsored Courses</h1>
          <p className="text-gray-500 dark:text-white/60">
            Courses associated with your sponsorship programs
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-white/50">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row items-start md:items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-red-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 dark:text-white/40" />
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
            >
              {programs.map((p) => (
                <option key={p} value={p}>
                  {p === 'all' ? 'All Programs' : p}
                </option>
              ))}
            </select>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
            >
              {gradeLevels.map((g) => (
                <option key={g} value={g}>
                  {g === 'all' ? 'All Grades' : g}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Course Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              variants={fadeUp}
              className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 hover:border-gray-200 dark:hover:border-[#2A2F34] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight flex-1 pr-2">
                  {course.name}
                </h3>
                <div className="flex items-center gap-1 text-yellow-400 shrink-0">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  <span className="text-sm font-medium">{course.rating}</span>
                </div>
              </div>

              <span className="inline-block px-2.5 py-1 bg-red-500/10 text-red-400 text-xs font-medium rounded-full mb-4">
                {course.program}
              </span>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-white/70 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Enrolled Students
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">{course.enrolledStudents}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-600 dark:text-white/70 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Completion Rate
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">{course.completionRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${course.completionRate}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-white/70 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Average Score
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">{course.averageScore}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-[#22272B]">
                <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/40">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {course.gradeLevel}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SponsoredCoursesPage;
