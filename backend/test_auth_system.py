#!/usr/bin/env python3
"""
Test script to verify the multi-role authentication system.
"""

import sys
import os
import requests
from datetime import date

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

def test_authentication_system():
    """Test the authentication system with all roles"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Multi-Role Authentication System")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health check endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    # Test 2: Login with test users
    test_users = [
        {
            "role": "administrator",
            "email": "administrator@uhs.co.ke",
            "password": "adminpass123"
        },
        {
            "role": "staff",
            "email": "staff@uhs.co.ke",
            "password": "staffpass123"
        },
        {
            "role": "external_instructor",
            "email": "external_instructors@uhs.co.ke",
            "password": "instructorpass123"
        },
        {
            "role": "parent",
            "email": "parents@uhs.co.ke",
            "password": "parentpass123"
        },
        {
            "role": "student",
            "email": "student@uhs.co.ke",
            "password": "studentpass123"
        }
    ]
    
    print("\n2. Testing login for all roles...")
    
    for user_data in test_users:
        print(f"\n   Testing {user_data['role']} login...")
        try:
            login_data = {
                "email": user_data["email"],
                "password": user_data["password"]
            }
            
            response = requests.post(f"{base_url}/api/auth/login", json=login_data)
            
            if response.status_code == 200:
                result = response.json()
                token = result.get("access_token")
                print(f"   ✅ {user_data['role']} login successful")
                print(f"   📝 Token: {token[:20]}...")
                
                # Test dashboard access
                headers = {"Authorization": f"Bearer {token}"}
                
                if user_data['role'] == 'administrator':
                    dashboard_response = requests.get(f"{base_url}/admin/dashboard", headers=headers)
                elif user_data['role'] == 'staff':
                    dashboard_response = requests.get(f"{base_url}/staff/dashboard", headers=headers)
                elif user_data['role'] == 'external_instructor':
                    dashboard_response = requests.get(f"{base_url}/external/dashboard", headers=headers)
                elif user_data['role'] == 'parent':
                    dashboard_response = requests.get(f"{base_url}/parent/dashboard", headers=headers)
                elif user_data['role'] == 'student':
                    dashboard_response = requests.get(f"{base_url}/student/dashboard", headers=headers)
                
                if dashboard_response.status_code == 200:
                    print(f"   ✅ {user_data['role']} dashboard access successful")
                else:
                    print(f"   ❌ {user_data['role']} dashboard access failed: {dashboard_response.status_code}")
                    
            else:
                print(f"   ❌ {user_data['role']} login failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"   ❌ {user_data['role']} test error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Authentication system test completed!")
    print("\n📋 Test User Credentials:")
    for user in test_users:
        print(f"   {user['role']}: {user['email']} / {user['password']}")

if __name__ == "__main__":
    test_authentication_system()