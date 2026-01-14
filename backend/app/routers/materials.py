from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.material import Material, MaterialAccessibility
from app.schemas.material import (
    MaterialCreate, MaterialUpdate, MaterialOut,
    MaterialAccessibilityCreate, MaterialAccessibilityOut
)
import uuid

router = APIRouter(prefix="", tags=["Materials"])

def _can_view_course(db: Session, user: User, course: Course) -> bool:
    if user.role in ("admin",):
        return True
    if user.role == "instructor" and course.instructor_id == user.id:
        return True
    if user.role == "student":
        if not course.is_published:
            return False
        enrolled = db.query(Enrollment).filter(
            Enrollment.course_id == course.id,
            Enrollment.student_id == user.id
        ).first()
        return enrolled is not None
    return False

@router.get("/courses/{course_id}/materials", response_model=list[MaterialOut])
def list_course_materials(course_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(404, "Course not found")
    if not _can_view_course(db, user, course):
        raise HTTPException(403, "No access to this course")

    mats = db.query(Material).filter(Material.course_id == course_id).order_by(Material.created_at.desc()).all()
    return [MaterialOut(**m.__dict__) for m in mats]

@router.post("/courses/{course_id}/materials", response_model=MaterialOut)
def create_material(course_id: str, payload: MaterialCreate, db: Session = Depends(get_db), user: User = Depends(require_roles("instructor", "admin"))):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(404, "Course not found")
    if user.role == "instructor" and course.instructor_id != user.id:
        raise HTTPException(403, "Not your course")

    mt = payload.material_type.lower().strip()
    if mt not in ("text", "pdf", "video", "audio"):
        raise HTTPException(400, "Invalid material_type")

    if mt == "text" and not payload.content_text:
        raise HTTPException(400, "content_text is required for text materials")

    if mt in ("pdf", "video", "audio") and not payload.file_url:
        raise HTTPException(400, "file_url is required for pdf/video/audio materials")

    m = Material(
        id=str(uuid.uuid4()),
        course_id=course_id,
        uploaded_by=user.id,
        title=payload.title,
        material_type=mt,
        content_text=payload.content_text,
        file_url=payload.file_url
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return MaterialOut(**m.__dict__)

@router.get("/materials/{material_id}", response_model=MaterialOut)
def get_material(material_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    m = db.get(Material, material_id)
    if not m:
        raise HTTPException(404, "Material not found")
    course = db.get(Course, m.course_id)
    if not course or not _can_view_course(db, user, course):
        raise HTTPException(403, "No access")
    return MaterialOut(**m.__dict__)

@router.patch("/materials/{material_id}", response_model=MaterialOut)
def update_material(material_id: str, payload: MaterialUpdate, db: Session = Depends(get_db), user: User = Depends(require_roles("instructor", "admin"))):
    m = db.get(Material, material_id)
    if not m:
        raise HTTPException(404, "Material not found")

    course = db.get(Course, m.course_id)
    if user.role == "instructor" and course and course.instructor_id != user.id:
        raise HTTPException(403, "Not your course")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(m, k, v)

    db.commit()
    db.refresh(m)
    return MaterialOut(**m.__dict__)

@router.delete("/materials/{material_id}")
def delete_material(material_id: str, db: Session = Depends(get_db), user: User = Depends(require_roles("instructor", "admin"))):
    m = db.get(Material, material_id)
    if not m:
        raise HTTPException(404, "Material not found")
    course = db.get(Course, m.course_id)
    if user.role == "instructor" and course and course.instructor_id != user.id:
        raise HTTPException(403, "Not your course")
    db.delete(m)
    db.commit()
    return {"message": "Material deleted"}

# Captions/Transcript/Audio description
@router.get("/materials/{material_id}/accessibility", response_model=list[MaterialAccessibilityOut])
def list_material_accessibility(material_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    m = db.get(Material, material_id)
    if not m:
        raise HTTPException(404, "Material not found")
    course = db.get(Course, m.course_id)
    if not course or not _can_view_course(db, user, course):
        raise HTTPException(403, "No access")
    items = db.query(MaterialAccessibility).filter(MaterialAccessibility.material_id == material_id).all()
    return [MaterialAccessibilityOut(**x.__dict__) for x in items]

@router.post("/materials/{material_id}/accessibility", response_model=MaterialAccessibilityOut)
def add_material_accessibility(material_id: str, payload: MaterialAccessibilityCreate, db: Session = Depends(get_db), user: User = Depends(require_roles("instructor", "admin"))):
    m = db.get(Material, material_id)
    if not m:
        raise HTTPException(404, "Material not found")
    course = db.get(Course, m.course_id)
    if user.role == "instructor" and course and course.instructor_id != user.id:
        raise HTTPException(403, "Not your course")

    kind = payload.kind.lower().strip()
    if kind not in ("captions", "transcript", "audio_description"):
        raise HTTPException(400, "Invalid kind")

    item = MaterialAccessibility(
        id=str(uuid.uuid4()),
        material_id=material_id,
        kind=kind,
        language=payload.language,
        file_url=payload.file_url,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return MaterialAccessibilityOut(**item.__dict__)
