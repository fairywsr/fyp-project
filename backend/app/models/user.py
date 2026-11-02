from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enums import UserRole, UserAvailability


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False, index=True)
    dept_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    phone = Column(String(50), unique=True, index=True, nullable=True)
    google_sub = Column(String(255), unique=True, index=True, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    availability = Column(Enum(UserAvailability), default=UserAvailability.AVAILABLE, nullable=False)
    auto_reply_enabled = Column(Boolean, default=False, nullable=False)
    auto_reply_message = Column(String(1000), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    department = relationship("Department", foreign_keys=[dept_id], back_populates="members")
    queries_submitted = relationship("Query", back_populates="student", foreign_keys="Query.student_id")
    assigned_routes = relationship("Route", back_populates="assignee", foreign_keys="Route.assigned_to")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    replies = relationship("Reply", back_populates="author")
