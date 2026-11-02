from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.enums import UserRole, UserAvailability


class GoogleLoginRequest(BaseModel):
    id_token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user: "UserOut"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.STUDENT
    dept_id: Optional[int] = None
    phone: Optional[str] = None
    availability: UserAvailability = UserAvailability.AVAILABLE
    auto_reply_enabled: bool = False
    auto_reply_message: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    dept_id: Optional[int] = None
    phone: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    dept_id: Optional[int] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class AvailabilityUpdate(BaseModel):
    availability: UserAvailability
    auto_reply_enabled: bool = False
    auto_reply_message: Optional[str] = None


class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


TokenResponse.model_rebuild()
