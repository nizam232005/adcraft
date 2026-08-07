"""Application schemas — Creator proposals."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ApplicationCreate(BaseModel):
    project_id: int
    proposal: str
    delivery_days: int


class ApplicationStatusUpdate(BaseModel):
    status: str  # "accepted" or "rejected"


class ApplicationResponse(BaseModel):
    id: int
    project_id: int
    creator_id: int
    proposal: str
    delivery_days: int
    status: str
    created_at: datetime
    creator_name: Optional[str] = None
    creator_image: Optional[str] = None
    project_title: Optional[str] = None
    project_budget: Optional[float] = None
    project_platform: Optional[str] = None

    class Config:
        from_attributes = True
