"""
Seed preset avatar data and create sample UserAvatar records for demo users.

Usage:
    python seed_avatars.py
"""

import asyncio
import json
import logging
import os
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

# Load .env.development before importing app modules
from dotenv import load_dotenv
load_dotenv(".env.development")

from app.config import settings  # noqa: E402
from app.database import init_db  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.user_avatar import AvatarType, UserAvatar  # noqa: E402

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def seed_avatars():
    """Create sample avatar records for demo users."""
    await init_db()

    # Import session factory AFTER init_db has set it up
    from app.database import AsyncSessionLocal

    # Load preset config
    config_path = Path(settings.avatar_preset_config_path)
    if not config_path.is_absolute():
        config_path = Path(__file__).parent / config_path

    if not config_path.exists():
        logger.error("Preset config not found at %s", config_path)
        return

    with open(config_path) as f:
        presets = json.load(f).get("avatars", [])

    if not presets:
        logger.warning("No presets found in config file.")
        return

    logger.info("Loaded %d preset avatars from config.", len(presets))

    async with AsyncSessionLocal() as db:
        from sqlalchemy import select

        # Find demo student user
        stmt = select(User).where(User.email == "student@urbanhomeschool.co.ke")
        result = await db.execute(stmt)
        student = result.scalar_one_or_none()

        if not student:
            logger.warning("Demo student user not found. Run seed_users.py first.")
            return

        # Check if avatars already exist for this user
        existing = await db.execute(
            select(UserAvatar).where(UserAvatar.user_id == student.id)
        )
        if existing.scalars().first():
            logger.info("Avatars already seeded for demo student. Skipping.")
            return

        # Save first 3 presets for the demo student (one active)
        for i, preset in enumerate(presets[:3]):
            avatar = UserAvatar(
                user_id=student.id,
                name=preset["name"],
                avatar_type=AvatarType(
                    "preset_stylized" if preset["style"] == "stylized" else "preset_realistic"
                ),
                model_url=preset["model_url"],
                thumbnail_url=preset.get("thumbnail_url"),
                is_active=(i == 0),  # First one is active
                customization_data={"preset_id": preset["id"]},
            )
            db.add(avatar)
            logger.info(
                "  Created avatar: %s (%s)%s",
                preset["name"],
                preset["style"],
                " [ACTIVE]" if i == 0 else "",
            )

        await db.commit()
        logger.info("Avatar seeding complete for demo student.")


if __name__ == "__main__":
    asyncio.run(seed_avatars())
