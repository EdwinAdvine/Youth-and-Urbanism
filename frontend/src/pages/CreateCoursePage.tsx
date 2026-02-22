/**
 * Create/Edit Course Page
 *
 * Instructor interface for creating and editing courses.
 *
 * Features:
 * - Multi-step course creation wizard
 * - Basic info (title, description, grade levels, learning area)
 * - Syllabus builder
 * - Lesson management
 * - Pricing and publication settings
 * - Preview before publishing
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import LessonEditor from '../components/instructor/LessonEditor';

import courseService from '../services/courseService';
import type {
  CourseCreate,
  LearningArea,
  GradeLevel,
  Lesson,
  Syllabus,
} from '../types/course';

type FormStep = 'basic' | 'syllabus' | 'lessons' | 'pricing' | 'review';

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId?: string }>();
  const isEditing = !!courseId;

  // State
  const [currentStep, setCurrentStep] = useState<FormStep>('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<CourseCreate>({
    title: '',
    description: '',
    learning_area: 'Mathematics' as LearningArea,
    grade_levels: [],
    thumbnail_url: '',
    syllabus: {
      overview: '',
      learning_outcomes: [],
      prerequisites: [],
      assessment_criteria: [],
      modules: [],
    },
    lessons: [],
    price: 0,
    currency: 'KES',
    estimated_duration_hours: 0,
    competencies: [],
  });

  // Load course data if editing
  useEffect(() => {
    if (isEditing && courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const course = await courseService.getCourseDetails(courseId!);
      setFormData({
        title: course.title,
        description: course.description,
        learning_area: course.learning_area,
        grade_levels: course.grade_levels,
        thumbnail_url: course.thumbnail_url,
        syllabus: course.syllabus,
        lessons: course.lessons,
        price: Number(course.price),
        currency: course.currency,
        estimated_duration_hours: course.estimated_duration_hours,
        competencies: course.competencies,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isEditing) {
        await courseService.updateCourse(courseId!, formData);
        alert('Course updated successfully!');
      } else {
        await courseService.createCourse(formData);
        alert('Course created successfully!');
        navigate('/dashboard/instructor/courses');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save course');
      alert(err?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const steps: { id: FormStep; label: string; icon: number }[] = [
    { id: 'basic', label: 'Basic Info', icon: 1 },
    { id: 'syllabus', label: 'Syllabus', icon: 2 },
    { id: 'lessons', label: 'Lessons', icon: 3 },
    { id: 'pricing', label: 'Pricing', icon: 4 },
    { id: 'review', label: 'Review', icon: 5 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const canGoNext = currentStepIndex < steps.length - 1;
  const canGoPrevious = currentStepIndex > 0;

  const goNext = () => {
    if (canGoNext) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const goPrevious = () => {
    if (canGoPrevious) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard/instructor/courses')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to My Courses
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditing ? 'Update your course details' : 'Create a CBC-aligned course for students'}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      index <= currentStepIndex
                        ? 'bg-blue-600 text-gray-900 dark:text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </button>
                  <span className="mt-2 text-sm font-medium text-gray-700">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 w-16 mx-4 ${
                      index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {currentStep === 'basic' && (
            <BasicInfoStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 'syllabus' && (
            <SyllabusStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 'lessons' && (
            <LessonsStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 'pricing' && (
            <PricingStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 'review' && <ReviewStep formData={formData} />}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t">
            <button
              onClick={goPrevious}
              disabled={!canGoPrevious}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Previous
            </button>

            {currentStep === 'review' ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-gray-900 dark:text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!canGoNext}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-gray-900 dark:text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step Components
// ============================================================================

interface StepProps {
  formData: CourseCreate;
  setFormData: React.Dispatch<React.SetStateAction<CourseCreate>>;
}

function BasicInfoStep({ formData, setFormData }: StepProps) {
  const gradeLevelOptions: GradeLevel[] = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
    'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
  ];

  const learningAreaOptions: LearningArea[] = [
    'Mathematics',
    'Science and Technology',
    'Languages',
    'English',
    'Kiswahili',
    'Social Studies',
    'Creative Arts',
    'Physical Education',
  ];

  const toggleGradeLevel = (grade: GradeLevel) => {
    const current = formData.grade_levels || [];
    const updated = current.includes(grade)
      ? current.filter((g) => g !== grade)
      : [...current, grade];
    setFormData({ ...formData, grade_levels: updated });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Introduction to Mathematics for Grade 5"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Provide a detailed description of your course..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Learning Area *
        </label>
        <select
          value={formData.learning_area}
          onChange={(e) =>
            setFormData({ ...formData, learning_area: e.target.value as LearningArea })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {learningAreaOptions.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Grade Levels * (Select all that apply)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {gradeLevelOptions.map((grade) => (
            <label
              key={grade}
              className={`flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer ${
                formData.grade_levels?.includes(grade)
                  ? 'bg-blue-100 border-blue-600 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.grade_levels?.includes(grade)}
                onChange={() => toggleGradeLevel(grade)}
                className="sr-only"
              />
              {grade.replace('Grade ', 'G')}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estimated Duration (hours)
        </label>
        <input
          type="number"
          value={formData.estimated_duration_hours || ''}
          onChange={(e) =>
            setFormData({ ...formData, estimated_duration_hours: parseInt(e.target.value) || 0 })
          }
          placeholder="e.g., 20"
          min="0"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thumbnail URL (optional)
        </label>
        <input
          type="url"
          value={formData.thumbnail_url || ''}
          onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

function SyllabusStep({ formData, setFormData }: StepProps) {
  const defaultSyllabus: Syllabus = { overview: '', learning_outcomes: [], modules: [] };

  const addLearningOutcome = () => {
    const syllabus = formData.syllabus || defaultSyllabus;
    setFormData({
      ...formData,
      syllabus: {
        ...syllabus,
        learning_outcomes: [...(syllabus.learning_outcomes || []), ''],
      },
    });
  };

  const updateLearningOutcome = (index: number, value: string) => {
    const syllabus = formData.syllabus || defaultSyllabus;
    const outcomes = [...(syllabus.learning_outcomes || [])];
    outcomes[index] = value;
    setFormData({
      ...formData,
      syllabus: { ...syllabus, learning_outcomes: outcomes },
    });
  };

  const removeLearningOutcome = (index: number) => {
    const syllabus = formData.syllabus || defaultSyllabus;
    const outcomes = [...(syllabus.learning_outcomes || [])];
    outcomes.splice(index, 1);
    setFormData({
      ...formData,
      syllabus: { ...syllabus, learning_outcomes: outcomes },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Course Syllabus</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Overview
        </label>
        <textarea
          value={formData.syllabus?.overview || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              syllabus: { ...(formData.syllabus || defaultSyllabus), overview: e.target.value },
            })
          }
          placeholder="Provide an overview of what this course covers..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Learning Outcomes</label>
          <button
            onClick={addLearningOutcome}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add Outcome
          </button>
        </div>
        <div className="space-y-2">
          {formData.syllabus?.learning_outcomes?.map((outcome, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={outcome}
                onChange={(e) => updateLearningOutcome(index, e.target.value)}
                placeholder="e.g., Students will be able to solve quadratic equations"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => removeLearningOutcome(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LessonsStep({ formData, setFormData }: StepProps) {
  const addLesson = () => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: '',
      description: '',
      type: 'video',
      duration_minutes: 0,
      order: (formData.lessons?.length || 0) + 1,
      is_locked: false,
    };
    setFormData({
      ...formData,
      lessons: [...(formData.lessons || []), newLesson],
    });
  };

  const updateLesson = (index: number, updates: Partial<Lesson>) => {
    const lessons = [...(formData.lessons || [])];
    lessons[index] = { ...lessons[index], ...updates };
    setFormData({ ...formData, lessons });
  };

  const removeLesson = (index: number) => {
    const lessons = [...(formData.lessons || [])];
    lessons.splice(index, 1);
    // Re-number order fields
    lessons.forEach((l, i) => { l.order = i + 1; });
    setFormData({ ...formData, lessons });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Lessons</h2>
          <p className="text-sm text-gray-500 mt-1">
            {formData.lessons?.length || 0} lesson{formData.lessons?.length !== 1 ? 's' : ''} added
          </p>
        </div>
        <button
          onClick={addLesson}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <PlusIcon className="h-4 w-4" />
          Add Lesson
        </button>
      </div>

      <div className="space-y-4">
        {formData.lessons?.map((lesson, index) => (
          <LessonEditor
            key={lesson.id}
            lesson={lesson}
            index={index}
            onUpdate={(updates) => updateLesson(index, updates)}
            onRemove={() => removeLesson(index)}
          />
        ))}

        {(!formData.lessons || formData.lessons.length === 0) && (
          <div className="text-center py-14 border-2 border-dashed border-gray-200 rounded-xl text-gray-500">
            <p className="font-medium mb-1">No lessons yet</p>
            <p className="text-sm">Click "Add Lesson" above to build your course curriculum.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PricingStep({ formData, setFormData }: StepProps) {
  const isFree = formData.price === 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Pricing & Settings</h2>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isFree}
            onChange={(e) => setFormData({ ...formData, price: e.target.checked ? 0 : 500 })}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            This is a free course
          </span>
        </label>
      </div>

      {!isFree && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <input
              type="number"
              value={formData.price || ''}
              onChange={(e) =>
                setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
              }
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="KES">KES (Kenyan Shilling)</option>
              <option value="USD">USD (US Dollar)</option>
            </select>
          </div>
        </div>
      )}

      {!isFree && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Revenue Sharing</h3>
          <p className="text-sm text-blue-700 mb-3">
            As an external instructor, you'll receive:
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>60%</strong> of course revenue</li>
            <li>• Platform receives 30% for infrastructure</li>
            <li>• Partners receive 10% for referrals</li>
          </ul>
          {(formData.price ?? 0) > 0 && (
            <p className="mt-3 text-sm font-semibold text-blue-900">
              Your earnings per enrollment: KES {((formData.price ?? 0) * 0.6).toFixed(2)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewStep({ formData }: { formData: CourseCreate }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Review Your Course</h2>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Course Title</h3>
          <p className="text-gray-700">{formData.title || 'Not set'}</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700">{formData.description || 'Not set'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Learning Area</h3>
            <p className="text-gray-700">{formData.learning_area}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Grade Levels</h3>
            <p className="text-gray-700">
              {formData.grade_levels?.join(', ') || 'Not set'}
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Lessons ({formData.lessons?.length || 0})
          </h3>
          <div className="space-y-2">
            {formData.lessons?.map((lesson, index) => (
              <div key={lesson.id} className="p-3 bg-gray-50 rounded">
                <p className="font-medium text-gray-900">
                  {index + 1}. {lesson.title}
                </p>
                <p className="text-sm text-gray-600">{lesson.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Pricing</h3>
          <p className="text-gray-700">
            {(formData.price ?? 0) === 0 ? (
              <span className="text-green-600 font-semibold">Free Course</span>
            ) : (
              `${formData.currency} ${(formData.price ?? 0).toFixed(2)}`
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
