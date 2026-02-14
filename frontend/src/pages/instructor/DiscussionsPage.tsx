import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, MessageSquare, Pin, Flag, ThumbsUp, Eye, Sparkles } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  post_type: 'discussion' | 'announcement' | 'question';
  is_pinned: boolean;
  is_flagged: boolean;
  replies_count: number;
  views_count: number;
  likes_count: number;
  sentiment_score?: number;
  created_at: string;
  updated_at: string;
}

export const DiscussionsPage: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [typeFilter, showFlaggedOnly]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (showFlaggedOnly) params.flagged = true;

      const response = await axios.get(`${API_URL}/api/v1/instructor/hub/community/posts`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setPosts([
          {
            id: '1',
            title: 'Welcome to the Mathematics Forum!',
            content: 'This is a space to discuss math concepts, share tips, and help each other learn.',
            author_id: 'instructor-1',
            author_name: 'You',
            post_type: 'announcement',
            is_pinned: true,
            is_flagged: false,
            replies_count: 12,
            views_count: 156,
            likes_count: 45,
            sentiment_score: 0.95,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            title: 'How do I solve quadratic equations?',
            content: 'I\'m struggling with the quadratic formula. Can someone explain the steps?',
            author_id: 'student-1',
            author_name: 'Jane Mwangi',
            post_type: 'question',
            is_pinned: false,
            is_flagged: false,
            replies_count: 8,
            views_count: 42,
            likes_count: 5,
            sentiment_score: 0.65,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            title: 'Cool trick for multiplying by 9',
            content: 'Found an amazing pattern when multiplying any number by 9. The digits always add up to 9!',
            author_id: 'student-2',
            author_name: 'John Kamau',
            post_type: 'discussion',
            is_pinned: false,
            is_flagged: false,
            replies_count: 15,
            views_count: 89,
            likes_count: 23,
            sentiment_score: 0.88,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '4',
            title: 'Inappropriate language in previous post',
            content: 'This post contains content that violates community guidelines.',
            author_id: 'student-3',
            author_name: 'Anonymous',
            post_type: 'discussion',
            is_pinned: false,
            is_flagged: true,
            replies_count: 2,
            views_count: 18,
            likes_count: 0,
            sentiment_score: -0.42,
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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

  const handleCreatePost = () => {
    navigate('/dashboard/instructor/discussions/create');
  };

  const handleViewPost = (postId: string) => {
    navigate(`/dashboard/instructor/discussions/${postId}`);
  };

  const handlePinPost = async (postId: string, isPinned: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(
        `${API_URL}/api/v1/instructor/hub/community/posts/${postId}`,
        { is_pinned: !isPinned },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
    } catch (error) {
      console.error('Error pinning post:', error);
      alert('Failed to update post');
    }
  };

  const handleModeratePost = async (postId: string) => {
    const action = confirm('Mark this post as moderated and hide it?');
    if (!action) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(
        `${API_URL}/api/v1/instructor/hub/community/posts/${postId}`,
        { is_moderated: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
    } catch (error) {
      console.error('Error moderating post:', error);
      alert('Failed to moderate post');
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: posts.length,
    flagged: posts.filter((p) => p.is_flagged).length,
    questions: posts.filter((p) => p.post_type === 'question').length,
    totalEngagement: posts.reduce((sum, p) => sum + p.replies_count + p.likes_count, 0),
  };

  const postTypeIcons = {
    announcement: '📢',
    question: '❓',
    discussion: '💬',
  };

  const postTypeColors = {
    announcement: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    question: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    discussion: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  const getSentimentColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 0.7) return 'text-green-400';
    if (score >= 0.3) return 'text-yellow-400';
    return 'text-red-400';
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
        title="Discussions & Forum"
        description="Moderate student discussions and post announcements"
        icon={<MessageSquare className="w-6 h-6 text-purple-400" />}
        actions={
          <button
            onClick={handleCreatePost}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            New Post
          </button>
        }
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Flag className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Flagged</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.flagged}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <MessageSquare className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Questions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.questions}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <ThumbsUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Engagement</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEngagement}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-white/60" />
            <span className="text-sm text-gray-500 dark:text-white/60">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All</option>
              <option value="announcement">Announcements</option>
              <option value="question">Questions</option>
              <option value="discussion">Discussions</option>
            </select>
          </div>

          <button
            onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
              showFlaggedOnly
                ? 'bg-red-500/20 border-red-500/30 text-red-300'
                : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
          >
            <Flag className="w-4 h-4 inline mr-1" />
            Flagged Only
          </button>
        </div>
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Posts Yet</h3>
          <p className="text-gray-500 dark:text-white/60 mb-6">
            {searchQuery
              ? 'No posts match your search criteria'
              : 'Create your first post to get the discussion started'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreatePost}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
            >
              Create First Post
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => handleViewPost(post.id)}
              className={`bg-gray-50 dark:bg-white/5 backdrop-blur-sm border rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all cursor-pointer ${
                post.is_flagged ? 'border-red-500/30' : 'border-gray-200 dark:border-white/10'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{postTypeIcons[post.post_type]}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded border ${
                        postTypeColors[post.post_type]
                      }`}
                    >
                      {post.post_type}
                    </span>
                    {post.is_pinned && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded border bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                        <Pin className="w-3 h-3 inline mr-1" />
                        Pinned
                      </span>
                    )}
                    {post.is_flagged && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded border bg-red-500/10 text-red-400 border-red-500/30">
                        <Flag className="w-3 h-3 inline mr-1" />
                        Flagged
                      </span>
                    )}
                    {post.sentiment_score !== undefined && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded border bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 flex items-center gap-1">
                        <Sparkles className={`w-3 h-3 ${getSentimentColor(post.sentiment_score)}`} />
                        <span className="text-gray-500 dark:text-white/60">
                          {(post.sentiment_score * 100).toFixed(0)}% positive
                        </span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-white/60 mb-3 line-clamp-2">{post.content}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                    <span>{post.author_name}</span>
                    <span>•</span>
                    <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {post.replies_count} replies
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views_count} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {post.likes_count}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePinPost(post.id, post.is_pinned);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      post.is_pinned
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                    title={post.is_pinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className="w-4 h-4" />
                  </button>

                  {post.is_flagged && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModeratePost(post.id);
                      }}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Moderate"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
