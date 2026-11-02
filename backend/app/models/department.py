from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    contact_email = Column(String(255), nullable=True)
    hod_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    hod = relationship("User", foreign_keys=[hod_id])
    members = relationship("User", foreign_keys="User.dept_id", back_populates="department")
    courses = relationship("Course", back_populates="department", cascade="all, delete-orphan")
    queries = relationship("Query", back_populates="department")
    routing_rules = relationship("RoutingRule", back_populates="department")
