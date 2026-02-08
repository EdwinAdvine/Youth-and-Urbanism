import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserStore } from '../store';
import { useThemeStore } from '../store';
import { 
  BookOpen, 
  Play, 
  BarChart3, 
  CheckCircle, 
  Star, 
  MessageCircle, 
  Search, 
  Filter, 
  SortAsc,
  Clock,
  Calendar,
  Users,
  Award
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  progress: number;
  status: 'enrolled' | 'in_progress' | 'completed';
  rating?: number;
  thumbnail?: string;
  duration: string;
  lessons: number;
}

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const { courses } = useUserStore();
  const { isDarkMode } = useThemeStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'progress' | 'date' | 'rating'>('title');
  const [filterStatus, setFilterStatus] = useState<'all' | 'enrolled' | 'in_progress' | 'completed'>('all');

  // Filter and sort courses
  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !category || course.category === category;
      
      const matchesStatus = filterStatus === 'all' || course.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'progress':
          return b.progress - a.progress;
        case 'date':
          return 0; // Simple fallback since we don't have actual date data
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'from-green-500 to-emerald-500';
      case 'in_progress': return 'from-blue-500 to-cyan-500';
      case 'enrolled': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'enrolled': return <Clock className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'from-green-500 to-emerald-500';
    if (progress >= 50) return 'from-blue-500 to-cyan-500';
    return 'from-orange-500 to-red-500';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-br from-[#181C1F] to-[#22272B] border border-[#2A3035] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {category ? category.replace('-', ' ').toUpperCase() : 'All Courses'}
              </h1>
              <p className="text-white/60 text-sm">
                Continue your learning journey with our comprehensive courses
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/60">
                <BookOpen className="w-5 h-5" />
                <span>{courses.length} courses</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <BarChart3 className="w-5 h-5" />
                <span>{Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)}% avg progress</span>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses, instructors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#22272B] border border-[#2A3035] rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 bg-[#22272B] border border-[#2A3035] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50 focus:border-transparent transition-all"
              >
                <option value="all">All Status</option>
                <option value="enrolled">Enrolled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-[#22272B] border border-[#2A3035] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FF0000]/50 focus:border-transparent transition-all"
              >
                <option value="title">Sort by Title</option>
                <option value="progress">Sort by Progress</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-gradient-to-br from-[#181C1F] to-[#22272B] border border-[#2A3035] rounded-2xl p-6 hover:border-[#FF0000]/50 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/dashboard/student/courses/${course.id}`)}
              >
                {/* Course Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getStatusColor(course.status)} rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform`}>
                      {getStatusIcon(course.status)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg group-hover:text-[#FF0000] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-white/60">{course.instructor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`w-16 h-16 bg-gradient-to-br ${getProgressColor(course.progress)} rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform`}>
                      {course.progress}%
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="space-y-3 mb-4">
                  <p className="text-sm text-white/80 line-clamp-3">{course.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {course.lessons} lessons
                    </span>
                    {course.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {course.rating}/5
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-[#2A3035] rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${getProgressColor(course.progress)} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(course.status)} text-white`}>
                      {course.status}
                    </span>
                    {course.status === 'completed' && (
                      <Award className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-white/60">
                    <MessageCircle className="w-4 h-4" />
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Community</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF0000] to-[#E40000] rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No courses found</h3>
              <p className="text-white/60 mb-6">
                Try adjusting your search criteria or filters to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className="bg-gradient-to-r from-[#FF0000] to-[#E40000] text-white px-6 py-2 rounded-lg hover:from-[#E40000] hover:to-[#CC0000] transition-all duration-200"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Empty State for Specific Categories */}
        {category && filteredCourses.length === 0 && courses.filter(c => c.category === category).length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No courses in this category yet</h3>
            <p className="text-white/60 mb-6">
              We're working on adding more courses to this category. Check back soon or explore other categories!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard/student/courses/browse')}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
              >
                Browse All Courses
              </button>
              <button
                onClick={() => navigate('/dashboard/student/support/new-student-guide')}
                className="border border-[#2A3035] text-white px-6 py-3 rounded-lg hover:border-[#FF0000] hover:text-[#FF0000] transition-all duration-200"
              >
                Get Course Recommendations
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CoursesPage;