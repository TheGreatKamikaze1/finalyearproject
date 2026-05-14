from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.schemas.course import CourseCreate, CourseUpdate, CourseOut
import uuid

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("", response_model=list[CourseOut])
def list_courses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # students see published courses; instructors/admin see all
    q = db.query(Course)
    if user.role == "student":
        q = q.filter(Course.is_published == True)  # noqa: E712
    courses = q.order_by(Course.created_at.desc()).all()
    return [CourseOut(**c.__dict__) for c in courses]

@router.post("", response_model=CourseOut)
def create_course(payload: CourseCreate, db: Session = Depends(get_db), user: User = Depends(require_roles("instructor", "admin"))):
    c = Course(
        id=str(uuid.uuid4()),
        instructor_id=user.id,
        course_code=payload.course_code,
        title=payload.title,
        description=payload.description,
        is_published=False,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return CourseOut(**c.__dict__)

@router.get("/me/enrollments", response_model=list[CourseOut])
def my_enrolled_courses(db: Session = Depends(get_db), user: User = Depends(require_roles("student", "admin"))):
    courses = (
        db.query(Course)
        .join(Enrollment, Enrollment.course_id == Course.id)
        .filter(Enrollment.student_id == user.id)
        .order_by(Course.created_at.desc())
        .all()
    )
    return [CourseOut(**c.__dict__) for c in courses]

@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    c = db.get(Course, course_id)
    if not c:
        raise HTTPException(404, "Course not found")
    if user.role == "student" and not c.is_published:
        raise HTTPException(403, "Course not available")
    return CourseOut(**c.__dict__)

@router.patch("/{course_id}", response_model=CourseOut)
def update_course(course_id: str, payload: CourseUpdate, db: Session = Depends(get_db), user: User = Depends(require_roles("instructor", "admin"))):
    c = db.get(Course, course_id)
    if not c:
        raise HTTPException(404, "Course not found")

    if user.role == "instructor" and c.instructor_id != user.id:
        raise HTTPException(403, "Not your course")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(c, k, v)

    db.commit()
    db.refresh(c)
    return CourseOut(**c.__dict__)

@router.delete("/{course_id}")
def delete_course(course_id: str, db: Session = Depends(get_db), user: User = Depends(require_roles("instructor", "admin"))):
    c = db.get(Course, course_id)
    if not c:
        raise HTTPException(404, "Course not found")
    if user.role == "instructor" and c.instructor_id != user.id:
        raise HTTPException(403, "Not your course")
    db.delete(c)
    db.commit()
    return {"message": "Course deleted"}

@router.post("/{course_id}/enroll")
def enroll(course_id: str, db: Session = Depends(get_db), user: User = Depends(require_roles("student", "admin"))):
    c = db.get(Course, course_id)
    if not c:
        raise HTTPException(404, "Course not found")
    if user.role == "student" and not c.is_published:
        raise HTTPException(403, "Course not published")

    existing = db.query(Enrollment).filter(Enrollment.course_id == course_id, Enrollment.student_id == user.id).first()
    if existing:
        return {"message": "Already enrolled"}

    e = Enrollment(id=str(uuid.uuid4()), course_id=course_id, student_id=user.id)
    db.add(e)
    db.commit()
    return {"message": "Enrolled"}

@router.delete("/{course_id}/enroll")
def unenroll(course_id: str, db: Session = Depends(get_db), user: User = Depends(require_roles("student", "admin"))):
    e = db.query(Enrollment).filter(Enrollment.course_id == course_id, Enrollment.student_id == user.id).first()
    if not e:
        raise HTTPException(404, "Enrollment not found")
    db.delete(e)
    db.commit()
    return {"message": "Unenrolled"}
