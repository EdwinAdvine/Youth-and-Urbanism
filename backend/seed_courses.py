"""
UHS Complete Course Catalogue Seed Script.

Seeds the full Urban Home School course catalogue following the structure in
UHS Course Categories.md, covering:

  Pre-Primary  : PP1, PP2  (student courses FREE, guides/revision KES 1,000)
  Lower Primary: Grades 1–3
  Upper Primary: Grades 4–6
  Junior Sec.  : Grades 7–9
  Senior Sec.  : Grades 10–12
  Teachers Ed. : Teacher's Guide + Diploma

Each subject at each applicable level generates 3 courses:
  1. Student course          – grade_levels: ["Grade N"], audience: students
  2. Teacher's Guide         – grade_levels: ["Teacher's Guide"], audience: teachers
  3. Revision Guide/Textbook – grade_levels: ["Grade N"], audience: students

Usage:
    cd backend/
    python seed_courses.py
"""

from __future__ import annotations

import asyncio
import sys
import os
import uuid
from collections import Counter
from datetime import datetime
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv(".env.development")

from sqlalchemy import text
from app.database import Base, init_db
from app.models.course import Course
from app.utils.course_code import generate_course_code

FREE = Decimal("0.00")
PAID = Decimal("1000.00")

# ---------------------------------------------------------------------------
# Helper builders
# ---------------------------------------------------------------------------

def _course(title: str, description: str, learning_area: str,
            grade_levels: list[str], price: Decimal = PAID,
            featured: bool = False, course_code: str | None = None) -> dict:
    return {
        "title": title,
        "description": description,
        "learning_area": learning_area,
        "grade_levels": grade_levels,
        "price": price,
        "is_featured": featured,
        "course_code": course_code,
    }


def _tguide(title: str, area: str, label: str) -> dict:
    code = generate_course_code(area, label, suffix="TG")
    return _course(f"UHS {title} Teachers Guide {label}",
                   f"Lesson plans and teaching resources for {title} at {label}.",
                   area, ["Teacher's Guide"], PAID, course_code=code)


def trio(subject: str, desc: str, area: str, grade_levels: list[str],
         price: Decimal = PAID, featured: bool = False) -> list[dict]:
    """Student course + Teacher's Guide + Revision Textbook for a grade level."""
    label = grade_levels[0]
    is_pp = label in ("PP1", "PP2")
    revision_word = "Revision Guide" if is_pp else "Revision Textbook"
    code = generate_course_code(area, label)
    rev_code = generate_course_code(area, label, suffix="REV")
    return [
        _course(f"UHS {subject} {label}", desc, area, grade_levels, price, featured, course_code=code),
        _tguide(subject, area, label),
        _course(f"UHS {subject} {revision_word} {label}",
                f"Comprehensive revision material for {subject} at {label}.",
                area, grade_levels, PAID, course_code=rev_code),
    ]


def diploma_trio(subject: str, desc: str, area: str) -> list[dict]:
    """Student diploma + Teacher's Guide + Revision Textbook for Diploma level."""
    code = generate_course_code(area, "Diploma")
    tg_code = generate_course_code(area, "Diploma", suffix="TG")
    rev_code = generate_course_code(area, "Diploma", suffix="REV")
    return [
        _course(f"UHS {subject} Diploma", desc, area, ["Diploma"], PAID,
                course_code=code),
        _course(f"UHS {subject} Teachers Guide Diploma",
                f"Teaching resources for {subject} Diploma.",
                area, ["Diploma"], PAID, course_code=tg_code),
        _course(f"UHS {subject} Revision Textbook Diploma",
                f"Revision material for {subject} Diploma.",
                area, ["Diploma"], PAID, course_code=rev_code),
    ]


# ===========================================================================
# Course catalogue list
# ===========================================================================
COURSES: list[dict] = []


# ---------------------------------------------------------------------------
# PRE-PRIMARY — PP1 & PP2  (student courses FREE)
# ---------------------------------------------------------------------------

