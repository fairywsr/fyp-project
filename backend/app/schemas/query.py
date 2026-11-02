from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.enums import QueryChannel, QueryStatus, PriorityLevel, RouteMethod, AIDraftStatus


class QueryCreate(BaseModel):
    subject: Optional[str] = None
    text: str
    dept_id: Optional[int] = None
    course_id: Optional[int] = None


class AttachmentOut(BaseModel):
    id: int
    file_name: str
    mime_type: str
    size_bytes: int
    storage_path: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReplyCreate(BaseModel):
    body: str
    send: bool = True  # If False, saved as draft
    ai_draft_id: Optional[int] = None


class ReplyOut(BaseModel):
    id: int
    query_id: int
    author_id: int
    author_name: Optional[str] = None
    author_role: Optional[str] = None
    body: str
    is_draft: bool
    ai_draft_id: Optional[int] = None
    created_at: datetime
    attachments: List[AttachmentOut] = []

    class Config:
        from_attributes = True


class AIDraftOut(BaseModel):
    id: int
    query_id: int
    body: str
    model: str
    status: AIDraftStatus
    created_at: datetime

    class Config:
        from_attributes = True


class RouteOut(BaseModel):
    id: int
    dept_id: int
    course_id: Optional[int] = None
    assigned_to: int
    assigned_name: Optional[str] = None
    method: RouteMethod
    reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class QueryOut(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    dept_id: Optional[int] = None
    department_name: Optional[str] = None
    course_id: Optional[int] = None
    course_code: Optional[str] = None
    subject: Optional[str] = None
    channel: QueryChannel
    external_id: Optional[str] = None
    text: str
    status: QueryStatus
    priority: PriorityLevel
    confidence: Optional[float] = None
    needs_review: bool
    language: str
    created_at: datetime
    updated_at: datetime
    current_route: Optional[RouteOut] = None
    replies: List[ReplyOut] = []
    attachments: List[AttachmentOut] = []
    ai_draft: Optional[AIDraftOut] = None

    class Config:
        from_attributes = True


class QueryOverrideRequest(BaseModel):
    assigned_to: Optional[int] = None
    dept_id: Optional[int] = None
    course_id: Optional[int] = None
    priority: Optional[PriorityLevel] = None
    reason: str


class QueryAppealRequest(BaseModel):
    reason: str
