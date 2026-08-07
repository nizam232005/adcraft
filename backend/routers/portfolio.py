"""
Portfolio Router — Creator portfolio management.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from database import get_db
from models.portfolio import Portfolio
from models.user import User
from schemas.portfolio import PortfolioCreate, PortfolioResponse
from auth import get_current_user, require_role
from services.cloudinary_service import upload_file

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])


@router.post("/", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def add_portfolio_item(
    title: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("creator")),
    db: Session = Depends(get_db),
):
    """Add a portfolio item (Creator only). Uploads file to Cloudinary."""
    # Determine media type
    content_type = file.content_type or ""
    if content_type.startswith("video"):
        media_type = "video"
        resource_type = "video"
    else:
        media_type = "image"
        resource_type = "image"

    media_url = await upload_file(file, folder="adcraft/portfolio", resource_type=resource_type)

    portfolio = Portfolio(
        creator_id=current_user.id,
        title=title,
        description=description,
        media_url=media_url,
        media_type=media_type,
    )
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return PortfolioResponse.model_validate(portfolio)


@router.get("/user/{user_id}", response_model=list[PortfolioResponse])
def get_user_portfolio(user_id: int, db: Session = Depends(get_db)):
    """Get all portfolio items for a user."""
    items = db.query(Portfolio).filter(
        Portfolio.creator_id == user_id
    ).order_by(Portfolio.created_at.desc()).all()
    return [PortfolioResponse.model_validate(i) for i in items]


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio_item(
    portfolio_id: int,
    current_user: User = Depends(require_role("creator")),
    db: Session = Depends(get_db),
):
    """Delete a portfolio item (owner only)."""
    item = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.creator_id == current_user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio item not found")

    db.delete(item)
    db.commit()
