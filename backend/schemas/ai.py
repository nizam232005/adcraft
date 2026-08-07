"""AI schemas — Gemini description generation."""

from pydantic import BaseModel
from typing import Optional


class AIDescriptionRequest(BaseModel):
    product_name: str
    target_audience: str
    platform: str


class AIDescriptionResponse(BaseModel):
    description: str
    marketing_tone: str
    call_to_action: str
