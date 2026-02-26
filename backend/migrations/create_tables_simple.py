#!/usr/bin/env python3
"""
Simple database migration script to create tables for the authentication system using MySQL.
Run this script to set up the database schema.
"""

import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from sqlalchemy import create_engine, MetaData, Table, Column, String, Integer, DateTime, Boolean, Text, ForeignKey, text
from sqlalchemy.sql import func

def create_tables():
    """Create all database tables"""
    try:
        # Use MySQL database
        DATABASE_URL = "mysql+pymysql://root:edwin3100DB@localhost:3306/home_school"
        engine = create_engine(DATABASE_URL)
        
        # Define metadata
        metadata = MetaData()
        
        # Users table
        users = Table(
            'users', metadata,
            Column('id', String(255), primary_key=True),
            Column('email', String(255), unique=True, nullable=False),
            Column('password_hash', String(255), nullable=False),
            Column('name', String(255), nullable=False),
            Column('role', String(50), nullable=False),
            Column('avatar', Text),
            Column('created_at', DateTime, default=func.now()),
            Column('last_login', DateTime),
            Column('email_verified', Boolean, default=False),
            Column('is_active', Boolean, default=True)
        )
        
        # Students table
        students = Table(
            'students', metadata,
            Column('user_id', String(255), ForeignKey('users.id'), primary_key=True),
            Column('grade_level', String(100))
        )
        
        # Parents table
        parents = Table(
            'parents', metadata,
            Column('user_id', String(255), ForeignKey('users.id'), primary_key=True),
            Column('number_of_children', String(50))
        )
        
        # Instructors table
        instructors = Table(
            'instructors', metadata,
            Column('user_id', String(255), ForeignKey('users.id'), primary_key=True),
            Column('subjects', Text)
        )
        
        # Partners table
        partners = Table(
            'partners', metadata,
            Column('user_id', String(255), ForeignKey('users.id'), primary_key=True),
            Column('position', String(255))
        )
        
        # Admins table
        admins = Table(
            'admins', metadata,
            Column('user_id', String(255), ForeignKey('users.id'), primary_key=True),
            Column('position', String(255))
        )
        
        # Create all tables
        metadata.create_all(engine)
        
        print("✅ Database tables created successfully!")
        print("Tables created:")
        print("- users")
        print("- students")
        print("- parents")
        print("- instructors")
        print("- partners")
        print("- admins")
        
        print(f"\n📁 MySQL database 'home_school' configured successfully!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

def test_connection():
    """Test database connection"""
    try:
        DATABASE_URL = "mysql+pymysql://root:edwin3100DB@localhost:3306/home_school"
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1")).scalar()
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting MySQL database migration...")
    
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
