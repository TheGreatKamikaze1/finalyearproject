from pydantic import BaseModel, Field

class MaterialCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    material_type: str  # text/pdf/video/audio
    content_text: str | None = None
    file_url: str | None = None

class MaterialUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    content_text: str | None = None
    file_url: str | None = None

class MaterialOut(BaseModel):
    id: str
    course_id: str
    uploaded_by: str
    title: str
    material_type: str
    content_text: str | None
    file_url: str | None
    created_at: str

class MaterialAccessibilityCreate(BaseModel):
    kind: str  # captions/transcript/audio_description
    language: str = "en"
    file_url: str

class MaterialAccessibilityOut(BaseModel):
    id: str
    material_id: str
    kind: str
    language: str
    file_url: str
    created_at: str
