import json
from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import User, Course, Material, MaterialAccessibility, Enrollment, Progress
from app.schemas import (
    AccessibilityPreferences,
    MessageOut,
    TokenOut,
    UserCreate,
    UserLogin,
    UserOut,
    CourseCreate,
    CourseUpdate,
    CourseOut,
    MaterialCreate,
    MaterialUpdate,
    MaterialOut,
    MaterialAccessibilityCreate,
    MaterialAccessibilityOut,
    ProgressUpsert,
    ProgressOut,
    CourseProgressOut,
)
from app.security import create_access_token, get_current_user, hash_password, verify_password

Base.metadata.create_all(bind=engine)


def run_db_migrations():
    from sqlalchemy import text
    from sqlalchemy.exc import OperationalError
    
    with engine.begin() as conn:
        # Migrate dyslexia_font
        try:
            conn.execute(text("SELECT dyslexia_font FROM users LIMIT 1"))
        except OperationalError:
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN dyslexia_font BOOLEAN DEFAULT FALSE"))
                print("Migration: Added dyslexia_font column to users table.")
            except Exception as e:
                print(f"Migration error (dyslexia_font): {e}")

        # Migrate font_size
        try:
            conn.execute(text("SELECT font_size FROM users LIMIT 1"))
        except OperationalError:
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN font_size VARCHAR(20) DEFAULT 'medium'"))
                print("Migration: Added font_size column to users table.")
            except Exception as e:
                print(f"Migration error (font_size): {e}")


try:
    run_db_migrations()
except Exception as err:
    print(f"Failed to execute migrations: {err}")


app = FastAPI(
    title="AccessLearn API",
    description="Authentication and course management backend for an accessibility-first e-learning platform.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def serialize_user(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        disability_profile=json.loads(user.disability_profile or "[]"),
        preferred_format=user.preferred_format,
        high_contrast=user.high_contrast,
        reduce_motion=user.reduce_motion,
        captions_required=user.captions_required,
        screen_reader_optimized=user.screen_reader_optimized,
        dyslexia_font=user.dyslexia_font,
        font_size=user.font_size,
    )


@app.get("/", response_model=MessageOut)
def root():
    return {"message": "AccessLearn API is running."}


@app.get("/healthz", response_model=MessageOut)
def healthz():
    return {"message": "ok"}


@app.post("/auth/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account already exists for this email.",
        )

    user = User(
        full_name=payload.full_name.strip(),
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role=payload.role,
        disability_profile=json.dumps(payload.disability_profile),
        preferred_format=payload.preferred_format,
        high_contrast=payload.high_contrast,
        reduce_motion=payload.reduce_motion,
        captions_required=payload.captions_required,
        screen_reader_optimized=payload.screen_reader_optimized,
        dyslexia_font=payload.dyslexia_font,
        font_size=payload.font_size,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id))
    return {"access_token": token, "user": serialize_user(user)}


@app.post("/auth/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect.",
        )

    token = create_access_token(str(user.id))
    return {"access_token": token, "user": serialize_user(user)}


