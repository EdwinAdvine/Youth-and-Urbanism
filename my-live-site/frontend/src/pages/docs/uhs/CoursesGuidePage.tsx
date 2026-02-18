// CoursesGuidePage - Comprehensive guide for browsing, enrolling in, and completing courses.
// Covers the catalog, CBC categories, filtering, course details, enrollment, learning experience,
// progress tracking, and certificates.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsImagePlaceholder from '../../../components/docs/DocsImagePlaceholder';

const CoursesGuidePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Courses Guide
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Discover, enroll in, and complete CBC-aligned courses on Urban Home School.
      </p>

      {/* Table of Contents */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">On this page</h3>
        <nav className="grid sm:grid-cols-2 gap-1">
          {[
            { id: 'browsing', label: 'Browsing the Catalog' },
            { id: 'cbc-categories', label: 'CBC Course Categories' },
            { id: 'filtering', label: 'Filtering by Grade Level' },
            { id: 'course-detail', label: 'Course Detail Page' },
            { id: 'enrolling', label: 'Enrolling in a Course' },
            { id: 'learning', label: 'Learning Experience' },
            { id: 'progress', label: 'Progress Tracking' },
            { id: 'completion', label: 'Course Completion & Certificates' },
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

      {/* Browsing the Catalog */}
      <DocsSection
        id="browsing"
        title="Browsing the Catalog"
        description="Search, filter, and discover courses that match your learning goals."
      >
        <p className="mb-4">
          The course catalog is the central hub for finding educational content on UHS. It is
          accessible from the "Courses" section in the sidebar for all user roles. You can browse
          through hundreds of CBC-aligned courses created by verified instructors.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Search and filter options:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm mb-4">
          <li><strong>Keyword Search:</strong> Search by course title, topic, or instructor name using the search bar</li>
          <li><strong>Grade Level:</strong> Filter courses for specific grade levels from Pre-Primary through Grade 12</li>
          <li><strong>Subject / Learning Area:</strong> Filter by CBC learning areas such as Mathematics, Science, or Languages</li>
          <li><strong>Price Range:</strong> Filter by free courses, paid courses, or specific price ranges in KES</li>
          <li><strong>Rating:</strong> Filter by minimum student rating (1 to 5 stars)</li>
          <li><strong>Duration:</strong> Short (under 2 hours), Medium (2-10 hours), or Long (10+ hours)</li>
          <li><strong>Sort By:</strong> Most popular, highest rated, newest, or price (low to high / high to low)</li>
        </ul>
        <DocsImagePlaceholder
          description="Course catalog page with search bar, filter sidebar, and course card grid"
          path="/docs/screenshots/courses-catalog.png"
        />
      </DocsSection>

      {/* CBC Course Categories */}
      <DocsSection
        id="cbc-categories"
        title="CBC Course Categories"
        description="All courses are organized according to Kenya's Competency-Based Curriculum framework."
      >
        <p className="mb-4">
          Urban Home School aligns all course content with the Kenyan CBC framework. Courses are
          tagged with specific learning areas, strands, and sub-strands so you can find content
          that maps directly to the national curriculum.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Learning Area</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Description</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Example Topics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-2 font-medium">Mathematics</td>
                <td className="px-4 py-2">Number sense, algebra, geometry, and data handling</td>
                <td className="px-4 py-2">Fractions, Equations, Area & Perimeter</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Science & Technology</td>
                <td className="px-4 py-2">Biology, chemistry, physics, and technology</td>
                <td className="px-4 py-2">Ecosystems, Chemical Reactions, Electricity</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Languages</td>
                <td className="px-4 py-2">English, Kiswahili, and indigenous languages</td>
                <td className="px-4 py-2">Grammar, Composition, Oral Skills</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Social Studies</td>
                <td className="px-4 py-2">History, geography, citizenship, and governance</td>
                <td className="px-4 py-2">Kenyan History, Map Reading, Government</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Creative Arts</td>
                <td className="px-4 py-2">Music, art, drama, and craft</td>
                <td className="px-4 py-2">Drawing, Music Theory, Drama Performance</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Religious Education</td>
                <td className="px-4 py-2">Christian, Islamic, and Hindu religious education</td>
                <td className="px-4 py-2">Moral Values, Religious Texts, Ethics</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Health Education</td>
                <td className="px-4 py-2">Physical health, nutrition, and well-being</td>
                <td className="px-4 py-2">Hygiene, Nutrition, First Aid</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Agriculture</td>
                <td className="px-4 py-2">Farming practices, food production, and sustainability</td>
                <td className="px-4 py-2">Crop Farming, Animal Husbandry, Soil Science</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocsSection>

      {/* Filtering by Grade Level */}
      <DocsSection
        id="filtering"
        title="Filtering by Grade Level"
        description="Find courses matched to your specific grade in the CBC system."
      >
        <p className="mb-4">
          UHS supports all grade levels within the Kenyan education system. Use the grade filter
          to narrow results to courses designed for your level.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Pre-Primary (PP1 - PP2)</h4>
            <p className="text-sm">Foundation courses for early learners aged 4-5. Focus on play-based learning, language development, and basic numeracy.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Lower Primary (Grade 1 - 3)</h4>
            <p className="text-sm">Core literacy, numeracy, and environmental awareness. Interactive content with visual and audio-rich lessons.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Upper Primary (Grade 4 - 6)</h4>
            <p className="text-sm">Expanded learning areas including science, social studies, and technology. More structured assessments begin here.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Junior Secondary (Grade 7 - 9)</h4>
            <p className="text-sm">Subject specialization begins. Deeper content in sciences, arts, and technical subjects with project-based learning.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Senior Secondary (Grade 10 - 12)</h4>
            <p className="text-sm">Advanced courses in chosen pathways: STEM, Arts & Sports, or Social Sciences. Exam preparation and career guidance.</p>
          </div>
        </div>
      </DocsSection>

      {/* Course Detail Page */}
      <DocsSection
        id="course-detail"
        title="Course Detail Page"
        description="Everything you need to know before enrolling in a course."
      >
        <p className="mb-4">
          Clicking on any course card takes you to the course detail page. This page contains
          all the information you need to decide whether a course is right for you.
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Course Overview</h4>
              <p className="text-sm">Title, description, thumbnail, grade level, learning area tags, and CBC alignment information.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Syllabus</h4>
              <p className="text-sm">A complete outline of all modules and lessons, so you know exactly what will be covered before you enroll.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Instructor Profile</h4>
              <p className="text-sm">The instructor's name, photo, bio, qualifications, and average rating across all their courses.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">4</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Reviews & Ratings</h4>
              <p className="text-sm">Student reviews with star ratings, feedback comments, and an average rating summary.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">5</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Requirements</h4>
              <p className="text-sm">Prerequisites such as grade level, prior courses, or specific skills needed to succeed in the course.</p>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Course detail page showing overview, syllabus, instructor info, and reviews"
          path="/docs/screenshots/courses-detail.png"
        />
      </DocsSection>

      {/* Enrolling in a Course */}
      <DocsSection
        id="enrolling"
        title="Enrolling in a Course"
        description="How to enroll in free and paid courses."
      >
        <p className="mb-4">
          Enrolling in a course is straightforward. Free courses activate instantly, while
          paid courses require a payment step before access is granted.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Free Courses</h4>
            <ol className="list-decimal list-inside text-sm space-y-1 text-green-700 dark:text-green-400">
              <li>Open the course detail page</li>
              <li>Click "Enroll Now -- Free"</li>
              <li>The course is instantly added to "My Courses"</li>
              <li>Start learning right away</li>
            </ol>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Paid Courses</h4>
            <ol className="list-decimal list-inside text-sm space-y-1 text-blue-700 dark:text-blue-400">
              <li>Open the course detail page</li>
              <li>Click "Enroll Now -- KES [price]"</li>
              <li>Select payment method (M-Pesa, wallet, or card)</li>
              <li>Complete the payment process</li>
              <li>The course is added to "My Courses" upon confirmation</li>
            </ol>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Sponsored students:</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            If you are sponsored by a partner organization, course enrollment fees may be covered
            by your sponsor. Check your sponsorship details or contact your parent/guardian to
            confirm coverage.
          </p>
        </div>
        <p className="text-sm mb-4">
          For payment details, see the{' '}
          <Link to="/docs/payments" className="text-red-600 dark:text-red-400 hover:underline">
            Payments Guide
          </Link>.
        </p>
      </DocsSection>

      {/* Learning Experience */}
      <DocsSection
        id="learning"
        title="Learning Experience"
        description="What to expect when taking a course on UHS."
      >
        <p className="mb-4">
          Courses on UHS are designed to provide a rich, interactive learning experience.
          Each course follows a structured path: Modules contain Lessons, and lessons can
          include multiple content types.
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Video Content</h4>
            <p className="text-sm">High-quality video lessons from instructors with captions and playback controls. Pause, rewind, and rewatch at any time.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Text & Rich Media</h4>
            <p className="text-sm">Written content with images, diagrams, formulas, and downloadable resources. Key concepts are highlighted for easy review.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Interactive Exercises</h4>
            <p className="text-sm">Practice activities embedded within lessons: drag-and-drop, fill-in-the-blank, matching, and multiple-choice checks.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">AI Assistance</h4>
            <p className="text-sm">The Bird AI CoPilot is always available while learning. Ask questions, request explanations, or get hints without leaving the lesson.</p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Course learning interface with video player, lesson navigation, and CoPilot sidebar"
          path="/docs/screenshots/courses-learning.png"
        />
      </DocsSection>

      {/* Progress Tracking */}
      <DocsSection
        id="progress"
        title="Progress Tracking"
        description="Monitor your advancement through every course."
      >
        <p className="mb-4">
          UHS automatically tracks your progress as you complete lessons and assessments.
          Progress data is available to you, your parents (if linked), and your instructors.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What is tracked:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Lesson Completion:</strong> Each lesson you finish is marked complete with a checkmark</li>
            <li><strong>Module Progress:</strong> Progress bar for each module showing percentage complete</li>
            <li><strong>Overall Course Progress:</strong> A master progress bar on the course card and detail page</li>
            <li><strong>Time Spent:</strong> Total time spent on each lesson, module, and the course overall</li>
            <li><strong>Assessment Scores:</strong> Grades for all quizzes, assignments, and exams within the course</li>
            <li><strong>Last Activity:</strong> Timestamp of your most recent activity for easy resume</li>
          </ul>
        </div>
        <p className="text-sm mb-4">
          Your progress is saved automatically. You can close the browser and return later to
          continue exactly where you left off.
        </p>
      </DocsSection>

      {/* Course Completion & Certificates */}
      <DocsSection
        id="completion"
        title="Course Completion & Certificates"
        description="Finish your course and earn a verifiable certificate."
      >
        <p className="mb-4">
          When you complete all the required components of a course, you earn a completion
          certificate that you can download, share, and verify online.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Completion requirements:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm mb-4">
          <li>Complete all lessons in every module of the course</li>
          <li>Pass all required quizzes and assignments with the minimum passing score</li>
          <li>Submit any required projects or portfolio items</li>
          <li>Pass the final course assessment (if one exists)</li>
        </ol>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Your certificate includes:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm mb-4">
          <li>Your full name as registered on UHS</li>
          <li>Course title and learning area</li>
          <li>Instructor name and signature</li>
          <li>Date of completion</li>
          <li>Unique certificate ID and QR code for verification</li>
          <li>Partner/sponsor logo (if applicable)</li>
        </ul>
        <p className="text-sm mb-4">
          For more details on certificates, see the{' '}
          <Link to="/docs/certificates" className="text-red-600 dark:text-red-400 hover:underline">
            Certificates Guide
          </Link>.
        </p>
        <DocsImagePlaceholder
          description="Course completion page with certificate preview and download button"
          path="/docs/screenshots/courses-completion.png"
        />
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link to="/docs/partner-guide" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Partner Guide
        </Link>
        <Link to="/docs/assessments" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Assessments
        </Link>
      </div>
    </div>
  );
};

export default CoursesGuidePage;
