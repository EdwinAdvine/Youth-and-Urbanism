from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from typing import Optional
import secrets
import os
from jose import JWTError, jwt
from fastapi import HTTPException, status
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength requirements
    Returns (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if len(password) > 128:
        return False, "Password must be less than 128 characters long"
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    if not has_upper:
        return False, "Password must contain at least one uppercase letter"
    
    if not has_lower:
        return False, "Password must contain at least one lowercase letter"
    
    if not has_digit:
        return False, "Password must contain at least one number"
    
    if not has_special:
        return False, "Password must contain at least one special character"
    
    # Check for common patterns
    common_patterns = [
        "password", "123456", "qwerty", "admin", "user"
    ]
    
    password_lower = password.lower()
    for pattern in common_patterns:
        if pattern in password_lower:
            return False, "Password cannot contain common words or patterns"
    
    return True, "Password is strong"

# JWT Configuration - Use environment variable for persistent secret key
SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def generate_user_id() -> str:
    """Generate a unique user ID"""
    import uuid
    return str(uuid.uuid4())