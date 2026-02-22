"""Username generation service for child student accounts."""

import re
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User


async def generate_username(db: AsyncSession, first_name: str, last_name: str) -> str:
    """Generate a unique username from first + last name.
    Pattern: firstnamelastname, firstnamelastname1, firstnamelastname2, etc.
    """
    # Sanitize: lowercase, remove non-alphanumeric, limit length
    clean_first = re.sub(r'[^a-z0-9]', '', first_name.lower().strip())
    clean_last = re.sub(r'[^a-z0-9]', '', last_name.lower().strip())
    base = f"{clean_first}{clean_last}"[:40]

    if not base:
        base = "student"

    candidate = base
    counter = 1
    while True:
        result = await db.execute(select(User).where(User.username == candidate))
        if result.scalar_one_or_none() is None:
            return candidate
        candidate = f"{base}{counter}"
        counter += 1


async def suggest_usernames(db: AsyncSession, first_name: str, last_name: str, count: int = 5) -> list[str]:
    """Generate multiple unique username suggestions."""
    clean_first = re.sub(r'[^a-z0-9]', '', first_name.lower().strip())
    clean_last = re.sub(r'[^a-z0-9]', '', last_name.lower().strip())
    base = f"{clean_first}{clean_last}"[:40]

    if not base:
        base = "student"

    suggestions = []
    candidate = base
    counter = 1

    while len(suggestions) < count:
        result = await db.execute(select(User).where(User.username == candidate))
        if result.scalar_one_or_none() is None:
            suggestions.append(candidate)
        candidate = f"{base}{counter}"
        counter += 1

    return suggestions
