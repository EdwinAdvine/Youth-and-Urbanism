// AITutorApiPage - AI Tutor API endpoint documentation.
// Documents chat, conversation history, voice responses, and usage statistics endpoints.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';
import DocsApiEndpoint from '../../../components/docs/DocsApiEndpoint';

const AITutorApiPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        AI Tutor API
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Endpoints for interacting with The Bird AI tutor, managing conversation history,
        and accessing voice and usage features. All endpoints are prefixed
        with <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">/api/v1/ai-tutor</code>.
      </p>

      {/* Overview */}
      <DocsSection
        id="ai-overview"
        title="Overview"
        description="The Bird AI uses multi-model orchestration to provide intelligent tutoring."
      >
        <p className="mb-4">
          The AI Tutor API provides access to UHS's multi-AI orchestration engine. Messages are
          routed to the most appropriate AI model based on the task type. The system supports
          text, voice, and video response modes.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AI Models</h4>
            <ul className="text-sm space-y-1">
              <li><strong className="text-green-600 dark:text-green-400">Gemini Pro:</strong> Default model for reasoning and general education</li>
              <li><strong className="text-purple-600 dark:text-purple-400">Claude 3.5 Sonnet:</strong> Creative tasks and detailed explanations</li>
              <li><strong className="text-blue-600 dark:text-blue-400">GPT-4:</strong> Fallback model for general tasks</li>
              <li><strong className="text-orange-600 dark:text-orange-400">Grok:</strong> Research and current events queries</li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Response Modes</h4>
            <ul className="text-sm space-y-1">
              <li><strong>text:</strong> Standard text response (default)</li>
              <li><strong>voice:</strong> Text-to-speech via ElevenLabs</li>
              <li><strong>video:</strong> AI-generated video via Synthesia</li>
            </ul>
          </div>
        </div>
      </DocsSection>

      {/* Task Types */}
      <DocsSection
        id="task-types"
        title="Task Types"
        description="Task types determine which AI model handles the request."
      >
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Task Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Primary Model</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-2"><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">general</code></td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Gemini Pro</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">General tutoring, Q&A, explanations, homework help</td>
              </tr>
              <tr>
                <td className="px-4 py-2"><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">reasoning</code></td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Gemini Pro</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Math problems, logical reasoning, step-by-step solutions</td>
              </tr>
              <tr>
                <td className="px-4 py-2"><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">creative</code></td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Claude 3.5 Sonnet</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Creative writing, stories, essays, language arts</td>
              </tr>
              <tr>
                <td className="px-4 py-2"><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">research</code></td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Grok</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Current events, research topics, fact-checking</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          If the primary model is unavailable, the orchestrator automatically falls back to an
          alternative model. The <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">model_used</code> field in the response indicates which model
          actually handled the request.
        </p>
      </DocsSection>

      {/* Chat */}
      <DocsSection
        id="chat"
        title="Send Message"
        description="Send a message to The Bird AI tutor and receive a response."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/ai-tutor/chat"
          description="Send a message to the AI tutor. The message is routed to the appropriate AI model based on the task_type. Conversation context is maintained automatically. The response includes the AI's reply, the model used, and token usage information."
          auth={true}
          requestBody={`{
  "message": "Can you explain photosynthesis in simple terms?",
  "response_mode": "text",
  "task_type": "general"
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "ai_response": "Photosynthesis is the process plants use to make their own food. Think of it like a recipe: plants take sunlight, water from the soil, and carbon dioxide from the air, and combine them to create glucose (sugar) for energy. As a bonus, they release oxygen, which is what we breathe! The equation is: 6CO2 + 6H2O + light energy -> C6H12O6 + 6O2.",
    "model_used": "gemini-pro",
    "conversation_id": "conv-uuid-001",
    "tokens_used": {
      "prompt_tokens": 45,
      "completion_tokens": 120,
      "total_tokens": 165
    },
    "response_mode": "text",
    "created_at": "2026-02-15T10:30:00Z"
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/ai-tutor/chat \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Can you explain photosynthesis in simple terms?",
    "response_mode": "text",
    "task_type": "general"
  }'`}
        />
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Rate Limit</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            AI Tutor chat is limited to 30 requests per minute per user due to the higher
            computational cost of AI model inference.
          </p>
        </div>
      </DocsSection>

      {/* Get Conversation History */}
      <DocsSection
        id="history"
        title="Get Conversation History"
        description="Retrieve a paginated list of past conversations."
      >
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/ai-tutor/history"
          description="Retrieve a paginated list of the authenticated user's conversations with The Bird AI. Each entry includes a conversation summary, message count, and timestamps."
          auth={true}
          responseBody={`{
  "status": "success",
  "data": {
    "conversations": [
      {
        "id": "conv-uuid-001",
        "title": "Photosynthesis Discussion",
        "message_count": 8,
        "last_message_at": "2026-02-15T10:35:00Z",
        "created_at": "2026-02-15T10:30:00Z"
      },
      {
        "id": "conv-uuid-002",
        "title": "Grade 7 Math - Fractions",
        "message_count": 15,
        "last_message_at": "2026-02-14T16:20:00Z",
        "created_at": "2026-02-14T15:00:00Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 42
  }
}`}
          curlExample={`curl -X GET "http://localhost:8000/api/v1/ai-tutor/history?page=1&limit=20" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
        />
      </DocsSection>

      {/* Get Specific Conversation */}
      <DocsSection
        id="conversation-detail"
        title="Get Conversation Detail"
        description="Retrieve all messages in a specific conversation."
      >
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/ai-tutor/history/:conversationId"
          description="Get the full message history for a specific conversation. Messages are returned in chronological order, with each message showing the sender (user or ai), content, model used, and timestamp."
          auth={true}
          responseBody={`{
  "status": "success",
  "data": {
    "id": "conv-uuid-001",
    "title": "Photosynthesis Discussion",
    "messages": [
      {
        "id": "msg-uuid-001",
        "role": "user",
        "content": "Can you explain photosynthesis in simple terms?",
        "created_at": "2026-02-15T10:30:00Z"
      },
      {
        "id": "msg-uuid-002",
        "role": "ai",
        "content": "Photosynthesis is the process plants use to make their own food...",
        "model_used": "gemini-pro",
        "tokens_used": 165,
        "created_at": "2026-02-15T10:30:02Z"
      }
    ],
    "message_count": 8,
    "created_at": "2026-02-15T10:30:00Z"
  }
}`}
          curlExample={`curl -X GET http://localhost:8000/api/v1/ai-tutor/history/conv-uuid-001 \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
        />
      </DocsSection>

      {/* Delete Conversation */}
      <DocsSection
        id="delete-conversation"
        title="Delete Conversation"
        description="Delete a specific conversation and all its messages."
      >
        <DocsApiEndpoint
          method="DELETE"
          path="/api/v1/ai-tutor/history/:conversationId"
          description="Permanently delete a conversation and all associated messages. This action cannot be undone. Only the conversation owner can delete their conversations."
          auth={true}
          responseBody={`{
  "status": "success",
  "data": {
    "message": "Conversation deleted successfully."
  }
}`}
          curlExample={`curl -X DELETE http://localhost:8000/api/v1/ai-tutor/history/conv-uuid-001 \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
        />
      </DocsSection>

      {/* Voice Response */}
      <DocsSection
        id="voice"
        title="Voice Response"
        description="Convert text to speech using ElevenLabs integration."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/ai-tutor/voice"
          description="Generate an audio response from text using the ElevenLabs text-to-speech API. Returns a URL to the generated audio file. Useful for auditory learners or accessibility needs."
          auth={true}
          requestBody={`{
  "text": "Photosynthesis is the process plants use to make their own food from sunlight."
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "audio_url": "/api/v1/ai-tutor/audio/audio-uuid-001.mp3",
    "duration_seconds": 8.5,
    "voice_id": "default",
    "format": "mp3",
    "created_at": "2026-02-15T10:31:00Z"
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/ai-tutor/voice \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Photosynthesis is the process plants use to make their own food."}'`}
        />
      </DocsSection>

      {/* Usage Statistics */}
      <DocsSection
        id="stats"
        title="Usage Statistics"
        description="Get AI usage statistics for the authenticated user."
      >
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/ai-tutor/stats"
          description="Retrieve usage statistics for the authenticated user's AI tutor interactions. Includes total messages, tokens used, model breakdown, and usage trends over time."
          auth={true}
          responseBody={`{
  "status": "success",
  "data": {
    "total_conversations": 42,
    "total_messages": 356,
    "total_tokens_used": 89420,
    "model_breakdown": {
      "gemini-pro": 245,
      "claude-3.5-sonnet": 78,
      "gpt-4": 28,
      "grok": 5
    },
    "response_mode_breakdown": {
      "text": 340,
      "voice": 14,
      "video": 2
    },
    "usage_this_month": {
      "messages": 67,
      "tokens": 15230
    },
    "most_active_subject": "Mathematics",
    "average_session_length": 8.5
  }
}`}
          curlExample={`curl -X GET http://localhost:8000/api/v1/ai-tutor/stats \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
        />
      </DocsSection>

      {/* Example Integration */}
      <DocsSection
        id="integration-example"
        title="Integration Example"
        description="A complete example of a chat session using the AI Tutor API."
      >
        <DocsCodeBlock
          language="javascript"
          title="JavaScript - Complete Chat Session"
          code={`// 1. Login to get token
const loginRes = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'student@example.com', password: 'pass123' })
});
const { data: { access_token } } = await loginRes.json();

// 2. Send a message to the AI tutor
const chatRes = await fetch('/api/v1/ai-tutor/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${access_token}\`
  },
  body: JSON.stringify({
    message: 'Explain the water cycle for Grade 6',
    response_mode: 'text',
    task_type: 'general'
  })
});
const { data } = await chatRes.json();
console.log(data.ai_response);    // AI's explanation
console.log(data.model_used);      // e.g., "gemini-pro"
console.log(data.tokens_used);     // Token usage breakdown`}
        />
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link
          to="/docs/api/courses"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          &larr; Courses API
        </Link>
        <Link
          to="/docs/api/payments"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Payments API &rarr;
        </Link>
      </div>
    </div>
  );
};

export default AITutorApiPage;
