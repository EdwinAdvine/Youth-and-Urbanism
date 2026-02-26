// AITutorGuidePage - Comprehensive guide for The Bird AI tutor.
// Covers AI models, chat interface, response modes, model routing, conversation history,
// quick actions, customization, and safety features.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsImagePlaceholder from '../../../components/docs/DocsImagePlaceholder';

const AITutorGuidePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        The Bird AI Tutor
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Your personal AI tutor powered by multiple AI models, ready to help you learn any subject
        at your own pace with text, voice, and video explanations.
      </p>

      {/* Table of Contents */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">On this page</h3>
        <nav className="grid sm:grid-cols-2 gap-1">
          {[
            { id: 'what-is-bird', label: 'What is The Bird AI' },
            { id: 'accessing', label: 'Accessing the AI Tutor' },
            { id: 'asking-questions', label: 'Asking Questions' },
            { id: 'response-modes', label: 'Response Modes' },
            { id: 'model-routing', label: 'How the AI Chooses Models' },
            { id: 'conversation-history', label: 'Conversation History' },
            { id: 'quick-actions', label: 'Quick Actions' },
            { id: 'customization', label: 'Customizing Your AI Tutor' },
            { id: 'safety', label: 'Safety Features' },
            { id: 'tips', label: 'Tips for Effective Learning' },
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

      {/* What is The Bird AI */}
      <DocsSection
        id="what-is-bird"
        title="What is The Bird AI"
        description="A personal AI tutor powered by multiple state-of-the-art AI models."
      >
        <p className="mb-4">
          The Bird AI is your dedicated personal tutor on Urban Home School. Unlike traditional
          tutoring that relies on a single approach, The Bird AI is powered by a multi-AI
          orchestration system that selects the best AI model for each task automatically. This
          means you always get the most effective explanation for your question.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Gemini Pro</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Google's Gemini Pro handles reasoning tasks, mathematical problem-solving, and
              general education queries. This is the default model for most tutoring interactions.
            </p>
          </div>
          <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Claude</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              Anthropic's Claude excels at creative explanations, detailed walkthroughs, essay
              feedback, and storytelling-based teaching. Ideal for humanities and creative subjects.
            </p>
          </div>
          <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">GPT-4</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              OpenAI's GPT-4 serves as the reliable fallback model when other models are
              unavailable, ensuring you always get a high-quality response.
            </p>
          </div>
          <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/10">
            <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-1">Grok</h4>
            <p className="text-sm text-orange-700 dark:text-orange-400">
              X.AI's Grok is used for research-oriented tasks and current events, bringing
              real-time information into your learning sessions when available.
            </p>
          </div>
        </div>
        <p className="text-sm">
          You do not need to choose a model yourself. The AI orchestrator automatically routes
          your question to the best model based on the task type. Learn more about this in the{' '}
          <a href="#model-routing" className="text-blue-600 dark:text-blue-400 hover:underline">
            How the AI Chooses Models
          </a>{' '}
          section below.
        </p>
      </DocsSection>

      {/* Accessing the AI Tutor */}
      <DocsSection
        id="accessing"
        title="Accessing the AI Tutor"
        description="Open a full-screen chat session with The Bird AI."
      >
        <p className="mb-4">
          The Bird AI tutor is accessible from the sidebar navigation in your student dashboard.
          It opens a dedicated full-screen chat interface designed for in-depth study sessions,
          extended conversations, and focused learning.
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Open the Sidebar</h4>
              <p className="text-sm">From your student dashboard, look at the left sidebar navigation menu.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Click "The Bird AI"</h4>
              <p className="text-sm">Select "The Bird AI" from the navigation items. This opens the full-screen chat interface.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Start Chatting</h4>
              <p className="text-sm">Type your question or select a quick action to begin your tutoring session immediately.</p>
            </div>
          </div>
        </div>
        <p className="text-sm mb-4">
          For quick questions while browsing other pages, consider using the{' '}
          <Link to="/docs/copilot" className="text-blue-600 dark:text-blue-400 hover:underline">
            CoPilot sidebar
          </Link>{' '}
          instead, which is available on every page without leaving your current context.
        </p>
        <DocsImagePlaceholder
          description="The Bird AI full-screen chat interface showing the sidebar navigation entry and chat area"
          path="/docs/screenshots/bird-ai-chat-interface.png"
        />
      </DocsSection>

      {/* Asking Questions */}
      <DocsSection
        id="asking-questions"
        title="Asking Questions"
        description="How to communicate effectively with The Bird AI tutor."
      >
        <p className="mb-4">
          The Bird AI understands natural language, so you can type questions just as you would
          ask a human tutor. The more specific and clear your question, the better the response
          you will receive.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Text Input</h4>
        <p className="text-sm mb-3">
          Type your question in the message input at the bottom of the chat interface. Press
          Enter or click the send button to submit. You can write anything from a short question
          to a multi-paragraph prompt.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Formatting Tips</h4>
        <ul className="list-disc list-inside space-y-1 text-sm mb-4">
          <li>Use clear, specific language (e.g., "Explain the water cycle for Grade 6 Science")</li>
          <li>Mention your grade level so the AI adjusts difficulty appropriately</li>
          <li>Break complex questions into smaller parts for more focused answers</li>
          <li>Include context from your course or textbook when asking follow-up questions</li>
          <li>Use keywords like "explain," "summarize," "solve," or "quiz me" to guide the response format</li>
        </ul>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Subject-Specific Queries</h4>
        <p className="text-sm mb-4">
          The Bird AI covers all CBC learning areas. You can ask about Mathematics, English,
          Kiswahili, Sciences, Social Studies, Creative Arts, Religious Education, and more. The
          AI automatically detects the subject from your question and adapts its explanation style.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Example questions:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>"What is photosynthesis and why is it important?"</li>
            <li>"Help me solve this equation: 3x + 7 = 22"</li>
            <li>"Summarize the causes of World War I for my Grade 9 History class"</li>
            <li>"Translate this paragraph to Kiswahili and explain the grammar"</li>
            <li>"Give me 5 practice problems on fractions for Grade 5"</li>
          </ul>
        </div>
        <DocsImagePlaceholder
          description="Chat input area with a typed question and quick action buttons"
          path="/docs/screenshots/bird-ai-asking-question.png"
        />
      </DocsSection>

      {/* Response Modes */}
      <DocsSection
        id="response-modes"
        title="Response Modes"
        description="Choose how The Bird AI delivers explanations to you."
      >
        <p className="mb-4">
          The Bird AI supports three different response modes so you can learn in the way that
          works best for you. You can switch between modes at any time during a conversation.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Mode</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Powered By</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Description</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Text</td>
                <td className="px-4 py-3">AI Models</td>
                <td className="px-4 py-3">Default written responses with rich formatting, code blocks, and mathematical notation.</td>
                <td className="px-4 py-3">Reading at your own pace, copying notes, step-by-step solutions</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Voice</td>
                <td className="px-4 py-3">ElevenLabs TTS</td>
                <td className="px-4 py-3">Text responses are converted to natural-sounding speech that plays in your browser.</td>
                <td className="px-4 py-3">Long explanations, studying on the go, accessibility, multitasking</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Video</td>
                <td className="px-4 py-3">Synthesia</td>
                <td className="px-4 py-3">AI-generated video lessons with a virtual presenter explaining the topic visually.</td>
                <td className="px-4 py-3">Visual learning, complex concepts, presentation-style explanations</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm mb-4">
          You can set your default response mode in{' '}
          <a href="#customization" className="text-blue-600 dark:text-blue-400 hover:underline">
            AI Tutor settings
          </a>{' '}
          or toggle it per conversation. Text mode is always available; Voice and Video modes
          require an active internet connection. For more details on voice interaction, see the{' '}
          <Link to="/docs/voice-mode" className="text-blue-600 dark:text-blue-400 hover:underline">
            Voice Mode Guide
          </Link>.
        </p>
        <DocsImagePlaceholder
          description="Response mode selector showing Text, Voice, and Video options"
          path="/docs/screenshots/bird-ai-response-modes.png"
        />
      </DocsSection>

      {/* How the AI Chooses Models */}
      <DocsSection
        id="model-routing"
        title="How the AI Chooses Models"
        description="Task-based routing automatically selects the best AI model for your question."
      >
        <p className="mb-4">
          Behind the scenes, The Bird AI uses an intelligent orchestration system that analyzes
          your question and routes it to the most suitable AI model. This happens automatically
          and instantly -- you never need to select a model yourself.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Task Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Routed To</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">General</td>
                <td className="px-4 py-3">Gemini Pro</td>
                <td className="px-4 py-3">Math problems, science concepts, quiz preparation, general knowledge</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Creative</td>
                <td className="px-4 py-3">Claude</td>
                <td className="px-4 py-3">Essay writing, creative stories, detailed explanations, analogies</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Research</td>
                <td className="px-4 py-3">Grok</td>
                <td className="px-4 py-3">Current events, recent discoveries, fact-checking, news-related topics</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Fallback</td>
                <td className="px-4 py-3">GPT-4</td>
                <td className="px-4 py-3">Used when the primary model is unavailable, ensuring uninterrupted learning</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Automatic Failover</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            If the selected model experiences downtime or an error, the orchestrator automatically
            falls back to an alternative model. This means you will never be left without a
            response. The failover is seamless and the quality remains high.
          </p>
        </div>
        <DocsImagePlaceholder
          description="Diagram showing AI orchestrator routing questions to different models"
          path="/docs/screenshots/bird-ai-model-routing.png"
        />
      </DocsSection>

      {/* Conversation History */}
      <DocsSection
        id="conversation-history"
        title="Conversation History"
        description="Your tutoring sessions are saved so you can revisit them anytime."
      >
        <p className="mb-4">
          Every conversation you have with The Bird AI is automatically saved to your account.
          This means you can return to previous study sessions, review explanations, and continue
          where you left off without losing any context.
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Auto-Save</h4>
            <p className="text-sm">All messages are saved in real time as you chat. Conversations are stored in your JSONB conversation history linked to your AI tutor profile.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Search Past Conversations</h4>
            <p className="text-sm">Use the search bar at the top of your conversation list to find past topics. Search by keyword, date, or subject area.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Export Conversations</h4>
            <p className="text-sm">Download your conversations as text files for offline review, note-taking, or sharing with parents and instructors.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Continue Previous Sessions</h4>
            <p className="text-sm">Click on any past conversation to resume it. The AI remembers the full context and picks up exactly where you left off.</p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Conversation history panel showing saved sessions with search and export options"
          path="/docs/screenshots/bird-ai-conversation-history.png"
        />
      </DocsSection>

      {/* Quick Actions */}
      <DocsSection
        id="quick-actions"
        title="Quick Actions"
        description="One-click shortcuts for common learning tasks."
      >
        <p className="mb-4">
          Quick actions are pre-built shortcuts that let you trigger common learning tasks with
          a single click. They appear as buttons above the chat input and can also be customized
          in your AI tutor settings.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="flex gap-3 items-start border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Explain This</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Get a clear, detailed explanation of any concept or topic you are studying.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Quiz Me</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Generate a quick quiz on the current topic to test your understanding.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Summarize</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Get a concise summary of a topic, lesson, or long passage of text.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-700 dark:text-yellow-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Solve Step by Step</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Walk through a problem with detailed step-by-step instructions and explanations.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-700 dark:text-orange-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Give Hint</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Get a gentle nudge in the right direction without a full answer being revealed.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Practice Problems</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Generate a set of practice problems tailored to your current topic and grade level.</p>
            </div>
          </div>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-400 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Flashcards</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Create digital flashcards from any topic for quick review sessions and memorization practice.</p>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Quick action buttons displayed above the chat input area"
          path="/docs/screenshots/bird-ai-quick-actions.png"
        />
      </DocsSection>

      {/* Customizing Your AI Tutor */}
      <DocsSection
        id="customization"
        title="Customizing Your AI Tutor"
        description="Personalize The Bird AI to match your learning preferences."
      >
        <p className="mb-4">
          Every student learns differently, and The Bird AI can be customized to fit your unique
          style. Access these settings from the AI Tutor settings page or through the{' '}
          <Link to="/docs/copilot" className="text-blue-600 dark:text-blue-400 hover:underline">
            CoPilot Settings tab
          </Link>.
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Agent Name</h4>
              <p className="text-sm">Give your AI tutor a custom name. By default it is called "The Bird," but you can rename it to anything you like.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Avatar</h4>
              <p className="text-sm">Choose an avatar for your AI tutor from the available options, or upload your own custom image.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Personality Traits</h4>
              <p className="text-sm">Select personality traits such as encouraging, patient, humorous, or strict. These affect how the AI communicates with you.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">4</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Communication Style</h4>
              <p className="text-sm">Choose between formal, casual, or balanced communication styles. The AI adapts its language and tone accordingly.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">5</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Expertise Focus</h4>
              <p className="text-sm">Set your primary subjects of interest so the AI prioritizes relevant knowledge areas and can proactively suggest related content.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">6</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Preferred Language</h4>
              <p className="text-sm">Set your preferred language for AI responses. The Bird AI supports English and Kiswahili, with more languages planned.</p>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="AI tutor customization settings showing name, avatar, personality, and style options"
          path="/docs/screenshots/bird-ai-customization.png"
        />
      </DocsSection>

      {/* Safety Features */}
      <DocsSection
        id="safety"
        title="Safety Features"
        description="Built-in protections to ensure a safe and age-appropriate learning environment."
      >
        <p className="mb-4">
          Urban Home School takes student safety seriously. The Bird AI includes multiple layers
          of protection to ensure all interactions are safe, educational, and age-appropriate.
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Content Filtering</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              All AI responses pass through content filters that block inappropriate, harmful, or
              non-educational material. The AI will not generate content that is violent, explicit,
              or unsuitable for students.
            </p>
          </div>
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Age-Appropriate Responses</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              The AI automatically adjusts the complexity and language of its responses based on
              the student's grade level profile. A Grade 3 student will receive simpler
              explanations than a Grade 11 student, even for the same topic.
            </p>
          </div>
          <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Parent Controls</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              Parents can view their child's conversation history, set usage time limits, restrict
              certain topics, and receive activity reports. These controls are managed from the{' '}
              <Link to="/docs/parent-guide" className="text-purple-600 dark:text-purple-400 hover:underline">
                Parent Dashboard
              </Link>.
            </p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Safety settings panel showing content filters and parent control options"
          path="/docs/screenshots/bird-ai-safety-features.png"
        />
      </DocsSection>

      {/* Tips for Effective Learning */}
      <DocsSection
        id="tips"
        title="Tips for Effective Learning"
        description="Get the most out of your AI tutoring sessions."
      >
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">1.</span>
              <span><strong>Be specific:</strong> Instead of "help with math," try "explain how to find the area of a triangle for Grade 7." Specific questions lead to better answers.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">2.</span>
              <span><strong>Ask follow-ups:</strong> If you do not understand an explanation, ask the AI to explain it differently, use simpler words, or provide an analogy.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">3.</span>
              <span><strong>Use quick actions:</strong> Try "Quiz Me" after studying a topic to test your understanding. Use "Practice Problems" to reinforce concepts.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">4.</span>
              <span><strong>Review history:</strong> Revisit past conversations before exams. Your conversation history is a personalized study resource.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">5.</span>
              <span><strong>Try different modes:</strong> Switch between text and voice to find the learning mode that works best for each subject.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">6.</span>
              <span><strong>Customize your tutor:</strong> Set personality traits and communication style to create a learning experience that keeps you engaged.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">7.</span>
              <span><strong>Use flashcards:</strong> Ask the AI to generate flashcards for topics you want to memorize. Review them regularly for best retention.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">8.</span>
              <span><strong>Set a schedule:</strong> Consistent daily study sessions with The Bird AI lead to better outcomes than occasional long sessions.</span>
            </li>
          </ul>
        </div>
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link to="/docs/certificates" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          &larr; Certificates
        </Link>
        <Link to="/docs/copilot" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          CoPilot &rarr;
        </Link>
      </div>
    </div>
  );
};

export default AITutorGuidePage;
