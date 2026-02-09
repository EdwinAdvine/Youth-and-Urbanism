#!/usr/bin/env python3
"""
Direct database migration script to create tables for the authentication system using MySQL.
Run this script to set up the database schema.
"""

import pymysql
import os
import sys

def create_tables():
    """Create all database tables"""
    try:
        # Connect to MySQL database
        conn = pymysql.connect(
            host='localhost',
            user='root',
            password='edwin3100DB',
            database='home_school',
            charset='utf8mb4'
        )
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                avatar TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                email_verified BOOLEAN DEFAULT 0,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        
        # Create students table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                user_id VARCHAR(255) PRIMARY KEY,
                grade_level VARCHAR(100),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create parents table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS parents (
                user_id VARCHAR(255) PRIMARY KEY,
                number_of_children VARCHAR(50),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create instructors table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS instructors (
                user_id VARCHAR(255) PRIMARY KEY,
                subjects TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create partners table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS partners (
                user_id VARCHAR(255) PRIMARY KEY,
                position VARCHAR(255),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create admins table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS admins (
                user_id VARCHAR(255) PRIMARY KEY,
                position VARCHAR(255),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Commit changes and close connection
        conn.commit()
        conn.close()
        
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
        conn = pymysql.connect(
            host='localhost',
            user='root',
            password='edwin3100DB',
            database='home_school',
            charset='utf8mb4'
        )
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        conn.close()
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
