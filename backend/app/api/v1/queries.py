from typing import List, Optional
from fastapi import APIRouter, Depends, Query as QueryParam, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user, require_role
from app.core.errors import NotFoundError, ForbiddenError, BadRequestError
from app.models.query import Query
from app.models.route import Route
from app.models.reply import Reply
from app.models.ai_draft import AIDraft
from app.models.attachment import Attachment
from app.models.escalation import Escalation
from app.models.audit_log import AuditLog
from app.models.user import User
from app.models.enums import UserRole, QueryStatus, PriorityLevel, QueryChannel, EscalationReason, RouteMethod
from app.schemas.query import (
    QueryCreate,
    QueryOut,
    RouteOut,
    ReplyOut,
    AIDraftOut,
    AttachmentOut,
    QueryOverrideRequest,
    QueryAppealRequest,
)
from app.schemas.misc import NormalizedQuery
from app.services.ingestion_service import IngestionService

router = APIRouter(tags=["Queries"])


def build_query_out(q: Query, current_user: User) -> QueryOut:
    # Route info
    latest_route = q.routes[-1] if q.routes else None
    route_out = None
    if latest_route:
        route_out = RouteOut(
            id=latest_route.id,
            dept_id=latest_route.dept_id,
            course_id=latest_route.course_id,
            assigned_to=latest_route.assigned_to,
            assigned_name=latest_route.assignee.full_name if latest_route.assignee else None,
            method=latest_route.method,
            reason=latest_route.reason,
            created_at=latest_route.created_at
        )

    # Replies
    replies_out = []
    for r in q.replies:
        # Hide drafts if user is not author or staff
        if r.is_draft and current_user.role == UserRole.STUDENT and r.author_id != current_user.id:
            continue
        att_outs = [
            AttachmentOut(
                id=a.id,
                file_name=a.file_name,
                mime_type=a.mime_type,
                size_bytes=a.size_bytes,
                storage_path=a.storage_path,
                created_at=a.created_at
            ) for a in r.attachments
        ]
        replies_out.append(
            ReplyOut(
                id=r.id,
                query_id=r.query_id,
                author_id=r.author_id,
                author_name=r.author.full_name if r.author else None,
                author_role=r.author.role.value if r.author else None,
                body=r.body,
                is_draft=r.is_draft,
                ai_draft_id=r.ai_draft_id,
                created_at=r.created_at,
                attachments=att_outs
            )
        )

    # Attachments
    att_outs = [
        AttachmentOut(
            id=a.id,
            file_name=a.file_name,
            mime_type=a.mime_type,
            size_bytes=a.size_bytes,
            storage_path=a.storage_path,
            created_at=a.created_at
        ) for a in q.attachments if not a.reply_id
    ]

    # AI Draft (Staff only)
    ai_draft_out = None
    if current_user.role in [UserRole.INSTRUCTOR, UserRole.HOD, UserRole.ADMIN] and q.ai_drafts:
        latest_draft = q.ai_drafts[-1]
        ai_draft_out = AIDraftOut(
            id=latest_draft.id,
            query_id=latest_draft.query_id,
            body=latest_draft.body,
            model=latest_draft.model,
            status=latest_draft.status,
            created_at=latest_draft.created_at
        )

    return QueryOut(
        id=q.id,
        student_id=q.student_id,
        student_name=q.student.full_name if q.student else None,
        student_email=q.student.email if q.student else None,
        dept_id=q.dept_id,
        department_name=q.department.name if q.department else None,
        course_id=q.course_id,
        course_code=q.course.code if q.course else None,
        subject=q.subject,
        channel=q.channel,
        external_id=q.external_id,
        text=q.text,
        status=q.status,
        priority=q.priority,
        confidence=q.confidence,
        needs_review=q.needs_review,
        language=q.language,
        created_at=q.created_at,
        updated_at=q.updated_at,
        current_route=route_out,
        replies=replies_out,
        attachments=att_outs,
        ai_draft=ai_draft_out
    )


