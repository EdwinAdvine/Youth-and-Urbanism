Urban Home School - Complete AI Functions Inventory
Context
This document catalogs every AI-related function across the full stack (backend services, API routes, frontend services, components, stores, models, and schemas). The project uses a Multi-AI Orchestration Layer that dynamically routes queries to the best provider (Gemini, Claude, OpenAI, Grok) with voice (ElevenLabs) and video (Synthesia) support.

1. CORE AI ORCHESTRATOR
File: backend/app/services/ai_orchestrator.py

#	Function	Line	Description
1	AIOrchestrator.__init__(db)	65	Initializes orchestrator with optional DB session; sets up empty provider caches for text/voice/video
2	AIOrchestrator.load_providers()	81	Loads active AI providers from DB, decrypts API keys, initializes SDK clients (Gemini/Claude/OpenAI/ElevenLabs), categorizes by type. Falls back to env vars if DB fails
3	AIOrchestrator._initialize_provider(provider)	154	Decrypts a single provider's API key and instantiates the correct SDK client (Gemini, Anthropic, OpenAI, or ElevenLabs). Caches the client
4	AIOrchestrator._initialize_fallback_providers()	218	Initializes fallback providers from environment variables (primarily Gemini + ElevenLabs) when DB providers are unavailable
5	AIOrchestrator.route_query(query, context, response_mode)	272	Main entry point. Classifies query task type, selects best provider, executes query, converts response mode (text/voice/video). Returns {message, response_mode, audio_url, video_url, provider_used, metadata}
6	AIOrchestrator._handle_text_query(query, context, task_type)	333	Routes text queries: selects best text provider and executes. Returns text response dict
7	AIOrchestrator._handle_voice_query(query, context, task_type)	371	Gets text response first, then converts to audio via ElevenLabs. Returns response with audio_url
8	AIOrchestrator._handle_video_query(query, context, task_type)	414	Placeholder for Synthesia video generation. Currently returns text with video_url: None
9	AIOrchestrator._select_provider(task_type, response_mode)	458	Selects best provider using priority: active + mode match + specialization match > recommended > general > first available
10	AIOrchestrator._execute_text_query(provider, query, context)	525	Executes query against specific provider API: Gemini.generate_content(), Anthropic.messages.create(), or OpenAI.chat.completions.create(). Includes retry/fallback logic
11	AIOrchestrator._execute_fallback_query(query, context)	594	Attempts Gemini fallback when primary provider fails. Returns graceful error if all fail
12	AIOrchestrator._convert_to_voice(text_response)	627	Converts text to speech using ElevenLabs. Placeholder for audio file storage/URL generation
13	AIOrchestrator.chat(message, system_message, task_type, ...)	673	Unified chat interface supporting multiple calling patterns (message/messages/conversation_history). Bridges to route_query()
14	AIOrchestrator.process_request(task_type, user_prompt, ...)	715	Process AI request used by instructor services. Returns response with response key for compatibility
15	AIOrchestrator._classify_task(query)	741	Keyword-based task classifier. Returns reasoning, creative, research, or general based on keyword matching
16	AIOrchestrator._build_prompt(query, context)	783	Builds enhanced prompt with student name, grade level, conversation history (last 3 exchanges), and system message
17	get_orchestrator(db)	836	Gets or creates singleton AIOrchestrator instance. Ensures one orchestrator with cached providers
18	reload_providers(db)	858	Reloads AI providers from DB. Called when admin updates provider configuration
2. STUDENT AI TUTOR SERVICE
File: backend/app/services/student/ai_tutor_service.py

#	Function	Line	Description
19	AITutorService.__init__(db)	21	Initializes with DB session and orchestrator reference
20	AITutorService.chat_with_ai(student_id, message, conversation_history)	25	Chat with AI tutor using student context (grade level, learning style, mood, performance). Returns {message, conversation_id, provider, timestamp}
21	AITutorService.get_learning_path(student_id)	118	Generates AI-powered daily learning path with 3-5 activities including topics, duration, difficulty, objectives
22	AITutorService.create_journal_entry(student_id, content, mood_tag)	149	Creates journal entry with AI-generated insights analyzing student reflections for themes and next steps
23	AITutorService.get_journal_entries(student_id, limit)	188	Retrieves student's journal entries with AI insights (DB query only)
24	AITutorService.explain_concept(student_id, concept, context)	198	Provides age-appropriate AI explanation of a concept based on student's grade level
25	AITutorService.send_teacher_question(student_id, teacher_id, question)	231	Sends question to teacher with AI-generated summary of the question
26	AITutorService.get_teacher_responses(student_id)	263	Retrieves AI-summarized teacher responses to student questions
27	AITutorService.generate_voice_response(student_id, text)	291	Placeholder for ElevenLabs TTS. Returns {audio_url: None, text, voice_id, timestamp}
3. INSTRUCTOR AI INSIGHT SERVICE
File: backend/app/services/instructor/ai_insight_service.py