for level in ["PP1", "PP2"]:
    gl = [level]
    featured_pp = level == "PP1"

    COURSES += trio("Language Activities (English)",
                    f"Early English language activities through play and storytelling for {level}.",
                    "Language Activities (English)", gl, FREE, featured_pp)

    COURSES += trio("Language Activities (Kiswahili)",
                    f"Early Kiswahili language activities through songs and games for {level}.",
                    "Language Activities (Kiswahili)", gl, FREE)

    COURSES += trio("Mathematical Activities",
                    f"Number recognition, counting, sorting and early mathematical concepts for {level}.",
                    "Mathematical Activities", gl, FREE)

    COURSES += trio("Environmental Activities",
                    f"Exploring the natural and social environment through observation for {level}.",
                    "Environmental Activities", gl, FREE)

    COURSES += trio("Hygiene and Nutrition Activities",
                    f"Personal hygiene, nutrition awareness and healthy habits for {level}.",
                    "Hygiene and Nutrition Activities", gl, FREE)

    COURSES += trio("Creative Activities",
                    f"Drawing, painting, music, movement and creative expression for {level}.",
                    "Creative Activities", gl, FREE)

    COURSES += trio("Psychomotor and Creative Activities",
                    f"Motor skill development, coordination, movement and creative play for {level}.",
                    "Psychomotor and Creative Activities", gl, FREE)


# ---------------------------------------------------------------------------
# LOWER PRIMARY — Grades 1–3
# ---------------------------------------------------------------------------

for n in [1, 2, 3]:
    grade = f"Grade {n}"
    gl = [grade]

    COURSES += trio("Mathematics",
                    f"Number sense, operations, measurement and geometry for {grade}.",
                    "Mathematics", gl)
    COURSES += trio("English Activities",
                    f"English literacy, reading, writing and communication activities for {grade}.",
                    "English Activities", gl)
    COURSES += trio("Kiswahili",
                    f"Kiswahili language skills — reading, writing and oral communication for {grade}.",
                    "Kiswahili", gl)
    COURSES += trio("CRE",
                    f"Christian Religious Education — values, stories and moral development for {grade}.",
                    "CRE", gl)
    COURSES += trio("HRE",
                    f"Hindu Religious Education — values, traditions and moral development for {grade}.",
                    "HRE", gl)
    COURSES += trio("IRE",
                    f"Islamic Religious Education — values, Quranic stories and moral development for {grade}.",
                    "IRE", gl)
    COURSES += trio("Environmental Activities",
                    f"Exploring living things, the environment and community for {grade}.",
                    "Environmental Activities", gl)
    COURSES += trio("Creative Activities",
                    f"Art, craft, music and creative expression for {grade}.",
                    "Creative Activities", gl)


# ---------------------------------------------------------------------------
# UPPER PRIMARY — Grades 4–6
# ---------------------------------------------------------------------------

