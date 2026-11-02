from typing import Generator, List
from fastapi import Depends, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import verify_access_token, verify_service_key
from app.core.errors import UnauthorizedError, ForbiddenError
from app.models.user import User
from app.models.enums import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not token:
        raise UnauthorizedError(detail="Missing authorization bearer token")
    
    payload = verify_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedError(detail="Token missing subject identifier")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise UnauthorizedError(detail="User not found")
    if not user.is_active:
        raise ForbiddenError(detail="User account is deactivated")
        
    return user


def require_role(*allowed_roles: UserRole):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise ForbiddenError(
                detail=f"Forbidden: role '{current_user.role.value}' not authorized for this resource"
            )
        return current_user
    return role_checker


def require_service_auth(x_service_key: str = Header(None, alias="X-Service-Key")):
    verify_service_key(x_service_key)
    return True
