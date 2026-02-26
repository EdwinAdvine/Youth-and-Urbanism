#!/usr/bin/env python3
"""
Database migration script to create tables for the authentication system.
Run this script to set up the database schema.
"""

import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from database.models import Base
from database.connection import DATABASE_URL

def create_tables():
    """Create all database tables"""
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ Database tables created successfully!")
        print("Tables created:")
        print("- users")
        print("- students")
        print("- parents")
        print("- instructors")
        print("- partners")
        print("- admins")
        
        return True
        
    except SQLAlchemyError as e:
        print(f"❌ Error creating tables: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_connection():
    """Test database connection"""
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            result = connection.execute("SELECT 1").scalar()
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("Please ensure:")
        print("1. MySQL server is running")
        print("2. Database 'home_school' exists")
        print("3. User 'root' with password 'edwin3100DB' has access")
        return False

if __name__ == "__main__":
    print("🚀 Starting database migration...")
    
    # Test connection first
    if not test_connection():
        sys.exit(1)
    
    # Create tables
    if create_tables():
        print("\n🎉 Migration completed successfully!")
        print("\nNext steps:")
        print("1. Run the FastAPI application")
        print("2. Use the /api/auth/register endpoint to create users")
        print("3. Use the /api/auth/login endpoint to authenticate")
    else:
        print("\n💥 Migration failed!")
        sys.exit(1)