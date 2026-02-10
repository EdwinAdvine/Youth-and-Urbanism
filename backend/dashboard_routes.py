#!/usr/bin/env python3
"""
Dashboard routes for the multi-role authentication system.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from auth import utils, crud
from database.connection import get_db
from auth.schemas import TokenData

router = APIRouter()
templates = Jinja2Templates(directory="templates")

def get_current_user_from_token(token: str, db: Session):
    """Get current user from JWT token"""
    try:
        token_data = utils.verify_token(token)
        user = crud.get_user_by_id(db, token_data["user_id"])
        if user is None:
            return None
        return user
    except Exception:
        return None

@router.get("/admin/dashboard", response_class=HTMLResponse)
async def admin_dashboard(request: Request, db: Session = Depends(get_db)):
    """Administrator dashboard"""
    # Get token from cookies or headers
    token = request.cookies.get("access_token") or request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        return templates.TemplateResponse("login.html", {"request": request, "error": "Please log in first"})
    
    user = get_current_user_from_token(token, db)
    if not user or user.user_role != "administrator":
        return templates.TemplateResponse("login.html", {"request": request, "error": "Access denied"})
    
    # Get user profile
    user_data = crud.get_user_with_profile(db, user.id)
    
    return templates.TemplateResponse("admin_dashboard.html", {
        "request": request,
        "user": user_data["user"],
        "profile": user_data["profile"],
        "title": "Administrator Dashboard"
    })

@router.get("/staff/dashboard", response_class=HTMLResponse)
async def staff_dashboard(request: Request, db: Session = Depends(get_db)):
    """Staff dashboard"""
    # Get token from cookies or headers
    token = request.cookies.get("access_token") or request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        return templates.TemplateResponse("login.html", {"request": request, "error": "Please log in first"})
    
    user = get_current_user_from_token(token, db)
    if not user or user.user_role != "staff":
        return templates.TemplateResponse("login.html", {"request": request, "error": "Access denied"})
    
    # Get user profile
    user_data = crud.get_user_with_profile(db, user.id)
    
    return templates.TemplateResponse("staff_dashboard.html", {
        "request": request,
        "user": user_data["user"],
        "profile": user_data["profile"],
        "title": "Staff Dashboard"
    })

@router.get("/external/dashboard", response_class=HTMLResponse)
async def external_instructor_dashboard(request: Request, db: Session = Depends(get_db)):
    """External instructor dashboard"""
    # Get token from cookies or headers
    token = request.cookies.get("access_token") or request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        return templates.TemplateResponse("login.html", {"request": request, "error": "Please log in first"})
    
    user = get_current_user_from_token(token, db)
    if not user or user.user_role != "external_instructor":
        return templates.TemplateResponse("login.html", {"request": request, "error": "Access denied"})
    
    # Get user profile
    user_data = crud.get_user_with_profile(db, user.id)
    
    return templates.TemplateResponse("external_dashboard.html", {
        "request": request,
        "user": user_data["user"],
        "profile": user_data["profile"],
        "title": "External Instructor Dashboard"
    })

@router.get("/parent/dashboard", response_class=HTMLResponse)
async def parent_dashboard(request: Request, db: Session = Depends(get_db)):
    """Parent dashboard"""
    # Get token from cookies or headers
    token = request.cookies.get("access_token") or request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        return templates.TemplateResponse("login.html", {"request": request, "error": "Please log in first"})
    
    user = get_current_user_from_token(token, db)
    if not user or user.user_role != "parent":
        return templates.TemplateResponse("login.html", {"request": request, "error": "Access denied"})
    
    # Get user profile
    user_data = crud.get_user_with_profile(db, user.id)
    
    return templates.TemplateResponse("parent_dashboard.html", {
        "request": request,
        "user": user_data["user"],
        "profile": user_data["profile"],
        "title": "Parent Dashboard"
    })

@router.get("/student/dashboard", response_class=HTMLResponse)
async def student_dashboard(request: Request, db: Session = Depends(get_db)):
    """Student dashboard"""
    # Get token from cookies or headers
    token = request.cookies.get("access_token") or request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        return templates.TemplateResponse("login.html", {"request": request, "error": "Please log in first"})
    
    user = get_current_user_from_token(token, db)
    if not user or user.user_role != "student":
        return templates.TemplateResponse("login.html", {"request": request, "error": "Access denied"})
    
    # Get user profile
    user_data = crud.get_user_with_profile(db, user.id)
    
    return templates.TemplateResponse("student_dashboard.html", {
        "request": request,
        "user": user_data["user"],
        "profile": user_data["profile"],
        "title": "Student Dashboard"
    })