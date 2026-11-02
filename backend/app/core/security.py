from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.core.config import settings
from app.core.errors import UnauthorizedError


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def verify_access_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise UnauthorizedError(detail="Invalid or expired authentication token")


def verify_google_token(token: str) -> Dict[str, Any]:
    """
    Verifies a Google ID token. In development, if token starts with 'dev-',
    returns mock user info for instant local pair-programming and testing.
    """
    if token.startswith("dev-"):
        # Format: dev-role-email e.g. dev-student-john@edu.pk or dev-admin@edu.pk
        email = token.replace("dev-", "")
        if "@" not in email:
            email = f"{email}@university.edu.pk"
        return {
            "email": email,
            "sub": f"google-sub-{email}",
            "name": email.split("@")[0].replace(".", " ").title(),
            "picture": None,
            "email_verified": True
        }

    try:
        client_id = settings.GOOGLE_CLIENT_ID
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            client_id
        )
        return idinfo
    except Exception as e:
        raise UnauthorizedError(detail=f"Google token verification failed: {str(e)}")


def verify_service_key(provided_key: Optional[str]) -> bool:
    if not provided_key or provided_key != settings.SERVICE_API_KEY:
        raise UnauthorizedError(detail="Invalid or missing service key (X-Service-Key)", code="INVALID_SERVICE_KEY")
    return True
