"""
AdCraft Lite — Application Configuration

Loads environment variables using Pydantic BaseSettings.
All secrets come from .env file or environment variables.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # Ignore extra env vars like VITE_API_URL in .env
    )

    # Database
    DATABASE_URL: str = "sqlite:///./adcraft.db"

    # JWT
    JWT_SECRET: str = "change-this-to-a-secure-secret-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    # Gemini AI
    GEMINI_API_KEY: Optional[str] = None

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"


settings = Settings()