#	Function	Line	Description
28	generate_daily_insights(db, instructor_id, insight_date)	103	Batch-generated nightly AI insights. Gathers real-time data (pending submissions, upcoming sessions, at-risk students, earnings) and uses AI to produce prioritized, actionable insights. Falls back to deterministic insights if AI fails
29	analyze_cbc_alignment(db, course_id, instructor_id)	318	AI-powered Kenya CBC (Competency-Based Curriculum) alignment analysis. Returns alignment score (0-100), covered/missing competencies, and improvement suggestions
4. PARENT AI INSIGHTS SERVICE
File: backend/app/services/parent/ai_insights_service.py

#	Function	Line	Description
30	ParentAIInsightsService.get_ai_tutor_summary(db, parent_id, child_id)	32	Parent-friendly AI tutor summary: engagement metrics, topics, strengths, and AI-generated explanation of child's progress
31	ParentAIInsightsService.get_learning_style_analysis(db, parent_id, child_id)	134	Analyzes child's learning style (visual/auditory/kinesthetic) with traits, preferred activities, optimal times, and parent recommendations
32	ParentAIInsightsService.get_support_tips(db, parent_id, child_id)	216	Practical home support tips in 4 categories: academic, emotional, practical, motivational
33	ParentAIInsightsService.get_ai_planning(db, parent_id, child_id)	308	Upcoming AI-planned topics with learning objectives, pacing, and parent involvement opportunities
34	ParentAIInsightsService.get_curiosity_patterns(db, parent_id, child_id)	367	Child's curiosity pattern analysis: question types, exploration behavior, top interests with engagement scores
35	ParentAIInsightsService.get_warning_signs(db, parent_id, child_id)	442	Early warning signs analysis with overall risk assessment, risk/protective factors, intervention recommendations
36	ParentAIInsightsService.get_alerts_list(db, parent_id, child_id, severity, is_read)	512	Filterable list of AI-generated alerts with unread and critical counts
5. ADMIN AI MONITORING SERVICE
File: backend/app/services/admin/ai_monitoring_service.py

#	Function	Line	Description
37	AIMonitoringService.get_conversation_flags(db, page, page_size, severity_filter)	42	Paginated flagged AI conversations (safety/bias/quality/hallucination issues) with student names and severity summary
38	AIMonitoringService.get_content_review_queue(db, page, page_size)	151	AI-generated content awaiting human review with approval rates and override stats
39	AIMonitoringService.get_personalization_audits(db)	243	Learning path audit data aggregated by subject. Shows personalization effectiveness and bias metrics
40	AIMonitoringService.get_performance_overview(db)	302	AI provider performance metrics: latency, accuracy, cost, error rate, satisfaction scores
41	AIMonitoringService.get_drift_analysis(db)	401	Prompt drift analysis comparing accuracy across 8-week periods per model. Identifies degradation
42	AIMonitoringService.get_safety_dashboard(db)	452	Safety incident summary with 7-day trends, resolution metrics, and safety score
6. ADMIN AI QUERY SERVICE
File: backend/app/services/admin/ai_query_service.py

