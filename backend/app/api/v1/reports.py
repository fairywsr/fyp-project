import io
import csv
from typing import Optional
from fastapi import APIRouter, Depends, Query as QueryParam, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import require_role
from app.models.query import Query
from app.models.user import User
from app.models.enums import UserRole, QueryStatus

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/export")
def export_queries_report(
    format: str = QueryParam("csv", pattern="^(csv|json)$"),
    status: Optional[QueryStatus] = QueryParam(None),
    dept_id: Optional[int] = QueryParam(None),
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HOD)),
    db: Session = Depends(get_db)
):
    query = db.query(Query)
    if current_user.role == UserRole.HOD:
        query = query.filter(Query.dept_id == current_user.dept_id)
    elif dept_id:
        query = query.filter(Query.dept_id == dept_id)

    if status:
        query = query.filter(Query.status == status)

    records = query.order_by(Query.id.desc()).all()

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Query ID", "Subject", "Student", "Department", "Course", "Channel", "Status", "Priority", "Created At"])
        for r in records:
            writer.writerow([
                r.id,
                r.subject or "",
                r.student.full_name if r.student else "",
                r.department.name if r.department else "",
                r.course.code if r.course else "",
                r.channel.value,
                r.status.value,
                r.priority.value,
                r.created_at.isoformat()
            ])
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=query_routing_report.csv"}
        )

    # JSON export format
    return [
        {
            "id": r.id,
            "subject": r.subject,
            "student": r.student.full_name if r.student else None,
            "department": r.department.name if r.department else None,
            "course": r.course.code if r.course else None,
            "channel": r.channel.value,
            "status": r.status.value,
            "priority": r.priority.value,
            "created_at": r.created_at.isoformat()
        } for r in records
    ]
