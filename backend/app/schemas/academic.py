from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


class DepartmentBase(BaseModel):
    name: str
    code: str
    contact_email: Optional[EmailStr] = None
    hod_id: Optional[int] = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    hod_id: Optional[int] = None


class DepartmentOut(DepartmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CourseBase(BaseModel):
    code: str
    name: str
    dept_id: int
    instructor_id: Optional[int] = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    instructor_id: Optional[int] = None


class CourseAssignInstructor(BaseModel):
    instructor_id: Optional[int] = None


class CourseOut(CourseBase):
    id: int
    created_at: datetime
    instructor_name: Optional[str] = None

    class Config:
        from_attributes = True
