from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enums import NotificationChannel, DeliveryStatus


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    query_id = Column(Integer, ForeignKey("queries.id", ondelete="SET NULL"), nullable=True, index=True)
    type = Column(String(50), nullable=False)
    channel = Column(Enum(NotificationChannel), default=NotificationChannel.DASHBOARD, nullable=False)
    message = Column(String(1000), nullable=False)
    status = Column(Enum(DeliveryStatus), default=DeliveryStatus.SENT, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    attempts = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    __table_args__ = (
        Index("ix_notifications_user_read", "user_id", "is_read"),
    )

    user = relationship("User", back_populates="notifications")
    query = relationship("Query")
