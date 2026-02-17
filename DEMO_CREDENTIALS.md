# Demo Login Credentials

**Login URL:** http://localhost:3000
**API Docs:** http://localhost:8000/docs

---

## Quick Start (1 user per role)

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Admin | `admin@urbanhomeschool.co.ke` | `Admin@2026!` | `/dashboard/admin` |
| Staff | `staff@urbanhomeschool.co.ke` | `Staff@2026!` | `/dashboard/staff` |
| Instructor | `instructor@urbanhomeschool.co.ke` | `Instructor@2026!` | `/dashboard/instructor` |
| Parent | `parent@urbanhomeschool.co.ke` | `Parent@2026!` | `/dashboard/parent` |
| Student | `student@urbanhomeschool.co.ke` | `Student@2026!` | `/dashboard/student` |
| Partner | `partner@urbanhomeschool.co.ke` | `Partner@2026!` | `/dashboard/partner` |

> Seeded by: `python seed_users.py`

---

## Dashboard Routing

After login, every user is automatically redirected to `/dashboard/{role}`:

| Role | Dashboard URL | Description |
|------|--------------|-------------|
| Admin | `/dashboard/admin` | Platform administration, system config, user management, revenue reports |
| Staff | `/dashboard/staff` | Support tickets, content review, platform health, student journeys |
| Instructor | `/dashboard/instructor` | Course management, student analytics, earnings, live sessions |
| Parent | `/dashboard/parent` | Children's progress, AI alerts, mood tracking, family goals, reports |
| Student | `/dashboard/student` | AI tutor, courses, assignments, quizzes, wallet, gamification |
| Partner | `/dashboard/partner` | Sponsorship impact, reports, messaging |

---

## Parent with Children (Demo Family)

> Seeded by: `python seed_parent_data.py`

### Parent Account

| Field | Value |
|-------|-------|
| Name | Sarah Mwangi |
| Email | `parent.demo@urbanhomeschool.co.ke` |
| Password | `Parent@2026!` |
| Relationship | Mother |
| Dashboard | `/dashboard/parent` |

### Children (Students)

| Name | Grade | Admission No. | Email | Password | Dashboard |
|------|-------|--------------|-------|----------|-----------|
| Alex Mwangi | ECD 2 | UHS-ECD-001 | `uhs-ecd-001@student.urbanhomeschool.co.ke` | `Student@2026!` | `/dashboard/student` |
| Emma Mwangi | Grade 3 | UHS-P3-001 | `uhs-p3-001@student.urbanhomeschool.co.ke` | `Student@2026!` | `/dashboard/student` |
| James Mwangi | Grade 6 | UHS-P6-001 | `uhs-p6-001@student.urbanhomeschool.co.ke` | `Student@2026!` | `/dashboard/student` |
| Grace Mwangi | Grade 8 | UHS-JS8-001 | `uhs-js8-001@student.urbanhomeschool.co.ke` | `Student@2026!` | `/dashboard/student` |

Each child has an AI tutor (Birdy) and learning profile data.

---

## Comprehensive Seed (54 Users)

> Seeded by: `python seed_comprehensive.py`

All users of the same role share the same password: `{Role}@2026!`

### Admins (4)

| Name | Email | Position |
|------|-------|----------|
| Edwin Odhiambo | `edwin.odhiambo@urbanhomeschool.co.ke` | Super Admin |
| Amina Hassan | `amina.hassan@urbanhomeschool.co.ke` | System Admin |
| Tom Mboya | `tom.mboya@urbanhomeschool.co.ke` | Security Admin |
| Lilian Cheruiyot | `lilian.cheruiyot@urbanhomeschool.co.ke` | Finance Admin |

### Staff (8)

8 staff members across departments: Support, Content, QA, Operations, Moderation, Curriculum, IT, Finance. Emails follow the pattern `firstname.lastname@urbanhomeschool.co.ke`. Password: `Staff@2026!`

### Instructors (10)

10 instructors covering: Mathematics, English, Kiswahili, Science & Technology, Social Studies, Creative Arts, Religious Education, Computer Science, Physical Education, Environmental Education. Password: `Instructor@2026!`

### Parents (10)

10 parents (mix of mothers and fathers) from counties across Kenya. Password: `Parent@2026!`

### Students (16)

16 students spanning ECD 1 through Grade 9, each with:
- AI tutor (Birdy, Einstein, Nyota, Simba, Safari, etc.)
- Learning profile (visual, auditory, kinesthetic, reading/writing)
- Performance metrics

Password: `Student@2026!`

### Partners (6)

| Organization | Partnership Type |
|-------------|-----------------|
| Safaricom Foundation | Corporate Sponsor |
| EduTech Partners Ltd | Content Provider |
| Equity Bank Foundation | Financial Sponsor |
| UNICEF Kenya | NGO Partner |
| Longhorn Publishers | Content Provider |
| Kenya Red Cross | Community Partner |

Password: `Partner@2026!`

---

## User Statistics Summary

### By Seed Script

| Seed Script | Command | Total Users |
|-------------|---------|-------------|
| Basic | `python seed_users.py` | 6 (1 per role) |
| Comprehensive | `python seed_comprehensive.py` | 54 |
| Parent Demo | `python seed_parent_data.py` | 5 (1 parent + 4 children) |

### Comprehensive Seed Breakdown

| Role | Count | Password |
|------|-------|----------|
| Admin | 4 | `Admin@2026!` |
| Staff | 8 | `Staff@2026!` |
| Instructor | 10 | `Instructor@2026!` |
| Parent | 10 | `Parent@2026!` |
| Student | 16 | `Student@2026!` |
| Partner | 6 | `Partner@2026!` |
| **Total** | **54** | |

### Additional Data (Comprehensive Seed)

| Data Type | Count |
|-----------|-------|
| AI Providers | 6 (Gemini, Claude, GPT-4, Grok, ElevenLabs, Synthesia) |
| CBC Courses | 15 |
| AI Tutors | 16 (1 per student) |
| Notifications | ~200+ (role-specific) |

### Parent Demo Data

| Data Type | Count |
|-----------|-------|
| Children | 4 (ECD 2, Grade 3, Grade 6, Grade 8) |
| Mood Entries | ~90 (30 days) |
| Family Goals | 4 |
| AI Alerts | 3 |
| Consent Records | 48 |
| Weekly Reports | 4 |

---

## How to Seed

```bash
# Start database first
docker compose -f docker-compose.dev.yml up -d

# Basic (6 users)
cd backend && python seed_users.py

# Full platform data (54 users + courses + AI providers)
cd backend && python seed_comprehensive.py

# Parent demo with children
cd backend && python seed_parent_data.py

# Additional seeds
cd backend && python seed_categories.py
cd backend && python seed_cbc_competencies.py
```
