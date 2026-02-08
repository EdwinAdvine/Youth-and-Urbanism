from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Urban Home School API",
    description="Backend API for Urban Home School application",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    message: str

class Student(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    grade: str
    active: bool = True

# In-memory storage for demo (replace with database in production)
students_db = [
    Student(id=1, name="John Doe", email="john@example.com", grade="10"),
    Student(id=2, name="Jane Smith", email="jane@example.com", grade="11"),
]

@app.get("/")
async def root():
    return {"message": "Welcome to Urban Home School API"}

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Urban Home School API is running successfully"
    )

@app.get("/api/students", response_model=List[Student])
async def get_students():
    """Get all students"""
    return students_db

@app.get("/api/students/{student_id}", response_model=Student)
async def get_student(student_id: int):
    """Get a specific student by ID"""
    for student in students_db:
        if student.id == student_id:
            return student
    return {"error": "Student not found"}

@app.post("/api/students", response_model=Student)
async def create_student(student: Student):
    """Create a new student"""
    # Generate ID
    if students_db:
        student.id = max(s.id for s in students_db) + 1
    else:
        student.id = 1
    
    students_db.append(student)
    return student

@app.put("/api/students/{student_id}", response_model=Student)
async def update_student(student_id: int, updated_student: Student):
    """Update an existing student"""
    for i, student in enumerate(students_db):
        if student.id == student_id:
            students_db[i] = updated_student
            students_db[i].id = student_id  # Keep original ID
            return students_db[i]
    return {"error": "Student not found"}

@app.delete("/api/students/{student_id}")
async def delete_student(student_id: int):
    """Delete a student"""
    for i, student in enumerate(students_db):
        if student.id == student_id:
            deleted_student = students_db.pop(i)
            return {"message": f"Student {deleted_student.name} deleted successfully"}
    return {"error": "Student not found"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)