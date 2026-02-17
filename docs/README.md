# Urban Home School v1 (UHS v1) & Urban Bird v1 Documentation

> **Version 1.0** | Last updated: February 2026

Welcome to the official documentation for **Urban Home School** and **The Urban Bird AI**.

---

## Products

### Urban Home School v1 (UHS v1)
A full-stack educational platform for Kenyan children featuring personalized learning aligned with the CBC (Competency-Based Curriculum). Supports six user roles: Student, Parent, Instructor, Admin, Partner, and Staff.

### Urban Bird v1
The AI-powered tutoring system powering UHS. Features multi-AI orchestration (Gemini, Claude, GPT-4, Grok), voice responses (ElevenLabs), video lessons (Synthesia), and an intelligent CoPilot assistant.

---

## Documentation Structure

### Technical Documentation (`technical/`)
- [Architecture Overview](technical/architecture-overview.md)
- [Getting Started](technical/getting-started.md)
- [API Reference](technical/api-reference/README.md) - Every endpoint with examples
- [Database Reference](technical/database/schema-overview.md)
- [Frontend Architecture](technical/frontend/component-architecture.md)
- [AI System / Urban Bird](technical/ai-system/orchestrator.md)
- [Payment System](technical/payments/overview.md)
- [Real-time Features](technical/realtime/websockets.md)
- [Security](technical/security/authentication-flow.md)
- [Deployment](technical/deployment/docker-setup.md)

### User Guide (`user-guide/`)
- [Getting Started](user-guide/getting-started.md)
- **UHS v1**: [Student](user-guide/uhs-v1/student-guide.md) | [Parent](user-guide/uhs-v1/parent-guide.md) | [Instructor](user-guide/uhs-v1/instructor-guide.md) | [Partner](user-guide/uhs-v1/partner-guide.md) | [Courses](user-guide/uhs-v1/courses.md) | [Payments](user-guide/uhs-v1/payments.md) | [Forum](user-guide/uhs-v1/forum.md) | [Store](user-guide/uhs-v1/store.md) | [Certificates](user-guide/uhs-v1/certificates.md)
- **Urban Bird v1**: [AI Tutor](user-guide/urban-bird-v1/ai-tutor.md) | [CoPilot](user-guide/urban-bird-v1/copilot.md) | [Voice Mode](user-guide/urban-bird-v1/voice-mode.md) | [Learning Paths](user-guide/urban-bird-v1/learning-paths.md)
- [FAQ](user-guide/faq.md)

### Planning Documents (`planning/`)
Historical planning docs: [Implementation Plan](planning/implementation-plan.md) | [AI Functions](planning/ai-functions-inventory.md) | Dashboard plans for [Admin](planning/admin-dashboard-plan.md) | [Instructor](planning/instructor-dashboard-plan.md) | [Parent](planning/parent-dashboard-plan.md) | [Partner](planning/partner-dashboard-plan.md) | [Student](planning/student-dashboard-plan.md) | [Staff](planning/staff-teachers-plan.md)

### [Changelog](CHANGELOG.md) | [Screenshots Guide](screenshots/README.md) | [Completion Reports](completion-reports/)

---

## Quick Links

| Resource | URL |
|----------|-----|
| Frontend Dev Server | http://localhost:3000 |
| Backend API Server | http://localhost:8000 |
| Swagger API Docs | http://localhost:8000/docs |
| User Documentation | http://localhost:3000/docs |
