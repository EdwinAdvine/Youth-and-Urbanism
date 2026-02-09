#!/usr/bin/env python3
"""
Script to create test users with secure passwords for the Urban Home School authentication system.
This script creates test accounts that meet the enhanced password security requirements.
"""

import sys
import os
import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000/api"

# Test users with secure passwords that meet all requirements:
# - Minimum 8 characters
# - At least one uppercase letter
# - At least one lowercase letter  
# - At least one number
# - At least one special character
# - No common patterns
TEST_USERS = [
    {
        "name": "Test Student",
        "email": "student@urbanhomeschool.com",
        "password": "Student123!",
        "role": "student",
        "grade_level": "Grade 6"
    },
    {
        "name": "Test Parent", 
        "email": "parent@urbanhomeschool.com",
        "password": "Parent123!",
        "role": "parent",
        "number_of_children": "2"
    },
    {
        "name": "Test Instructor",
        "email": "instructor@urbanhomeschool.com", 
        "password": "Instructor123!",
        "role": "instructor",
        "subjects": "Mathematics, English"
    },
    {
        "name": "Test Admin",
        "email": "admin@urbanhomeschool.com",
        "password": "Admin123!",
        "role": "admin",
        "position": "System Administrator"
    }
]

def test_server_health():
    """Test if the server is running"""
    print("🔍 Checking server health...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            print("✅ Server is running and healthy")
            return True
        else:
            print(f"❌ Server health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure the backend is running on http://localhost:8000")
        return False
    except requests.exceptions.Timeout:
        print("❌ Server connection timed out. Check if the server is running.")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def create_test_user(user_data):
    """Create a single test user"""
    print(f"\n📝 Creating {user_data['role']} account: {user_data['email']}")
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data, timeout=30)
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Successfully created {user_data['role']} account")
            print(f"   Name: {user_data['name']}")
            print(f"   Email: {user_data['email']}")
            print(f"   Role: {user_data['role']}")
            print(f"   Password: {user_data['password']}")
            return True
        elif response.status_code == 400:
            error_data = response.json()
            if "already registered" in error_data.get("detail", ""):
                print(f"⚠️  User {user_data['email']} already exists (this is okay)")
                return True
            else:
                print(f"❌ Registration failed: {error_data.get('detail', 'Unknown error')}")
                return False
        else:
            print(f"❌ Registration failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error creating {user_data['role']} account: {e}")
        return False

def test_login(user_data):
    """Test login for a user"""
    print(f"\n🔑 Testing login for {user_data['role']}: {user_data['email']}")
    
    try:
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"],
            "remember_me": False
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Login successful for {user_data['role']}")
            print(f"   Token received: {result.get('access_token', 'N/A')[:20]}...")
            return True
        else:
            print(f"❌ Login failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Login test error: {e}")
        return False

def main():
    """Main function to create all test users"""
    print("🚀 Creating Test Users for Urban Home School Authentication System")
    print("=" * 70)
    print(f"Server URL: {BASE_URL}")
    print(f"Test started at: {datetime.now()}")
    print("=" * 70)
    
    # Check server health
    if not test_server_health():
        print("\n💥 Server is not accessible. Please start the backend server first:")
        print("   cd backend && python main.py")
        print("   or")
        print("   cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload")
        return
    
    print(f"\n👥 Creating {len(TEST_USERS)} test users...")
    
    created_users = 0
    login_tests = 0
    
    # Create all test users
    for user_data in TEST_USERS:
        if create_test_user(user_data):
            created_users += 1
            
            # Test login for each created user
            if test_login(user_data):
                login_tests += 1
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 TEST USER CREATION SUMMARY")
    print("=" * 70)
    print(f"✅ Users created successfully: {created_users}/{len(TEST_USERS)}")
    print(f"✅ Login tests passed: {login_tests}/{len(TEST_USERS)}")
    
    if created_users == len(TEST_USERS) and login_tests == len(TEST_USERS):
        print("\n🎉 ALL TEST USERS CREATED SUCCESSFULLY!")
        print("\n📋 TEST CREDENTIALS:")
        print("-" * 50)
        for user in TEST_USERS:
            print(f"Role: {user['role'].upper()}")
            print(f"Email: {user['email']}")
            print(f"Password: {user['password']}")
            print(f"Name: {user['name']}")
            if user['role'] == 'student':
                print(f"Grade Level: {user.get('grade_level', 'N/A')}")
            elif user['role'] == 'parent':
                print(f"Number of Children: {user.get('number_of_children', 'N/A')}")
            elif user['role'] == 'instructor':
                print(f"Subjects: {user.get('subjects', 'N/A')}")
            elif user['role'] == 'admin':
                print(f"Position: {user.get('position', 'N/A')}")
            print("-" * 50)
        
        print("\n✨ Ready for testing!")
        print("   - Start the frontend: npm run dev")
        print("   - Use the credentials above to test login")
        print("   - All passwords meet enhanced security requirements")
        
    else:
        print(f"\n⚠️  Some operations failed:")
        if created_users < len(TEST_USERS):
            print(f"   - {len(TEST_USERS) - created_users} users were not created")
        if login_tests < len(TEST_USERS):
            print(f"   - {len(TEST_USERS) - login_tests} login tests failed")
        print("\n💡 Try running the script again or check the server logs")
    
    print(f"\nTest completed at: {datetime.now()}")

if __name__ == "__main__":
    main()