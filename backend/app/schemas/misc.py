from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.enums import (
    NotificationChannel,
    DeliveryStatus,
    AnnouncementAudience,
    PriorityLevel,
    QueryChannel,
)


class NotificationOut(BaseModel):
    id: int
    user_id: int
    query_id: Optional[int] = None
    type: str
    channel: NotificationChannel
    message: str
    status: DeliveryStatus
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AnnouncementCreate(BaseModel):
    title: str
    body: str
    audience: AnnouncementAudience = AnnouncementAudience.ALL
    dept_id: Optional[int] = None
    course_id: Optional[int] = None


class AnnouncementOut(BaseModel):
    id: int
    created_by: int
    creator_name: Optional[str] = None
    title: str
    body: str
    audience: AnnouncementAudience
    dept_id: Optional[int] = None
    course_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RoutingRuleCreate(BaseModel):
    keyword: str
    dept_id: int
    course_id: Optional[int] = None
    priority: PriorityLevel = PriorityLevel.MEDIUM
    is_active: bool = True


class RoutingRuleUpdate(BaseModel):
    keyword: Optional[str] = None
    dept_id: Optional[int] = None
    course_id: Optional[int] = None
    priority: Optional[PriorityLevel] = None
    is_active: Optional[bool] = None


class RoutingRuleOut(BaseModel):
    id: int
    keyword: str
    dept_id: int
    dept_name: Optional[str] = None
    course_id: Optional[int] = None
    course_code: Optional[str] = None
    priority: PriorityLevel
    is_active: bool
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True


class NormalizedQuery(BaseModel):
    channel: QueryChannel
    sender: str  # email address, phone number or user_id
    subject: Optional[str] = None
    text: str
    attachments: Optional[List[dict]] = None
    external_id: Optional[str] = None
    received_at: Optional[datetime] = None
