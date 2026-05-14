from datetime import datetime
import uuid
from sqlalchemy import String, DateTime, func, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class AccessibilitySettings(Base):
    __tablename__ = "accessibility_settings"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    font_scale: Mapped[float] = mapped_column(default=1.00)
    contrast_mode: Mapped[str] = mapped_column(Enum("normal", "high", "dark", name="contrast_enum"), default="normal")
    tts_enabled: Mapped[bool] = mapped_column(default=False)
    reduce_motion: Mapped[bool] = mapped_column(default=False)
    dyslexia_friendly: Mapped[bool] = mapped_column(default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

from sqlalchemy.orm import relationship
from app.models.user import User
AccessibilitySettings.user = relationship("User", back_populates="accessibility_settings")

class Progress(Base):
    __tablename__ = "progress"
    __table_args__ = (UniqueConstraint("student_id", "material_id", name="uq_progress_student_material"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    material_id: Mapped[str] = mapped_column(String(36), ForeignKey("materials.id", ondelete="CASCADE"), nullable=False)

    status: Mapped[str] = mapped_column(Enum("not_started", "in_progress", "completed", name="progress_status_enum"), default="not_started")
    last_opened_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