for n in [4, 5, 6]:
    grade = f"Grade {n}"
    gl = [grade]

    COURSES += trio("Mathematics",
                    f"Number, algebra, measurement, geometry and data handling for {grade}.",
                    "Mathematics", gl)
    COURSES += trio("English",
                    f"English reading, writing, grammar, oral and literature skills for {grade}.",
                    "English", gl)
    COURSES += trio("Kiswahili",
                    f"Kiswahili reading, writing, grammar and oral communication for {grade}.",
                    "Kiswahili", gl)
    COURSES += trio("Arabic",
                    f"Arabic language reading, writing and oral communication for {grade}.",
                    "Arabic", gl)
    COURSES += trio("French",
                    f"French language reading, writing and oral communication for {grade}.",
                    "French", gl)
    COURSES += trio("German",
                    f"German language reading, writing and oral communication for {grade}.",
                    "German", gl)
    COURSES += trio("Indigenous Language",
                    f"Indigenous language literacy and cultural communication for {grade}.",
                    "Indigenous Language", gl)
    COURSES += trio("Mandarin",
                    f"Mandarin Chinese reading, writing and oral communication for {grade}.",
                    "Mandarin", gl)
    COURSES += trio("CRE",
                    f"Christian Religious Education — faith, values and community for {grade}.",
                    "CRE", gl)
    COURSES += trio("HRE",
                    f"Hindu Religious Education — dharma, values and traditions for {grade}.",
                    "HRE", gl)
    COURSES += trio("IRE",
                    f"Islamic Religious Education — faith, values and Islamic practices for {grade}.",
                    "IRE", gl)
    COURSES += trio("Science & Technology",
                    f"Scientific inquiry, technology, environment and engineering concepts for {grade}.",
                    "Science & Technology", gl)
    COURSES += trio("Social Studies",
                    f"History, geography, citizenship and cultural studies for {grade}.",
                    "Social Studies", gl)
    COURSES += trio("Creative Arts",
                    f"Visual arts, music, drama and creative expression for {grade}.",
                    "Creative Arts", gl)
    COURSES += trio("Agriculture",
                    f"Farming practices, crop production, animal husbandry and sustainability for {grade}.",
                    "Agriculture", gl)


# ---------------------------------------------------------------------------
# JUNIOR SECONDARY — Grades 7–9
# ---------------------------------------------------------------------------

for n in [7, 8, 9]:
    grade = f"Grade {n}"
    gl = [grade]

    COURSES += trio("Mathematics",
                    f"Advanced number, algebra, statistics, geometry and problem solving for {grade}.",
                    "Mathematics", gl)
    COURSES += trio("English",
                    f"Advanced English comprehension, composition, literature and communication for {grade}.",
                    "English", gl)
    COURSES += trio("Kiswahili",
                    f"Advanced Kiswahili grammar, composition and literature for {grade}.",
                    "Kiswahili", gl)
    COURSES += trio("Arabic",
                    f"Intermediate Arabic language skills and Islamic literature for {grade}.",
                    "Arabic", gl)
    COURSES += trio("French",
                    f"Intermediate French language skills and Francophone culture for {grade}.",
                    "French", gl)
    COURSES += trio("German",
                    f"Intermediate German language skills and culture for {grade}.",
                    "German", gl)
    COURSES += trio("Indigenous Language",
                    f"Advanced indigenous language literacy and cultural heritage for {grade}.",
                    "Indigenous Language", gl)
    COURSES += trio("Mandarin",
                    f"Intermediate Mandarin Chinese language and culture for {grade}.",
                    "Mandarin", gl)
    COURSES += trio("CRE",
                    f"Christian Religious Education — ethics, scripture and community service for {grade}.",
                    "CRE", gl)
    COURSES += trio("HRE",
                    f"Hindu Religious Education — philosophy, ethics and sacred texts for {grade}.",
                    "HRE", gl)
    COURSES += trio("IRE",
                    f"Islamic Religious Education — Fiqh, Hadith, ethics and community for {grade}.",
                    "IRE", gl)
    COURSES += trio("Integrated Science",
                    f"Biology, chemistry and physics concepts with inquiry-based learning for {grade}.",
                    "Integrated Science", gl)
    COURSES += trio("Social Studies",
                    f"Kenya and global history, geography, economics and civics for {grade}.",
                    "Social Studies", gl)
    COURSES += trio("Creative Arts",
                    f"Advanced visual arts, performing arts, music and design for {grade}.",
                    "Creative Arts", gl)
    COURSES += trio("Agriculture",
                    f"Advanced farming, agribusiness, soil science and food production for {grade}.",
                    "Agriculture", gl)
    COURSES += trio("Pre-Technical Studies",
                    f"Technical drawing, woodwork, metalwork, electricity and career pathways for {grade}.",
                    "Pre-Technical Studies", gl)


# ---------------------------------------------------------------------------
# SENIOR SECONDARY — Grades 10–12
# Individual subjects aligned with CBC Reference Guide.
# ---------------------------------------------------------------------------

