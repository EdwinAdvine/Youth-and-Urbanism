"""
Seed script for UHS hierarchical course categories.
Run: python seed_categories.py

Seeds 15 top-level categories matching the header mega menu, each with
child subcategories. Uses deterministic uuid5 IDs for idempotent seeding.
"""

import asyncio
import uuid
from datetime import datetime

from sqlalchemy import text
from app.database import Base, init_db
from app.models.category import Category

# Deterministic namespace for uuid5
NS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")


def _id(slug: str) -> uuid.UUID:
    """Generate a deterministic UUID from a slug."""
    return uuid.uuid5(NS, f"uhs-category-{slug}")


# ---------------------------------------------------------------------------
# Hierarchical category definitions
# ---------------------------------------------------------------------------

CATEGORIES = [
    {
        "name": "Pre Primary Education",
        "slug": "pre-primary",
        "description": "Early childhood education for PP1 and PP2 learners aged 4-6.",
        "icon": "baby",
        "order": 1,
        "children": [
            {"name": "PP1", "slug": "pp1", "description": "Pre-Primary 1 courses for learners aged 4-5."},
            {"name": "PP2", "slug": "pp2", "description": "Pre-Primary 2 courses for learners aged 5-6."},
        ],
    },
    {
        "name": "Primary Education",
        "slug": "primary",
        "description": "Lower and Upper Primary education for Grades 1-6.",
        "icon": "school",
        "order": 2,
        "children": [
            {"name": "Lower Primary (Grade 1-3)", "slug": "lower-primary", "description": "Courses for Grade 1, Grade 2 and Grade 3 learners."},
            {"name": "Upper Primary (Grade 4-6)", "slug": "upper-primary", "description": "Courses for Grade 4, Grade 5 and Grade 6 learners."},
        ],
    },
    {
        "name": "Junior Secondary",
        "slug": "junior-secondary",
        "description": "Junior Secondary education for Grades 7-9.",
        "icon": "building",
        "order": 3,
        "children": [
            {"name": "Grade 7", "slug": "grade-7", "description": "All Grade 7 Junior Secondary courses."},
            {"name": "Grade 8", "slug": "grade-8", "description": "All Grade 8 Junior Secondary courses."},
            {"name": "Grade 9", "slug": "grade-9", "description": "All Grade 9 Junior Secondary courses."},
        ],
    },
    {
        "name": "Senior Secondary",
        "slug": "senior-secondary",
        "description": "Senior Secondary education for Grades 10-12.",
        "icon": "graduation-cap",
        "order": 4,
        "children": [
            {"name": "Grade 10", "slug": "grade-10", "description": "All Grade 10 Senior Secondary courses."},
            {"name": "Grade 11", "slug": "grade-11", "description": "All Grade 11 Senior Secondary courses."},
            {"name": "Grade 12", "slug": "grade-12", "description": "All Grade 12 Senior Secondary courses."},
        ],
    },
    {
        "name": "Mathematics",
        "slug": "mathematics",
        "description": "Number work, algebra, geometry, statistics and mathematical reasoning across all grade levels.",
        "icon": "calculator",
        "order": 5,
        "children": [],
    },
    {
        "name": "Languages",
        "slug": "languages",
        "description": "English, Kiswahili, Arabic, French, German, Indigenous Language, Mandarin, Kenyan Sign Language.",
        "icon": "message-circle",
        "order": 6,
        "children": [
            {"name": "English", "slug": "english", "description": "English language and literature courses."},
            {"name": "Kiswahili", "slug": "kiswahili", "description": "Kiswahili language and literature courses."},
            {"name": "Arabic", "slug": "arabic", "description": "Arabic language courses."},
            {"name": "French", "slug": "french", "description": "French language courses."},
            {"name": "German", "slug": "german", "description": "German language courses."},
            {"name": "Indigenous Language", "slug": "indigenous-language", "description": "Indigenous language and cultural communication courses."},
            {"name": "Mandarin", "slug": "mandarin", "description": "Mandarin Chinese language courses."},
            {"name": "Kenyan Sign Language", "slug": "kenyan-sign-language", "description": "Kenyan Sign Language and deaf culture courses."},
        ],
    },
    {
        "name": "Religious Studies",
        "slug": "religious-studies",
        "description": "Christian Religious Education (CRE), Islamic Religious Education (IRE), Hindu Religious Education (HRE).",
        "icon": "book-open",
        "order": 7,
        "children": [
            {"name": "CRE", "slug": "cre", "description": "Christian Religious Education courses."},
            {"name": "HRE", "slug": "hre", "description": "Hindu Religious Education courses."},
            {"name": "IRE", "slug": "ire", "description": "Islamic Religious Education courses."},
        ],
    },
    {
        "name": "Science",
        "slug": "sciences",
        "description": "Environmental Activities, Science & Technology, Integrated Science, Pure Sciences and Applied Sciences.",
        "icon": "flask-conical",
        "order": 8,
        "children": [
            {"name": "Environmental Activities", "slug": "environmental-activities", "description": "Exploring the natural and social environment (PP1-Grade 3)."},
            {"name": "Science & Technology", "slug": "science-technology", "description": "Scientific inquiry and technology (Grades 4-6, Diploma)."},
            {"name": "Integrated Science", "slug": "integrated-science", "description": "Biology, chemistry and physics concepts (Grades 7-9)."},
            {"name": "Pure Sciences", "slug": "pure-sciences", "description": "Advanced Physics, Chemistry and Biology (Grades 10-12)."},
            {"name": "Applied Sciences", "slug": "applied-sciences", "description": "Applied sciences and technology (Grades 10-12)."},
        ],
    },
    {
        "name": "Social Studies & Humanities",
        "slug": "social-humanities",
        "description": "Social Studies, Humanities, Historical and Philosophical Foundations of Education.",
        "icon": "globe",
        "order": 9,
        "children": [
            {"name": "Social Studies", "slug": "social-studies", "description": "History, geography, citizenship and cultural studies."},
            {"name": "Humanities", "slug": "humanities", "description": "Senior Secondary humanities pathway."},
            {"name": "Historical & Comparative Foundations", "slug": "historical-foundations", "description": "History of education and global educational systems (Diploma)."},
            {"name": "Philosophical & Sociological Foundations", "slug": "philosophical-foundations", "description": "Philosophy and sociology of education (Diploma)."},
        ],
    },
    {
        "name": "Creative Arts & Activities",
        "slug": "creative-arts",
        "description": "Creative Activities, Creative Arts, Arts & Sports, Art & Craft, Music and Physical Education.",
        "icon": "palette",
        "order": 10,
        "children": [
            {"name": "Creative Activities", "slug": "creative-activities", "description": "Art, craft, music and creative expression (PP1-Grade 3)."},
            {"name": "Creative Arts", "slug": "creative-arts-subject", "description": "Visual arts, performing arts and design (Grades 4-9)."},
            {"name": "Arts & Sports", "slug": "arts-sports", "description": "Arts and Sports pathway (Grades 10-12)."},
            {"name": "Art & Craft", "slug": "art-craft", "description": "Visual arts and craft techniques (Diploma)."},
            {"name": "Music", "slug": "music", "description": "Music theory, performance and composition."},
            {"name": "Physical Education", "slug": "physical-education", "description": "Sports science, fitness and PE."},
        ],
    },
    {
        "name": "Agriculture & Home Science",
        "slug": "agriculture-home",
        "description": "Agriculture, Home Science and Hygiene & Nutrition Activities.",
        "icon": "sprout",
        "order": 11,
        "children": [
            {"name": "Agriculture", "slug": "agriculture", "description": "Farming, crop production, animal husbandry and sustainability."},
            {"name": "Home Science", "slug": "home-science", "description": "Home management, nutrition, textiles and consumer education."},
        ],
    },
    {
        "name": "Technical & Pre-Technical",
        "slug": "technical-studies",
        "description": "Pre-Technical Studies (Junior Secondary) and Technical Studies (Senior Secondary).",
        "icon": "wrench",
        "order": 12,
        "children": [
            {"name": "Pre-Technical Studies", "slug": "pre-technical-studies", "description": "Technical drawing, woodwork, metalwork and electricity (Grades 7-9)."},
            {"name": "Technical Studies", "slug": "technical-studies-subject", "description": "Engineering, construction, electronics and design (Grades 10-12)."},
        ],
    },
    {
        "name": "Diploma in Teachers Education",
        "slug": "diploma-education",
        "description": "Professional diplomas for teacher education including subject specialisations and pedagogy.",
        "icon": "graduation-cap",
        "order": 13,
        "children": [],
    },
    {
        "name": "Teachers Guide",
        "slug": "teachers-guide",
        "description": "Teaching resources, lesson plans and professional development guides for educators.",
        "icon": "book-marked",
        "order": 14,
        "children": [
            {"name": "Pre-Primary Guides", "slug": "teachers-guide-pre-primary", "description": "Teaching guides for PP1 and PP2."},
            {"name": "Lower Primary Guides", "slug": "teachers-guide-lower-primary", "description": "Teaching guides for Grades 1-3."},
            {"name": "Upper Primary Guides", "slug": "teachers-guide-upper-primary", "description": "Teaching guides for Grades 4-6."},
            {"name": "Junior Secondary Guides", "slug": "teachers-guide-junior-secondary", "description": "Teaching guides for Grades 7-9."},
            {"name": "Senior Secondary Guides", "slug": "teachers-guide-senior-secondary", "description": "Teaching guides for Grades 10-12."},
            {"name": "Diploma Guides", "slug": "teachers-guide-diploma", "description": "Teaching guides for Diploma level."},
        ],
    },
    {
        "name": "Revision (Q&A)",
        "slug": "revision",
        "description": "Revision courses, past papers, model answers and exam preparation for all levels.",
        "icon": "file-question",
        "order": 15,
        "children": [
            {"name": "Revision Courses", "slug": "revision-courses", "description": "Revision guides and textbooks for all grade levels."},
            {"name": "KPSEA (Grade 6)", "slug": "kpsea", "description": "Kenya Primary School Education Assessment preparation."},
            {"name": "KJSEA (Grade 9)", "slug": "kjsea", "description": "Kenya Junior Secondary Education Assessment preparation."},
            {"name": "KCSE (Grade 12)", "slug": "kcse", "description": "Kenya Certificate of Secondary Education preparation."},
        ],
    },
]


