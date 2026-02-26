#!/usr/bin/env python3
"""
Direct MySQL migration script to create tables for the authentication system.
Run this script to set up the database schema using MySQL directly.
"""

import subprocess
import sys
import os

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

def create_database():
    """Create the home_school database"""
    print("📁 Creating database 'home_school'...")
    success, output = run_mysql_command("CREATE DATABASE IF NOT EXISTS home_school;")
    if success:
        print("✅ Database created successfully")
        return True
    else:
        print(f"❌ Failed to create database: {output}")
        return False

def create_tables():
    """Create all authentication tables"""
    print("🏗️ Creating database tables...")
    
    # SQL to create all tables
    create_tables_sql = """
    USE home_school;
    
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        email_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE
    );
    
    CREATE TABLE IF NOT EXISTS students (
        user_id VARCHAR(36) PRIMARY KEY,
        grade_level VARCHAR(50),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS parents (
        user_id VARCHAR(36) PRIMARY KEY,
        number_of_children VARCHAR(50),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS instructors (
        user_id VARCHAR(36) PRIMARY KEY,
        subjects VARCHAR(255),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS partners (
        user_id VARCHAR(36) PRIMARY KEY,
        position VARCHAR(255),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE TABLE IF NOT EXISTS admins (
        user_id VARCHAR(36) PRIMARY KEY,
        position VARCHAR(255),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """
    
    success, output = run_mysql_command(create_tables_sql)
    if success:
        print("✅ All tables created successfully!")
        return True
    else:
        print(f"❌ Failed to create tables: {output}")
        return False

def show_tables():
    """Show all created tables"""
    print("📋 Verifying table creation...")
    success, output = run_mysql_command("USE home_school; SHOW TABLES;")
    if success:
        print("✅ Tables created:")
        print(output)
        return True
    else:
        print(f"❌ Failed to show tables: {output}")
        return False

def main():
    """Main migration function"""
    print("🚀 Starting MySQL database migration...")
    
    # Step 1: Create database
    if not create_database():
        print("💥 Database creation failed!")
        sys.exit(1)
    
    # Step 2: Create tables
    if not create_tables():
        print("💥 Table creation failed!")
        sys.exit(1)
    
    # Step 3: Verify tables
    if not show_tables():
        print("💥 Table verification failed!")
        sys.exit(1)
    
    print("\n🎉 MySQL migration completed successfully!")
    print("\nNext steps:")
    print("1. Run the FastAPI application")
    print("2. Use the /api/auth/register endpoint to create users")
    print("3. Use the /api/auth/login endpoint to authenticate")

if __name__ == "__main__":
    main()