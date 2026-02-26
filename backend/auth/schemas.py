from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str

class UserCreate(UserBase):
    password: str
    grade_level: Optional[str] = None
    number_of_children: Optional[str] = None
    subjects: Optional[str] = None
    position: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class UserResponse(UserBase):
    id: str
    avatar: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    email_verified: bool
    is_active: bool
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class TokenData(BaseModel):
    user_id: str
    email: str
    role: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    grade_level: Optional[str] = None
    number_of_children: Optional[str] = None
    subjects: Optional[str] = None
    position: Optional[str] = None