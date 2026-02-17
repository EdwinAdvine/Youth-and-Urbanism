"""
Seed script: Populates all student-specific dashboard, gamification,
community, and account tables with realistic Kenyan CBC test data.

Depends on existing data from seed_users.py / seed_comprehensive.py:
  - Students (queried from `students` table)
  - Courses  (queried from `courses` table)
  - Users with role='instructor' (for Teacher Q&A)

Usage:
    cd backend/
    python seed_student_dashboard.py

Or inside Docker:
    docker exec tuhs_backend python seed_student_dashboard.py
"""

import asyncio
import sys
import os
import uuid
import random
from datetime import datetime, timedelta, date
from decimal import Decimal

# Ensure the backend directory is in the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load .env.development before importing app modules
from dotenv import load_dotenv
load_dotenv(".env.development")

# ============================================================================
# SAFETY GUARD: Prevent running seed script in production
# ============================================================================
_environment = os.getenv("ENVIRONMENT", "development").lower()
if _environment == "production":
    print("ERROR: Seed script cannot run in production environment.")
    print("Set ENVIRONMENT to 'development' or 'staging' to use this script.")
    sys.exit(1)

from sqlalchemy import select, func
from app.database import Base, init_db
from app.models import *  # noqa: F403 - Import all models so Base.metadata is populated
from app.models.student import Student
from app.models.course import Course
from app.models.user import User
from app.models.enrollment import Enrollment, EnrollmentStatus

# Dashboard models
from app.models.student_dashboard import (
    StudentMoodEntry, MoodType,
    StudentStreak,
    StudentDailyPlan,
    StudentJournalEntry,
    StudentWishlist,
    StudentSessionPrep,
)

# Gamification models
from app.models.student_gamification import (
    StudentXPEvent,
    StudentLevel,
    StudentBadge,
    StudentGoal,
    StudentSkillNode,
    StudentWeeklyReport,
)

# Community models
from app.models.student_community import (
    StudentFriendship, FriendshipStatus,
    StudentStudyGroup,
    StudentShoutout, ShoutoutCategory,
    StudentTeacherQA,
)

# Account models
from app.models.student_account import (
    StudentConsentRecord, ConsentType,
    StudentTeacherAccess,
)

# ---------------------------------------------------------------------------
# Reproducible randomness
# ---------------------------------------------------------------------------
random.seed(42)

# ---------------------------------------------------------------------------
# Constants: CBC-aligned Kenyan curriculum context
# ---------------------------------------------------------------------------
CBC_SUBJECTS = [
    "Mathematics", "English", "Kiswahili", "Science and Technology",
    "Social Studies", "Creative Arts", "Religious Education",
    "Health Education", "Agriculture", "Computer Science",
    "Music", "Physical Education", "Life Skills",
]

MOOD_TYPES = list(MoodType)
MOOD_CONTEXTS = ["login", "manual", "ai_prompt"]

MOOD_NOTES = {
    MoodType.happy: [
        "Had a great morning learning fractions!",
        "I understood the science experiment today!",
        "My friend helped me with Kiswahili homework.",
        "Got full marks on my spelling test!",
    ],
    MoodType.okay: [
        "Normal day, nothing special.",
        "Finished my reading but it was a bit long.",
        "Feeling alright, ready to learn.",
    ],
    MoodType.tired: [
        "Woke up early for morning chores.",
        "Stayed up late reading a storybook.",
        "Long day but I still want to study.",
    ],
    MoodType.frustrated: [
        "Division problems are so hard!",
        "I don't understand this Kiswahili grammar rule.",
        "My internet was slow during the live class.",
    ],
    MoodType.excited: [
        "We're doing a science experiment tomorrow!",
        "I just earned a new badge!",
        "My teacher said my essay was the best!",
        "We have a field trip next week!",
    ],
}

DAILY_PLAN_ITEMS_POOL = [
    {"title": "Multiplication tables practice", "subject": "Mathematics", "duration": 25, "type": "exercise"},
    {"title": "Reading comprehension passage", "subject": "English", "duration": 30, "type": "lesson"},
    {"title": "Kiswahili insha writing", "subject": "Kiswahili", "duration": 35, "type": "assignment"},
    {"title": "Science video: Water cycle", "subject": "Science and Technology", "duration": 20, "type": "video"},
    {"title": "Social Studies map reading", "subject": "Social Studies", "duration": 25, "type": "interactive"},
    {"title": "Art project: Kenyan landscape", "subject": "Creative Arts", "duration": 40, "type": "project"},
    {"title": "Break & snack time", "subject": "Break", "duration": 15, "type": "break"},
    {"title": "Physical warm-up exercises", "subject": "Physical Education", "duration": 15, "type": "activity"},
    {"title": "Coding with Scratch: Loops", "subject": "Computer Science", "duration": 30, "type": "interactive"},
    {"title": "Fractions word problems", "subject": "Mathematics", "duration": 30, "type": "exercise"},
    {"title": "Creative writing: My Dream", "subject": "English", "duration": 25, "type": "assignment"},
    {"title": "Music: Learning recorder notes", "subject": "Music", "duration": 20, "type": "lesson"},
    {"title": "Health: Balanced diet quiz", "subject": "Health Education", "duration": 15, "type": "quiz"},
    {"title": "Geometry shapes worksheet", "subject": "Mathematics", "duration": 20, "type": "exercise"},
    {"title": "Kiswahili hadithi reading", "subject": "Kiswahili", "duration": 20, "type": "lesson"},
]

