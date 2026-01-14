from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles, get_current_user
from app.models.user import User
from app.models.material import Material
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.progress import Progress
from app.schemas.progress import ProgressUpsert, ProgressOut
import uuid

router = APIRouter(prefix="/progress", tags=["Progress"])

def _ensure_student_can_access_material(db: Session, user: User, material: Material) -> None:
    course = db.get(Course, material.course_id)
    if not course or not course.is_published:
        raise HTTPException(403, "Course not available")
    enrolled = db.query(Enrollment).filter(
        Enrollment.course_id == course.id,
        Enrollment.student_id == user.id
    ).first()
    if not enrolled:
        raise HTTPException(403, "Not enrolled")

@router.put("/materials/{material_id}", response_model=ProgressOut)
def upsert_progress(material_id: str, payload: ProgressUpsert, db: Session = Depends(get_db), user: User = Depends(require_roles("student", "admin"))):
    m = db.get(Material, material_id)
    if not m:
        raise HTTPException(404, "Material not found")

    if user.role == "student":
        _ensure_student_can_access_material(db, user, m)

    status = payload.status.lower().strip()
    if status not in ("not_started", "in_progress", "completed"):
        raise HTTPException(400, "Invalid status")

    p = db.query(Progress).filter(Progress.student_id == user.id, Progress.material_id == material_id).first()
    now = datetime.now(timezone.utc)

    if not p:
        p = Progress(
            id=str(uuid.uuid4()),
            student_id=user.id,
            material_id=material_id,
            status=status,
            last_opened_at=now,
            completed_at=(now if status == "completed" else None),
        )
        db.add(p)
    else:
        p.status = status
        p.last_opened_at = now
        if status == "completed":
            p.completed_at = now

    db.commit()
    db.refresh(p)

    return ProgressOut(
        id=p.id,
        student_id=p.student_id,
        material_id=p.material_id,
        status=p.status,
        last_opened_at=p.last_opened_at.isoformat() if p.last_opened_at else None,
        completed_at=p.completed_at.isoformat() if p.completed_at else None,
    )

@router.get("/me", response_model=list[ProgressOut])
def my_progress(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = db.query(Progress).filter(Progress.student_id == user.id).all()
    return [
        ProgressOut(
            id=x.id,
            student_id=x.student_id,
            material_id=x.material_id,
            status=x.status,
            last_opened_at=x.last_opened_at.isoformat() if x.last_opened_at else None,
            completed_at=x.completed_at.isoformat() if x.completed_at else None,
        )
        for x in items
    ]
