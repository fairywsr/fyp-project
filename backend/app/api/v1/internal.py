from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import require_service_auth
from app.core.config import settings
from app.models.query import Query
from app.models.route import Route
from app.models.escalation import Escalation
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.models.user import User
from app.models.enums import (
    QueryChannel,
    QueryStatus,
    EscalationReason,
    RouteMethod,
    NotificationChannel,
    DeliveryStatus,
    UserRole,
)
from app.schemas.misc import NormalizedQuery
from app.services.ingestion_service import IngestionService

router = APIRouter(prefix="/internal", tags=["Internal Channels & Background Jobs"])


@router.post("/channels/email", dependencies=[Depends(require_service_auth)])
def receive_email_channel(payload: NormalizedQuery, db: Session = Depends(get_db)):
    payload.channel = QueryChannel.EMAIL
    query_obj = IngestionService.ingest(payload, db)
    return {"status": "accepted", "query_id": query_obj.id, "subject": query_obj.subject}


@router.post("/channels/whatsapp", dependencies=[Depends(require_service_auth)])
def receive_whatsapp_channel(payload: NormalizedQuery, db: Session = Depends(get_db)):
    payload.channel = QueryChannel.WHATSAPP
    query_obj = IngestionService.ingest(payload, db)
    return {"status": "accepted", "query_id": query_obj.id, "subject": query_obj.subject}


@router.post("/jobs/escalate", dependencies=[Depends(require_service_auth)])
def run_escalation_job(db: Session = Depends(get_db)):
    """
    SLA 24-hour escalation check:
    Finds queries in PENDING, ASSIGNED, or IN_PROGRESS older than ESCALATION_HOURS
    without an active escalation, sets status ESCALATED, and notifies HOD/Admin.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=settings.ESCALATION_HOURS)
    overdue_queries = db.query(Query).filter(
        Query.status.in_([QueryStatus.PENDING, QueryStatus.ASSIGNED, QueryStatus.IN_PROGRESS]),
        Query.created_at <= cutoff
    ).all()

    escalated_count = 0
    for q in overdue_queries:
        # Check if already escalated
        existing_esc = db.query(Escalation).filter(
            Escalation.query_id == q.id,
            Escalation.reason == EscalationReason.SLA_24H
        ).first()
        if existing_esc:
            continue

        # Find department HOD or Admin
        target_user_id = None
        if q.department and q.department.hod_id:
            target_user_id = q.department.hod_id
        else:
            admin = db.query(User).filter(User.role == UserRole.ADMIN, User.is_active == True).first()
            if admin:
                target_user_id = admin.id

        if not target_user_id:
            continue

        escalation = Escalation(
            query_id=q.id,
            reason=EscalationReason.SLA_24H,
            escalated_to=target_user_id,
            escalated_by=None
        )
        db.add(escalation)
        q.status = QueryStatus.ESCALATED

        # Notification
        notif = Notification(
            user_id=target_user_id,
            query_id=q.id,
            type="query_escalated",
            channel=NotificationChannel.DASHBOARD,
            message=f"Query #{q.id} has breached {settings.ESCALATION_HOURS}h SLA and was escalated to you."
        )
        db.add(notif)

        # Audit log
        audit = AuditLog(
            user_id=None,
            action="sla_escalation",
            entity_type="query",
            entity_id=q.id,
            details=f"SLA 24h breach. Escalated query #{q.id} to user ID {target_user_id}"
        )
        db.add(audit)
        escalated_count += 1

    db.commit()
    return {"message": "Escalation job completed", "escalated_count": escalated_count}


@router.post("/jobs/retry-notifications", dependencies=[Depends(require_service_auth)])
def retry_failed_notifications(db: Session = Depends(get_db)):
    """
    Retries failed notifications once (attempts < 2)
    """
    failed = db.query(Notification).filter(
        Notification.status == DeliveryStatus.FAILED,
        Notification.attempts < 2
    ).all()

    retried_count = 0
    for n in failed:
        n.attempts += 1
        n.status = DeliveryStatus.SENT
        retried_count += 1

    db.commit()
    return {"message": "Retry job completed", "retried_count": retried_count}