JOURNAL_ENTRIES = [
    {
        "content": "Today I learned about the water cycle in science class. I drew a diagram showing evaporation, condensation, and precipitation. I think I understand it now. The experiment with the kettle and cold plate was really cool!",
        "mood_tag": MoodType.happy,
        "ai_insights": {
            "sentiment": "positive",
            "topics": ["science", "water cycle", "hands-on learning"],
            "suggestions": ["Try researching the water cycle in your local area", "Draw a comic about water's journey"],
        },
        "reflection_prompts": ["What did you find most surprising today?", "How could you teach this to a friend?"],
    },
    {
        "content": "I struggled with division today. Long division makes no sense to me. I tried three times but kept getting the wrong answer. Birdy helped me step by step but I still feel confused.",
        "mood_tag": MoodType.frustrated,
        "ai_insights": {
            "sentiment": "negative",
            "topics": ["mathematics", "division", "struggle"],
            "suggestions": ["Try using visual aids like number lines", "Break the problem into smaller steps", "Ask your teacher for extra practice problems"],
        },
        "reflection_prompts": ["What part of division is the hardest?", "Can you think of a real-life example where you divide things?"],
    },
    {
        "content": "We had a Kiswahili debate today about whether school uniforms are important. I argued that they promote equality. My friend Amina argued against. It was fun! I learned new Kiswahili words like 'usawa' (equality) and 'uhuru' (freedom).",
        "mood_tag": MoodType.excited,
        "ai_insights": {
            "sentiment": "very positive",
            "topics": ["Kiswahili", "debate", "vocabulary", "critical thinking"],
            "suggestions": ["Write a short essay in Kiswahili about your debate topic", "Learn 5 new Kiswahili words every day"],
        },
        "reflection_prompts": ["What was the strongest argument you heard today?", "How do you feel when you speak Kiswahili?"],
    },
    {
        "content": "Today was okay. I finished my English reading assignment about Wangari Maathai. She planted millions of trees. I want to plant a tree too. Maybe I can start a small garden at home.",
        "mood_tag": MoodType.okay,
        "ai_insights": {
            "sentiment": "neutral-positive",
            "topics": ["English", "reading", "environment", "Wangari Maathai"],
            "suggestions": ["Research other Kenyan heroes", "Start a nature journal"],
        },
        "reflection_prompts": ["What inspired you most about Wangari Maathai?", "How can you help the environment?"],
    },
    {
        "content": "I coded my first Scratch game today! It's a simple maze where you guide a lion through the savanna. The hardest part was making the lion move smoothly. I want to add sound effects next.",
        "mood_tag": MoodType.excited,
        "ai_insights": {
            "sentiment": "very positive",
            "topics": ["coding", "Scratch", "game design", "creativity"],
            "suggestions": ["Add scoring to your game", "Try making the maze randomly generated"],
        },
        "reflection_prompts": ["What was the trickiest bug to fix?", "What features would make your game more fun?"],
    },
    {
        "content": "I'm tired today because we had a lot of homework. But I finished everything before dinner. My mum was proud of me. I read a chapter of 'Hadithi za Abunuwasi' before bed. It was funny.",
        "mood_tag": MoodType.tired,
        "ai_insights": {
            "sentiment": "mixed-positive",
            "topics": ["homework", "time management", "Kiswahili literature", "family"],
            "suggestions": ["Try scheduling breaks between homework subjects", "Keep a reading log of books you enjoy"],
        },
        "reflection_prompts": ["How do you manage your time for homework?", "What makes Abunuwasi stories funny?"],
    },
    {
        "content": "We learned about Kenya's geography today. I can now name all 47 counties! My favourite part was learning about the Great Rift Valley and Lake Turkana. I want to visit Turkana one day.",
        "mood_tag": MoodType.happy,
        "ai_insights": {
            "sentiment": "positive",
            "topics": ["Social Studies", "geography", "Kenya", "Rift Valley"],
            "suggestions": ["Create a colourful map of Kenya's counties", "Research one county each week"],
        },
        "reflection_prompts": ["Which county would you most like to visit?", "What makes Kenya's geography unique?"],
    },
]

BADGE_DEFINITIONS = [
    # (badge_name, badge_type, description, icon, rarity)
    ("First Steps", "milestone", "Completed your first lesson", "trophy-bronze", "common"),
    ("Math Whiz", "skill", "Scored 90%+ on 5 math quizzes", "calculator", "uncommon"),
    ("Bookworm", "achievement", "Read 20 passages in English", "book-open", "uncommon"),
    ("Kiswahili Star", "skill", "Mastered 100 Kiswahili vocabulary words", "star", "rare"),
    ("Science Explorer", "achievement", "Completed all science experiments", "flask", "rare"),
    ("Coding Ninja", "skill", "Built 3 Scratch projects", "code", "rare"),
    ("Streak Master", "milestone", "Maintained a 30-day learning streak", "fire", "epic"),
    ("Social Butterfly", "achievement", "Helped 10 peers in study groups", "users", "uncommon"),
    ("Perfect Score", "achievement", "Got 100% on any quiz", "check-circle", "uncommon"),
    ("Night Owl", "special", "Completed a lesson after 8 PM", "moon", "common"),
    ("Early Bird", "special", "Started learning before 7 AM", "sun", "common"),
    ("Community Hero", "achievement", "Received 5 shoutouts from peers", "heart", "rare"),
    ("Quiz Champion", "milestone", "Passed 50 quizzes", "award", "epic"),
    ("Goal Getter", "achievement", "Completed 10 learning goals", "target", "rare"),
    ("Level 10 Scholar", "milestone", "Reached Level 10", "crown", "legendary"),
]

GOAL_TEMPLATES = [
    ("Complete 5 math lessons this week", "Finish 5 mathematics lessons before Sunday", 5, "lessons", False, True),
    ("Read 3 English storybooks", "Read three English storybooks and write summaries", 3, "books", True, False),
    ("Practice Kiswahili daily for 7 days", "Spend at least 20 minutes on Kiswahili each day", 7, "days", True, False),
    ("Score 80%+ on science quiz", "Achieve at least 80% on the next science quiz", 80, "percent", False, True),
    ("Finish Creative Arts project", "Complete the Kenyan landscape painting project", 1, "projects", False, False),
    ("Help 3 classmates this week", "Assist at least 3 peers in study groups or Q&A", 3, "peers", True, False),
    ("Earn 500 XP this week", "Accumulate 500 experience points through various activities", 500, "xp", True, False),
    ("Complete 10 coding challenges", "Solve 10 Scratch coding challenges", 10, "challenges", False, False),
]

XP_SOURCES = [
    ("assignment", "Completed multiplication worksheet", 50),
    ("quiz", "Scored 85% on English vocabulary quiz", 75),
    ("challenge", "Finished coding challenge: Loops", 100),
    ("streak", "7-day learning streak bonus", 150),
    ("login", "Daily login bonus", 10),
    ("helping_peer", "Helped a classmate with fractions", 30),
    ("project", "Submitted Creative Arts project", 200),
    ("assignment", "Finished Kiswahili composition", 60),
    ("quiz", "Science quiz: Our Environment", 80),
    ("login", "Weekly login streak", 25),
    ("assignment", "Social Studies map exercise", 45),
    ("challenge", "Mathematics speed challenge", 120),
    ("quiz", "Kiswahili grammar assessment", 70),
    ("helping_peer", "Explained water cycle to peer", 35),
    ("project", "Completed group Science project", 250),
    ("assignment", "Health education worksheet", 40),
    ("quiz", "Computer Science basics quiz", 90),
    ("streak", "14-day streak milestone", 300),
    ("challenge", "Creative writing competition entry", 150),
    ("login", "Morning login bonus", 15),
]

