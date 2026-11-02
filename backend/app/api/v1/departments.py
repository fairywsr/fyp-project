from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user, require_role
from app.core.errors import NotFoundError, BadRequestError
from app.models.department import Department
from app.models.course import Course
from app.models.user import User
from app.models.query import Query
from app.models.enums import UserRole, QueryStatus
from app.schemas.academic import (
    DepartmentOut,
    DepartmentCreate,
    DepartmentUpdate,
    CourseOut,
)

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.get("", response_model=List[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    return db.query(Department).order_by(Department.name.asc()).all()


@router.post("", response_model=DepartmentOut)
def create_department(
    payload: DepartmentCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    existing = db.query(Department).filter(
        (Department.name == payload.name) | (Department.code == payload.code.upper())
    ).first()
    if existing:
        raise BadRequestError(detail="Department with this name or code already exists")

    dept = Department(
        name=payload.name.strip(),
        code=payload.code.strip().upper(),
        contact_email=payload.contact_email,
        hod_id=payload.hod_id
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.patch("/{id}", response_model=DepartmentOut)
def update_department(
    id: int,
    payload: DepartmentUpdate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise NotFoundError(detail="Department not found")

    if payload.name is not None:
        dept.name = payload.name.strip()
    if payload.contact_email is not None:
        dept.contact_email = payload.contact_email
    if payload.hod_id is not None:
        dept.hod_id = payload.hod_id

    db.commit()
    db.refresh(dept)
    return dept


@router.get("/{id}/courses", response_model=List[CourseOut])
def get_department_courses(
    id: int,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HOD)),
    db: Session = Depends(get_db)
):
    courses = db.query(Course).filter(Course.dept_id == id).order_by(Course.code.asc()).all()
    results = []
    for c in courses:
        out = CourseOut(
            id=c.id,
            code=c.code,
            name=c.name,
            dept_id=c.dept_id,
            instructor_id=c.instructor_id,
            instructor_name=c.instructor.full_name if c.instructor else None,
            created_at=c.created_at
        )
        results.append(out)
    return results


@router.get("/{id}/instructors")
def get_department_instructors_with_workload(
    id: int,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HOD)),
    db: Session = Depends(get_db)
):
    instructors = db.query(User).filter(
        User.dept_id == id,
        User.role == UserRole.INSTRUCTOR,
        User.is_active == True
    ).all()

    workload = []
    for inst in instructors:
        open_count = db.query(Query).join(Query.routes).filter(
            Query.status.in_([QueryStatus.ASSIGNED, QueryStatus.IN_PROGRESS]),
            Query.routes.any(assigned_to=inst.id)
        ).count()
        workload.append({
            "id": inst.id,
            "full_name": inst.full_name,
            "email": inst.email,
            "availability": inst.availability,
            "open_queries_count": open_count
        })

    return workload
