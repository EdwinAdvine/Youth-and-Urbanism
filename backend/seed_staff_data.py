"""
Seed script for Staff Dashboard data.
Creates production-like test data for all staff features.

Usage:
    cd backend/
    python seed_staff_data.py
"""
import asyncio
import sys
import os
import random
from datetime import datetime, timedelta, date
from uuid import uuid4

# Ensure the backend directory is in the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load .env.development before importing app modules
from dotenv import load_dotenv
load_dotenv(".env.development")

# Safety guard
_environment = os.getenv("ENVIRONMENT", "development").lower()
if _environment == "production":
    print("ERROR: Seed script cannot run in production environment.")
    sys.exit(1)

from sqlalchemy import select
from app.database import Base, init_db
from app.models import *  # noqa: F403
from app.models.user import User
from app.models.student import Student
from app.models.staff import (
    StaffProfile, StaffTeam,
    StaffTicket, StaffTicketMessage,
    SLAPolicy,
    StaffModerationItem, ReviewDecision,
    KBCategory, KBArticle,
    StaffContentItem,
    AdaptiveAssessment, AssessmentQuestion,
    LiveSession,
    ReportDefinition,
    StudentJourney, FamilyCase, CaseNote,
)
from app.utils.security import get_password_hash


# Kenyan names for realistic data
FIRST_NAMES = [
    "Amina", "Brian", "Catherine", "Daniel", "Esther", "Felix", "Grace",
    "Hassan", "Irene", "James", "Kevin", "Lucy", "Moses", "Nancy",
    "Oscar", "Patricia", "Quentin", "Rose", "Samuel", "Teresa",
    "Victor", "Wanjiku", "Xavier", "Yvonne", "Zuberi", "Achieng",
    "Baraka", "Chebet", "Dorcas", "Edwin", "Fatuma", "Gitau",
    "Halima", "Ibrahim", "Janet", "Kamau", "Linet", "Mwangi",
    "Njeri", "Omondi", "Purity", "Rashid", "Sylvia", "Thuku",
    "Uma", "Violet", "Wekesa", "Yusuf", "Zawadi", "Atieno",
]
LAST_NAMES = [
    "Kamau", "Odhiambo", "Wanjiru", "Kiplagat", "Mwangi", "Akinyi",
    "Otieno", "Njeri", "Korir", "Wambui", "Ochieng", "Mukami",
    "Kibet", "Nyambura", "Ouma", "Cheruiyot", "Wairimu", "Ndungu",
    "Kipchoge", "Muthoni", "Hassan", "Wekesa", "Adhiambo", "Gitau",
    "Juma", "Karanja", "Mutua", "Nganga", "Owino", "Rotich",
]
DEPARTMENTS = ["Support", "Content", "Moderation", "Training", "Operations"]
POSITIONS = [
    "Support Specialist", "Content Reviewer", "Moderation Officer",
    "Training Coordinator", "Senior Support Lead", "Content Editor",
    "Quality Assurance", "Student Success Manager", "Technical Support",
    "Curriculum Specialist",
]


async def seed_staff_teams(session):
    """Seed staff teams."""
    print("Seeding staff teams...")
    teams = []
    team_data = [
        ("Support Team A", "Support"),
        ("Support Team B", "Support"),
        ("Content Review", "Content"),
        ("Content Creation", "Content"),
        ("Moderation Squad", "Moderation"),
        ("Training & Onboarding", "Training"),
        ("Platform Operations", "Operations"),
    ]
    for name, dept in team_data:
        team = StaffTeam(
            id=uuid4(),
            name=name,
            department=dept,
            description=f"{name} - {dept} department",
            is_active=True,
        )
        teams.append(team)
    session.add_all(teams)
    await session.flush()
    print(f"  Created {len(teams)} teams")
    return teams


