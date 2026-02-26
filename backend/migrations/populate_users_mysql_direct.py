#!/usr/bin/env python3
"""
Script to populate the MySQL database with initial mock users from the original authentication system.
"""

import subprocess
import sys
import os
import uuid
from datetime import datetime

def run_mysql_command(sql_command):
    """Run a MySQL command using the MySQL client"""
    try:
        # Use the full path to MySQL client
        mysql_path = "/usr/local/mysql/bin/mysql"
        
        # Create the command
        cmd = [
            mysql_path,
            "-u", "root",
            "-p" + "edwin3100DB",
            "-e", sql_command
        ]
        
        # Run the command
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr
    except Exception as e:
        return False, str(e)

def create_mock_users():
    """Create the original mock users in the MySQL database"""
    
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
    
    print("🏗️ Creating mock users in MySQL database...")
    
    # Build SQL to insert all users
    insert_users_sql = "USE home_school;\n"
    
    for user_data in mock_users:
        # Generate user ID
        user_id = str(uuid.uuid4())
        
        # Hash password (simple hash for demo - in production use bcrypt)
        import hashlib
        password_hash = hashlib.sha256(user_data["password"].encode()).hexdigest()
        
        # Insert user
        insert_users_sql += f"""
        INSERT INTO users (id, email, password_hash, name, role, created_at, email_verified, is_active)
        VALUES ('{user_id}', '{user_data["email"]}', '{password_hash}', '{user_data["name"]}', 
                '{user_data["role"]}', NOW(), 1, 1);
        """
        
        # Insert role-specific data
        if user_data["role"] == "student":
            insert_users_sql += f"INSERT INTO students (user_id, grade_level) VALUES ('{user_id}', '{user_data.get('grade_level', '')}');\n"
        elif user_data["role"] == "parent":
            insert_users_sql += f"INSERT INTO parents (user_id, number_of_children) VALUES ('{user_id}', '{user_data.get('number_of_children', '')}');\n"
        elif user_data["role"] == "instructor":
            insert_users_sql += f"INSERT INTO instructors (user_id, subjects) VALUES ('{user_id}', '{user_data.get('subjects', '')}');\n"
        elif user_data["role"] == "partner":
            insert_users_sql += f"INSERT INTO partners (user_id, position) VALUES ('{user_id}', '{user_data.get('position', '')}');\n"
        elif user_data["role"] == "admin":
            insert_users_sql += f"INSERT INTO admins (user_id, position) VALUES ('{user_id}', '{user_data.get('position', '')}');\n"
        
        print(f"✅ Created user: {user_data['name']} ({user_data['email']})")
    
    # Run the SQL
    success, output = run_mysql_command(insert_users_sql)
    if success:
        print(f"\n🎉 Successfully created {len(mock_users)} users!")
        return True
    else:
        print(f"❌ Failed to create users: {output}")
        return False

def show_users():
    """Show all users in the MySQL database"""
    print("\n📊 Current users in MySQL database:")
    success, output = run_mysql_command("USE home_school; SELECT id, name, email, role, created_at FROM users ORDER BY created_at;")
    if success:
        print(output)
    else:
        print(f"❌ Failed to retrieve users: {output}")

def main():
    """Main population function"""
    print("🚀 Starting MySQL user population...")
    
    # Create users
    if not create_mock_users():
        print("💥 User creation failed!")
        sys.exit(1)
    
    # Show users
    show_users()
    
    print("\n🎉 MySQL user population completed successfully!")

if __name__ == "__main__":
    main()