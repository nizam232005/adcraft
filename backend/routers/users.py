"""
Users Router — Public profile viewing and profile updates.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from database import get_db
from models.user import User
from schemas.user import UserResponse, UserProfileUpdate
from auth import get_current_user
from services.cloudinary_service import upload_file

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/creators", response_model=list[UserResponse])
def get_creators(
    search: Optional[str] = None,
    niche: Optional[str] = None,
    available: Optional[bool] = None,
    language: Optional[str] = None,
    experience_min: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """List and search all creators — supports advanced filtering for brand discovery."""
    query = db.query(User).filter(User.role == "creator")

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                User.name.ilike(pattern),
                User.bio.ilike(pattern),
                User.skills.ilike(pattern),
                User.niche.ilike(pattern),
                User.location.ilike(pattern),
            )
        )
    if niche:
        query = query.filter(User.niche.ilike(f"%{niche}%"))
    if available is not None:
        query = query.filter(User.is_available_for_work == available)
    if language:
        query = query.filter(User.languages.ilike(f"%{language}%"))
    if experience_min is not None:
        query = query.filter(User.experience_years >= experience_min)

    return [UserResponse.model_validate(u) for u in query.order_by(User.created_at.desc()).all()]


@router.get("/{user_id}", response_model=UserResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Get a user's public profile."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserResponse.model_validate(user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current user's profile (JSON body)."""
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/profile/upload-image", response_model=UserResponse)
async def upload_profile_image(
    image_type: str = Form(...),  # "profile" or "cover"
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a profile or cover image to Cloudinary."""
    url = await upload_file(file, folder="adcraft/profiles", resource_type="image")
    if image_type == "cover":
        current_user.cover_image = url
    else:
        current_user.profile_image = url
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)

