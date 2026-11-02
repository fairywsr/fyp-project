from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base


class Reply(Base):
    __tablename__ = "replies"

    id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("queries.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    body = Column(Text, nullable=False)
    is_draft = Column(Boolean, default=False, nullable=False)
    ai_draft_id = Column(Integer, ForeignKey("ai_drafts.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    query = relationship("Query", back_populates="replies")
    author = relationship("User", back_populates="replies")
    ai_draft = relationship("AIDraft")
    attachments = relationship("Attachment", back_populates="reply")
