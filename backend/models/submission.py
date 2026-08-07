"""Submission model — Work submitted by creators for accepted applications."""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    media_url = Column(String(500), nullable=False)
    media_type = Column(String(20), nullable=False)  # "image" or "video"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
