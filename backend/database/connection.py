from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
import os
from typing import Generator
from contextlib import contextmanager

# Database configuration
DATABASE_URL = "mysql+pymysql://root:edwin3100DB@localhost:3306/home_school"

# Create engine
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def get_db_context():
    """Context manager for database sessions"""
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        db.rollback()
        raise e
    finally:
        db.close()

def test_connection():
    """Test database connection"""
    try:
        from sqlalchemy import text
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1")).scalar()
            return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False
