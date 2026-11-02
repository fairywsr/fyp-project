from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.departments import router as departments_router
from app.api.v1.courses import router as courses_router
from app.api.v1.queries import router as queries_router
from app.api.v1.replies import router as replies_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.announcements import router as announcements_router
from app.api.v1.admin import router as admin_router
from app.api.v1.reports import router as reports_router
from app.api.v1.internal import router as internal_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(departments_router)
api_router.include_router(courses_router)
api_router.include_router(queries_router)
api_router.include_router(replies_router)
api_router.include_router(notifications_router)
api_router.include_router(announcements_router)
api_router.include_router(admin_router)
api_router.include_router(reports_router)
api_router.include_router(internal_router)