@router.post("/query", response_model=QueryOut)
def submit_query(
    payload: QueryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    normalized = NormalizedQuery(
        channel=QueryChannel.WEB_FORM,
        sender=current_user.email,
        subject=payload.subject,
        text=payload.text
    )
    query_obj = IngestionService.ingest(normalized, db, user=current_user)
    
    # If user selected a specific course or department in form, link it
    if payload.course_id:
        query_obj.course_id = payload.course_id
    if payload.dept_id:
        query_obj.dept_id = payload.dept_id
    db.commit()
    db.refresh(query_obj)
    return build_query_out(query_obj, current_user)


@router.get("/queries/mine", response_model=List[QueryOut])
def get_my_queries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    queries = db.query(Query).filter(Query.student_id == current_user.id).order_by(Query.id.desc()).all()
    return [build_query_out(q, current_user) for q in queries]


@router.get("/queries/assigned", response_model=List[QueryOut])
def get_assigned_queries(
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.HOD, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    queries = db.query(Query).join(Query.routes).filter(
        Route.assigned_to == current_user.id,
        Query.status.in_([QueryStatus.ASSIGNED, QueryStatus.IN_PROGRESS, QueryStatus.ESCALATED])
    ).order_by(Query.priority.desc(), Query.id.desc()).all()
    return [build_query_out(q, current_user) for q in queries]


@router.get("/queries", response_model=List[QueryOut])
def list_all_queries(
    status: Optional[QueryStatus] = QueryParam(None),
    dept_id: Optional[int] = QueryParam(None),
    course_id: Optional[int] = QueryParam(None),
    priority: Optional[PriorityLevel] = QueryParam(None),
    search: Optional[str] = QueryParam(None),
    current_user: User = Depends(require_role(UserRole.HOD, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    query = db.query(Query)

    # HOD can only view their own department
    if current_user.role == UserRole.HOD:
        if not current_user.dept_id:
            return []
        query = query.filter(Query.dept_id == current_user.dept_id)
    elif dept_id:
        query = query.filter(Query.dept_id == dept_id)

    if status:
        query = query.filter(Query.status == status)
    if course_id:
        query = query.filter(Query.course_id == course_id)
    if priority:
        query = query.filter(Query.priority == priority)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(Query.subject.ilike(search_fmt) | Query.text.ilike(search_fmt))

    queries = query.order_by(Query.id.desc()).all()
    return [build_query_out(q, current_user) for q in queries]


@router.get("/query/{id}", response_model=QueryOut)
def get_query_detail(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(Query).filter(Query.id == id).first()
    if not q:
        raise NotFoundError(detail="Query not found")

    # Scope checks:
    # 1. Student can only see own query
    if current_user.role == UserRole.STUDENT and q.student_id != current_user.id:
        raise NotFoundError(detail="Query not found or outside your scope")

    # 2. Instructor can only see query assigned to them
    if current_user.role == UserRole.INSTRUCTOR:
        is_assigned = any(r.assigned_to == current_user.id for r in q.routes)
        if not is_assigned and q.student_id != current_user.id:
            raise NotFoundError(detail="Query not found or outside your scope")

    # 3. HOD can only see queries in their department
    if current_user.role == UserRole.HOD:
        if q.dept_id != current_user.dept_id and not any(r.assigned_to == current_user.id for r in q.routes):
            raise NotFoundError(detail="Query not found or outside your scope")

    return build_query_out(q, current_user)


@router.post("/query/{id}/override", response_model=QueryOut)
def override_query(
    id: int,
    payload: QueryOverrideRequest,
    current_user: User = Depends(require_role(UserRole.HOD, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    q = db.query(Query).filter(Query.id == id).first()
    if not q:
        raise NotFoundError(detail="Query not found")

    if current_user.role == UserRole.HOD and q.dept_id != current_user.dept_id:
        raise ForbiddenError(detail="Cannot override query outside your department")

    # Update fields
    if payload.dept_id:
        q.dept_id = payload.dept_id
    if payload.course_id:
        q.course_id = payload.course_id
    if payload.priority:
        q.priority = payload.priority

    assignee_id = payload.assigned_to or current_user.id
    new_route = Route(
        query_id=q.id,
        dept_id=q.dept_id or current_user.dept_id or 1,
        course_id=q.course_id,
        assigned_to=assignee_id,
        method=RouteMethod.OVERRIDE,
        reason=payload.reason
    )
    db.add(new_route)
    q.status = QueryStatus.ASSIGNED

    audit = AuditLog(
        user_id=current_user.id,
        action="override_query",
        entity_type="query",
        entity_id=q.id,
        details=f"Overridden by {current_user.full_name}: {payload.reason}"
    )
    db.add(audit)

    db.commit()
    db.refresh(q)
    return build_query_out(q, current_user)


@router.post("/query/{id}/appeal", response_model=QueryOut)
def appeal_query(
    id: int,
    payload: QueryAppealRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(Query).filter(Query.id == id, Query.student_id == current_user.id).first()
    if not q:
        raise NotFoundError(detail="Query not found or outside your scope")

    # Find HOD to escalate to
    hod_id = None
    if q.department and q.department.hod_id:
        hod_id = q.department.hod_id
    else:
        admin = db.query(User).filter(User.role == UserRole.ADMIN, User.is_active == True).first()
        hod_id = admin.id if admin else current_user.id

    escalation = Escalation(
        query_id=q.id,
        reason=EscalationReason.APPEAL,
        escalated_to=hod_id,
        escalated_by=current_user.id
    )
    db.add(escalation)
    q.status = QueryStatus.ESCALATED

    # Re-route to HOD
    route = Route(
        query_id=q.id,
        dept_id=q.dept_id or 1,
        course_id=q.course_id,
        assigned_to=hod_id,
        method=RouteMethod.OVERRIDE,
        reason=f"Student Appeal: {payload.reason}"
    )
    db.add(route)

    db.commit()
    db.refresh(q)
    return build_query_out(q, current_user)


@router.post("/query/{id}/close", response_model=QueryOut)
def close_query(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(Query).filter(Query.id == id).first()
    if not q:
        raise NotFoundError(detail="Query not found")

    # Permitted: student owner, HOD of dept, Admin
    if current_user.role == UserRole.STUDENT and q.student_id != current_user.id:
        raise ForbiddenError(detail="Cannot close a query you do not own")
    if current_user.role == UserRole.HOD and q.dept_id != current_user.dept_id:
        raise ForbiddenError(detail="Cannot close a query outside your department")

    q.status = QueryStatus.CLOSED
    db.commit()
    db.refresh(q)
    return build_query_out(q, current_user)
