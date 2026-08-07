"""Portfolio model — Creator portfolio items (images/videos)."""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from database import Base


class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    media_url = Column(String(500), nullable=False)
    media_type = Column(String(20), nullable=False)  # "image" or "video"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
