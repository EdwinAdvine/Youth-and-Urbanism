// CertificatesGuidePage - Comprehensive guide for certificates on the UHS platform.
// Covers what certificates are, earning requirements, viewing, details, downloading,
// sharing, validation, and types of certificates.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsImagePlaceholder from '../../../components/docs/DocsImagePlaceholder';

const CertificatesGuidePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Certificates Guide
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Earn, download, share, and verify certificates for your learning achievements on Urban Home School.
      </p>

      {/* Table of Contents */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">On this page</h3>
        <nav className="grid sm:grid-cols-2 gap-1">
          {[
            { id: 'what-are', label: 'What Are Certificates?' },
            { id: 'earning', label: 'Earning a Certificate' },
            { id: 'viewing', label: 'Viewing Certificates' },
            { id: 'details', label: 'Certificate Details' },
            { id: 'downloading', label: 'Downloading & Sharing' },
            { id: 'validation', label: 'Certificate Validation' },
            { id: 'types', label: 'Types of Certificates' },
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

      {/* What Are Certificates? */}
      <DocsSection
        id="what-are"
        title="What Are Certificates?"
        description="Recognizing your learning achievements on UHS."
      >
        <p className="mb-4">
          Certificates on Urban Home School are digital credentials that formally recognize
          your completion of courses, mastery of skills, and achievement of learning milestones.
          They serve as proof of your educational accomplishments and can be shared with schools,
          employers, and family members.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Credible Recognition</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Every certificate is issued with a unique ID and QR code, making it verifiable by
              anyone through the UHS public verification page.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Portfolio Building</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Collect certificates across courses and learning areas to build a comprehensive
              learning portfolio that showcases your educational journey.
            </p>
          </div>
        </div>
      </DocsSection>

      {/* Earning a Certificate */}
      <DocsSection
        id="earning"
        title="Earning a Certificate"
        description="What you need to complete to receive a certificate."
      >
        <p className="mb-4">
          Certificates are not awarded automatically when you start a course. You must meet
          specific completion requirements set by the course instructor. These requirements
          ensure that the certificate represents genuine learning.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Requirements:</h4>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Complete All Lessons</h4>
              <p className="text-sm">You must complete every lesson in every module of the course. Skipped lessons count against completion even if you pass the final assessment.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Pass the Final Assessment</h4>
              <p className="text-sm">Complete and pass the course's final quiz, exam, or project. The passing score is set by the instructor (typically 60-80%).</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Meet Minimum Score</h4>
              <p className="text-sm">Your overall course grade (average of all assessments) must meet the minimum threshold. This is displayed on the course detail page before you enroll.</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Typical completion requirements:</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Requirement</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Typical Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-2">Lesson completion</td>
                  <td className="px-4 py-2">100% of all lessons</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Quiz average</td>
                  <td className="px-4 py-2">60% or higher</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Assignment submissions</td>
                  <td className="px-4 py-2">All required assignments submitted and graded</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Final assessment</td>
                  <td className="px-4 py-2">70% or higher (varies by course)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Note:</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            If you do not meet the requirements on your first attempt, you can retake assessments
            (if the instructor allows retakes) and continue completing lessons until all requirements
            are satisfied. Your certificate is generated automatically once all conditions are met.
          </p>
        </div>
      </DocsSection>

      {/* Viewing Certificates */}
      <DocsSection
        id="viewing"
        title="Viewing Certificates"
        description="Access your earned certificates from your dashboard."
      >
        <p className="mb-4">
          All your earned certificates are stored in a certificate gallery accessible from
          your dashboard. You can view, download, and share any certificate at any time.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Where to find your certificates:</h4>
        <div className="space-y-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Dashboard Widget</h4>
            <p className="text-sm">Your most recent certificates are shown on the dashboard in the "Achievements" or "Certificates" widget with a "View All" link.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Certificate Gallery</h4>
            <p className="text-sm">Navigate to "Certificates" in your sidebar to view your complete certificate collection. Filter by course, date, or learning area.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Course Page</h4>
            <p className="text-sm">On a completed course page, a certificate badge appears with a direct link to view and download the certificate for that specific course.</p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Certificate gallery showing earned certificates with thumbnail previews"
          path="/docs/screenshots/certificates-gallery.png"
        />
      </DocsSection>

      {/* Certificate Details */}
      <DocsSection
        id="details"
        title="Certificate Details"
        description="What information is included on every UHS certificate."
      >
        <p className="mb-4">
          Each certificate is a professionally designed document that contains all the
          information needed to verify your achievement. Here is what appears on every
          UHS certificate:
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Student Name</h4>
              <p className="text-sm">Your full name as registered on your UHS account. Make sure your profile name is correct before earning certificates.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Course Name</h4>
              <p className="text-sm">The full title of the completed course, including the learning area and grade level.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Instructor Name</h4>
              <p className="text-sm">The name of the instructor who created and taught the course, along with their digital signature.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">4</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Date of Completion</h4>
              <p className="text-sm">The date when you met all the course requirements and the certificate was issued.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">5</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Unique Certificate ID</h4>
              <p className="text-sm">A unique alphanumeric ID (e.g., UHS-CERT-2026-ABC123) that can be used to verify the certificate's authenticity.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">6</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">QR Code</h4>
              <p className="text-sm">A scannable QR code that links directly to the certificate verification page, allowing anyone to confirm its validity.</p>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Certificate detail view showing all fields: name, course, instructor, date, ID, and QR code"
          path="/docs/screenshots/certificates-detail.png"
        />
      </DocsSection>

      {/* Downloading & Sharing */}
      <DocsSection
        id="downloading"
        title="Downloading & Sharing"
        description="Save your certificates as PDF and share them on social media."
      >
        <p className="mb-4">
          Certificates can be downloaded for offline use and shared directly on social media
          platforms to showcase your achievements.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Download as PDF</h4>
            <ol className="list-decimal list-inside text-sm space-y-1 text-blue-700 dark:text-blue-400">
              <li>Open the certificate from your gallery</li>
              <li>Click the "Download PDF" button</li>
              <li>A high-resolution PDF is saved to your device</li>
              <li>Print it or attach it to emails and applications</li>
            </ol>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Share on Social Media</h4>
            <ol className="list-decimal list-inside text-sm space-y-1 text-purple-700 dark:text-purple-400">
              <li>Open the certificate from your gallery</li>
              <li>Click the "Share" button</li>
              <li>Choose a platform: LinkedIn, Twitter/X, Facebook, or WhatsApp</li>
              <li>A pre-formatted post with your certificate image and verification link is created</li>
            </ol>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Additional sharing options:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Copy Link:</strong> Copy a public verification URL to share via any messaging app or email</li>
            <li><strong>Embed Code:</strong> Get an HTML embed code to display the certificate on your website or blog</li>
            <li><strong>Email:</strong> Send the certificate directly via email from the UHS platform</li>
          </ul>
        </div>
      </DocsSection>

      {/* Certificate Validation */}
      <DocsSection
        id="validation"
        title="Certificate Validation"
        description="How anyone can verify the authenticity of a UHS certificate."
      >
        <p className="mb-4">
          Every UHS certificate can be verified by third parties to confirm its authenticity.
          This ensures that certificates are trustworthy and cannot be forged.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Verification methods:</h4>
        <div className="space-y-3 mb-4">
          <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Public Verification Page</h4>
            <p className="text-sm text-green-700 dark:text-green-400 mb-2">
              Anyone can visit the verification page at <code className="bg-green-100 dark:bg-green-900/30 px-1 py-0.5 rounded text-xs">/certificates/verify</code> and
              enter the certificate ID (e.g., UHS-CERT-2026-ABC123) to confirm its validity.
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
              The verification page displays the student name, course, instructor, and date --
              confirming the certificate is genuine and was issued by UHS.
            </p>
          </div>
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">QR Code Scanning</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Each certificate includes a QR code. When scanned with any smartphone camera or QR
              reader, it opens the verification page directly in the browser, pre-populated with
              the certificate details. This is the fastest way to verify a printed certificate.
            </p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Certificate verification page showing certificate ID entry and verified result"
          path="/docs/screenshots/certificates-verification.png"
        />
      </DocsSection>

      {/* Types of Certificates */}
      <DocsSection
        id="types"
        title="Types of Certificates"
        description="Different certificate types awarded on UHS."
      >
        <p className="mb-4">
          UHS awards several types of certificates to recognize different levels of achievement
          and engagement. Each type has its own design and criteria.
        </p>
        <div className="space-y-4 mb-4">
          <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/10">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Course Completion Certificate</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">
              The standard certificate awarded when you complete all requirements of a course. This
              is the most common certificate type on UHS.
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
              <li>Awarded per course upon meeting all completion requirements</li>
              <li>Includes course name, grade, and CBC learning area</li>
              <li>Features the instructor's digital signature</li>
            </ul>
          </div>
          <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Achievement Badges</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400 mb-2">
              Digital badges awarded for specific milestones and accomplishments beyond course
              completion. These appear in your profile and can be shared.
            </p>
            <ul className="list-disc list-inside text-sm text-purple-700 dark:text-purple-400 space-y-1">
              <li><strong>First Course:</strong> Complete your first course on UHS</li>
              <li><strong>Perfect Score:</strong> Score 100% on any assessment</li>
              <li><strong>Streak Master:</strong> Log in and study for 30 consecutive days</li>
              <li><strong>Helpful Peer:</strong> Have 10 forum answers marked as solutions</li>
              <li><strong>Quick Learner:</strong> Complete a course in under one week</li>
            </ul>
          </div>
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Specialization Path Certificate</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
              A premium certificate awarded when you complete a curated series of related courses
              that together form a specialization path.
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>Requires completing 3-5 related courses in a learning area</li>
              <li>Examples: "Mathematics Foundations (Grade 7-9)," "Science Explorer," "English Language Mastery"</li>
              <li>Demonstrates deeper expertise than individual course certificates</li>
              <li>Features a unique specialization design and the UHS seal</li>
            </ul>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Certificate design:</h4>
          <p className="text-sm mb-2">
            All certificates feature a professional design with the UHS branding, a unique
            border pattern based on the certificate type, and both the instructor's and the
            platform's digital signatures.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Course Completion certificates have a gold border</li>
            <li>Achievement badges feature colorful, icon-based designs</li>
            <li>Specialization certificates have a blue-and-gold premium design with the UHS seal</li>
          </ul>
        </div>
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link to="/docs/store" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Store
        </Link>
        <Link to="/docs/ai-tutor" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          AI Tutor
        </Link>
      </div>
    </div>
  );
};

export default CertificatesGuidePage;