async def seed_staff_users(session, teams):
    """Seed 50 staff members with profiles."""
    print("Seeding staff users + profiles...")
    staff_users = []
    profiles = []

    for i in range(50):
        first = FIRST_NAMES[i % len(FIRST_NAMES)]
        last = LAST_NAMES[i % len(LAST_NAMES)]
        full_name = f"{first} {last}"
        dept = DEPARTMENTS[i % len(DEPARTMENTS)]
        pos = POSITIONS[i % len(POSITIONS)]
        team = teams[i % len(teams)]

        user = User(
            id=uuid4(),
            email=f"staff{i+1}@tuhs.co.ke",
            password_hash=get_password_hash("password123"),
            role="staff",
            is_active=True,
            is_verified=True,
            profile_data={
                "full_name": full_name,
                "phone": f"+2547{random.randint(10000000, 99999999)}",
                "department": dept,
                "position": pos,
            },
        )
        staff_users.append(user)
        session.add(user)
        await session.flush()

        profile = StaffProfile(
            id=uuid4(),
            user_id=user.id,
            department=dept,
            position=pos,
            employee_id=f"EMP{str(i+1).zfill(4)}",
            specializations=[dept.lower(), "education"],
            team_id=team.id,
            is_department_lead=(i % 10 == 0),
            hired_at=date(2024, 1, 1) + timedelta(days=i * 7),
        )
        profiles.append(profile)

    session.add_all(profiles)
    await session.flush()
    print(f"  Created {len(staff_users)} staff users + profiles")
    return staff_users


async def seed_students(session):
    """Seed 100 students for ticket/journey data."""
    print("Seeding student users...")
    students = []

    for i in range(100):
        first = FIRST_NAMES[i % len(FIRST_NAMES)]
        last = LAST_NAMES[(i + 5) % len(LAST_NAMES)]
        user = User(
            id=uuid4(),
            email=f"seedstudent{i+1}@example.com",
            password_hash=get_password_hash("password123"),
            role="student",
            is_active=True,
            is_verified=True,
            profile_data={
                "full_name": f"{first} {last}",
                "phone": f"+2547{random.randint(10000000, 99999999)}",
            },
        )
        students.append(user)
        session.add(user)
        await session.flush()

        student = Student(
            id=uuid4(),
            user_id=user.id,
            admission_number=f"SEED{str(i+1).zfill(4)}",
            grade_level=f"Grade {(i % 9) + 1}",
            enrollment_date=date(2025, 1, 15),
            is_active=True,
            learning_profile={"learning_style": ["visual", "auditory", "kinesthetic"][i % 3]},
        )
        session.add(student)

    await session.flush()
    print(f"  Created {len(students)} students")
    return students


async def seed_sla_policies(session, staff_users):
    """Seed SLA policies."""
    print("Seeding SLA policies...")
    policies = []
    sla_data = [
        ("Critical SLA", "critical", 15, 120),
        ("High Priority SLA", "high", 30, 240),
        ("Medium Priority SLA", "medium", 60, 480),
        ("Low Priority SLA", "low", 120, 1440),
    ]
    for name, priority, response_min, resolution_min in sla_data:
        policy = SLAPolicy(
            id=uuid4(),
            name=name,
            priority=priority,
            first_response_minutes=response_min,
            resolution_minutes=resolution_min,
            escalation_chain=[
                {"level": 1, "threshold_minutes": response_min, "role": "team_lead"},
                {"level": 2, "threshold_minutes": response_min * 2, "role": "manager"},
            ],
            is_active=True,
            created_by=staff_users[0].id,
        )
        policies.append(policy)

    session.add_all(policies)
    await session.flush()
    print(f"  Created {len(policies)} SLA policies")
    return policies


