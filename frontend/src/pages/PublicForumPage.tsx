/**
 * Public Forum Page - Community Browse
 *
 * Reddit/Discourse-inspired public forum browse page. Read-only for
 * unauthenticated visitors; logged-in users see a CTA to post.
 * Falls back to mock data when the backend is unreachable.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Eye,
  ThumbsUp,
  Pin,
  CheckCircle,
  MessageCircle,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  Shield,
  Hash,
  Flame,
  Filter,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import AuthModal from '../components/auth/AuthModal';

// =============================================================================
// Types
// =============================================================================

interface ForumPostAuthor {
  id: string;
  name: string;
  role: 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff';
  avatar?: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: ForumPostAuthor;
  stats: {
    views: number;
    replies: number;
    likes: number;
  };
  timestamp: Date;
  lastActivity: Date;
  solved: boolean;
  pinned: boolean;
}

type CategoryType =
  | 'all'
  | 'general'
  | 'academic-help'
  | 'study-tips'
  | 'parents-corner'
  | 'announcements';

type SortType = 'latest' | 'popular' | 'most-replies';

// =============================================================================
// Mock data (fallback when backend is unreachable)
// =============================================================================

const now = Date.now();
const hour = 3_600_000;
const day = 86_400_000;

const MOCK_POSTS: ForumPost[] = [
  {
    id: '1',
    title: 'Welcome to Urban Home School Community!',
    content:
      'Welcome to the official Urban Home School community forum! This is the place to connect with fellow students, parents, and instructors. Share your experiences, ask questions, and help each other succeed.\n\nPlease review our community guidelines before posting. We want everyone to feel welcome and supported here.',
    excerpt:
      'Welcome to the official Urban Home School community forum! This is the place to connect with fellow students, parents, and instructors.',
    category: 'announcements',
    tags: ['Welcome', 'Community', 'Guidelines'],
    author: { id: 'admin1', name: 'Urban Home School Team', role: 'admin' },
    stats: { views: 2341, replies: 45, likes: 189 },
    timestamp: new Date(now - 30 * day),
    lastActivity: new Date(now - 2 * hour),
    solved: false,
    pinned: true,
  },
  {
    id: '2',
    title: 'How to prepare for Grade 8 CBC exams?',
    content:
      'Hi everyone, my daughter is approaching her Grade 8 CBC exams and I would love some tips from other parents and instructors. What study strategies have worked for your children? Any recommended resources or past papers?',
    excerpt:
      'Hi everyone, my daughter is approaching her Grade 8 CBC exams and I would love some tips from other parents and instructors.',
    category: 'academic-help',
    tags: ['Grade 8', 'CBC', 'Exams', 'Study Tips'],
    author: { id: 'u2', name: 'Mercy Wanjiku', role: 'student' },
    stats: { views: 534, replies: 23, likes: 47 },
    timestamp: new Date(now - 2 * hour),
    lastActivity: new Date(now - 30 * 60_000),
    solved: false,
    pinned: false,
  },
  {
    id: '3',
    title: 'Understanding the new competency grading system',
    content:
      'I have been getting many questions from parents about the new CBC competency-based grading. Let me break it down in simple terms. The system assesses students on four levels: Exceeding Expectations, Meeting Expectations, Approaching Expectations, and Below Expectations.',
    excerpt:
      'I have been getting many questions from parents about the new CBC competency-based grading. Let me break it down in simple terms.',
    category: 'announcements',
    tags: ['CBC', 'Grading', 'Competency'],
    author: { id: 'u3', name: 'Prof. Wekesa', role: 'instructor' },
    stats: { views: 1205, replies: 34, likes: 92 },
    timestamp: new Date(now - 1 * day),
    lastActivity: new Date(now - 4 * hour),
    solved: false,
    pinned: true,
  },
  {
    id: '4',
    title: 'Best resources for Kiswahili learning',
    content:
      'As a parent helping my son with Kiswahili, I have found some great resources I want to share. These include online dictionaries, audio pronunciation guides, and practice exercises aligned with the CBC curriculum.',
    excerpt:
      'As a parent helping my son with Kiswahili, I have found some great resources I want to share.',
    category: 'study-tips',
    tags: ['Kiswahili', 'Resources', 'Language'],
    author: { id: 'u4', name: 'Mary Akinyi', role: 'parent' },
    stats: { views: 387, replies: 18, likes: 56 },
    timestamp: new Date(now - 3 * day),
    lastActivity: new Date(now - 12 * hour),
    solved: true,
    pinned: false,
  },
  {
    id: '5',
    title: 'Tips for effective home schooling schedules',
    content:
      'Creating a consistent home schooling schedule has been a game-changer for our family. I want to share what has worked for us: structured morning blocks for core subjects, breaks every 45 minutes, and creative afternoon sessions.',
    excerpt:
      'Creating a consistent home schooling schedule has been a game-changer for our family. I want to share what has worked for us.',
    category: 'parents-corner',
    tags: ['Scheduling', 'Home School', 'Tips'],
    author: { id: 'u5', name: 'Grace Njeri', role: 'parent' },
    stats: { views: 612, replies: 27, likes: 73 },
    timestamp: new Date(now - 2 * day),
    lastActivity: new Date(now - 6 * hour),
    solved: false,
    pinned: false,
  },
  {
    id: '6',
    title: 'Math problem-solving strategies for Grade 5',
    content:
      'In my experience teaching Grade 5 math, I have found these strategies to be highly effective: drawing diagrams, working backwards, finding patterns, and using estimation to check answers. Let me elaborate on each approach.',
    excerpt:
      'In my experience teaching Grade 5 math, I have found these strategies to be highly effective: drawing diagrams, working backwards, finding patterns.',
    category: 'academic-help',
    tags: ['Mathematics', 'Grade 5', 'Problem Solving'],
    author: { id: 'u6', name: 'Mr. Ochieng', role: 'instructor' },
    stats: { views: 445, replies: 15, likes: 61 },
    timestamp: new Date(now - 5 * day),
    lastActivity: new Date(now - 1 * day),
    solved: false,
    pinned: false,
  },
  {
    id: '7',
    title: 'How do I help my child stay motivated?',
    content:
      'My son has been losing interest in his studies lately and I am not sure how to re-engage him. Has anyone dealt with this? What techniques or incentives have worked for keeping your children motivated with their home schooling?',
    excerpt:
      'My son has been losing interest in his studies lately and I am not sure how to re-engage him.',
    category: 'parents-corner',
    tags: ['Motivation', 'Parenting', 'Home School'],
    author: { id: 'u7', name: 'Janet Kamau', role: 'parent' },
    stats: { views: 298, replies: 21, likes: 38 },
    timestamp: new Date(now - 4 * day),
    lastActivity: new Date(now - 8 * hour),
    solved: true,
    pinned: false,
  },
  {
    id: '8',
    title: 'Science experiment ideas you can do at home',
    content:
      'Looking for simple science experiments to do at home with everyday materials? Here are 10 of my favourites that align with the CBC science curriculum for Grade 6 and 7. They cover topics from density to chemical reactions.',
    excerpt:
      'Looking for simple science experiments to do at home with everyday materials? Here are 10 of my favourites.',
    category: 'study-tips',
    tags: ['Science', 'Experiments', 'Grade 6', 'Grade 7'],
    author: { id: 'u8', name: 'Dr. Muthoni', role: 'instructor' },
    stats: { views: 723, replies: 31, likes: 104 },
    timestamp: new Date(now - 6 * day),
    lastActivity: new Date(now - 2 * day),
    solved: false,
    pinned: false,
  },
  {
    id: '9',
    title: 'Introducing our new AI tutoring feature',
    content:
      'We are excited to announce that The Bird AI, our intelligent tutoring system, is now available to all students. This AI-powered tutor adapts to your learning pace and provides personalised help across all CBC subjects.',
    excerpt:
      'We are excited to announce that The Bird AI, our intelligent tutoring system, is now available to all students.',
    category: 'announcements',
    tags: ['AI Tutor', 'New Feature', 'The Bird'],
    author: { id: 'admin2', name: 'Urban Home School Team', role: 'admin' },
    stats: { views: 1567, replies: 52, likes: 203 },
    timestamp: new Date(now - 7 * day),
    lastActivity: new Date(now - 3 * hour),
    solved: false,
    pinned: false,
  },
  {
    id: '10',
    title: 'Study group for Grade 7 English composition',
    content:
      'Is anyone interested in forming a study group for English composition? We could review each other\'s essays and practice creative writing together. I was thinking we could meet online twice a week.',
    excerpt:
      'Is anyone interested in forming a study group for English composition? We could review each other\'s essays.',
    category: 'general',
    tags: ['English', 'Study Group', 'Grade 7'],
    author: { id: 'u10', name: 'Brian Otieno', role: 'student' },
    stats: { views: 189, replies: 12, likes: 29 },
    timestamp: new Date(now - 8 * day),
    lastActivity: new Date(now - 5 * hour),
    solved: false,
    pinned: false,
  },
];

// =============================================================================
// Constants
// =============================================================================

const CATEGORIES: { id: CategoryType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'academic-help', label: 'Academic Help' },
  { id: 'study-tips', label: 'Study Tips' },
  { id: 'parents-corner', label: 'Parents Corner' },
  { id: 'announcements', label: 'Announcements' },
];

const SORT_OPTIONS: { id: SortType; label: string; icon: React.ElementType }[] = [
  { id: 'latest', label: 'Latest', icon: Clock },
  { id: 'popular', label: 'Popular', icon: Flame },
  { id: 'most-replies', label: 'Most Replies', icon: MessageCircle },
];

const ROLE_COLORS: Record<string, string> = {
  student: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  parent: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  instructor: 'bg-green-500/20 text-green-400 border-green-500/30',
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  partner: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  staff: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const AVATAR_GRADIENTS: Record<string, string> = {
  student: 'from-blue-500 to-cyan-500',
  parent: 'from-purple-500 to-pink-500',
  instructor: 'from-green-500 to-emerald-500',
  admin: 'from-red-500 to-orange-500',
  partner: 'from-yellow-500 to-amber-500',
  staff: 'from-gray-500 to-slate-500',
};

const POPULAR_TAGS = [
  'CBC', 'Grade 8', 'Mathematics', 'Science', 'Kiswahili',
  'English', 'Study Tips', 'Exams', 'Home School', 'AI Tutor',
  'Grade 7', 'Parenting', 'Resources', 'Grade 5',
];

const POSTS_PER_PAGE = 6;

// =============================================================================
// Animation variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

// =============================================================================
// Helpers
// =============================================================================

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// =============================================================================
// Skeleton Loader
// =============================================================================

const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-full bg-gray-50 dark:bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-gray-50 dark:bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-gray-50 dark:bg-white/5 rounded w-1/3" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-50 dark:bg-white/5 rounded w-full" />
          <div className="h-3 bg-gray-50 dark:bg-white/5 rounded w-5/6" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 bg-gray-50 dark:bg-white/5 rounded-full w-14" />
          <div className="h-5 bg-gray-50 dark:bg-white/5 rounded-full w-16" />
        </div>
        <div className="flex gap-6">
          <div className="h-4 bg-gray-50 dark:bg-white/5 rounded w-10" />
          <div className="h-4 bg-gray-50 dark:bg-white/5 rounded w-10" />
          <div className="h-4 bg-gray-50 dark:bg-white/5 rounded w-10" />
        </div>
      </div>
    </div>
  </div>
);

// =============================================================================
// Post Card
// =============================================================================

interface PostCardProps {
  post: ForumPost;
  onTagClick: (tag: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onTagClick }) => {
  const navigate = useNavigate();

  const categoryLabel =
    CATEGORIES.find((c) => c.id === post.category)?.label ?? post.category;

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 hover:border-[#2E3338] hover:shadow-lg hover:shadow-black/20 transition-all duration-200 cursor-pointer group"
      onClick={() => navigate(`/dashboard/forum?post=${post.id}`)}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`w-11 h-11 rounded-full bg-gradient-to-br ${
            AVATAR_GRADIENTS[post.author.role] ?? 'from-gray-500 to-slate-500'
          } flex items-center justify-center text-gray-900 dark:text-white font-semibold text-sm flex-shrink-0`}
        >
          {post.author.name.charAt(0).toUpperCase()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start gap-2 flex-wrap mb-1.5">
            <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white group-hover:text-[#FF0000] transition-colors leading-snug">
              {post.title}
            </h3>
            {post.pinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/15 text-yellow-400 text-[11px] rounded-md border border-yellow-500/25 flex-shrink-0">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            )}
            {post.solved && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/15 text-green-400 text-[11px] rounded-md border border-green-500/25 flex-shrink-0">
                <CheckCircle className="w-3 h-3" />
                Solved
              </span>
            )}
          </div>

          {/* Author info */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 dark:text-white/50 mb-2.5">
            <span className="text-gray-600 dark:text-white/70 font-medium">{post.author.name}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                ROLE_COLORS[post.author.role] ?? ''
              }`}
            >
              {post.author.role}
            </span>
            <span className="text-gray-400 dark:text-white/30">in</span>
            <span className="text-gray-500 dark:text-white/60">{categoryLabel}</span>
            <span className="text-gray-400 dark:text-gray-300 dark:text-white/20">&middot;</span>
            <span className="flex items-center gap-1 text-gray-400 dark:text-white/40">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(post.lastActivity)}
            </span>
          </div>

          {/* Excerpt */}
          <p className="text-white/55 text-sm leading-relaxed mb-3 line-clamp-3">
            {post.excerpt}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {post.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick(tag);
                }}
                className="px-2 py-0.5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/50 text-[11px] rounded-md border border-white/8 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-white/70 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 text-xs text-gray-400 dark:text-white/40">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {formatNumber(post.stats.views)}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              {formatNumber(post.stats.replies)}
            </span>
            <span className="flex items-center gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5" />
              {formatNumber(post.stats.likes)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// =============================================================================
// Main Component
// =============================================================================

const PublicForumPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Data state
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter / search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [sortBy, setSortBy] = useState<SortType>('latest');
  const [currentPage, setCurrentPage] = useState(1);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Debounced search
  // ---------------------------------------------------------------------------
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch posts (API first, fallback to mock)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/v1/forum/public/posts?limit=50`, {
          signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();

        if (!cancelled && Array.isArray(data) && data.length > 0) {
          const mapped: ForumPost[] = data.map((p: any) => ({
            id: String(p.id),
            title: p.title ?? '',
            content: p.content ?? '',
            excerpt: (p.content ?? '').slice(0, 160),
            category: p.category ?? 'general',
            tags: Array.isArray(p.tags) ? p.tags : [],
            author: {
              id: String(p.author?.id ?? p.user_id ?? ''),
              name: p.author?.name ?? 'Anonymous',
              role: p.author?.role ?? 'student',
              avatar: p.author?.avatar,
            },
            stats: {
              views: p.views ?? p.stats?.views ?? 0,
              replies: p.replies_count ?? p.stats?.replies ?? 0,
              likes: p.likes_count ?? p.stats?.likes ?? 0,
            },
            timestamp: new Date(p.created_at ?? p.timestamp ?? Date.now()),
            lastActivity: new Date(p.updated_at ?? p.last_activity ?? p.created_at ?? Date.now()),
            solved: Boolean(p.solved ?? p.is_solved),
            pinned: Boolean(p.pinned ?? p.is_pinned),
          }));
          setPosts(mapped);
        } else {
          throw new Error('Empty response');
        }
      } catch {
        if (!cancelled) {
          setPosts(MOCK_POSTS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPosts();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Filter, sort, paginate
  // ---------------------------------------------------------------------------
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Search filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort (pinned always first)
    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      switch (sortBy) {
        case 'latest':
          return b.lastActivity.getTime() - a.lastActivity.getTime();
        case 'popular':
          return b.stats.likes - a.stats.likes;
        case 'most-replies':
          return b.stats.replies - a.stats.replies;
        default:
          return 0;
      }
    });

    return result;
  }, [posts, activeCategory, debouncedSearch, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, sortBy]);

  // Tag click handler
  const handleTagClick = useCallback((tag: string) => {
    setSearchQuery(tag);
    setDebouncedSearch(tag);
    setCurrentPage(1);
  }, []);

  // ---------------------------------------------------------------------------
  // Aggregate stats for sidebar
  // ---------------------------------------------------------------------------
  const communityStats = useMemo(() => {
    const totalPosts = posts.length;
    const totalReplies = posts.reduce((sum, p) => sum + p.stats.replies, 0);
    const uniqueAuthors = new Set(posts.map((p) => p.author.id)).size;
    return { members: uniqueAuthors + 142, posts: totalPosts, discussions: totalReplies };
  }, [posts]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112]">
      {/* ------------------------------------------------------------------ */}
      {/* Hero / Header */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-b border-gray-200 dark:border-[#22272B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#FF0000]/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#FF0000]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Community Forum</h1>
            </div>
            <p className="text-gray-500 dark:text-white/50 text-base sm:text-lg max-w-2xl mt-2 mb-6">
              Connect with students, parents, and instructors. Ask questions, share knowledge, and grow together.
            </p>

            {/* Search bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search discussions, topics, or tags..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/20 transition-colors"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Filters Row */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-b border-gray-200 dark:border-[#22272B] sticky top-0 z-20 bg-gray-50 dark:bg-[#0F1112]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeCategory === cat.id
                      ? 'bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/30'
                      : 'bg-transparent text-gray-500 dark:text-white/50 border border-transparent hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-white/70'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort buttons */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-gray-400 dark:text-white/30 mr-1 hidden sm:block" />
              {SORT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortBy(opt.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      sortBy === opt.id
                        ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white border border-white/15'
                        : 'text-gray-400 dark:text-white/40 hover:text-gray-500 dark:hover:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Main Content */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ---- Posts Column ---- */}
          <div className="flex-1 min-w-0">
            {loading ? (
              /* Skeleton loaders */
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : paginatedPosts.length === 0 ? (
              /* Empty state */
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B]"
              >
                <MessageSquare className="w-14 h-14 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-white/70 mb-2">
                  No discussions found
                </h3>
                <p className="text-gray-400 dark:text-white/40 text-sm max-w-sm mx-auto mb-6">
                  Try adjusting your search or filters. You can also start a new discussion to get the conversation going.
                </p>
                {debouncedSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setDebouncedSearch('');
                    }}
                    className="text-[#FF0000] text-sm font-medium hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </motion.div>
            ) : (
              <>
                {/* Post list with stagger animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeCategory}-${sortBy}-${debouncedSearch}-${currentPage}`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3"
                  >
                    {paginatedPosts.map((post) => (
                      <PostCard key={post.id} post={post} onTagClick={handleTagClick} />
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:border-[#2E3338] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                            currentPage === page
                              ? 'bg-[#FF0000] text-gray-900 dark:text-white'
                              : 'bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:border-[#2E3338]'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:border-[#2E3338] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ---- Sidebar (desktop) ---- */}
          <aside className="hidden lg:block w-80 flex-shrink-0 space-y-6">
            {/* CTA */}
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
              <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-2">Join the Conversation</h3>
              <p className="text-gray-400 dark:text-white/40 text-xs mb-4 leading-relaxed">
                {isAuthenticated
                  ? 'Share your knowledge and help others in the community.'
                  : 'Sign in to ask questions, share tips, and connect with the community.'}
              </p>
              {isAuthenticated ? (
                <Link
                  to="/dashboard/forum"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#FF0000] hover:bg-[#E40000] text-gray-900 dark:text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Start a Discussion
                </Link>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#FF0000] hover:bg-[#E40000] text-gray-900 dark:text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Sign In to Post
                </button>
              )}
            </div>

            {/* Popular tags */}
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
              <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-400 dark:text-white/40" />
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors ${
                      debouncedSearch === tag
                        ? 'bg-[#FF0000]/15 text-[#FF0000] border-[#FF0000]/30'
                        : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/50 border-white/8 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-white/70'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Community stats */}
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
              <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-400 dark:text-white/40" />
                Community Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500 dark:text-white/50 text-xs">
                    <Users className="w-3.5 h-3.5" />
                    Members
                  </span>
                  <span className="text-gray-900 dark:text-white font-semibold text-sm">
                    {formatNumber(communityStats.members)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500 dark:text-white/50 text-xs">
                    <FileText className="w-3.5 h-3.5" />
                    Posts
                  </span>
                  <span className="text-gray-900 dark:text-white font-semibold text-sm">
                    {formatNumber(communityStats.posts)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500 dark:text-white/50 text-xs">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Discussions
                  </span>
                  <span className="text-gray-900 dark:text-white font-semibold text-sm">
                    {formatNumber(communityStats.discussions)}
                  </span>
                </div>
              </div>
            </div>

            {/* Community guidelines */}
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
              <h3 className="text-gray-900 dark:text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400 dark:text-white/40" />
                Community Guidelines
              </h3>
              <ul className="space-y-2 text-gray-400 dark:text-white/40 text-xs leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#FF0000] mt-1.5 flex-shrink-0" />
                  Be respectful and kind to all members
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#FF0000] mt-1.5 flex-shrink-0" />
                  Stay on topic and use appropriate categories
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#FF0000] mt-1.5 flex-shrink-0" />
                  Search before posting to avoid duplicates
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#FF0000] mt-1.5 flex-shrink-0" />
                  Mark helpful replies as solutions
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#FF0000] mt-1.5 flex-shrink-0" />
                  Report inappropriate content
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>

    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      onAuthSuccess={() => {
        setIsAuthModalOpen(false);
        navigate('/dashboard/forum');
      }}
    />
  );
};

export default PublicForumPage;
