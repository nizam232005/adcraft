"""Submission schemas — Creator work submissions."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SubmissionCreate(BaseModel):
    application_id: int
    media_url: str
    media_type: str  # "image" or "video"


class SubmissionResponse(BaseModel):
    id: int
    application_id: int
    media_url: str
    media_type: str
    created_at: datetime

    class Config:
        from_attributes = True
