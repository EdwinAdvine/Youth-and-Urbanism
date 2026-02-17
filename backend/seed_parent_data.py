"""
Seed script: Creates comprehensive parent dashboard demo data.

Creates:
- 1 parent user
- 4 children (ECD 2, Grade 3, Grade 6, Grade 8)
- Course enrollments for each child
- AI tutors with conversation history
- Assessments and submissions
- Certificates
- 30 days of mood entries
- Family goals
- AI alerts
- Messages
- Consent records
- Reports
- Payment history

Usage:
    cd backend/
    python seed_parent_data.py
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta, date
import uuid
import random

# Ensure the backend directory is in the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load .env.development
from dotenv import load_dotenv
load_dotenv(".env.development")

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal, init_db
from app.models import *
from app.utils.security import get_password_hash


async def seed_parent_data():
    """Seed comprehensive parent dashboard data."""
    print("=" * 70)
    print("PARENT DASHBOARD DATA SEEDING")
    print("=" * 70)

    # Initialize database
    await init_db()

    async with AsyncSessionLocal() as session:
        try:
            # ========== 1. CREATE PARENT USER ==========
            print("\n[1/10] Creating parent user...")

            parent = User(
                email="parent.demo@urbanhomeschool.co.ke",
                password_hash=get_password_hash("Parent@2026!"),
                role="parent",
                is_active=True,
                is_verified=True,
                profile_data={
                    "full_name": "Sarah Mwangi",
                    "phone": "+254712345678",
                    "relationship": "mother",
                    "occupation": "Teacher",
                },
            )
            session.add(parent)
            await session.flush()
            print(f"✓ Parent created: {parent.email} (ID: {parent.id})")

            # ========== 2. CREATE 4 CHILDREN ==========
            print("\n[2/10] Creating 4 children...")

            children_data = [
                {
                    "full_name": "Alex Mwangi",
                    "admission_number": "UHS-ECD-001",
                    "grade_level": "ECD 2",
                    "date_of_birth": date(2022, 3, 15),
                },
                {
                    "full_name": "Emma Mwangi",
                    "admission_number": "UHS-P3-001",
                    "grade_level": "Grade 3",
                    "date_of_birth": date(2018, 7, 22),
                },
                {
                    "full_name": "James Mwangi",
                    "admission_number": "UHS-P6-001",
                    "grade_level": "Grade 6",
                    "date_of_birth": date(2015, 11, 8),
                },
                {
                    "full_name": "Grace Mwangi",
                    "admission_number": "UHS-JS8-001",
                    "grade_level": "Grade 8",
                    "date_of_birth": date(2013, 5, 30),
                },
            ]

            children = []
            for child_data in children_data:
                # Create user account for child
                child_user = User(
                    email=f"{child_data['admission_number'].lower()}@student.urbanhomeschool.co.ke",
                    password_hash=get_password_hash("Student@2026!"),
                    role="student",
                    is_active=True,
                    is_verified=True,
                    profile_data={
                        "full_name": child_data["full_name"],
                        "grade_level": child_data["grade_level"],
                    },
                )
                session.add(child_user)
                await session.flush()

                # Create student profile
                child = Student(
                    user_id=child_user.id,
                    parent_id=parent.id,
                    admission_number=child_data["admission_number"],
                    grade_level=child_data["grade_level"],
                    date_of_birth=child_data["date_of_birth"],
                    gender=random.choice(["male", "female"]),
                    is_active=True,
                    learning_profile={
                        "learning_style": random.choice(["visual", "auditory", "kinesthetic"]),
                        "strengths": random.sample(["mathematics", "science", "languages", "arts", "sports"], 2),
                        "interests": random.sample(["coding", "reading", "art", "music", "sports"], 2),
                    },
                    competencies={
                        "communication": random.randint(60, 95),
                        "critical_thinking": random.randint(60, 95),
                        "creativity": random.randint(60, 95),
                        "collaboration": random.randint(60, 95),
                        "citizenship": random.randint(60, 95),
                        "digital_literacy": random.randint(60, 95),
                        "learning_to_learn": random.randint(60, 95),
                    },
                    overall_performance={
                        "average_grade": random.randint(70, 95),
                        "class_rank": random.randint(1, 40),
                        "total_students": 40,
                    },
                )
                session.add(child)
                await session.flush()
                children.append(child)
                print(f"  ✓ {child_data['full_name']} ({child_data['grade_level']}) - {child_data['admission_number']}")

            # ========== 3. CREATE AI TUTORS ==========
            print("\n[3/10] Creating AI tutors for each child...")

            for child in children:
                ai_tutor = AITutor(
                    student_id=child.id,
                    tutor_name=f"Birdy ({child.learning_profile.get('learning_style', 'visual').title()})",
                    preferred_ai="gemini-pro",
                    total_interactions=random.randint(50, 200),
                    last_interaction=datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
                    conversation_history=[
                        {
                            "role": "user",
                            "content": "Help me understand fractions",
                            "timestamp": (datetime.utcnow() - timedelta(days=2)).isoformat(),
                        },
                        {
                            "role": "assistant",
                            "content": "Let me explain fractions with visual examples!",
                            "timestamp": (datetime.utcnow() - timedelta(days=2)).isoformat(),
                        },
                    ],
                    learning_path={
                        "current_topic": "Mathematics - Fractions",
                        "completed_topics": ["Numbers", "Addition", "Subtraction"],
                        "upcoming_topics": ["Decimals", "Percentages"],
                    },
                    performance_metrics={
                        "strengths": ["problem_solving", "engagement"],
                        "areas_for_improvement": ["time_management"],
                        "progress_rate": random.uniform(0.7, 0.95),
                    },
                )
                session.add(ai_tutor)
            await session.flush()
            print(f"  ✓ Created {len(children)} AI tutors")

            # ========== 4. CREATE MOOD ENTRIES (30 days) ==========
            print("\n[4/10] Creating 30 days of mood entries...")

            moods = ["happy", "tired", "anxious", "excited", "stressed", "neutral"]
            for i in range(30):
                entry_date = date.today() - timedelta(days=i)
                for child in random.sample(children, k=random.randint(2, 4)):
                    mood_entry = MoodEntry(
                        parent_id=parent.id,
                        child_id=child.id,
                        emoji=random.choice(moods),
                        energy_level=random.randint(1, 5),
                        note=random.choice([None, "Had a great day at school!", "Feeling a bit tired"]),
                        recorded_date=entry_date,
                    )
                    session.add(mood_entry)
            await session.flush()
            print(f"  ✓ Created ~{30 * 3} mood entries")

            # ========== 5. CREATE FAMILY GOALS ==========
            print("\n[5/10] Creating family goals...")

            goals_data = [
                {
                    "child_id": children[1].id,
                    "title": "Improve Reading Comprehension",
                    "category": "academic",
                    "progress": 65,
                    "status": "active",
                },
                {
                    "child_id": children[2].id,
                    "title": "Master Multiplication Tables",
                    "category": "academic",
                    "progress": 85,
                    "status": "active",
                },
                {
                    "child_id": None,
                    "title": "Family Reading Time - 30min Daily",
                    "category": "behavioral",
                    "progress": 45,
                    "status": "active",
                },
                {
                    "child_id": children[3].id,
                    "title": "Science Fair Project",
                    "category": "creative",
                    "progress": 30,
                    "status": "active",
                },
            ]

            for goal_data in goals_data:
                goal = FamilyGoal(
                    parent_id=parent.id,
                    child_id=goal_data["child_id"],
                    title=goal_data["title"],
                    category=goal_data["category"],
                    progress_percentage=goal_data["progress"],
                    status=goal_data["status"],
                    target_date=date.today() + timedelta(days=60),
                    is_ai_suggested=random.choice([True, False]),
                    ai_metadata={
                        "milestones": ["Start", "Progress", "Complete"],
                        "tips": ["Practice daily", "Track progress"],
                    },
                )
                session.add(goal)
            await session.flush()
            print(f"  ✓ Created {len(goals_data)} family goals")

            # ========== 6. CREATE AI ALERTS ==========
            print("\n[6/10] Creating AI alerts...")

            alerts_data = [
                {
                    "child_id": children[1].id,
                    "type": "milestone_reached",
                    "severity": "info",
                    "title": "100 Learning Sessions Milestone!",
                    "message": "Emma has completed 100 learning sessions with Birdy!",
                },
                {
                    "child_id": children[2].id,
                    "type": "engagement_drop",
                    "severity": "warning",
                    "title": "Engagement Drop Detected",
                    "message": "James's engagement score dropped 15% this week.",
                    "recommendation": "Consider scheduling a family discussion about learning goals.",
                },
                {
                    "child_id": children[3].id,
                    "type": "performance_decline",
                    "severity": "critical",
                    "title": "Math Quiz Scores Declining",
                    "message": "Grace's math quiz average dropped from 85% to 68%.",
                    "recommendation": "Schedule extra practice sessions or reach out to instructor.",
                },
            ]

            for alert_data in alerts_data:
                alert = AIAlert(
                    parent_id=parent.id,
                    child_id=alert_data["child_id"],
                    alert_type=alert_data["type"],
                    severity=alert_data["severity"],
                    title=alert_data["title"],
                    message=alert_data["message"],
                    ai_recommendation=alert_data.get("recommendation"),
                    is_read=random.choice([True, False]),
                    is_dismissed=False,
                )
                session.add(alert)
            await session.flush()
            print(f"  ✓ Created {len(alerts_data)} AI alerts")

            # ========== 7. CREATE COURSES & ENROLLMENTS ==========
            print("\n[7/16] Creating courses and enrollments...")

            # Look up existing instructor or create one
            instructor_result = await session.execute(
                select(User).where(User.email == "instructor@urbanhomeschool.co.ke")
            )
            instructor = instructor_result.scalar_one_or_none()
            if not instructor:
                instructor = User(
                    email="instructor.seed@urbanhomeschool.co.ke",
                    password_hash=get_password_hash("Instructor@2026!"),
                    role="instructor",
                    is_active=True,
                    is_verified=True,
                    profile_data={
                        "full_name": "Mr. John Kamau",
                        "phone": "+254722000111",
                        "specialization": "Mathematics & Science",
                    },
                )
                session.add(instructor)
                await session.flush()

            courses_data = [
                {"title": "Fun with Numbers", "description": "Early childhood numeracy through play", "grade_levels": ["ECD 2"], "learning_area": "Mathematics", "price": 0},
                {"title": "My First ABC", "description": "Interactive phonics and letter recognition", "grade_levels": ["ECD 2"], "learning_area": "Languages", "price": 0},
                {"title": "Grade 3 Mathematics", "description": "Multiplication, division, and fractions", "grade_levels": ["Grade 3"], "learning_area": "Mathematics", "price": 500},
                {"title": "English Language Arts", "description": "Reading comprehension and creative writing", "grade_levels": ["Grade 3"], "learning_area": "Languages", "price": 500},
                {"title": "Science & Technology G6", "description": "Exploring physics, chemistry, and biology", "grade_levels": ["Grade 6"], "learning_area": "Science", "price": 800},
                {"title": "Mathematics G6 - Algebra", "description": "Introduction to algebraic thinking", "grade_levels": ["Grade 6"], "learning_area": "Mathematics", "price": 800},
                {"title": "Integrated Science G8", "description": "Advanced science for junior secondary", "grade_levels": ["Grade 8"], "learning_area": "Science", "price": 1200},
                {"title": "Mathematics G8 - Geometry", "description": "Geometry, trigonometry, and problem solving", "grade_levels": ["Grade 8"], "learning_area": "Mathematics", "price": 1200},
            ]

            courses = []
            for cd in courses_data:
                course = Course(
                    title=cd["title"],
                    description=cd["description"],
                    grade_levels=cd["grade_levels"],
                    learning_area=cd["learning_area"],
                    instructor_id=instructor.id,
                    is_platform_created=True,
                    price=cd["price"],
                    currency="KES",
                    is_published=True,
                    syllabus={"units": [{"title": "Unit 1", "topics": ["Introduction", "Basics"]}]},
                    lessons=[{"id": "L1", "title": "Lesson 1", "type": "video"}, {"id": "L2", "title": "Lesson 2", "type": "interactive"}],
                )
                session.add(course)
                courses.append(course)
            await session.flush()
            print(f"  ✓ Created {len(courses)} courses")

            # Create enrollments - 2 courses per child
            enrollment_count = 0
            for i, child in enumerate(children):
                # Each child gets 2 courses matching their grade
                child_courses = [c for c in courses if child.grade_level in c.grade_levels]
                for course in child_courses[:2]:
                    is_completed = random.choice([True, False])
                    enrollment = Enrollment(
                        student_id=child.id,
                        course_id=course.id,
                        status="completed" if is_completed else "active",
                        progress_percentage=100.0 if is_completed else random.uniform(20, 80),
                        enrolled_at=datetime.utcnow() - timedelta(days=random.randint(30, 90)),
                    )
                    session.add(enrollment)
                    enrollment_count += 1
            await session.flush()
            print(f"  ✓ Created {enrollment_count} enrollments")

            # ========== 8. CREATE CERTIFICATES ==========
            print("\n[8/16] Creating certificates...")

            cert_count = 0
            for i, child in enumerate(children):
                if i < 2:  # Skip youngest child (ECD 2)
                    continue
                # Older children get 1-2 certificates
                child_courses = [c for c in courses if child.grade_level in c.grade_levels]
                for course in child_courses[:random.randint(1, 2)]:
                    cert = Certificate(
                        serial_number=f"UHS-{date.today().strftime('%Y%m%d')}-{str(uuid.uuid4())[:5].upper()}",
                        student_id=child.user_id,  # Certificate.student_id refs users.id
                        student_name=child.learning_profile.get('full_name', children_data[i]['full_name']),
                        course_id=course.id,
                        course_name=course.title,
                        grade=random.choice(["A", "A-", "B+", "B"]),
                        completion_date=datetime.utcnow() - timedelta(days=random.randint(7, 60)),
                        issued_at=datetime.utcnow() - timedelta(days=random.randint(1, 7)),
                        is_valid=True,
                    )
                    session.add(cert)
                    cert_count += 1
            await session.flush()
            print(f"  ✓ Created {cert_count} certificates")

            # ========== 9. CREATE MESSAGES & CONVERSATIONS ==========
            print("\n[9/16] Creating messages and conversations...")

            conversations = [
                {
                    "channel": "instructor",
                    "child_idx": 1,  # Emma
                    "messages": [
                        {"sender": "instructor", "content": "Hello! Just wanted to share that Emma did great in today's math session."},
                        {"sender": "parent", "content": "That's wonderful to hear! She's been practicing at home too."},
                        {"sender": "instructor", "content": "It shows! Her multiplication tables are much improved."},
                        {"sender": "parent", "content": "Thank you for the feedback. Should we work on anything specific?"},
                        {"sender": "instructor", "content": "I'd suggest focusing on word problems. She has the basics down."},
                    ]
                },
                {
                    "channel": "ai_tutor",
                    "child_idx": 2,  # James
                    "messages": [
                        {"sender": "parent", "content": "Can you tell me about James's learning patterns this week?"},
                        {"sender": "instructor", "content": "James has been very engaged with the science module. He asked 15 questions about photosynthesis!"},
                        {"sender": "parent", "content": "That's his favorite subject. How are his math scores?"},
                        {"sender": "instructor", "content": "Math could use more practice. I recommend the extra exercises module."},
                    ]
                },
                {
                    "channel": "platform",
                    "child_idx": None,
                    "messages": [
                        {"sender": "instructor", "content": "Welcome to Urban Home School! Your family account is all set up."},
                        {"sender": "parent", "content": "Thank you! Looking forward to the learning journey."},
                        {"sender": "instructor", "content": "Feel free to reach out anytime. Your children's AI tutors are ready!"},
                    ]
                },
            ]

            msg_count = 0
            for conv_data in conversations:
                conv_id = uuid.uuid4()
                child_id = children[conv_data["child_idx"]].id if conv_data["child_idx"] is not None else None

                for j, msg_data in enumerate(conv_data["messages"]):
                    sender_id = parent.id if msg_data["sender"] == "parent" else instructor.id
                    recipient_id = instructor.id if msg_data["sender"] == "parent" else parent.id

                    message = ParentMessage(
                        conversation_id=conv_id,
                        sender_id=sender_id,
                        recipient_id=recipient_id,
                        channel=conv_data["channel"],
                        child_id=child_id,
                        content=msg_data["content"],
                        message_type="text",
                        is_read=True if j < len(conv_data["messages"]) - 1 else random.choice([True, False]),
                        created_at=datetime.utcnow() - timedelta(days=3) + timedelta(hours=j * 2),
                    )
                    session.add(message)
                    msg_count += 1
            await session.flush()
            print(f"  ✓ Created {msg_count} messages in {len(conversations)} conversations")

            # ========== 10. CREATE SUPPORT TICKETS ==========
            print("\n[10/16] Creating support tickets...")

            tickets_data = [
                {
                    "subject": "Can't access science course material",
                    "category": "technical",
                    "priority": "high",
                    "description": "When James tries to open Lesson 3 in Integrated Science, the page shows a blank screen.",
                    "child_idx": 2,
                    "replies": [
                        {"sender": "instructor", "content": "Thank you for reporting this. We've identified the issue and our team is working on it."},
                        {"sender": "instructor", "content": "The issue has been fixed. Please try accessing the lesson again and let us know if it works."},
                    ]
                },
                {
                    "subject": "Question about subscription upgrade",
                    "category": "billing",
                    "priority": "medium",
                    "description": "I'd like to know what additional features come with the premium plan.",
                    "child_idx": None,
                    "replies": [
                        {"sender": "instructor", "content": "The premium plan includes: unlimited AI tutoring, advanced analytics, priority support, and portfolio exports. Would you like to upgrade?"},
                    ]
                },
            ]

            for td in tickets_data:
                ticket_conv_id = uuid.uuid4()
                ticket_child_id = children[td["child_idx"]].id if td["child_idx"] is not None else None

                # Initial ticket message
                ticket_msg = ParentMessage(
                    conversation_id=ticket_conv_id,
                    sender_id=parent.id,
                    recipient_id=None,
                    channel="support",
                    child_id=ticket_child_id,
                    content=td["description"],
                    message_type="text",
                    is_read=True,
                    metadata_={
                        "ticket": True,
                        "subject": td["subject"],
                        "category": td["category"],
                        "priority": td["priority"],
                        "status": "open",
                    },
                    created_at=datetime.utcnow() - timedelta(days=5),
                )
                session.add(ticket_msg)
                await session.flush()

                # Replies
                for k, reply in enumerate(td["replies"]):
                    reply_sender = instructor.id if reply["sender"] == "instructor" else parent.id
                    reply_msg = ParentMessage(
                        conversation_id=ticket_conv_id,
                        sender_id=reply_sender,
                        recipient_id=parent.id if reply["sender"] == "instructor" else None,
                        channel="support",
                        child_id=ticket_child_id,
                        content=reply["content"],
                        message_type="text",
                        is_read=True,
                        metadata_={"ticket_reply": True, "ticket_id": str(ticket_msg.id)},
                        created_at=datetime.utcnow() - timedelta(days=4) + timedelta(hours=k * 6),
                    )
                    session.add(reply_msg)
            await session.flush()
            print(f"  ✓ Created {len(tickets_data)} support tickets with replies")

            # ========== 11. CREATE CONSENT RECORDS ==========
            print("\n[11/16] Creating consent records...")

            data_types = ["learning_analytics", "ai_conversations", "assessment_scores", "behavioral"]
            recipients = ["platform", "instructors", "ai_system"]

            for child in children:
                for data_type in data_types:
                    for recipient in recipients:
                        consent = ConsentRecord(
                            parent_id=parent.id,
                            child_id=child.id,
                            data_type=data_type,
                            recipient_type=recipient,
                            consent_given=random.choice([True, True, True, False]),  # 75% granted
                            granted_at=datetime.utcnow() - timedelta(days=random.randint(30, 90)) if random.choice([True, False]) else None,
                        )
                        session.add(consent)
            await session.flush()
            print(f"  ✓ Created {len(children) * len(data_types) * len(recipients)} consent records")

            # ========== 12. CREATE NOTIFICATION PREFERENCES ==========
            print("\n[12/16] Creating notification preferences...")

            notif_types = ["achievement", "alert", "report", "message", "payment"]
            for notif_type in notif_types:
                pref = NotificationPreference(
                    parent_id=parent.id,
                    child_id=None,  # All children
                    notification_type=notif_type,
                    channel_email=True,
                    channel_sms=notif_type in ["alert", "payment"],
                    channel_push=True,
                    channel_in_app=True,
                    severity_threshold="info",
                    is_enabled=True,
                )
                session.add(pref)
            await session.flush()
            print(f"  ✓ Created {len(notif_types)} notification preferences")

            # ========== 13. CREATE REPORTS ==========
            print("\n[13/16] Creating parent reports...")

            for child in children:
                # Weekly report
                report = ParentReport(
                    parent_id=parent.id,
                    child_id=child.id,
                    report_type="weekly",
                    title=f"Week ending {date.today().strftime('%B %d, %Y')}",
                    period_start=date.today() - timedelta(days=7),
                    period_end=date.today(),
                    data={
                        "total_time_minutes": random.randint(180, 420),
                        "sessions": random.randint(5, 12),
                        "lessons_completed": random.randint(3, 8),
                        "average_score": random.randint(70, 95),
                    },
                    ai_summary=f"{child.learning_profile.get('learning_style', 'Visual').title()} learner showing strong progress in core subjects.",
                    ai_projections={
                        "trend": "improving",
                        "estimated_completion": "On track for grade-level completion",
                    },
                    status="ready",
                )
                session.add(report)
            await session.flush()
            print(f"  ✓ Created {len(children)} weekly reports")

            # ========== 16. COMMIT TRANSACTION ==========
            print("\n[16/16] Committing all data...")
            await session.commit()
            print("✓ All data committed successfully")

            # ========== SUMMARY ==========
            print("\n" + "=" * 70)
            print("SEEDING COMPLETE!")
            print("=" * 70)
            print(f"\n✓ Parent User: parent.demo@urbanhomeschool.co.ke")
            print(f"  Password: Parent@2026!")
            print(f"\n✓ 4 Children:")
            for child in children:
                print(f"  - {child.learning_profile.get('full_name', 'Unknown')} ({child.grade_level})")
            print(f"\n✓ Data Created:")
            print(f"  - 8 courses")
            print(f"  - {enrollment_count} course enrollments")
            print(f"  - {cert_count} certificates")
            print(f"  - ~90 mood entries")
            print(f"  - 4 family goals")
            print(f"  - 3 AI alerts")
            print(f"  - {msg_count} messages in {len(conversations)} conversations")
            print(f"  - {len(tickets_data)} support tickets")
            print(f"  - {len(children) * len(data_types) * len(recipients)} consent records")
            print(f"  - {len(notif_types)} notification preferences")
            print(f"  - {len(children)} weekly reports")
            print("\n" + "=" * 70)

        except Exception as e:
            print(f"\n❌ Error during seeding: {str(e)}")
            await session.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(seed_parent_data())
