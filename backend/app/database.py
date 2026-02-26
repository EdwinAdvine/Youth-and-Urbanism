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

# Initialize engines as None (will be created in init_db)
engine: AsyncEngine = None  # type: ignore
AsyncSessionLocal: async_sessionmaker[AsyncSession] = None  # type: ignore

# Read replica (optional — falls back to write engine when not configured)
read_engine: AsyncEngine = None  # type: ignore
AsyncReadSessionLocal: async_sessionmaker[AsyncSession] = None  # type: ignore


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

        # Create async engine with production-grade connection pooling
        # CRITICAL FIX (H-04): Use config values instead of hardcoded pool settings
        engine = create_async_engine(
            db_url,
            echo=settings.database_echo,  # Use dedicated setting, not debug flag
            pool_size=settings.database_pool_size,  # Default: 20 per worker
            max_overflow=settings.database_max_overflow,  # Default: 30 burst capacity
            pool_timeout=settings.database_pool_timeout,  # Default: 10s fail-fast
            pool_pre_ping=True,  # Verify connections before using
            pool_recycle=settings.database_pool_recycle,  # Default: 1800s
            connect_args={
                "server_settings": {
                    "statement_timeout": str(settings.database_statement_timeout),
                    "idle_in_transaction_session_timeout": str(
                        settings.database_idle_in_transaction_timeout
                    ),
                }
            },
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

        # ── Read replica engine (optional) ─────────────────────────
        await _init_read_engine()

    except SQLAlchemyError as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during database initialization: {str(e)}")
        raise


async def _init_read_engine() -> None:
    """
    Initialize read replica engine if DATABASE_READ_URL is configured.

    Falls back to the write engine when no replica URL is provided.
    Sets `default_transaction_read_only=on` so accidental writes are blocked.
    """
    global read_engine, AsyncReadSessionLocal

    if settings.database_read_url:
        read_url = settings.database_read_url
        if read_url.startswith("postgresql://"):
            read_url = read_url.replace("postgresql://", "postgresql+asyncpg://", 1)

        read_engine = create_async_engine(
            read_url,
            echo=settings.database_echo,
            pool_size=settings.database_pool_size,
            max_overflow=settings.database_max_overflow,
            pool_timeout=settings.database_pool_timeout,
            pool_pre_ping=True,
            pool_recycle=settings.database_pool_recycle,
            connect_args={
                "server_settings": {
                    "statement_timeout": str(settings.database_statement_timeout),
                    "default_transaction_read_only": "on",
                }
            },
        )

        AsyncReadSessionLocal = async_sessionmaker(
            read_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )

        async with read_engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Read replica engine initialized successfully")
    else:
        # No replica configured — reuse write engine for reads
        read_engine = engine
        AsyncReadSessionLocal = AsyncSessionLocal
        logger.info("No read replica configured; reads use the primary engine")


async def get_read_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for read-only database sessions.

    Routes to the read replica when configured, otherwise falls back to the
    primary engine.  Use this for dashboard queries, catalog listings, and
    other read-heavy endpoints to offload the primary.

    Example:
        @router.get("/courses")
        async def list_courses(db: AsyncSession = Depends(get_read_db)):
            ...
    """
    if AsyncReadSessionLocal is None:
        raise RuntimeError(
            "Database not initialized. Call init_db() during startup."
        )

    async with AsyncReadSessionLocal() as session:
        try:
            yield session
        except SQLAlchemyError as e:
            await session.rollback()
            logger.error(f"Read session error: {e}")
            raise
        finally:
            await session.close()


async def close_db() -> None:
    """
    Close database engine and clean up connections.

    This should be called during application shutdown.
    """
    global engine, read_engine

    # Close read replica first (if it's a separate engine)
    if read_engine and read_engine is not engine:
        logger.info("Closing read replica connection...")
        await read_engine.dispose()
        read_engine = None

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

    CRITICAL FIX (M-01): Removed auto-commit logic. Route handlers must
    explicitly call await db.commit() when they intend to persist changes.
    This prevents accidental commits on exception paths and makes transactions explicit.

    Yields:
        AsyncSession: Database session

    Example:
        @router.post("/users")
        async def create_user(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
            new_user = User(**user_data.dict())
            db.add(new_user)
            await db.commit()  # Explicit commit required
            return new_user
    """
    if AsyncSessionLocal is None:
        raise RuntimeError(
            "Database not initialized. Call init_db() during startup."
        )

    async with AsyncSessionLocal() as session:
        try:
            yield session
            # REMOVED (M-01): Auto-commit logic removed for safety
            # Route handlers must explicitly call await db.commit()
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
