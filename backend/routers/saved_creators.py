"""
Saved Creators Router — Brands save/unsave creator profiles.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.saved_creator import SavedCreator
from models.user import User
from schemas.saved_creator import SavedCreatorResponse
from auth import get_current_user, require_role

router = APIRouter(prefix="/api/saved-creators", tags=["Saved Creators"])


@router.get("/", response_model=list[SavedCreatorResponse])
def get_saved_creators(
    current_user: User = Depends(require_role("brand_owner")),
    db: Session = Depends(get_db),
):
    """Get all creators saved by this brand."""
    rows = db.query(SavedCreator).filter(SavedCreator.brand_id == current_user.id).all()
    result = []
    for row in rows:
        creator = db.query(User).filter(User.id == row.creator_id).first()
        resp = SavedCreatorResponse.model_validate(row)
        if creator:
            resp.creator_name = creator.name
            resp.creator_image = creator.profile_image
            resp.creator_niche = creator.niche
            resp.creator_bio = creator.bio
            resp.creator_skills = creator.skills
            resp.creator_is_available = creator.is_available_for_work
        result.append(resp)
    return result


@router.post("/{creator_id}", status_code=status.HTTP_201_CREATED)
def save_creator(
    creator_id: int,
    current_user: User = Depends(require_role("brand_owner")),
    db: Session = Depends(get_db),
):
    """Save a creator to the brand's saved list."""
    creator = db.query(User).filter(User.id == creator_id, User.role == "creator").first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    existing = db.query(SavedCreator).filter(
        SavedCreator.brand_id == current_user.id,
        SavedCreator.creator_id == creator_id,
    ).first()
    if existing:
        return {"message": "Already saved"}

    saved = SavedCreator(brand_id=current_user.id, creator_id=creator_id)
    db.add(saved)
    db.commit()
    return {"message": "Creator saved"}


@router.delete("/{creator_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsave_creator(
    creator_id: int,
    current_user: User = Depends(require_role("brand_owner")),
    db: Session = Depends(get_db),
):
    """Remove a creator from the brand's saved list."""
    row = db.query(SavedCreator).filter(
        SavedCreator.brand_id == current_user.id,
        SavedCreator.creator_id == creator_id,
    ).first()
    if row:
        db.delete(row)
        db.commit()


@router.get("/check/{creator_id}")
def is_creator_saved(
    creator_id: int,
    current_user: User = Depends(require_role("brand_owner")),
    db: Session = Depends(get_db),
):
    """Check if a creator is saved by this brand."""
    exists = db.query(SavedCreator).filter(
        SavedCreator.brand_id == current_user.id,
        SavedCreator.creator_id == creator_id,
    ).first()
    return {"saved": bool(exists)}