for n in [10, 11, 12]:
    grade = f"Grade {n}"
    gl = [grade]

    # Core subjects (offered across all tracks)
    COURSES += trio("English",
                    f"Advanced English language, grammar, composition, comprehension and literature for {grade}.",
                    "English", gl)
    COURSES += trio("Kiswahili",
                    f"Advanced Kiswahili language, fasihi, insha and isimu for {grade}.",
                    "Kiswahili", gl)
    COURSES += trio("Mathematics",
                    f"Core/Essential Mathematics — algebra, calculus, statistics and geometry for {grade}.",
                    "Mathematics", gl)
    COURSES += trio("Physical Education",
                    f"Physical fitness, sports science, health education and athletics for {grade}.",
                    "Physical Education", gl)
    COURSES += trio("Community Service Learning",
                    f"Community engagement, service projects, leadership and civic responsibility for {grade}.",
                    "Community Service Learning", gl)

    # STEM track
    COURSES += trio("Physics",
                    f"Mechanics, waves, electricity, magnetism, heat and modern physics for {grade}.",
                    "Physics", gl)
    COURSES += trio("Biology",
                    f"Cell biology, genetics, ecology, human physiology and evolution for {grade}.",
                    "Biology", gl)
    COURSES += trio("Chemistry",
                    f"Atomic structure, bonding, reactions, organic chemistry and analysis for {grade}.",
                    "Chemistry", gl)
    COURSES += trio("Computer Studies",
                    f"Programming, data structures, networking and computer systems for {grade}.",
                    "Computer Studies", gl)
    COURSES += trio("Electricity",
                    f"Electrical circuits, power systems, electronics and wiring for {grade}.",
                    "Electricity", gl)

    # Social Sciences / Humanities track
    COURSES += trio("Geography",
                    f"Physical and human geography, climate, population and urbanisation for {grade}.",
                    "Geography", gl)
    COURSES += trio("History and Citizenship",
                    f"Kenya and world history, governance, democracy and citizenship for {grade}.",
                    "History and Citizenship", gl)
    COURSES += trio("Business Studies",
                    f"Business concepts, accounting, marketing, entrepreneurship and finance for {grade}.",
                    "Business Studies", gl)
    COURSES += trio("Literature in English",
                    f"Prose, poetry, drama, literary criticism and creative writing for {grade}.",
                    "Literature in English", gl)

    # Technical / Practical track
    COURSES += trio("Building Construction",
                    f"Masonry, carpentry, plumbing, construction technology and safety for {grade}.",
                    "Building Construction", gl)
    COURSES += trio("Power Mechanics",
                    f"Engines, automotive systems, power transmission and maintenance for {grade}.",
                    "Power Mechanics", gl)
    COURSES += trio("Metalwork",
                    f"Metal fabrication, welding, machining and sheet metal work for {grade}.",
                    "Metalwork", gl)
    COURSES += trio("Woodwork",
                    f"Wood joinery, furniture making, wood finishing and workshop practice for {grade}.",
                    "Woodwork", gl)
    COURSES += trio("Aviation",
                    f"Principles of flight, aircraft systems, navigation and aviation safety for {grade}.",
                    "Aviation", gl)
    COURSES += trio("Media Technology",
                    f"Media production, journalism, broadcasting, digital media and film for {grade}.",
                    "Media Technology", gl)
    COURSES += trio("Marine & Fisheries Technology",
                    f"Marine biology, fisheries management, aquaculture and ocean conservation for {grade}.",
                    "Marine & Fisheries Technology", gl)

    # Creative / Design track
    COURSES += trio("Fine Arts",
                    f"Drawing, painting, sculpture, printmaking and art history for {grade}.",
                    "Fine Arts", gl)
    COURSES += trio("Music & Dance",
                    f"Music theory, performance, dance, composition and world music for {grade}.",
                    "Music & Dance", gl)
    COURSES += trio("Theatre & Film",
                    f"Acting, directing, scriptwriting, film production and stagecraft for {grade}.",
                    "Theatre & Film", gl)

    # Languages (already have codes)
    COURSES += trio("Arabic",
                    f"Advanced Arabic language, literature and Islamic civilisation for {grade}.",
                    "Arabic", gl)
    COURSES += trio("French",
                    f"Advanced French language, literature and Francophone culture for {grade}.",
                    "French", gl)
    COURSES += trio("German",
                    f"Advanced German language, literature and culture for {grade}.",
                    "German", gl)
    COURSES += trio("Mandarin",
                    f"Advanced Mandarin Chinese language, calligraphy and culture for {grade}.",
                    "Mandarin", gl)
    COURSES += trio("Indigenous Language",
                    f"Advanced indigenous language, oral literature and cultural heritage for {grade}.",
                    "Indigenous Language", gl)

    # Religious Education
    COURSES += trio("CRE",
                    f"Christian ethics, theology, Biblical studies and contemporary issues for {grade}.",
                    "CRE", gl)
    COURSES += trio("HRE",
                    f"Hindu philosophy, Vedic texts, dharma, yoga and cultural traditions for {grade}.",
                    "HRE", gl)
    COURSES += trio("IRE",
                    f"Islamic jurisprudence, Quran, Hadith, Fiqh and contemporary issues for {grade}.",
                    "IRE", gl)

    # Applied subjects
    COURSES += trio("Agriculture",
                    f"Crop production, animal husbandry, agribusiness and soil science for {grade}.",
                    "Agriculture", gl)
    COURSES += trio("Home Science",
                    f"Nutrition, textiles, consumer education and home management for {grade}.",
                    "Home Science", gl)
    COURSES += trio("General Science",
                    f"Interdisciplinary science — biology, chemistry, physics and earth science for {grade}.",
                    "General Science", gl)
    COURSES += trio("ICT",
                    f"Information and communication technology, digital literacy and computing for {grade}.",
                    "ICT", gl)


