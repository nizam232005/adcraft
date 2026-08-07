"""
AdCraft Lite — FastAPI Application Entry Point

Mounts all routers, configures CORS, and creates database tables.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from config import settings

# Import all models so they're registered with Base.metadata
import models  # noqa: F401

# Import routers
from routers import auth, users, projects, applications, submissions, messages, portfolio, ai

from fastapi.staticfiles import StaticFiles
import os

# Create FastAPI app
app = FastAPI(
    title="AdCraft Lite API",
    description="AI-Powered Advertisement Marketplace",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Ensure local uploads directory exists and mount static route
uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# CORS middleware — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(applications.router)
app.include_router(submissions.router)
app.include_router(messages.router)
app.include_router(portfolio.router)
app.include_router(ai.router)


@app.on_event("startup")
def on_startup():
    """Create all database tables on startup (fallback if Alembic isn't used)."""
    Base.metadata.create_all(bind=engine)


@app.get("/", tags=["Health"])
def health_check():
    """API health check endpoint."""
    return {"status": "healthy", "app": "AdCraft Lite", "version": "1.0.0"}


@app.get("/api/health", tags=["Health"])
def api_health():
    """API health check."""
    return {"status": "ok"}
