"""Project model — Advertisement projects created by Brand Owners."""

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, func
from database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    product_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    target_audience = Column(String(255), nullable=True)
    platform = Column(String(50), nullable=False)  # "instagram", "facebook", "youtube"
    budget = Column(Float, nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=True)
    reference_image_url = Column(String(500), nullable=True)
    status = Column(String(30), nullable=False, default="open")  # open, in_progress, completed, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
