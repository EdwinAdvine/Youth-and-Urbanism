from sqlalchemy import Column, String, Boolean, TIMESTAMP, Integer, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # student, parent, instructor, partner, admin
    avatar = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    last_login = Column(TIMESTAMP, nullable=True)
    email_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True, index=True)
    
    # Relationships
    student_profile = relationship("Student", back_populates="user", uselist=False)
    parent_profile = relationship("Parent", back_populates="user", uselist=False)
    instructor_profile = relationship("Instructor", back_populates="user", uselist=False)
    partner_profile = relationship("Partner", back_populates="user", uselist=False)
    admin_profile = relationship("Admin", back_populates="user", uselist=False)

class Student(Base):
    __tablename__ = 'students'
    
    user_id = Column(String(36), ForeignKey('users.id'), primary_key=True)
    grade_level = Column(String(50), nullable=True)
    
    # Relationship back to User
    user = relationship("User", back_populates="student_profile")

class Parent(Base):
    __tablename__ = 'parents'
    
    user_id = Column(String(36), ForeignKey('users.id'), primary_key=True)
    number_of_children = Column(String(20), nullable=True)
    
    # Relationship back to User
    user = relationship("User", back_populates="parent_profile")

class Instructor(Base):
    __tablename__ = 'instructors'
    
    user_id = Column(String(36), ForeignKey('users.id'), primary_key=True)
    subjects = Column(String(500), nullable=True)
    
    # Relationship back to User
    user = relationship("User", back_populates="instructor_profile")

class Partner(Base):
    __tablename__ = 'partners'
    
    user_id = Column(String(36), ForeignKey('users.id'), primary_key=True)
    position = Column(String(255), nullable=True)
    
    # Relationship back to User
    user = relationship("User", back_populates="partner_profile")

class Admin(Base):
    __tablename__ = 'admins'
    
    user_id = Column(String(36), ForeignKey('users.id'), primary_key=True)
    position = Column(String(255), nullable=True)
    
    # Relationship back to User
    user = relationship("User", back_populates="admin_profile")