from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enums import RouteMethod


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("queries.id", ondelete="CASCADE"), nullable=False, index=True)
    dept_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    method = Column(Enum(RouteMethod), default=RouteMethod.AI, nullable=False)
    reason = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    query = relationship("Query", back_populates="routes")
    department = relationship("Department")
    course = relationship("Course")
    assignee = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_routes")


# (venv) PS C:\Users\USER\Downloads\fyp\fyp-project\backend> uvicorn app.main:app --reload