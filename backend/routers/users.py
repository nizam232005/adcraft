"""
Users Router — Public profile viewing and profile updates.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.user import UserResponse, UserProfileUpdate
from auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/creators", response_model=list[UserResponse])
def get_creators(
    search: str = None,
    db: Session = Depends(get_db),
):
    """List and search all creators (for brand owners looking for talent)."""
    query = db.query(User).filter(User.role == "creator")
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (User.name.ilike(pattern)) |
            (User.bio.ilike(pattern)) |
            (User.skills.ilike(pattern))
        )
    return [UserResponse.model_validate(u) for u in query.order_by(User.created_at.desc()).all()]


@router.get("/{user_id}", response_model=UserResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Get a user's public profile (for brand owners viewing creators)."""
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
    """Update the current user's profile."""
    if data.name is not None:
        current_user.name = data.name
    if data.bio is not None:
        current_user.bio = data.bio
    if data.skills is not None:
        current_user.skills = data.skills
    if data.profile_image is not None:
        current_user.profile_image = data.profile_image

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
