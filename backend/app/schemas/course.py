from datetime import datetime

from pydantic import BaseModel, Field

class CourseCreate(BaseModel):
    course_code: str | None = Field(default=None, max_length=20)
    title: str = Field(min_length=2, max_length=150)
    description: str | None = None

class CourseUpdate(BaseModel):
    course_code: str | None = Field(default=None, max_length=20)
    title: str | None = Field(default=None, max_length=150)
    description: str | None = None
    is_published: bool | None = None

class CourseOut(BaseModel):
    id: str
    instructor_id: str
    course_code: str | None
    title: str
    description: str | None
    is_published: bool
    created_at: datetime
