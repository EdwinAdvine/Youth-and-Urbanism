"""
Urban Home School - Backend Entry Point

This is the main entry point for running the FastAPI application.
It imports the FastAPI app from app.main and runs it with uvicorn.

Usage:
    python main.py                    # Run with default settings
    uvicorn main:app --reload         # Run with uvicorn directly
"""

import os
import sys

# Add the backend directory to the Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app  # noqa: E402

# Re-export app for uvicorn
__all__ = ["app"]


if __name__ == "__main__":
    import uvicorn

    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "True").lower() == "true"

    # Run the application
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info",
    )