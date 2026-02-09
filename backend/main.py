from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
# Add the backend directory to Python path
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

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
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3004",  # Frontend URL (current development port)
        "http://127.0.0.1:3004"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    message: str

# Import authentication routes
from auth.endpoints import router as auth_router
app.include_router(auth_router, prefix="/api")

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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
