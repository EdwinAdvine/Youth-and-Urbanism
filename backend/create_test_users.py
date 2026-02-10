#!/usr/bin/env python3
"""
Script to create test users with specified credentials.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from backend.database.connection import SessionLocal
from backend.auth.crud import create_user
from backend.auth.schemas import UserCreate
from backend.database.models import User
from backend.auth import utils

def truncate_password(password: str) -> str:
    """Truncate password to 72 bytes for bcrypt compatibility"""
    return password[:72]

def create_test_users():
    """Create test users with specified credentials"""
    
    # Test database connection first
    from backend.database.connection import test_connection
    if not test_connection():
        print("❌ Database connection failed. Please ensure the MySQL container is running.")
        return
    
    test_users = [
        {
            "name": "Student User",
            "email": "student@urbanhomeschool.com",
            "password": truncate_password("test123"),
            "role": "student",
            "grade_level": "Grade 4"
        },
        {
            "name": "Parent User",
            "email": "parent@urbanhomeschool.com",
            "password": truncate_password("test123"),
            "role": "parent",
            "number_of_children": "2"
        },
        {
            "name": "Instructor User",
            "email": "instructor@urbanhomeschool.com",
            "password": truncate_password("test123"),
            "role": "instructor",
            "subjects": "Mathematics, Science"
        },
        {
            "name": "Admin User",
            "email": "admin@urbanhomeschool.com",
            "password": truncate_password("test123"),
            "role": "admin",
            "position": "School Administrator"
        }
    ]
    
    db = SessionLocal()
    
    try:
        for user_data in test_users:
            print(f"Creating user: {user_data['name']} ({user_data['email']})")
            
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == user_data['email']).first()
            if existing_user:
                print(f"⚠️  User {user_data['name']} already exists, updating password")
                existing_user.password_hash = utils.hash_password(user_data['password'])
                db.commit()
                print(f"✅ Updated user: {existing_user.name}")
            else:
                user = UserCreate(**user_data)
                try:
                    created_user = create_user(db, user)
                    print(f"✅ User created successfully: {created_user.name}")
                except Exception as e:
                    print(f"❌ Failed to create user {user_data['name']}: {e}")
        
        print("\n🎉 Test users created successfully!")
        
    except Exception as e:
        print(f"❌ Error during user creation: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Starting test users creation...")
    create_test_users()