# ---------------------------------------------------------------------------
# TEACHERS EDUCATION — Subject Diplomas
# ---------------------------------------------------------------------------

COURSES += diploma_trio("Mathematics",
    "Mathematics pedagogy, curriculum design and assessment at Diploma level.",
    "Mathematics")

COURSES += diploma_trio("English",
    "English language and literature teaching methodology at Diploma level.",
    "English")

COURSES += diploma_trio("Kiswahili",
    "Kiswahili language and literature teaching methodology at Diploma level.",
    "Kiswahili")

COURSES += diploma_trio("Arabic Language",
    "Arabic language teaching methodology and curriculum at Diploma level.",
    "Arabic")

COURSES += diploma_trio("French",
    "French language teaching methodology and Francophone culture at Diploma level.",
    "French")

COURSES += diploma_trio("German",
    "German language teaching methodology and culture at Diploma level.",
    "German")

COURSES += diploma_trio("Indigenous Language",
    "Indigenous language teaching, preservation and cultural integration at Diploma level.",
    "Indigenous Language")

COURSES += diploma_trio("Mandarin",
    "Mandarin Chinese language teaching methodology and culture at Diploma level.",
    "Mandarin")

COURSES += diploma_trio("Kenyan Sign Language",
    "Kenyan Sign Language instruction, deaf culture and inclusive communication at Diploma level.",
    "Kenyan Sign Language")

COURSES += diploma_trio("Science & Technology",
    "Science and Technology curriculum, pedagogy and laboratory management at Diploma level.",
    "Science & Technology")

COURSES += diploma_trio("Social Studies",
    "Social Studies curriculum design, geography, history and civic education at Diploma level.",
    "Social Studies")

COURSES += diploma_trio("Christian Religious Education",
    "CRE curriculum, theology, ethics and community engagement at Diploma level.",
    "Christian Religious Education")

COURSES += diploma_trio("Hindu Religious Education",
    "HRE curriculum, Hindu philosophy, ethics and traditions at Diploma level.",
    "Hindu Religious Education")

