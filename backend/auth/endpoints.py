from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
from auth import schemas, crud, utils
from database.connection import get_db
from database.models import User

router = APIRouter()
security = HTTPBearer()

@router.post("/auth/register", response_model=schemas.UserResponse)
async def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Validate role-specific fields
    if user.role == "student" and not user.grade_level:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Grade level is required for students"
        )
    elif user.role == "parent" and not user.number_of_children:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Number of children is required for parents"
        )
    elif user.role == "instructor" and not user.subjects:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subjects are required for instructors"
        )
    elif user.role in ["partner", "admin"] and not user.position:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Position is required for partners and admins"
        )
    
    # Create user
    db_user = crud.create_user(db, user)
    return db_user

@router.post("/auth/login", response_model=schemas.Token)
async def login_user(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token"""
    user = crud.authenticate_user(db, user_login.email, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    crud.update_last_login(db, user.id)
    
    # Create access token
    access_token_expires = None
    if user_login.remember_me:
        # Longer expiration for "remember me"
        access_token_expires = utils.timedelta(days=30)
    
    access_token = utils.create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": utils.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.get("/auth/me", response_model=schemas.UserResponse)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user information"""
    token_data = utils.verify_token(credentials.credentials)
    user = crud.get_user_by_id(db, token_data["user_id"])
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/auth/profile", response_model=schemas.UserResponse)
async def update_profile(
    profile_update: schemas.UserProfileUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    token_data = utils.verify_token(credentials.credentials)
    user = crud.update_user_profile(db, token_data["user_id"], profile_update)
    return user

@router.get("/auth/users", response_model=List[schemas.UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    token_data = utils.verify_token(credentials.credentials)
    
    # Check if user is admin
    user = crud.get_user_by_id(db, token_data["user_id"])
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@router.delete("/auth/users/{user_id}")
async def delete_user(
    user_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Delete a user (admin only)"""
    token_data = utils.verify_token(credentials.credentials)
    
    # Check if user is admin
    admin_user = crud.get_user_by_id(db, token_data["user_id"])
    if admin_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Prevent admin from deleting themselves
    if user_id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    crud.delete_user(db, user_id)
    return {"message": "User deleted successfully"}

@router.post("/auth/reset-password")
async def reset_password_request(reset_request: schemas.PasswordResetRequest):
    """Request password reset (placeholder - would need email service)"""
    # This would typically send an email with a reset token
    # For now, we'll just return a success message
    return {"message": "Password reset email sent (placeholder)"}

@router.post("/auth/reset-password/confirm")
async def reset_password_confirm(reset_confirm: schemas.PasswordResetConfirm):
    """Confirm password reset (placeholder)"""
    # This would verify the token and update the password
    # For now, we'll just return a success message
    return {"message": "Password reset successful (placeholder)"}