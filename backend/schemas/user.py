"""User schemas — Registration, login, profile."""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # "brand_owner" or "creator"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    profile_image: Optional[str] = None
    # New creator discovery fields
    cover_image: Optional[str] = None
    location: Optional[str] = None
    languages: Optional[str] = None
    niche: Optional[str] = None
    is_available_for_work: Optional[bool] = None
    social_instagram: Optional[str] = None
    social_tiktok: Optional[str] = None
    social_youtube: Optional[str] = None
    pricing_info: Optional[str] = None
    experience_years: Optional[int] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    profile_image: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    created_at: datetime
    # New creator discovery fields
    cover_image: Optional[str] = None
    location: Optional[str] = None
    languages: Optional[str] = None
    niche: Optional[str] = None
    is_available_for_work: Optional[bool] = True
    social_instagram: Optional[str] = None
    social_tiktok: Optional[str] = None
    social_youtube: Optional[str] = None
    pricing_info: Optional[str] = None
    rating: Optional[float] = None
    experience_years: Optional[int] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