async def seed_tickets(session, staff_users, students, sla_policies):
    """Seed 200 support tickets with messages."""
    print("Seeding support tickets...")
    tickets = []
    all_messages = []
    statuses = ["open", "in_progress", "resolved", "closed"]
    priorities = ["low", "medium", "high", "critical"]
    categories = ["technical", "academic", "billing", "account", "content"]
    subjects = [
        "Cannot access course materials",
        "Payment not reflected in account",
        "AI tutor giving wrong answers",
        "Need to change grade level",
        "Video lessons not loading",
        "Certificate not generated",
        "Password reset not working",
        "App crashes on lesson page",
        "Missing assignment grades",
        "Parent account linking issue",
    ]

    for i in range(200):
        priority = priorities[i % len(priorities)]
        sla = next((p for p in sla_policies if p.priority == priority), sla_policies[0])
        created = datetime.utcnow() - timedelta(days=random.randint(0, 60), hours=random.randint(0, 23))
        status = statuses[i % len(statuses)]

        ticket = StaffTicket(
            id=uuid4(),
            ticket_number=f"TKT-{str(i+1).zfill(5)}",
            subject=subjects[i % len(subjects)],
            description=f"Detailed description for ticket #{i+1}. The student is experiencing issues and needs assistance.",
            category=categories[i % len(categories)],
            priority=priority,
            status=status,
            reporter_id=students[i % len(students)].id,
            assigned_to=staff_users[i % len(staff_users)].id if i % 3 != 0 else None,
            sla_policy_id=sla.id,
            sla_deadline=created + timedelta(minutes=sla.resolution_minutes),
            sla_breached=(i % 7 == 0),
            tags=["urgent"] if priority == "critical" else [],
            resolution="Issue resolved successfully." if status in ("resolved", "closed") else None,
            resolved_at=created + timedelta(hours=random.randint(1, 48)) if status in ("resolved", "closed") else None,
            csat_score=random.randint(3, 5) if status == "closed" else None,
            created_at=created,
        )
        tickets.append(ticket)
        session.add(ticket)
        await session.flush()

        # Add 1-4 messages per ticket
        for j in range(random.randint(1, 4)):
            is_staff = j % 2 == 1
            msg = StaffTicketMessage(
                id=uuid4(),
                ticket_id=ticket.id,
                author_id=staff_users[i % len(staff_users)].id if is_staff else students[i % len(students)].id,
                content=f"{'Staff response' if is_staff else 'Student message'}: Message {j+1} for ticket {ticket.ticket_number}.",
                is_internal=(j == 3),
                created_at=created + timedelta(hours=j),
            )
            all_messages.append(msg)

    session.add_all(all_messages)
    await session.flush()
    print(f"  Created {len(tickets)} tickets + {len(all_messages)} messages")
    return tickets


async def seed_moderation_items(session, students, staff_users):
    """Seed moderation queue items."""
    print("Seeding moderation items...")
    items = []
    content_types = ["forum_post", "comment", "assignment_submission", "profile_update"]
    titles = [
        "Forum post about homework help",
        "Comment on science lesson",
        "Uploaded assignment for review",
        "Profile bio update",
        "Discussion thread reply",
        "Resource link shared",
        "Quiz response flagged",
        "Chat message flagged by AI",
    ]

    for i in range(80):
        item = StaffModerationItem(
            id=uuid4(),
            content_type=content_types[i % len(content_types)],
            content_id=uuid4(),
            title=titles[i % len(titles)],
            description=f"Content submitted by student for moderation review. Item #{i+1}.",
            submitted_by=students[i % len(students)].id,
            assigned_to=staff_users[i % len(staff_users)].id if i % 4 == 0 else None,
            status=["pending", "pending", "pending", "approved", "rejected"][i % 5],
            priority=["low", "medium", "medium", "high", "critical"][i % 5],
            ai_flags=["potential_spam"] if i % 5 == 0 else [],
            ai_risk_score=round(random.uniform(0.1, 0.95), 2),
            category=["safety", "quality", "relevance", "copyright"][i % 4],
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 14)),
        )
        items.append(item)

    session.add_all(items)
    await session.flush()
    print(f"  Created {len(items)} moderation items")
    return items


