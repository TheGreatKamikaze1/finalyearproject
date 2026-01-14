from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
import app.models  # noqa: F401 (ensures models are imported)

from app.routers import (
    auth_router, users_router, courses_router,
    materials_router, accessibility_router, progress_router
)

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables automatically (fine for school projects)
Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(accessibility_router)
app.include_router(courses_router)
app.include_router(materials_router)
app.include_router(progress_router)

@app.get("/")
def root():
    return {"message": "Accessible E-Learning API is running"}
