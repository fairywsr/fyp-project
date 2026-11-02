from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user, require_role
from app.models.announcement import Announcement
from app.models.user import User
from app.models.enums import UserRole, AnnouncementAudience
from app.schemas.misc import AnnouncementCreate, AnnouncementOut

router = APIRouter(prefix="/announcements", tags=["Announcements"])


@router.get("", response_model=List[AnnouncementOut])
def get_announcements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Audience logic: ALL or matching user's department
    query = db.query(Announcement)
    if current_user.role != UserRole.ADMIN:
        if current_user.dept_id:
            query = query.filter(
                (Announcement.audience == AnnouncementAudience.ALL) |
                ((Announcement.audience == AnnouncementAudience.DEPARTMENT) & (Announcement.dept_id == current_user.dept_id))
            )
        else:
            query = query.filter(Announcement.audience == AnnouncementAudience.ALL)

    announcements = query.order_by(Announcement.id.desc()).all()
    results = []
    for a in announcements:
        results.append(
            AnnouncementOut(
                id=a.id,
                created_by=a.created_by,
                creator_name=a.creator.full_name if a.creator else None,
                title=a.title,
                body=a.body,
                audience=a.audience,
                dept_id=a.dept_id,
                course_id=a.course_id,
                created_at=a.created_at
            )
        )
    return results


@router.post("", response_model=AnnouncementOut)
def create_announcement(
    payload: AnnouncementCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    announcement = Announcement(
        created_by=current_user.id,
        title=payload.title.strip(),
        body=payload.body.strip(),
        audience=payload.audience,
        dept_id=payload.dept_id,
        course_id=payload.course_id
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    return AnnouncementOut(
        id=announcement.id,
        created_by=announcement.created_by,
        creator_name=current_user.full_name,
        title=announcement.title,
        body=announcement.body,
        audience=announcement.audience,
        dept_id=announcement.dept_id,
        course_id=announcement.course_id,
        created_at=announcement.created_at
    )
