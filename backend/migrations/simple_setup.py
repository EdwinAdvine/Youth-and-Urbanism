#!/usr/bin/env python3
"""
Simple setup script that creates tables without foreign key constraints first.
"""

import sys
import os
from datetime import date

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from database.models import Base, User, Administrator, Staff, ExternalInstructor, Parent, Student
from database.connection import DATABASE_URL
from auth import utils

def create_tables_simple(engine):
    """Create all database tables without foreign key constraints"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ Database tables created successfully!")
        print("Tables created:")
        print("- users")
        print("- administrators")
        print("- staff")
        print("- external_instructors")
        print("- parents")
        print("- students")
        
        return True
        
    except SQLAlchemyError as e:
        print(f"❌ Error creating tables: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def create_test_users(db: Session):
    """Create the specified test users with proper credentials"""
    
    test_users = [
        {
            "role": "administrator",
            "email": "administrator@uhs.co.ke",
            "password": "adminpass123",
            "full_name": "Admin User",
            "admin_level": "super"
        },
        {
            "role": "staff",
            "email": "staff@uhs.co.ke",
            "password": "staffpass123",
            "full_name": "Staff Member",
            "department": "teaching"
        },
        {
            "role": "external_instructor",
            "email": "external_instructors@uhs.co.ke",
            "password": "instructorpass123",
            "full_name": "External Instructor",
            "specialty": "music",
            "affiliation": "Freelance"
        },
        {
            "role": "parent",
            "email": "parents@uhs.co.ke",
            "password": "parentpass123",
            "full_name": "Parent User",
            "child_student_id": None
        },
        {
            "role": "student",
            "email": "student@uhs.co.ke",
            "password": "studentpass123",
            "full_name": "Student User",
            "grade_level": "grade 10",
            "enrollment_date": date(2023, 1, 1)
        }
    ]
    
    print("🚀 Creating test users...")
    
    for user_data in test_users:
        try:
            print(f"Creating {user_data['role']}: {user_data['email']}")
            
            # Hash password using Werkzeug
            hashed_password = utils.hash_password(user_data['password'])
            
            # Create user
            user = User(
                email=user_data['email'],
                password_hash=hashed_password,
                user_role=user_data['role']
            )
            
            db.add(user)
            db.flush()  # Get the user ID
            
            # Create role-specific profile
            if user_data['role'] == 'administrator':
                profile = Administrator(
                    user_id=user.id,
                    full_name=user_data['full_name'],
                    admin_level=user_data['admin_level']
                )
            elif user_data['role'] == 'staff':
                profile = Staff(
                    user_id=user.id,
                    full_name=user_data['full_name'],
                    department=user_data['department']
                )
            elif user_data['role'] == 'external_instructor':
                profile = ExternalInstructor(
                    user_id=user.id,
                    full_name=user_data['full_name'],
                    specialty=user_data['specialty'],
                    affiliation=user_data['affiliation']
                )
            elif user_data['role'] == 'parent':
                profile = Parent(
                    user_id=user.id,
                    full_name=user_data['full_name'],
                    child_student_id=user_data['child_student_id']
                )
            elif user_data['role'] == 'student':
                profile = Student(
                    user_id=user.id,
                    full_name=user_data['full_name'],
                    grade_level=user_data['grade_level'],
                    enrollment_date=user_data['enrollment_date']
                )
            
            db.add(profile)
            db.commit()
            print(f"✅ {user_data['role']} created successfully")
            
        except Exception as e:
            db.rollback()
            print(f"❌ Failed to create {user_data['role']}: {e}")
    
    print("\n🎉 Test users creation completed!")

def test_connection():
    """Test database connection"""
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("Please ensure:")
        print("1. MySQL server is running")
        print("2. Database 'home_school' exists")
        print("3. User 'root' with password 'edwin3100DB' has access")
        return False

def verify_users(db: Session):
    """Verify that all test users were created successfully"""
    print("\n🔍 Verifying created users...")
    
    users = db.query(User).all()
    print(f"Total users created: {len(users)}")
    
    for user in users:
        print(f"\nUser: {user.email} ({user.user_role})")
        print(f"  ID: {user.id}")
        print(f"  Created: {user.created_at}")
        
        # Get role-specific profile
        if user.user_role == 'administrator':
            profile = db.query(Administrator).filter(Administrator.user_id == user.id).first()
            if profile:
                print(f"  Full Name: {profile.full_name}")
                print(f"  Admin Level: {profile.admin_level}")
        elif user.user_role == 'staff':
            profile = db.query(Staff).filter(Staff.user_id == user.id).first()
            if profile:
                print(f"  Full Name: {profile.full_name}")
                print(f"  Department: {profile.department}")
        elif user.user_role == 'external_instructor':
            profile = db.query(ExternalInstructor).filter(ExternalInstructor.user_id == user.id).first()
            if profile:
                print(f"  Full Name: {profile.full_name}")
                print(f"  Specialty: {profile.specialty}")
                print(f"  Affiliation: {profile.affiliation}")
        elif user.user_role == 'parent':
            profile = db.query(Parent).filter(Parent.user_id == user.id).first()
            if profile:
                print(f"  Full Name: {profile.full_name}")
                print(f"  Child Student ID: {profile.child_student_id}")
        elif user.user_role == 'student':
            profile = db.query(Student).filter(Student.user_id == user.id).first()
            if profile:
                print(f"  Full Name: {profile.full_name}")
                print(f"  Grade Level: {profile.grade_level}")
                print(f"  Enrollment Date: {profile.enrollment_date}")

if __name__ == "__main__":
    print("🚀 Starting simple setup...")
    
    # Test connection first
    if not test_connection():
        sys.exit(1)
    
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    # Create tables
    if not create_tables_simple(engine):
        print("\n💥 Table creation failed!")
        sys.exit(1)
    
    # Create test users
    db = Session(bind=engine)
    try:
        create_test_users(db)
        verify_users(db)
        
        print("\n🎉 Complete system setup finished successfully!")
        print("\n📋 Test User Credentials:")
        print("Administrator: administrator@uhs.co.ke / adminpass123")
        print("Staff: staff@uhs.co.ke / staffpass123")
        print("External Instructor: external_instructors@uhs.co.ke / instructorpass123")
        print("Parent: parents@uhs.co.ke / parentpass123")
        print("Student: student@uhs.co.ke / studentpass123")
        
    except Exception as e:
        print(f"\n❌ Error during setup: {e}")
        db.rollback()
    finally:
        db.close()