async def seed_knowledge_base(session, staff_users):
    """Seed knowledge base categories and articles."""
    print("Seeding knowledge base...")
    categories = []
    cat_data = [
        ("Technical Support", "technical-support", "Guides for technical issues"),
        ("Academic Support", "academic-support", "Academic help and curriculum guides"),
        ("Platform Policies", "platform-policies", "Rules, policies and procedures"),
        ("Staff Training", "staff-training", "Training materials for staff members"),
        ("FAQ", "faq", "Frequently asked questions"),
    ]
    for idx, (name, slug, desc) in enumerate(cat_data):
        cat = KBCategory(
            id=uuid4(),
            name=name,
            slug=slug,
            description=desc,
            sort_order=idx,
        )
        categories.append(cat)
        session.add(cat)

    await session.flush()

    articles = []
    article_titles = [
        "How to reset a student password",
        "Troubleshooting video playback issues",
        "Guide to CBC grade level mapping",
        "M-Pesa payment troubleshooting",
        "Setting up parent-child account linking",
        "AI tutor conversation management",
        "Course enrollment process",
        "Handling refund requests",
        "Content moderation guidelines",
        "Student safety protocols",
        "Assessment grading rubrics",
        "Live session best practices",
        "Handling billing disputes",
        "Student data privacy policy",
        "Escalation procedures",
        "Communication templates",
        "Performance review process",
        "Onboarding new staff members",
        "Platform downtime procedures",
        "Content creation standards",
    ]

    for i, title in enumerate(article_titles):
        slug = title.lower().replace(" ", "-").replace("'", "")
        article = KBArticle(
            id=uuid4(),
            title=title,
            slug=f"{slug}-{i}",
            body=f"# {title}\n\nThis is a comprehensive guide covering {title.lower()}.\n\n## Overview\nDetailed instructions and best practices.\n\n## Steps\n1. First step\n2. Second step\n3. Third step\n\n## Notes\nAdditional context and tips.",
            category_id=categories[i % len(categories)].id,
            tags=["guide", "howto"] + ([categories[i % len(categories)].slug] if i % 2 == 0 else []),
            status="published" if i < 15 else "draft",
            author_id=staff_users[i % len(staff_users)].id,
            view_count=random.randint(10, 500),
            helpful_count=random.randint(5, 100),
            not_helpful_count=random.randint(0, 10),
            is_internal=(i >= 15),
            published_at=datetime.utcnow() - timedelta(days=random.randint(1, 90)) if i < 15 else None,
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 120)),
        )
        articles.append(article)

    session.add_all(articles)
    await session.flush()
    print(f"  Created {len(categories)} categories + {len(articles)} articles")
    return categories, articles


async def seed_content_items(session, staff_users):
    """Seed staff content items."""
    print("Seeding content items...")
    items = []
    content_types = ["lesson", "worksheet", "quiz", "video_lesson", "interactive"]
    titles = [
        "Introduction to Fractions", "Kenya's Geography", "Basic Kiswahili Grammar",
        "Water Cycle Explained", "Addition and Subtraction", "Our Solar System",
        "Creative Writing Workshop", "Introduction to Coding", "Kenyan History Timeline",
        "Science Experiments at Home", "Reading Comprehension: Fables",
        "Mathematics: Shapes and Patterns", "Environmental Conservation",
        "Digital Literacy Basics", "Music and Rhythm",
    ]

    for i, title in enumerate(titles):
        item = StaffContentItem(
            id=uuid4(),
            title=title,
            content_type=content_types[i % len(content_types)],
            body=f"# {title}\n\nLesson content for {title}. This covers the key concepts and learning objectives.",
            status=["draft", "draft", "published", "published", "under_review"][i % 5],
            author_id=staff_users[i % len(staff_users)].id,
            grade_levels=[f"Grade {(i % 6) + 1}", f"Grade {(i % 6) + 2}"],
            learning_area=["Mathematics", "Science", "Languages", "Social Studies", "Creative Arts"][i % 5],
            cbc_tags=["numeracy", "literacy", "inquiry"][0 : (i % 3) + 1],
            version=1,
            published_at=datetime.utcnow() - timedelta(days=i * 3) if i % 5 in (2, 3) else None,
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60)),
        )
        items.append(item)

    session.add_all(items)
    await session.flush()
    print(f"  Created {len(items)} content items")
    return items


async def seed_assessments(session, staff_users):
    """Seed assessments with questions."""
    print("Seeding assessments...")
    assessments = []
    all_questions = []
    types = ["quiz", "exam", "practice", "diagnostic"]

    for i in range(10):
        assessment = AdaptiveAssessment(
            id=uuid4(),
            title=f"{'Mathematics' if i % 2 == 0 else 'Science'} Assessment {i+1}",
            description=f"Assessment #{i+1} covering key topics.",
            assessment_type=types[i % len(types)],
            grade_level=f"Grade {(i % 6) + 1}",
            learning_area="Mathematics" if i % 2 == 0 else "Science",
            cbc_tags=["numeracy"] if i % 2 == 0 else ["inquiry"],
            time_limit_minutes=30 + (i * 5),
            is_ai_graded=(i % 3 == 0),
            status=["draft", "active", "active", "active", "archived"][i % 5],
            author_id=staff_users[i % len(staff_users)].id,
            total_questions=5,
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
        )
        assessments.append(assessment)
        session.add(assessment)
        await session.flush()

        for j in range(5):
            q = AssessmentQuestion(
                id=uuid4(),
                assessment_id=assessment.id,
                question_text=f"Question {j+1} for {assessment.title}",
                question_type=["multiple_choice", "true_false", "short_answer", "essay", "multiple_choice"][j % 5],
                options=["Option A", "Option B", "Option C", "Option D"] if j % 5 in (0, 4) else None,
                correct_answer="Option A" if j % 5 in (0, 4) else ("True" if j % 5 == 1 else None),
                explanation=f"Explanation for question {j+1}.",
                difficulty=min(j + 1, 5),
                points=2 if j < 3 else 5,
                order_index=j,
                cbc_competency="Number sense" if i % 2 == 0 else "Scientific inquiry",
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
            )
            all_questions.append(q)

    session.add_all(all_questions)
    await session.flush()
    print(f"  Created {len(assessments)} assessments + {len(all_questions)} questions")
    return assessments


