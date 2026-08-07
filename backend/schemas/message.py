"""Message schemas — Project chat messages."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MessageCreate(BaseModel):
    project_id: int
    message: str


class MessageResponse(BaseModel):
    id: int
    project_id: int
    sender_id: int
    message: str
    created_at: datetime
    sender_name: Optional[str] = None
    sender_image: Optional[str] = None

    class Config:
        from_attributes = True
