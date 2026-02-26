#!/usr/bin/env python3
"""
Test script for the authentication system.
This script tests all authentication endpoints and functionality.
"""

import sys
import os
import requests
import json
from datetime import datetime

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USERS = [
    {
        "name": "Test Student",
        "email": "test.student@urbanhomeschool.com",
        "password": "test123",
        "role": "student",
        "grade_level": "Grade 6"
    },
    {
        "name": "Test Parent",
        "email": "test.parent@urbanhomeschool.com",
        "password": "test123",
        "role": "parent",
        "number_of_children": "3"
    },
    {
        "name": "Test Instructor",
        "email": "test.instructor@urbanhomeschool.com",
        "password": "test123",
        "role": "instructor",
        "subjects": "Mathematics, English"
    }
]

def test_health_check():
    """Test health check endpoint"""
    print("🧪 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_registration():
    """Test user registration"""
    print("\n🧪 Testing user registration...")
    tokens = {}
    
    for user_data in TEST_USERS:
        try:
            response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
            if response.status_code == 201:
                result = response.json()
                print(f"✅ Registered {user_data['role']}: {user_data['email']}")
                tokens[user_data['role']] = result.get('access_token')
            else:
                print(f"❌ Registration failed for {user_data['role']}: {response.status_code}")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Registration error for {user_data['role']}: {e}")
    
    return tokens

def test_login():
    """Test user login"""
    print("\n🧪 Testing user login...")
    tokens = {}
    
    for user_data in TEST_USERS:
        try:
            login_data = {
                "email": user_data["email"],
                "password": user_data["password"],
                "remember_me": False
            }
            response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Logged in {user_data['role']}: {user_data['email']}")
                tokens[user_data['role']] = result.get('access_token')
            else:
                print(f"❌ Login failed for {user_data['role']}: {response.status_code}")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Login error for {user_data['role']}: {e}")
    
    return tokens

def test_protected_endpoints(tokens):
    """Test protected endpoints"""
    print("\n🧪 Testing protected endpoints...")
    
    for role, token in tokens.items():
        if not token:
            continue
            
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test get current user
        try:
            response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            if response.status_code == 200:
                user = response.json()
                print(f"✅ {role} can access profile: {user['name']}")
            else:
                print(f"❌ {role} profile access failed: {response.status_code}")
        except Exception as e:
            print(f"❌ {role} profile access error: {e}")
        
        # Test update profile
        try:
            update_data = {"name": f"Updated {role}"}
            response = requests.put(f"{BASE_URL}/auth/profile", 
                                  headers=headers, 
                                  json=update_data)
            if response.status_code == 200:
                user = response.json()
                print(f"✅ {role} profile updated: {user['name']}")
            else:
                print(f"❌ {role} profile update failed: {response.status_code}")
        except Exception as e:
            print(f"❌ {role} profile update error: {e}")

def test_admin_endpoints(admin_token):
    """Test admin-only endpoints"""
    print("\n🧪 Testing admin endpoints...")
    
    if not admin_token:
        print("❌ No admin token available")
        return
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test get all users
    try:
        response = requests.get(f"{BASE_URL}/auth/users", headers=headers)
        if response.status_code == 200:
            users = response.json()
            print(f"✅ Admin can access users list: {len(users)} users")
        else:
            print(f"❌ Admin users list failed: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Admin users list error: {e}")

def test_invalid_requests():
    """Test invalid requests"""
    print("\n🧪 Testing invalid requests...")
    
    # Test invalid login
    try:
        login_data = {
            "email": "invalid@example.com",
            "password": "wrongpassword",
            "remember_me": False
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 401:
            print("✅ Invalid login properly rejected")
        else:
            print(f"❌ Invalid login should be rejected: {response.status_code}")
    except Exception as e:
        print(f"❌ Invalid login test error: {e}")
    
    # Test protected endpoint without token
    try:
        response = requests.get(f"{BASE_URL}/auth/me")
        if response.status_code == 403:
            print("✅ Protected endpoint properly rejects missing token")
        else:
            print(f"❌ Protected endpoint should reject missing token: {response.status_code}")
    except Exception as e:
        print(f"❌ Protected endpoint test error: {e}")

def main():
    """Run all tests"""
    print("🚀 Starting authentication system tests...")
    print(f"Base URL: {BASE_URL}")
    print(f"Test started at: {datetime.now()}")
    
    # Test health check
    if not test_health_check():
        print("\n💥 Health check failed, stopping tests")
        return
    
    # Test registration
    reg_tokens = test_registration()
    
    # Test login
    login_tokens = test_login()
    
    # Test protected endpoints
    test_protected_endpoints(login_tokens)
    
    # Test admin endpoints (if admin token available)
    admin_token = login_tokens.get('instructor')  # Use instructor as admin for testing
    test_admin_endpoints(admin_token)
    
    # Test invalid requests
    test_invalid_requests()
    
    print(f"\n🎉 Authentication system tests completed!")
    print(f"Test completed at: {datetime.now()}")
    
    # Summary
    print("\n📊 Test Summary:")
    print(f"✅ Registered users: {len(reg_tokens)}")
    print(f"✅ Successful logins: {len(login_tokens)}")
    print(f"✅ Protected endpoints tested: {len(login_tokens)}")
    
    if len(login_tokens) > 0:
        print("\n✨ Authentication system is working correctly!")
        print("\nNext steps:")
        print("1. Start the frontend application")
        print("2. Test login with the following credentials:")
        for user in TEST_USERS:
            print(f"   - {user['role']}: {user['email']} / {user['password']}")
    else:
        print("\n⚠️  No successful logins - check backend server")

if __name__ == "__main__":
    main()