import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuthStore } from '../store/authStore';
import courseService from '../services/courseService';
import {
  Award,
  Download,
  Share2,
  Printer,
  Search,
  Filter,
  Calendar,
  Trophy,
  Star,
  GraduationCap,
  X,
  CheckCircle,
  TrendingUp,
  Target,
} from 'lucide-react';

// Types
interface Certificate {
  id: string;
  type: 'course' | 'quiz' | 'achievement' | 'grade_level';
  title: string;
  courseName?: string;
  issueDate: Date;
  score?: number;
  grade?: string;
  verificationCode: string;
  downloadUrl?: string;
  description: string;
  instructor?: string;
  level?: string;
}

type CertificateFilter = 'all' | 'course' | 'quiz' | 'achievement' | 'grade_level';
type SortOrder = 'newest' | 'oldest';

// Mock data
const mockCertificates: Certificate[] = [
  {
    id: 'CERT001',
    type: 'course',
    title: 'Certificate of Completion',
    courseName: 'Mathematics Grade 6',
    issueDate: new Date('2024-12-15'),
    score: 90,
    grade: 'A',
    verificationCode: 'TUHS-MATH-2024-001',
    description: 'Successfully completed Mathematics Grade 6 with excellence',
    instructor: 'Dr. Jane Kamau',
    level: 'Grade 6',
  },
  {
    id: 'CERT002',
    type: 'quiz',
    title: 'Quiz Champion',
    courseName: 'Science Quiz - Living Things',
    issueDate: new Date('2024-12-10'),
    score: 100,
    grade: 'A+',
    verificationCode: 'TUHS-QUIZ-2024-002',
    description: 'Perfect score on Science Quiz - Living Things',
    instructor: 'Prof. Peter Omondi',
    level: 'Grade 6',
  },
  {
    id: 'CERT003',
    type: 'achievement',
    title: 'Excellence Award',
    courseName: 'Kiswahili Mastery',
    issueDate: new Date('2024-11-28'),
    score: 95,
    grade: 'A',
    verificationCode: 'TUHS-ACHV-2024-003',
    description: 'Outstanding performance in Kiswahili language studies',
    instructor: 'Mwalimu Grace Njeri',
    level: 'Grade 6',
  },
  {
    id: 'CERT004',
    type: 'course',
    title: 'Certificate of Completion',
    courseName: 'Social Studies Grade 6',
    issueDate: new Date('2024-11-20'),
    score: 85,
    grade: 'B+',
    verificationCode: 'TUHS-SOC-2024-004',
    description: 'Successfully completed Social Studies Grade 6',
    instructor: 'Mr. David Wanjiru',
    level: 'Grade 6',
  },
  {
    id: 'CERT005',
    type: 'achievement',
    title: 'Perfect Attendance Award',
    courseName: 'Monthly Attendance Record',
    issueDate: new Date('2024-11-01'),
    verificationCode: 'TUHS-ATND-2024-005',
    description: '100% attendance for the month of October 2024',
    level: 'Grade 6',
  },
  {
    id: 'CERT006',
    type: 'quiz',
    title: 'Quiz Excellence',
    courseName: 'Mathematics Quiz - Fractions',
    issueDate: new Date('2024-10-15'),
    score: 98,
    grade: 'A+',
    verificationCode: 'TUHS-QUIZ-2024-006',
    description: 'Exceptional performance on Mathematics Quiz - Fractions',
    instructor: 'Dr. Jane Kamau',
    level: 'Grade 6',
  },
  {
    id: 'CERT007',
    type: 'grade_level',
    title: 'Grade Level Completion',
    courseName: 'Grade 5 Completion',
    issueDate: new Date('2024-03-30'),
    score: 88,
    grade: 'A-',
    verificationCode: 'TUHS-GRADE-2024-007',
    description: 'Successfully completed all Grade 5 requirements',
    level: 'Grade 5',
  },
  {
    id: 'CERT008',
    type: 'achievement',
    title: 'Top Performer',
    courseName: 'Term 2 Academic Excellence',
    issueDate: new Date('2024-08-15'),
    score: 92,
    grade: 'A',
    verificationCode: 'TUHS-PERF-2024-008',
    description: 'Top 5% performer in Term 2 examinations',
    level: 'Grade 6',
  },
];

const CertificatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<CertificateFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const completedEnrollments = await courseService.getCompletedEnrollments();
        if (completedEnrollments.length > 0) {
          const mapped: Certificate[] = completedEnrollments.map((e: any, idx: number) => ({
            id: `CERT-${e.id || idx}`,
            type: 'course' as const,
            title: 'Certificate of Completion',
            courseName: e.course_title || e.course?.title || `Course ${idx + 1}`,
            issueDate: new Date(e.completed_at || e.updated_at || Date.now()),
            score: e.progress_percentage || 100,
            grade: (e.progress_percentage || 100) >= 90 ? 'A' : (e.progress_percentage || 100) >= 80 ? 'B+' : 'B',
            verificationCode: `TUHS-${(e.id || '').slice(0, 8).toUpperCase() || `AUTO-${idx}`}`,
            description: `Successfully completed ${e.course_title || 'course'}`,
            level: e.grade_level || '',
          }));
          setCertificates(mapped);
          return;
        }
      } catch {
        // API not available
      }
      // Fall back to mock data
      setCertificates(mockCertificates);
    };
    fetchCertificates();
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let filtered = [...certificates];

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter((cert) => cert.type === filter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((cert) =>
        cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.issueDate).getTime();
      const dateB = new Date(b.issueDate).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredCertificates(filtered);
  }, [certificates, filter, sortOrder, searchQuery]);

  // Calculate stats
  const totalCertificates = certificates.length;
  const coursesCompleted = certificates.filter((c) => c.type === 'course').length;
  const averageScore =
    certificates.filter((c) => c.score).length > 0
      ? Math.round(
          certificates.filter((c) => c.score).reduce((sum, c) => sum + (c.score || 0), 0) /
            certificates.filter((c) => c.score).length
        )
      : 0;

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setShowModal(true);
  };

  const handleDownloadPDF = (certificate: Certificate) => {
    // In production, this would call the API endpoint
    console.log('Downloading certificate:', certificate.id);
    alert(`Downloading ${certificate.title}...`);
  };

  const handleShare = (certificate: Certificate) => {
    // Share functionality
    const shareUrl = `${window.location.origin}/verify/${certificate.verificationCode}`;
    if (navigator.share) {
      navigator.share({
        title: certificate.title,
        text: `Check out my ${certificate.title} from Urban Home School!`,
        url: shareUrl,
      }).catch(() => {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(shareUrl);
        alert('Certificate link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Certificate link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getCertificateIcon = (type: Certificate['type']) => {
    switch (type) {
      case 'course':
        return <GraduationCap className="w-5 h-5" />;
      case 'quiz':
        return <Trophy className="w-5 h-5" />;
      case 'achievement':
        return <Star className="w-5 h-5" />;
      case 'grade_level':
        return <Award className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  const getGradeBadgeColor = (grade?: string) => {
    if (!grade) return 'bg-gray-500';
    if (grade.startsWith('A')) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (grade.startsWith('B')) return 'bg-gradient-to-r from-blue-400 to-blue-600';
    if (grade.startsWith('C')) return 'bg-gradient-to-r from-green-400 to-green-600';
    return 'bg-gradient-to-r from-gray-400 to-gray-600';
  };

  return (
    <DashboardLayout role={user?.role || 'student'}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Certificates
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Celebrate your achievements and showcase your accomplishments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Certificates</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {totalCertificates}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Courses Completed</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {coursesCompleted}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Average Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {averageScore}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as CertificateFilter)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="course">Courses</option>
                <option value="quiz">Quizzes</option>
                <option value="achievement">Achievements</option>
                <option value="grade_level">Grade Levels</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        {filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => (
              <div
                key={certificate.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
              >
                {/* Certificate Preview */}
                <div className="relative bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-700 dark:to-gray-600 p-8 border-4 border-double border-yellow-600 dark:border-yellow-500">
                  <div className="absolute top-2 right-2">
                    <div
                      className={`${getGradeBadgeColor(
                        certificate.grade
                      )} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg`}
                    >
                      {certificate.grade || 'Award'}
                    </div>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-600 dark:bg-yellow-500 rounded-full mb-2">
                      {getCertificateIcon(certificate.type)}
                      <span className="sr-only">{certificate.type}</span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {certificate.title}
                    </h3>

                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {certificate.courseName}
                    </p>

                    {certificate.score && (
                      <div className="flex items-center justify-center gap-2">
                        <Target className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {certificate.score}%
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Issued: {new Date(certificate.issueDate).toLocaleDateString()}
                    </p>

                    <div className="pt-2 border-t border-yellow-600/20">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {certificate.verificationCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewCertificate(certificate)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      View
                    </button>

                    <button
                      onClick={() => handleDownloadPDF(certificate)}
                      className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleShare(certificate)}
                      className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-12 h-12 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {searchQuery || filter !== 'all'
                  ? 'No Certificates Found'
                  : 'No Certificates Yet'}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {searchQuery || filter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Complete courses and quizzes to earn your first certificate!'}
              </p>

              {(!searchQuery && filter === 'all') && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/dashboard/courses')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <GraduationCap className="w-5 h-5" />
                    Browse Courses
                  </button>

                  <button
                    onClick={() => navigate('/dashboard/quizzes')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-5 h-5" />
                    Take Quizzes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        {showModal && selectedCertificate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 print:bg-white print:relative print:block">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto print:max-w-full print:max-h-none print:overflow-visible">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 print:hidden">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Certificate Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Certificate Content */}
              <div className="p-8 print:p-16">
                <div className="border-8 border-double border-yellow-600 dark:border-yellow-500 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 p-12 relative">
                  {/* Decorative Corner Elements */}
                  <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-yellow-600 dark:border-yellow-500"></div>
                  <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-yellow-600 dark:border-yellow-500"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-yellow-600 dark:border-yellow-500"></div>
                  <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-yellow-600 dark:border-yellow-500"></div>

                  {/* Content */}
                  <div className="text-center space-y-6">
                    {/* Logo/Icon */}
                    <div className="flex justify-center">
                      <div className="w-24 h-24 bg-yellow-600 dark:bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                        <Award className="w-12 h-12 text-white" />
                      </div>
                    </div>

                    {/* School Name */}
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Urban Home School
                      </h1>
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                        The Bird AI - Empowering Future Leaders
                      </p>
                    </div>

                    {/* Certificate Title */}
                    <div className="py-4">
                      <h2 className="text-3xl font-serif text-yellow-700 dark:text-yellow-400 mb-2">
                        {selectedCertificate.title}
                      </h2>
                      <div className="w-32 h-1 bg-yellow-600 dark:bg-yellow-500 mx-auto"></div>
                    </div>

                    {/* Awarded To */}
                    <div className="space-y-2">
                      <p className="text-gray-700 dark:text-gray-300 text-lg">
                        This is to certify that
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-400 pb-2 inline-block px-8">
                        {user?.full_name || 'Student Name'}
                      </p>
                    </div>

                    {/* Achievement Description */}
                    <div className="space-y-4 max-w-2xl mx-auto">
                      <p className="text-gray-700 dark:text-gray-300 text-lg">
                        {selectedCertificate.description}
                      </p>

                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {selectedCertificate.courseName}
                      </p>

                      {selectedCertificate.score && (
                        <div className="flex items-center justify-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md inline-block">
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            Score: {selectedCertificate.score}%
                          </span>
                          <span
                            className={`${getGradeBadgeColor(
                              selectedCertificate.grade
                            )} text-white px-4 py-1 rounded-full text-sm font-semibold`}
                          >
                            Grade {selectedCertificate.grade}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Date and Signature */}
                    <div className="pt-8 grid grid-cols-2 gap-8 max-w-2xl mx-auto">
                      <div className="text-center">
                        <p className="text-gray-700 dark:text-gray-300 mb-2">Date of Issue</p>
                        <p className="font-semibold text-gray-900 dark:text-white border-t-2 border-gray-400 pt-2 inline-block px-8">
                          {new Date(selectedCertificate.issueDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          {selectedCertificate.instructor ? 'Instructor' : 'Authorized By'}
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white border-t-2 border-gray-400 pt-2 inline-block px-8">
                          {selectedCertificate.instructor || 'Urban Home School'}
                        </p>
                      </div>
                    </div>

                    {/* Verification Code */}
                    <div className="pt-6 border-t border-yellow-600/30">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Verification Code
                      </p>
                      <p className="font-mono text-sm text-gray-700 dark:text-gray-300 font-semibold">
                        {selectedCertificate.verificationCode}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Verify at: urbanhomeschool.com/verify
                      </p>
                    </div>

                    {/* Seal */}
                    <div className="flex justify-center pt-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 border-4 border-yellow-600 flex items-center justify-center shadow-lg">
                        <Star className="w-10 h-10 text-white" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-4 p-6 border-t border-gray-200 dark:border-gray-700 print:hidden">
                <button
                  onClick={() => handleDownloadPDF(selectedCertificate)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>

                <button
                  onClick={handlePrint}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Print
                </button>

                <button
                  onClick={() => handleShare(selectedCertificate)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:bg-white,
          .print\\:bg-white * {
            visibility: visible;
          }
          .print\\:bg-white {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          @page {
            size: landscape;
            margin: 0.5cm;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default CertificatesPage;
