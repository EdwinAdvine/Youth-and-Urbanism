import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Heart, Trash2, Star, Clock, ShoppingCart } from 'lucide-react';

interface WishlistItem {
  id: string;
  title: string;
  subject: string;
  instructor: string;
  rating: number;
  price: string;
  duration: string;
  addedAt: string;
}

const sampleItems: WishlistItem[] = [
  { id: '1', title: 'Advanced Fractions Mastery', subject: 'Mathematics', instructor: 'Ms. Wanjiku', rating: 4.8, price: 'KES 500', duration: '6 weeks', addedAt: '3 days ago' },
  { id: '2', title: 'Coding for Kids: Scratch', subject: 'Technology', instructor: 'Mr. Kibet', rating: 4.9, price: 'KES 750', duration: '8 weeks', addedAt: '1 week ago' },
  { id: '3', title: 'Kenya Wildlife Explorer', subject: 'Science', instructor: 'Dr. Wambui', rating: 4.7, price: 'KES 300', duration: '5 weeks', addedAt: '2 weeks ago' },
];

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [items, setItems] = useState(sampleItems);

  const removeItem = (id: string) => setItems(prev => prev.filter(item => item.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-400 fill-red-400" /> My Wishlist
          </h1>
          <p className="text-gray-600 dark:text-white/70">{items.length} courses saved</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <Heart className="w-12 h-12 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60 mb-4">Your wishlist is empty</p>
          <button onClick={() => navigate('/dashboard/student/browse/courses')} className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius}`}>Browse Courses</button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 dark:text-white font-semibold">{item.title}</h3>
                  <p className="text-gray-400 dark:text-white/40 text-sm mt-0.5">{item.instructor} · {item.subject}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-white/50">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {item.rating}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.duration}</span>
                    <span>Added {item.addedAt}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${item.price === 'Free' ? 'text-green-400' : 'text-gray-900 dark:text-white'}`}>{item.price}</span>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => navigate(`/dashboard/student/browse/preview/${item.id}`)} className={`px-3 py-1.5 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center gap-1`}>
                      <ShoppingCart className="w-3 h-3" /> Enroll
                    </button>
                    <button onClick={() => removeItem(item.id)} className={`px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-red-500/20 text-gray-400 dark:text-white/40 hover:text-red-400 text-sm ${borderRadius}`}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
