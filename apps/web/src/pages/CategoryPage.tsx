/**
 * Category Landing Page
 *
 * Renders a full landing page for each category slug with:
 * 1. Hero section with title, grade range, and overview
 * 2. CBC curriculum content (subjects, outcomes, strands) from cbcContent.ts
 * 3. Filtered course listing from the API
 *
 * Falls back to a simple filtered course listing if no CBC content exists for the slug.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

import courseService from '../services/courseService';
import CourseCard from '../components/course/CourseCard';
import type { Course, CourseFilterParams } from '../types/course';
import type { CategoryContent } from '../data/cbcContent';
import { generateCourseCode } from '../utils/courseCode';

// CBC content — lazy loaded, may not exist yet
let cbcContentCache: Record<string, CategoryContent> = {};
let cbcLoadAttempted = false;

async function loadCbcContent(): Promise<Record<string, CategoryContent>> {
  if (cbcLoadAttempted) return cbcContentCache;
  cbcLoadAttempted = true;
  try {
    const mod = await import('../data/cbcContent');
    cbcContentCache = mod.cbcContent || {};
    return cbcContentCache;
  } catch {
    return {};
  }
}

// ============================================================================
// Slug → API Filter Mapping
// ============================================================================

interface SlugParams {
  label: string;
  filters: CourseFilterParams;
}

const SLUG_TO_PARAMS: Record<string, SlugParams> = {
  // Grade-level slugs
  'pp1': { label: 'PP1', filters: { grade_level: 'PP1', audience: 'students' } },
  'pp2': { label: 'PP2', filters: { grade_level: 'PP2', audience: 'students' } },
  'lower-primary': { label: 'Lower Primary (Grade 1-3)', filters: { audience: 'students' } },
  'upper-primary': { label: 'Upper Primary (Grade 4-6)', filters: { audience: 'students' } },
  'grade-7': { label: 'Grade 7', filters: { grade_level: 'Grade 7', audience: 'students' } },
  'grade-8': { label: 'Grade 8', filters: { grade_level: 'Grade 8', audience: 'students' } },
  'grade-9': { label: 'Grade 9', filters: { grade_level: 'Grade 9', audience: 'students' } },
  'grade-10': { label: 'Grade 10', filters: { grade_level: 'Grade 10', audience: 'students' } },
  'grade-11': { label: 'Grade 11', filters: { grade_level: 'Grade 11', audience: 'students' } },
  'grade-12': { label: 'Grade 12', filters: { grade_level: 'Grade 12', audience: 'students' } },

  // Parent-level category slugs
  'pre-primary': { label: 'Pre Primary Education', filters: { audience: 'students' } },
  'pre-primary-education': { label: 'Pre Primary Education', filters: { audience: 'students' } },
  'primary': { label: 'Primary Education', filters: { audience: 'students' } },
  'primary-education': { label: 'Primary Education', filters: { audience: 'students' } },
  'junior-secondary': { label: 'Junior Secondary', filters: { audience: 'students' } },
  'senior-secondary': { label: 'Senior Secondary', filters: { audience: 'students' } },

  // Subject/learning area slugs
  'mathematics': { label: 'Mathematics', filters: { learning_area: 'Mathematics' } },
  'english': { label: 'English', filters: { learning_area: 'English' } },
  'kiswahili': { label: 'Kiswahili', filters: { learning_area: 'Kiswahili' } },
  'arabic': { label: 'Arabic', filters: { learning_area: 'Arabic' } },
  'french': { label: 'French', filters: { learning_area: 'French' } },
  'german': { label: 'German', filters: { learning_area: 'German' } },
  'indigenous-language': { label: 'Indigenous Language', filters: { learning_area: 'Indigenous Language' } },
  'mandarin': { label: 'Mandarin', filters: { learning_area: 'Mandarin' } },
  'kenyan-sign-language': { label: 'Kenyan Sign Language', filters: { learning_area: 'Kenyan Sign Language' } },
  'cre': { label: 'CRE', filters: { learning_area: 'CRE' } },
  'hre': { label: 'HRE', filters: { learning_area: 'HRE' } },
  'ire': { label: 'IRE', filters: { learning_area: 'IRE' } },
  'environmental-activities': { label: 'Environmental Activities', filters: { learning_area: 'Environmental Activities' } },
  'science-technology': { label: 'Science & Technology', filters: { learning_area: 'Science & Technology' } },
  'integrated-science': { label: 'Integrated Science', filters: { learning_area: 'Integrated Science' } },
  'pure-sciences': { label: 'Pure Sciences', filters: { learning_area: 'Pure Sciences' } },
  'applied-sciences': { label: 'Applied Sciences', filters: { learning_area: 'Applied Sciences' } },
  'social-studies': { label: 'Social Studies', filters: { learning_area: 'Social Studies' } },
  'humanities': { label: 'Humanities', filters: { learning_area: 'Humanities' } },
  'creative-activities': { label: 'Creative Activities', filters: { learning_area: 'Creative Activities' } },
  'creative-arts-subject': { label: 'Creative Arts', filters: { learning_area: 'Creative Arts' } },
  'arts-sports': { label: 'Arts & Sports', filters: { learning_area: 'Arts & Sports' } },
  'art-craft': { label: 'Art & Craft', filters: { learning_area: 'Art & Craft' } },
  'music': { label: 'Music', filters: { learning_area: 'Music' } },
  'physical-education': { label: 'Physical Education', filters: { learning_area: 'Physical Education' } },
  'agriculture': { label: 'Agriculture', filters: { learning_area: 'Agriculture' } },
  'home-science': { label: 'Home Science', filters: { learning_area: 'Home Science' } },
  'pre-technical-studies': { label: 'Pre-Technical Studies', filters: { learning_area: 'Pre-Technical Studies' } },
  'technical-studies-subject': { label: 'Technical Studies', filters: { learning_area: 'Technical Studies' } },

  // Group slugs (no specific learning_area — show multiple)
  'languages': { label: 'Languages', filters: {} },
  'religious-studies': { label: 'Religious Studies', filters: {} },
  'science': { label: 'Science', filters: {} },
  'sciences': { label: 'Science', filters: {} },
  'social-humanities': { label: 'Social Studies & Humanities', filters: {} },
  'creative-arts': { label: 'Creative Arts & Activities', filters: {} },
  'creative-arts-activities': { label: 'Creative Arts & Activities', filters: {} },
  'agriculture-home': { label: 'Agriculture & Home Science', filters: {} },
  'technical-studies': { label: 'Technical & Pre-Technical', filters: {} },
  'technical-pre-technical': { label: 'Technical & Pre-Technical', filters: {} },

  // Audience slugs
  'diploma-education': { label: 'Diploma in Teachers Education', filters: { grade_level: 'Diploma', audience: 'teachers' } },
  'diploma-teachers-education': { label: 'Diploma in Teachers Education', filters: { grade_level: 'Diploma', audience: 'teachers' } },
  'teachers-guide': { label: "Teachers Guide", filters: { audience: 'teachers' } },
  'teachers-guide-pre-primary': { label: 'Pre-Primary Teaching Guides', filters: { audience: 'teachers', search: 'PP1 PP2' } },
  'teachers-guide-lower-primary': { label: 'Lower Primary Teaching Guides', filters: { audience: 'teachers', search: 'Grade 1 Grade 2 Grade 3' } },
  'teachers-guide-upper-primary': { label: 'Upper Primary Teaching Guides', filters: { audience: 'teachers', search: 'Grade 4 Grade 5 Grade 6' } },
  'teachers-guide-junior-secondary': { label: 'Junior Secondary Teaching Guides', filters: { audience: 'teachers', search: 'Grade 7 Grade 8 Grade 9' } },
  'teachers-guide-senior-secondary': { label: 'Senior Secondary Teaching Guides', filters: { audience: 'teachers', search: 'Grade 10 Grade 11 Grade 12' } },
  'teachers-guide-diploma': { label: 'Diploma Teaching Guides', filters: { audience: 'teachers', search: 'Diploma' } },

  // Revision / Exam slugs
  'revision': { label: 'Revision (Q&A)', filters: { audience: 'revision' } },
  'revision-courses': { label: 'Revision Courses', filters: { audience: 'revision' } },
  'kpsea': { label: 'KPSEA (Grade 6)', filters: { audience: 'revision', grade_level: 'Grade 6' } },
  'kjsea': { label: 'KJSEA (Grade 9)', filters: { audience: 'revision', grade_level: 'Grade 9' } },
  'kcse': { label: 'KCSE (Grade 12)', filters: { audience: 'revision', grade_level: 'Grade 12' } },
};

// Helper: for group slugs that map to multiple learning areas, we search by group name
const GROUP_SEARCH_MAP: Record<string, string> = {
  'languages': 'Language English Kiswahili Arabic French German Mandarin',
  'religious-studies': 'CRE HRE IRE Religious Education',
  'science': 'Science Environmental Integrated',
  'sciences': 'Science Environmental Integrated',
  'social-humanities': 'Social Studies Humanities',
  'creative-arts': 'Creative Arts Music Physical Education',
  'creative-arts-activities': 'Creative Arts Music Physical Education',
  'agriculture-home': 'Agriculture Home Science',
  'technical-studies': 'Technical Studies Pre-Technical',
  'technical-pre-technical': 'Technical Studies Pre-Technical',
};

// For multi-grade slugs
const MULTI_GRADE_SEARCH: Record<string, string> = {
  'pre-primary': 'PP1 PP2',
  'pre-primary-education': 'PP1 PP2',
  'primary': 'Grade 1 Grade 2 Grade 3 Grade 4 Grade 5 Grade 6',
  'primary-education': 'Grade 1 Grade 2 Grade 3 Grade 4 Grade 5 Grade 6',
  'lower-primary': 'Grade 1 Grade 2 Grade 3',
  'upper-primary': 'Grade 4 Grade 5 Grade 6',
  'junior-secondary': 'Grade 7 Grade 8 Grade 9',
  'senior-secondary': 'Grade 10 Grade 11 Grade 12',
};

// Alias mapping: navigation slug → cbcContent key (where they differ)
const CBC_SLUG_ALIASES: Record<string, string> = {
  'pre-primary': 'pre-primary-education',
  'primary': 'primary-education',
  'sciences': 'science',
  'creative-arts': 'creative-arts-activities',
  'technical-studies': 'technical-pre-technical',
  'diploma-education': 'diploma-teachers-education',
};

const ITEMS_PER_PAGE = 12;

// ============================================================================
// Component
// ============================================================================

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [cbcData, setCbcData] = useState<Record<string, CategoryContent>>({});
  const [courseLookup, setCourseLookup] = useState<Record<string, Course | null | 'loading'>>({});

  const slugConfig = slug ? SLUG_TO_PARAMS[slug] : undefined;
  const cbcSlug = slug ? (CBC_SLUG_ALIASES[slug] || slug) : undefined;
  const content = cbcSlug ? cbcData[cbcSlug] : undefined;
  const pageTitle = content?.title || slugConfig?.label || slug || 'Category';

  // Load CBC content on mount
  useEffect(() => {
    loadCbcContent().then(setCbcData);
  }, []);

  const loadCourses = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const baseFilters = slugConfig?.filters || {};
      const params: CourseFilterParams = {
        ...baseFilters,
        skip: (currentPage - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      };

      // For group slugs, add search term to find courses across multiple learning areas
      if (GROUP_SEARCH_MAP[slug] && !params.learning_area && !params.search) {
        params.search = GROUP_SEARCH_MAP[slug];
      }

      // For multi-grade slugs that don't have a specific grade_level, search by grade names
      if (MULTI_GRADE_SEARCH[slug] && !params.grade_level && !params.search) {
        params.search = MULTI_GRADE_SEARCH[slug];
      }

      const response = await courseService.listCourses(params);
      setCourses(response.courses);
      setTotal(response.total);
    } catch (err) {
      console.error('Error loading category courses:', err);
    } finally {
      setLoading(false);
    }
  }, [slug, slugConfig, currentPage]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    setCurrentPage(1);
    setExpandedSubject(null);
    setCourseLookup({});
  }, [slug]);

  const handleSubjectToggle = useCallback(
    (subjectKey: string, displayName: string, learningArea: string, grade?: string) => {
      if (expandedSubject === subjectKey) {
        setExpandedSubject(null);
        return;
      }
      setExpandedSubject(subjectKey);
      if (courseLookup[subjectKey] !== undefined) return;

      setCourseLookup((prev) => ({ ...prev, [subjectKey]: 'loading' }));

      const resolve = (course: Course | null) =>
        setCourseLookup((prev) => ({ ...prev, [subjectKey]: course }));

      (async () => {
        try {
          // Strategy 1: course_code lookup (most precise)
          const courseCode = grade ? generateCourseCode(learningArea, grade) : null;
          if (courseCode) {
            const r1 = await courseService.listCourses({ course_code: courseCode, limit: 1 });
            if (r1.courses.length > 0) { resolve(r1.courses[0]); return; }
          }

          // Strategy 2: learning_area + grade filter
          if (grade) {
            const r2 = await courseService.listCourses({
              learning_area: learningArea,
              grade_level: grade,
              audience: 'students',
              limit: 1,
            });
            if (r2.courses.length > 0) { resolve(r2.courses[0]); return; }
          }

          // Strategy 3: text search by display name (e.g., "UHS English Grade 1")
          const r3 = await courseService.listCourses({ search: displayName, limit: 1 });
          resolve(r3.courses[0] ?? null);
        } catch {
          resolve(null);
        }
      })();
    },
    [expandedSubject, courseLookup]
  );

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Build "View All" link with filters pre-applied
  const viewAllLink = (() => {
    if (!slugConfig) return '/courses';
    const params = new URLSearchParams();
    const f = slugConfig.filters;
    if (f.audience) params.set('audience', f.audience);
    if (f.grade_level) params.set('grade_level', String(f.grade_level));
    if (f.learning_area) params.set('learning_area', String(f.learning_area));
    if (f.search) params.set('search', f.search);
    return `/courses?${params.toString()}`;
  })();

  if (!slug) {
    navigate('/courses', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112]">
      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-[#181C1F] dark:to-[#0F1112] border-b border-gray-200 dark:border-[#22272B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to="/courses" className="hover:text-gray-900 dark:hover:text-white transition-colors">Courses</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 dark:text-white font-medium">{pageTitle}</span>
          </nav>

          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-[#E40000]/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap size={28} className="text-[#E40000]" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {pageTitle}
              </h1>
              {content?.gradeRange && (
                <span className="inline-block px-3 py-1 bg-[#E40000]/10 text-[#E40000] text-sm font-medium rounded-full mb-3">
                  {content.gradeRange}
                </span>
              )}
              {content?.ageRange && (
                <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 text-sm font-medium rounded-full mb-3 ml-2">
                  {content.ageRange}
                </span>
              )}
            </div>
          </div>

          {content?.overview && (
            <p className="text-gray-500 text-base lg:text-lg max-w-3xl leading-relaxed">
              {content.overview}
            </p>
          )}

          {!content && (
            <p className="text-gray-500 text-base lg:text-lg max-w-3xl">
              Browse all {pageTitle} courses aligned with Kenya's CBC curriculum.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* ============================================================ */}
        {/* CBC CURRICULUM CONTENT */}
        {/* ============================================================ */}
        {content && content.subjects.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen size={22} className="text-[#E40000]" />
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                CBC {pageTitle} Overview
              </h2>
            </div>

            <div className="grid gap-3">
              {content.subjects.map((subject, index) => {
                const subjectKey = subject.grade
                  ? `${subject.name}--${subject.grade}`
                  : `${subject.name}--${index}`;
                const isOpen = expandedSubject === subjectKey;
                // Strip date/grade suffixes so cbcContent names map to AREA_CODE_MAP keys
                // Handles: "- October 2025", "Gredi 10", trailing grade numbers, Kiswahili months
                const cleanName = subject.name
                  .replace(
                    /\s*[-–,]?\s*(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Januari|Februari|Machi|Aprili|Mei|Juni|Julai|Agosti|Septemba|Oktoba|Novemba|Desemba)\s*,?\s*20\d{2}/gi,
                    ''
                  )
                  .replace(/\s+Gredi\s+\d{1,2}/gi, '')  // "Gredi 10" suffix
                  .replace(/\s+\d{1,2}\s*$/, '')          // trailing grade number
                  .replace(/\s*[-–]\s*$/, '')              // trailing dash
                  .replace(/\s{2,}/g, ' ')
                  .trim();
                const displayName = subject.grade
                  ? `UHS ${cleanName} ${subject.grade}`
                  : cleanName;
                // Lazy-loaded course entry for the enroll button
                const courseEntry = courseLookup[subjectKey];
                const matchedCourse =
                  courseEntry !== undefined && courseEntry !== 'loading' ? courseEntry : undefined;
                const fallbackCatalogUrl = (() => {
                  const p = new URLSearchParams();
                  if (subject.grade) p.set('grade_level', subject.grade);
                  if (slugConfig?.filters?.learning_area) p.set('learning_area', String(slugConfig.filters.learning_area));
                  return `/courses?${p.toString()}`;
                })();
                return (
                  <div
                    key={subjectKey}
                    className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => handleSubjectToggle(
                        subjectKey,
                        displayName,
                        slugConfig?.filters?.learning_area
                          ? String(slugConfig.filters.learning_area)
                          : cleanName,
                        subject.grade
                      )}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-[#1A1F23] transition-colors"
                    >
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {displayName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                          {subject.description}
                        </p>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 flex-shrink-0 ml-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-[#22272B] pt-4">
                            {/* Learning Outcomes */}
                            {subject.outcomes.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                  Learning Outcomes
                                </h4>
                                <ul className="space-y-1.5">
                                  {subject.outcomes.map((outcome, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                                      <Sparkles size={12} className="text-[#E40000] mt-1 flex-shrink-0" />
                                      <span>{outcome}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Strands */}
                            {subject.strands.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                  Curriculum Strands
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {subject.strands.map((strand, i) => (
                                    <span
                                      key={i}
                                      className="px-2.5 py-1 bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-gray-400 text-xs rounded-full"
                                    >
                                      {strand}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Meta */}
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1">
                              {subject.lessonsPerWeek && (
                                <span>{subject.lessonsPerWeek} lessons/week</span>
                              )}
                              {subject.assessment && (
                                <span>Assessment: {subject.assessment}</span>
                              )}
                            </div>

                            {/* Enroll Button */}
                            <div className="pt-2">
                              {courseEntry === 'loading' ? (
                                <div className="h-10 w-48 bg-gray-200 dark:bg-[#22272B] rounded-lg animate-pulse" />
                              ) : matchedCourse ? (
                                <button
                                  onClick={() => navigate(`/courses/${matchedCourse.id}`)}
                                  className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#E40000] hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                                >
                                  <span className="opacity-90 font-normal">
                                    {matchedCourse.price === 0
                                      ? 'Free'
                                      : `KES ${matchedCourse.price.toLocaleString()}`}
                                  </span>
                                  <span className="w-px h-4 bg-white/30" />
                                  Enroll Now
                                  <ArrowRight size={14} />
                                </button>
                              ) : (
                                <Link
                                  to={fallbackCatalogUrl}
                                  className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#E40000] hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                                >
                                  Browse Courses
                                  <ArrowRight size={14} />
                                </Link>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* COURSE LISTING */}
        {/* ============================================================ */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {pageTitle} Courses
            </h2>
            <span className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${total} course${total !== 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden animate-pulse">
                  <div className="h-44 bg-gray-100 dark:bg-[#22272B]" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 w-16 bg-gray-100 dark:bg-[#22272B] rounded" />
                    <div className="h-4 w-3/4 bg-gray-100 dark:bg-[#22272B] rounded" />
                    <div className="h-4 w-1/2 bg-gray-100 dark:bg-[#22272B] rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && courses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 mb-5 rounded-full bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] flex items-center justify-center">
                <BookOpen size={36} className="text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
              <p className="text-gray-500 mb-5 max-w-sm">
                No courses are currently available for this category. Check back soon or browse all courses.
              </p>
              <Link
                to="/courses"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#E40000] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Browse All Courses
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Course Grid */}
          {!loading && courses.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    variant="grid"
                    onNavigate={(id) => navigate(`/courses/${id}`)}
                  />
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#22272B] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#22272B] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </nav>
              )}

              {/* View All Link */}
              <div className="mt-8 text-center">
                <Link
                  to={viewAllLink}
                  className="inline-flex items-center gap-2 text-sm text-[#E40000] hover:text-red-400 font-medium transition-colors"
                >
                  View All {pageTitle} Courses in Catalog
                  <ArrowRight size={14} />
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