@app.get("/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return serialize_user(current_user)


@app.put("/auth/preferences", response_model=UserOut)
def update_preferences(
    payload: AccessibilityPreferences,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.disability_profile = json.dumps(payload.disability_profile)
    current_user.preferred_format = payload.preferred_format
    current_user.high_contrast = payload.high_contrast
    current_user.reduce_motion = payload.reduce_motion
    current_user.captions_required = payload.captions_required
    current_user.screen_reader_optimized = payload.screen_reader_optimized
    current_user.dyslexia_font = payload.dyslexia_font
    current_user.font_size = payload.font_size
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return serialize_user(current_user)


# --- Courses ---
@app.get("/courses", response_model=list[CourseOut])
def list_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "learner":
        courses = db.scalars(select(Course).where(Course.is_published == True)).all()
    elif current_user.role == "instructor":
        courses = db.scalars(select(Course).where(Course.instructor_id == current_user.id)).all()
    else:  # admin / support
        courses = db.scalars(select(Course)).all()
    return courses


@app.post("/courses", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(payload: CourseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ("instructor", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only instructors can create courses.")
    course = Course(
        instructor_id=current_user.id,
        course_code=payload.course_code.strip() if payload.course_code else None,
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else None,
        is_published=False,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@app.get("/courses/enrolled", response_model=list[CourseOut])
def list_enrolled_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    enrollments = db.scalars(select(Enrollment).where(Enrollment.student_id == current_user.id)).all()
    course_ids = [e.course_id for e in enrollments]
    if not course_ids:
        return []
    courses = db.scalars(select(Course).where(Course.id.in_(course_ids))).all()
    return courses


@app.get("/courses/{course_id}", response_model=CourseOut)
def get_course_detail(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if current_user.role == "learner" and not course.is_published:
        # Check if enrolled
        enrollment = db.scalar(select(Enrollment).where(Enrollment.course_id == course_id, Enrollment.student_id == current_user.id))
        if not enrollment:
            raise HTTPException(status_code=403, detail="Course is not accessible.")
    return course


@app.put("/courses/{course_id}", response_model=CourseOut)
def update_course(course_id: int, payload: CourseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if current_user.role != "admin" and course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this course.")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(course, key, value)

    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@app.delete("/courses/{course_id}", response_model=MessageOut)
def delete_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if current_user.role != "admin" and course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this course.")

    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully."}


@app.post("/courses/{course_id}/enroll", response_model=MessageOut)
def enroll_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if not course.is_published and current_user.role == "learner":
        raise HTTPException(status_code=403, detail="Cannot enroll in an unpublished course.")

    existing = db.scalar(select(Enrollment).where(Enrollment.course_id == course_id, Enrollment.student_id == current_user.id))
    if existing:
        return {"message": "Already enrolled in this course."}

    enrollment = Enrollment(course_id=course_id, student_id=current_user.id)
    db.add(enrollment)
    db.commit()
    return {"message": "Successfully enrolled."}


@app.delete("/courses/{course_id}/enroll", response_model=MessageOut)
def unenroll_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    enrollment = db.scalar(select(Enrollment).where(Enrollment.course_id == course_id, Enrollment.student_id == current_user.id))
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found.")

    db.delete(enrollment)
    db.commit()
    return {"message": "Successfully unenrolled."}


# --- Materials ---
@app.get("/courses/{course_id}/materials", response_model=list[MaterialOut])
def list_materials(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check access
    if current_user.role == "learner":
        enrollment = db.scalar(select(Enrollment).where(Enrollment.course_id == course_id, Enrollment.student_id == current_user.id))
        if not enrollment:
            raise HTTPException(status_code=403, detail="You must be enrolled to view course materials.")
    elif current_user.role == "instructor" and course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    materials = db.scalars(select(Material).where(Material.course_id == course_id)).all()
    return materials


@app.post("/courses/{course_id}/materials", response_model=MaterialOut, status_code=status.HTTP_201_CREATED)
def create_material(course_id: int, payload: MaterialCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if current_user.role != "admin" and course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to add materials to this course.")

    material = Material(
        course_id=course_id,
        uploaded_by=current_user.id,
        title=payload.title.strip(),
        material_type=payload.material_type.lower().strip(),
        content_text=payload.content_text,
        file_url=payload.file_url,
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@app.get("/materials/{material_id}", response_model=MaterialOut)
def get_material_detail(material_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    material = db.get(Material, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    course = db.get(Course, material.course_id)
    if current_user.role == "learner":
        enrollment = db.scalar(select(Enrollment).where(Enrollment.course_id == course.id, Enrollment.student_id == current_user.id))
        if not enrollment:
            raise HTTPException(status_code=403, detail="You must be enrolled to access this material.")
    elif current_user.role == "instructor" and course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")
    return material


@app.put("/materials/{material_id}", response_model=MaterialOut)
def update_material(material_id: int, payload: MaterialUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    material = db.get(Material, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    course = db.get(Course, material.course_id)
    if current_user.role != "admin" and course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to modify this material.")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(material, key, value)

    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@app.delete("/materials/{material_id}", response_model=MessageOut)
def delete_material(material_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    material = db.get(Material, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    course = db.get(Course, material.course_id)
    if current_user.role != "admin" and course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to delete this material.")

    db.delete(material)
    db.commit()
    return {"message": "Material deleted successfully."}


# --- Material Accessibility ---
@app.get("/materials/{material_id}/accessibility", response_model=list[MaterialAccessibilityOut])
def list_material_accessibility(material_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    material = db.get(Material, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    items = db.scalars(select(MaterialAccessibility).where(MaterialAccessibility.material_id == material_id)).all()
    return items


@app.post("/materials/{material_id}/accessibility", response_model=MaterialAccessibilityOut, status_code=status.HTTP_201_CREATED)
def create_material_accessibility(material_id: int, payload: MaterialAccessibilityCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    material = db.get(Material, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    course = db.get(Course, material.course_id)
    if current_user.role != "admin" and course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this course.")

    access_item = MaterialAccessibility(
        material_id=material_id,
        kind=payload.kind.lower().strip(),
        language=payload.language.strip(),
        file_url=payload.file_url,
        content_text=payload.content_text,
    )
    db.add(access_item)
    db.commit()
    db.refresh(access_item)
    return access_item


# --- Progress Tracking ---
@app.put("/materials/{material_id}/progress", response_model=ProgressOut)
def update_progress(material_id: int, payload: ProgressUpsert, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    material = db.get(Material, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # Check course enrollment
    enrollment = db.scalar(select(Enrollment).where(Enrollment.course_id == material.course_id, Enrollment.student_id == current_user.id))
    if not enrollment and current_user.role == "learner":
        raise HTTPException(status_code=403, detail="You must be enrolled in this course to track progress.")

    status_str = payload.status.lower().strip()
    if status_str not in ("not_started", "in_progress", "completed"):
        raise HTTPException(status_code=400, detail="Invalid status type.")

    progress = db.scalar(select(Progress).where(Progress.material_id == material_id, Progress.student_id == current_user.id))
    now = datetime.utcnow()

    if not progress:
        progress = Progress(
            student_id=current_user.id,
            material_id=material_id,
            status=status_str,
            last_opened_at=now,
            completed_at=now if status_str == "completed" else None,
        )
        db.add(progress)
    else:
        progress.status = status_str
        progress.last_opened_at = now
        if status_str == "completed":
            progress.completed_at = now
        else:
            progress.completed_at = None
        db.add(progress)

    db.commit()
    db.refresh(progress)
    return progress


@app.get("/progress/me", response_model=list[ProgressOut])
def list_my_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    progress_list = db.scalars(select(Progress).where(Progress.student_id == current_user.id)).all()
    return progress_list


# --- Instructor Analytics ---
@app.get("/courses/{course_id}/progress-summary", response_model=list[dict])
def course_progress_summary(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if current_user.role != "admin" and course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to view reports for this course.")

    # Get all enrollments
    enrollments = db.scalars(select(Enrollment).where(Enrollment.course_id == course_id)).all()

    # Get total materials
    total_materials = db.scalar(select(func.count(Material.id)).where(Material.course_id == course_id)) or 0

    summary = []
    for enroll in enrollments:
        student = db.get(User, enroll.student_id)
        if not student:
            continue

        completed_count = 0
        if total_materials > 0:
            # count progress status = 'completed'
            completed_count = (
                db.scalar(
                    select(func.count(Progress.id))
                    .join(Material, Material.id == Progress.material_id)
                    .where(Material.course_id == course_id, Progress.student_id == student.id, Progress.status == "completed")
                )
                or 0
            )

        percentage = round((completed_count / total_materials) * 100, 1) if total_materials > 0 else 0.0

        summary.append(
            {
                "student_id": student.id,
                "full_name": student.full_name,
                "email": student.email,
                "disability_profile": json.loads(student.disability_profile or "[]"),
                "completed_materials": completed_count,
                "total_materials": total_materials,
                "progress_percentage": percentage,
            }
        )

    return summary
