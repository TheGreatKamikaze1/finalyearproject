import uuid
from sqlalchemy import String, DateTime, func, Text, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Material(Base):
    __tablename__ = "materials"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id: Mapped[str] = mapped_column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    uploaded_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    material_type: Mapped[str] = mapped_column(Enum("text", "pdf", "video", "audio", name="material_type_enum"), nullable=False)
    content_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    course = relationship("Course", back_populates="materials")
    accessibility = relationship("MaterialAccessibility", back_populates="material", cascade="all, delete")

class MaterialAccessibility(Base):
    __tablename__ = "material_accessibility"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    material_id: Mapped[str] = mapped_column(String(36), ForeignKey("materials.id", ondelete="CASCADE"), nullable=False)

    kind: Mapped[str] = mapped_column(Enum("captions", "transcript", "audio_description", name="ma_kind_enum"), nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="en")
    file_url: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    material = relationship("Material", back_populates="accessibility")
