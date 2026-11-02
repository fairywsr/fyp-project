from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user, require_role
from app.core.errors import NotFoundError, ForbiddenError
from app.models.query import Query
from app.models.reply import Reply
from app.models.ai_draft import AIDraft
from app.models.notification import Notification
from app.models.email import Email
from app.models.audit_log import AuditLog
from app.models.user import User
from app.models.enums import UserRole, QueryStatus, AIDraftStatus, NotificationChannel, DeliveryStatus
from app.schemas.query import ReplyCreate, ReplyOut, AttachmentOut

router = APIRouter(tags=["Replies"])


@router.post("/query/{id}/reply", response_model=ReplyOut)
def create_query_reply(
    id: int,
    payload: ReplyCreate,
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.HOD, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    q = db.query(Query).filter(Query.id == id).first()
    if not q:
        raise NotFoundError(detail="Query not found")

    # Scope check: instructor must be assigned; HOD must match dept; Admin allowed
    if current_user.role == UserRole.INSTRUCTOR:
        is_assigned = any(r.assigned_to == current_user.id for r in q.routes)
        if not is_assigned:
            raise ForbiddenError(detail="Cannot reply to a query not assigned to you")

    if current_user.role == UserRole.HOD and q.dept_id != current_user.dept_id:
        raise ForbiddenError(detail="Cannot reply to a query outside your department")

    # Create Reply
    reply = Reply(
        query_id=q.id,
        author_id=current_user.id,
        body=payload.body,
        is_draft=not payload.send,
        ai_draft_id=payload.ai_draft_id
    )
    db.add(reply)

    # Track AI draft usage if provided
    if payload.ai_draft_id:
        draft = db.query(AIDraft).filter(AIDraft.id == payload.ai_draft_id).first()
        if draft:
            if draft.body.strip() == payload.body.strip():
                draft.status = AIDraftStatus.USED
            else:
                draft.status = AIDraftStatus.EDITED

    if payload.send:
        # Move query status to RESOLVED
        q.status = QueryStatus.RESOLVED

        # Notify student
        student_notif = Notification(
            user_id=q.student_id,
            query_id=q.id,
            type="query_resolved",
            channel=NotificationChannel.DASHBOARD,
            message=f"Staff member {current_user.full_name} replied to your query #{q.id}: '{q.subject}'"
        )
        db.add(student_notif)

        # Queue email to student
        if q.student and q.student.email:
            email_out = Email(
                query_id=q.id,
                recipient=q.student.email,
                subject=f"Re: Query #{q.id} - {q.subject}",
                body=f"Hello {q.student.full_name},\n\n{payload.body}\n\nBest regards,\n{current_user.full_name}",
                status=DeliveryStatus.QUEUED
            )
            db.add(email_out)

        audit_action = "send_reply"
    else:
        # Saving draft moves query to IN_PROGRESS if not already
        if q.status == QueryStatus.ASSIGNED:
            q.status = QueryStatus.IN_PROGRESS
        audit_action = "save_draft_reply"

    audit = AuditLog(
        user_id=current_user.id,
        action=audit_action,
        entity_type="reply",
        entity_id=q.id,
        details=f"{'Sent reply' if payload.send else 'Saved draft reply'} on Query #{q.id}"
    )
    db.add(audit)

    db.commit()
    db.refresh(reply)

    return ReplyOut(
        id=reply.id,
        query_id=reply.query_id,
        author_id=reply.author_id,
        author_name=current_user.full_name,
        author_role=current_user.role.value,
        body=reply.body,
        is_draft=reply.is_draft,
        ai_draft_id=reply.ai_draft_id,
        created_at=reply.created_at,
        attachments=[]
    )
