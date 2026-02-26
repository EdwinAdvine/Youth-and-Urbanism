// FAQPage - Frequently Asked Questions organized by category.
// Covers general, accounts, courses, AI tutor, payments, and technical questions.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../components/docs/DocsSection';

const FAQPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Frequently Asked Questions
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Find answers to the most common questions about Urban Home School. Can't find what
        you're looking for? Contact our support team for help.
      </p>

      {/* Quick Navigation */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Jump to a category:</h4>
        <div className="flex flex-wrap gap-2">
          <a href="#general" className="text-sm px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            General
          </a>
          <a href="#accounts" className="text-sm px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            Accounts
          </a>
          <a href="#courses" className="text-sm px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            Courses
          </a>
          <a href="#ai-tutor" className="text-sm px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            AI Tutor
          </a>
          <a href="#payments" className="text-sm px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            Payments
          </a>
          <a href="#technical" className="text-sm px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            Technical
          </a>
        </div>
      </div>

      {/* General */}
      <DocsSection
        id="general"
        title="General"
        description="Common questions about the Urban Home School platform."
      >
        <div className="space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              What is Urban Home School?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Urban Home School (UHS) is a comprehensive educational platform designed for Kenyan
              children and families. It delivers CBC-aligned courses, AI-powered tutoring through
              The Bird AI, community forums, and integrated payment systems including M-Pesa. UHS
              supports multiple user roles including students, parents, instructors, admins,
              partners, and staff.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Who is Urban Home School for?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              UHS is built for Kenyan learners from pre-primary through Grade 12, their parents
              and guardians, certified instructors who want to create and sell courses, education
              partners who sponsor students, and administrators who manage the platform. Whether
              you are supplementing school learning or homeschooling entirely, UHS has tools for you.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Is Urban Home School free to use?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              UHS offers both free and paid content. Creating an account, browsing courses, using
              the community forum, and accessing basic AI tutoring are free. Premium courses
              created by instructors may have a fee, and advanced AI features such as voice and
              video responses may count toward usage limits on free-tier accounts.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              What devices can I use to access UHS?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              UHS is a web-based platform that works on any device with a modern web browser.
              This includes desktop computers, laptops, tablets, and smartphones. The interface
              is fully responsive and adapts to your screen size. We recommend using Chrome,
              Firefox, Safari, or Edge for the best experience.
            </p>
          </div>

          <div className="pb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Is an internet connection required?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Yes, an active internet connection is required to access UHS. However, we are
              working on offline capabilities through service workers that will allow you to
              access previously loaded course content without a connection. AI tutoring and
              real-time features like the forum always require an internet connection.
            </p>
          </div>
        </div>
      </DocsSection>

      {/* Accounts */}
      <DocsSection
        id="accounts"
        title="Accounts"
        description="Questions about registration, profiles, and account management."
      >
        <div className="space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              How do I sign up for an account?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Visit the signup page and select your role (Student, Parent, Instructor, or Partner).
              Fill in your name, email address, and create a password. You will receive a
              verification email to confirm your account. Once verified, you can log in and access
              your role-specific dashboard. See the{' '}
              <Link to="/docs/getting-started" className="text-red-600 dark:text-red-400 hover:underline">
                Getting Started guide
              </Link>{' '}
              for detailed instructions.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              I forgot my password. How do I reset it?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Click "Forgot Password" on the login page and enter your registered email address.
              You will receive an email with a password reset link valid for 1 hour. Click the
              link, set a new password, and log in with your new credentials. If you do not
              receive the email, check your spam folder or contact support.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Can I change my account role?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Role changes must be requested through the support team or an administrator.
              For example, if you signed up as a parent but want to also become an instructor,
              you would submit an instructor application. Admins can update user roles from the
              admin dashboard. Note that role changes may affect your access to certain features
              and dashboard views.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              How do I delete my account?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              You can request account deletion from your account settings page or by contacting
              our support team. Account deletion is a soft delete -- your data is retained for
              30 days in case you change your mind, after which it is permanently removed.
              This process complies with data protection regulations including Kenya's Data
              Protection Act.
            </p>
          </div>

          <div className="pb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Can I have multiple children on one parent account?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Yes. Parent accounts can link multiple children. From your parent dashboard, click
              "Add Child" to either create a new student account or link an existing student
              account using their email address. You can view each child's progress, manage
              their subscriptions, and receive consolidated reports from a single dashboard.
            </p>
          </div>
        </div>
      </DocsSection>

      {/* Courses */}
      <DocsSection
        id="courses"
        title="Courses"
        description="Questions about course enrollment, completion, and certificates."
      >
        <div className="space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              How do I enroll in a course?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Browse the course catalog from your dashboard sidebar, use filters to find courses
              by grade level or subject, and click on a course to see its details. Click the
              "Enroll" button to join. Free courses enroll you instantly. Paid courses will
              prompt you to complete payment via M-Pesa, PayPal, Stripe, or your wallet balance.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              What is the difference between free and paid courses?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Free courses provide full access to all lessons and assessments at no cost. Paid
              courses are premium content created by certified instructors and may include
              additional resources, project-based learning, live sessions, and personalized
              instructor feedback. Course pricing is set by the instructor and displayed in
              Kenyan Shillings (KES).
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              How long do I have to complete a course?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Most courses on UHS are self-paced, meaning you can complete them at your own
              speed without a deadline. Some courses with live session components may have
              scheduled dates. Once enrolled, you have lifetime access to the course materials
              unless the course is removed from the platform.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              How do I get a certificate after completing a course?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Certificates are issued automatically when you complete all course modules and
              pass the final assessment (if applicable). Your certificate appears in the
              Certificates section of your dashboard. You can download it as a PDF, share it
              with a public validation link, or use the QR code for third-party verification.
            </p>
          </div>

          <div className="pb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              A course is not loading. What should I do?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              First, check your internet connection and try refreshing the page. Clear your
              browser cache and cookies if the issue persists. Try using a different browser
              or device. If the course still does not load, the issue may be on our end --
              please report it through the "Report a Bug" option in your settings or contact
              support with the course name and a screenshot of the error.
            </p>
          </div>
        </div>
      </DocsSection>

      {/* AI Tutor */}
      <DocsSection
        id="ai-tutor"
        title="AI Tutor"
        description="Questions about The Bird AI tutoring system."
      >
        <div className="space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              What is The Bird AI?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              The Bird AI is the intelligent tutoring system built into UHS. It uses a multi-AI
              orchestration engine to provide personalized educational support. You can access it
              through the full-screen AI Tutor chat interface for deep learning sessions, or
              through the CoPilot sidebar available on every page for quick help and contextual
              suggestions.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Which AI models does The Bird AI use?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              The Bird AI uses multiple AI models and routes your questions to the most
              appropriate one. Gemini Pro handles general education and reasoning tasks, Claude
              3.5 Sonnet is used for creative and detailed explanations, GPT-4 serves as a
              fallback, and Grok handles research and current events. The system automatically
              selects the best model based on your question type.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Is The Bird AI safe for children?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Yes. The Bird AI is configured with safety guardrails specifically designed for
              educational use with children. Content filters prevent inappropriate responses,
              and the AI is instructed to maintain an age-appropriate, encouraging tone. All
              conversations are logged for safety review, and parents can view their children's
              chat history from the parent dashboard.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Can I customize my AI tutor?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Yes. The AI Agent Profile feature lets you customize The Bird AI's personality,
              communication style, and focus areas. You can set preferences for formal or
              friendly tone, specify preferred subjects, adjust response length, and set the
              language complexity level. Access these settings from your CoPilot sidebar or
              the AI Tutor settings page.
            </p>
          </div>

          <div className="pb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Does The Bird AI support voice mode?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Yes. The Bird AI supports voice responses powered by ElevenLabs text-to-speech
              technology. You can toggle voice mode in the chat interface to have responses
              read aloud. This is especially helpful for auditory learners, younger students,
              and accessibility needs. Voice mode is available in English with more languages
              planned for future releases.
            </p>
          </div>
        </div>
      </DocsSection>

      {/* Payments */}
      <DocsSection
        id="payments"
        title="Payments"
        description="Questions about M-Pesa, refunds, wallet, and invoices."
      >
        <div className="space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              My M-Pesa payment is not going through. What should I do?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              First, ensure your phone number is correct and in the format 254XXXXXXXXX (without
              the leading zero). Make sure you have sufficient M-Pesa balance and that your SIM
              card is active. Check that you are on the Safaricom network. If you receive the STK
              push but the payment still fails, wait a few minutes and try again. If the problem
              persists, contact support with your phone number and transaction details.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              What is the refund policy?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              You can request a refund within 7 days of purchasing a course if you have completed
              less than 25% of the content. Refund requests are reviewed by the admin team and
              typically processed within 3-5 business days. Approved refunds are credited to
              your UHS wallet. For exceptional circumstances, contact support for assistance.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              How does the wallet balance work?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Your UHS wallet is a digital balance stored on the platform. You can top up your
              wallet via M-Pesa, and then use the balance for instant course purchases without
              going through the payment process each time. Refunds are also credited to your
              wallet. The minimum top-up amount is KES 100. Your wallet balance is shown on
              your dashboard and in the payments section.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Can I get a receipt or invoice for my payments?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Yes. Every completed transaction generates a downloadable receipt. Go to the
              Payments section of your dashboard, find the transaction in your history, and
              click the receipt icon to download a PDF. Receipts include the transaction ID,
              date, amount, payment method, and a description of what was purchased.
            </p>
          </div>

          <div className="pb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              How do instructor payouts work?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Instructor earnings follow a 60/30/10 revenue split: 60% goes to the instructor,
              30% to the platform, and 10% to a content development fund. Payouts are calculated
              monthly and can be withdrawn via M-Pesa or bank transfer. Instructors can view
              their earnings, pending payouts, and payout history from the instructor dashboard.
              Minimum payout threshold is KES 500.
            </p>
          </div>
        </div>
      </DocsSection>

      {/* Technical */}
      <DocsSection
        id="technical"
        title="Technical"
        description="Questions about browsers, apps, dark mode, privacy, and bug reporting."
      >
        <div className="space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              What browsers are supported?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              UHS supports all major modern browsers: Google Chrome (version 90+), Mozilla Firefox
              (version 90+), Apple Safari (version 14+), and Microsoft Edge (version 90+). We
              recommend keeping your browser updated to the latest version for the best experience
              and security. Internet Explorer is not supported.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Is there a mobile app for UHS?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Currently, UHS is a web application accessible through any mobile browser. The
              responsive design provides a native-like experience on smartphones and tablets.
              We are planning dedicated iOS and Android apps for a future release that will
              include offline access, push notifications, and optimized mobile performance.
              For now, you can add UHS to your home screen for quick access.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              How do I enable dark mode?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Click the theme toggle icon (sun/moon) in the top navigation bar to switch between
              light and dark modes. You can also set it to "System" to automatically match your
              device's system preference. Your theme choice is saved in your browser and persists
              across sessions.
            </p>
          </div>

          <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              How does UHS handle my data and privacy?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              UHS takes data privacy seriously and complies with Kenya's Data Protection Act (DPA)
              and international best practices. We collect only the data necessary for platform
              functionality. Passwords are hashed with bcrypt, sensitive data is encrypted at
              rest, and all communications use HTTPS encryption. You can request a copy of your
              data or request deletion at any time from your account settings.
            </p>
          </div>

          <div className="pb-2">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              How do I report a bug?
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              If you encounter a bug, go to Settings and click "Report a Bug" or use the contact
              form. Include a description of the issue, the steps to reproduce it, your browser
              and device information, and a screenshot if possible. You can also email our support
              team directly. Our engineering team reviews all bug reports and prioritizes fixes
              based on impact and severity.
            </p>
          </div>
        </div>
      </DocsSection>

      {/* Still have questions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
          Still have questions?
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
          If you could not find the answer you were looking for, our support team is ready to help.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/contact"
            className="text-sm px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:underline"
          >
            Contact Support
          </Link>
          <Link
            to="/forum"
            className="text-sm px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:underline"
          >
            Ask in the Forum
          </Link>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link
          to="/docs/api/more"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          &larr; More APIs
        </Link>
        <Link
          to="/docs/getting-started"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Getting Started &rarr;
        </Link>
      </div>
    </div>
  );
};

export default FAQPage;
