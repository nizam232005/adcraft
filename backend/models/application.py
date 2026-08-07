"""Application model — Creator applications to projects."""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    proposal = Column(Text, nullable=False)
    delivery_days = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # pending, accepted, rejected, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
