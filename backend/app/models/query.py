from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, Enum, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enums import QueryChannel, QueryStatus, PriorityLevel


class Query(Base):
    __tablename__ = "queries"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    dept_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True)
    subject = Column(String(255), nullable=True)
    channel = Column(Enum(QueryChannel), default=QueryChannel.WEB_FORM, nullable=False, index=True)
    external_id = Column(String(255), nullable=True, index=True)
    text = Column(Text, nullable=False)
    status = Column(Enum(QueryStatus), default=QueryStatus.PENDING, nullable=False, index=True)
    priority = Column(Enum(PriorityLevel), default=PriorityLevel.MEDIUM, nullable=False)
    confidence = Column(Float, nullable=True)
    needs_review = Column(Boolean, default=False, nullable=False)
    language = Column(String(10), default="en", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint('channel', 'external_id', name='uq_channel_external_id'),
    )

    student = relationship("User", foreign_keys=[student_id], back_populates="queries_submitted")
    department = relationship("Department", back_populates="queries")
    course = relationship("Course", back_populates="queries")
    routes = relationship("Route", back_populates="query", cascade="all, delete-orphan")
    replies = relationship("Reply", back_populates="query", cascade="all, delete-orphan")
    ai_drafts = relationship("AIDraft", back_populates="query", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="query", cascade="all, delete-orphan")
    escalations = relationship("Escalation", back_populates="query", cascade="all, delete-orphan")
