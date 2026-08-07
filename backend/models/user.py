"""User model — Brand Owners and Creators."""

from sqlalchemy import Column, Integer, String, Text, DateTime, func
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
    skills = Column(Text, nullable=True)  # Comma-separated or JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
