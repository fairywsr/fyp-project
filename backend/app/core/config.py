from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Query Routing"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "sqlite:///./sqr.db"

    # Security
    JWT_SECRET: str = "supersecret-change-in-production-jwt-key-32chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480  # 8 hours as per spec

    # Google Auth
    GOOGLE_CLIENT_ID: Optional[str] = None
    ALLOWED_EMAIL_DOMAIN: Optional[str] = "edu.pk"
    ADMIN_EMAILS: str = "admin@university.edu.pk"

    # AI
    GEMINI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    AI_CONFIDENCE_THRESHOLD: float = 0.6

    # SLA & Escalation
    ESCALATION_HOURS: int = 24

    # Internal API key for n8n & Baileys gateway
    SERVICE_API_KEY: str = "dev-internal-service-key-12345"

    # Gmail
    GMAIL_CLIENT_ID: Optional[str] = None
    GMAIL_CLIENT_SECRET: Optional[str] = None
    GMAIL_REFRESH_TOKEN: Optional[str] = None
    GMAIL_SENDER: Optional[str] = None

    # WhatsApp
    WHATSAPP_GATEWAY_URL: str = "http://localhost:3001"
    WHATSAPP_GATEWAY_KEY: Optional[str] = "gateway-secret-token"

    # Supabase Storage
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origin_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def admin_email_list(self) -> List[str]:
        if not self.ADMIN_EMAILS:
            return []
        return [email.strip().lower() for email in self.ADMIN_EMAILS.split(",") if email.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