SKILL_NODES = [
    # (skill_name, subject, proficiency_range_low, proficiency_range_high)
    ("Addition & Subtraction", "Mathematics", 60, 95),
    ("Multiplication", "Mathematics", 40, 85),
    ("Division", "Mathematics", 30, 75),
    ("Fractions", "Mathematics", 20, 70),
    ("Geometry", "Mathematics", 35, 80),
    ("Reading Comprehension", "English", 50, 95),
    ("Vocabulary", "English", 45, 90),
    ("Grammar", "English", 40, 85),
    ("Creative Writing", "English", 30, 80),
    ("Kusoma (Reading)", "Kiswahili", 40, 85),
    ("Msamiati (Vocabulary)", "Kiswahili", 35, 80),
    ("Sarufi (Grammar)", "Kiswahili", 30, 75),
    ("Living Things", "Science and Technology", 50, 90),
    ("Water Cycle", "Science and Technology", 45, 85),
    ("Simple Machines", "Science and Technology", 35, 75),
    ("Kenya Geography", "Social Studies", 40, 85),
    ("History of Kenya", "Social Studies", 35, 80),
    ("Civic Education", "Social Studies", 30, 70),
    ("Block Coding", "Computer Science", 25, 75),
    ("Digital Literacy", "Computer Science", 40, 85),
]

STUDY_GROUP_DEFS = [
    ("Math Masters", "Mathematics", "We solve tricky math problems together! Join us for daily practice."),
    ("Kiswahili Krew", "Kiswahili", "Tujifunze Kiswahili pamoja! Practice reading, writing, and speaking."),
    ("Science Squad", "Science and Technology", "Explore science experiments and share discoveries."),
    ("Code Cubs", "Computer Science", "Learn Scratch, Python basics, and build cool projects together."),
    ("History Buffs", "Social Studies", "Discover Kenya's rich history and cultures together."),
]

SHOUTOUT_MESSAGES = [
    ("You're so good at explaining fractions! Thanks for helping me.", ShoutoutCategory.HELP),
    ("Congratulations on reaching Level 5! Keep going!", ShoutoutCategory.ACHIEVEMENT),
    ("Your Kiswahili insha was amazing. You're a great writer!", ShoutoutCategory.ENCOURAGEMENT),
    ("Thanks for sharing your science notes with me.", ShoutoutCategory.THANKS),
    ("You're the best study partner! I love our study group.", ShoutoutCategory.ENCOURAGEMENT),
    ("Well done on your perfect math quiz score!", ShoutoutCategory.ACHIEVEMENT),
    ("Thanks for explaining the coding loops to me.", ShoutoutCategory.HELP),
    ("Your drawing in Creative Arts was incredible!", ShoutoutCategory.ENCOURAGEMENT),
    ("You helped me understand the water cycle. Thank you!", ShoutoutCategory.THANKS),
    ("You're so brave for presenting in Kiswahili today!", ShoutoutCategory.ENCOURAGEMENT),
    ("Your science experiment idea was brilliant!", ShoutoutCategory.ACHIEVEMENT),
    ("Thanks for lending me your book about Wangari Maathai.", ShoutoutCategory.THANKS),
    ("You always make our study group fun. Keep it up!", ShoutoutCategory.ENCOURAGEMENT),
    ("Amazing job on the Social Studies project!", ShoutoutCategory.ACHIEVEMENT),
    ("You taught me a new Kiswahili word today. Asante sana!", ShoutoutCategory.HELP),
    ("Your coding game was so cool! I want to learn how you did it.", ShoutoutCategory.ENCOURAGEMENT),
    ("Thanks for cheering me up when I was frustrated with homework.", ShoutoutCategory.THANKS),
    ("You are the kindest person in our class.", ShoutoutCategory.ENCOURAGEMENT),
    ("Great job finishing all your goals this week!", ShoutoutCategory.ACHIEVEMENT),
    ("You make learning fun for everyone around you.", ShoutoutCategory.ENCOURAGEMENT),
]

QA_THREADS = [
    {
        "question": "Teacher, I don't understand how to simplify fractions. Can you explain with an example?",
        "ai_summary": "Student requests help simplifying fractions with a worked example.",
        "answer": "Great question! To simplify a fraction, divide both the numerator and denominator by their greatest common factor (GCF). For example, 6/8: the GCF of 6 and 8 is 2, so 6/8 = 3/4. Try simplifying 10/15 on your own!",
        "is_answered": True,
        "is_public": True,
    },
    {
        "question": "What is the difference between 'ni' and 'si' in Kiswahili? I keep mixing them up.",
        "ai_summary": "Student confused about Kiswahili affirmative 'ni' vs negative 'si' particles.",
        "answer": "'Ni' means 'is/am/are' (affirmative) while 'si' means 'is not/am not/are not' (negative). Example: 'Mimi ni mwanafunzi' (I am a student) vs 'Mimi si mwalimu' (I am not a teacher). Practice with 5 sentences of each!",
        "is_answered": True,
        "is_public": True,
    },
    {
        "question": "How does photosynthesis work? We learned about it in class but I'm still confused about the chemical equation.",
        "ai_summary": "Student needs clarification on the photosynthesis process and its chemical equation.",
        "answer": None,
        "is_answered": False,
        "is_public": False,
    },
    {
        "question": "Can you recommend books about the history of Kenya for Grade 5 level?",
        "ai_summary": "Student looking for age-appropriate Kenyan history books at Grade 5 reading level.",
        "answer": "Here are some great books: 1) 'The Story of Kenya' by David Maillu, 2) 'Our Heritage' by Longhorn Publishers, 3) 'Young People's History of Kenya' by Macmillan Kenya. Check if the school library has them!",
        "is_answered": True,
        "is_public": True,
    },
    {
        "question": "I want to learn Python but we only do Scratch in class. Is it too hard for Grade 6?",
        "ai_summary": "Grade 6 student interested in transitioning from Scratch to Python programming.",
        "answer": "Python is a great next step after Scratch! It's not too hard if you start with basics. Try 'Python for Kids' tutorials on our platform. Start with print statements and simple loops. You already understand the concepts from Scratch!",
        "is_answered": True,
        "is_public": True,
    },
    {
        "question": "Teacher, how do I calculate the area of a triangle? I know rectangles but triangles confuse me.",
        "ai_summary": "Student struggling with triangle area formula, already understands rectangles.",
        "answer": "Think of it this way: a triangle is half of a rectangle! The formula is: Area = (base x height) / 2. If a triangle has base 6cm and height 4cm, Area = (6 x 4) / 2 = 12 square cm. Try drawing it to see why!",
        "is_answered": True,
        "is_public": True,
    },
    {
        "question": "What causes earthquakes? We felt a small tremor in Nairobi last week and I was scared.",
        "ai_summary": "Student curious about earthquake causes after experiencing a tremor in Nairobi.",
        "answer": None,
        "is_answered": False,
        "is_public": False,
    },
    {
        "question": "How do I write a good composition in English? I always run out of ideas in the middle.",
        "ai_summary": "Student needs help with English composition writing, specifically with maintaining ideas.",
        "answer": "Great question! Here's a tip: before writing, make a quick outline with 3 main points. Use the PEEL method for each paragraph: Point, Evidence, Explain, Link. Also, keep a 'ideas notebook' where you write down interesting things you see or think about.",
        "is_answered": True,
        "is_public": True,
    },
    {
        "question": "Mwalimu, je, ninawezaje kuboresha matamshi yangu ya Kiswahili? (Teacher, how can I improve my Kiswahili pronunciation?)",
        "ai_summary": "Student asking for tips to improve Kiswahili pronunciation skills.",
        "answer": "Hongera kwa kutaka kuboresha! (Congratulations on wanting to improve!) 1) Listen to Kiswahili radio or podcasts daily, 2) Read aloud for 10 minutes every day, 3) Record yourself and compare with native speakers, 4) Practice tongue twisters like 'Kata kata kata, katakata ya kata kata'.",
        "is_answered": True,
        "is_public": True,
    },
    {
        "question": "Is there going to be extra help sessions for the upcoming mathematics exam?",
        "ai_summary": "Student inquiring about revision sessions before the mathematics exam.",
        "answer": None,
        "is_answered": False,
        "is_public": False,
    },
]

