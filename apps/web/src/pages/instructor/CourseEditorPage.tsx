/**
 * Course Editor Page - Coursera-style Multi-Step Course Creation Wizard
 *
 * 6-step wizard for creating and editing CBC-aligned courses:
 *   1. Basic Info - Title, description, thumbnail, learning area, grade levels
 *   2. Syllabus  - Overview, learning outcomes, prerequisites
 *   3. Modules & Lessons - Hierarchical module/lesson management
 *   4. Pricing   - Free/paid toggle, price, revenue split info
 *   5. Settings  - Tags, duration, difficulty, language
 *   6. Review    - Summary with publish readiness checklist
 *
 * Features:
 * - Auto-save to draft (debounced)
 * - AI-powered suggestions
 * - Step validation before advancing
 * - Reusable LessonEditor component integration
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  Save, ArrowLeft, ArrowRight, Sparkles, Eye, X, Plus, Trash2,
  CheckCircle, Circle, BookOpen, ListChecks, Layers, DollarSign,
  Settings, ClipboardCheck, ChevronDown, ChevronUp, GripVertical,
} from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../services/api';
import LessonEditor from '../../components/instructor/LessonEditor';
import type { Lesson } from '../../types/course';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ModuleData {
  id: string;
  title: string;
  description: string;
  lessons: LessonData[];
}

interface LessonData extends Lesson {
  content?: string;
  video_url?: string;
}

interface SyllabusData {
  overview: string;
  learning_outcomes: string[];
  prerequisites: string[];
}

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
  currency: string;
  estimated_duration_hours: number;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  syllabus: SyllabusData;
  modules: ModuleData[];
  competencies: string[];
}

type WizardStep = 'basic' | 'syllabus' | 'modules' | 'pricing' | 'settings' | 'review';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const GRADE_LEVELS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
];

const LEARNING_AREAS = [
  'Mathematics', 'English', 'Kiswahili', 'Science and Technology',
  'Social Studies', 'Religious Education', 'Life Skills',
  'Physical Education', 'Creative Arts', 'Health Education',
  'Agriculture', 'Computer Science', 'Music',
];

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const STEPS: { id: WizardStep; label: string; icon: React.ElementType }[] = [
  { id: 'basic', label: 'Basic Info', icon: BookOpen },
  { id: 'syllabus', label: 'Syllabus', icon: ListChecks },
  { id: 'modules', label: 'Modules & Lessons', icon: Layers },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'review', label: 'Review', icon: ClipboardCheck },
];

const inputCls =
  'w-full px-4 py-2.5 bg-white dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#E40000]/50 text-sm';

const cardCls =
  'bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6';

const INITIAL_FORM: CourseFormData = {
  title: '',
  description: '',
  short_description: '',
  thumbnail_url: '',
  grade_levels: [],
  learning_area: '',
  language: 'English',
  difficulty_level: 'Intermediate',
  price: 0,
  currency: 'KES',
  estimated_duration_hours: 0,
  status: 'draft',
  tags: [],
  syllabus: { overview: '', learning_outcomes: [], prerequisites: [] },
  modules: [],
  competencies: [],
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export const CourseEditorPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const isNewCourse = courseId === 'create' || !courseId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');
  const [formData, setFormData] = useState<CourseFormData>(INITIAL_FORM);
  const [tagInput, setTagInput] = useState('');
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  // Load existing course
  useEffect(() => {
    if (!isNewCourse && courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Auto-save draft (debounced 3s)
  useEffect(() => {
    if (isNewCourse || !courseId) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await apiClient.put(`/api/v1/instructor/courses/${courseId}`, buildPayload('draft'));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      } catch {
        // Silent fail for auto-save
      }
    }, 3000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [formData]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/api/v1/instructor/courses/${courseId}`);
      if (data) {
        setFormData({
          ...INITIAL_FORM,
          ...data,
          syllabus: { ...INITIAL_FORM.syllabus, ...(data.syllabus || {}) },
          modules: data.modules || data.syllabus?.modules || [],
          tags: data.tags || [],
          grade_levels: data.grade_levels || [],
          competencies: data.competencies || [],
        });
      }
    } catch {
      alert('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const buildPayload = (status: string) => {
    // Flatten modules into lessons array for backend compatibility
    const allLessons = formData.modules.flatMap((m, mi) =>
      m.lessons.map((l, li) => ({ ...l, order: mi * 100 + li + 1, module_title: m.title }))
    );
    return {
      ...formData,
      status,
      lessons: allLessons,
      syllabus: {
        ...formData.syllabus,
        modules: formData.modules.map((m) => ({
          title: m.title,
          description: m.description,
          lessons_count: m.lessons.length,
        })),
      },
    };
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!formData.title || !formData.description || !formData.learning_area) {
      alert('Please fill in the required fields: Title, Description, and Learning Area');
      setCurrentStep('basic');
      return;
    }
    if (status === 'published' && formData.modules.length === 0) {
      alert('Please add at least one module with lessons before publishing');
      setCurrentStep('modules');
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(status);

      if (!isNewCourse && courseId) {
        await apiClient.put(`/api/v1/instructor/courses/${courseId}`, payload);
      } else {
        await apiClient.post('/api/v1/instructor/courses', payload);
      }

      alert(`Course ${status === 'published' ? 'published' : 'saved'} successfully!`);
      navigate('/dashboard/instructor/courses');
    } catch {
      alert('Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!formData.title && !formData.learning_area) {
      alert('Please enter a course title or select a learning area first');
      return;
    }
    try {
      setGeneratingSuggestions(true);
      const { data } = await apiClient.post('/api/v1/instructor/insights/course-suggestions', {
        title: formData.title,
        learning_area: formData.learning_area,
        grade_levels: formData.grade_levels,
        current_description: formData.description,
      });
      if (data) {
        setFormData((prev) => ({
          ...prev,
          description: data.description || prev.description,
          short_description: data.short_description || prev.short_description,
          tags: data.tags?.length ? data.tags : prev.tags,
        }));
      }
    } catch {
      alert('AI service unavailable. Please try again later.');
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const goNext = () => { if (stepIndex < STEPS.length - 1) setCurrentStep(STEPS[stepIndex + 1].id); };
  const goPrev = () => { if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1].id); };

  // ── Module helpers ──────────────────────────────────────────────────

  const addModule = () => {
    setFormData((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        { id: `mod-${Date.now()}`, title: '', description: '', lessons: [] },
      ],
    }));
  };

  const updateModule = (idx: number, updates: Partial<ModuleData>) => {
    setFormData((prev) => {
      const modules = [...prev.modules];
      modules[idx] = { ...modules[idx], ...updates };
      return { ...prev, modules };
    });
  };

  const removeModule = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== idx),
    }));
  };

  const addLessonToModule = (moduleIdx: number) => {
    setFormData((prev) => {
      const modules = [...prev.modules];
      const mod = { ...modules[moduleIdx] };
      mod.lessons = [
        ...mod.lessons,
        {
          id: `lesson-${Date.now()}`,
          title: '',
          description: '',
          type: 'video' as const,
          duration_minutes: 0,
          order: mod.lessons.length + 1,
          is_locked: false,
        },
      ];
      modules[moduleIdx] = mod;
      return { ...prev, modules };
    });
  };

  const updateLessonInModule = (moduleIdx: number, lessonIdx: number, updates: Partial<LessonData>) => {
    setFormData((prev) => {
      const modules = [...prev.modules];
      const mod = { ...modules[moduleIdx] };
      const lessons = [...mod.lessons];
      lessons[lessonIdx] = { ...lessons[lessonIdx], ...updates };
      mod.lessons = lessons;
      modules[moduleIdx] = mod;
      return { ...prev, modules };
    });
  };

  const removeLessonFromModule = (moduleIdx: number, lessonIdx: number) => {
    setFormData((prev) => {
      const modules = [...prev.modules];
      const mod = { ...modules[moduleIdx] };
      mod.lessons = mod.lessons.filter((_, i) => i !== lessonIdx);
      mod.lessons.forEach((l, i) => { l.order = i + 1; });
      modules[moduleIdx] = mod;
      return { ...prev, modules };
    });
  };

  // ── Syllabus helpers ────────────────────────────────────────────────

  const addOutcome = () => {
    setFormData((prev) => ({
      ...prev,
      syllabus: { ...prev.syllabus, learning_outcomes: [...prev.syllabus.learning_outcomes, ''] },
    }));
  };

  const updateOutcome = (idx: number, value: string) => {
    setFormData((prev) => {
      const outcomes = [...prev.syllabus.learning_outcomes];
      outcomes[idx] = value;
      return { ...prev, syllabus: { ...prev.syllabus, learning_outcomes: outcomes } };
    });
  };

  const removeOutcome = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      syllabus: {
        ...prev.syllabus,
        learning_outcomes: prev.syllabus.learning_outcomes.filter((_, i) => i !== idx),
      },
    }));
  };

  const addPrerequisite = () => {
    setFormData((prev) => ({
      ...prev,
      syllabus: { ...prev.syllabus, prerequisites: [...prev.syllabus.prerequisites, ''] },
    }));
  };

  const updatePrerequisite = (idx: number, value: string) => {
    setFormData((prev) => {
      const prereqs = [...prev.syllabus.prerequisites];
      prereqs[idx] = value;
      return { ...prev, syllabus: { ...prev.syllabus, prerequisites: prereqs } };
    });
  };

  const removePrerequisite = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      syllabus: {
        ...prev.syllabus,
        prerequisites: prev.syllabus.prerequisites.filter((_, i) => i !== idx),
      },
    }));
  };

  // ── Tag helpers ─────────────────────────────────────────────────────

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !formData.tags.includes(t)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, t] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  // ── Publish checklist ───────────────────────────────────────────────

  const checklist = [
    { label: 'Course title', ok: !!formData.title },
    { label: 'Description', ok: !!formData.description },
    { label: 'Learning area selected', ok: !!formData.learning_area },
    { label: 'At least one grade level', ok: formData.grade_levels.length > 0 },
    { label: 'Syllabus overview', ok: !!formData.syllabus.overview },
    { label: 'At least one learning outcome', ok: formData.syllabus.learning_outcomes.filter(Boolean).length > 0 },
    { label: 'At least one module', ok: formData.modules.length > 0 },
    { label: 'Each module has at least one lesson', ok: formData.modules.length > 0 && formData.modules.every((m) => m.lessons.length > 0) },
  ];
  const readyToPublish = checklist.every((c) => c.ok);

  const totalLessons = formData.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  // ── Loading state ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <InstructorPageHeader
        title={isNewCourse ? 'Create New Course' : 'Edit Course'}
        description="Build a CBC-aligned course step by step"
        icon={
          <button
            onClick={() => navigate('/dashboard/instructor/courses')}
            className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-white/60" />
          </button>
        }
        actions={
          <div className="flex items-center gap-3">
            {autoSaved && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Auto-saved
              </span>
            )}
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg transition-colors font-medium text-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={saving || !readyToPublish}
              className="flex items-center gap-2 px-4 py-2 bg-[#E40000] hover:bg-[#C00] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm"
            >
              <Eye className="w-4 h-4" />
              Publish
            </button>
          </div>
        }
      />

      {/* Step Navigation */}
      <div className={cardCls}>
        <nav className="flex items-center justify-between overflow-x-auto">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === stepIndex;
            const isComplete = index < stepIndex;
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col items-center gap-1.5 min-w-[80px] py-2 transition-colors ${
                    isActive
                      ? 'text-[#E40000]'
                      : isComplete
                      ? 'text-green-400'
                      : 'text-gray-400 dark:text-white/40'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isActive
                        ? 'border-[#E40000] bg-[#E40000]/10'
                        : isComplete
                        ? 'border-green-400 bg-green-400/10'
                        : 'border-gray-200 dark:border-[#22272B]'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap">{step.label}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block flex-1 h-0.5 mx-2 ${
                      index < stepIndex ? 'bg-green-400' : 'bg-gray-200 dark:bg-[#22272B]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-3">
          {currentStep === 'basic' && (
            <BasicInfoStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 'syllabus' && (
            <SyllabusStep
              formData={formData}
              addOutcome={addOutcome}
              updateOutcome={updateOutcome}
              removeOutcome={removeOutcome}
              addPrerequisite={addPrerequisite}
              updatePrerequisite={updatePrerequisite}
              removePrerequisite={removePrerequisite}
              setFormData={setFormData}
            />
          )}
          {currentStep === 'modules' && (
            <ModulesStep
              modules={formData.modules}
              addModule={addModule}
              updateModule={updateModule}
              removeModule={removeModule}
              addLessonToModule={addLessonToModule}
              updateLessonInModule={updateLessonInModule}
              removeLessonFromModule={removeLessonFromModule}
            />
          )}
          {currentStep === 'pricing' && (
            <PricingStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 'settings' && (
            <SettingsStep
              formData={formData}
              setFormData={setFormData}
              tagInput={tagInput}
              setTagInput={setTagInput}
              handleAddTag={handleAddTag}
              handleRemoveTag={handleRemoveTag}
            />
          )}
          {currentStep === 'review' && (
            <ReviewStep formData={formData} checklist={checklist} totalLessons={totalLessons} />
          )}

          {/* Step navigation buttons */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={goPrev}
              disabled={stepIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            {stepIndex < STEPS.length - 1 ? (
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#E40000] hover:bg-[#C00] text-white rounded-lg transition-colors text-sm font-medium"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSave('published')}
                disabled={saving || !readyToPublish}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                {saving ? 'Publishing...' : 'Publish Course'}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Course Stats */}
          <div className={cardCls}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Course Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500 dark:text-white/60">
                <span>Modules</span>
                <span className="font-medium text-gray-900 dark:text-white">{formData.modules.length}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-white/60">
                <span>Total Lessons</span>
                <span className="font-medium text-gray-900 dark:text-white">{totalLessons}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-white/60">
                <span>Grade Levels</span>
                <span className="font-medium text-gray-900 dark:text-white">{formData.grade_levels.length}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-white/60">
                <span>Price</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formData.price === 0 ? 'Free' : `KES ${formData.price.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-white/60">
                <span>Status</span>
                <span className={`font-medium ${formData.status === 'published' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {formData.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Assistant */}
          <div className="bg-gradient-to-br from-[#E40000]/10 via-purple-500/10 to-blue-500/10 border border-[#E40000]/20 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E40000]" />
              AI Assistant
            </h3>
            <p className="text-xs text-gray-500 dark:text-white/50 mb-3">
              Generate AI-powered suggestions for descriptions, outcomes, and tags.
            </p>
            <button
              onClick={handleGenerateSuggestions}
              disabled={generatingSuggestions}
              className="w-full px-3 py-2 bg-[#E40000] hover:bg-[#C00] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
            >
              {generatingSuggestions ? 'Generating...' : 'Generate Suggestions'}
            </button>
          </div>

          {/* Publish Checklist */}
          <div className={cardCls}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Publish Checklist</h3>
            <div className="space-y-2">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  {item.ok ? (
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 dark:text-white/20 shrink-0" />
                  )}
                  <span className={item.ok ? 'text-gray-500 dark:text-white/60' : 'text-gray-900 dark:text-white font-medium'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            {readyToPublish && (
              <p className="mt-3 text-xs text-green-400 font-medium">Ready to publish!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== */
/* Step Components                                                     */
/* ================================================================== */

/* ── Step 1: Basic Info ────────────────────────────────────────────── */

function BasicInfoStep({
  formData,
  setFormData,
}: {
  formData: CourseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>;
}) {
  return (
    <div className="space-y-6">
      <div className={cardCls}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-1.5">Course Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g., Introduction to Mathematics - Grade 7"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-1.5">Short Description</label>
            <input
              type="text"
              value={formData.short_description}
              onChange={(e) => setFormData((p) => ({ ...p, short_description: e.target.value }))}
              placeholder="Brief one-line summary (max 120 chars)"
              maxLength={120}
              className={inputCls}
            />
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">{formData.short_description.length}/120</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-1.5">Full Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Detailed description of your course, its goals, and what students will learn..."
              rows={5}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-1.5">Thumbnail URL</label>
            <input
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData((p) => ({ ...p, thumbnail_url: e.target.value }))}
              placeholder="https://example.com/course-image.jpg"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div className={cardCls}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Area & Grade Levels</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-1.5">Learning Area *</label>
            <select
              value={formData.learning_area}
              onChange={(e) => setFormData((p) => ({ ...p, learning_area: e.target.value }))}
              className={inputCls}
            >
              <option value="">Select a learning area</option>
              {LEARNING_AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">Target Grade Levels *</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {GRADE_LEVELS.map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      grade_levels: p.grade_levels.includes(grade)
                        ? p.grade_levels.filter((g) => g !== grade)
                        : [...p.grade_levels, grade],
                    }))
                  }
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    formData.grade_levels.includes(grade)
                      ? 'bg-[#E40000] border-[#E40000] text-white'
                      : 'bg-white dark:bg-[#0F1112] border-gray-200 dark:border-[#22272B] text-gray-500 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step 2: Syllabus ──────────────────────────────────────────────── */

function SyllabusStep({
  formData,
  setFormData,
  addOutcome,
  updateOutcome,
  removeOutcome,
  addPrerequisite,
  updatePrerequisite,
  removePrerequisite,
}: {
  formData: CourseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>;
  addOutcome: () => void;
  updateOutcome: (i: number, v: string) => void;
  removeOutcome: (i: number) => void;
  addPrerequisite: () => void;
  updatePrerequisite: (i: number, v: string) => void;
  removePrerequisite: (i: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className={cardCls}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Overview</h3>
        <textarea
          value={formData.syllabus.overview}
          onChange={(e) =>
            setFormData((p) => ({ ...p, syllabus: { ...p.syllabus, overview: e.target.value } }))
          }
          placeholder="Provide a high-level overview of what students will learn in this course..."
          rows={4}
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className={cardCls}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Outcomes</h3>
          <button
            type="button"
            onClick={addOutcome}
            className="flex items-center gap-1.5 text-sm text-[#E40000] hover:text-[#C00] font-medium"
          >
            <Plus className="w-4 h-4" /> Add Outcome
          </button>
        </div>
        <div className="space-y-2">
          {formData.syllabus.learning_outcomes.map((outcome, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-white/40 w-6 text-center shrink-0">{idx + 1}.</span>
              <input
                type="text"
                value={outcome}
                onChange={(e) => updateOutcome(idx, e.target.value)}
                placeholder="e.g., Students will be able to solve quadratic equations"
                className={`flex-1 ${inputCls}`}
              />
              <button
                type="button"
                onClick={() => removeOutcome(idx)}
                className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {formData.syllabus.learning_outcomes.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-white/40 text-center py-4">
              No learning outcomes yet. Click "Add Outcome" to define what students will learn.
            </p>
          )}
        </div>
      </div>

      <div className={cardCls}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prerequisites</h3>
          <button
            type="button"
            onClick={addPrerequisite}
            className="flex items-center gap-1.5 text-sm text-[#E40000] hover:text-[#C00] font-medium"
          >
            <Plus className="w-4 h-4" /> Add Prerequisite
          </button>
        </div>
        <div className="space-y-2">
          {formData.syllabus.prerequisites.map((prereq, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={prereq}
                onChange={(e) => updatePrerequisite(idx, e.target.value)}
                placeholder="e.g., Basic arithmetic skills"
                className={`flex-1 ${inputCls}`}
              />
              <button
                type="button"
                onClick={() => removePrerequisite(idx)}
                className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {formData.syllabus.prerequisites.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-white/40 text-center py-4">
              No prerequisites. Add any if this course requires prior knowledge.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Step 3: Modules & Lessons ─────────────────────────────────────── */

function ModulesStep({
  modules,
  addModule,
  updateModule,
  removeModule,
  addLessonToModule,
  updateLessonInModule,
  removeLessonFromModule,
}: {
  modules: ModuleData[];
  addModule: () => void;
  updateModule: (i: number, u: Partial<ModuleData>) => void;
  removeModule: (i: number) => void;
  addLessonToModule: (mi: number) => void;
  updateLessonInModule: (mi: number, li: number, u: Partial<LessonData>) => void;
  removeLessonFromModule: (mi: number, li: number) => void;
}) {
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});

  const toggleModule = (idx: number) => {
    setExpandedModules((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Modules & Lessons</h3>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-0.5">
            Organize your course into modules, each containing lessons.
          </p>
        </div>
        <button
          type="button"
          onClick={addModule}
          className="flex items-center gap-2 px-4 py-2 bg-[#E40000] hover:bg-[#C00] text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Module
        </button>
      </div>

      {modules.length === 0 && (
        <div className={`${cardCls} text-center py-12`}>
          <Layers className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-white/60 font-medium mb-1">No modules yet</p>
          <p className="text-sm text-gray-400 dark:text-white/40">
            Click "Add Module" to start building your course curriculum.
          </p>
        </div>
      )}

      {modules.map((mod, mi) => (
        <div key={mod.id} className={`${cardCls} !p-0 overflow-hidden`}>
          {/* Module header */}
          <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 dark:bg-[#0F1112] border-b border-gray-200 dark:border-[#22272B]">
            <GripVertical className="w-4 h-4 text-gray-400 dark:text-white/30 shrink-0 cursor-grab" />
            <span className="text-sm font-bold text-[#E40000] shrink-0">Module {mi + 1}</span>
            <input
              type="text"
              value={mod.title}
              onChange={(e) => updateModule(mi, { title: e.target.value })}
              placeholder="Module title (e.g., Introduction to Algebra)"
              className="flex-1 px-3 py-1.5 bg-transparent border-b border-gray-200 dark:border-[#22272B] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-[#E40000]/50 text-sm font-medium"
            />
            <span className="text-xs text-gray-400 dark:text-white/40 shrink-0">
              {mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={() => removeModule(mi)}
              className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg shrink-0"
              title="Delete module"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toggleModule(mi)}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg shrink-0"
            >
              {expandedModules[mi] === false ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

          {/* Module body */}
          {expandedModules[mi] !== false && (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-white/70 mb-1">Module Description</label>
                <textarea
                  value={mod.description}
                  onChange={(e) => updateModule(mi, { description: e.target.value })}
                  placeholder="Brief description of what this module covers..."
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Lessons */}
              <div className="space-y-3">
                {mod.lessons.map((lesson, li) => (
                  <LessonEditor
                    key={lesson.id}
                    lesson={lesson}
                    index={li}
                    onUpdate={(updates) => updateLessonInModule(mi, li, updates)}
                    onRemove={() => removeLessonFromModule(mi, li)}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => addLessonToModule(mi)}
                className="flex items-center gap-2 w-full px-4 py-2.5 border-2 border-dashed border-gray-200 dark:border-[#22272B] rounded-lg text-gray-500 dark:text-white/50 hover:border-[#E40000]/30 hover:text-[#E40000] transition-colors text-sm font-medium justify-center"
              >
                <Plus className="w-4 h-4" /> Add Lesson to Module
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Step 4: Pricing ───────────────────────────────────────────────── */

function PricingStep({
  formData,
  setFormData,
}: {
  formData: CourseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>;
}) {
  const isFree = formData.price === 0;

  return (
    <div className="space-y-6">
      <div className={cardCls}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Pricing</h3>

        <label className="flex items-center gap-3 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={isFree}
            onChange={(e) => setFormData((p) => ({ ...p, price: e.target.checked ? 0 : 500 }))}
            className="w-5 h-5 rounded border-gray-300 dark:border-[#22272B] text-[#E40000] focus:ring-[#E40000]"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white">This is a free course</span>
        </label>

        {!isFree && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-1.5">Price</label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                min="0"
                step="100"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-1.5">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))}
                className={inputCls}
              >
                <option value="KES">KES (Kenyan Shilling)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {!isFree && (
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-5">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Revenue Sharing (60/30/10)</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
            As an instructor on Urban Home School, revenue is shared as follows:
          </p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white dark:bg-[#181C1F] rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">60%</p>
              <p className="text-xs text-gray-500 dark:text-white/60">Instructor</p>
            </div>
            <div className="bg-white dark:bg-[#181C1F] rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">30%</p>
              <p className="text-xs text-gray-500 dark:text-white/60">Platform</p>
            </div>
            <div className="bg-white dark:bg-[#181C1F] rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">10%</p>
              <p className="text-xs text-gray-500 dark:text-white/60">Partners</p>
            </div>
          </div>
          {formData.price > 0 && (
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              Your earnings per enrollment: {formData.currency} {(formData.price * 0.6).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Step 5: Settings ──────────────────────────────────────────────── */

function SettingsStep({
  formData,
  setFormData,
  tagInput,
  setTagInput,
  handleAddTag,
  handleRemoveTag,
}: {
  formData: CourseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>;
  tagInput: string;
  setTagInput: (v: string) => void;
  handleAddTag: () => void;
  handleRemoveTag: (t: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className={cardCls}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-1.5">Difficulty Level</label>
            <select
              value={formData.difficulty_level}
              onChange={(e) => setFormData((p) => ({ ...p, difficulty_level: e.target.value }))}
              className={inputCls}
            >
              {DIFFICULTY_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-1.5">Language</label>
            <select
              value={formData.language}
              onChange={(e) => setFormData((p) => ({ ...p, language: e.target.value }))}
              className={inputCls}
            >
              <option value="English">English</option>
              <option value="Kiswahili">Kiswahili</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-1.5">Est. Duration (hours)</label>
            <input
              type="number"
              value={formData.estimated_duration_hours || ''}
              onChange={(e) =>
                setFormData((p) => ({ ...p, estimated_duration_hours: parseInt(e.target.value) || 0 }))
              }
              placeholder="e.g., 20"
              min="0"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div className={cardCls}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags & Keywords</h3>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Type a tag and press Enter..."
            className={`flex-1 ${inputCls}`}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2.5 bg-[#E40000] hover:bg-[#C00] text-white rounded-lg text-sm font-medium transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-[#E40000]/10 text-[#E40000] rounded-lg text-sm flex items-center gap-2"
            >
              {tag}
              <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {formData.tags.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-white/40">No tags yet. Tags help students find your course.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Step 6: Review ────────────────────────────────────────────────── */

function ReviewStep({
  formData,
  checklist,
  totalLessons,
}: {
  formData: CourseFormData;
  checklist: { label: string; ok: boolean }[];
  totalLessons: number;
}) {
  return (
    <div className="space-y-6">
      <div className={cardCls}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Review</h3>

        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-white/40 uppercase mb-1">Title</p>
            <p className="text-gray-900 dark:text-white font-semibold text-lg">{formData.title || 'Not set'}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-white/40 uppercase mb-1">Description</p>
            <p className="text-gray-700 dark:text-white/80 text-sm whitespace-pre-wrap">
              {formData.description || 'Not set'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400 dark:text-white/40 mb-0.5">Learning Area</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.learning_area || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-white/40 mb-0.5">Grade Levels</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formData.grade_levels.length > 0 ? formData.grade_levels.join(', ') : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-white/40 mb-0.5">Difficulty</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formData.difficulty_level}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-white/40 mb-0.5">Price</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formData.price === 0 ? 'Free' : `${formData.currency} ${formData.price.toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus summary */}
      <div className={cardCls}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Syllabus</h3>
        {formData.syllabus.overview && (
          <p className="text-sm text-gray-700 dark:text-white/80 mb-3">{formData.syllabus.overview}</p>
        )}
        {formData.syllabus.learning_outcomes.filter(Boolean).length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-400 dark:text-white/40 uppercase mb-1">Learning Outcomes</p>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-white/80 space-y-1">
              {formData.syllabus.learning_outcomes.filter(Boolean).map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modules summary */}
      <div className={cardCls}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Curriculum ({formData.modules.length} modules, {totalLessons} lessons)
        </h3>
        <div className="space-y-3">
          {formData.modules.map((mod, mi) => (
            <div key={mod.id} className="bg-gray-50 dark:bg-[#0F1112] rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Module {mi + 1}: {mod.title || 'Untitled'}
              </p>
              {mod.description && (
                <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">{mod.description}</p>
              )}
              <div className="mt-2 space-y-1">
                {mod.lessons.map((lesson, li) => (
                  <div key={lesson.id} className="flex items-center gap-2 text-xs text-gray-600 dark:text-white/60">
                    <span className="text-gray-400 dark:text-white/30">{li + 1}.</span>
                    <span>{lesson.title || 'Untitled lesson'}</span>
                    <span className="text-gray-300 dark:text-white/20">({lesson.type})</span>
                    {(lesson.duration_minutes ?? 0) > 0 && (
                      <span className="text-gray-300 dark:text-white/20">{lesson.duration_minutes} min</span>
                    )}
                  </div>
                ))}
                {mod.lessons.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-white/30 italic">No lessons in this module</p>
                )}
              </div>
            </div>
          ))}
          {formData.modules.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-white/40 text-center py-4">No modules added yet.</p>
          )}
        </div>
      </div>

      {/* Publish readiness */}
      <div className={cardCls}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Publish Readiness</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              {item.ok ? (
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className={item.ok ? 'text-gray-500 dark:text-white/60' : 'text-gray-900 dark:text-white font-medium'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
        {checklist.every((c) => c.ok) ? (
          <p className="mt-4 text-sm text-green-500 font-semibold">
            Your course is ready to be published!
          </p>
        ) : (
          <p className="mt-4 text-sm text-yellow-500">
            Please complete all checklist items before publishing.
          </p>
        )}
      </div>
    </div>
  );
}