COURSES += diploma_trio("Islamic Religious Education",
    "IRE curriculum, Quran, Hadith, Fiqh and Islamic ethics at Diploma level.",
    "Islamic Religious Education")

COURSES += diploma_trio("Art & Craft",
    "Visual arts, craft techniques, design and arts education pedagogy at Diploma level.",
    "Art & Craft")

COURSES += diploma_trio("Music",
    "Music theory, performance, composition and music education at Diploma level.",
    "Music")

COURSES += diploma_trio("Physical Education",
    "Sports science, physical fitness, health education and PE pedagogy at Diploma level.",
    "Physical Education")

COURSES += diploma_trio("Agriculture",
    "Agronomy, soil science, agribusiness and agriculture curriculum at Diploma level.",
    "Agriculture")

COURSES += diploma_trio("Home Science",
    "Home management, nutrition, textiles and consumer education at Diploma level.",
    "Home Science")

COURSES += diploma_trio("Historical and Comparative Foundations of Education",
    "History of education, global educational systems and policy at Diploma level.",
    "Historical and Comparative Foundations of Education")

COURSES += diploma_trio("Philosophical and Sociological Foundations of Education",
    "Philosophy and sociology of education, ethics and social justice at Diploma level.",
    "Philosophical and Sociological Foundations of Education")

# ---------------------------------------------------------------------------
# TEACHERS EDUCATION — Professional Skills Diplomas
# ---------------------------------------------------------------------------

COURSES += diploma_trio("Child Development & Psychology",
    "Child growth, developmental psychology, learning theories and special needs at Diploma level.",
    "Child Development & Psychology")

COURSES += diploma_trio("Curriculum Studies",
    "Curriculum design, development, implementation and evaluation at Diploma level.",
    "Curriculum Studies")

COURSES += diploma_trio("Education Assessment",
    "Assessment strategies, examination design, moderation and reporting at Diploma level.",
    "Education Assessment")

COURSES += diploma_trio("Educational Resources",
    "Development and management of teaching and learning materials at Diploma level.",
    "Educational Resources")

COURSES += diploma_trio("ICT Integration in Education",
    "Digital tools, e-learning platforms and technology-enhanced teaching at Diploma level.",
    "ICT Integration in Education")

COURSES += diploma_trio("Inclusive Education",
    "Special needs education, differentiated instruction and inclusive classroom management at Diploma level.",
    "Inclusive Education")

COURSES += diploma_trio("Leadership and Management",
    "School leadership, administration, financial management and community relations at Diploma level.",
    "Leadership and Management")

COURSES += diploma_trio("Microteaching",
    "Supervised teaching practice, lesson planning, reflective practice and classroom skills at Diploma level.",
    "Microteaching")

COURSES += diploma_trio("Research Skills",
    "Educational research methodology, data analysis and report writing at Diploma level.",
    "Research Skills")


# ---------------------------------------------------------------------------
# EXAM-PREP — KPSEA (Grade 6), KJSEA (Grade 9), KCSE (Grade 12)
# ---------------------------------------------------------------------------

# KPSEA Exam Prep (Grade 6 — all Upper Primary subjects)
for subject, area in [
    ("Mathematics", "Mathematics"),
    ("English", "English"),
    ("Kiswahili", "Kiswahili"),
    ("Science & Technology", "Science & Technology"),
    ("Social Studies", "Social Studies"),
    ("CRE", "CRE"),
    ("Agriculture", "Agriculture"),
    ("Creative Arts", "Creative Arts"),
]:
    COURSES.append(_course(
        f"UHS KPSEA {subject} Revision",
        f"Comprehensive KPSEA exam preparation for {subject}. Past papers, model answers, and exam techniques.",
        area, ["Grade 6"], PAID, featured=True,
        course_code=generate_course_code(area, "Grade 6", suffix="KPSEA"),
    ))

