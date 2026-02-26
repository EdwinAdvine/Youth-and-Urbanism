# Changelog

All notable changes to the Urban Home School and Urban Bird platforms.

---

## v1.0.0 - February 2026

### Urban Home School v1 (UHS v1)

#### Multi-Role Platform
- **6 user roles**: Student, Parent, Instructor, Admin, Partner, Staff
- **296 frontend pages** across all role dashboards
- Role-based access control with JWT authentication
- Dedicated sidebar navigation for each role

#### Student Dashboard (80+ pages)
- Personalized dashboard with today's tasks, AI insights, progress
- Course enrollment, browsing, and wishlist management
- Practice: quizzes, assignments, projects with auto-grading
- Progress tracking: achievements, learning map, strengths analysis, weekly stories
- Community: friends, study groups, discussions, teacher Q&A
- Wallet: M-Pesa top-up, card payments, transaction history
- Support: how-to guides, contact support, notifications
- Account: profile, preferences, privacy, AI personality, avatar

#### Parent Dashboard (40+ pages)
- Children overview with activity monitoring
- AI-generated insights about child learning patterns
- CBC competency tracking and goal setting
- Communication center: messages, notifications, support
- Finance: subscription management, payment history, add-ons
- Reports: term summaries, transcripts, portfolio export
- Settings: consent management, privacy, family members

#### Instructor Dashboard (50+ pages)
- Course management with CBC alignment tools
- Assessment creation and submission grading
- Live sessions with WebRTC video conferencing
- Student analytics: progress pulse, performance, sentiment analysis
- Recognition system with badges and achievements
- Earnings dashboard with payout tracking
- Resource hub: AI prompts, CBC references, community lounge

#### Admin Dashboard (50+ pages)
- Platform overview with real-time pulse monitoring
- User management: roles, permissions, families, restrictions
- Content moderation and CBC alignment review
- AI system management: provider configuration, monitoring, content review
- Analytics: learning analytics, business analytics, compliance, custom insights
- Finance: money flow, subscription plans, invoices, partner management
- Operations: support tickets, moderation queue, system config, audit logs

#### Staff Dashboard (60+ pages)
- Content moderation and approval workflows
- Support ticket management with live support chat
- Student journey tracking and knowledge base management
- Content studio and assessment builder
- Platform health monitoring and custom reports
- Team performance and learning resources

#### Partner Dashboard (40+ pages)
- Sponsorship management and child progress tracking
- Impact reports and ROI metrics
- Funding management and budget tracking
- Content contributions and resource management
- Collaboration tools and support

#### Courses & Learning
- CBC-aligned course catalog with grade level filtering
- Course creation tools for instructors with syllabus builder
- Lesson player with progress tracking
- Enrollment management with payment integration
- Course ratings and reviews

#### Assessments
- Quiz, assignment, project, and exam types
- Auto-grading for objective questions
- Submission management and feedback
- Performance analytics

#### Payments (Multi-Gateway)
- M-Pesa STK Push integration (Safaricom)
- PayPal payment processing
- Stripe payment intents
- Wallet system with balance management
- Instructor payout system
- Revenue sharing (60/30/10 split)
- Refund processing

#### Community
- Forum with posts, replies, likes, and pinning
- Study groups and collaborative projects
- Teacher Q&A
- Shoutouts and recognition

#### Store
- E-commerce product catalog
- Shopping cart management
- Checkout with payment integration

#### Certificates
- Course completion certificates
- Public certificate validation
- PDF download

#### Public Pages
- Landing page with CBC learning areas
- Course catalog and detail pages
- Pricing plans (Free, Basic, Parents, Sponsor)
- About, Contact, How It Works
- Instructor public profiles
- Certificate validation
- Global search

### Urban Bird v1

#### AI Tutor (The Bird AI)
- Multi-AI orchestration with dynamic provider loading
- Supported providers: Google Gemini (default), Anthropic Claude, OpenAI GPT-4, Grok
- Task-based routing: general, reasoning, creative, research
- Automatic failover between providers
- Conversation history management with JSONB storage
- Personalized learning paths based on student performance
- Admin-configurable provider settings with encrypted API keys

#### Voice Mode
- Text-to-speech via ElevenLabs integration
- Voice responses for tutoring sessions

#### Video Lessons
- AI-generated video content via Synthesia
- Video lesson integration in courses

#### CoPilot
- AI-powered sidebar assistant
- Accessibility features
- Performance insights
- Mobile-responsive drawer

#### AI Agent Customization
- Personalized AI tutor names
- Personality customization
- Learning style adaptation

### Infrastructure

#### Security
- JWT authentication with bcrypt password hashing
- Refresh token rotation
- Token blacklisting via Redis
- Fernet encryption for API keys
- Role-based access control (RBAC)
- Audit logging for admin/staff operations
- CORS configuration
- KDPA 2019 compliance features

#### Real-time Features
- WebSocket channels for all 6 roles
- WebRTC video conferencing for live sessions
- Yjs collaborative document editing
- Live support chat
- Real-time notifications

#### Database
- PostgreSQL 16 with UUID primary keys
- JSONB columns for flexible metadata
- Soft deletes with is_deleted flag
- Alembic migrations
- Redis caching for sessions and frequently accessed data

#### DevOps
- Docker Compose for local development
- Contabo VDS deployment configuration
- Nginx reverse proxy setup
- Let's Encrypt SSL/TLS
- Automated database backups
