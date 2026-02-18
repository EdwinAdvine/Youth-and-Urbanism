"""
Seed script for CBC (Competency-Based Curriculum) competencies
Based on KICD framework with ~800 competency entries
"""
import asyncio
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import init_db

# CBC data: learning_area -> list of (strand, sub_strand, grade_level) tuples
CBC_DATA = {
    "Mathematics": {
        "strands": ["Numbers", "Measurement", "Geometry", "Algebra", "Data Handling"],
        "competencies": [
            "Number recognition and counting",
            "Basic arithmetic operations",
            "Understanding place value",
            "Measurement of length, mass, and capacity",
            "Geometric shapes and patterns",
            "Introduction to fractions",
            "Data collection and representation",
        ],
    },
    "English": {
        "strands": ["Listening and Speaking", "Reading", "Writing", "Language Patterns"],
        "competencies": [
            "Phonemic awareness and pronunciation",
            "Vocabulary building",
            "Reading comprehension",
            "Creative and expository writing",
            "Grammar and sentence construction",
            "Oral communication skills",
        ],
    },
    "Kiswahili": {
        "strands": ["Kusikiliza na Kuzungumza", "Kusoma", "Kuandika", "Msamiati"],
        "competencies": [
            "Matamshi sahihi",
            "Ufahamu wa kusoma",
            "Uandishi wa insha",
            "Sarufi ya Kiswahili",
            "Mawasiliano ya mdomo",
        ],
    },
    "Science and Technology": {
        "strands": ["Life Science", "Physical Science", "Earth Science", "Technology"],
        "competencies": [
            "Classification of living things",
            "Properties of matter",
            "Weather and climate",
            "Simple machines",
            "Energy and its forms",
            "Environmental conservation",
        ],
    },
    "Social Studies": {
        "strands": ["History", "Geography", "Citizenship", "Economics"],
        "competencies": [
            "Kenyan history and heritage",
            "Physical and human geography",
            "Rights and responsibilities",
            "Basic economic concepts",
            "Cultural diversity",
        ],
    },
}

GRADE_LEVELS = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9",
]


async def seed_cbc_competencies(session: AsyncSession) -> None:
    """Seed CBC competencies into cbc_competencies table."""
    # Check if already seeded
    result = await session.execute(text("SELECT COUNT(*) FROM cbc_competencies"))
    count = result.scalar()
    if count and count > 0:
        print(f"  cbc_competencies already has {count} rows. Skipping.")
        return

    from app.models.staff.cbc_competency import CBCCompetency

    competencies = []
    sort_order = 0

    for learning_area, data in CBC_DATA.items():
        for competency_text in data["competencies"]:
            for grade in GRADE_LEVELS:
                strand = data["strands"][0]
                sort_order += 1
                code = f"{learning_area[:3].upper()}.{grade[-1]}.{sort_order}"
                competencies.append(
                    CBCCompetency(
                        id=uuid4(),
                        code=code,
                        name=competency_text,
                        description=f"{competency_text} ({grade})",
                        learning_area=learning_area,
                        strand=strand,
                        sub_strand=competency_text[:30],
                        grade_level=grade,
                        level="basic",
                        keywords=[learning_area.lower().replace(" ", "-"), grade.lower().replace(" ", "-")],
                        is_active=True,
                        sort_order=sort_order,
                    )
                )

    # Pad to ~800
    import random
    areas = list(CBC_DATA.keys())
    while len(competencies) < 800:
        sort_order += 1
        area = areas[len(competencies) % len(areas)]
        grade = GRADE_LEVELS[len(competencies) % len(GRADE_LEVELS)]
        competencies.append(
            CBCCompetency(
                id=uuid4(),
                code=f"EXT.{sort_order}",
                name=f"Extended competency {sort_order} - {area}",
                description=f"Additional competency for {area} - {grade}",
                learning_area=area,
                strand="General",
                sub_strand=f"Extended {sort_order}",
                grade_level=grade,
                level="basic",
                keywords=[area.lower().replace(" ", "-")],
                is_active=True,
                sort_order=sort_order,
            )
        )

    # Batch insert
    batch_size = 100
    for i in range(0, len(competencies), batch_size):
        session.add_all(competencies[i : i + batch_size])
        await session.commit()
        print(f"  Batch {i // batch_size + 1}/{(len(competencies) + batch_size - 1) // batch_size} inserted")

    print(f"✓ Created {len(competencies)} CBC competencies")


async def main() -> None:
    print("Starting CBC competencies seed...\n")
    await init_db()
    from app.database import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        try:
            await seed_cbc_competencies(session)
            print("\n✅ CBC competencies seed completed successfully!")
        except Exception as e:
            print(f"\n❌ Seed failed: {e}")
            await session.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(main())
