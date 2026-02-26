// CoPilotGuidePage - Comprehensive guide for the CoPilot sidebar assistant.
// Covers opening CoPilot, tabs (Chat, Performance, Settings), agent profile settings,
// comparison with the full AI Tutor, and usage tips.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsImagePlaceholder from '../../../components/docs/DocsImagePlaceholder';

const CoPilotGuidePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        CoPilot
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        A compact AI sidebar assistant available on every page, providing quick help, learning
        analytics, and AI personalization without leaving your current context.
      </p>

      {/* Table of Contents */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">On this page</h3>
        <nav className="grid sm:grid-cols-2 gap-1">
          {[
            { id: 'what-is-copilot', label: 'What is CoPilot' },
            { id: 'opening-copilot', label: 'Opening CoPilot' },
            { id: 'copilot-tabs', label: 'CoPilot Tabs Overview' },
            { id: 'chat-features', label: 'Chat Features' },
            { id: 'performance-tab', label: 'Performance Tab' },
            { id: 'agent-profile', label: 'Agent Profile Settings' },
            { id: 'comparison', label: 'CoPilot vs Full AI Tutor' },
            { id: 'tips', label: 'Tips for Using CoPilot' },
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

      {/* What is CoPilot */}
      <DocsSection
        id="what-is-copilot"
        title="What is CoPilot"
        description="Your compact AI assistant that follows you across every page."
      >
        <p className="mb-4">
          CoPilot is a lightweight sidebar assistant that is available on every page of Urban
          Home School. Unlike the full Bird AI tutor which opens as a dedicated full-screen
          experience, CoPilot slides in from the side of your screen and lets you ask quick
          questions, check your learning analytics, and manage your AI preferences -- all
          without navigating away from your current page.
        </p>
        <p className="mb-4">
          Think of CoPilot as your study companion that sits beside you while you browse courses,
          work on assignments, or review your dashboard. It provides contextual help based on what
          you are currently doing on the platform.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Key Difference from The Bird AI</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            CoPilot is designed for quick, in-context interactions. For deep study sessions,
            extended conversations, and working through complex problems, use the{' '}
            <Link to="/docs/ai-tutor" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              full Bird AI Tutor
            </Link>{' '}
            instead.
          </p>
        </div>
        <DocsImagePlaceholder
          description="CoPilot sidebar open alongside the student dashboard, showing the chat tab"
          path="/docs/screenshots/copilot-sidebar-overview.png"
        />
      </DocsSection>

      {/* Opening CoPilot */}
      <DocsSection
        id="opening-copilot"
        title="Opening CoPilot"
        description="How to launch the CoPilot sidebar from anywhere on the platform."
      >
        <p className="mb-4">
          CoPilot can be opened from any page on Urban Home School. There are two ways to
          access it:
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Click the CoPilot Button</h4>
              <p className="text-sm">
                Look for the CoPilot button in the top navigation bar. It is typically located
                on the right side of the top bar. Click it to toggle the sidebar open or closed.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Keyboard Shortcut</h4>
              <p className="text-sm">
                Use the keyboard shortcut to quickly toggle CoPilot without reaching for the mouse.
                The default shortcut is displayed as a tooltip when you hover over the CoPilot button.
              </p>
            </div>
          </div>
        </div>
        <p className="text-sm mb-4">
          When opened, CoPilot slides in from the right side of the screen. The main content
          area adjusts to make room, so nothing is hidden behind the sidebar. Click the CoPilot
          button again or press the keyboard shortcut to close it.
        </p>
        <DocsImagePlaceholder
          description="Top navigation bar highlighting the CoPilot button location"
          path="/docs/screenshots/copilot-button-location.png"
        />
      </DocsSection>

      {/* CoPilot Tabs Overview */}
      <DocsSection
        id="copilot-tabs"
        title="CoPilot Tabs Overview"
        description="CoPilot is organized into three tabs for different functions."
      >
        <p className="mb-4">
          The CoPilot sidebar contains three tabs at the top, each serving a distinct purpose.
          Switch between tabs by clicking the tab headers.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Chat</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Ask quick questions, get contextual help, and receive in-context assistance
              while browsing courses, lessons, or your dashboard.
            </p>
          </div>
          <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Performance</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              View your learning analytics at a glance including study streaks, course
              progress, completion rates, and AI interaction statistics.
            </p>
          </div>
          <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Settings</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              Customize your AI agent profile, adjust response preferences, set quick
              action shortcuts, and manage your learning style settings.
            </p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="CoPilot sidebar showing the three tab headers: Chat, Performance, and Settings"
          path="/docs/screenshots/copilot-tabs-overview.png"
        />
      </DocsSection>

      {/* Chat Features */}
      <DocsSection
        id="chat-features"
        title="Chat Features"
        description="Quick questions and contextual help without leaving your current page."
      >
        <p className="mb-4">
          The Chat tab is the default view when you open CoPilot. It provides a compact chat
          interface designed for quick, focused interactions. Unlike the full Bird AI chat, CoPilot
          Chat is optimized for brevity and context-awareness.
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Contextual Help</h4>
            <p className="text-sm">
              CoPilot is aware of your current page context. If you are viewing a course page,
              it can answer questions about that specific course. If you are on an assessment page,
              it can provide hints and guidance relevant to the questions you are working on.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Quick Questions</h4>
            <p className="text-sm">
              Type short questions and get concise answers. CoPilot responses are optimized to be
              brief and actionable, perfect for when you need a quick clarification rather than a
              full lesson.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">In-Context Assistance</h4>
            <p className="text-sm">
              While browsing lessons, you can highlight text or concepts and ask CoPilot to explain
              them. This lets you get help on specific parts of your learning material without
              interrupting your flow.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Compact Message History</h4>
            <p className="text-sm">
              CoPilot maintains a brief conversation history within the current session. For
              long-running study sessions and full conversation history, switch to the{' '}
              <Link to="/docs/ai-tutor" className="text-blue-600 dark:text-blue-400 hover:underline">
                full AI Tutor
              </Link>.
            </p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="CoPilot Chat tab with a quick question and concise AI response"
          path="/docs/screenshots/copilot-chat-features.png"
        />
      </DocsSection>

      {/* Performance Tab */}
      <DocsSection
        id="performance-tab"
        title="Performance Tab"
        description="View your learning analytics and progress metrics at a glance."
      >
        <p className="mb-4">
          The Performance tab gives you a quick snapshot of your learning progress without
          navigating to a separate analytics page. It displays key metrics that help you track
          your study habits and achievements.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="flex gap-3 items-start border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-700 dark:text-orange-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Study Streak</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Tracks how many consecutive days you have studied on the platform. Maintaining a
                streak builds consistent study habits.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Courses in Progress</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Shows the number of courses you are currently enrolled in and actively working
                through, with a link to view each one.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Completion Rate</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Percentage of enrolled courses you have completed. This metric helps you see your
                overall learning momentum.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Session Time</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Tracks how much time you have spent studying in your current session and
                historically. Helps you plan balanced study schedules.
              </p>
            </div>
          </div>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">AI Interactions Count</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                The total number of conversations and questions you have had with The Bird AI
                and CoPilot. Shows how actively you are using AI-assisted learning.
              </p>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="CoPilot Performance tab showing study streak, course progress, and analytics cards"
          path="/docs/screenshots/copilot-performance-tab.png"
        />
      </DocsSection>

      {/* Agent Profile Settings */}
      <DocsSection
        id="agent-profile"
        title="Agent Profile Settings"
        description="Customize your AI assistant's personality, style, and behavior."
      >
        <p className="mb-4">
          The Settings tab in CoPilot lets you personalize your AI agent. These settings apply
          to both CoPilot and the full Bird AI Tutor, giving you a consistent experience across
          both interfaces.
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Custom Name</h4>
              <p className="text-sm">Give your AI agent a personalized name. This name appears in chat headers and greetings. Default is "The Bird."</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Avatar Selection</h4>
              <p className="text-sm">Choose from a gallery of avatar options or upload a custom image. The avatar appears in chat messages and the CoPilot header.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Personality Traits</h4>
              <p className="text-sm">Select traits like encouraging, patient, humorous, direct, or nurturing. These shape the tone and warmth of AI responses.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">4</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Response Style</h4>
              <p className="text-sm">Choose between concise, balanced, or detailed response lengths. Also set your preferred communication formality (casual, standard, or formal).</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">5</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Expertise Focus</h4>
              <p className="text-sm">Set your primary subjects of interest (e.g., Mathematics, Sciences, Languages). The AI prioritizes these areas and tailors its suggestions accordingly.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">6</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Quick Action Shortcuts</h4>
              <p className="text-sm">Customize which quick actions appear in your CoPilot chat. Rearrange or hide actions you do not use, and pin your favorites to the top.</p>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="CoPilot Settings tab showing agent name, avatar, personality, and style options"
          path="/docs/screenshots/copilot-agent-profile.png"
        />
      </DocsSection>

      {/* CoPilot vs Full AI Tutor */}
      <DocsSection
        id="comparison"
        title="CoPilot vs Full AI Tutor"
        description="Choose the right AI experience for your current learning need."
      >
        <p className="mb-4">
          Both CoPilot and the full Bird AI Tutor are powered by the same multi-AI orchestration
          system. The difference is in the interface and use case. Use this comparison to decide
          which to open.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Feature</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">CoPilot</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Full AI Tutor</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Interface</td>
                <td className="px-4 py-3">Compact sidebar panel</td>
                <td className="px-4 py-3">Full-screen chat experience</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Best For</td>
                <td className="px-4 py-3">Quick questions, hints, clarifications</td>
                <td className="px-4 py-3">Deep learning, extended study sessions</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Context Awareness</td>
                <td className="px-4 py-3">Aware of your current page</td>
                <td className="px-4 py-3">Dedicated chat context</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Conversation History</td>
                <td className="px-4 py-3">Compact, session-based</td>
                <td className="px-4 py-3">Full persistent history, searchable, exportable</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Response Length</td>
                <td className="px-4 py-3">Concise by default</td>
                <td className="px-4 py-3">Detailed and comprehensive</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Voice / Video Mode</td>
                <td className="px-4 py-3">Text only</td>
                <td className="px-4 py-3">Text, Voice (ElevenLabs), Video (Synthesia)</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Performance Analytics</td>
                <td className="px-4 py-3">Built-in Performance tab</td>
                <td className="px-4 py-3">Accessible via dashboard</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Navigation</td>
                <td className="px-4 py-3">Stay on current page</td>
                <td className="px-4 py-3">Navigates to dedicated AI Tutor page</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">When to use which?</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Use CoPilot</strong> when you need a quick answer while browsing a course, doing homework, or checking your dashboard.</li>
            <li><strong>Use the Full AI Tutor</strong> when you want to have a deep study session, work through a complex problem step by step, or use voice and video modes.</li>
            <li><strong>Use both</strong> by starting with CoPilot for a quick question, then clicking "Continue in AI Tutor" to switch to the full experience if the topic requires deeper exploration.</li>
          </ul>
        </div>
      </DocsSection>

      {/* Tips for Using CoPilot */}
      <DocsSection
        id="tips"
        title="Tips for Using CoPilot Effectively"
        description="Make the most of your sidebar AI assistant."
      >
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">1.</span>
              <span><strong>Keep it short:</strong> CoPilot is optimized for quick interactions. Ask focused, specific questions for the best results.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">2.</span>
              <span><strong>Use contextual help:</strong> Open CoPilot while viewing a lesson or assignment. It can provide help relevant to what you are currently looking at.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">3.</span>
              <span><strong>Check Performance regularly:</strong> Glance at the Performance tab to stay motivated. Track your study streak and aim to keep it going every day.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">4.</span>
              <span><strong>Customize quick actions:</strong> Rearrange quick action shortcuts in Settings so your most-used actions are always at the top.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">5.</span>
              <span><strong>Escalate when needed:</strong> If a CoPilot conversation becomes complex, switch to the full AI Tutor for a more detailed and focused session.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">6.</span>
              <span><strong>Personalize your agent:</strong> Set a custom name and personality in Settings. A tutor that feels personal is more engaging and motivating.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">7.</span>
              <span><strong>Use the keyboard shortcut:</strong> Learn the keyboard shortcut to toggle CoPilot instantly. It saves time and keeps your hands on the keyboard.</span>
            </li>
          </ul>
        </div>
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link to="/docs/ai-tutor" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          &larr; AI Tutor
        </Link>
        <Link to="/docs/voice-mode" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Voice Mode &rarr;
        </Link>
      </div>
    </div>
  );
};

export default CoPilotGuidePage;
