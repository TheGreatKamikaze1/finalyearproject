from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.courses import router as courses_router
from app.routers.materials import router as materials_router
from app.routers.accessibility import router as accessibility_router
from app.routers.progress import router as progress_router

__all__ = [
    "auth_router",
    "users_router",
    "courses_router",
    "materials_router",
    "accessibility_router",
    "progress_router",
]
