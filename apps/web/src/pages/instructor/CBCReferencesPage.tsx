import React, { useState } from 'react';
import { BookOpen, Search, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';

interface CBCCompetency {
  id: string;
  code: string;
  title: string;
  description: string;
  grade_level: string;
  learning_area: string;
  sub_strand?: string;
  specific_outcomes: string[];
  suggested_activities: string[];
  assessment_criteria: string[];
}

export const CBCReferencesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [expandedCompetency, setExpandedCompetency] = useState<string | null>(null);

  // Mock CBC competencies data
  const competencies: CBCCompetency[] = [
    {
      id: '1',
      code: 'MATH-G7-NS-1',
      title: 'Understanding Number Systems',
      description: 'Demonstrate understanding of integers, rational numbers, and their operations',
      grade_level: 'Grade 7',
      learning_area: 'Mathematics',
      sub_strand: 'Number Systems',
      specific_outcomes: [
        'Identify and classify different types of numbers',
        'Perform operations with integers',
        'Apply order of operations in calculations',
        'Solve problems involving rational numbers',
      ],
      suggested_activities: [
        'Number line activities',
        'Real-world problem solving',
        'Calculator-free mental math exercises',
        'Group problem-solving challenges',
      ],
      assessment_criteria: [
        'Correctly identifies number types',
        'Accurately performs calculations',
        'Applies concepts to solve real-world problems',
        'Demonstrates understanding through explanations',
      ],
    },
    {
      id: '2',
      code: 'MATH-G7-ALG-1',
      title: 'Introduction to Algebra',
      description: 'Apply algebraic thinking to solve equations and express patterns',
      grade_level: 'Grade 7',
      learning_area: 'Mathematics',
      sub_strand: 'Algebra',
      specific_outcomes: [
        'Use variables to represent unknown quantities',
        'Simplify algebraic expressions',
        'Solve simple linear equations',
        'Identify and express patterns algebraically',
      ],
      suggested_activities: [
        'Pattern recognition games',
        'Equation solving practice',
        'Real-life algebra applications',
        'Visual algebra with balance scales',
      ],
      assessment_criteria: [
        'Correctly uses variables in expressions',
        'Simplifies expressions accurately',
        'Solves equations systematically',
        'Explains algebraic reasoning clearly',
      ],
    },
    {
      id: '3',
      code: 'ENG-G7-RC-1',
      title: 'Reading Comprehension',
      description: 'Analyze and interpret various text types for meaning and purpose',
      grade_level: 'Grade 7',
      learning_area: 'English',
      sub_strand: 'Reading',
      specific_outcomes: [
        'Identify main ideas and supporting details',
        'Make inferences from context clues',
        'Analyze author\'s purpose and point of view',
        'Compare and contrast different texts',
      ],
      suggested_activities: [
        'Group discussions on texts',
        'Annotation exercises',
        'Comparative text analysis',
        'Comprehension questioning techniques',
      ],
      assessment_criteria: [
        'Identifies key information accurately',
        'Makes logical inferences',
        'Supports analysis with evidence',
        'Compares texts effectively',
      ],
    },
    {
      id: '4',
      code: 'SCI-G8-BIO-1',
      title: 'Cell Structure and Function',
      description: 'Understand the structure and function of plant and animal cells',
      grade_level: 'Grade 8',
      learning_area: 'Science',
      sub_strand: 'Biology',
      specific_outcomes: [
        'Identify parts of plant and animal cells',
        'Describe functions of cell organelles',
        'Compare plant and animal cells',
        'Relate cell structure to function',
      ],
      suggested_activities: [
        'Microscope observations',
        'Cell model construction',
        'Diagram labeling exercises',
        'Virtual cell exploration',
      ],
      assessment_criteria: [
        'Correctly identifies cell parts',
        'Describes functions accurately',
        'Makes valid comparisons',
        'Links structure to function',
      ],
    },
  ];

  const gradelevels = ['all', 'Grade 7', 'Grade 8', 'Grade 9'];
  const learningAreas = ['all', 'Mathematics', 'English', 'Science', 'Social Studies', 'Languages'];

  const filteredCompetencies = competencies.filter((comp) => {
    const matchesSearch =
      comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = selectedGrade === 'all' || comp.grade_level === selectedGrade;
    const matchesArea = selectedArea === 'all' || comp.learning_area === selectedArea;

    return matchesSearch && matchesGrade && matchesArea;
  });

  const toggleExpand = (id: string) => {
    setExpandedCompetency(expandedCompetency === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="CBC Curriculum References"
        description="Browse the Competency-Based Curriculum framework and align your courses"
        icon={<BookOpen className="w-6 h-6 text-purple-400" />}
        actions={
          <a
            href="https://kicd.ac.ke"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            KICD Official
          </a>
        }
      />

      {/* Search and Filters */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300 dark:text-white/40" />
              <input
                type="text"
                placeholder="Search competencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            >
              {gradelevels.map((grade) => (
                <option key={grade} value={grade}>
                  {grade === 'all' ? 'All Grades' : grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            >
              {learningAreas.map((area) => (
                <option key={area} value={area}>
                  {area === 'all' ? 'All Learning Areas' : area}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-white/60">
          {filteredCompetencies.length} competenc{filteredCompetencies.length === 1 ? 'y' : 'ies'}{' '}
          found
        </p>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg transition-colors text-sm">
          <Download className="w-4 h-4" />
          Export All
        </button>
      </div>

      {/* Competencies List */}
      <div className="space-y-3">
        {filteredCompetencies.map((comp) => {
          const isExpanded = expandedCompetency === comp.id;

          return (
            <div
              key={comp.id}
              className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden transition-all"
            >
              {/* Header */}
              <div
                onClick={() => toggleExpand(comp.id)}
                className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs rounded font-mono">
                        {comp.code}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 text-xs rounded">
                        {comp.grade_level}
                      </span>
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-300 text-xs rounded">
                        {comp.learning_area}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{comp.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-white/70">{comp.description}</p>
                    {comp.sub_strand && (
                      <p className="text-xs text-gray-400 dark:text-white/50 mt-1">Sub-strand: {comp.sub_strand}</p>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-500 dark:text-white/60 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-200 dark:border-white/10">
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Specific Learning Outcomes</h4>
                    <ul className="space-y-1.5">
                      {comp.specific_outcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-white/80">
                          <span className="text-purple-400 mt-0.5">•</span>
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Suggested Learning Activities</h4>
                    <ul className="space-y-1.5">
                      {comp.suggested_activities.map((activity, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-white/80">
                          <span className="text-green-400 mt-0.5">•</span>
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Assessment Criteria</h4>
                    <ul className="space-y-1.5">
                      {comp.assessment_criteria.map((criterion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-white/80">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-colors text-sm">
                      Use in Course
                    </button>
                    <button className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg transition-colors text-sm">
                      Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredCompetencies.length === 0 && (
          <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-white/60">No competencies found matching your search</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-purple-200 mb-2">About the CBC Framework</h4>
        <p className="text-sm text-purple-200/80 mb-3">
          The Competency-Based Curriculum (CBC) is Kenya's educational framework that focuses on
          developing learner competencies rather than just knowledge acquisition. It emphasizes
          practical skills, values, and the ability to apply knowledge in real-world contexts.
        </p>
        <ul className="text-sm text-purple-200/80 space-y-1 list-disc list-inside">
          <li>Use these references to align your courses with official CBC standards</li>
          <li>Click "Use in Course" to auto-tag your course with relevant competencies</li>
          <li>
            CBC alignment scores above 80% significantly boost course visibility and credibility
          </li>
          <li>Download PDFs for offline reference or to share with your team</li>
        </ul>
      </div>
    </div>
  );
};
