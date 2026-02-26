import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft, BookOpen, Clock, Users, Star, Play, CheckCircle } from 'lucide-react';

const CoursePreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: _id } = useParams();
  const { borderRadius } = useAgeAdaptiveUI();
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const course = {
    title: 'Mathematics: Fractions & Decimals',
    instructor: 'Ms. Wanjiku',
    rating: 4.8,
    reviews: 124,
    students: 280,
    lessons: 20,
    duration: '8 hours',
    level: 'Grade 6-7',
    description: 'Master fractions and decimals with interactive lessons, real-world examples, and AI-powered practice. This course covers conversion between fractions and decimals, operations, and word problems aligned with the CBC curriculum.',
    topics: ['Introduction to Fractions', 'Equivalent Fractions', 'Adding & Subtracting', 'Multiplying & Dividing', 'Decimal Basics', 'Converting Between Forms', 'Word Problems', 'Assessment'],
    price: 500,
  };

  const handleEnroll = () => {
    setEnrolling(true);
    setTimeout(() => {
      setEnrolling(false);
      setEnrolled(true);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Preview</h1>
      </div>

      <div className={`p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 ${borderRadius} border border-blue-500/30`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{course.title}</h2>
        <p className="text-gray-500 dark:text-white/60 mb-3">{course.instructor}</p>
        <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500 dark:text-white/50">
          <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /> {course.rating} ({course.reviews} reviews)</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.students} students</span>
          <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.lessons} lessons</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration}</span>
        </div>
      </div>

      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-semibold mb-3">About this course</h3>
        <p className="text-gray-600 dark:text-white/70 text-sm leading-relaxed">{course.description}</p>
      </div>

      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <h3 className="text-gray-900 dark:text-white font-semibold mb-3">Topics Covered</h3>
        <div className="space-y-2">
          {course.topics.map((topic, i) => (
            <div key={i} className={`p-3 bg-gray-50 dark:bg-white/5 ${borderRadius} flex items-center gap-3`}>
              <span className="text-gray-400 dark:text-white/30 text-sm w-6">{i + 1}.</span>
              <span className="text-gray-700 dark:text-white/80 text-sm">{topic}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] flex items-center justify-between flex-wrap gap-4`}>
        <div>
          <span className="text-gray-400 dark:text-white/40 text-sm">Price</span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">KES {course.price.toLocaleString()}</div>
        </div>
        <button
          onClick={handleEnroll}
          disabled={enrolling || enrolled}
          className={`px-8 py-3 ${borderRadius} font-medium flex items-center gap-2 ${
            enrolled
              ? 'bg-green-500 text-gray-900 dark:text-white'
              : 'bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white'
          } disabled:opacity-70`}
        >
          {enrolled ? <><CheckCircle className="w-5 h-5" /> Enrolled!</> : enrolling ? 'Enrolling...' : <><Play className="w-5 h-5" /> Enroll Now</>}
        </button>
      </div>
    </div>
  );
};

export default CoursePreviewPage;