async def seed_live_sessions(session, staff_users):
    """Seed live class sessions."""
    print("Seeding live sessions...")
    sessions_list = []
    session_types = ["lecture", "tutorial", "workshop", "review", "office_hours"]

    for i in range(20):
        scheduled = datetime.utcnow() + timedelta(days=random.randint(-10, 30), hours=random.randint(8, 16))
        status = "scheduled"
        started = None
        ended = None
        if scheduled < datetime.utcnow():
            if random.random() > 0.3:
                status = "ended"
                started = scheduled
                ended = scheduled + timedelta(minutes=random.randint(30, 90))
            else:
                status = "live"
                started = scheduled

        s = LiveSession(
            id=uuid4(),
            title=f"{'Math' if i % 2 == 0 else 'Science'} Live Session {i+1}",
            description=f"Live teaching session #{i+1}",
            host_id=staff_users[i % len(staff_users)].id,
            session_type=session_types[i % len(session_types)],
            room_name=f"room-{uuid4().hex[:8]}",
            status=status,
            max_participants=30,
            recording_enabled=(i % 2 == 0),
            screen_share_enabled=True,
            grade_level=f"Grade {(i % 6) + 1}",
            scheduled_at=scheduled,
            started_at=started,
            ended_at=ended,
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
        )
        sessions_list.append(s)

    session.add_all(sessions_list)
    await session.flush()
    print(f"  Created {len(sessions_list)} live sessions")
    return sessions_list


async def seed_reports(session, staff_users):
    """Seed report definitions."""
    print("Seeding reports...")
    reports = []
    report_data = [
        ("Weekly Ticket Summary", "support", False, False),
        ("Monthly Student Progress", "academic", False, False),
        ("Content Performance Report", "content", False, False),
        ("SLA Compliance Report", "sla", False, True),
        ("Team Workload Overview", "team", False, False),
        ("Student At-Risk Report", "student", True, False),
        ("Platform Usage Template", "usage", True, False),
        ("Assessment Results Template", "assessment", True, False),
    ]

    for name, rtype, is_template, is_shared in report_data:
        report = ReportDefinition(
            id=uuid4(),
            name=name,
            description=f"Auto-generated {name.lower()}",
            report_type=rtype,
            config={"columns": ["date", "metric", "value"], "chart_type": "bar"},
            filters={"date_range": "last_30_days"},
            created_by=staff_users[0].id,
            is_template=is_template,
            is_shared=is_shared,
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60)),
        )
        reports.append(report)

    session.add_all(reports)
    await session.flush()
    print(f"  Created {len(reports)} reports")
    return reports


