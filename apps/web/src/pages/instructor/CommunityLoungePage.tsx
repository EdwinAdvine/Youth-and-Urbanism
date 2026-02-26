import React, { useEffect, useState } from 'react';
import { Users, MessageSquare, Plus, Pin, Eye, ThumbsUp } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import apiClient from '../../services/api';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';


interface ForumPost {
  id: string;
  author_name: string;
  author_avatar?: string;
  title: string;
  content: string;
  post_type: 'discussion' | 'question' | 'announcement';
  is_pinned: boolean;
  is_answered?: boolean;
  created_at: string;
  replies_count: number;
  views_count: number;
  likes_count: number;
  tags: string[];
}

export const CommunityLoungePage: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [filterType, sortBy]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params: any = { sort: sortBy };
      if (filterType !== 'all') params.type = filterType;

      const response = await apiClient.get('/api/v1/instructor/hub/community/posts', {
        params,
      });

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setPosts([
          {
            id: '1',
            author_name: 'Sarah Wambui',
            title: 'Best practices for engaging Grade 7 students in mathematics?',
            content:
              'I\'m looking for creative ways to keep Grade 7 students engaged during algebra lessons. What strategies have worked well for you?',
            post_type: 'question',
            is_pinned: false,
            is_answered: true,
            created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            replies_count: 12,
            views_count: 145,
            likes_count: 8,
            tags: ['Mathematics', 'Engagement', 'Grade 7'],
          },
          {
            id: '2',
            author_name: 'Platform Admin',
            title: 'New Feature: AI CBC Alignment Tool Now Available!',
            content:
              'We\'re excited to announce the launch of our new AI-powered CBC alignment tool. Check your course editor to try it out!',
            post_type: 'announcement',
            is_pinned: true,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            replies_count: 45,
            views_count: 892,
            likes_count: 67,
            tags: ['Announcement', 'Features'],
          },
          {
            id: '3',
            author_name: 'James Ochieng',
            title: 'Sharing my student assessment rubric template',
            content:
              'I\'ve created a comprehensive rubric template for grading essays and projects. It\'s CBC-aligned and includes clear criteria. Feel free to use and adapt!',
            post_type: 'discussion',
            is_pinned: false,
            created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            replies_count: 23,
            views_count: 234,
            likes_count: 34,
            tags: ['Assessment', 'Templates', 'CBC'],
          },
          {
            id: '4',
            author_name: 'Grace Njeri',
            title: 'How do you handle late assignment submissions?',
            content:
              'I\'m struggling with setting a fair late submission policy. What percentage do you typically deduct per day? Looking for advice.',
            post_type: 'question',
            is_pinned: false,
            is_answered: false,
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            replies_count: 8,
            views_count: 89,
            likes_count: 5,
            tags: ['Policies', 'Grading'],
          },
          {
            id: '5',
            author_name: 'David Mutua',
            title: 'Tips for effective parent-teacher communication',
            content:
              'Here are 5 strategies I use to maintain positive communication with parents. Would love to hear what works for you!',
            post_type: 'discussion',
            is_pinned: false,
            created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            replies_count: 31,
            views_count: 312,
            likes_count: 28,
            tags: ['Parents', 'Communication'],
          },
        ]);
      } else {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const typeColors = {
    discussion: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    question: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    announcement: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  const typeLabels = {
    discussion: 'Discussion',
    question: 'Question',
    announcement: 'Announcement',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Community Lounge"
        description="Connect, share, and learn with fellow instructors"
        icon={<Users className="w-6 h-6 text-purple-400" />}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            New Post
          </button>
        }
      />

      {/* Filters and Sort */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg border transition-colors text-sm ${
              filterType === 'all'
                ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setFilterType('question')}
            className={`px-4 py-2 rounded-lg border transition-colors text-sm ${
              filterType === 'question'
                ? 'bg-orange-500/20 border-orange-500/30 text-orange-300'
                : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => setFilterType('discussion')}
            className={`px-4 py-2 rounded-lg border transition-colors text-sm ${
              filterType === 'discussion'
                ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
          >
            Discussions
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-white/60">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'trending')}
            className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="trending">Trending</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition-colors cursor-pointer"
            onClick={() => navigate(`/dashboard/instructor/hub/community/post/${post.id}`)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                {post.is_pinned && <Pin className="w-5 h-5 text-purple-400 mt-1" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium border ${
                        typeColors[post.post_type]
                      }`}
                    >
                      {typeLabels[post.post_type]}
                    </span>
                    {post.post_type === 'question' && post.is_answered && (
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/30">
                        Answered
                      </span>
                    )}
                    {post.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{post.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-white/70 line-clamp-2">{post.content}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-white/60">
                <span>{post.author_name}</span>
                <span>•</span>
                <span>{format(new Date(post.created_at), 'MMM d, h:mm a')}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-white/60">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.replies_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.views_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{post.likes_count}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-white/60">No posts found</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-purple-200 mb-2">Community Guidelines</h4>
        <ul className="text-sm text-purple-200/80 space-y-1 list-disc list-inside">
          <li>Be respectful and constructive in all discussions</li>
          <li>Share resources and knowledge freely to help fellow instructors</li>
          <li>Ask questions - there are no "silly" questions here!</li>
          <li>Mark questions as "answered" when you receive a helpful solution</li>
          <li>Use tags to help others find relevant content</li>
          <li>Report any inappropriate content to moderators</li>
        </ul>
      </div>
    </div>
  );
};
