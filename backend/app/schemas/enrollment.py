from pydantic import BaseModel

class EnrollmentOut(BaseModel):
    id: str
    course_id: str
    student_id: str
    enrolled_at: str
