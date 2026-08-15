"""SavedCreator schemas."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SavedCreatorResponse(BaseModel):
    id: int
    brand_id: int
    creator_id: int
    created_at: datetime
    # Populated from JOIN
    creator_name: Optional[str] = None
    creator_image: Optional[str] = None
    creator_niche: Optional[str] = None
    creator_bio: Optional[str] = None
    creator_skills: Optional[str] = None
    creator_is_available: Optional[bool] = None

    class Config:
        from_attributes = True
