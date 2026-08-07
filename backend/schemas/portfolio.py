"""Portfolio schemas — Creator portfolio items."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PortfolioCreate(BaseModel):
    title: str
    description: Optional[str] = None
    media_url: str
    media_type: str  # "image" or "video"


class PortfolioResponse(BaseModel):
    id: int
    creator_id: int
    title: str
    description: Optional[str] = None
    media_url: str
    media_type: str
    created_at: datetime

    class Config:
        from_attributes = True
