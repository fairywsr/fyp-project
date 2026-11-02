from typing import List, Optional
from fastapi import APIRouter, Depends, Query as QueryParam
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user, require_role
from app.core.errors import NotFoundError, BadRequestError, ForbiddenError
from app.models.course import Course
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.academic import (
    CourseOut,
    CourseCreate,
    CourseUpdate,
    CourseAssignInstructor,
)

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("", response_model=List[CourseOut])
def list_courses(dept_id: Optional[int] = QueryParam(None), db: Session = Depends(get_db)):
    query = db.query(Course)
    if dept_id:
        query = query.filter(Course.dept_id == dept_id)
    courses = query.order_by(Course.code.asc()).all()

    results = []
    for c in courses:
        results.append(
            CourseOut(
                id=c.id,
                code=c.code,
                name=c.name,
                dept_id=c.dept_id,
                instructor_id=c.instructor_id,
                instructor_name=c.instructor.full_name if c.instructor else None,
                created_at=c.created_at
            )
        )
    return results


@router.post("", response_model=CourseOut)
def create_course(
    payload: CourseCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    existing = db.query(Course).filter(Course.code == payload.code.upper().strip()).first()
    if existing:
        raise BadRequestError(detail="Course code already exists")

    course = Course(
        code=payload.code.upper().strip(),
        name=payload.name.strip(),
        dept_id=payload.dept_id,
        instructor_id=payload.instructor_id
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return CourseOut(
        id=course.id,
        code=course.code,
        name=course.name,
        dept_id=course.dept_id,
        instructor_id=course.instructor_id,
        instructor_name=course.instructor.full_name if course.instructor else None,
        created_at=course.created_at
    )


@router.patch("/{id}", response_model=CourseOut)
def update_course(
    id: int,
    payload: CourseUpdate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == id).first()
    if not course:
        raise NotFoundError(detail="Course not found")

    if payload.name is not None:
        course.name = payload.name.strip()
    if payload.instructor_id is not None:
        course.instructor_id = payload.instructor_id

    db.commit()
    db.refresh(course)
    return CourseOut(
        id=course.id,
        code=course.code,
        name=course.name,
        dept_id=course.dept_id,
        instructor_id=course.instructor_id,
        instructor_name=course.instructor.full_name if course.instructor else None,
        created_at=course.created_at
    )


@router.post("/{id}/assign-instructor", response_model=CourseOut)
def assign_course_instructor(
    id: int,
    payload: CourseAssignInstructor,
    current_user: User = Depends(require_role(UserRole.HOD, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == id).first()
    if not course:
        raise NotFoundError(detail="Course not found")

    if current_user.role == UserRole.HOD and course.dept_id != current_user.dept_id:
        raise ForbiddenError(detail="Cannot assign instructor to a course outside your department")

    if payload.instructor_id:
        instructor = db.query(User).filter(User.id == payload.instructor_id).first()
        if not instructor:
            raise NotFoundError(detail="Instructor not found")
        course.instructor_id = instructor.id
    else:
        course.instructor_id = None

    db.commit()
    db.refresh(course)
    return CourseOut(
        id=course.id,
        code=course.code,
        name=course.name,
        dept_id=course.dept_id,
        instructor_id=course.instructor_id,
        instructor_name=course.instructor.full_name if course.instructor else None,
        created_at=course.created_at
    )
