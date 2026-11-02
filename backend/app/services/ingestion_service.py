from typing import Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.enums import (
    QueryChannel,
    QueryStatus,
    PriorityLevel,
    RouteMethod,
    NotificationChannel,
    AIDraftStatus,
)
from app.models.user import User
from app.models.query import Query
from app.models.route import Route
from app.models.ai_draft import AIDraft
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.models.department import Department
from app.schemas.misc import NormalizedQuery
from app.services.routing_service import RoutingService
from app.core.config import settings
from app.core.errors import DuplicateError, NotFoundError


class IngestionService:
    @staticmethod
    def ingest(normalized: NormalizedQuery, db: Session, user: Optional[User] = None) -> Query:
        # 1. Identify sender if not already provided via JWT
        if not user:
            sender_str = normalized.sender.strip()
            if "@" in sender_str:
                user = db.query(User).filter(User.email == sender_str.lower()).first()
            else:
                user = db.query(User).filter(User.phone == sender_str).first()

            if not user:
                raise NotFoundError(
                    detail=f"Sender '{normalized.sender}' could not be identified as a registered university user. Please register first."
                )

        # 2. Duplicate check on (channel, external_id)
        if normalized.external_id:
            duplicate = db.query(Query).filter(
                Query.channel == normalized.channel,
                Query.external_id == normalized.external_id
            ).first()
            if duplicate:
                raise DuplicateError(detail="Duplicate query dropped (already processed)")

        # 3. Save query with status PENDING immediately
        new_query = Query(
            student_id=user.id,
            subject=normalized.subject or (normalized.text[:50] + "..."),
            channel=normalized.channel,
            external_id=normalized.external_id,
            text=normalized.text,
            status=QueryStatus.PENDING,
            priority=PriorityLevel.MEDIUM,
            needs_review=False,
            language="en"
        )
        db.add(new_query)
        db.flush()

        # 4. Create initial acknowledgment notification
        ack_notification = Notification(
            user_id=user.id,
            query_id=new_query.id,
            type="query_received",
            channel=NotificationChannel.DASHBOARD,
            message=f"Your query #{new_query.id} '{new_query.subject}' was received. Estimated response time: 24 hours."
        )
        db.add(ack_notification)

        # 5. Routing triage: keyword rules or department fallback
        rule_match = RoutingService.match_rules(new_query.text, db)
        dept_id = None
        course_id = None
        priority = PriorityLevel.MEDIUM
        method = RouteMethod.RULE

        if rule_match:
            dept_id, course_id, priority = rule_match
            confidence = 0.95
        else:
            # Default to first department if none specified
            first_dept = db.query(Department).first()
            dept_id = first_dept.id if first_dept else 1
            confidence = 0.50
            method = RouteMethod.MANUAL

        new_query.dept_id = dept_id
        new_query.course_id = course_id
        new_query.priority = priority
        new_query.confidence = confidence

        # Confidence check
        if confidence < settings.AI_CONFIDENCE_THRESHOLD:
            new_query.needs_review = True

        # Resolve assignee
        try:
            assignee_id, reason = RoutingService.resolve_assignee(dept_id, course_id, db)
            route = Route(
                query_id=new_query.id,
                dept_id=dept_id,
                course_id=course_id,
                assigned_to=assignee_id,
                method=method,
                reason=reason
            )
            db.add(route)
            new_query.status = QueryStatus.ASSIGNED

            # Notify assignee
            assignee_notification = Notification(
                user_id=assignee_id,
                query_id=new_query.id,
                type="query_assigned",
                channel=NotificationChannel.DASHBOARD,
                message=f"New query #{new_query.id} assigned to you: '{new_query.subject}'"
            )
            db.add(assignee_notification)

            # Generate default AI draft
            ai_draft = AIDraft(
                query_id=new_query.id,
                body=f"Dear student, thank you for reaching out regarding '{new_query.subject}'. We have received your query and will assist you shortly.",
                model="gemini-pro",
                status=AIDraftStatus.PENDING
            )
            db.add(ai_draft)

        except Exception as e:
            new_query.needs_review = True

        # Write audit log
        audit = AuditLog(
            user_id=user.id,
            action="ingest_query",
            entity_type="query",
            entity_id=new_query.id,
            details=f"Query #{new_query.id} ingested via {normalized.channel.value}. Method: {method.value}"
        )
        db.add(audit)

        db.commit()
        db.refresh(new_query)
        return new_query
