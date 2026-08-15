"""SavedCreator model — Brands save/bookmark creators they like."""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, func, UniqueConstraint
from database import Base


class SavedCreator(Base):
    __tablename__ = "saved_creators"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("brand_id", "creator_id", name="uq_saved_creator"),
    )
