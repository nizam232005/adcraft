"""Project schemas — Create, update, and response models."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProjectCreate(BaseModel):
    title: str
    product_name: str
    description: str
    target_audience: Optional[str] = None
    platform: str
    budget: float
    deadline: Optional[datetime] = None
    reference_image_url: Optional[str] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    product_name: Optional[str] = None
    description: Optional[str] = None
    target_audience: Optional[str] = None
    platform: Optional[str] = None
    budget: Optional[float] = None
    deadline: Optional[datetime] = None
    reference_image_url: Optional[str] = None
    status: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    owner_id: int
    title: str
    product_name: str
    description: str
    target_audience: Optional[str] = None
    platform: str
    budget: float
    deadline: Optional[datetime] = None
    reference_image_url: Optional[str] = None
    status: str
    created_at: datetime
    application_count: Optional[int] = 0
    owner_name: Optional[str] = None

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]
    total: int
    page: int
    pages: int
