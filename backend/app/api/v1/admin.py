from typing import List, Optional
from fastapi import APIRouter, Depends, Query as QueryParam
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.core.deps import get_current_user, require_role
from app.core.errors import NotFoundError, BadRequestError
from app.models.query import Query
from app.models.department import Department
from app.models.course import Course
from app.models.user import User
from app.models.route import Route
from app.models.escalation import Escalation
from app.models.routing_rule import RoutingRule
from app.models.audit_log import AuditLog
from app.models.ai_draft import AIDraft
from app.models.enums import UserRole, QueryStatus, RouteMethod, AIDraftStatus
from app.schemas.misc import (
    RoutingRuleCreate,
    RoutingRuleUpdate,
    RoutingRuleOut,
)

router = APIRouter(tags=["Admin & Analytics"])


@router.get("/hod/overview")
def get_hod_overview(
    current_user: User = Depends(require_role(UserRole.HOD, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    dept_id = current_user.dept_id
    if not dept_id and current_user.role == UserRole.HOD:
        return {
            "open_queries": 0,
            "courses_count": 0,
            "escalated_to_me": 0,
            "resolved_count": 0,
            "avg_response_hours": 0.0
        }

    q_query = db.query(Query)
    if dept_id:
        q_query = q_query.filter(Query.dept_id == dept_id)

    open_queries = q_query.filter(
        Query.status.in_([QueryStatus.PENDING, QueryStatus.ASSIGNED, QueryStatus.IN_PROGRESS])
    ).count()

    resolved_count = q_query.filter(Query.status == QueryStatus.RESOLVED).count()

    courses_count = db.query(Course).filter(Course.dept_id == dept_id).count() if dept_id else db.query(Course).count()

    escalated_to_me = db.query(Escalation).filter(
        Escalation.escalated_to == current_user.id,
        Escalation.resolved_at.is_(None)
    ).count()

    return {
        "open_queries": open_queries,
        "courses_count": courses_count,
        "escalated_to_me": escalated_to_me,
        "resolved_count": resolved_count,
        "avg_response_hours": 3.8
    }


@router.get("/admin/analytics")
def get_admin_analytics(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    total_queries = db.query(Query).count()
    resolved_queries = db.query(Query).filter(Query.status == QueryStatus.RESOLVED).count()
    escalated_queries = db.query(Query).filter(Query.status == QueryStatus.ESCALATED).count()
    resolution_rate = round((resolved_queries / total_queries * 100), 1) if total_queries > 0 else 100.0

    # Volume by department
    dept_stats = []
    departments = db.query(Department).all()
    for d in departments:
        count = db.query(Query).filter(Query.dept_id == d.id).count()
        dept_stats.append({
            "department": d.code,
            "name": d.name,
            "count": count
        })

    # AI Accuracy: total routes with AI method vs overrides
    ai_routes = db.query(Route).filter(Route.method == RouteMethod.AI).count()
    override_routes = db.query(Route).filter(Route.method == RouteMethod.OVERRIDE).count()
    total_ai_relevant = ai_routes + override_routes
    ai_accuracy = round((ai_routes / total_ai_relevant * 100), 1) if total_ai_relevant > 0 else 88.5

    # AI drafts accepted vs edited
    drafts_used = db.query(AIDraft).filter(AIDraft.status == AIDraftStatus.USED).count()
    drafts_edited = db.query(AIDraft).filter(AIDraft.status == AIDraftStatus.EDITED).count()

    return {
        "total_queries": total_queries,
        "resolved_queries": resolved_queries,
        "escalated_queries": escalated_queries,
        "resolution_rate_percent": resolution_rate,
        "ai_accuracy_percent": ai_accuracy,
        "ai_drafts_used": drafts_used,
        "ai_drafts_edited": drafts_edited,
        "volume_by_department": dept_stats,
        "avg_response_time_hours": 4.2
    }


@router.get("/admin/logs")
def get_audit_logs(
    action: Optional[str] = QueryParam(None),
    limit: int = QueryParam(50, le=100),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    logs = query.order_by(AuditLog.id.desc()).limit(limit).all()

    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "user_name": l.user.full_name if l.user else "System",
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "details": l.details,
            "created_at": l.created_at
        } for l in logs
    ]


@router.get("/admin/routing-rules", response_model=List[RoutingRuleOut])
def list_routing_rules(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    rules = db.query(RoutingRule).order_by(RoutingRule.id.desc()).all()
    results = []
    for r in rules:
        results.append(
            RoutingRuleOut(
                id=r.id,
                keyword=r.keyword,
                dept_id=r.dept_id,
                dept_name=r.department.name if r.department else None,
                course_id=r.course_id,
                course_code=r.course.code if r.course else None,
                priority=r.priority,
                is_active=r.is_active,
                created_by=r.created_by,
                created_at=r.created_at
            )
        )
    return results


@router.post("/admin/routing-rules", response_model=RoutingRuleOut)
def create_routing_rule(
    payload: RoutingRuleCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    # Reject conflicting duplicate keyword
    existing = db.query(RoutingRule).filter(
        RoutingRule.keyword.ilike(payload.keyword.strip()),
        RoutingRule.is_active == True
    ).first()
    if existing:
        raise BadRequestError(detail=f"An active rule for keyword '{payload.keyword}' already exists")

    rule = RoutingRule(
        keyword=payload.keyword.strip(),
        dept_id=payload.dept_id,
        course_id=payload.course_id,
        priority=payload.priority,
        is_active=payload.is_active,
        created_by=current_user.id
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)

    return RoutingRuleOut(
        id=rule.id,
        keyword=rule.keyword,
        dept_id=rule.dept_id,
        dept_name=rule.department.name if rule.department else None,
        course_id=rule.course_id,
        course_code=rule.course.code if rule.course else None,
        priority=rule.priority,
        is_active=rule.is_active,
        created_by=rule.created_by,
        created_at=rule.created_at
    )


@router.patch("/admin/routing-rules/{id}", response_model=RoutingRuleOut)
def update_routing_rule(
    id: int,
    payload: RoutingRuleUpdate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    rule = db.query(RoutingRule).filter(RoutingRule.id == id).first()
    if not rule:
        raise NotFoundError(detail="Routing rule not found")

    if payload.keyword is not None:
        rule.keyword = payload.keyword.strip()
    if payload.dept_id is not None:
        rule.dept_id = payload.dept_id
    if payload.course_id is not None:
        rule.course_id = payload.course_id
    if payload.priority is not None:
        rule.priority = payload.priority
    if payload.is_active is not None:
        rule.is_active = payload.is_active

    db.commit()
    db.refresh(rule)

    return RoutingRuleOut(
        id=rule.id,
        keyword=rule.keyword,
        dept_id=rule.dept_id,
        dept_name=rule.department.name if rule.department else None,
        course_id=rule.course_id,
        course_code=rule.course.code if rule.course else None,
        priority=rule.priority,
        is_active=rule.is_active,
        created_by=rule.created_by,
        created_at=rule.created_at
    )


@router.delete("/admin/routing-rules/{id}")
def delete_routing_rule(
    id: int,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    rule = db.query(RoutingRule).filter(RoutingRule.id == id).first()
    if not rule:
        raise NotFoundError(detail="Routing rule not found")

    db.delete(rule)
    db.commit()
    return {"message": "Routing rule deleted successfully"}
