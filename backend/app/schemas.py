from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

Role = Literal["learner", "instructor", "support", "guardian", "student"]
LearningFormat = Literal["mixed", "video", "audio", "text", "visual", "interactive"]


class AccessibilityPreferences(BaseModel):
    disability_profile: list[str] = Field(default_factory=list)
    preferred_format: LearningFormat = "mixed"
    high_contrast: bool = False
    reduce_motion: bool = False
    captions_required: bool = True
    screen_reader_optimized: bool = False
    dyslexia_font: bool = False
    font_size: str = "medium"
    accessibility_mode: str = "standard"
    guardian_contact_name: str | None = None
    guardian_contact_info: str | None = None


class UserCreate(AccessibilityPreferences):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Role = "learner"


class UserProfileUpdate(AccessibilityPreferences):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr



class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class UserOut(AccessibilityPreferences):
    id: int
    full_name: str
    email: EmailStr
    role: Role

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MessageOut(BaseModel):
    message: str



# --- COURSE SCHEMAS ---
class CourseCreate(BaseModel):
    course_code: str | None = Field(default=None, max_length=20)
    title: str = Field(min_length=2, max_length=150)
    description: str | None = None


class CourseUpdate(BaseModel):
    course_code: str | None = None
    title: str | None = None
    description: str | None = None
    is_published: bool | None = None


class CourseOut(BaseModel):
    id: int
    instructor_id: int
    course_code: str | None
    title: str
    description: str | None
    is_published: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# --- MATERIAL SCHEMAS ---
class MaterialCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    material_type: str  # 'text', 'pdf', 'video', 'audio'
    content_text: str | None = None
    file_url: str | None = None


class MaterialUpdate(BaseModel):
    title: str | None = None
    content_text: str | None = None
    file_url: str | None = None


class MaterialOut(BaseModel):
    id: int
    course_id: int
    uploaded_by: int
    title: str
    material_type: str
    content_text: str | None
    file_url: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# --- MATERIAL ACCESSIBILITY SCHEMAS ---
class MaterialAccessibilityCreate(BaseModel):
    kind: str  # 'captions', 'transcript', 'audio_description', 'sign_language'
    language: str = "en"
    file_url: str | None = None
    content_text: str | None = None


class MaterialAccessibilityOut(BaseModel):
    id: int
    material_id: int
    kind: str
    language: str
    file_url: str | None
    content_text: str | None

    model_config = {"from_attributes": True}


# --- PROGRESS SCHEMAS ---
class ProgressUpsert(BaseModel):
    status: str  # 'not_started', 'in_progress', 'completed'


class ProgressOut(BaseModel):
    id: int
    student_id: int
    material_id: int
    status: str
    last_opened_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class CourseProgressOut(BaseModel):
    course_id: int
    total_materials: int
    completed_materials: int
    progress_percentage: float


# --- QUIZ & QUESTION SCHEMAS ---
class QuestionCreate(BaseModel):
    text: str
    audio_url: str | None = None
    question_type: str = "multiple_choice"  # 'multiple_choice', 'true_false'
    options: list[str] = Field(default_factory=list)
    correct_answer: str


class QuestionOut(BaseModel):
    id: int
    quiz_id: int
    text: str
    audio_url: str | None
    question_type: str
    options: list[str]
    correct_answer: str

    model_config = {"from_attributes": True}


class QuizCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    description: str | None = None
    questions: list[QuestionCreate] = Field(default_factory=list)


class QuizOut(BaseModel):
    id: int
    course_id: int
    title: str
    description: str | None
    created_at: datetime
    questions: list[QuestionOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class QuizAnswerSubmit(BaseModel):
    question_id: int
    answer: str


class QuizSubmit(BaseModel):
    answers: list[QuizAnswerSubmit]


class QuizResultOut(BaseModel):
    id: int
    student_id: int
    quiz_id: int
    score: float
    total_questions: int
    completed_at: datetime

    model_config = {"from_attributes": True}


# --- NOTIFICATION SCHEMAS ---
class NotificationCreate(BaseModel):
    user_id: int | None = None
    title: str
    message: str
    type: str = "alert"


class NotificationOut(BaseModel):
    id: int
    user_id: int | None
    title: str
    message: str
    type: str
    created_at: datetime
    is_read: bool

    model_config = {"from_attributes": True}


# --- DISCUSSION FORUM SCHEMAS ---
class DiscussionPostCreate(BaseModel):
    message: str


class DiscussionPostOut(BaseModel):
    id: int
    course_id: int
    student_id: int
    full_name: str
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}


# --- CHAT MESSAGE SCHEMAS ---
class ChatMessageCreate(BaseModel):
    recipient_id: int
    message: str


class ChatMessageOut(BaseModel):
    id: int
    sender_id: int
    recipient_id: int
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}


