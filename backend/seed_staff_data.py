"""
Seed script for Staff Dashboard data
Creates production-like test data: 50+ staff, 500+ students, 1000+ tickets
"""
import asyncio
from datetime import datetime, timedelta
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_maker
from app.models.staff import (
    SupportTicket, ModerationItem, StudentJourney, KBCategory, KBArticle,
    LiveSession, StaffTask, StaffNotification
)
from app.models import User, Student
from app.utils.security import get_password_hash

async def seed_staff_users(session: AsyncSession):
    """Seed 50+ staff members"""
    print("Seeding staff users...")
    staff_users = []
    
    for i in range(1, 51):
        user = User(
            id=str(uuid4()),
            email=f"staff{i}@tuhs.co.ke",
            password_hash=get_password_hash("password123"),
            full_name=f"Staff Member {i}",
            role="staff",
            is_active=True,
            profile_data={
                "department": ["support", "content", "moderation", "training"][i % 4],
                "team_lead": i % 10 == 0,
                "specialization": ["technical", "academic", "behavioral"][i % 3]
            }
        )
        staff_users.append(user)
    
    session.add_all(staff_users)
    await session.commit()
    print(f"✓ Created {len(staff_users)} staff members")
    return staff_users

async def seed_students(session: AsyncSession):
    """Seed 500+ students"""
    print("Seeding students...")
    students = []
    
    for i in range(1, 501):
        user = User(
            id=str(uuid4()),
            email=f"student{i}@example.com",
            password_hash=get_password_hash("password123"),
            full_name=f"Student {i}",
            role="student",
            is_active=True
        )
        session.add(user)
        await session.flush()
        
        student = Student(
            id=str(uuid4()),
            user_id=user.id,
            admission_number=f"STU{str(i).zfill(4)}",
            grade_level=f"Grade {(i % 9) + 1}",
            learning_profile={"learning_style": "visual"}
        )
        students.append(student)
    
    session.add_all(students)
    await session.commit()
    print(f"✓ Created {len(students)} students")
    return students

async def seed_support_tickets(session: AsyncSession, staff_users, students):
    """Seed 1000+ support tickets"""
    print("Seeding support tickets...")
    tickets = []
    statuses = ["open", "in_progress", "resolved", "closed"]
    priorities = ["low", "medium", "high", "critical"]
    categories = ["technical", "academic", "behavioral", "billing"]
    
    for i in range(1, 1001):
        ticket = SupportTicket(
            id=str(uuid4()),
            student_id=students[i % len(students)].id,
            assigned_to=staff_users[i % len(staff_users)].id if i % 3 == 0 else None,
            subject=f"Support Ticket #{i}",
            description=f"This is a test ticket for issue #{i}",
            status=statuses[i % len(statuses)],
            priority=priorities[i % len(priorities)],
            category=categories[i % len(categories)],
            sla_deadline=datetime.utcnow() + timedelta(hours=24),
            conversation_history=[
                {"sender": "student", "message": "Initial message", "timestamp": datetime.utcnow().isoformat()}
            ],
            created_at=datetime.utcnow() - timedelta(days=i % 30)
        )
        tickets.append(ticket)
    
    session.add_all(tickets)
    await session.commit()
    print(f"✓ Created {len(tickets)} support tickets")

async def seed_moderation_items(session: AsyncSession, students):
    """Seed moderation queue items"""
    print("Seeding moderation items...")
    items = []
    
    for i in range(1, 101):
        item = ModerationItem(
            id=str(uuid4()),
            item_type=["content", "comment", "discussion"][i % 3],
            item_id=str(uuid4()),
            submitter_id=students[i % len(students)].id,
            status=["pending", "approved", "rejected"][i % 3],
            ai_risk_score=float((i % 100) / 100),
            ai_categories=["spam", "inappropriate", "off-topic"],
            created_at=datetime.utcnow() - timedelta(days=i % 7)
        )
        items.append(item)
    
    session.add_all(items)
    await session.commit()
    print(f"✓ Created {len(items)} moderation items")

