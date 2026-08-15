"""DirectMessage schemas — User-to-user direct messaging."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DirectMessageCreate(BaseModel):
    receiver_id: int
    content: str


class DirectMessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: datetime
    # Populated from JOIN
    sender_name: Optional[str] = None
    sender_image: Optional[str] = None
    receiver_name: Optional[str] = None
    receiver_image: Optional[str] = None

    class Config:
        from_attributes = True


class ConversationSummary(BaseModel):
    """Summary of a conversation thread shown in the DM inbox."""
    other_user_id: int
    other_user_name: str
    other_user_image: Optional[str] = None
    other_user_role: str
    last_message: str
    last_message_at: datetime
    unread_count: int