#	Function	Line	Description
43	_match_nl_query(query)	121	Matches natural-language query against pre-defined patterns for safe SQL translation
44	_validate_sql(sql)	131	Validates SQL is read-only (rejects INSERT/UPDATE/DELETE/DROP/ALTER/TRUNCATE/CREATE/GRANT/REVOKE)
45	AIQueryService.execute_nl_query(db, query)	144	Translates natural-language analytics queries to safe SQL, executes with timeout/size limits, returns structured results with optional chart config
46	AIQueryService.get_available_queries()	231	Returns list of example natural-language queries the system can handle
7. BACKEND API ROUTES
7a. Main AI Tutor Routes (backend/app/api/v1/ai_tutor.py)
#	Endpoint	Line	Description
47	POST /ai-tutor/chat	128	Core tutoring endpoint. Validates student, loads conversation history, routes to orchestrator, saves conversation
48	GET /ai-tutor/history	250	Retrieves paginated conversation history between student and AI tutor
49	PUT /ai-tutor/response-mode	322	Updates preferred response mode (text/voice/video)
50	GET /ai-tutor/status	376	Gets AI tutor status and metrics for student
51	POST /ai-tutor/reset	431	Resets conversation history (student or admin access)
52	GET /ai-tutor/health	498	Health check for AI Tutor service
7b. Student AI Routes (backend/app/api/v1/student/ai_tutor.py)
#	Endpoint	Line	Description
53	POST /student/ai/chat	46	Student-specific chat with AI tutor
54	GET /student/ai/learning-path	92	AI-generated daily learning path
55	GET /student/ai/journal	129	Retrieve journal entries with AI insights
56	POST /student/ai/journal	176	Create journal entry with AI insights generation
57	POST /student/ai/explain	225	Get AI explanation of a concept
58	POST /student/ai/teacher-question	271	Send question to teacher with AI summary
59	GET /student/ai/teacher-responses	326	Get teacher responses to AI-summarized questions
60	POST /student/ai/voice	358	Generate voice response (ElevenLabs placeholder)
7c. Parent AI Routes (backend/app/api/v1/parent/ai_insights.py)
#	Endpoint	Line	Description
61	GET /parent/ai/summary/{child_id}	35	AI tutor summary for child
62	GET /parent/ai/learning-style/{child_id}	64	Learning style analysis
63	GET /parent/ai/support-tips/{child_id}	92	Practical support tips
64	GET /parent/ai/planning/{child_id}	119	AI learning plan for child
65	GET /parent/ai/patterns/{child_id}	147	Curiosity pattern analysis
66	GET /parent/ai/warnings/{child_id}	175	Early warning signs
67	GET /parent/ai/alerts	203	Filterable AI alerts list
68	GET /parent/ai/alerts/{alert_id}	232	Alert detail with AI recommendations
69	PUT /parent/ai/alerts/{alert_id}/read	294	Mark alert as read
70	PUT /parent/ai/alerts/{alert_id}/dismiss	352	Dismiss alert
71	GET /parent/ai/coaching/{child_id}	383	AI parent coaching content
7d. Admin AI Monitoring Routes (backend/app/api/v1/admin/ai_monitoring.py)
#	Endpoint	Line	Description
72	GET /ai-monitoring/conversations/flags	32	Flagged AI conversations with severity filtering
73	GET /ai-monitoring/content/review-queue	66	AI content pending human review
74	GET /ai-monitoring/personalization/audits	96	Personalization audit data
75	GET /ai-monitoring/performance/overview	122	Provider performance metrics
76	GET /ai-monitoring/safety/dashboard	147	Safety incident dashboard
7e. Admin AI Provider Management (backend/app/api/v1/admin/ai_providers.py)
#	Endpoint	Line	Description
77	GET /api-providers/	60	List all AI providers (optional active filter)
78	GET /api-providers/recommended	120	Get recommended providers (public)
79	POST /api-providers/	176	Create new AI provider with encrypted API key
80	GET /api-providers/{provider_id}	251	Get specific provider details
81	PUT /api-providers/{provider_id}	302	Update provider configuration
82	DELETE /api-providers/{provider_id}	383	Deactivate provider (soft delete)
7f. AI Agent Profile Routes (backend/app/api/v1/ai_agent_profile.py)
#	Endpoint	Line	Description
83	GET /ai-agent/profile	40	Get user's AI agent customization (name, avatar, persona, language, expertise, response style)
84	PUT /ai-agent/profile	69	Update AI agent profile
85	POST /ai-agent/profile/reset	110	Reset to default AI personality
8. DATABASE MODELS
#	Model	File	Description
86	AITutor	backend/app/models/ai_tutor.py	Per-student AI tutor with conversation history (JSONB), learning path, performance metrics, response mode preference
87	AIProvider	backend/app/models/ai_provider.py	Admin-configurable provider: name, type (text/voice/video/multimodal), encrypted API key, specialization, cost tracking
88	AIAgentProfile	backend/app/models/ai_agent_profile.py	Per-user AI customization: agent name, persona, language, expertise focus, response style
89	AIConversationFlag	backend/app/models/admin/ai_monitoring.py	Flagged conversations: type (safety/bias/quality/hallucination), severity, snippet, review status
90	AIContentReview	backend/app/models/admin/ai_monitoring.py	Content review queue: content type, flagged issues, approval status
91	AIPerformanceMetric	backend/app/models/admin/ai_monitoring.py	Provider metrics: latency, accuracy, cost, throughput per model per period
92	AIAlert	backend/app/models/parent/ai_alert.py	Parent alerts: engagement drops, performance declines, milestones, content concerns with AI recommendations
93	InstructorDailyInsight	backend/app/models/instructor/instructor_ai_insight.py	Batch-generated nightly insights with priority, category, action URLs, AI rationale
94	InstructorCBCAnalysis	backend/app/models/instructor/instructor_ai_insight.py	CBC alignment analysis: score, covered/missing competencies, suggestions
9. FRONTEND AI SERVICES
9a. AI Tutor Service (frontend/src/services/aiTutorService.ts)
#	Function	Line	Description
95	sendMessage(request: ChatRequest)	57	POST /api/v1/ai-tutor/chat - Send message to AI tutor with context
96	getHistory(limit, offset)	68	GET /api/v1/ai-tutor/history - Retrieve paginated conversation history
97	updateResponseMode(mode)	79	PUT /api/v1/ai-tutor/response-mode - Switch text/voice/video
98	getStatus()	89	GET /api/v1/ai-tutor/status - Tutor metrics and learning path
99	resetConversation()	98	POST /api/v1/ai-tutor/reset - Clear conversation history
100	healthCheck()	106	GET /api/v1/ai-tutor/health - Verify AI service is running
9b. Student AI Service (frontend/src/services/student/studentAIService.ts)
#	Function	Line	Description
101	chatWithAI(data)	13	POST /api/v1/student/ai/chat - Chat with AI tutor including conversation context
102	getLearningPath()	34	GET /api/v1/student/ai/learning-path - Personalized learning path
103	getJournalEntries(limit)	51	GET /api/v1/student/ai/journal - Journal entries with AI insights
104	createJournalEntry(data)	64	POST /api/v1/student/ai/journal - Create entry with mood tag
105	explainConcept(data)	87	POST /api/v1/student/ai/explain - AI explanation of a concept
106	sendTeacherQuestion(data)	108	POST /api/v1/student/ai/teacher-question - Question with AI summary
107	getTeacherResponses()	130	GET /api/v1/student/ai/teacher-responses - AI-summarized responses
108	generateVoiceResponse(text)	150	POST /api/v1/student/ai/voice - ElevenLabs TTS generation
9c. Parent AI Service (frontend/src/services/parentAIService.ts)
#	Function	Line	Description
109	getAITutorSummary(childId)	23	GET /parent/ai/summary/{childId} - AI tutor interaction summary
110	getLearningStyleAnalysis(childId)	31	GET /parent/ai/learning-style/{childId} - How child learns best
111	getSupportTips(childId)	39	GET /parent/ai/support-tips/{childId} - Home support recommendations
112	getAIPlanning(childId)	47	GET /parent/ai/planning/{childId} - Upcoming AI-planned topics
113	getCuriosityPatterns(childId)	55	GET /parent/ai/patterns/{childId} - Curiosity & interest analysis
114	getWarningSignsAnalysis(childId)	63	GET /parent/ai/warnings/{childId} - Early warning signs
115	getAlertsList(params)	71	GET /parent/ai/alerts - Filterable alert list
116	getAlertDetail(alertId)	83	GET /parent/ai/alerts/{alertId} - Alert detail
117	markAlertRead(alertId)	91	PUT /parent/ai/alerts/{alertId}/read - Mark read
118	dismissAlert(alertId)	99	PUT /parent/ai/alerts/{alertId}/dismiss - Dismiss alert
119	getParentCoaching(childId)	106	GET /parent/ai/coaching/{childId} - AI coaching content
10. FRONTEND STORES (State Management)
10a. CoPilot Store (frontend/src/store/coPilotStore.ts)
#	Function	Line	Description
120	sendMessage(message)	164	Primary AI chat function. Sends message to POST /api/v1/ai-tutor/chat with JWT auth, conversation history, and context. Processes AI response
121	createSession(role)	108	Creates new AI conversation session for specific role
122	switchSession(sessionId)	125	Switch between existing sessions
123	deleteSession(sessionId)	133	Remove a session
124	setActiveRole(role)	94	Switch between user roles (student/parent/teacher/admin/partner/staff)
125	detectDashboardType(pathname)	237	Auto-detect current user role from URL path
126	addChatMessage(message)	265	Add message to local chat history
127	updateMessageStatus(messageId, status)	271	Track message delivery status
128	clearChatMessages()	279	Clear all chat messages
10b. Chat Store (frontend/src/store/chatStore.ts)
#	Function	Line	Description
129	addMessage(message)	21	Add new message with auto-generated ID and timestamp
130	setIsTyping(isTyping)	42	Track AI typing indicator
131	setBirdExpression(expression)	46	Set bird avatar expression (happy/thinking/excited/listening)
132	clearChat()	50	Reset chat history
133	loadChatHistory(messages)	58	Load previous messages from backend
11. FRONTEND COMPONENTS
11a. BirdChatPage (frontend/src/components/bird-chat/BirdChatPage.tsx)
#	Function	Line	Description
134	loadHistory()	26	Loads conversation history from backend via aiTutorService.getHistory()
135	handleSendMessage(message)	50	Sends message to AI tutor, adds user + AI response to chat, handles audio/video URLs
136	handleQuickAction(action)	94	Triggers quick action messages (story-time, fun-facts, science-explorer, draw-something)
137	handleNewChat()	106	Resets conversation via aiTutorService.resetConversation()
138	handleResponseModeChange(mode)	117	Switch response mode via aiTutorService.updateResponseMode()
11b. CoPilotContent (frontend/src/components/co-pilot/CoPilotContent.tsx)
#	Function	Line	Description
139	handleSendMessage(message)	75	Send user message with role-based AI responses and simulated delay
140	handleQuickAction(action)	102	Handle predefined quick action buttons
141	Role-based response templates	37-73	Student: progress analysis; Parent: child reports; Teacher: class analytics; Admin: system metrics; Partner: collaboration insights
11c. AgentProfileSettings (frontend/src/components/co-pilot/AgentProfileSettings.tsx)
#	Function	Line	Description
142	loadProfile()	71	GET /api/v1/ai-agent/profile - Load AI agent customization
143	saveProfile()	82	PUT /api/v1/ai-agent/profile - Save customized settings
144	resetProfile()	96	POST /api/v1/ai-agent/profile/reset - Reset to default
145	toggleExpertise(subject)	110	Toggle expertise focus areas (9 subjects: Math, Science, English, Kiswahili, Social Studies, Creative Arts, Technology, Health, Life Skills)
11d. CoPilotPerformance (frontend/src/components/co-pilot/CoPilotPerformance.tsx)
#	Function	Line	Description
146	checkDeviceCapabilities()	16	Detects low-end devices (memory < 4GB, slow network, mobile) and applies AI chat optimizations
147	optimizeScrolling()	71	Scroll virtualization and lazy loading for long AI message lists
11e. CoPilotAccessibility (frontend/src/components/co-pilot/CoPilotAccessibility.tsx)
#	Function	Line	Description
148	screenReaderAnnouncements()	13	ARIA live region announcements for AI chat state changes
149	keyboardNavigation()	28	Tab/Shift+Tab/Escape keyboard shortcuts for AI sidebar
11f. ChatMessages - Bird Chat (frontend/src/components/bird-chat/ChatMessages.tsx)
#	Function	Line	Description
150	renderMessageContent(content)	49	Parses AI response markdown formatting (bold, lists, line breaks)
151	setBirdExpression effect	26	Updates bird avatar: thinking when AI typing, happy on response, listening on user send
12. EXTERNAL AI PROVIDERS SUMMARY
Provider	Type	Usage	Status
Google Gemini Pro	Text	Default tutor for reasoning & general education	Active
Anthropic Claude 3.5 Sonnet	Text	Creative tasks & detailed explanations	Active
OpenAI GPT-4	Text	Fallback model for general queries	Active
X.AI Grok	Text	Research & current events	Active (when available)
ElevenLabs	Voice	Text-to-speech for voice responses	Placeholder
Synthesia	Video	AI-generated video lessons	Not yet implemented
TOTAL COUNT: 151 AI-related functions across the full stack
Breakdown:

Core Orchestrator: 18 functions
Student AI Tutor Service: 9 functions
Instructor AI Insight Service: 2 functions
Parent AI Insights Service: 7 functions
Admin AI Monitoring Service: 6 functions
Admin AI Query Service: 4 functions
Backend API Routes: 39 endpoints
Database Models: 9 models
Frontend Services: 25 functions
Frontend Stores: 14 functions
Frontend Components: 18 functions