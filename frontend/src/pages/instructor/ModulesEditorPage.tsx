import React, { useEffect, useState } from 'react';
import { Plus, Save, ArrowLeft, GripVertical, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content_type: 'text' | 'video' | 'quiz' | 'assignment';
  duration_minutes: number;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
  expanded?: boolean;
}

export const ModulesEditorPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      // Fetch course info
      const courseResponse = await axios.get(`${API_URL}/api/v1/instructor/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourseTitle(courseResponse.data?.title || 'Course');

      // Fetch modules
      const response = await axios.get(`${API_URL}/api/v1/instructor/courses/${courseId}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setModules([
          {
            id: '1',
            title: 'Introduction to Algebra',
            description: 'Learn the fundamentals of algebraic expressions and equations',
            order: 1,
            expanded: true,
            lessons: [
              {
                id: '1-1',
                title: 'What is Algebra?',
                description: 'Introduction to algebraic concepts',
                content_type: 'video',
                duration_minutes: 15,
                order: 1,
              },
              {
                id: '1-2',
                title: 'Variables and Constants',
                description: 'Understanding variables, constants, and coefficients',
                content_type: 'text',
                duration_minutes: 20,
                order: 2,
              },
              {
                id: '1-3',
                title: 'Practice Quiz',
                description: 'Test your understanding',
                content_type: 'quiz',
                duration_minutes: 10,
                order: 3,
              },
            ],
          },
          {
            id: '2',
            title: 'Linear Equations',
            description: 'Solving and graphing linear equations',
            order: 2,
            expanded: false,
            lessons: [
              {
                id: '2-1',
                title: 'Solving Simple Equations',
                description: 'Step-by-step equation solving',
                content_type: 'video',
                duration_minutes: 25,
                order: 1,
              },
              {
                id: '2-2',
                title: 'Graphing Linear Equations',
                description: 'Visual representation of equations',
                content_type: 'text',
                duration_minutes: 30,
                order: 2,
              },
            ],
          },
        ]);
      } else {
        setModules(response.data);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = () => {
    const newModule: Module = {
      id: `temp-${Date.now()}`,
      title: 'New Module',
      description: '',
      lessons: [],
      order: modules.length + 1,
      expanded: true,
    };
    setModules([...modules, newModule]);
  };

  const handleAddLesson = (moduleId: string) => {
    setModules(
      modules.map((mod) => {
        if (mod.id === moduleId) {
          const newLesson: Lesson = {
            id: `temp-${Date.now()}`,
            title: 'New Lesson',
            description: '',
            content_type: 'text',
            duration_minutes: 15,
            order: mod.lessons.length + 1,
          };
          return {
            ...mod,
            lessons: [...mod.lessons, newLesson],
          };
        }
        return mod;
      })
    );
  };

  const handleDeleteModule = (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    setModules(modules.filter((mod) => mod.id !== moduleId));
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    setModules(
      modules.map((mod) => {
        if (mod.id === moduleId) {
          return {
            ...mod,
            lessons: mod.lessons.filter((lesson) => lesson.id !== lessonId),
          };
        }
        return mod;
      })
    );
  };

  const handleToggleModule = (moduleId: string) => {
    setModules(
      modules.map((mod) =>
        mod.id === moduleId ? { ...mod, expanded: !mod.expanded } : mod
      )
    );
  };

  const handleUpdateModule = (moduleId: string, field: string, value: string) => {
    setModules(
      modules.map((mod) =>
        mod.id === moduleId ? { ...mod, [field]: value } : mod
      )
    );
  };

  const handleUpdateLesson = (moduleId: string, lessonId: string, field: string, value: any) => {
    setModules(
      modules.map((mod) => {
        if (mod.id === moduleId) {
          return {
            ...mod,
            lessons: mod.lessons.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
            ),
          };
        }
        return mod;
      })
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('access_token');
      await axios.put(
        `${API_URL}/api/v1/instructor/courses/${courseId}/modules`,
        { modules },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Modules saved successfully!');
    } catch (error) {
      console.error('Error saving modules:', error);
      alert('Failed to save modules');
    } finally {
      setSaving(false);
    }
  };

  const contentTypeIcons = {
    text: '📝',
    video: '🎥',
    quiz: '📊',
    assignment: '📋',
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
        title="Modules & Lessons"
        description={`Course: ${courseTitle}`}
        icon={
          <button
            onClick={() => navigate(`/dashboard/instructor/courses/${courseId}`)}
            className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white" />
          </button>
        }
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddModule}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Module
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save All'}
            </button>
          </div>
        }
      />

      {/* Modules List */}
      {modules.length === 0 ? (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
          <p className="text-gray-500 dark:text-white/60 mb-6">No modules yet. Add your first module to get started.</p>
          <button
            onClick={handleAddModule}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
          >
            Add First Module
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => (
            <div
              key={module.id}
              className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden"
            >
              {/* Module Header */}
              <div className="p-5 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-start gap-4">
                  <div className="mt-2">
                    <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-300 dark:text-white/40 cursor-move" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleModule(module.id)}
                        className="p-1 hover:bg-gray-50 dark:hover:bg-white/5 rounded transition-colors"
                      >
                        {module.expanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-white/60" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500 dark:text-white/60" />
                        )}
                      </button>
                      <span className="text-sm text-gray-400 dark:text-gray-300 dark:text-white/40">Module {moduleIndex + 1}</span>
                    </div>

                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) => handleUpdateModule(module.id, 'title', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-lg font-semibold focus:outline-none focus:border-purple-500/50"
                      placeholder="Module title"
                    />

                    <textarea
                      value={module.description}
                      onChange={(e) => handleUpdateModule(module.id, 'description', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none"
                      placeholder="Module description"
                      rows={2}
                    />
                  </div>

                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Lessons (Expanded) */}
              {module.expanded && (
                <div className="p-5 space-y-3">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-1">{contentTypeIcons[lesson.content_type]}</span>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                              Lesson {lessonIndex + 1}
                            </span>
                            <select
                              value={lesson.content_type}
                              onChange={(e) =>
                                handleUpdateLesson(module.id, lesson.id, 'content_type', e.target.value)
                              }
                              className="px-2 py-1 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
                            >
                              <option value="text">Text</option>
                              <option value="video">Video</option>
                              <option value="quiz">Quiz</option>
                              <option value="assignment">Assignment</option>
                            </select>
                          </div>

                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) =>
                              handleUpdateLesson(module.id, lesson.id, 'title', e.target.value)
                            }
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white font-medium focus:outline-none focus:border-purple-500/50"
                            placeholder="Lesson title"
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={lesson.description}
                              onChange={(e) =>
                                handleUpdateLesson(module.id, lesson.id, 'description', e.target.value)
                              }
                              className="px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/50"
                              placeholder="Description"
                            />

                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={lesson.duration_minutes}
                                onChange={(e) =>
                                  handleUpdateLesson(
                                    module.id,
                                    lesson.id,
                                    'duration_minutes',
                                    Number(e.target.value)
                                  )
                                }
                                min="1"
                                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/50"
                                placeholder="Duration"
                              />
                              <span className="text-sm text-gray-500 dark:text-white/60">min</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteLesson(module.id, lesson.id)}
                          className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddLesson(module.id)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 rounded-lg text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Lesson
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
