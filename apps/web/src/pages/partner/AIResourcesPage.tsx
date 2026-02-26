import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Download,
  Share2,
  FileText,
  Clock,
  Lightbulb,
  Wand2,
  ChevronDown,
  BarChart3,
  GraduationCap,
} from 'lucide-react';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface GeneratedResource {
  id: string;
  title: string;
  contentPreview: string;
  wordCount: number;
  difficulty: string;
  duration: string;
  generatedAt: string;
  type: string;
}

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  gradeLevel: string;
  type: string;
  relevance: string;
}

const AIResourcesPage: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [resourceType, setResourceType] = useState('');

  const generatedResources: GeneratedResource[] = [
    {
      id: '1',
      title: 'Climate Change and Its Effects on East Africa',
      contentPreview:
        'This comprehensive lesson explores the impact of climate change on East African ecosystems, covering topics such as deforestation, drought patterns, and sustainable solutions for local communities...',
      wordCount: 2400,
      difficulty: 'Intermediate',
      duration: '25 min read',
      generatedAt: 'Feb 14, 2026',
      type: 'Lesson Plan',
    },
    {
      id: '2',
      title: 'Introduction to Fractions - Interactive Worksheet',
      contentPreview:
        'A set of interactive exercises designed to help Grade 3-4 students understand fractions through visual representations, real-world examples involving Kenyan market scenarios, and progressive difficulty levels...',
      wordCount: 1800,
      difficulty: 'Beginner',
      duration: '15 min activity',
      generatedAt: 'Feb 13, 2026',
      type: 'Worksheet',
    },
    {
      id: '3',
      title: 'The History of Kenya: Pre-Colonial Era',
      contentPreview:
        'An engaging narrative covering the rich history of Kenya before European colonization, including the diverse cultures, trade routes along the East African coast, and the significance of archaeological sites...',
      wordCount: 3100,
      difficulty: 'Advanced',
      duration: '35 min read',
      generatedAt: 'Feb 12, 2026',
      type: 'Study Guide',
    },
    {
      id: '4',
      title: 'Water Cycle Quiz - Grade 5',
      contentPreview:
        'A comprehensive assessment featuring multiple-choice, fill-in-the-blank, and short-answer questions about the water cycle. Includes diagrams and practical examples relevant to Kenyan geography...',
      wordCount: 950,
      difficulty: 'Intermediate',
      duration: '20 min quiz',
      generatedAt: 'Feb 11, 2026',
      type: 'Assessment',
    },
  ];

  const suggestions: AISuggestion[] = [
    {
      id: '1',
      title: 'Digital Safety for Young Learners',
      description:
        'Create an age-appropriate guide on internet safety covering password hygiene, online behavior, and recognizing suspicious content.',
      gradeLevel: 'Grade 4-6',
      type: 'Lesson Plan',
      relevance: 'High demand - 45 searches this week',
    },
    {
      id: '2',
      title: 'Kenyan Wildlife Conservation Project',
      description:
        'A project-based learning resource where students research and present on wildlife conservation efforts in Kenya.',
      gradeLevel: 'Grade 5-7',
      type: 'Project Brief',
      relevance: 'Trending topic - aligns with CBC curriculum',
    },
    {
      id: '3',
      title: 'Financial Literacy Basics',
      description:
        'An introductory module on budgeting, saving, and understanding money using M-Pesa and local market examples.',
      gradeLevel: 'Grade 6-8',
      type: 'Interactive Module',
      relevance: 'Gap identified - no existing content',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      Beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
      Intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      Advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[difficulty] || 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50 border-gray-300 dark:border-white/20';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI-Generated Resources</h1>
          <p className="text-gray-500 dark:text-white/60">
            Generate and manage AI-powered educational content
          </p>
        </motion.div>

        {/* Generate New Resource Section */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-lg bg-red-500/10">
                <Wand2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generate New Resource</h2>
                <p className="text-sm text-gray-400 dark:text-white/40">
                  Use AI to create educational content tailored to your programs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Topic</label>
                <input
                  type="text"
                  placeholder="Enter a topic..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-red-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Grade Level</label>
                <div className="relative">
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="">Select grade</option>
                    <option value="grade-1-3">Grade 1-3</option>
                    <option value="grade-4-6">Grade 4-6</option>
                    <option value="grade-7-8">Grade 7-8</option>
                    <option value="grade-9-12">Grade 9-12</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Resource Type</label>
                <div className="relative">
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="">Select type</option>
                    <option value="lesson-plan">Lesson Plan</option>
                    <option value="worksheet">Worksheet</option>
                    <option value="study-guide">Study Guide</option>
                    <option value="assessment">Assessment</option>
                    <option value="project-brief">Project Brief</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-end">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF4444] transition-colors">
                  <Sparkles className="w-5 h-5" />
                  Generate
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recently Generated */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">Recently Generated</h2>
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
              {generatedResources.map((resource) => (
                <motion.div
                  key={resource.id}
                  variants={fadeUp}
                  className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg p-4 hover:bg-[#2A2F34] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{resource.title}</h3>
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs font-medium rounded-full">
                          {resource.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-white/70 line-clamp-2 mb-3">
                        {resource.contentPreview}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-white/40">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {resource.wordCount.toLocaleString()} words
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(
                          resource.difficulty
                        )}`}
                      >
                        {resource.difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {resource.duration}
                      </span>
                      <span>{resource.generatedAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg transition-colors">
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* AI Suggestions */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Suggestions</h2>
            </div>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  variants={fadeUp}
                  className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg p-4 hover:border-red-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs font-medium rounded-full">
                      {suggestion.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-white/40">
                      <GraduationCap className="w-3 h-3" />
                      {suggestion.gradeLevel}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{suggestion.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-white/70 mb-3">{suggestion.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-[#2A2F34]">
                    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-white/40">
                      <BarChart3 className="w-3 h-3" />
                      {suggestion.relevance}
                    </span>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 rounded-lg transition-colors">
                      <Sparkles className="w-3 h-3" />
                      Generate
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AIResourcesPage;
