import React, { useState } from 'react';
import { Sparkles, Copy, Star, Wand2, Search, Plus } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  prompt_text: string;
  variables: string[];
  is_favorite: boolean;
  use_count: number;
}

export const AIPromptsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [, setShowCreateForm] = useState(false);

  // Mock prompt templates
  const templates: PromptTemplate[] = [
    {
      id: '1',
      title: 'Course Outline Generator',
      description: 'Generate a comprehensive course outline for any subject and grade level',
      category: 'Course Design',
      prompt_text:
        'Create a detailed course outline for {subject} at {grade_level}. Include: 1) Course objectives aligned with CBC, 2) Weekly modules with topics, 3) Learning activities, 4) Assessment methods, 5) Required resources. Format as a structured markdown document.',
      variables: ['subject', 'grade_level'],
      is_favorite: true,
      use_count: 45,
    },
    {
      id: '2',
      title: 'Assessment Question Writer',
      description: 'Generate diverse assessment questions for any topic',
      category: 'Assessment',
      prompt_text:
        'Generate {num_questions} {question_type} questions for {topic} at {difficulty} level. Include: 1) Clear, unambiguous questions, 2) Answer keys with explanations, 3) CBC competency alignment, 4) Marking rubric. Ensure questions test understanding, not just recall.',
      variables: ['num_questions', 'question_type', 'topic', 'difficulty'],
      is_favorite: false,
      use_count: 32,
    },
    {
      id: '3',
      title: 'Lesson Plan Builder',
      description: 'Create detailed lesson plans with activities and timing',
      category: 'Lesson Planning',
      prompt_text:
        'Create a {duration}-minute lesson plan for {topic} in {subject} for {grade_level}. Include: 1) Learning objectives, 2) Introduction activity (5 min), 3) Main lesson with activities, 4) Assessment strategy, 5) Differentiation for diverse learners, 6) Materials needed. Follow CBC guidelines.',
      variables: ['duration', 'topic', 'subject', 'grade_level'],
      is_favorite: true,
      use_count: 28,
    },
    {
      id: '4',
      title: 'Student Feedback Generator',
      description: 'Generate personalized feedback for student work',
      category: 'Feedback',
      prompt_text:
        'Write constructive feedback for a student who {performance_description} on {assignment_type} about {topic}. Include: 1) Positive reinforcement of strengths, 2) Specific areas for improvement, 3) Actionable next steps, 4) Encouraging tone. Keep it {tone} and around {word_count} words.',
      variables: ['performance_description', 'assignment_type', 'topic', 'tone', 'word_count'],
      is_favorite: false,
      use_count: 18,
    },
    {
      id: '5',
      title: 'Learning Activity Designer',
      description: 'Create engaging learning activities for your lessons',
      category: 'Lesson Planning',
      prompt_text:
        'Design {num_activities} engaging learning activities for {topic} in {subject} for {grade_level}. Each activity should: 1) Align with CBC competencies, 2) Include clear instructions, 3) Specify materials needed, 4) Estimate time required, 5) Accommodate different learning styles. Focus on {activity_type} activities.',
      variables: ['num_activities', 'topic', 'subject', 'grade_level', 'activity_type'],
      is_favorite: false,
      use_count: 22,
    },
    {
      id: '6',
      title: 'CBC Competency Mapper',
      description: 'Map your content to CBC competencies',
      category: 'CBC Alignment',
      prompt_text:
        'Analyze this {content_type}: "{content_description}" and map it to relevant CBC competencies for {grade_level} in {learning_area}. Provide: 1) Specific competency codes, 2) Alignment explanation, 3) Suggestions to strengthen alignment, 4) Missing competencies to consider adding.',
      variables: ['content_type', 'content_description', 'grade_level', 'learning_area'],
      is_favorite: true,
      use_count: 15,
    },
  ];

  const categories = [
    'all',
    'Course Design',
    'Lesson Planning',
    'Assessment',
    'Feedback',
    'CBC Alignment',
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setGeneratedPrompt('');
    const initialValues: Record<string, string> = {};
    template.variables.forEach((variable) => {
      initialValues[variable] = '';
    });
    setVariableValues(initialValues);
  };

  const handleGeneratePrompt = () => {
    if (!selectedTemplate) return;

    let prompt = selectedTemplate.prompt_text;
    selectedTemplate.variables.forEach((variable) => {
      const value = variableValues[variable] || `[${variable}]`;
      prompt = prompt.replace(new RegExp(`{${variable}}`, 'g'), value);
    });

    setGeneratedPrompt(prompt);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    alert('Prompt copied to clipboard!');
  };

  const handleUseWithAI = async () => {
    if (!generatedPrompt) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_URL}/api/v1/ai-tutor/chat`,
        {
          message: generatedPrompt,
          task_type: 'general',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Open result in a modal or redirect to AI interface
      console.log('AI Response:', response.data);
      alert('AI is processing your request. Check the AI interface for results.');
    } catch (error) {
      console.error('Error using AI:', error);
      alert('Failed to send prompt to AI');
    }
  };

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="AI Prompts & Templates"
        description="Pre-built prompt templates to supercharge your AI-assisted teaching"
        icon={<Sparkles className="w-6 h-6 text-purple-400" />}
        actions={
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300 dark:text-white/40" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Template List */}
            <div className="max-h-[600px] overflow-y-auto">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`p-4 border-b border-gray-200 dark:border-white/10 cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'bg-purple-500/10'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{template.title}</h4>
                    {template.is_favorite && (
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white/60 mb-2">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-300">{template.category}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">{template.use_count} uses</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prompt Builder */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedTemplate.title}</h3>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                    <Star
                      className={`w-5 h-5 ${
                        selectedTemplate.is_favorite
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-500 dark:text-white/60'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-white/70">{selectedTemplate.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Fill in Variables</h4>
                <div className="space-y-3">
                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-sm text-gray-600 dark:text-white/80 mb-1 capitalize">
                        {variable.replace(/_/g, ' ')}
                      </label>
                      <input
                        type="text"
                        value={variableValues[variable] || ''}
                        onChange={(e) =>
                          setVariableValues({ ...variableValues, [variable]: e.target.value })
                        }
                        placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGeneratePrompt}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors w-full justify-center"
              >
                <Wand2 className="w-4 h-4" />
                Generate Prompt
              </button>

              {generatedPrompt && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Generated Prompt</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyPrompt}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg transition-colors text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                      <button
                        onClick={handleUseWithAI}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-colors text-sm"
                      >
                        <Sparkles className="w-4 h-4" />
                        Use with AI
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg">
                    <p className="text-sm text-gray-800 dark:text-white/90 whitespace-pre-wrap">{generatedPrompt}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-white/60">Select a template to get started</p>
              <p className="text-sm text-gray-400 dark:text-gray-300 dark:text-white/40 mt-2">
                Choose from the list on the left or create your own custom template
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-purple-200 mb-2">How to Use AI Prompts</h4>
            <ul className="text-sm text-purple-200/80 space-y-1 list-disc list-inside">
              <li>Select a template that matches your task (course design, assessment, etc.)</li>
              <li>Fill in the variables with your specific details</li>
              <li>Click "Generate Prompt" to create your customized AI prompt</li>
              <li>Use "Copy" to paste into any AI tool, or "Use with AI" to run directly</li>
              <li>
                Save frequently used prompts as favorites for quick access
              </li>
              <li>Create custom templates for recurring tasks to streamline your workflow</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
