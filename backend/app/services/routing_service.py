from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.enums import RouteMethod, UserRole, UserAvailability, PriorityLevel
from app.models.department import Department
from app.models.course import Course
from app.models.user import User
from app.models.routing_rule import RoutingRule


class RoutingService:
    @staticmethod
    def match_rules(text: str, db: Session) -> Optional[Tuple[int, Optional[int], PriorityLevel]]:
        """
        Keyword matching using active routing rules ordered by priority.
        Returns (dept_id, course_id, priority) if a keyword matches.
        """
        rules = db.query(RoutingRule).filter(RoutingRule.is_active == True).all()
        text_lower = text.lower()
        for rule in rules:
            if rule.keyword.lower() in text_lower:
                return rule.dept_id, rule.course_id, rule.priority
        return None

    @staticmethod
    def resolve_assignee(dept_id: int, course_id: Optional[int], db: Session) -> Tuple[int, str]:
        """
        Resolves the assignee:
        1. If course has instructor and instructor is AVAILABLE or AWAY, route to instructor.
        2. If instructor is ON_LEAVE, or course has no instructor, route to Department HOD.
        3. If no HOD exists, route to first active Admin.
        """
        if course_id:
            course = db.query(Course).filter(Course.id == course_id).first()
            if course and course.instructor_id:
                instructor = db.query(User).filter(User.id == course.instructor_id).first()
                if instructor and instructor.is_active:
                    if instructor.availability == UserAvailability.ON_LEAVE:
                        # Fallback to HOD
                        dept = db.query(Department).filter(Department.id == dept_id).first()
                        if dept and dept.hod_id:
                            return dept.hod_id, f"Course instructor {instructor.full_name} is on leave; routed to HOD"
                    else:
                        return instructor.id, "Routed to assigned course instructor"

        # Department HOD fallback
        dept = db.query(Department).filter(Department.id == dept_id).first()
        if dept and dept.hod_id:
            return dept.hod_id, "Routed to Department HOD"

        # Admin fallback
        admin = db.query(User).filter(User.role == UserRole.ADMIN, User.is_active == True).first()
        if admin:
            return admin.id, "Routed to Administrator (no instructor or HOD configured)"

        raise ValueError("No eligible user found to assign query")
