from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.accessibility import AccessibilityOut, AccessibilityUpdate
from app.models.user import User
from app.models.progress import AccessibilitySettings

router = APIRouter(prefix="/accessibility", tags=["Accessibility"])

@router.get("/me", response_model=AccessibilityOut)
def get_my_settings(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    s = db.get(AccessibilitySettings, user.id)
    if not s:
        s = AccessibilitySettings(user_id=user.id)
        db.add(s)
        db.commit()
        db.refresh(s)
    return AccessibilityOut(
        font_scale=float(s.font_scale),
        contrast_mode=s.contrast_mode,
        tts_enabled=bool(s.tts_enabled),
        reduce_motion=bool(s.reduce_motion),
        dyslexia_friendly=bool(s.dyslexia_friendly),
    )

@router.put("/me", response_model=AccessibilityOut)
def update_my_settings(payload: AccessibilityUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    s = db.get(AccessibilitySettings, user.id)
    if not s:
        s = AccessibilitySettings(user_id=user.id)
        db.add(s)

    if payload.font_scale is not None:
        s.font_scale = payload.font_scale

    if payload.contrast_mode is not None:
        cm = payload.contrast_mode.lower().strip()
        if cm not in ("normal", "high", "dark"):
            raise HTTPException(status_code=400, detail="Invalid contrast_mode")
        s.contrast_mode = cm

    for field in ("tts_enabled", "reduce_motion", "dyslexia_friendly"):
        v = getattr(payload, field)
        if v is not None:
            setattr(s, field, v)

    db.commit()
    db.refresh(s)

    return AccessibilityOut(
        font_scale=float(s.font_scale),
        contrast_mode=s.contrast_mode,
        tts_enabled=bool(s.tts_enabled),
        reduce_motion=bool(s.reduce_motion),
        dyslexia_friendly=bool(s.dyslexia_friendly),
    )
