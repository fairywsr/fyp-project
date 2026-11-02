from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.enums import EscalationReason


class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("queries.id", ondelete="CASCADE"), nullable=False, index=True)
    reason = Column(Enum(EscalationReason), default=EscalationReason.SLA_24H, nullable=False)
    escalated_to = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    escalated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    resolved_at = Column(DateTime, nullable=True)

    query = relationship("Query", back_populates="escalations")
    assignee = relationship("User", foreign_keys=[escalated_to])
    initiator = relationship("User", foreign_keys=[escalated_by])
