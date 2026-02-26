import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Heart, Trash2, Star, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import { getWishlist, removeFromWishlist } from '../../services/student/studentLearningService';

interface WishlistItem {
  wishlist_id: string;
  course_id: string;
  course_title: string;
  course_description: string;
  instructor_name: string;
  grade_levels: string[];
  price: number;
  thumbnail_url: string | null;
  added_at: string;
}

const formatPrice = (price: number) => price === 0 ? 'Free' : `KES ${price.toLocaleString()}`;

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWishlist();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (courseId: string) => {
    setRemoving(courseId);
    try {
      await removeFromWishlist(courseId);
      setItems(prev => prev.filter(item => item.course_id !== courseId));
    } catch {
      setError('Failed to remove item. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-400 fill-red-400" /> My Wishlist
          </h1>
          <p className="text-gray-600 dark:text-white/70">
            {loading ? 'Loading…' : `${items.length} course${items.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/student/browse/marketplace')}
          className={`px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white text-sm ${borderRadius}`}
        >
          Browse More
        </button>
      </div>

      {error && (
        <div className={`p-3 bg-red-500/10 border border-red-500/20 ${borderRadius} flex items-center gap-2 text-red-400 text-sm`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 text-[#FF0000] animate-spin" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <Heart className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60 mb-2 font-medium">Your wishlist is empty</p>
          <p className="text-gray-400 dark:text-white/40 text-sm mb-4">
            Browse courses and tap the heart icon to save them here.
          </p>
          <button
            onClick={() => navigate('/dashboard/student/browse/marketplace')}
            className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-white ${borderRadius}`}
          >
            Browse Courses
          </button>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => {
            const priceLabel = formatPrice(item.price);
            const isRemoving = removing === item.course_id;
            return (
              <div
                key={item.wishlist_id}
                className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {item.grade_levels.slice(0, 2).map((g) => (
                        <span key={g} className={`px-2 py-0.5 ${borderRadius} text-xs bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50`}>{g}</span>
                      ))}
                    </div>
                    <h3 className="text-gray-900 dark:text-white font-semibold line-clamp-1">{item.course_title}</h3>
                    <p className="text-gray-400 dark:text-white/40 text-sm mt-0.5">{item.instructor_name}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-white/50">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> —
                      </span>
                      <span>Added {new Date(item.added_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-lg font-bold ${priceLabel === 'Free' ? 'text-green-400' : 'text-gray-900 dark:text-white'}`}>
                      {priceLabel}
                    </span>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => navigate(`/dashboard/student/browse/preview/${item.course_id}`)}
                        className={`px-3 py-1.5 bg-[#FF0000] hover:bg-[#FF0000]/80 text-white text-sm ${borderRadius} flex items-center gap-1`}
                      >
                        <ShoppingCart className="w-3 h-3" /> Enroll
                      </button>
                      <button
                        onClick={() => handleRemove(item.course_id)}
                        disabled={isRemoving}
                        className={`px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-red-500/20 text-gray-400 dark:text-white/40 hover:text-red-400 text-sm ${borderRadius} disabled:opacity-50`}
                      >
                        {isRemoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