async def seed_categories():
    """Seed UHS hierarchical categories into the database."""
    await init_db()
    from app.database import engine, AsyncSessionLocal

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Always replace — delete existing categories first
        await session.execute(text("DELETE FROM categories"))
        await session.commit()
        print("Cleared existing categories.")

        total = 0
        now = datetime.utcnow()

        for cat_data in CATEGORIES:
            parent_slug = cat_data["slug"]
            parent_uuid = _id(parent_slug)

            # Create parent category
            parent = Category(
                id=parent_uuid,
                name=cat_data["name"],
                slug=parent_slug,
                description=cat_data["description"],
                icon=cat_data["icon"],
                display_order=cat_data["order"],
                parent_id=None,
                is_active=True,
                course_count=0,
                created_at=now,
                updated_at=now,
            )
            session.add(parent)
            total += 1

            # Create child categories
            for i, child in enumerate(cat_data.get("children", []), start=1):
                child_cat = Category(
                    id=_id(child["slug"]),
                    name=child["name"],
                    slug=child["slug"],
                    description=child["description"],
                    icon=cat_data["icon"],
                    display_order=i,
                    parent_id=parent_uuid,
                    is_active=True,
                    course_count=0,
                    created_at=now,
                    updated_at=now,
                )
                session.add(child_cat)
                total += 1

        await session.commit()

        # Print summary
        parent_count = len(CATEGORIES)
        child_count = sum(len(c.get("children", [])) for c in CATEGORIES)
        print(f"\nSeeded {total} categories ({parent_count} parents + {child_count} children)")

        print("\n" + "=" * 70)
        print("UHS Hierarchical Categories:")
        print("=" * 70)
        for cat in CATEGORIES:
            children = cat.get("children", [])
            child_info = f" ({len(children)} children)" if children else ""
            print(f"  {cat['order']:2d}. {cat['name']:<45}{child_info}")
            for child in children:
                print(f"      └─ {child['name']}")
        print("=" * 70)


if __name__ == "__main__":
    asyncio.run(seed_categories())
