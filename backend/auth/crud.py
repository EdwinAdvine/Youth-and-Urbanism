from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from typing import Optional, List
from datetime import datetime, timezone

from auth import schemas, utils
from database.models import User, Student, Parent, Instructor, Partner, Admin

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate) -> User:
    """Create a new user with role-specific profile"""
    # Validate password strength
    is_valid, error_message = utils.validate_password_strength(user.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    
    # Hash password
    hashed_password = utils.hash_password(user.password)
    
    # Create user
    db_user = User(
        email=user.email,
        password_hash=hashed_password,
        name=user.name,
        role=user.role
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create role-specific profile
        if user.role == "student":
            student_profile = Student(
                user_id=db_user.id,
                grade_level=user.grade_level
            )
            db.add(student_profile)
        elif user.role == "parent":
            parent_profile = Parent(
                user_id=db_user.id,
                number_of_children=user.number_of_children
            )
            db.add(parent_profile)
        elif user.role == "instructor":
            instructor_profile = Instructor(
                user_id=db_user.id,
                subjects=user.subjects
            )
            db.add(instructor_profile)
        elif user.role == "partner":
            partner_profile = Partner(
                user_id=db_user.id,
                position=user.position
            )
            db.add(partner_profile)
        elif user.role == "admin":
            admin_profile = Admin(
                user_id=db_user.id,
                position=user.position
            )
            db.add(admin_profile)
        
        db.commit()
        return db_user
        
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not utils.verify_password(password, user.password_hash):
        return None
    return user

def update_last_login(db: Session, user_id: str):
    """Update user's last login time"""
    user = get_user_by_id(db, user_id)
    if user:
        user.last_login = datetime.now(timezone.utc)
        db.commit()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Get all users with pagination"""
    return db.query(User).offset(skip).limit(limit).all()

def update_user_profile(db: Session, user_id: str, profile_update: schemas.UserProfileUpdate) -> User:
    """Update user profile and role-specific information"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update basic user fields
    if profile_update.name:
        user.name = profile_update.name
    if profile_update.avatar:
        user.avatar = profile_update.avatar
    
    # Update role-specific fields
    if user.role == "student" and profile_update.grade_level:
        student = db.query(Student).filter(Student.user_id == user_id).first()
        if student:
            student.grade_level = profile_update.grade_level
    elif user.role == "parent" and profile_update.number_of_children:
        parent = db.query(Parent).filter(Parent.user_id == user_id).first()
        if parent:
            parent.number_of_children = profile_update.number_of_children
    elif user.role == "instructor" and profile_update.subjects:
        instructor = db.query(Instructor).filter(Instructor.user_id == user_id).first()
        if instructor:
            instructor.subjects = profile_update.subjects
    elif user.role in ["partner", "admin"] and profile_update.position:
        if user.role == "partner":
            partner = db.query(Partner).filter(Partner.user_id == user_id).first()
            if partner:
                partner.position = profile_update.position
        else:
            admin = db.query(Admin).filter(Admin.user_id == user_id).first()
            if admin:
                admin.position = profile_update.position
    
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: str):
    """Delete user and associated role-specific profile"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Delete role-specific profile
    if user.role == "student":
        db.query(Student).filter(Student.user_id == user_id).delete()
    elif user.role == "parent":
        db.query(Parent).filter(Parent.user_id == user_id).delete()
    elif user.role == "instructor":
        db.query(Instructor).filter(Instructor.user_id == user_id).delete()
    elif user.role == "partner":
        db.query(Partner).filter(Partner.user_id == user_id).delete()
    elif user.role == "admin":
        db.query(Admin).filter(Admin.user_id == user_id).delete()
    
    # Delete user
    db.delete(user)
    db.commit()