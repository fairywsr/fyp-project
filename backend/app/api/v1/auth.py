from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import verify_google_token, create_access_token
from app.core.config import settings
from app.core.deps import get_current_user
from app.core.errors import UnauthorizedError, ForbiddenError
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.user import (
    GoogleLoginRequest,
    TokenResponse,
    UserOut,
    UserProfileUpdate,
    AvailabilityUpdate,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login_with_google(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    # 1. Verify token
    idinfo = verify_google_token(payload.id_token)
    email = idinfo.get("email", "").lower().strip()
    name = idinfo.get("name", email.split("@")[0])
    google_sub = idinfo.get("sub")

    if not email:
        raise UnauthorizedError(detail="Google token did not contain an email address")

    # 2. Check domain if configured
    if settings.ALLOWED_EMAIL_DOMAIN and not email.endswith(settings.ALLOWED_EMAIL_DOMAIN):
        # Allow pre-seeded admin or staff emails to bypass domain restriction
        admin_emails = settings.admin_email_list
        if email not in admin_emails and not email.endswith("university.edu.pk"):
            raise ForbiddenError(detail=f"Email must belong to allowed domain (*.{settings.ALLOWED_EMAIL_DOMAIN})")

    # 3. Find or create user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Determine role: check if admin email, else default to student
        role = UserRole.ADMIN if email in settings.admin_email_list else UserRole.STUDENT
        user = User(
            email=email,
            full_name=name,
            role=role,
            google_sub=google_sub,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not user.is_active:
            raise ForbiddenError(detail="User account is deactivated. Contact an administrator.")
        if google_sub and not user.google_sub:
            user.google_sub = google_sub
            db.commit()
            db.refresh(user)

    # 4. Generate JWT with sub, role, dept_id
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value,
        "dept_id": user.dept_id
    }
    access_token = create_access_token(data=token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        user=UserOut.model_validate(user)
    )


@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user
