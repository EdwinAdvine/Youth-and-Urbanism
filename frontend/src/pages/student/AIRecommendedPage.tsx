import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Sparkles, Star, Clock, Users, BookOpen, Heart, ShoppingCart } from 'lucide-react';

interface RecommendedCourse {
  id: string;
  title: string;
  subject: string;
  description: string;
  rating: number;
  students: number;
  duration: string;
  matchScore: number;
  reason: string;
  price: string;
  color: string;
}

const recommendations: RecommendedCourse[] = [
  { id: '1', title: 'Advanced Fractions Mastery', subject: 'Mathematics', description: 'Master complex fractions, mixed numbers, and real-world applications', rating: 4.8, students: 342, duration: '6 weeks', matchScore: 95, reason: "Based on your strong performance in basic fractions", price: 'KES 500', color: 'from-blue-500 to-cyan-500' },
  { id: '2', title: 'Creative Writing Workshop', subject: 'English', description: 'Develop your storytelling and essay writing skills', rating: 4.6, students: 218, duration: '4 weeks', matchScore: 88, reason: "You showed interest in creative writing last week", price: 'Free', color: 'from-purple-500 to-pink-500' },
  { id: '3', title: 'Coding for Kids: Scratch', subject: 'Technology', description: 'Learn to code by building fun games and animations', rating: 4.9, students: 567, duration: '8 weeks', matchScore: 82, reason: "Popular with students at your grade level", price: 'KES 750', color: 'from-green-500 to-emerald-500' },
  { id: '4', title: 'Kenya Wildlife Explorer', subject: 'Science', description: 'Discover the amazing animals and ecosystems of Kenya', rating: 4.7, students: 189, duration: '5 weeks', matchScore: 78, reason: "Complements your current Science course", price: 'KES 300', color: 'from-orange-500 to-yellow-500' },
];

const AIRecommendedPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const toggleWishlist = (id: string) => {
    setWishlist(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-yellow-400" /> AI Recommended For You
        </h1>
        <p className="text-gray-600 dark:text-white/70">Personalized course recommendations based on your learning journey</p>
      </div>

      <div className={`p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 ${borderRadius} border border-purple-500/30`}>
        <p className="text-gray-700 dark:text-white/80 text-sm"><Sparkles className="w-4 h-4 inline-block mr-1 text-purple-400" /> These recommendations are tailored using your learning history, performance data, and interests.</p>
      </div>

      <div className="space-y-4">
        {recommendations.map((course) => (
          <div key={course.id} className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${course.color} ${borderRadius} flex items-center justify-center`}>
                <span className="text-gray-900 dark:text-white font-bold text-lg">{course.matchScore}%</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-semibold text-lg">{course.title}</h3>
                    <span className={`inline-block px-2 py-0.5 ${borderRadius} text-xs bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 mt-1`}>{course.subject}</span>
                  </div>
                  <button onClick={() => toggleWishlist(course.id)} className={`p-2 ${borderRadius} ${wishlist.has(course.id) ? 'text-red-400' : 'text-gray-400 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60'}`}>
                    <Heart className={`w-5 h-5 ${wishlist.has(course.id) ? 'fill-red-400' : ''}`} />
                  </button>
                </div>
                <p className="text-gray-500 dark:text-white/60 text-sm mt-2">{course.description}</p>
                <div className={`mt-3 p-2 bg-purple-500/10 ${borderRadius} inline-flex items-center gap-1.5`}>
                  <Sparkles className="w-3 h-3 text-purple-400" /><span className="text-purple-300 text-xs">{course.reason}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-white/50">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {course.rating}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.students} students</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className={`text-lg font-bold ${course.price === 'Free' ? 'text-green-400' : 'text-gray-900 dark:text-white'}`}>{course.price}</span>
                <button onClick={() => navigate(`/dashboard/student/browse/preview/${course.id}`)} className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white text-sm ${borderRadius} flex items-center gap-2 mt-2`}>
                  <BookOpen className="w-4 h-4" /> Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button onClick={() => navigate('/dashboard/student/browse/courses')} className={`px-6 py-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2 mx-auto`}>
          <ShoppingCart className="w-4 h-4" /> Browse All Courses
        </button>
      </div>
    </div>
  );
};

export default AIRecommendedPage;