async def seed_knowledge_base(session: AsyncSession, staff_users):
    """Seed knowledge base categories and articles"""
    print("Seeding knowledge base...")
    
    # Create categories
    categories = []
    for cat_name in ["Technical", "Academic Support", "Policies", "Training"]:
        category = KBCategory(
            id=str(uuid4()),
            name=cat_name,
            description=f"{cat_name} articles and guides",
            icon="folder"
        )
        categories.append(category)
        session.add(category)
    
    await session.flush()
    
    # Create articles
    articles = []
    for i in range(1, 51):
        article = KBArticle(
            id=str(uuid4()),
            category_id=categories[i % len(categories)].id,
            title=f"How to {['solve', 'handle', 'manage', 'fix'][i % 4]} {i}",
            content=f"# Article {i}\n\nThis is a comprehensive guide...",
            author_id=staff_users[i % len(staff_users)].id,
            tags=["guide", "howto", "faq"],
            is_published=True,
            is_featured=i % 10 == 0,
            views_count=i * 10,
            helpful_count=i * 2
        )
        articles.append(article)
    
    session.add_all(articles)
    await session.commit()
    print(f"✓ Created {len(categories)} categories and {len(articles)} articles")

async def seed_live_sessions(session: AsyncSession, staff_users):
    """Seed live class sessions"""
    print("Seeding live sessions...")
    sessions = []
    
    for i in range(1, 21):
        session_obj = LiveSession(
            id=str(uuid4()),
            host_id=staff_users[i % len(staff_users)].id,
            title=f"Live Class Session {i}",
            description="Test session",
            start_time=datetime.utcnow() + timedelta(days=i),
            duration_minutes=60,
            max_participants=30,
            livekit_room_name=f"room_{uuid4().hex[:8]}",
            status=["scheduled", "live", "ended"][i % 3]
        )
        sessions.append(session_obj)
    
    await session.add_all(sessions)
    await session.commit()
    print(f"✓ Created {len(sessions)} live sessions")

async def seed_student_journeys(session: AsyncSession, students):
    """Seed student journey tracking"""
    print("Seeding student journeys...")
    journeys = []
    
    for student in students[:100]:  # First 100 students
        journey = StudentJourney(
            id=str(uuid4()),
            student_id=student.id,
            risk_score=float((hash(student.id) % 100) / 100),
            flags=[],
            interventions=[],
            milestones=[],
            ai_insights={"summary": "AI-generated insights"}
        )
        journeys.append(journey)
    
    session.add_all(journeys)
    await session.commit()
    print(f"✓ Created {len(journeys)} student journeys")

async def seed_staff_tasks(session: AsyncSession, staff_users):
    """Seed staff tasks and notifications"""
    print("Seeding staff tasks...")
    tasks = []
    
    for i in range(1, 201):
        task = StaffTask(
            id=str(uuid4()),
            assigned_to=staff_users[i % len(staff_users)].id,
            title=f"Task {i}",
            description=f"Complete task {i}",
            priority=["low", "medium", "high"][i % 3],
            status=["pending", "in_progress", "completed"][i % 3],
            due_date=datetime.utcnow() + timedelta(days=i % 14)
        )
        tasks.append(task)
    
    session.add_all(tasks)
    await session.commit()
    print(f"✓ Created {len(tasks)} staff tasks")

async def main():
    """Main seed function"""
    print("Starting staff data seed...\n")
    
    async with async_session_maker() as session:
        try:
            staff_users = await seed_staff_users(session)
            students = await seed_students(session)
            await seed_support_tickets(session, staff_users, students)
            await seed_moderation_items(session, students)
            await seed_knowledge_base(session, staff_users)
            await seed_live_sessions(session, staff_users)
            await seed_student_journeys(session, students)
            await seed_staff_tasks(session, staff_users)
            
            print("\n✅ Staff data seed completed successfully!")
            print("\nTest Credentials:")
            print("  Email: staff1@tuhs.co.ke")
            print("  Password: password123")
            
        except Exception as e:
            print(f"\n❌ Seed failed: {e}")
            await session.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(main())
