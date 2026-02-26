// VoiceModeGuidePage - Comprehensive guide for voice interaction with The Bird AI.
// Covers enabling voice mode, ElevenLabs TTS, voice options, Synthesia video responses,
// combining text and voice, and tips for effective voice-based learning.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsImagePlaceholder from '../../../components/docs/DocsImagePlaceholder';

const VoiceModeGuidePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Voice Mode
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Listen to AI explanations instead of reading them. Voice Mode transforms The Bird AI's
        responses into natural-sounding speech powered by ElevenLabs, with optional video
        lessons from Synthesia.
      </p>

      {/* Table of Contents */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">On this page</h3>
        <nav className="grid sm:grid-cols-2 gap-1">
          {[
            { id: 'what-is-voice', label: 'What is Voice Mode' },
            { id: 'enabling', label: 'Enabling Voice Mode' },
            { id: 'how-it-works', label: 'How It Works' },
            { id: 'voice-options', label: 'Voice Options' },
            { id: 'when-to-use', label: 'When to Use Voice Mode' },
            { id: 'video-responses', label: 'Video Responses with Synthesia' },
            { id: 'combining', label: 'Combining Text and Voice' },
            { id: 'limitations', label: 'Limitations and Tips' },
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

      {/* What is Voice Mode */}
      <DocsSection
        id="what-is-voice"
        title="What is Voice Mode"
        description="Listen to AI explanations instead of reading them."
      >
        <p className="mb-4">
          Voice Mode is a feature of The Bird AI that converts text responses into natural,
          human-like speech. Instead of reading long explanations on screen, you can listen to
          them just like you would listen to a teacher in a classroom.
        </p>
        <p className="mb-4">
          Voice Mode is powered by{' '}
          <strong>ElevenLabs</strong>, an industry-leading text-to-speech (TTS) service that
          produces high-quality, natural-sounding voice output. The voices are not robotic or
          monotone -- they sound like a real person speaking to you with proper intonation,
          pacing, and emphasis.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Why Use Voice Mode?</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Research shows that some students learn better through auditory input. Voice Mode
            also helps with accessibility, multitasking, and reducing screen fatigue during long
            study sessions. It is especially useful for language learning, where hearing correct
            pronunciation is essential.
          </p>
        </div>
        <DocsImagePlaceholder
          description="The Bird AI chat with Voice Mode enabled, showing an audio player alongside the text response"
          path="/docs/screenshots/voice-mode-overview.png"
        />
      </DocsSection>

      {/* Enabling Voice Mode */}
      <DocsSection
        id="enabling"
        title="Enabling Voice Mode"
        description="Turn on voice responses in settings or per conversation."
      >
        <p className="mb-4">
          There are two ways to enable Voice Mode: globally through your settings, or on a
          per-conversation basis.
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Global Settings Toggle</h4>
            <div className="space-y-2">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold flex-shrink-0">1</div>
                <p className="text-sm">Open your account settings or the CoPilot Settings tab.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold flex-shrink-0">2</div>
                <p className="text-sm">Navigate to "AI Preferences" or "Response Mode."</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold flex-shrink-0">3</div>
                <p className="text-sm">Toggle "Voice Mode" to enabled. All future AI responses will include audio playback.</p>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Per-Conversation Toggle</h4>
            <div className="space-y-2">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold flex-shrink-0">1</div>
                <p className="text-sm">Open a chat with The Bird AI.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold flex-shrink-0">2</div>
                <p className="text-sm">Look for the voice toggle icon near the chat input area or in the chat header.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold flex-shrink-0">3</div>
                <p className="text-sm">Click the toggle to enable or disable voice for the current conversation only.</p>
              </div>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Voice Mode toggle in settings and the per-conversation toggle in the chat header"
          path="/docs/screenshots/voice-mode-toggle.png"
        />
      </DocsSection>

      {/* How It Works */}
      <DocsSection
        id="how-it-works"
        title="How It Works"
        description="The technical flow from your question to spoken answer."
      >
        <p className="mb-4">
          When Voice Mode is enabled, the process follows three steps that happen seamlessly
          in the background:
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">AI Generates Text Response</h4>
              <p className="text-sm">
                Your question is processed by the AI orchestrator and routed to the best model
                (Gemini Pro, Claude, Grok, or GPT-4). The model generates a complete text
                response, just as it would in text-only mode.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">ElevenLabs Converts to Speech</h4>
              <p className="text-sm">
                The text response is sent to the ElevenLabs API, which converts it into
                natural-sounding speech using advanced neural voice synthesis. The conversion
                takes just a few seconds for most responses.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Audio Plays in Browser</h4>
              <p className="text-sm">
                The audio is streamed directly to your browser and starts playing automatically.
                You can pause, rewind, or replay the audio using the built-in audio controls. The
                text version is also shown alongside the audio player.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <p className="text-sm">
            <strong>Note:</strong> Voice Mode requires an active internet connection for the
            ElevenLabs API call. The text response appears first, and audio follows within a
            few seconds. If the audio fails to load, you can still read the text response.
          </p>
        </div>
        <DocsImagePlaceholder
          description="Flow diagram showing question to AI model to ElevenLabs to audio playback"
          path="/docs/screenshots/voice-mode-flow.png"
        />
      </DocsSection>

      {/* Voice Options */}
      <DocsSection
        id="voice-options"
        title="Voice Options"
        description="Choose from different voice profiles and languages."
      >
        <p className="mb-4">
          The Bird AI offers multiple voice options so you can pick the voice that is most
          comfortable and engaging for your learning experience.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Voice Profiles</h4>
        <p className="text-sm mb-3">
          Several voice profiles are available, each with a different tone, gender, and speaking
          style. Preview each voice in your settings before selecting one. The voice profiles are
          provided by ElevenLabs and sound natural and expressive.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Warm & Encouraging</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">A gentle, supportive voice ideal for younger students and building confidence.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Clear & Professional</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">A crisp, articulate voice suited for older students and formal subjects.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Energetic & Engaging</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">An upbeat voice that keeps lessons lively and attention-grabbing.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Calm & Patient</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">A relaxed, measured voice perfect for complex topics that need careful explanation.</p>
          </div>
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Language Support</h4>
        <p className="text-sm mb-4">
          Voice Mode currently supports two languages:
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">English</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Full support with multiple voice profiles. Clear pronunciation optimized for
              educational content and Kenyan English conventions.
            </p>
          </div>
          <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Kiswahili</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              Support for Kiswahili voice output, enabling students to listen to explanations
              in their national language. Particularly helpful for language arts subjects.
            </p>
          </div>
        </div>
        <p className="text-sm mb-4">
          Additional language support is planned for future releases. The language for voice
          output matches the language you set in your{' '}
          <Link to="/docs/ai-tutor#customization" className="text-blue-600 dark:text-blue-400 hover:underline">
            AI Tutor preferences
          </Link>.
        </p>
        <DocsImagePlaceholder
          description="Voice settings panel showing voice profile selection and language options"
          path="/docs/screenshots/voice-mode-options.png"
        />
      </DocsSection>

      {/* When to Use Voice Mode */}
      <DocsSection
        id="when-to-use"
        title="When to Use Voice Mode"
        description="Scenarios where listening to explanations is more effective than reading."
      >
        <p className="mb-4">
          Voice Mode is not just an alternative to reading -- it can be the preferred learning
          method in many situations. Here are the best times to enable it:
        </p>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Long Explanations</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                When the AI provides a lengthy explanation, listening can be less tiring than
                reading a wall of text. Lean back and let the AI read it to you.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Studying on the Go</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Use Voice Mode when you want to review material while commuting, doing chores,
                or exercising. Just ask a question and listen to the answer.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Accessibility</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                For students with visual impairments or reading difficulties, Voice Mode
                provides an essential alternative way to access all AI tutor content.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-700 dark:text-orange-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Multitasking</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Listen to an explanation while taking notes in a notebook, drawing a diagram,
                or following along in your textbook.
              </p>
            </div>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Student using Voice Mode while taking handwritten notes from the AI response"
          path="/docs/screenshots/voice-mode-use-cases.png"
        />
      </DocsSection>

      {/* Video Responses with Synthesia */}
      <DocsSection
        id="video-responses"
        title="Video Responses with Synthesia"
        description="AI-generated video lessons with a virtual presenter."
      >
        <p className="mb-4">
          Beyond voice-only responses, The Bird AI can generate video explanations powered by
          Synthesia. These are AI-generated videos featuring a virtual presenter who explains
          the topic visually, similar to watching a teacher on screen.
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">What You Get</h4>
            <p className="text-sm">
              A short video featuring an AI-generated presenter who explains the concept with
              natural gestures and expressions. The video may include visual aids, diagrams, or
              text overlays to reinforce the explanation.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">When to Use Video</h4>
            <p className="text-sm">
              Video responses are best for complex topics that benefit from visual explanation,
              such as scientific processes, mathematical proofs, geography, or any subject where
              seeing a presentation helps understanding.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">How to Enable</h4>
            <p className="text-sm">
              Switch your response mode to "Video" in the chat settings or your AI preferences.
              Note that video generation takes longer than text or voice responses (typically 30
              seconds to a few minutes depending on length).
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Visual Learning</h4>
            <p className="text-sm">
              Research shows that many students retain information better when it is presented
              visually. Synthesia videos combine the benefits of voice narration with visual
              presentation for a richer learning experience.
            </p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="Synthesia-generated video lesson playing in the Bird AI chat interface"
          path="/docs/screenshots/voice-mode-synthesia-video.png"
        />
      </DocsSection>

      {/* Combining Text and Voice */}
      <DocsSection
        id="combining"
        title="Combining Text and Voice"
        description="Read and listen at the same time for maximum comprehension."
      >
        <p className="mb-4">
          When Voice Mode is enabled, responses are always shown as both text and audio. The
          text response appears in the chat as usual, with a play button and audio controls
          attached. This dual-format approach means you can:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm mb-4">
          <li>
            <strong>Read along while listening:</strong> Follow the text with your eyes while
            the audio plays. This reinforces comprehension through two channels simultaneously.
          </li>
          <li>
            <strong>Listen first, then review text:</strong> Let the audio play, then scroll
            through the text version to review key points or copy notes.
          </li>
          <li>
            <strong>Skip ahead in text:</strong> If a particular section of the audio response
            is not relevant, scan the text to find the part you need, then resume listening from there.
          </li>
          <li>
            <strong>Share the text version:</strong> Copy or export the text for notes, while
            using the audio for initial understanding.
          </li>
        </ul>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Audio Controls</h4>
          <p className="text-sm">
            Each voice response includes standard audio controls: play/pause, a progress
            scrubber to jump to specific points, volume adjustment, and playback speed control
            (0.5x, 1x, 1.5x, 2x). Use faster playback to review material quickly, or slower
            playback for complex topics.
          </p>
        </div>
        <DocsImagePlaceholder
          description="Chat message showing text response with inline audio player and playback controls"
          path="/docs/screenshots/voice-mode-text-and-audio.png"
        />
      </DocsSection>

      {/* Limitations and Tips */}
      <DocsSection
        id="limitations"
        title="Limitations and Tips"
        description="What to know for the best voice experience."
      >
        <p className="mb-4">
          Voice Mode is a powerful feature, but there are a few things to keep in mind for
          the best experience.
        </p>
        <div className="space-y-3 mb-4">
          <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/10">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Internet Required</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Voice Mode requires an active internet connection because the text-to-speech
              conversion happens in the cloud via the ElevenLabs API. If your connection drops,
              you will still see the text response.
            </p>
          </div>
          <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Headphones Recommended</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              For the best audio quality and to avoid disturbing others in shared spaces, use
              headphones or earbuds when using Voice Mode. This also helps you focus better
              on the content.
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Download Not Yet Supported</h4>
            <p className="text-sm">
              Currently, audio responses cannot be downloaded for offline listening. This feature
              is planned for a future update. For now, you can replay audio as many times as you
              like while online.
            </p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tips for the Best Experience</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">1.</span>
              <span>Use a stable internet connection to avoid audio buffering or delays.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">2.</span>
              <span>Try different voice profiles to find one you find pleasant and easy to understand.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">3.</span>
              <span>Adjust playback speed -- use 1.5x for review sessions and 0.75x for complex new topics.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">4.</span>
              <span>Combine voice with note-taking for the most effective retention.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">5.</span>
              <span>Use Video Mode for topics that benefit from visual presentation, and Voice Mode for pure auditory learning.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">6.</span>
              <span>Set Kiswahili as your voice language when studying Kiswahili subjects for proper pronunciation exposure.</span>
            </li>
          </ul>
        </div>
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link to="/docs/copilot" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          &larr; CoPilot
        </Link>
        <Link to="/docs/learning-paths" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Learning Paths &rarr;
        </Link>
      </div>
    </div>
  );
};

export default VoiceModeGuidePage;
