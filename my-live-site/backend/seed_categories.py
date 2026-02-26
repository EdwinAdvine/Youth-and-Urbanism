"""
Seed script for CBC-aligned course categories.
Run: python seed_categories.py
"""

import asyncio
import uuid
from datetime import datetime

from sqlalchemy import text
from app.database import Base, init_db
from app.models.category import Category


CBC_CATEGORIES = [
    {"name": "Core Competencies", "slug": "core-competencies", "description": "Critical thinking, creativity, communication, collaboration, and digital literacy.", "icon": "brain", "display_order": 1},
    {"name": "Core Values", "slug": "core-values", "description": "Love, responsibility, respect, unity, peace, patriotism, and social justice.", "icon": "heart", "display_order": 2},
    {"name": "Languages", "slug": "languages", "description": "English, Kiswahili, and indigenous languages literacy and communication.", "icon": "message-circle", "display_order": 3},
    {"name": "Mathematics", "slug": "mathematics", "description": "Numeracy, algebra, geometry, statistics, and mathematical reasoning.", "icon": "calculator", "display_order": 4},
    {"name": "Science and Technology", "slug": "science-technology", "description": "Scientific inquiry, technology, engineering, environmental education.", "icon": "flask-conical", "display_order": 5},
    {"name": "Social Studies", "slug": "social-studies", "description": "History, geography, citizenship, governance, and cultural studies.", "icon": "globe", "display_order": 6},
    {"name": "Religious Education", "slug": "religious-education", "description": "Christian Religious Education (CRE), Islamic Religious Education (IRE), Hindu Religious Education (HRE).", "icon": "book-open", "display_order": 7},
    {"name": "Creative Arts", "slug": "creative-arts", "description": "Visual arts, performing arts, music, drama, and creative expression.", "icon": "palette", "display_order": 8},
    {"name": "Physical and Health Education", "slug": "physical-health", "description": "Physical fitness, sports, health education, and wellbeing.", "icon": "activity", "display_order": 9},
    {"name": "Agriculture and Nutrition", "slug": "agriculture-nutrition", "description": "Farming, food production, nutrition science, and sustainable agriculture.", "icon": "sprout", "display_order": 10},
    {"name": "Home Science", "slug": "home-science", "description": "Home management, textiles, food preparation, and consumer education.", "icon": "home", "display_order": 11},
    {"name": "Pre-Technical and Pre-Career Education", "slug": "pre-technical-career", "description": "Technical drawing, woodwork, metalwork, electricity, and career guidance.", "icon": "wrench", "display_order": 12},
]


async def seed_categories():
    """Seed CBC categories into the database."""
    await init_db()
    from app.database import engine, AsyncSessionLocal

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if categories already exist
        result = await session.execute(text("SELECT COUNT(*) FROM categories"))
        count = result.scalar()

        if count and count > 0:
            print(f"Categories table already has {count} records. Skipping seed.")
            return

        for cat_data in CBC_CATEGORIES:
            category = Category(
                id=uuid.uuid4(),
                name=cat_data["name"],
                slug=cat_data["slug"],
                description=cat_data["description"],
                icon=cat_data["icon"],
                display_order=cat_data["display_order"],
                is_active=True,
                course_count=0,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            session.add(category)

        await session.commit()
        print(f"Seeded {len(CBC_CATEGORIES)} CBC categories successfully!")

        # Print summary
        print("\n" + "=" * 60)
        print("CBC Categories Seeded:")
        print("=" * 60)
        for cat in CBC_CATEGORIES:
            print(f"  {cat['display_order']:2d}. {cat['name']:<45} /{cat['slug']}")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed_categories())
