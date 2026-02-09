#!/usr/bin/env python3
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Test imports
try:
    from auth.endpoints import router
    print("✓ Auth endpoints imported successfully")
except ImportError as e:
    print(f"✗ Failed to import auth endpoints: {e}")

try:
    from database.models import User
    print("✓ Database models imported successfully")
except ImportError as e:
    print(f"✗ Failed to import database models: {e}")

try:
    from auth.crud import get_user_by_email
    print("✓ Auth CRUD functions imported successfully")
except ImportError as e:
    print(f"✗ Failed to import auth CRUD: {e}")

print("Import test completed!")