from pydantic import BaseModel, Field

class AccessibilityOut(BaseModel):
    font_scale: float
    contrast_mode: str
    tts_enabled: bool
    reduce_motion: bool
    dyslexia_friendly: bool

class AccessibilityUpdate(BaseModel):
    font_scale: float | None = Field(default=None, ge=0.7, le=2.0)
    contrast_mode: str | None = None  # normal/high/dark
    tts_enabled: bool | None = None
    reduce_motion: bool | None = None
    dyslexia_friendly: bool | None = None
