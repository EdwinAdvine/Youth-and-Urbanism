/**
 * Course Catalog Page (Phase 3 - Dark Theme Rewrite)
 *
 * Coursera/edX-inspired course catalog with dark theme.
 * Features:
 * - Debounced search (300ms)
 * - Sidebar filters: categories, price, grade level, learning area, sort, featured toggle
 * - Grid/list view toggle
 * - Paginated results with numbered pages
 * - Responsive with collapsible mobile filter sheet
 * - framer-motion stagger animations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';

import courseService from '../services/courseService';
import categoryService from '../services/categoryService';
import CourseCard from '../components/course/CourseCard';
import type { Course, CourseFilterParams, LearningArea, GradeLevel } from '../types/course';
import type { Category } from '../types/category';

// ============================================================================
// Constants
// ============================================================================

const ITEMS_PER_PAGE = 12;

const GRADE_LEVELS: GradeLevel[] = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
  'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8',
  'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
];

const LEARNING_AREAS: LearningArea[] = [
  'Mathematics',
  'Science and Technology',
  'Languages',
  'English',
  'Kiswahili',
  'Social Studies',
  'Religious Education',
  'Creative Arts',
  'Physical Education',
  'Agriculture and Nutrition',
  'Home Science',
  'Pre-Technical and Career Education',
];

type SortOption = {
  label: string;
  value: string;
};

const SORT_OPTIONS: SortOption[] = [
  { label: 'Featured First', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Rating (High to Low)', value: 'rating_desc' },
  { label: 'Price (Low to High)', value: 'price_asc' },
  { label: 'Price (High to Low)', value: 'price_desc' },
  { label: 'Most Popular', value: 'popular' },
];

type PriceFilter = 'all' | 'free' | 'paid';

// ============================================================================
// Skeleton Loader
// ============================================================================

function SkeletonCard() {
  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden animate-pulse">
      <div className="h-44 bg-[#22272B]" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-[#22272B] rounded" />
        <div className="h-4 w-3/4 bg-[#22272B] rounded" />
        <div className="h-4 w-1/2 bg-[#22272B] rounded" />
        <div className="h-3 w-24 bg-[#22272B] rounded" />
        <div className="flex gap-3">
          <div className="h-3 w-12 bg-[#22272B] rounded" />
          <div className="h-3 w-12 bg-[#22272B] rounded" />
        </div>
      </div>
    </div>
  );
}

function SkeletonListCard() {
  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden animate-pulse flex flex-col sm:flex-row">
      <div className="w-full sm:w-64 md:w-72 h-44 sm:h-auto bg-[#22272B] flex-shrink-0 min-h-[160px]" />
      <div className="p-5 flex-1 space-y-3">
        <div className="h-3 w-20 bg-[#22272B] rounded" />
        <div className="h-5 w-3/4 bg-[#22272B] rounded" />
        <div className="h-3 w-full bg-[#22272B] rounded" />
        <div className="h-3 w-2/3 bg-[#22272B] rounded" />
        <div className="flex gap-4 pt-2">
          <div className="h-3 w-16 bg-[#22272B] rounded" />
          <div className="h-3 w-16 bg-[#22272B] rounded" />
          <div className="h-6 w-20 bg-[#22272B] rounded ml-auto" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Filter Pill Component
// ============================================================================

interface FilterPillProps {
  label: string;
  onRemove: () => void;
}

function FilterPill({ label, onRemove }: FilterPillProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E40000]/15 text-red-400 text-xs font-medium rounded-full border border-[#E40000]/30">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-red-500/20 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={12} />
      </button>
    </span>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function CourseCatalogPage() {
  const navigate = useNavigate();

  // Data state
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<GradeLevel | ''>('');
  const [selectedLearningArea, setSelectedLearningArea] = useState<LearningArea | ''>('');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [sortBy, setSortBy] = useState('featured');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [gradeLevelOpen, setGradeLevelOpen] = useState(false);
  const [learningAreaOpen, setLearningAreaOpen] = useState(false);

  // ========================
  // Debounced Search
  // ========================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ========================
  // Load Categories
  // ========================
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.listCategories();
        setCategories(response.categories);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  // ========================
  // Load Courses
  // ========================
  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: CourseFilterParams = {
        skip: (currentPage - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedGradeLevel) params.grade_level = selectedGradeLevel;
      if (selectedLearningArea) params.learning_area = selectedLearningArea;
      if (showFeaturedOnly) params.is_featured = true;

      const response = await courseService.listCourses(params);

      // Client-side price filtering (not in API params)
      let filtered = response.courses;
      if (priceFilter === 'free') {
        filtered = filtered.filter((c) => c.price === 0);
      } else if (priceFilter === 'paid') {
        filtered = filtered.filter((c) => c.price > 0);
      }

      // Client-side sorting
      filtered = sortCourses(filtered, sortBy);

      setCourses(filtered);
      setTotal(response.total);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load courses';
      setError(message);
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedGradeLevel, selectedLearningArea, showFeaturedOnly, priceFilter, sortBy, currentPage]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // ========================
  // Client-side Sort
  // ========================
  function sortCourses(list: Course[], sort: string): Course[] {
    const sorted = [...list];
    switch (sort) {
      case 'featured':
        sorted.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'rating_desc':
        sorted.sort((a, b) => Number(b.average_rating) - Number(a.average_rating));
        break;
      case 'price_asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        sorted.sort((a, b) => b.enrollment_count - a.enrollment_count);
        break;
      default:
        break;
    }
    return sorted;
  }

  // ========================
  // Filter Helpers
  // ========================
  const hasActiveFilters = useMemo(
    () => !!(debouncedSearch || selectedCategory || selectedGradeLevel || selectedLearningArea || priceFilter !== 'all' || showFeaturedOnly),
    [debouncedSearch, selectedCategory, selectedGradeLevel, selectedLearningArea, priceFilter, showFeaturedOnly]
  );

  const activeFilterPills = useMemo(() => {
    const pills: { label: string; clear: () => void }[] = [];
    if (debouncedSearch) {
      pills.push({ label: `Search: "${debouncedSearch}"`, clear: () => { setSearchInput(''); setDebouncedSearch(''); } });
    }
    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory);
      pills.push({ label: `Category: ${cat?.name || selectedCategory}`, clear: () => setSelectedCategory('') });
    }
    if (selectedGradeLevel) {
      pills.push({ label: selectedGradeLevel, clear: () => setSelectedGradeLevel('') });
    }
    if (selectedLearningArea) {
      pills.push({ label: selectedLearningArea, clear: () => setSelectedLearningArea('') });
    }
    if (priceFilter !== 'all') {
      pills.push({ label: priceFilter === 'free' ? 'Free' : 'Paid', clear: () => setPriceFilter('all') });
    }
    if (showFeaturedOnly) {
      pills.push({ label: 'Featured Only', clear: () => setShowFeaturedOnly(false) });
    }
    return pills;
  }, [debouncedSearch, selectedCategory, categories, selectedGradeLevel, selectedLearningArea, priceFilter, showFeaturedOnly]);

  const handleClearAll = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setSelectedGradeLevel('');
    setSelectedLearningArea('');
    setPriceFilter('all');
    setSortBy('featured');
    setShowFeaturedOnly(false);
    setCurrentPage(1);
  };

  const handleCourseNavigate = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  // ========================
  // Pagination
  // ========================
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const paginationRange = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  // ========================
  // Filter Sidebar Content (shared between desktop sidebar and mobile sheet)
  // ========================
  const filterContent = (
    <div className="space-y-6">
      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
            Categories
          </h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !selectedCategory
                    ? 'bg-[#E40000]/15 text-red-400 font-medium'
                    : 'text-gray-400 hover:bg-[#22272B] hover:text-white'
                }`}
              >
                All Categories
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => { setSelectedCategory(cat.slug); setCurrentPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? 'bg-[#E40000]/15 text-red-400 font-medium'
                      : 'text-gray-400 hover:bg-[#22272B] hover:text-white'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="ml-2 text-xs text-gray-600 bg-[#22272B] px-1.5 py-0.5 rounded">
                    {cat.course_count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[#22272B]" />

      {/* Price Filter */}
      <div>
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
          Price
        </h3>
        <div className="space-y-2">
          {(['all', 'free', 'paid'] as PriceFilter[]).map((option) => (
            <label key={option} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="price-filter"
                checked={priceFilter === option}
                onChange={() => { setPriceFilter(option); setCurrentPage(1); }}
                className="w-4 h-4 text-[#E40000] border-[#22272B] bg-[#0F1112] focus:ring-[#E40000] focus:ring-offset-0"
              />
              <span className="text-sm text-gray-400 group-hover:text-white transition-colors capitalize">
                {option === 'all' ? 'All Prices' : option}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#22272B]" />

      {/* Grade Level */}
      <div>
        <button
          onClick={() => setGradeLevelOpen(!gradeLevelOpen)}
          className="w-full flex items-center justify-between text-sm font-semibold text-white uppercase tracking-wider mb-3"
        >
          Grade Level
          <ChevronDown
            size={16}
            className={`text-gray-500 transition-transform ${gradeLevelOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {gradeLevelOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-[#22272B]">
                <button
                  onClick={() => { setSelectedGradeLevel(''); setCurrentPage(1); }}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                    !selectedGradeLevel
                      ? 'text-red-400 font-medium'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All Grades
                </button>
                {GRADE_LEVELS.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => { setSelectedGradeLevel(grade); setCurrentPage(1); }}
                    className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                      selectedGradeLevel === grade
                        ? 'text-red-400 font-medium'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="border-t border-[#22272B]" />

      {/* Learning Area */}
      <div>
        <button
          onClick={() => setLearningAreaOpen(!learningAreaOpen)}
          className="w-full flex items-center justify-between text-sm font-semibold text-white uppercase tracking-wider mb-3"
        >
          Learning Area
          <ChevronDown
            size={16}
            className={`text-gray-500 transition-transform ${learningAreaOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {learningAreaOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-[#22272B]">
                <button
                  onClick={() => { setSelectedLearningArea(''); setCurrentPage(1); }}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                    !selectedLearningArea
                      ? 'text-red-400 font-medium'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All Areas
                </button>
                {LEARNING_AREAS.map((area) => (
                  <button
                    key={area}
                    onClick={() => { setSelectedLearningArea(area); setCurrentPage(1); }}
                    className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                      selectedLearningArea === area
                        ? 'text-red-400 font-medium'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="border-t border-[#22272B]" />

      {/* Sort By */}
      <div>
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
          Sort By
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 bg-[#0F1112] border border-[#22272B] rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E40000] focus:border-[#E40000]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div className="border-t border-[#22272B]" />

      {/* Featured Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white uppercase tracking-wider">
          Featured Only
        </span>
        <button
          role="switch"
          aria-checked={showFeaturedOnly}
          onClick={() => { setShowFeaturedOnly(!showFeaturedOnly); setCurrentPage(1); }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showFeaturedOnly ? 'bg-[#E40000]' : 'bg-[#22272B]'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showFeaturedOnly ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Clear All */}
      {hasActiveFilters && (
        <>
          <div className="border-t border-[#22272B]" />
          <button
            onClick={handleClearAll}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 border border-[#E40000]/30 hover:border-[#E40000]/50 rounded-lg transition-colors"
          >
            <RotateCcw size={14} />
            Clear All Filters
          </button>
        </>
      )}
    </div>
  );

  // ========================
  // Stagger animation variants
  // ========================
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  // ========================
  // Render
  // ========================
  return (
    <div className="min-h-screen bg-[#0F1112]">
      {/* ============================================================ */}
      {/* HEADER SECTION */}
      {/* ============================================================ */}
      <div className="border-b border-[#22272B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          {/* Title & description */}
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Explore Courses
            </h1>
            <p className="text-gray-400 text-base lg:text-lg">
              Discover CBC-aligned courses designed for Kenyan learners. Build skills, earn certificates, and learn at your own pace.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-2xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search courses by title, topic, or keyword..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#181C1F] border border-[#22272B] rounded-xl text-white placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-[#E40000]/50 focus:border-[#E40000]/50 transition-shadow"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Results count + active filter pills */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500">
              {loading ? 'Loading...' : `${total} course${total !== 1 ? 's' : ''} found`}
            </span>

            {activeFilterPills.map((pill, idx) => (
              <FilterPill key={idx} label={pill.label} onRemove={pill.clear} />
            ))}

            {activeFilterPills.length > 1 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex gap-8">
          {/* ======================== */}
          {/* SIDEBAR (Desktop) */}
          {/* ======================== */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6 bg-[#181C1F] border border-[#22272B] rounded-xl p-5 max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-[#22272B]">
              {filterContent}
            </div>
          </aside>

          {/* ======================== */}
          {/* MAIN COLUMN */}
          {/* ======================== */}
          <div className="flex-1 min-w-0">
            {/* Toolbar: Mobile filter button + View toggle */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#181C1F] border border-[#22272B] rounded-lg text-sm text-gray-300 hover:border-[#333a40] transition-colors"
              >
                <SlidersHorizontal size={16} />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-[#E40000]" />
                )}
              </button>

              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[#E40000]/15 text-red-400'
                      : 'text-gray-500 hover:text-white hover:bg-[#22272B]'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[#E40000]/15 text-red-400'
                      : 'text-gray-500 hover:text-white hover:bg-[#22272B]'
                  }`}
                  aria-label="List view"
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* ======================== */}
            {/* LOADING STATE */}
            {/* ======================== */}
            {loading && (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'flex flex-col gap-4'
              }>
                {Array.from({ length: 6 }).map((_, i) =>
                  viewMode === 'grid' ? <SkeletonCard key={i} /> : <SkeletonListCard key={i} />
                )}
              </div>
            )}

            {/* ======================== */}
            {/* ERROR STATE */}
            {/* ======================== */}
            {!loading && error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                <p className="text-red-400 mb-3">{error}</p>
                <button
                  onClick={loadCourses}
                  className="px-4 py-2 bg-[#E40000] text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* ======================== */}
            {/* EMPTY STATE */}
            {/* ======================== */}
            {!loading && !error && courses.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-24 h-24 mb-6 rounded-full bg-[#181C1F] border border-[#22272B] flex items-center justify-center">
                  <BookOpen size={40} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
                <p className="text-gray-500 mb-6 max-w-sm">
                  We could not find courses matching your current filters. Try adjusting your search or removing some filters.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#E40000] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <RotateCcw size={14} />
                    Clear All Filters
                  </button>
                )}
              </motion.div>
            )}

            {/* ======================== */}
            {/* COURSE GRID / LIST */}
            {/* ======================== */}
            {!loading && !error && courses.length > 0 && (
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                      : 'flex flex-col gap-4'
                  }
                >
                  {courses.map((course) => (
                    <motion.div key={course.id} variants={itemVariants}>
                      <CourseCard
                        course={course}
                        variant={viewMode}
                        onNavigate={handleCourseNavigate}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* ======================== */}
                {/* PAGINATION */}
                {/* ======================== */}
                {totalPages > 1 && (
                  <nav
                    aria-label="Pagination"
                    className="mt-10 flex items-center justify-center gap-1"
                  >
                    {/* Previous */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#22272B] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                      Prev
                    </button>

                    {/* Page numbers */}
                    {paginationRange.map((page, idx) =>
                      page === 'ellipsis' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-600">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-[#E40000] text-white'
                              : 'text-gray-400 hover:text-white hover:bg-[#22272B]'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    {/* Next */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#22272B] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE FILTER SHEET */}
      {/* ============================================================ */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-[#181C1F] border-r border-[#22272B] z-50 lg:hidden flex flex-col"
            >
              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#22272B]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-gray-400" />
                  <span className="text-white font-semibold">Filters</span>
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-[#22272B] rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Sheet content */}
              <div className="flex-1 overflow-y-auto p-5">
                {filterContent}
              </div>

              {/* Sheet footer */}
              <div className="px-5 py-4 border-t border-[#22272B]">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full px-4 py-2.5 bg-[#E40000] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  Show Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
