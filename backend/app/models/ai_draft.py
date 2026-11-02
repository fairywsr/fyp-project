from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Text, String, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enums import AIDraftStatus


class AIDraft(Base):
    __tablename__ = "ai_drafts"

    id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("queries.id", ondelete="CASCADE"), nullable=False, index=True)
    body = Column(Text, nullable=False)
    model = Column(String(100), nullable=False)
    status = Column(Enum(AIDraftStatus), default=AIDraftStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    query = relationship("Query", back_populates="ai_drafts")
