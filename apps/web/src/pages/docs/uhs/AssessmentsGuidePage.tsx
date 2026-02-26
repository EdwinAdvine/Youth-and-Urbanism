// AssessmentsGuidePage - Comprehensive guide for all assessment types on the UHS platform.
// Covers quizzes, assignments, projects, exams, results, AI feedback, and tips for success.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsImagePlaceholder from '../../../components/docs/DocsImagePlaceholder';

const AssessmentsGuidePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Assessments Guide
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Understand the different assessment types, how to complete them, and how to use feedback to improve your learning.
      </p>

      {/* Table of Contents */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">On this page</h3>
        <nav className="grid sm:grid-cols-2 gap-1">
          {[
            { id: 'types', label: 'Types of Assessments' },
            { id: 'quizzes', label: 'Taking a Quiz' },
            { id: 'assignments', label: 'Submitting an Assignment' },
            { id: 'projects', label: 'Projects' },
            { id: 'exams', label: 'Exams' },
            { id: 'results', label: 'Viewing Results & Grades' },
            { id: 'ai-feedback', label: 'AI-Powered Feedback' },
            { id: 'tips', label: 'Tips for Success' },
          ].map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-sm text-red-600 dark:text-red-400 hover:underline py-0.5"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Types of Assessments */}
      <DocsSection
        id="types"
        title="Types of Assessments"
        description="An overview of the four main assessment types on UHS."
      >
        <p className="mb-4">
          Assessments on Urban Home School are designed to evaluate understanding, reinforce
          learning, and provide meaningful feedback. Each assessment type serves a different
          purpose in your educational journey.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Type</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Format</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Grading</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Typical Duration</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Retakes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-2 font-medium text-green-700 dark:text-green-400">Quiz</td>
                <td className="px-4 py-2">Multiple choice, true/false, short answer</td>
                <td className="px-4 py-2">Automatic</td>
                <td className="px-4 py-2">5-15 minutes</td>
                <td className="px-4 py-2">Usually allowed</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-blue-700 dark:text-blue-400">Assignment</td>
                <td className="px-4 py-2">Written work, file upload, text entry</td>
                <td className="px-4 py-2">Manual by instructor</td>
                <td className="px-4 py-2">Days to weeks</td>
                <td className="px-4 py-2">Resubmission may be allowed</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-purple-700 dark:text-purple-400">Project</td>
                <td className="px-4 py-2">Multi-phase deliverables, presentations</td>
                <td className="px-4 py-2">Manual with milestones</td>
                <td className="px-4 py-2">Weeks to months</td>
                <td className="px-4 py-2">Iterative improvement</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-yellow-700 dark:text-yellow-400">Exam</td>
                <td className="px-4 py-2">Comprehensive, timed, mixed question types</td>
                <td className="px-4 py-2">Automatic + manual</td>
                <td className="px-4 py-2">30-120 minutes</td>
                <td className="px-4 py-2">Usually not allowed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocsSection>

      {/* Taking a Quiz */}
      <DocsSection
        id="quizzes"
        title="Taking a Quiz"
        description="Step-by-step guide for starting, completing, and reviewing quizzes."
      >
        <p className="mb-4">
          Quizzes are the most common assessment type on UHS. They test your understanding
          of specific lessons or modules and provide immediate results.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Starting a quiz:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm mb-4">
          <li>Navigate to the quiz from your course page or "Assessments" section in the sidebar</li>
          <li>Review the quiz details: number of questions, time limit, passing score, and retake policy</li>
          <li>Click "Start Quiz" when you are ready -- the timer begins immediately</li>
        </ol>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">During the quiz:</h4>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Questions are displayed one at a time or all at once (depending on instructor settings)</li>
            <li>A timer in the top-right corner shows your remaining time</li>
            <li>You can flag questions to review later before submitting</li>
            <li>A progress indicator shows how many questions you have answered</li>
            <li>You can navigate between questions freely (unless it is a sequential-only quiz)</li>
          </ul>
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Submitting and results:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm mb-4">
          <li>Review your answers on the summary page before submitting</li>
          <li>Click "Submit Quiz" to finalize -- this action cannot be undone</li>
          <li>Your score is calculated instantly and displayed on the results page</li>
          <li>For each question, see whether your answer was correct and the explanation</li>
          <li>If retakes are allowed, a "Retake Quiz" button will appear below your results</li>
        </ol>
        <DocsImagePlaceholder
          description="Quiz interface showing a multiple-choice question with timer and progress indicator"
          path="/docs/screenshots/assessments-quiz.png"
        />
      </DocsSection>

      {/* Submitting an Assignment */}
      <DocsSection
        id="assignments"
        title="Submitting an Assignment"
        description="How to read instructions, prepare your work, and submit assignments."
      >
        <p className="mb-4">
          Assignments require more in-depth work than quizzes. You submit written responses,
          uploaded files, or both. Assignments are graded manually by your instructor, who
          provides personalized feedback.
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Read Instructions</h4>
              <p className="text-sm">Open the assignment to see the full instructions, rubric, deadline, and acceptable file formats. Read everything carefully before starting.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Prepare Your Work</h4>
              <p className="text-sm">Write your response in the text editor or prepare files to upload. Supported file types include PDF, DOCX, images (PNG/JPG), and ZIP archives.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Upload & Submit</h4>
              <p className="text-sm">Upload your files (max 25MB per file) and/or enter text in the submission box. Click "Submit Assignment" to send your work to the instructor.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">4</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Await Grading</h4>
              <p className="text-sm">Your instructor will review and grade your submission. You will receive a notification when feedback is available.</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Deadline policy:</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Submissions after the deadline may be accepted with a late penalty, depending on the
            instructor's settings. The deadline is shown prominently on the assignment page. Plan
            ahead to avoid last-minute issues.
          </p>
        </div>
        <DocsImagePlaceholder
          description="Assignment submission page with instructions, file upload area, and text editor"
          path="/docs/screenshots/assessments-assignment.png"
        />
      </DocsSection>

      {/* Projects */}
      <DocsSection
        id="projects"
        title="Projects"
        description="Multi-phase work with milestones, checkpoints, and collaboration."
      >
        <p className="mb-4">
          Projects are the most comprehensive assessment type. They span multiple weeks and
          involve producing a substantial piece of work, often with milestones and checkpoints
          along the way.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Milestones</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              Projects are divided into milestones with intermediate deadlines. Each milestone
              may require a deliverable that the instructor reviews before you proceed.
            </p>
          </div>
          <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Checkpoints</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              At checkpoints, you submit your work-in-progress for instructor feedback. This
              allows you to course-correct early rather than discovering issues at the end.
            </p>
          </div>
          <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Collaboration</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              Some projects are group-based. You are assigned to a team and can collaborate
              through the project workspace with shared files and discussion threads.
            </p>
          </div>
          <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Final Submission</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              The final deliverable may include a written report, presentation, code repository,
              creative artifact, or a combination. Grading considers both process and outcome.
            </p>
          </div>
        </div>
      </DocsSection>

      {/* Exams */}
      <DocsSection
        id="exams"
        title="Exams"
        description="Timed, comprehensive assessments that test overall course knowledge."
      >
        <p className="mb-4">
          Exams are high-stakes, timed assessments that evaluate your comprehensive understanding
          of a course or module. They are typically required for certificate eligibility.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Exam features:</h4>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Timed:</strong> A strict timer counts down from the allowed duration. When time expires, your exam is submitted automatically.</li>
            <li><strong>Proctored:</strong> Some exams use browser-based proctoring that detects tab-switching, copy-paste, and screen recording.</li>
            <li><strong>Comprehensive:</strong> Exams cover all material in the course or module, drawing from a question bank.</li>
            <li><strong>Mixed Questions:</strong> Exams may combine multiple choice, short answer, long answer, and matching questions.</li>
            <li><strong>Single Attempt:</strong> Most exams allow only one attempt. Review all answers before submitting.</li>
          </ul>
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Before the exam:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm mb-4">
          <li>Ensure you have a stable internet connection</li>
          <li>Close all unnecessary browser tabs and applications</li>
          <li>If proctored, allow camera and microphone access when prompted</li>
          <li>Review the exam rules on the start page before beginning</li>
        </ul>
        <DocsImagePlaceholder
          description="Exam interface with timer, question navigation panel, and proctoring indicator"
          path="/docs/screenshots/assessments-exam.png"
        />
      </DocsSection>

      {/* Viewing Results & Grades */}
      <DocsSection
        id="results"
        title="Viewing Results & Grades"
        description="Access your assessment scores and detailed feedback."
      >
        <p className="mb-4">
          All your assessment results are available in a centralized grades view. You can see
          scores, feedback, and trends across all your enrolled courses.
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Assessment Results Page</h4>
            <p className="text-sm">After completing any assessment, click "View Results" to see your score, correct answers, and explanations for each question.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Grades Dashboard</h4>
            <p className="text-sm">Navigate to "Grades" in your sidebar to see all assessment scores across courses, with averages and trends over time.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Instructor Feedback</h4>
            <p className="text-sm">For assignments and projects, the instructor provides written comments highlighting strengths, areas for improvement, and actionable suggestions.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Score Breakdown</h4>
            <p className="text-sm">Some assessments show a per-question or per-section breakdown so you can identify exactly where you excelled and where you need more practice.</p>
          </div>
        </div>
      </DocsSection>

      {/* AI-Powered Feedback */}
      <DocsSection
        id="ai-feedback"
        title="AI-Powered Feedback"
        description="The Bird AI provides additional insights on your assessment performance."
      >
        <p className="mb-4">
          Beyond instructor grading, The Bird AI analyzes your assessment results to provide
          personalized learning recommendations. This feedback supplements what your instructor
          provides and helps you focus your study efforts.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Knowledge Gaps</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              The AI identifies topics where you consistently score below expectations and
              suggests specific lessons to revisit.
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Strength Recognition</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              Areas where you excel are highlighted, with recommendations for advanced content
              or challenge exercises to push your understanding further.
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Study Plan</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Based on your results, the AI generates a personalized study plan with specific
              topics to review, practice exercises, and suggested timelines.
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Practice Questions</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              The AI generates additional practice questions tailored to your weak areas so you
              can reinforce learning before the next assessment.
            </p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="AI feedback panel showing knowledge gaps, study plan, and practice recommendations"
          path="/docs/screenshots/assessments-ai-feedback.png"
        />
      </DocsSection>

      {/* Tips for Success */}
      <DocsSection
        id="tips"
        title="Tips for Success"
        description="Best practices for performing well on assessments."
      >
        <p className="mb-4">
          Follow these tips to maximize your assessment performance and get the most out of
          your learning on UHS.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>Complete all lessons first:</strong> Make sure you have studied all the course material before attempting quizzes or exams.</li>
            <li><strong>Review notes and key concepts:</strong> Use the lesson highlights and your own notes to review before an assessment.</li>
            <li><strong>Practice with The Bird AI:</strong> Ask the AI tutor to quiz you on specific topics or explain confusing concepts before the real assessment.</li>
            <li><strong>Manage your time:</strong> For timed assessments, allocate time per question and do not spend too long on any single item.</li>
            <li><strong>Read questions carefully:</strong> Pay attention to keywords like "all," "none," "except," and "best" in multiple choice questions.</li>
            <li><strong>Review before submitting:</strong> Always use the review screen to check your answers before final submission.</li>
            <li><strong>Learn from mistakes:</strong> After receiving results, review every incorrect answer and understand why the correct answer is right.</li>
            <li><strong>Start assignments early:</strong> Do not wait until the last minute. Start early so you have time to research, write, and revise.</li>
            <li><strong>Ask for help:</strong> If you are struggling with a concept, ask your instructor or The Bird AI for additional explanations.</li>
          </ul>
        </div>
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link to="/docs/courses" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Courses
        </Link>
        <Link to="/docs/payments" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Payments
        </Link>
      </div>
    </div>
  );
};

export default AssessmentsGuidePage;
