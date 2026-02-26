import React, { useState, useEffect } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Heart, MessageCircle, Send, Star, Loader2, AlertTriangle } from 'lucide-react';
import { getClassWall } from '../../services/student/studentCommunityService';

interface WallPost {
  id: string;
  from: string;
  to: string;
  message: string;
  category: string;
  timeAgo: string;
  likes: number;
}

const mockWallPosts: WallPost[] = [
  { id: '1', from: 'Grace W.', to: 'Kevin O.', message: 'Great job on the math quiz today! You helped me understand fractions better.', category: 'thanks', timeAgo: '1 hour ago', likes: 5 },
  { id: '2', from: 'Teacher Wanjiku', to: 'Class 7B', message: "I'm so proud of everyone's effort this week! Keep up the amazing work!", category: 'encouragement', timeAgo: '3 hours ago', likes: 18 },
  { id: '3', from: 'Amina K.', to: 'Faith A.', message: 'Congratulations on earning the Quiz Master badge!', category: 'achievement', timeAgo: '5 hours ago', likes: 8 },
  { id: '4', from: 'James N.', to: 'Science Study Group', message: 'Thanks for the help with the water cycle project everyone!', category: 'thanks', timeAgo: '1 day ago', likes: 12 },
  { id: '5', from: 'Brian K.', to: 'Sarah M.', message: "You're an inspiration - 23-day streak and counting!", category: 'encouragement', timeAgo: '1 day ago', likes: 9 },
];

const categoryColors: Record<string, string> = {
  thanks: 'bg-green-500/20 text-green-400',
  encouragement: 'bg-blue-500/20 text-blue-400',
  achievement: 'bg-yellow-500/20 text-yellow-400',
  help: 'bg-purple-500/20 text-purple-400',
};

const ClassWallPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [newMessage, setNewMessage] = useState('');
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getClassWall();
        const fetched = Array.isArray(data) ? data : data?.posts ?? data?.items ?? [];
        setPosts(fetched.length > 0 ? fetched : mockWallPosts);
      } catch {
        setError('Could not load class wall from server. Showing sample posts.');
        setPosts(mockWallPosts);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, likes: likedPosts.has(postId) ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleToggleReply = (postId: string) => {
    if (replyingTo === postId) {
      setReplyingTo(null);
      setReplyText('');
    } else {
      setReplyingTo(postId);
      setReplyText('');
    }
  };

  const handleSubmitReply = (postId: string) => {
    if (!replyText.trim()) return;
    // For now, just close the reply box (no API endpoint for replies yet)
    setReplyingTo(null);
    setReplyText('');
    // Optimistic: could append to a local replies list per post in the future
    void postId;
  };

  const handleSendShoutout = () => {
    if (!newMessage.trim()) return;
    // Optimistically add to local state
    const newPost: WallPost = {
      id: `local-${Date.now()}`,
      from: 'You',
      to: 'Class',
      message: newMessage,
      category: 'encouragement',
      timeAgo: 'Just now',
      likes: 0,
    };
    setPosts(prev => [newPost, ...prev]);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#FF0000] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Star className="w-8 h-8 text-yellow-400" /> Class Wall
        </h1>
        <p className="text-gray-600 dark:text-white/70">Shoutouts and encouragement from your classmates</p>
      </div>

      {error && (
        <div className={`flex items-center gap-2 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 ${borderRadius} text-yellow-400 text-sm`}>
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* New Shoutout */}
      <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex gap-2">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendShoutout()} placeholder="Send a shoutout to someone..." className={`flex-1 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`} />
          <button onClick={handleSendShoutout} disabled={!newMessage.trim()} className={`px-4 py-2.5 bg-[#FF0000] hover:bg-[#FF0000]/80 disabled:opacity-50 text-gray-900 dark:text-white ${borderRadius}`}><Send className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Wall Posts */}
      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 text-xs ${borderRadius} ${categoryColors[post.category] || 'bg-gray-500/20 text-gray-400'}`}>{post.category}</span>
              <span className="text-gray-400 dark:text-white/40 text-xs">{post.timeAgo}</span>
            </div>
            <p className="text-gray-700 dark:text-white/80">
              <span className="text-gray-900 dark:text-white font-medium">{post.from}</span>
              <span className="text-gray-400 dark:text-white/40"> to </span>
              <span className="text-gray-900 dark:text-white font-medium">{post.to}</span>
            </p>
            <p className="text-gray-600 dark:text-white/70 mt-2">{post.message}</p>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1 text-sm ${likedPosts.has(post.id) ? 'text-red-400' : 'text-gray-400 dark:text-white/40 hover:text-red-400'}`}
              >
                <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} /> {post.likes}
              </button>
              <button
                onClick={() => handleToggleReply(post.id)}
                className={`flex items-center gap-1 text-sm ${replyingTo === post.id ? 'text-blue-400' : 'text-gray-400 dark:text-white/40 hover:text-blue-400'}`}
              >
                <MessageCircle className="w-4 h-4" /> Reply
              </button>
            </div>

            {/* Reply Input */}
            {replyingTo === post.id && (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply(post.id)}
                  placeholder="Write a reply..."
                  autoFocus
                  className={`flex-1 px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`}
                />
                <button
                  onClick={() => handleSubmitReply(post.id)}
                  disabled={!replyText.trim()}
                  className={`px-3 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 disabled:opacity-50 text-gray-900 dark:text-white text-sm ${borderRadius}`}
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassWallPage;
