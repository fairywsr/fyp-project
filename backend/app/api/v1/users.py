from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user, require_role
from app.core.errors import NotFoundError, BadRequestError, ForbiddenError
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.user import (
    UserOut,
    UserProfileUpdate,
    AvailabilityUpdate,
    UserCreate,
    UserUpdate,
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
def get_own_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_own_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()
    if payload.phone is not None:
        current_user.phone = payload.phone.strip() or None

    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/me/availability", response_model=UserOut)
def update_own_availability(
    payload: AvailabilityUpdate,
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.HOD, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    current_user.availability = payload.availability
    current_user.auto_reply_enabled = payload.auto_reply_enabled
    current_user.auto_reply_message = payload.auto_reply_message
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("", response_model=List[UserOut])
def list_users(
    role: Optional[UserRole] = None,
    dept_id: Optional[int] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.HOD)),
    db: Session = Depends(get_db)
):
    query = db.query(User)

    # Scoping: HOD only sees users in their own department
    if current_user.role == UserRole.HOD:
        if not current_user.dept_id:
            return []
        query = query.filter(User.dept_id == current_user.dept_id)
    elif dept_id:
        query = query.filter(User.dept_id == dept_id)

    if role:
        query = query.filter(User.role == role)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(User.full_name.ilike(search_fmt) | User.email.ilike(search_fmt))

    return query.order_by(User.id.desc()).all()


@router.post("", response_model=UserOut)
def create_user(
    payload: UserCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing:
        raise BadRequestError(detail="User with this email already exists")

    new_user = User(
        email=payload.email.lower().strip(),
        full_name=payload.full_name.strip(),
        role=payload.role,
        dept_id=payload.dept_id,
        phone=payload.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.patch("/{id}", response_model=UserOut)
def update_user_by_admin(
    id: int,
    payload: UserUpdate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    target = db.query(User).filter(User.id == id).first()
    if not target:
        raise NotFoundError(detail="User not found")

    if target.id == current_user.id and payload.is_active is False:
        raise ForbiddenError(detail="Admin cannot deactivate their own account")

    if payload.full_name is not None:
        target.full_name = payload.full_name.strip()
    if payload.role is not None:
        target.role = payload.role
    if payload.dept_id is not None:
        target.dept_id = payload.dept_id
    if payload.phone is not None:
        target.phone = payload.phone
    if payload.is_active is not None:
        target.is_active = payload.is_active

    db.commit()
    db.refresh(target)
    return target
