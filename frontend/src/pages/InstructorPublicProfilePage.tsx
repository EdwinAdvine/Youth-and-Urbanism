import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Award, Users, BookOpen, MessageSquare } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface PublicProfile {
  display_name: string;
  tagline: string;
  bio: string;
  avatar_url?: string;
  banner_url?: string;
  specializations: string[];
  qualifications: string[];
  languages: string[];
  courses: Array<{
    id: string;
    title: string;
    thumbnail_url?: string;
    enrollments_count: number;
    rating: number;
  }>;
  badges: Array<{
    name: string;
    icon_url?: string;
    tier: string;
  }>;
  stats: {
    total_students: number;
    total_courses: number;
    avg_rating: number;
    total_reviews: number;
  };
}

export const InstructorPublicProfilePage: React.FC = () => {
  const { slug } = useParams();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [slug]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/public/instructors/${slug}`);

      // Mock data
      if (!response.data) {
        setProfile({
          display_name: 'John Instructor',
          tagline: 'Making math fun and accessible for all learners',
          bio: 'Experienced mathematics and science teacher with over 10 years of helping students excel. Passionate about making complex concepts simple and engaging. Specialized in CBC-aligned curriculum and personalized learning approaches.',
          specializations: ['Mathematics', 'Science', 'Problem Solving'],
          qualifications: ['BSc Mathematics', 'PGDE', 'CBC Certified'],
          languages: ['English', 'Swahili'],
          courses: [
            {
              id: '1',
              title: 'Introduction to Mathematics - Grade 7',
              enrollments_count: 145,
              rating: 4.8,
            },
            {
              id: '2',
              title: 'Science Fundamentals - Grade 8',
              enrollments_count: 98,
              rating: 4.6,
            },
          ],
          badges: [
            { name: '500 Students', tier: 'gold' },
            { name: 'CBC Champion', tier: 'silver' },
            { name: 'Top Rated', tier: 'platinum' },
          ],
          stats: {
            total_students: 458,
            total_courses: 4,
            avg_rating: 4.7,
            total_reviews: 127,
          },
        });
      } else {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Instructor Not Found</h1>
        <p className="text-gray-500 dark:text-white/60">The instructor profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Banner */}
      <div className="h-64 bg-gradient-to-r from-purple-900 to-blue-900" />

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-32 pb-12">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-purple-400">
                {profile.display_name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{profile.display_name}</h1>
              <p className="text-lg text-purple-300 mb-4">{profile.tagline}</p>
              <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-gray-900 dark:text-white">{profile.stats.avg_rating}</span>
                  <span>({profile.stats.total_reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{profile.stats.total_students} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{profile.stats.total_courses} courses</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.specializations.map((spec, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-lg text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5" />
              Contact Instructor
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
              <p className="text-gray-400 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
            </div>

            {/* Courses */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Courses</h2>
              <div className="space-y-4">
                {profile.courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-20 h-20 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{course.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span>{course.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.enrollments_count} enrolled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievements</h3>
              <div className="space-y-3">
                {profile.badges.map((badge, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg"
                  >
                    <Award className="w-8 h-8 text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{badge.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{badge.tier}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Qualifications */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Qualifications</h3>
              <ul className="space-y-2">
                {profile.qualifications.map((qual, i) => (
                  <li key={i} className="text-sm text-gray-400 dark:text-gray-300">
                    • {qual}
                  </li>
                ))}
              </ul>
            </div>

            {/* Languages */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-700 text-gray-400 dark:text-gray-300 rounded-lg text-sm"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
