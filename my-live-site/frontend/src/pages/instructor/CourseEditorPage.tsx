import React, { useEffect, useState } from 'react';
import { Save, ArrowLeft, Sparkles, Eye, X } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../services/api';


interface CourseFormData {
  title: string;
  description: string;
  short_description: string;
  thumbnail_url: string;
  grade_levels: string[];
  learning_area: string;
  language: string;
  difficulty_level: string;
  price: number;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
}

const GRADE_LEVELS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
];

const LEARNING_AREAS = [
  'Mathematics', 'English', 'Kiswahili', 'Science', 'Social Studies',
  'Religious Education', 'Life Skills', 'Physical Education', 'Creative Arts'
];

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const CourseEditorPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    short_description: '',
    thumbnail_url: '',
    grade_levels: [],
    learning_area: '',
    language: 'English',
    difficulty_level: 'Intermediate',
    price: 0,
    status: 'draft',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  useEffect(() => {
    if (courseId && courseId !== 'create') {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/v1/instructor/courses/${courseId}`);

      if (response.data) {
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!formData.title || !formData.description || !formData.learning_area) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const dataToSave = { ...formData, status };

      if (courseId && courseId !== 'create') {
        await apiClient.put(`/api/v1/instructor/courses/${courseId}`, dataToSave);
      } else {
        await apiClient.post('/api/v1/instructor/courses', dataToSave);
      }

      alert(`Course ${status === 'published' ? 'published' : 'saved'} successfully!`);
      navigate('/dashboard/instructor/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleGradeLevelToggle = (grade: string) => {
    setFormData((prev) => ({
      ...prev,
      grade_levels: prev.grade_levels.includes(grade)
        ? prev.grade_levels.filter((g) => g !== grade)
        : [...prev.grade_levels, grade],
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleGenerateSuggestions = async () => {
    if (!formData.title && !formData.learning_area) {
      alert('Please enter a course title or select a learning area first');
      return;
    }

    try {
      setGeneratingSuggestions(true);
      const response = await apiClient.post(
        '/api/v1/instructor/insights/course-suggestions',
        {
          title: formData.title,
          learning_area: formData.learning_area,
          grade_levels: formData.grade_levels,
          current_description: formData.description,
        }
      );

      if (response.data) {
        const suggestions = response.data;
        setFormData((prev) => ({
          ...prev,
          description: suggestions.description || prev.description,
          short_description: suggestions.short_description || prev.short_description,
          tags: suggestions.tags?.length ? suggestions.tags : prev.tags,
        }));
        alert('AI suggestions applied! Review and edit as needed.');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      alert('Failed to generate suggestions. The AI service may be unavailable.');
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const isNewCourse = courseId === 'create' || !courseId;

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title={isNewCourse ? 'Create New Course' : 'Edit Course'}
        description="Design and publish your CBC-aligned course"
        icon={
          <button
            onClick={() => navigate('/dashboard/instructor/courses')}
            className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white" />
          </button>
        }
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 disabled:bg-gray-50 dark:disabled:bg-white/5 disabled:cursor-not-allowed text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg transition-colors font-medium"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
            >
              <Eye className="w-5 h-5" />
              Publish Course
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Introduction to Mathematics - Grade 7"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Short Description *
                </label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Brief one-line description (max 120 characters)"
                  maxLength={120}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                />
                <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40 mt-1">
                  {formData.short_description.length}/120 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Full Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed course description, learning objectives, and outcomes..."
                  rows={6}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/course-thumbnail.jpg"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          </div>

          {/* Grade Levels */}
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Target Grade Levels *</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {GRADE_LEVELS.map((grade) => (
                <button
                  key={grade}
                  onClick={() => handleGradeLevelToggle(grade)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    formData.grade_levels.includes(grade)
                      ? 'bg-purple-500 border-purple-500 text-gray-900 dark:text-white'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags & Keywords</h3>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm flex items-center gap-2"
                >
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-gray-900 dark:hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Settings */}
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Learning Area *
                </label>
                <select
                  value={formData.learning_area}
                  onChange={(e) => setFormData({ ...formData, learning_area: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="">Select learning area</option>
                  {LEARNING_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                >
                  {DIFFICULTY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="English">English</option>
                  <option value="Kiswahili">Kiswahili</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Price (KES)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  min="0"
                  step="100"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                />
                <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40 mt-1">Set to 0 for free courses</p>
              </div>
            </div>
          </div>

          {/* AI Assistant */}
          <div className="bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-purple-500/20 border border-purple-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI Assistant
            </h3>
            <p className="text-sm text-gray-500 dark:text-white/60 mb-4">
              Get AI-powered suggestions for your course description, learning objectives, and
              content structure
            </p>
            <button
              onClick={handleGenerateSuggestions}
              disabled={generatingSuggestions}
              className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
            >
              {generatingSuggestions ? 'Generating...' : 'Generate Suggestions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
