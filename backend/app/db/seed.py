from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.enums import UserRole, UserAvailability, PriorityLevel
from app.models.user import User
from app.models.department import Department
from app.models.course import Course
from app.models.routing_rule import RoutingRule
from app.models.announcement import Announcement, AnnouncementAudience


def seed_database():
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@university.edu.pk").first():
            print("Database already seeded. Skipping initial seed.")
            return

        print("Seeding initial users for all 4 roles...")
        admin = User(
            email="admin@university.edu.pk",
            full_name="System Administrator",
            role=UserRole.ADMIN,
            is_active=True,
            availability=UserAvailability.AVAILABLE,
            phone="+923001112233"
        )
        db.add(admin)
        db.flush()

        hod_cs = User(
            email="hod.cs@university.edu.pk",
            full_name="Dr. Arshad Khan (HOD CS)",
            role=UserRole.HOD,
            is_active=True,
            availability=UserAvailability.AVAILABLE,
            phone="+923002223344"
        )
        db.add(hod_cs)
        db.flush()

        instructor_cs = User(
            email="instructor.cs@university.edu.pk",
            full_name="Prof. Sarah Ahmed",
            role=UserRole.INSTRUCTOR,
            is_active=True,
            availability=UserAvailability.AVAILABLE,
            phone="+923003334455"
        )
        db.add(instructor_cs)
        db.flush()

        student = User(
            email="student1@university.edu.pk",
            full_name="Ali Raza",
            role=UserRole.STUDENT,
            is_active=True,
            availability=UserAvailability.AVAILABLE,
            phone="+923004445566"
        )
        db.add(student)
        db.flush()

        print("Seeding departments...")
        dept_cs = Department(
            name="Computer Science & IT",
            code="CS",
            contact_email="cs.helpdesk@university.edu.pk",
            hod_id=hod_cs.id
        )
        dept_ee = Department(
            name="Electrical Engineering",
            code="EE",
            contact_email="ee.helpdesk@university.edu.pk",
            hod_id=None
        )
        dept_bba = Department(
            name="Management & Business",
            code="BBA",
            contact_email="bba.helpdesk@university.edu.pk",
            hod_id=None
        )
        db.add_all([dept_cs, dept_ee, dept_bba])
        db.flush()

        # Associate HOD and Instructor with CS department
        hod_cs.dept_id = dept_cs.id
        instructor_cs.dept_id = dept_cs.id

        print("Seeding courses...")
        course_cs619 = Course(
            code="CS619",
            name="Final Year Project",
            dept_id=dept_cs.id,
            instructor_id=instructor_cs.id
        )
        course_cs501 = Course(
            code="CS501",
            name="Advanced Software Engineering",
            dept_id=dept_cs.id,
            instructor_id=instructor_cs.id
        )
        course_ee201 = Course(
            code="EE201",
            name="Circuit Theory & Design",
            dept_id=dept_ee.id,
            instructor_id=None
        )
        db.add_all([course_cs619, course_cs501, course_ee201])
        db.flush()

        print("Seeding default routing rules...")
        rule_cs619 = RoutingRule(
            keyword="CS619",
            dept_id=dept_cs.id,
            course_id=course_cs619.id,
            priority=PriorityLevel.HIGH,
            is_active=True,
            created_by=admin.id
        )
        rule_fyp = RoutingRule(
            keyword="final year project",
            dept_id=dept_cs.id,
            course_id=course_cs619.id,
            priority=PriorityLevel.HIGH,
            is_active=True,
            created_by=admin.id
        )
        rule_fee = RoutingRule(
            keyword="challan",
            dept_id=dept_bba.id,
            course_id=None,
            priority=PriorityLevel.MEDIUM,
            is_active=True,
            created_by=admin.id
        )
        db.add_all([rule_cs619, rule_fyp, rule_fee])

        print("Seeding welcome announcement...")
        announcement = Announcement(
            created_by=admin.id,
            title="Welcome to Smart Query Routing System",
            body="Welcome to the automated query routing portal. Students can submit course and department queries here or via WhatsApp and Email.",
            audience=AnnouncementAudience.ALL
        )
        db.add(announcement)

        db.commit()
        print("Database seeded successfully with initial users, departments, courses, rules, and announcements!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
