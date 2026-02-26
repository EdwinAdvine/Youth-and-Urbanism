// ForumPage - Authenticated page at /forum. Community discussion board where users can
// create posts, reply to threads, search topics, and pin/resolve discussions.
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Eye,
  ThumbsUp,
  Pin,
  CheckCircle,
  X,
  Send,
  Clock,
  MessageCircle,
  User
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

// Types
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
  likedBy: string[];
}

interface ForumReply {
  id: string;
  postId: string;
  content: string;
  author: ForumPostAuthor;
  timestamp: Date;
  likes: number;
  isSolution: boolean;
  likedBy: string[];
}

type CategoryType = 'all' | 'general' | 'mathematics' | 'science' | 'languages' | 'social-studies' | 'technology' | 'help-support';
type SortType = 'latest' | 'popular' | 'most-replies' | 'unanswered';

// Mock Data
const mockPosts: ForumPost[] = [
  {
    id: '1',
    title: 'How do I solve quadratic equations?',
    content: 'I\'m struggling with understanding the quadratic formula and when to use completing the square versus factoring. Can someone explain the difference and when to use each method?\n\nI have an exam coming up and really need help with this topic.',
    excerpt: 'I\'m struggling with understanding the quadratic formula and when to use completing the square versus factoring.',
    category: 'mathematics',
    tags: ['Grade 8', 'Algebra', 'Equations'],
    author: {
      id: 'u1',
      name: 'Sarah Kimani',
      role: 'student',
      avatar: undefined
    },
    stats: {
      views: 245,
      replies: 8,
      likes: 12
    },
    timestamp: new Date('2024-02-10T10:30:00'),
    lastActivity: new Date('2024-02-11T14:22:00'),
    solved: true,
    pinned: false,
    likedBy: ['u2', 'u3', 'u4']
  },
  {
    id: '2',
    title: 'Best study tips for Grade 8 Science?',
    content: 'Hi everyone! I\'m looking for effective study strategies for Science. What has worked for you? Any recommendations for online resources or practice materials?',
    excerpt: 'Hi everyone! I\'m looking for effective study strategies for Science.',
    category: 'science',
    tags: ['Grade 8', 'Study Tips'],
    author: {
      id: 'u2',
      name: 'John Ochieng',
      role: 'student'
    },
    stats: {
      views: 187,
      replies: 15,
      likes: 23
    },
    timestamp: new Date('2024-02-09T15:45:00'),
    lastActivity: new Date('2024-02-11T16:00:00'),
    solved: false,
    pinned: false,
    likedBy: ['u1', 'u3']
  },
  {
    id: '3',
    title: 'Parent-teacher meeting schedule?',
    content: 'Does anyone know when the next parent-teacher meetings are scheduled? I can\'t seem to find the information on the portal.',
    excerpt: 'Does anyone know when the next parent-teacher meetings are scheduled?',
    category: 'general',
    tags: ['Parents', 'Events'],
    author: {
      id: 'u3',
      name: 'Mary Wanjiku',
      role: 'parent'
    },
    stats: {
      views: 432,
      replies: 3,
      likes: 5
    },
    timestamp: new Date('2024-02-11T09:00:00'),
    lastActivity: new Date('2024-02-11T12:30:00'),
    solved: true,
    pinned: true,
    likedBy: ['u1', 'u2', 'u4', 'u5']
  },
  {
    id: '4',
    title: 'Need help with Kiswahili grammar',
    content: 'I\'m having trouble with verb conjugation in Kiswahili. Specifically, I don\'t understand the difference between -na-, -me-, and -ta- tenses. Can someone explain this clearly?',
    excerpt: 'I\'m having trouble with verb conjugation in Kiswahili.',
    category: 'languages',
    tags: ['Kiswahili', 'Grammar', 'Grade 7'],
    author: {
      id: 'u4',
      name: 'David Mwangi',
      role: 'student'
    },
    stats: {
      views: 156,
      replies: 6,
      likes: 9
    },
    timestamp: new Date('2024-02-08T11:20:00'),
    lastActivity: new Date('2024-02-10T18:45:00'),
    solved: true,
    pinned: false,
    likedBy: ['u1', 'u2']
  },
  {
    id: '5',
    title: 'Understanding photosynthesis process',
    content: 'Can someone break down the photosynthesis process in simple terms? I understand it involves sunlight, water, and carbon dioxide, but I\'m confused about the detailed steps.',
    excerpt: 'Can someone break down the photosynthesis process in simple terms?',
    category: 'science',
    tags: ['Biology', 'Grade 7', 'Photosynthesis'],
    author: {
      id: 'u5',
      name: 'Grace Akinyi',
      role: 'student'
    },
    stats: {
      views: 298,
      replies: 11,
      likes: 18
    },
    timestamp: new Date('2024-02-07T14:15:00'),
    lastActivity: new Date('2024-02-11T10:00:00'),
    solved: true,
    pinned: false,
    likedBy: ['u1', 'u3', 'u4']
  },
  {
    id: '6',
    title: 'Introduction to coding - where to start?',
    content: 'I\'m interested in learning programming but don\'t know where to begin. What language should I start with? Are there any good resources for beginners?',
    excerpt: 'I\'m interested in learning programming but don\'t know where to begin.',
    category: 'technology',
    tags: ['Programming', 'Beginners', 'Resources'],
    author: {
      id: 'u6',
      name: 'Brian Otieno',
      role: 'student'
    },
    stats: {
      views: 412,
      replies: 22,
      likes: 35
    },
    timestamp: new Date('2024-02-06T16:30:00'),
    lastActivity: new Date('2024-02-11T15:20:00'),
    solved: false,
    pinned: false,
    likedBy: ['u1', 'u2', 'u3', 'u4', 'u5']
  },
  {
    id: '7',
    title: 'Tips for memorizing historical dates',
    content: 'History has so many dates to remember! Does anyone have effective techniques for memorizing important historical events and their dates?',
    excerpt: 'History has so many dates to remember! Does anyone have effective techniques?',
    category: 'social-studies',
    tags: ['History', 'Study Tips', 'Memory'],
    author: {
      id: 'u7',
      name: 'Faith Njeri',
      role: 'student'
    },
    stats: {
      views: 203,
      replies: 9,
      likes: 14
    },
    timestamp: new Date('2024-02-05T13:00:00'),
    lastActivity: new Date('2024-02-09T11:30:00'),
    solved: false,
    pinned: false,
    likedBy: ['u2', 'u3', 'u5']
  },
  {
    id: '8',
    title: 'Login issues - account not accessible',
    content: 'I\'ve been trying to log into my account for the past 2 days but keep getting an error message. I\'ve tried resetting my password but still can\'t access my account. Please help!',
    excerpt: 'I\'ve been trying to log into my account for the past 2 days but keep getting an error.',
    category: 'help-support',
    tags: ['Technical Support', 'Login', 'Urgent'],
    author: {
      id: 'u8',
      name: 'Peter Kamau',
      role: 'student'
    },
    stats: {
      views: 89,
      replies: 2,
      likes: 1
    },
    timestamp: new Date('2024-02-11T08:15:00'),
    lastActivity: new Date('2024-02-11T09:00:00'),
    solved: false,
    pinned: false,
    likedBy: ['u3']
  },
  {
    id: '9',
    title: 'Understanding fractions and decimals',
    content: 'I need help converting between fractions and decimals. What\'s the easiest way to do this? Are there any tricks or shortcuts?',
    excerpt: 'I need help converting between fractions and decimals.',
    category: 'mathematics',
    tags: ['Grade 6', 'Fractions', 'Decimals'],
    author: {
      id: 'u9',
      name: 'Anne Wambui',
      role: 'student'
    },
    stats: {
      views: 176,
      replies: 7,
      likes: 10
    },
    timestamp: new Date('2024-02-04T10:45:00'),
    lastActivity: new Date('2024-02-08T14:00:00'),
    solved: true,
    pinned: false,
    likedBy: ['u1', 'u4', 'u6']
  },
  {
    id: '10',
    title: 'English grammar: Active vs Passive voice',
    content: 'Can someone explain when to use active voice and when to use passive voice in English writing? I always get confused about this in my essays.',
    excerpt: 'Can someone explain when to use active voice and when to use passive voice?',
    category: 'languages',
    tags: ['English', 'Grammar', 'Writing'],
    author: {
      id: 'u10',
      name: 'Michael Karanja',
      role: 'student'
    },
    stats: {
      views: 234,
      replies: 12,
      likes: 16
    },
    timestamp: new Date('2024-02-03T15:30:00'),
    lastActivity: new Date('2024-02-10T17:00:00'),
    solved: true,
    pinned: false,
    likedBy: ['u2', 'u5', 'u7']
  },
  {
    id: '11',
    title: 'How do electric circuits work?',
    content: 'I\'m learning about electric circuits in Physics and I\'m confused about series and parallel circuits. What\'s the main difference and how do they affect current and voltage?',
    excerpt: 'I\'m learning about electric circuits in Physics and I\'m confused about series and parallel circuits.',
    category: 'science',
    tags: ['Physics', 'Circuits', 'Grade 8'],
    author: {
      id: 'u11',
      name: 'James Mutua',
      role: 'student'
    },
    stats: {
      views: 267,
      replies: 10,
      likes: 19
    },
    timestamp: new Date('2024-02-02T12:00:00'),
    lastActivity: new Date('2024-02-09T16:45:00'),
    solved: true,
    pinned: false,
    likedBy: ['u1', 'u3', 'u6', 'u8']
  },
  {
    id: '12',
    title: 'Study group for Mathematics?',
    content: 'Is anyone interested in forming a study group for Mathematics? I think it would be helpful to work through problems together. We could meet once a week online.',
    excerpt: 'Is anyone interested in forming a study group for Mathematics?',
    category: 'general',
    tags: ['Study Group', 'Mathematics', 'Collaboration'],
    author: {
      id: 'u12',
      name: 'Lucy Chepkoech',
      role: 'student'
    },
    stats: {
      views: 345,
      replies: 18,
      likes: 28
    },
    timestamp: new Date('2024-02-01T09:30:00'),
    lastActivity: new Date('2024-02-11T13:15:00'),
    solved: false,
    pinned: false,
    likedBy: ['u1', 'u2', 'u4', 'u5', 'u7']
  },
  {
    id: '13',
    title: 'Kenya\'s independence history',
    content: 'Can someone recommend good resources for learning about Kenya\'s path to independence? I need this for a project I\'m working on.',
    excerpt: 'Can someone recommend good resources for learning about Kenya\'s path to independence?',
    category: 'social-studies',
    tags: ['History', 'Kenya', 'Independence', 'Projects'],
    author: {
      id: 'u13',
      name: 'Daniel Kipchoge',
      role: 'student'
    },
    stats: {
      views: 198,
      replies: 5,
      likes: 8
    },
    timestamp: new Date('2024-01-31T14:20:00'),
    lastActivity: new Date('2024-02-07T10:30:00'),
    solved: true,
    pinned: false,
    likedBy: ['u3', 'u6', 'u9']
  },
  {
    id: '14',
    title: 'Assignment submission deadline extension?',
    content: 'I noticed the Mathematics assignment is due tomorrow but I haven\'t finished it yet due to illness. Is there a process for requesting deadline extensions?',
    excerpt: 'I noticed the Mathematics assignment is due tomorrow but I haven\'t finished it.',
    category: 'help-support',
    tags: ['Assignments', 'Deadlines', 'Help'],
    author: {
      id: 'u14',
      name: 'Christine Auma',
      role: 'student'
    },
    stats: {
      views: 127,
      replies: 4,
      likes: 6
    },
    timestamp: new Date('2024-02-11T07:45:00'),
    lastActivity: new Date('2024-02-11T11:00:00'),
    solved: true,
    pinned: false,
    likedBy: ['u2', 'u5']
  },
  {
    id: '15',
    title: 'Python vs JavaScript for beginners',
    content: 'I want to start learning to code. Should I begin with Python or JavaScript? What are the pros and cons of each for a complete beginner?',
    excerpt: 'I want to start learning to code. Should I begin with Python or JavaScript?',
    category: 'technology',
    tags: ['Programming', 'Python', 'JavaScript', 'Beginners'],
    author: {
      id: 'u15',
      name: 'Kevin Omondi',
      role: 'student'
    },
    stats: {
      views: 389,
      replies: 25,
      likes: 31
    },
    timestamp: new Date('2024-01-30T16:00:00'),
    lastActivity: new Date('2024-02-11T14:45:00'),
    solved: false,
    pinned: false,
    likedBy: ['u1', 'u4', 'u6', 'u8', 'u10']
  },
  {
    id: '16',
    title: 'Welcome to Urban Home School Forum!',
    content: 'Welcome to the Urban Home School Community Forum! This is a place for students, parents, and instructors to connect, share knowledge, and support each other.\n\nForum Guidelines:\n1. Be respectful and kind to all members\n2. Stay on topic and use appropriate categories\n3. Search before posting to avoid duplicates\n4. Mark helpful replies as solutions\n5. Report inappropriate content\n\nLet\'s build a supportive learning community together!',
    excerpt: 'Welcome to the Urban Home School Community Forum! This is a place for students, parents, and instructors to connect.',
    category: 'general',
    tags: ['Welcome', 'Guidelines', 'Community'],
    author: {
      id: 'admin1',
      name: 'Urban Home School Team',
      role: 'admin'
    },
    stats: {
      views: 1205,
      replies: 45,
      likes: 89
    },
    timestamp: new Date('2024-01-15T10:00:00'),
    lastActivity: new Date('2024-02-11T09:30:00'),
    solved: false,
    pinned: true,
    likedBy: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8']
  },
  {
    id: '17',
    title: 'Balancing chemical equations help',
    content: 'I\'m really struggling with balancing chemical equations in Chemistry. Can someone walk me through the steps? I understand the concept but I keep making mistakes.',
    excerpt: 'I\'m really struggling with balancing chemical equations in Chemistry.',
    category: 'science',
    tags: ['Chemistry', 'Grade 9', 'Equations'],
    author: {
      id: 'u16',
      name: 'Rebecca Nyambura',
      role: 'student'
    },
    stats: {
      views: 213,
      replies: 8,
      likes: 11
    },
    timestamp: new Date('2024-01-29T11:15:00'),
    lastActivity: new Date('2024-02-06T15:30:00'),
    solved: true,
    pinned: false,
    likedBy: ['u1', 'u5', 'u11']
  },
  {
    id: '18',
    title: 'Geometry theorems cheat sheet?',
    content: 'Does anyone have a good cheat sheet or summary of important geometry theorems? I have a test coming up and need to review all the key theorems.',
    excerpt: 'Does anyone have a good cheat sheet or summary of important geometry theorems?',
    category: 'mathematics',
    tags: ['Geometry', 'Theorems', 'Study Materials'],
    author: {
      id: 'u17',
      name: 'Samuel Kimutai',
      role: 'student'
    },
    stats: {
      views: 278,
      replies: 13,
      likes: 22
    },
    timestamp: new Date('2024-01-28T13:45:00'),
    lastActivity: new Date('2024-02-08T12:00:00'),
    solved: false,
    pinned: false,
    likedBy: ['u2', 'u4', 'u7', 'u9']
  },
  {
    id: '19',
    title: 'Recommended YouTube channels for learning?',
    content: 'What are some good educational YouTube channels you all follow? I\'m looking for channels that cover Science, Mathematics, and general study tips.',
    excerpt: 'What are some good educational YouTube channels you all follow?',
    category: 'general',
    tags: ['Resources', 'YouTube', 'Learning'],
    author: {
      id: 'u18',
      name: 'Esther Moraa',
      role: 'student'
    },
    stats: {
      views: 456,
      replies: 31,
      likes: 42
    },
    timestamp: new Date('2024-01-27T10:30:00'),
    lastActivity: new Date('2024-02-11T16:30:00'),
    solved: false,
    pinned: false,
    likedBy: ['u1', 'u3', 'u5', 'u6', 'u8', 'u10']
  },
  {
    id: '20',
    title: 'Video tutorials not loading',
    content: 'The video tutorials in my courses are not loading properly. They buffer continuously and sometimes show an error. Is anyone else experiencing this issue?',
    excerpt: 'The video tutorials in my courses are not loading properly.',
    category: 'help-support',
    tags: ['Technical Support', 'Videos', 'Troubleshooting'],
    author: {
      id: 'u19',
      name: 'Joseph Kiprotich',
      role: 'student'
    },
    stats: {
      views: 93,
      replies: 3,
      likes: 2
    },
    timestamp: new Date('2024-02-10T16:00:00'),
    lastActivity: new Date('2024-02-11T08:30:00'),
    solved: false,
    pinned: false,
    likedBy: ['u7', 'u12']
  }
];


