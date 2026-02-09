#!/usr/bin/env python3
"""
Script to populate the database with initial mock users from the original authentication system.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from backend.database.connection import SessionLocal
from backend.auth.crud import create_user
from backend.auth.schemas import UserCreate

def create_mock_users():
    """Create the original mock users in the database"""
    
    # Original mock users
    mock_users = [
        {
            "name": "Student User",
            "email": "student@urbanhomeschool.com",
            "password": "password123",
            "role": "student",
            "grade_level": "Grade 4"
        },
        {
            "name": "Parent User",
            "email": "parent@urbanhomeschool.com",
            "password": "password123",
            "role": "parent",
            "number_of_children": "2"
        },
        {
            "name": "Instructor User",
            "email": "instructor@urbanhomeschool.com",
            "password": "password123",
            "role": "instructor",
            "subjects": "Mathematics, Science"
        },
        {
            "name": "Admin User",
            "email": "admin@urbanhomeschool.com",
            "password": "password123",
            "role": "admin",
            "position": "School Administrator"
        },
        {
            "name": "Partner User",
            "email": "partner@urbanhomeschool.com",
            "password": "password123",
            "role": "partner",
            "position": "Community Partner"
        }
    ]
    
    db = SessionLocal()
    
    try:
        for user_data in mock_users:
            print(f"Creating user: {user_data['name']} ({user_data['email']})")
            
            user = UserCreate(**user_data)
            try:
                created_user = create_user(db, user)
                print(f"✅ User created successfully: {created_user.name}")
            except Exception as e:
                print(f"❌ Failed to create user {user_data['name']}: {e}")
        
        print("\n🎉 Mock users population completed!")
        
    except Exception as e:
        print(f"❌ Error during user creation: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Starting mock users population...")
    create_mock_users()