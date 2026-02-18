// LearningPathsGuidePage - Comprehensive guide for AI-generated personalized learning paths.
// Covers how paths are generated, viewing and following paths, adaptive learning, CBC alignment,
// sharing with parents, instructor recommendations, and tips.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsImagePlaceholder from '../../../components/docs/DocsImagePlaceholder';

const LearningPathsGuidePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Learning Paths
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        AI-generated personalized learning sequences that adapt to your performance, follow the
        Kenya CBC framework, and guide you through the most effective study progression for
        your grade level.
      </p>

      {/* Table of Contents */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">On this page</h3>
        <nav className="grid sm:grid-cols-2 gap-1">
          {[
            { id: 'what-are-paths', label: 'What are Learning Paths' },
            { id: 'how-generated', label: 'How Paths are Generated' },
            { id: 'viewing', label: 'Viewing Your Learning Path' },
            { id: 'components', label: 'Path Components' },
            { id: 'adaptive', label: 'Adaptive Learning' },
            { id: 'cbc-alignment', label: 'CBC Alignment' },
            { id: 'sharing', label: 'Sharing Paths with Parents' },
            { id: 'instructor-paths', label: 'Instructor-Recommended Paths' },
            { id: 'tips', label: 'Tips for Following Your Path' },
          ].map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline py-0.5"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* What are Learning Paths */}
      <DocsSection
        id="what-are-paths"
        title="What are Learning Paths"
        description="Personalized learning sequences tailored to your unique progress and goals."
      >
        <p className="mb-4">
          Learning Paths are AI-generated study plans that map out the most effective sequence
          of topics, courses, and activities for you to follow. Unlike a fixed syllabus that is
          the same for every student, your learning path is unique to you -- built from your
          actual performance data, interests, and grade level.
        </p>
        <p className="mb-4">
          Think of a learning path as a personalized roadmap for your education. The AI analyzes
          what you know, where you struggle, and what you need to learn next, then creates a
          step-by-step plan that guides you from your current level to your learning goals.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Personalized</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Every path is unique to the student. Two students in the same grade may have
              completely different paths based on their strengths, weaknesses, and learning pace.
            </p>
          </div>
          <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Adaptive</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              Paths continuously adjust as you progress. If you master a topic quickly, the path
              advances. If you struggle, it adds reinforcement activities before moving on.
            </p>
          </div>
          <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">CBC-Aligned</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              All paths follow the Kenya Competency-Based Curriculum framework, ensuring that
              your study plan covers the required learning areas and competencies for your grade.
            </p>
          </div>
          <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/10">
            <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-1">Goal-Oriented</h4>
            <p className="text-sm text-orange-700 dark:text-orange-400">
              Paths include milestone checkpoints that help you track progress toward specific
              goals, such as completing a learning area or preparing for an assessment.
            </p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Learning path overview showing a personalized progression of topics and milestones"
          path="/docs/screenshots/learning-paths-overview.png"
        />
      </DocsSection>

      {/* How Paths are Generated */}
      <DocsSection
        id="how-generated"
        title="How Paths are Generated"
        description="The AI analyzes multiple data points to create your optimal study plan."
      >
        <p className="mb-4">
          The Bird AI uses a combination of performance data, behavioral signals, and curriculum
          requirements to generate your learning path. Here is what the AI considers:
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Quiz and Assessment Scores</h4>
              <p className="text-sm">
                The AI analyzes your performance on quizzes, assignments, and exams to identify
                which topics you have mastered and which need more attention. High scores advance
                your path; lower scores trigger additional practice.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Time Spent on Topics</h4>
              <p className="text-sm">
                How long you spend on different lessons and topics provides insight into
                difficulty levels. Topics where you spend more time may be flagged for extra
                review or alternative explanations.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Conversation Topics</h4>
              <p className="text-sm">
                Questions you ask The Bird AI reveal your interests and areas of curiosity.
                The AI factors these into your path, potentially adding enrichment content in
                areas you find engaging.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-700 dark:text-orange-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Grade Level and Curriculum</h4>
              <p className="text-sm">
                Your grade level determines the baseline curriculum requirements. The AI ensures
                your path covers all required CBC learning areas and competencies for your grade,
                while adding personalized enrichment where appropriate.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Continuous Analysis</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Path generation is not a one-time event. The AI continuously analyzes your progress
            and updates your path in real time. Every quiz you take, every lesson you complete,
            and every question you ask refines your personalized study plan.
          </p>
        </div>
        <DocsImagePlaceholder
          description="Diagram showing data inputs (scores, time, conversations, grade) feeding into path generation"
          path="/docs/screenshots/learning-paths-generation.png"
        />
      </DocsSection>

      {/* Viewing Your Learning Path */}
      <DocsSection
        id="viewing"
        title="Viewing Your Learning Path"
        description="Access your personalized path from the dashboard or dedicated page."
      >
        <p className="mb-4">
          There are multiple ways to view and interact with your learning path:
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Dashboard Widget</h4>
            <p className="text-sm">
              A compact learning path widget is displayed on your student dashboard. It shows
              your current position in the path, the next recommended topic, and your overall
              progress percentage. Click the widget to expand to the full path view.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Dedicated Learning Path Page</h4>
            <p className="text-sm">
              Navigate to "The Bird AI" then "Learning Path" from the sidebar to access the
              full learning path page. This page shows the complete path visualization with all
              topics, milestones, and progress indicators in a scrollable timeline or map view.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Progress Visualization</h4>
            <p className="text-sm">
              The path is displayed as a visual progression -- either a timeline, a stepping-stone
              map, or a tree structure. Completed items are marked with checkmarks, current items
              are highlighted, and upcoming items are shown as future steps. You can see at a glance
              how far you have come and what lies ahead.
            </p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Learning path page with timeline visualization showing completed, current, and upcoming topics"
          path="/docs/screenshots/learning-paths-viewing.png"
        />
      </DocsSection>

      {/* Path Components */}
      <DocsSection
        id="components"
        title="Path Components"
        description="The building blocks that make up your personalized learning path."
      >
        <p className="mb-4">
          Each learning path is made up of several types of components, organized in a sequence
          that maximizes your learning effectiveness.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Recommended Courses</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Courses from the UHS catalog that align with your current learning needs. The AI
              recommends courses based on your grade, performance gaps, and interests. Each
              course includes an explanation of why it was recommended.
            </p>
          </div>
          <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Suggested Topics</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              Specific topics or concepts to study, even outside of enrolled courses. These may
              include AI tutor sessions, reading materials, or external resources that address
              gaps in your knowledge.
            </p>
          </div>
          <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Practice Areas</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              Subjects or skills where the AI has identified room for improvement. Practice areas
              include targeted exercises, quizzes, and problem sets designed to strengthen weak
              spots before advancing.
            </p>
          </div>
          <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/10">
            <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">Milestone Checkpoints</h4>
            <p className="text-sm text-orange-700 dark:text-orange-400">
              Key progress points that mark significant achievements along your path. Reaching a
              milestone may unlock new topics, award badges, or trigger path updates. Milestones
              help you celebrate progress and stay motivated.
            </p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Path detail view showing courses, topics, practice areas, and milestone checkpoints"
          path="/docs/screenshots/learning-paths-components.png"
        />
      </DocsSection>

      {/* Adaptive Learning */}
      <DocsSection
        id="adaptive"
        title="Adaptive Learning"
        description="Your path evolves as you learn, ensuring the perfect challenge level."
      >
        <p className="mb-4">
          One of the most powerful features of learning paths is their adaptive nature. The path
          is not static -- it changes and adjusts based on your ongoing performance.
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Advancing When Ready</h4>
              <p className="text-sm">
                When you score well on assessments and demonstrate mastery of a topic, the AI
                accelerates your path. It skips redundant content and moves you to more advanced
                material sooner.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-700 dark:text-orange-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Reinforcement When Needed</h4>
              <p className="text-sm">
                If you struggle with a topic -- indicated by lower quiz scores, more time spent,
                or repeated questions to The Bird AI -- the path adds extra practice material,
                alternative explanations, and review sessions before moving on.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Identifying Strengths</h4>
              <p className="text-sm">
                The AI identifies subjects and skills where you consistently perform well. These
                strengths are highlighted in your path and may lead to enrichment content,
                advanced challenges, or peer tutoring opportunities.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Flagging Weaknesses</h4>
              <p className="text-sm">
                Areas where you consistently score below expectations are flagged as weaknesses.
                The path prioritizes these areas with targeted practice, ensuring you build a
                solid foundation before advancing to topics that depend on those skills.
              </p>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Adaptive learning visualization showing path adjustments based on student performance"
          path="/docs/screenshots/learning-paths-adaptive.png"
        />
      </DocsSection>

      {/* CBC Alignment */}
      <DocsSection
        id="cbc-alignment"
        title="CBC Alignment"
        description="Learning paths follow the Kenya Competency-Based Curriculum framework."
      >
        <p className="mb-4">
          All learning paths on Urban Home School are aligned with the Kenya Competency-Based
          Curriculum (CBC). This ensures that your personalized study plan covers the required
          learning areas, strands, and sub-strands for your grade level.
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Grade-Appropriate Content</h4>
            <p className="text-sm">
              The AI ensures all content in your path matches your enrolled grade level. A Grade 5
              student will only see Grade 5 CBC content in their primary path, with optional
              enrichment for advanced topics.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Learning Area Coverage</h4>
            <p className="text-sm">
              Your path covers all required CBC learning areas: Mathematics, English, Kiswahili,
              Sciences, Social Studies, Religious Education, Creative Arts and Sports, and more.
              The AI balances your schedule across all areas.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Competency Tracking</h4>
            <p className="text-sm">
              The CBC emphasizes competencies over rote knowledge. Your learning path tracks
              which competencies you have demonstrated and which still need development, ensuring
              a holistic education.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Content Sequencing</h4>
            <p className="text-sm">
              Topics are sequenced according to the CBC framework's recommended progression.
              Prerequisites are automatically identified and placed before advanced topics, so you
              always have the foundational knowledge needed for the next step.
            </p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Learning path showing CBC learning areas with strand and sub-strand organization"
          path="/docs/screenshots/learning-paths-cbc.png"
        />
      </DocsSection>

      {/* Sharing Paths with Parents */}
      <DocsSection
        id="sharing"
        title="Sharing Paths with Parents"
        description="Parents can view their child's learning path and progress."
      >
        <p className="mb-4">
          Parents with linked accounts can view their child's learning path directly from the
          Parent Dashboard. This transparency helps parents stay informed about their child's
          education and provides opportunities for at-home support.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Parent Dashboard Visibility</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              The parent dashboard includes a "Learning Path" section that mirrors the student's
              path view. Parents can see current progress, upcoming topics, completed milestones,
              and areas that need attention.
            </p>
          </div>
          <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Progress Reports</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              Parents receive periodic progress reports summarizing their child's advancement
              through the learning path. Reports highlight achievements, improvement areas, and
              recommendations for additional support.
            </p>
          </div>
        </div>
        <p className="text-sm mb-4">
          For more information on the parent experience, see the{' '}
          <Link to="/docs/parent-guide" className="text-blue-600 dark:text-blue-400 hover:underline">
            Parent Guide
          </Link>.
        </p>
        <DocsImagePlaceholder
          description="Parent dashboard showing their child's learning path progress and report summary"
          path="/docs/screenshots/learning-paths-parent-view.png"
        />
      </DocsSection>

      {/* Instructor-Recommended Paths */}
      <DocsSection
        id="instructor-paths"
        title="Instructor-Recommended Paths"
        description="Instructors can suggest custom paths for their students."
      >
        <p className="mb-4">
          In addition to AI-generated paths, instructors who teach your courses can create and
          recommend custom learning paths for their students. These paths combine the instructor's
          pedagogical expertise with the AI's personalization capabilities.
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Course-Specific Paths</h4>
              <p className="text-sm">
                Instructors can create paths that guide students through their course material in
                a recommended order, with supplementary resources and practice activities included.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Remediation Paths</h4>
              <p className="text-sm">
                When an instructor notices a student struggling with foundational concepts, they
                can assign a remediation path that provides targeted review before the student
                continues with advanced material.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Enrichment Paths</h4>
              <p className="text-sm">
                For advanced students, instructors can recommend enrichment paths that go beyond
                the standard curriculum with challenging topics, research projects, and
                cross-curricular connections.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How Instructor and AI Paths Work Together</h4>
          <p className="text-sm">
            When an instructor assigns a path, it integrates with your AI-generated path. The
            AI respects the instructor's recommendations while still adapting the pacing and
            practice activities to your performance. You may see both your AI path and instructor
            paths in your learning path view, clearly labeled by source.
          </p>
        </div>
        <DocsImagePlaceholder
          description="Learning path showing both AI-generated and instructor-recommended sections"
          path="/docs/screenshots/learning-paths-instructor.png"
        />
      </DocsSection>

      {/* Tips for Following Your Path */}
      <DocsSection
        id="tips"
        title="Tips for Following Your Learning Path"
        description="Make the most of your personalized study plan."
      >
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">1.</span>
              <span><strong>Follow the sequence:</strong> The path is ordered for a reason. Each topic builds on the previous one. Skipping ahead may leave knowledge gaps that make later topics harder.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">2.</span>
              <span><strong>Complete practice areas:</strong> When the path includes practice activities, complete them fully. They exist because the AI detected a need for reinforcement in that topic.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">3.</span>
              <span><strong>Check in daily:</strong> Visit your learning path regularly to see updates. The path refreshes as you make progress, and new recommendations appear based on your latest activity.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">4.</span>
              <span><strong>Celebrate milestones:</strong> When you reach a milestone checkpoint, take a moment to acknowledge your progress. Milestones mark real achievements in your learning journey.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">5.</span>
              <span><strong>Ask The Bird AI about your path:</strong> You can ask the AI tutor to explain why a topic appears in your path, or to suggest ways to tackle a challenging section.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">6.</span>
              <span><strong>Share with your parents:</strong> Encourage your parents to check your learning path from their dashboard. Their involvement and encouragement can boost your motivation.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">7.</span>
              <span><strong>Be patient with practice areas:</strong> If the AI adds extra practice, it means there is an opportunity to strengthen your understanding. Embrace it as a chance to build a stronger foundation.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">8.</span>
              <span><strong>Trust the adaptation:</strong> If your path changes, it is because the AI has learned something new about your progress. The adjustments are designed to keep you on the most effective learning trajectory.</span>
            </li>
          </ul>
        </div>
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link to="/docs/voice-mode" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Voice Mode
        </Link>
        <Link to="/docs/api" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          API Reference &rarr;
        </Link>
      </div>
    </div>
  );
};

export default LearningPathsGuidePage;