const ForumPage: React.FC = () => {
  const { user } = useAuthStore();

  // State
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [sortBy, setSortBy] = useState<SortType>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showPostDetail, setShowPostDetail] = useState(false);

  // New post form state
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<string>('general');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [newPostIsPublic, setNewPostIsPublic] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // Reply state
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState<ForumReply[]>([]);

  // Posts state (starts with mock, replaced by API data)
  const [posts, setPosts] = useState<ForumPost[]>(mockPosts);
  const [_loading, setLoading] = useState(false);

  // Fetch posts from API on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchPosts() {
      setLoading(true);
      try {
        const res = await api.get('/api/v1/forum/posts', { params: { limit: 50, sort: 'latest' } });
        if (cancelled) return;
        const mapped: ForumPost[] = (res.data.posts ?? []).map((p: any) => ({
          id: String(p.id),
          title: p.title ?? '',
          content: p.content ?? '',
          excerpt: p.excerpt ?? (p.content ?? '').slice(0, 160),
          category: p.category ?? 'general',
          tags: Array.isArray(p.tags) ? p.tags : [],
          author: {
            id: String(p.author?.id ?? ''),
            name: p.author?.name ?? 'Anonymous',
            role: (p.author?.role ?? 'student') as ForumPostAuthor['role'],
            avatar: p.author?.avatar,
          },
          stats: {
            views: p.stats?.views ?? 0,
            replies: p.stats?.replies ?? 0,
            likes: p.stats?.likes ?? 0,
          },
          timestamp: new Date(p.created_at ?? Date.now()),
          lastActivity: new Date(p.last_activity_at ?? p.created_at ?? Date.now()),
          solved: Boolean(p.is_solved),
          pinned: Boolean(p.is_pinned),
          likedBy: p.liked_by_me ? ['me'] : [],
        }));
        if (mapped.length > 0) setPosts(mapped);
      } catch {
        // Keep mock data on API failure
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPosts();
    return () => { cancelled = true; };
  }, []);

  // Categories
  const categories = [
    { id: 'all', label: 'All Discussions', icon: MessageSquare },
    { id: 'general', label: 'General', icon: MessageCircle },
    { id: 'mathematics', label: 'Mathematics', icon: null },
    { id: 'science', label: 'Science', icon: null },
    { id: 'languages', label: 'Languages', icon: null },
    { id: 'social-studies', label: 'Social Studies', icon: null },
    { id: 'technology', label: 'Technology', icon: null },
    { id: 'help-support', label: 'Help & Support', icon: null }
  ];

  // Category colors
  const categoryColors: Record<string, string> = {
    general: 'bg-gray-500/20 text-gray-400 dark:text-gray-300 border-gray-500/30',
    mathematics: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    science: 'bg-green-500/20 text-green-300 border-green-500/30',
    languages: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'social-studies': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    technology: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'help-support': 'bg-red-500/20 text-red-300 border-red-500/30'
  };

  // Role badge colors
  const roleColors: Record<string, string> = {
    student: 'bg-blue-500/20 text-blue-300',
    parent: 'bg-purple-500/20 text-purple-300',
    instructor: 'bg-green-500/20 text-green-300',
    admin: 'bg-red-500/20 text-red-300',
    partner: 'bg-yellow-500/20 text-yellow-300',
    staff: 'bg-gray-500/20 text-gray-400 dark:text-gray-300'
  };

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = [...posts];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort posts
    filtered.sort((a, b) => {
      // Pinned posts always on top
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      switch (sortBy) {
        case 'latest':
          return b.lastActivity.getTime() - a.lastActivity.getTime();
        case 'popular':
          return b.stats.likes - a.stats.likes;
        case 'most-replies':
          return b.stats.replies - a.stats.replies;
        case 'unanswered':
          if (a.stats.replies === 0 && b.stats.replies > 0) return -1;
          if (a.stats.replies > 0 && b.stats.replies === 0) return 1;
          return b.timestamp.getTime() - a.timestamp.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [selectedCategory, searchQuery, sortBy, posts]);

  // Format time ago
  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Open post detail and fetch replies
  const handleOpenPost = useCallback(async (post: ForumPost) => {
    setSelectedPost(post);
    setShowPostDetail(true);
    try {
      const res = await api.get(`/api/v1/forum/posts/${post.id}`);
      const data = res.data;
      const mappedReplies: ForumReply[] = (data.replies ?? []).map((r: any) => ({
        id: String(r.id),
        postId: String(post.id),
        content: r.content,
        author: {
          id: String(r.author?.id ?? ''),
          name: r.author?.name ?? 'Anonymous',
          role: (r.author?.role ?? 'student') as ForumPostAuthor['role'],
          avatar: r.author?.avatar,
        },
        timestamp: new Date(r.created_at ?? Date.now()),
        likes: r.likes ?? 0,
        isSolution: Boolean(r.is_solution),
        likedBy: [],
      }));
      setReplies(prev => [
        ...prev.filter(r => r.postId !== String(post.id)),
        ...mappedReplies,
      ]);
      if (data.stats) {
        setSelectedPost(prev => prev ? {
          ...prev,
          stats: {
            views: data.stats.views ?? prev.stats.views,
            replies: data.stats.replies ?? prev.stats.replies,
            likes: data.stats.likes ?? prev.stats.likes,
          }
        } : null);
      }
    } catch {
      // Show post with empty replies on error
    }
  }, []);

  // Handle new post submission
  const handleCreatePost = useCallback(async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      const res = await api.post('/api/v1/forum/posts', {
        title: newPostTitle,
        content: newPostContent,
        category: newPostCategory,
        tags: newPostTags,
        is_public: newPostIsPublic,
      });
      const p = res.data;
      const newPost: ForumPost = {
        id: String(p.id),
        title: p.title,
        content: p.content,
        excerpt: p.excerpt ?? p.content.slice(0, 160),
        category: p.category,
        tags: p.tags ?? [],
        author: {
          id: String(p.author?.id ?? user?.id ?? ''),
          name: p.author?.name ?? user?.full_name ?? 'Me',
          role: (p.author?.role ?? user?.role ?? 'student') as ForumPostAuthor['role'],
          avatar: p.author?.avatar ?? (user?.profile_data?.avatar as string | undefined),
        },
        stats: { views: 0, replies: 0, likes: 0 },
        timestamp: new Date(p.created_at ?? Date.now()),
        lastActivity: new Date(p.last_activity_at ?? p.created_at ?? Date.now()),
        solved: false,
        pinned: false,
        likedBy: [],
      };
      setPosts(prev => [newPost, ...prev]);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostTags([]);
      setNewPostCategory('general');
      setNewPostIsPublic(true);
      setShowNewPostModal(false);
      setShowPreview(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create post. Please try again.');
    }
  }, [newPostTitle, newPostContent, newPostCategory, newPostTags, newPostIsPublic, user]);

  // Handle tag input
  const handleAddTag = () => {
    if (currentTag.trim() && !newPostTags.includes(currentTag.trim())) {
      setNewPostTags([...newPostTags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewPostTags(newPostTags.filter(tag => tag !== tagToRemove));
  };

  // Handle post like (toggle)
  const handleLikePost = useCallback(async (postId: string) => {
    try {
      await api.post(`/api/v1/forum/posts/${postId}/like`);
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const alreadyLiked = p.likedBy.includes('me');
        return {
          ...p,
          stats: { ...p.stats, likes: alreadyLiked ? p.stats.likes - 1 : p.stats.likes + 1 },
          likedBy: alreadyLiked ? p.likedBy.filter(id => id !== 'me') : [...p.likedBy, 'me'],
        };
      }));
    } catch {
      // Silently ignore like errors
    }
  }, []);

  const handleReplySubmit = useCallback(async () => {
    if (!replyContent.trim() || !selectedPost) return;
    try {
      const res = await api.post(`/api/v1/forum/posts/${selectedPost.id}/replies`, {
        content: replyContent,
      });
      const r = res.data;
      const newReply: ForumReply = {
        id: String(r.id),
        postId: String(r.post_id ?? selectedPost.id),
        content: r.content,
        author: {
          id: String(r.author?.id ?? user?.id ?? ''),
          name: r.author?.name ?? user?.full_name ?? 'Me',
          role: (r.author?.role ?? user?.role ?? 'student') as ForumPostAuthor['role'],
          avatar: r.author?.avatar ?? (user?.profile_data?.avatar as string | undefined),
        },
        timestamp: new Date(r.created_at ?? Date.now()),
        likes: 0,
        isSolution: false,
        likedBy: [],
      };
      setReplies(prev => [...prev, newReply]);
      setReplyContent('');
      setPosts(prev => prev.map(p =>
        p.id === selectedPost.id
          ? { ...p, stats: { ...p.stats, replies: p.stats.replies + 1 } }
          : p
      ));
      setSelectedPost(prev => prev
        ? { ...prev, stats: { ...prev.stats, replies: prev.stats.replies + 1 } }
        : null
      );
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to post reply. Please try again.');
    }
  }, [replyContent, selectedPost, user]);

  // Get post replies
  const getPostReplies = (postId: string) => {
    return replies.filter(reply => reply.postId === postId);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-blue-400" />
                Community Forum
              </h1>
              <p className="text-gray-500 dark:text-white/60 mt-2">
                Connect with students, parents, and instructors. Ask questions, share knowledge, and grow together.
              </p>
            </div>
            <button
              onClick={() => setShowNewPostModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-900 dark:text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              New Discussion
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="latest">Latest Activity</option>
              <option value="popular">Most Popular</option>
              <option value="most-replies">Most Replies</option>
              <option value="unanswered">Unanswered</option>
            </select>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as CategoryType)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white/80'
                }`}
              >
                {category.icon && <category.icon className="w-4 h-4" />}
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredAndSortedPosts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
              <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/60 text-lg">No discussions found</p>
              <p className="text-gray-400 dark:text-white/40 text-sm mt-2">Try adjusting your filters or start a new discussion</p>
            </div>
          ) : (
            filteredAndSortedPosts.map(post => (
              <div
                key={post.id}
                className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-200 cursor-pointer group"
                onClick={() => handleOpenPost(post)}
              >
                <div className="flex items-start gap-4">
                  {/* Author Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-gray-900 dark:text-white font-semibold flex-shrink-0">
                    {post.author?.avatar ? (
                      <img src={post.author.avatar} alt={post.author?.name ?? ''} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    {/* Post Header */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-300 transition-colors">
                            {post.title}
                          </h3>
                          {post.pinned && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded border border-yellow-500/30">
                              <Pin className="w-3 h-3" />
                              Pinned
                            </span>
                          )}
                          {post.solved && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">
                              <CheckCircle className="w-3 h-3" />
                              Solved
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap text-sm text-gray-500 dark:text-white/60">
                          <span className="font-medium text-gray-700 dark:text-white/80">{post.author?.name ?? 'Anonymous'}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${roleColors[post.author?.role ?? 'student'] ?? ''}`}>
                            {post.author?.role ?? 'member'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(post.lastActivity)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Post Excerpt */}
                    <p className="text-gray-600 dark:text-white/70 mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Category and Tags */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs border ${categoryColors[post.category]}`}>
                        {categories.find(c => c.id === post.category)?.label}
                      </span>
                      {post.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 text-xs rounded border border-gray-200 dark:border-white/10">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Post Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-white/60">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        {post.stats.views}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        {post.stats.replies}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ThumbsUp className="w-4 h-4" />
                        {post.stats.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1f26] border border-gray-200 dark:border-white/10 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Discussion</h2>
              <button
                onClick={() => {
                  setShowNewPostModal(false);
                  setShowPreview(false);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-white/60" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {!showPreview ? (
                <>
                  {/* Title */}
                  <div>
                    <label className="block text-gray-700 dark:text-white/80 font-medium mb-2">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="What's your question or discussion topic?"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-gray-700 dark:text-white/80 font-medium mb-2">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    >
                      {categories.filter(c => c.id !== 'all').map(category => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-gray-700 dark:text-white/80 font-medium mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Add tags (e.g., Grade 7, Algebra)"
                        className="flex-1 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newPostTags.map(tag => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white/80 rounded-full text-sm border border-gray-200 dark:border-white/10"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Visibility Toggle */}
                  <div>
                    <label className="block text-gray-700 dark:text-white/80 font-medium mb-2">
                      Visibility
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setNewPostIsPublic(true)}
                        className={"flex-1 flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors " + (newPostIsPublic ? "border-green-500 bg-green-500/10 text-green-400" : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/20")}
                      >
                        <span className="text-lg">🌐</span>
                        <span>Public</span>
                        <span className="text-xs opacity-70 font-normal">Visible to everyone</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewPostIsPublic(false)}
                        className={"flex-1 flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-colors " + (!newPostIsPublic ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/20")}
                      >
                        <span className="text-lg">🔒</span>
                        <span>Members Only</span>
                        <span className="text-xs opacity-70 font-normal">Visible to logged-in users</span>
                      </button>
                    </div>
                    {newPostIsPublic && (
                      <div className="flex items-start gap-2 mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <span className="text-amber-400 text-sm shrink-0">⚠️</span>
                        <p className="text-xs text-amber-400/90">
                          Public posts are visible to anyone visiting the forum — including non-members.
                          Do not share personal information or private content in public posts.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-gray-700 dark:text-white/80 font-medium mb-2">
                      Content <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Describe your question or discussion in detail..."
                      rows={8}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                    <p className="text-gray-400 dark:text-white/40 text-sm mt-2">
                      You can use Markdown formatting in your post
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Preview Mode */}
                  <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{newPostTitle}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs border ${categoryColors[newPostCategory]}`}>
                        {categories.find(c => c.id === newPostCategory)?.label}
                      </span>
                      {newPostTags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 text-xs rounded border border-gray-200 dark:border-white/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-gray-600 dark:text-white/70 whitespace-pre-wrap">{newPostContent}</div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white/80 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNewPostModal(false);
                    setShowPreview(false);
                  }}
                  className="px-6 py-2 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white/80 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-900 dark:text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                >
                  Post Discussion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {showPostDetail && selectedPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1f26] border border-gray-200 dark:border-white/10 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 sticky top-0 bg-[#1a1f26] z-10">
              <div className="flex items-center gap-2">
                {selectedPost.pinned && (
                  <Pin className="w-5 h-5 text-yellow-400" />
                )}
                {selectedPost.solved && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
              </div>
              <button
                onClick={() => {
                  setShowPostDetail(false);
                  setSelectedPost(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-white/60" />
              </button>
            </div>

            {/* Post Content */}
            <div className="p-6">
              {/* Post Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-gray-900 dark:text-white font-semibold flex-shrink-0">
                  {selectedPost.author?.avatar ? (
                    <img src={selectedPost.author.avatar} alt={selectedPost.author?.name ?? ''} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedPost.title}</h2>
                  <div className="flex items-center gap-2 flex-wrap text-sm text-gray-500 dark:text-white/60">
                    <span className="font-medium text-gray-700 dark:text-white/80">{selectedPost.author?.name ?? 'Anonymous'}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${roleColors[selectedPost.author?.role ?? 'student'] ?? ''}`}>
                      {selectedPost.author?.role ?? 'member'}
                    </span>
                    <span>•</span>
                    <span>{selectedPost.timestamp.toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {selectedPost.stats.views} views
                    </span>
                  </div>
                </div>
              </div>

              {/* Category and Tags */}
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <span className={`px-3 py-1 rounded-full text-xs border ${categoryColors[selectedPost.category]}`}>
                  {categories.find(c => c.id === selectedPost.category)?.label}
                </span>
                {selectedPost.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 text-xs rounded border border-gray-200 dark:border-white/10">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Post Content */}
              <div className="text-gray-700 dark:text-white/80 mb-6 whitespace-pre-wrap leading-relaxed">
                {selectedPost.content}
              </div>

              {/* Post Actions */}
              <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-white/10">
                <button
                  onClick={() => handleLikePost(selectedPost.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white/80 rounded-lg transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{selectedPost.stats.likes}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  Reply
                </button>
              </div>

              {/* Replies Section */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedPost.stats.replies} Replies
                </h3>

                {/* Replies List */}
                <div className="space-y-4 mb-6">
                  {getPostReplies(selectedPost.id).map(reply => (
                    <div key={reply.id} className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-gray-900 dark:text-white font-semibold flex-shrink-0">
                          {reply.author?.avatar ? (
                            <img src={reply.author.avatar} alt={reply.author?.name ?? ''} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-800 dark:text-white/90">{reply.author?.name ?? 'Anonymous'}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${roleColors[reply.author?.role ?? 'student'] ?? ''}`}>
                              {reply.author?.role ?? 'member'}
                            </span>
                            {reply.isSolution && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">
                                <CheckCircle className="w-3 h-3" />
                                Solution
                              </span>
                            )}
                            <span className="text-gray-400 dark:text-white/40 text-sm">{formatTimeAgo(reply.timestamp)}</span>
                          </div>
                          <p className="text-gray-600 dark:text-white/70 mb-2">{reply.content}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <button className="flex items-center gap-1 text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white/80 transition-colors">
                              <ThumbsUp className="w-3 h-3" />
                              {reply.likes}
                            </button>
                            {selectedPost.author?.id === user?.id && !reply.isSolution && (
                              <button className="text-green-400 hover:text-green-300 transition-colors">
                                Mark as Solution
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 resize-none mb-3"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleReplySubmit}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-900 dark:text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                    >
                      <Send className="w-4 h-4" />
                      Post Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ForumPage;
