"""User model — Brand Owners and Creators."""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # "brand_owner" or "creator"
    profile_image = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)  # Comma-separated
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # --- Creator Discovery fields ---
    cover_image = Column(String(500), nullable=True)       # Banner / cover photo
    location = Column(String(150), nullable=True)          # City, Country
    languages = Column(Text, nullable=True)                # Comma-separated
    niche = Column(String(100), nullable=True)             # Primary niche e.g. "Fashion & Beauty"
    is_available_for_work = Column(Boolean, default=True)  # "Available for Work" badge
    social_instagram = Column(String(255), nullable=True)
    social_tiktok = Column(String(255), nullable=True)
    social_youtube = Column(String(255), nullable=True)
    pricing_info = Column(Text, nullable=True)             # Free-text pricing description
    rating = Column(Float, nullable=True)                  # Average rating (0-5)
    experience_years = Column(Integer, nullable=True)      # Years of experience