WEEKLY_REPORT_STORIES = [
    "This was a productive week for {name}! They showed strong engagement in Mathematics, completing {lessons} lessons with an average score of {score}%. Their streak of {streak} days demonstrates excellent consistency. The AI tutor noted improved confidence in problem-solving.",
    "{name} made steady progress across all subjects this week. They spent {minutes} minutes learning, with particular strength in {strong_subject}. One area for growth is {weak_subject}, where targeted practice could help. Keep up the great work!",
    "An exciting week for {name}! They earned {xp} XP points and completed {lessons} lessons. Their best performance was in {strong_subject} with {score}% accuracy. The study group participation was also noteworthy - helping peers is a valuable skill.",
    "{name} showed resilience this week, especially in {weak_subject} where they improved from last week. They maintained a {streak}-day streak and completed {lessons} lessons across {subjects} subjects. The AI tutor recommends more practice with {weak_subject} concepts.",
]

SESSION_PREP_TIPS_POOL = [
    "Review your notes on the previous lesson before class starts.",
    "Have your notebook and pencil ready before the session begins.",
    "Think of one question you want to ask the teacher during the session.",
    "Review the vocabulary words from the last Kiswahili class.",
    "Look at the homework problems you found difficult - bring questions!",
    "Try the warm-up exercise posted on the class wall before the session.",
    "Make sure your internet connection is stable before the live class.",
    "Have a glass of water nearby - staying hydrated helps you concentrate!",
    "Review the chapter summary so you can follow along more easily.",
    "Check if there are any pre-reading materials shared by the teacher.",
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _random_past_datetime(days_back_max: int = 7, days_back_min: int = 0) -> datetime:
    """Return a random datetime within the given range of past days."""
    delta = timedelta(
        days=random.randint(days_back_min, days_back_max),
        hours=random.randint(6, 20),
        minutes=random.randint(0, 59),
    )
    return datetime.utcnow() - delta


# ---------------------------------------------------------------------------
# Main seed logic
# ---------------------------------------------------------------------------
async def main():
    print("=" * 75)
    print("  Urban Home School - Student Dashboard Data Seeding")
    print("=" * 75)

    # ── 1. Initialize database ────────────────────────────────────────────
    print("\n[INIT] Initializing database connection...")
    await init_db()

    from app.database import engine, AsyncSessionLocal

    # ── 2. Query existing students and courses ────────────────────────────
    print("[INIT] Querying existing students and courses...")
    async with AsyncSessionLocal() as session:
        # Get all students
        result = await session.execute(select(Student).where(Student.is_active == True))
        students = result.scalars().all()

        # Get all published courses
        result = await session.execute(select(Course).where(Course.is_published == True))
        courses = result.scalars().all()

        # Get instructor user IDs for Teacher Q&A
        result = await session.execute(select(User).where(User.role == "instructor"))
        instructors = result.scalars().all()

    if not students:
        print("\n  ERROR: No students found in the database.")
        print("  Please run seed_comprehensive.py first to create student records.")
        await engine.dispose()
        sys.exit(1)

    if not courses:
        print("\n  ERROR: No courses found in the database.")
        print("  Please run seed_comprehensive.py first to create course records.")
        await engine.dispose()
        sys.exit(1)

    student_ids = [s.id for s in students]
    course_ids = [c.id for c in courses]
    instructor_user_ids = [i.id for i in instructors] if instructors else []

    print(f"      Found {len(students)} students, {len(courses)} courses, {len(instructors)} instructors.")
    print()

    now = datetime.utcnow()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # ======================================================================
    # 1. ENROLLMENTS
    # ======================================================================
    print("[1/15] Seeding enrollments...")
    async with AsyncSessionLocal() as session:
        # Check if enrollments already exist
        result = await session.execute(
            select(func.count()).select_from(Enrollment).where(Enrollment.is_deleted == False)
        )
        existing_count = result.scalar()

        if existing_count and existing_count > 0:
            print(f"       [SKIP] {existing_count} enrollments already exist.")
        else:
            enrollment_count = 0
            for student in students:
                # Each student enrolls in 2-5 courses
                num_courses = random.randint(2, min(5, len(courses)))
                enrolled_courses = random.sample(courses, num_courses)
                for course in enrolled_courses:
                    progress = Decimal(str(round(random.uniform(10.0, 100.0), 2)))
                    is_completed = progress >= Decimal("95.00")
                    status = EnrollmentStatus.COMPLETED if is_completed else EnrollmentStatus.ACTIVE
                    time_spent = random.randint(30, 600)
                    lessons_done = [str(i) for i in range(1, random.randint(1, 10))]

                    enrollment = Enrollment(
                        student_id=student.id,
                        course_id=course.id,
                        status=status,
                        progress_percentage=progress,
                        completed_lessons=lessons_done,
                        total_time_spent_minutes=time_spent,
                        last_accessed_at=_random_past_datetime(days_back_max=3),
                        current_grade=Decimal(str(round(random.uniform(55.0, 98.0), 2))),
                        quiz_scores=[
                            {"quiz_id": str(uuid.uuid4()), "score": random.randint(50, 100), "date": (now - timedelta(days=random.randint(1, 14))).isoformat()}
                            for _ in range(random.randint(1, 4))
                        ],
                        assignment_scores=[
                            {"assignment_id": str(uuid.uuid4()), "score": random.randint(60, 100), "date": (now - timedelta(days=random.randint(1, 14))).isoformat()}
                            for _ in range(random.randint(1, 3))
                        ],
                        is_completed=is_completed,
                        completed_at=_random_past_datetime(days_back_max=7) if is_completed else None,
                        payment_amount=Decimal("0.00"),
                        enrolled_at=now - timedelta(days=random.randint(14, 90)),
                    )
                    session.add(enrollment)
                    enrollment_count += 1

            await session.commit()
            print(f"       Created {enrollment_count} enrollments.")

    # ======================================================================
    # 2. STREAKS
    # ======================================================================
    print("[2/15] Seeding student streaks...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(func.count()).select_from(StudentStreak).where(StudentStreak.is_deleted == False)
        )
        existing_count = result.scalar()

        if existing_count and existing_count > 0:
            print(f"       [SKIP] {existing_count} streaks already exist.")
        else:
            streak_count = 0
            for student in students:
                current = random.randint(1, 30)
                longest = max(current, random.randint(current, 45))
                history = []
                for d in range(min(current + 5, 14)):
                    day = (today - timedelta(days=d)).isoformat()
                    completed = d < current
                    history.append({
                        "date": day,
                        "completed": completed,
                        "activities_count": random.randint(1, 6) if completed else 0,
                    })

                streak = StudentStreak(
                    student_id=student.id,
                    current_streak=current,
                    longest_streak=longest,
                    last_activity_date=now - timedelta(hours=random.randint(1, 18)),
                    streak_shields=random.randint(0, 3),
                    history=history,
                )
                session.add(streak)
                streak_count += 1

            await session.commit()
            print(f"       Created {streak_count} streaks.")

    # ======================================================================
    # 3. MOOD ENTRIES
    # ======================================================================
    print("[3/15] Seeding mood entries...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(func.count()).select_from(StudentMoodEntry).where(StudentMoodEntry.is_deleted == False)
        )
        existing_count = result.scalar()

        if existing_count and existing_count > 0:
            print(f"       [SKIP] {existing_count} mood entries already exist.")
        else:
            mood_count = 0
            for student in students:
                num_entries = random.randint(3, 7)
                for i in range(num_entries):
                    mood = random.choice(MOOD_TYPES)
                    notes_pool = MOOD_NOTES.get(mood, ["Feeling okay today."])
                    entry = StudentMoodEntry(
                        student_id=student.id,
                        mood_type=mood,
                        energy_level=random.randint(1, 5),
                        note=random.choice(notes_pool),
                        context=random.choice(MOOD_CONTEXTS),
                        timestamp=_random_past_datetime(days_back_max=7, days_back_min=0),
                    )
                    session.add(entry)
                    mood_count += 1

            await session.commit()
            print(f"       Created {mood_count} mood entries.")

    # ======================================================================
    # 4. DAILY PLANS
    # ======================================================================
    print("[4/15] Seeding daily plans...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(func.count()).select_from(StudentDailyPlan).where(StudentDailyPlan.is_deleted == False)
        )
        existing_count = result.scalar()

        if existing_count and existing_count > 0:
            print(f"       [SKIP] {existing_count} daily plans already exist.")
        else:
            plan_count = 0
            for student in students:
                num_items = random.randint(4, 6)
                items = random.sample(DAILY_PLAN_ITEMS_POOL, num_items)
                # Mark some items as completed
                completed = 0
                plan_items = []
                for idx, item in enumerate(items):
                    is_done = idx < random.randint(0, num_items - 1)
                    plan_items.append({
                        **item,
                        "order": idx + 1,
                        "completed": is_done,
                    })
                    if is_done:
                        completed += 1

                total_duration = sum(item["duration"] for item in items)

                plan = StudentDailyPlan(
                    student_id=student.id,
                    date=today,
                    items=plan_items,
                    ai_generated=True,
                    manually_edited=random.choice([True, False]),
                    total_duration=total_duration,
                    completed_count=completed,
                )
                session.add(plan)
                plan_count += 1

            await session.commit()
            print(f"       Created {plan_count} daily plans.")

    # ======================================================================
    # 5. JOURNAL ENTRIES
    # ======================================================================
    print("[5/15] Seeding journal entries...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(func.count()).select_from(StudentJournalEntry).where(StudentJournalEntry.is_deleted == False)
        )
        existing_count = result.scalar()

        if existing_count and existing_count > 0:
            print(f"       [SKIP] {existing_count} journal entries already exist.")
        else:
            journal_count = 0
            for student in students:
                num_entries = random.randint(2, 5)
                chosen_entries = random.sample(JOURNAL_ENTRIES, min(num_entries, len(JOURNAL_ENTRIES)))
                for entry_data in chosen_entries:
                    entry = StudentJournalEntry(
                        student_id=student.id,
                        content=entry_data["content"],
                        mood_tag=entry_data["mood_tag"],
                        ai_insights=entry_data["ai_insights"],
                        reflection_prompts=entry_data["reflection_prompts"],
                        created_at=_random_past_datetime(days_back_max=14, days_back_min=0),
                    )
                    session.add(entry)
                    journal_count += 1

            await session.commit()
            print(f"       Created {journal_count} journal entries.")

    # ======================================================================
    # 6. WISHLISTS
    # ======================================================================
    print("[6/15] Seeding wishlists...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(func.count()).select_from(StudentWishlist).where(StudentWishlist.is_deleted == False)
        )
        existing_count = result.scalar()

        if existing_count and existing_count > 0:
            print(f"       [SKIP] {existing_count} wishlist items already exist.")
        else:
            wishlist_count = 0
            for student in students:
                num_wishes = random.randint(1, 3)
                wish_courses = random.sample(courses, min(num_wishes, len(courses)))
                for priority, course in enumerate(wish_courses):
                    wish = StudentWishlist(
                        student_id=student.id,
                        course_id=course.id,
                        priority=priority + 1,
                        added_at=_random_past_datetime(days_back_max=30),
                    )
                    session.add(wish)
                    wishlist_count += 1

            await session.commit()
            print(f"       Created {wishlist_count} wishlist items.")

    # ======================================================================
    # 7. XP EVENTS
    # ======================================================================
    print("[7/15] Seeding XP events...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(func.count()).select_from(StudentXPEvent).where(StudentXPEvent.is_deleted == False)
        )
        existing_count = result.scalar()

        if existing_count and existing_count > 0:
            print(f"       [SKIP] {existing_count} XP events already exist.")
        else:
            xp_count = 0
            student_xp_totals = {}  # student_id -> total XP
            for student in students:
                num_events = random.randint(5, 15)
                chosen_events = [random.choice(XP_SOURCES) for _ in range(num_events)]
                total_xp = 0
                for source, description, base_xp in chosen_events:
                    multiplier = random.choice([1.0, 1.0, 1.0, 1.5, 2.0])  # Mostly 1x, sometimes bonus
                    actual_xp = int(base_xp * multiplier)
                    total_xp += actual_xp

                    event = StudentXPEvent(
                        student_id=student.id,
                        xp_amount=actual_xp,
                        source=source,
                        description=description,
                        multiplier=multiplier,
                        timestamp=_random_past_datetime(days_back_max=14),
                    )
                    session.add(event)
                    xp_count += 1

                student_xp_totals[student.id] = total_xp

            await session.commit()
            print(f"       Created {xp_count} XP events.")

    # ======================================================================
    # 8. LEVELS
    # ======================================================================
    print("[8/15] Seeding student levels...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(func.count()).select_from(StudentLevel).where(StudentLevel.is_deleted == False)
        )
        existing_count = result.scalar()

        if existing_count and existing_count > 0:
            print(f"       [SKIP] {existing_count} levels already exist.")
        else:
            level_count = 0
            for student in students:
                total_xp = student_xp_totals.get(student.id, random.randint(100, 2000))
                # Level calculation: level = floor(total_xp / 200) + 1, capped at 50
                current_level = min(50, (total_xp // 200) + 1)
                next_level_xp = (current_level) * 200  # XP needed for next level

                level = StudentLevel(
                    student_id=student.id,
                    current_level=current_level,
                    total_xp=total_xp,
                    next_level_xp=next_level_xp,
                )
                session.add(level)
                level_count += 1

            await session.commit()
            print(f"       Created {level_count} student levels.")

    # ======================================================================
    # 9. BADGES
    # ======================================================================
    print("[9/15] Seeding badges...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(func.count()).select_from(StudentBadge).where(StudentBadge.is_deleted == False)
        )
        existing_count = result.scalar()

        if existing_count and existing_count > 0:
            print(f"       [SKIP] {existing_count} badges already exist.")
        else:
            badge_count = 0
            for student in students:
                num_badges = random.randint(1, 5)
                chosen_badges = random.sample(BADGE_DEFINITIONS, min(num_badges, len(BADGE_DEFINITIONS)))
                for badge_name, badge_type, description, icon, rarity in chosen_badges:
                    badge = StudentBadge(
                        student_id=student.id,
                        badge_type=badge_type,
                        badge_name=badge_name,
                        description=description,
                        icon=icon,
                        rarity=rarity,
                        earned_at=_random_past_datetime(days_back_max=30),
                        is_shareable=True,
                        badge_metadata={
                            "criteria": description,
                            "category": badge_type,
                            "earned_context": f"Earned through {badge_type} activity",
                        },
                    )
                    session.add(badge)
                    badge_count += 1

            await session.commit()
            print(f"       Created {badge_count} badges.")

    # ======================================================================
    # 10. GOALS
    # ======================================================================
    print("[10/15] Seeding student goals...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(func.count()).select_from(StudentGoal).where(StudentGoal.is_deleted == False)
        )
        existing_count = result.scalar()

        if existing_count and existing_count > 0:
            print(f"       [SKIP] {existing_count} goals already exist.")
        else:
            goal_count = 0
            for student in students:
                num_goals = random.randint(1, 3)
                chosen_goals = random.sample(GOAL_TEMPLATES, min(num_goals, len(GOAL_TEMPLATES)))
                for title, description, target, unit, ai_suggested, teacher_assigned in chosen_goals:
                    # Some goals are completed, some are active
                    is_completed = random.choice([True, False, False])  # 33% completed
                    current = target if is_completed else random.randint(0, target - 1)
                    status = "completed" if is_completed else "active"
                    deadline = now + timedelta(days=random.randint(3, 14)) if not is_completed else None

                    goal = StudentGoal(
                        student_id=student.id,
                        title=title,
                        description=description,
                        target=target,
                        current=current,
                        unit=unit,
                        deadline=deadline,
                        ai_suggested=ai_suggested,
                        teacher_assigned=teacher_assigned,
                        status=status,
                        created_at=_random_past_datetime(days_back_max=14),
                    )
                    session.add(goal)
                    goal_count += 1

            await session.commit()
            print(f"       Created {goal_count} goals.")

    # ======================================================================
    # 11. WEEKLY REPORTS
    # ======================================================================
    print("[11/15] Seeding weekly reports...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(func.count()).select_from(StudentWeeklyReport).where(StudentWeeklyReport.is_deleted == False)
        )
        existing_count = result.scalar()

        if existing_count and existing_count > 0:
            print(f"       [SKIP] {existing_count} weekly reports already exist.")
        else:
            report_count = 0
            for student in students:
                num_reports = random.randint(1, 2)
                for r in range(num_reports):
                    week_start = today - timedelta(days=today.weekday() + (7 * r))
                    week_end = week_start + timedelta(days=6)

                    lessons = random.randint(5, 20)
                    score = random.randint(60, 98)
                    minutes = random.randint(120, 600)
                    xp = random.randint(100, 800)
                    streak_val = random.randint(1, 14)
                    strong = random.choice(CBC_SUBJECTS)
                    weak = random.choice([s for s in CBC_SUBJECTS if s != strong])

                    # Get student name from the user profile (use admission number as fallback)
                    student_name = student.admission_number

                    story_template = random.choice(WEEKLY_REPORT_STORIES)
                    ai_story = story_template.format(
                        name=student_name,
                        lessons=lessons,
                        score=score,
                        minutes=minutes,
                        xp=xp,
                        streak=streak_val,
                        strong_subject=strong,
                        weak_subject=weak,
                        subjects=random.randint(3, 6),
                    )

                    teacher_highlights = [
                        "Excellent participation in group discussions this week.",
                        "Showed great improvement in assignment quality.",
                        "Very helpful to classmates during study sessions.",
                        None,  # Some weeks no highlight
                        "Good effort on the challenging mathematics problems.",
                        None,
                    ]

                    report = StudentWeeklyReport(
                        student_id=student.id,
                        week_start=week_start,
                        week_end=week_end,
                        ai_story=ai_story,
                        metrics={
                            "lessons_completed": lessons,
                            "avg_score": score,
                            "time_spent_minutes": minutes,
                            "xp_earned": xp,
                            "assignments_submitted": random.randint(2, 8),
                            "quizzes_taken": random.randint(1, 5),
                            "streak_days": streak_val,
                            "active_subjects": random.randint(3, 6),
                        },
                        strongest_subject=strong,
                        improvement_area=weak,
                        teacher_highlight=random.choice(teacher_highlights),
                        shared_with_parent=random.choice([True, True, False]),  # 67% shared
                        created_at=week_end + timedelta(hours=random.randint(8, 20)),
                    )
                    session.add(report)
                    report_count += 1

            await session.commit()
            print(f"       Created {report_count} weekly reports.")

    # ======================================================================
    # 12. SKILL NODES
    # ======================================================================
    print("[12/15] Seeding skill nodes...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(func.count()).select_from(StudentSkillNode).where(StudentSkillNode.is_deleted == False)
        )
        existing_count = result.scalar()

        if existing_count and existing_count > 0:
            print(f"       [SKIP] {existing_count} skill nodes already exist.")
        else:
            skill_count = 0
            for student in students:
                # Each student gets 5-10 skill nodes
                num_skills = random.randint(5, 10)
                chosen_skills = random.sample(SKILL_NODES, min(num_skills, len(SKILL_NODES)))
                for skill_name, subject, prof_low, prof_high in chosen_skills:
                    proficiency = random.randint(prof_low, prof_high)
                    skill_node = StudentSkillNode(
                        student_id=student.id,
                        skill_name=skill_name,
                        subject=subject,
                        proficiency=proficiency,
                        parent_node_id=None,  # Flat structure for seed data
                        last_practiced=_random_past_datetime(days_back_max=10),
                    )
                    session.add(skill_node)
                    skill_count += 1

            await session.commit()
            print(f"       Created {skill_count} skill nodes.")

    # ======================================================================
    # 13. FRIENDSHIPS
    # ======================================================================
    print("[13/15] Seeding friendships...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(func.count()).select_from(StudentFriendship).where(StudentFriendship.is_deleted == False)
        )
        existing_count = result.scalar()

        if existing_count and existing_count > 0:
            print(f"       [SKIP] {existing_count} friendships already exist.")
        else:
            friendship_count = 0
            existing_pairs = set()
            target_friendships = random.randint(15, min(25, len(students) * (len(students) - 1) // 2))

            for _ in range(target_friendships * 3):  # Try extra to account for collisions
                if friendship_count >= target_friendships:
                    break

                s1 = random.choice(student_ids)
                s2 = random.choice(student_ids)
                if s1 == s2:
                    continue
                pair = (min(str(s1), str(s2)), max(str(s1), str(s2)))
                if pair in existing_pairs:
                    continue
                existing_pairs.add(pair)

                status = random.choices(
                    [FriendshipStatus.ACCEPTED, FriendshipStatus.PENDING],
                    weights=[0.8, 0.2],
                    k=1,
                )[0]

                friendship = StudentFriendship(
                    student_id=s1,
                    friend_id=s2,
                    status=status,
                    created_at=_random_past_datetime(days_back_max=30),
                )
                session.add(friendship)
                friendship_count += 1

            await session.commit()
            print(f"       Created {friendship_count} friendships.")

    # ======================================================================
    # 14. STUDY GROUPS + SHOUTOUTS + TEACHER Q&A
    # ======================================================================
    print("[14/15] Seeding study groups, shoutouts, and teacher Q&A...")
    async with AsyncSessionLocal() as session:
        # -- Study Groups --
        result = await session.execute(
            select(func.count()).select_from(StudentStudyGroup).where(StudentStudyGroup.is_deleted == False)
        )
        existing_groups = result.scalar()

        if existing_groups and existing_groups > 0:
            print(f"       [SKIP] {existing_groups} study groups already exist.")
        else:
            group_count = 0
            for group_def in STUDY_GROUP_DEFS:
                name, subject, description = group_def
                creator = random.choice(student_ids)
                # Pick 3-6 members (including creator)
                num_members = random.randint(3, min(6, len(student_ids)))
                member_pool = [sid for sid in student_ids if sid != creator]
                members = [str(creator)] + [str(m) for m in random.sample(member_pool, num_members - 1)]

                group = StudentStudyGroup(
                    name=name,
                    description=description,
                    subject=subject,
                    created_by=creator,
                    max_members=10,
                    members=members,
                    is_public=random.choice([True, True, False]),  # 67% public
                    created_at=_random_past_datetime(days_back_max=21),
                )
                session.add(group)
                group_count += 1

            await session.flush()
            print(f"       Created {group_count} study groups.")

        # -- Shoutouts --
        result = await session.execute(
            select(func.count()).select_from(StudentShoutout).where(StudentShoutout.is_deleted == False)
        )
        existing_shoutouts = result.scalar()

        if existing_shoutouts and existing_shoutouts > 0:
            print(f"       [SKIP] {existing_shoutouts} shoutouts already exist.")
        else:
            shoutout_count = 0
            num_shoutouts = random.randint(10, min(20, len(SHOUTOUT_MESSAGES)))
            chosen_shoutouts = random.sample(SHOUTOUT_MESSAGES, num_shoutouts)
            for message, category in chosen_shoutouts:
                from_student = random.choice(student_ids)
                to_student = random.choice([sid for sid in student_ids if sid != from_student])

                shoutout = StudentShoutout(
                    from_student_id=from_student,
                    to_student_id=to_student,
                    message=message,
                    category=category,
                    is_anonymous=random.choice([False, False, False, True]),  # 25% anonymous
                    is_public=random.choice([True, True, False]),
                    created_at=_random_past_datetime(days_back_max=14),
                )
                session.add(shoutout)
                shoutout_count += 1

            await session.flush()
            print(f"       Created {shoutout_count} shoutouts.")

        # -- Teacher Q&A --
        result = await session.execute(
            select(func.count()).select_from(StudentTeacherQA).where(StudentTeacherQA.is_deleted == False)
        )
        existing_qa = result.scalar()

        if existing_qa and existing_qa > 0:
            print(f"       [SKIP] {existing_qa} Q&A threads already exist.")
        else:
            qa_count = 0
            for qa_data in QA_THREADS:
                student_id = random.choice(student_ids)
                teacher_id = random.choice(instructor_user_ids) if instructor_user_ids else None
                created_at = _random_past_datetime(days_back_max=14)

                qa = StudentTeacherQA(
                    student_id=student_id,
                    teacher_id=teacher_id,
                    question=qa_data["question"],
                    ai_summary=qa_data["ai_summary"],
                    answer=qa_data["answer"],
                    is_moderated=qa_data["is_answered"],  # Answered ones are moderated
                    is_answered=qa_data["is_answered"],
                    is_public=qa_data["is_public"],
                    created_at=created_at,
                    answered_at=created_at + timedelta(hours=random.randint(1, 48)) if qa_data["is_answered"] else None,
                )
                session.add(qa)
                qa_count += 1

            await session.flush()
            print(f"       Created {qa_count} Q&A threads.")

        await session.commit()

    # ======================================================================
    # 15. SESSION PREP + CONSENT RECORDS + TEACHER ACCESS
    # ======================================================================
    print("[15/15] Seeding session prep, consent records, and teacher access...")
    async with AsyncSessionLocal() as session:
        # -- Session Prep --
        result = await session.execute(
            select(func.count()).select_from(StudentSessionPrep).where(StudentSessionPrep.is_deleted == False)
        )
        existing_prep = result.scalar()

        if existing_prep and existing_prep > 0:
            print(f"       [SKIP] {existing_prep} session preps already exist.")
        else:
            prep_count = 0
            # Create 1-2 session preps for a subset of students
            prep_students = random.sample(list(students), min(len(students), max(5, len(students) // 2)))
            for student in prep_students:
                num_preps = random.randint(1, 2)
                for _ in range(num_preps):
                    num_tips = random.randint(3, 5)
                    tips = random.sample(SESSION_PREP_TIPS_POOL, num_tips)
                    engagement = random.choice(["high", "medium", "low"])
                    pre_reading = random.sample([
                        "Chapter 5: The Water Cycle",
                        "Unit 3 vocabulary list",
                        "Previous lesson summary notes",
                        "Worksheet 4B - Practice problems",
                        "Kiswahili insha examples",
                    ], random.randint(1, 3))

                    teacher_notes_pool = [
                        "Remember to bring your coloured pencils for this session.",
                        "We will have a short quiz at the start of class.",
                        "Please review last week's homework before the session.",
                        None,
                        "We'll be doing group work today - be ready to collaborate!",
                        None,
                    ]

                    prep = StudentSessionPrep(
                        session_id=uuid.uuid4(),  # Fictional live session ID
                        student_id=student.id,
                        tips=tips,
                        engagement_prediction=engagement,
                        recommended_pre_reading=pre_reading,
                        teacher_notes=random.choice(teacher_notes_pool),
                        created_at=_random_past_datetime(days_back_max=3),
                    )
                    session.add(prep)
                    prep_count += 1

            await session.flush()
            print(f"       Created {prep_count} session preps.")

        # -- Consent Records --
        result = await session.execute(
            select(func.count()).select_from(StudentConsentRecord).where(StudentConsentRecord.is_deleted == False)
        )
        existing_consent = result.scalar()

        if existing_consent and existing_consent > 0:
            print(f"       [SKIP] {existing_consent} consent records already exist.")
        else:
            consent_count = 0
            consent_types = list(ConsentType)
            for student in students:
                # Each student gets consent records for 3-5 consent types
                num_consents = random.randint(3, min(5, len(consent_types)))
                chosen_types = random.sample(consent_types, num_consents)
                for consent_type in chosen_types:
                    is_granted = random.choice([True, True, True, False])  # 75% granted
                    granted_at = _random_past_datetime(days_back_max=60) if is_granted else None

                    consent = StudentConsentRecord(
                        student_id=student.id,
                        parent_id=student.parent_id,
                        consent_type=consent_type,
                        is_granted=is_granted,
                        granted_at=granted_at,
                        expires_at=(granted_at + timedelta(days=365)) if granted_at else None,
                        ip_address=f"196.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
                        user_agent="Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0",
                        created_at=_random_past_datetime(days_back_max=60),
                    )
                    session.add(consent)
                    consent_count += 1

            await session.flush()
            print(f"       Created {consent_count} consent records.")

        # -- Teacher Access --
        result = await session.execute(
            select(func.count()).select_from(StudentTeacherAccess).where(StudentTeacherAccess.is_deleted == False)
        )
        existing_access = result.scalar()

        if existing_access and existing_access > 0:
            print(f"       [SKIP] {existing_access} teacher access records already exist.")
        else:
            access_count = 0
            if instructor_user_ids:
                for student in students:
                    # Each student grants access to 1-3 teachers
                    num_teachers = random.randint(1, min(3, len(instructor_user_ids)))
                    chosen_teachers = random.sample(instructor_user_ids, num_teachers)
                    for teacher_id in chosen_teachers:
                        access = StudentTeacherAccess(
                            student_id=student.id,
                            teacher_id=teacher_id,
                            can_view_progress=True,
                            can_view_mood=random.choice([True, True, False]),
                            can_view_ai_chats=random.choice([True, False, False]),
                            can_view_journal=random.choice([True, False, False, False]),
                            can_message=True,
                            can_view_community_activity=random.choice([True, True, False]),
                            created_at=_random_past_datetime(days_back_max=30),
                        )
                        session.add(access)
                        access_count += 1

            await session.flush()
            print(f"       Created {access_count} teacher access records.")

        await session.commit()

    # ======================================================================
    # SUMMARY
    # ======================================================================
    print()
    print("=" * 75)
    print("  STUDENT DASHBOARD SEED COMPLETE")
    print("=" * 75)
    print()
    print("  Tables seeded:")
    print("  " + "-" * 50)
    print("  Dashboard:")
    print("    - enrollments (student-course links with progress)")
    print("    - student_streaks (learning streaks)")
    print("    - student_mood_entries (mood check-ins)")
    print("    - student_daily_plans (AI daily plans)")
    print("    - student_journal_entries (reflective journals)")
    print("    - student_wishlists (course wishlists)")
    print("    - student_session_prep (live session tips)")
    print()
    print("  Gamification:")
    print("    - student_xp_events (XP earning events)")
    print("    - student_levels (level progression)")
    print("    - student_badges (achievement badges)")
    print("    - student_goals (learning goals)")
    print("    - student_skill_nodes (skill tree)")
    print("    - student_weekly_reports (AI weekly summaries)")
    print()
    print("  Community:")
    print("    - student_friendships (peer connections)")
    print("    - student_study_groups (collaborative groups)")
    print("    - student_shoutouts (peer recognition)")
    print("    - student_teacher_qa (Q&A threads)")
    print()
    print("  Account:")
    print("    - student_consent_records (COPPA consent)")
    print("    - student_teacher_access (privacy controls)")
    print()
    print(f"  Students: {len(students)}")
    print(f"  Courses:  {len(courses)}")
    print()
    print("  Login at: http://localhost:3000")
    print("  API docs: http://localhost:8000/docs")
    print("=" * 75)

    # Cleanup
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
