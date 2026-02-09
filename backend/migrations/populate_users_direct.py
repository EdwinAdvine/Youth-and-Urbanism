#!/usr/bin/env python3
"""
Script to populate the MySQL database with initial mock users from the original authentication system.
"""

import pymysql
import hashlib
import uuid
from datetime import datetime

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
    
    # Connect to database
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='edwin3100DB',
        database='home_school',
        charset='utf8mb4'
    )
    cursor = conn.cursor()
    
    try:
        for user_data in mock_users:
            # Generate user ID
            user_id = str(uuid.uuid4())
            
            # Hash password (simple hash for demo - in production use bcrypt)
            password_hash = hashlib.sha256(user_data["password"].encode()).hexdigest()
            
            # Insert user
            cursor.execute('''
                INSERT INTO users (id, email, password_hash, name, role, created_at, email_verified, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', (user_id, user_data["email"], password_hash, user_data["name"], 
                  user_data["role"], datetime.now(), 1, 1))
            
            # Insert role-specific data
            if user_data["role"] == "student":
                cursor.execute('''
                    INSERT INTO students (user_id, grade_level)
                    VALUES (%s, %s)
                ''', (user_id, user_data["grade_level"]))
            elif user_data["role"] == "parent":
                cursor.execute('''
                    INSERT INTO parents (user_id, number_of_children)
                    VALUES (%s, %s)
                ''', (user_id, user_data["number_of_children"]))
            elif user_data["role"] == "instructor":
                cursor.execute('''
                    INSERT INTO instructors (user_id, subjects)
                    VALUES (%s, %s)
                ''', (user_id, user_data["subjects"]))
            elif user_data["role"] == "partner":
                cursor.execute('''
                    INSERT INTO partners (user_id, position)
                    VALUES (%s, %s)
                ''', (user_id, user_data["position"]))
            elif user_data["role"] == "admin":
                cursor.execute('''
                    INSERT INTO admins (user_id, position)
                    VALUES (%s, %s)
                ''', (user_id, user_data["position"]))
            
            print(f"✅ Created user: {user_data['name']} ({user_data['email']})")
        
        # Commit changes
        conn.commit()
        print(f"\n🎉 Successfully created {len(mock_users)} users!")
        
    except Exception as e:
        print(f"❌ Error creating users: {e}")
        conn.rollback()
    finally:
        conn.close()

def show_users():
    """Show all users in the database"""
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='edwin3100DB',
        database='home_school',
        charset='utf8mb4'
    )
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT u.id, u.name, u.email, u.role, u.created_at
            FROM users u
            ORDER BY u.created_at
        ''')
        
        users = cursor.fetchall()
        
        if users:
            print("\n📊 Current users in database:")
            for user in users:
                print(f"  - {user[1]} ({user[2]}) - {user[3]} - Created: {user[4]}")
        else:
            print("\n📝 No users found in database")
            
    except Exception as e:
        print(f"❌ Error retrieving users: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    print("🚀 Starting user population...")
    create_mock_users()
    show_users()
