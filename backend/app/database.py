"""
Database connection and session management.

This module provides SQLAlchemy 2.0 async engine configuration,
session management, and database utilities for the application.
"""

from typing import AsyncGenerator
import logging

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    AsyncEngine,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.pool import NullPool
from sqlalchemy import text

from app.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Create declarative base for models
Base = declarative_base()

# Initialize engine as None (will be created in init_db)
engine: AsyncEngine = None  # type: ignore
AsyncSessionLocal: async_sessionmaker[AsyncSession] = None  # type: ignore


def get_database_url() -> str:
    """
    Get the database URL with proper async driver.

    Converts postgresql:// to postgresql+asyncpg:// for async support.

    Returns:
        str: Database URL with async driver
    """
    db_url = settings.database_url

    # Convert standard postgresql URL to asyncpg URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif not db_url.startswith("postgresql+asyncpg://"):
        logger.warning(
            "Database URL should use postgresql+asyncpg:// for async support"
        )

    return db_url


async def init_db() -> None:
    """
    Initialize database engine and session maker.

    This should be called during application startup.

    Raises:
        SQLAlchemyError: If database connection fails
    """
    global engine, AsyncSessionLocal

    try:
        db_url = get_database_url()

        logger.info("Initializing database connection...")

        # Create async engine with connection pooling
        engine = create_async_engine(
            db_url,
            echo=settings.debug,  # Log SQL queries in debug mode
            pool_size=10,  # Number of connections to maintain
            max_overflow=20,  # Maximum overflow connections
            pool_pre_ping=True,  # Verify connections before using
            pool_recycle=3600,  # Recycle connections after 1 hour
            # Use NullPool for testing environments if needed
            # poolclass=NullPool if settings.TESTING else None,
        )

        # Create async session maker
        AsyncSessionLocal = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,  # Don't expire objects after commit
            autocommit=False,
            autoflush=False,
        )

        logger.info("Database connection initialized successfully")

        # Test connection
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
            logger.info("Database connection test successful")

    except SQLAlchemyError as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during database initialization: {str(e)}")
        raise


async def close_db() -> None:
    """
    Close database engine and clean up connections.

    This should be called during application shutdown.
    """
    global engine

    if engine:
        logger.info("Closing database connection...")
        await engine.dispose()
        logger.info("Database connection closed successfully")
        engine = None


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function to get database session.

    This is used as a FastAPI dependency to inject database sessions
    into route handlers. The session is automatically closed after the
    request is complete.

    Yields:
        AsyncSession: Database session

    Example:
        @router.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(User))
            return result.scalars().all()
    """
    if AsyncSessionLocal is None:
        raise RuntimeError(
            "Database not initialized. Call init_db() during startup."
        )

    async with AsyncSessionLocal() as session:
        try:
            yield session
            # Only commit if there are pending changes (avoids no-op commits on reads)
            if session.new or session.dirty or session.deleted:
                await session.commit()
        except SQLAlchemyError as e:
            await session.rollback()
            logger.error(f"Database session error: {str(e)}")
            raise
        except Exception as e:
            await session.rollback()
            logger.error(f"Unexpected error in database session: {str(e)}")
            raise
        finally:
            await session.close()


async def check_db_connection() -> bool:
    """
    Check if database connection is healthy.

    Returns:
        bool: True if connection is healthy, False otherwise
    """
    if engine is None:
        logger.error("Database engine not initialized")
        return False

    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except SQLAlchemyError as e:
        logger.error(f"Database connection check failed: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error during connection check: {str(e)}")
        return False


# Context manager for manual session management (if needed)
class DatabaseSession:
    """
    Context manager for manual database session management.

    Use this when you need to manage sessions outside of FastAPI
    dependency injection (e.g., in background tasks).

    Example:
        async with DatabaseSession() as session:
            result = await session.execute(select(User))
            users = result.scalars().all()
    """

    def __init__(self):
        """Initialize the context manager."""
        if AsyncSessionLocal is None:
            raise RuntimeError(
                "Database not initialized. Call init_db() during startup."
            )
        self.session: AsyncSession = None  # type: ignore

    async def __aenter__(self) -> AsyncSession:
        """Enter the context and create a new session."""
        self.session = AsyncSessionLocal()
        return self.session

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Exit the context and close the session."""
        if self.session:
            if exc_type is not None:
                await self.session.rollback()
            else:
                await self.session.commit()
            await self.session.close()
        return False