# KJSEA Exam Prep (Grade 9 — all Junior Secondary subjects)
for subject, area in [
    ("Mathematics", "Mathematics"),
    ("English", "English"),
    ("Kiswahili", "Kiswahili"),
    ("Integrated Science", "Integrated Science"),
    ("Social Studies", "Social Studies"),
    ("CRE", "CRE"),
    ("Agriculture", "Agriculture"),
    ("Creative Arts", "Creative Arts"),
    ("Pre-Technical Studies", "Pre-Technical Studies"),
]:
    COURSES.append(_course(
        f"UHS KJSEA {subject} Revision",
        f"Comprehensive KJSEA exam preparation for {subject}. Past papers, model answers, and exam techniques.",
        area, ["Grade 9"], PAID, featured=True,
        course_code=generate_course_code(area, "Grade 9", suffix="KJSEA"),
    ))

# KCSE Exam Prep (Grade 12 — individual Senior Secondary subjects)
for subject, area in [
    ("English", "English"),
    ("Kiswahili", "Kiswahili"),
    ("Mathematics", "Mathematics"),
    ("Physics", "Physics"),
    ("Biology", "Biology"),
    ("Chemistry", "Chemistry"),
    ("Geography", "Geography"),
    ("History and Citizenship", "History and Citizenship"),
    ("Business Studies", "Business Studies"),
    ("CRE", "CRE"),
    ("Agriculture", "Agriculture"),
    ("Computer Studies", "Computer Studies"),
    ("Home Science", "Home Science"),
]:
    COURSES.append(_course(
        f"UHS KCSE {subject} Revision",
        f"Comprehensive KCSE exam preparation for {subject}. Past papers, model answers, and exam techniques.",
        area, ["Grade 12"], PAID, featured=True,
        course_code=generate_course_code(area, "Grade 12", suffix="KCSE"),
    ))


# ===========================================================================
# Seed function
# ===========================================================================

async def seed_courses() -> None:
    """Seed the full UHS course catalogue into the database."""
    await init_db()
    from app.database import engine, AsyncSessionLocal

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        inserted = 0
        skipped = 0
        updated_codes = 0

        for data in COURSES:
            # Check if a course with this exact title already exists
            existing = await session.execute(
                text("SELECT id, course_code FROM courses WHERE title = :title LIMIT 1"),
                {"title": data["title"]},
            )
            row = existing.fetchone()
            if row:
                # Backfill course_code on existing courses that don't have one yet
                if data.get("course_code") and not row.course_code:
                    await session.execute(
                        text("UPDATE courses SET course_code = :code WHERE id = :id"),
                        {"code": data["course_code"], "id": row.id},
                    )
                    updated_codes += 1
                skipped += 1
                continue

            course = Course(
                id=uuid.uuid4(),
                title=data["title"],
                description=data["description"],
                learning_area=data["learning_area"],
                grade_levels=data["grade_levels"],
                price=data["price"],
                currency="KES",
                is_featured=data["is_featured"],
                is_published=True,
                is_platform_created=True,
                course_code=data.get("course_code"),
                enrollment_count=0,
                average_rating=Decimal("0.0"),
                total_reviews=0,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            session.add(course)
            inserted += 1

        await session.commit()

    print(f"\n{'=' * 65}")
    print("UHS Course Catalogue Seed Complete")
    print(f"{'=' * 65}")
    print(f"  Total defined    : {len(COURSES):>5}")
    print(f"  Inserted         : {inserted:>5}")
    print(f"  Skipped (dup)    : {skipped:>5}")
    print(f"  Codes backfilled : {updated_codes:>5}")
    print(f"{'=' * 65}")

    # Summary by learning area
    area_counts: Counter = Counter(c["learning_area"] for c in COURSES)
    print("\nCourses per Learning Area:")
    for area, count in sorted(area_counts.items()):
        print(f"  {area:<60} {count:>3}")


if __name__ == "__main__":
    asyncio.run(seed_courses())
