import enum


class UserRole(str, enum.Enum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    HOD = "hod"
    ADMIN = "admin"


class UserAvailability(str, enum.Enum):
    AVAILABLE = "available"
    AWAY = "away"
    ON_LEAVE = "on_leave"


class QueryChannel(str, enum.Enum):
    WEB_FORM = "web_form"
    EMAIL = "email"
    WHATSAPP = "whatsapp"


class QueryStatus(str, enum.Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"
    ESCALATED = "escalated"


class PriorityLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class RouteMethod(str, enum.Enum):
    AI = "ai"
    RULE = "rule"
    MANUAL = "manual"
    OVERRIDE = "override"


class AIDraftStatus(str, enum.Enum):
    PENDING = "pending"
    USED = "used"
    EDITED = "edited"
    DISCARDED = "discarded"


class DeliveryStatus(str, enum.Enum):
    QUEUED = "queued"
    SENT = "sent"
    FAILED = "failed"


class NotificationChannel(str, enum.Enum):
    DASHBOARD = "dashboard"
    EMAIL = "email"
    WHATSAPP = "whatsapp"


class AnnouncementAudience(str, enum.Enum):
    ALL = "all"
    DEPARTMENT = "department"
    COURSE = "course"


class EscalationReason(str, enum.Enum):
    SLA_24H = "sla_24h"
    LOW_CONFIDENCE = "low_confidence"
    MANUAL = "manual"
    APPEAL = "appeal"
