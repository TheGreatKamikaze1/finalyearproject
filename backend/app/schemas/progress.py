from pydantic import BaseModel

class ProgressUpsert(BaseModel):
    status: str  # not_started / in_progress / completed

class ProgressOut(BaseModel):
    id: str
    student_id: str
    material_id: str
    status: str
    last_opened_at: str | None
    completed_at: str | None