async def seed_student_journeys(session, students, staff_users):
    """Seed student journey tracking data."""
    print("Seeding student journeys...")
    journeys = []
    risk_levels = ["low", "low", "medium", "medium", "high", "critical"]
    learning_styles = ["visual", "auditory", "kinesthetic", "reading_writing"]

    for i, student in enumerate(students[:60]):
        risk = risk_levels[i % len(risk_levels)]
        journey = StudentJourney(
            id=uuid4(),
            student_id=student.id,
            risk_level=risk,
            risk_factors=["attendance_drop", "grade_decline"] if risk in ("high", "critical") else [],
            ai_insights={
                "summary": f"Student shows {'concerning' if risk in ('high', 'critical') else 'positive'} learning patterns.",
                "recommendations": ["Schedule parent meeting", "Assign mentor"] if risk in ("high", "critical") else ["Continue current path"],
            },
            learning_style=learning_styles[i % len(learning_styles)],
            strengths=["mathematics", "creativity"][0 : (i % 2) + 1],
            areas_for_improvement=["reading_comprehension"] if i % 3 == 0 else [],
            last_assessed_at=datetime.utcnow() - timedelta(days=random.randint(1, 14)),
            created_at=datetime.utcnow() - timedelta(days=random.randint(30, 180)),
        )
        journeys.append(journey)

    session.add_all(journeys)
    await session.flush()

    # Add family cases
    families = []
    for i in range(10):
        parent_user = User(
            id=uuid4(),
            email=f"seedparent{i+1}@example.com",
            password_hash=get_password_hash("password123"),
            role="parent",
            is_active=True,
            is_verified=True,
            profile_data={"full_name": f"Parent {LAST_NAMES[i % len(LAST_NAMES)]}"},
        )
        session.add(parent_user)
        await session.flush()

        family = FamilyCase(
            id=uuid4(),
            family_name=f"The {LAST_NAMES[i % len(LAST_NAMES)]} Family",
            primary_contact_id=parent_user.id,
            students=[str(students[i * 2].id), str(students[i * 2 + 1].id)] if i * 2 + 1 < len(students) else [str(students[i].id)],
            case_status=["active", "active", "monitoring", "resolved"][i % 4],
            priority=["low", "medium", "high"][i % 3],
            assigned_to=staff_users[i % len(staff_users)].id,
            created_at=datetime.utcnow() - timedelta(days=random.randint(10, 90)),
        )
        families.append(family)

    session.add_all(families)
    await session.flush()

    # Add case notes
    notes = []
    for i, journey in enumerate(journeys[:20]):
        note = CaseNote(
            id=uuid4(),
            case_type="student_journey",
            case_ref_id=journey.id,
            author_id=staff_users[i % len(staff_users)].id,
            content=f"Follow-up note for student journey. Assessment completed, risk level {'stable' if journey.risk_level == 'low' else 'being monitored'}.",
            is_private=(i % 5 == 0),
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
        )
        notes.append(note)

    session.add_all(notes)
    await session.flush()
    print(f"  Created {len(journeys)} journeys + {len(families)} families + {len(notes)} case notes")
    return journeys


async def main():
    """Main seed function."""
    print("=" * 65)
    print("  Urban Home School - Staff Dashboard Data Seeding")
    print("=" * 65)
    print()

    # Initialize database
    await init_db()

    # Import AsyncSessionLocal after init_db() has set it up
    from app.database import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        try:
            # Check if staff seed data already exists
            result = await session.execute(
                select(User).where(User.email == "staff1@tuhs.co.ke").limit(1)
            )
            if result.scalar_one_or_none():
                print("Staff seed data already exists. Skipping...")
                print("To re-seed, delete existing staff data first.")
                return

            teams = await seed_staff_teams(session)
            staff_users = await seed_staff_users(session, teams)
            students = await seed_students(session)
            sla_policies = await seed_sla_policies(session, staff_users)
            await seed_tickets(session, staff_users, students, sla_policies)
            await seed_moderation_items(session, students, staff_users)
            await seed_knowledge_base(session, staff_users)
            await seed_content_items(session, staff_users)
            await seed_assessments(session, staff_users)
            await seed_live_sessions(session, staff_users)
            await seed_reports(session, staff_users)
            await seed_student_journeys(session, students, staff_users)

            await session.commit()

            print()
            print("=" * 65)
            print("  Staff data seeded successfully!")
            print("=" * 65)
            print()
            print("  Test Credentials:")
            print("    Email:    staff1@tuhs.co.ke")
            print("    Password: password123")
            print()
            print("  Data Summary:")
            print("    - 7 staff teams")
            print("    - 50 staff users with profiles")
            print("    - 100 students")
            print("    - 4 SLA policies")
            print("    - 200 support tickets with messages")
            print("    - 80 moderation items")
            print("    - 5 KB categories + 20 articles")
            print("    - 15 content items")
            print("    - 10 assessments + 50 questions")
            print("    - 20 live sessions")
            print("    - 8 report definitions")
            print("    - 60 student journeys + 10 families + 20 case notes")
            print()

        except Exception as e:
            print(f"\nERROR: Seed failed: {e}")
            await session.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(main())
