from pathlib import Path
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

BASE_DIR = Path(__file__).resolve().parents[2]

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(BASE_DIR / ".env", ".env"), extra="ignore")

    APP_NAME: str = "Accessible E-Learning API"
    ENV: str = "development"
    DEBUG: bool = False

    DATABASE_URL: str | None = None
    DATABASE_PUBLIC_URL: str | None = None
    POSTGRES_URL: str | None = None
    PGHOST: str | None = None
    PGPORT: int = 5432
    PGDATABASE: str | None = None
    PGUSER: str | None = None
    PGPASSWORD: str | None = None

    JWT_SECRET: str = Field(..., min_length=16)
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    AUTO_CREATE_TABLES: bool = True

    CORS_ORIGINS: str = "*"

    @property
    def database_url(self) -> str:
        url = self.DATABASE_URL or self.DATABASE_PUBLIC_URL or self.POSTGRES_URL
        if url:
            return url

        if all([self.PGHOST, self.PGDATABASE, self.PGUSER, self.PGPASSWORD]):
            user = quote_plus(self.PGUSER or "")
            password = quote_plus(self.PGPASSWORD or "")
            host = self.PGHOST
            database = quote_plus(self.PGDATABASE or "")
            return f"postgresql://{user}:{password}@{host}:{self.PGPORT}/{database}"

        raise RuntimeError(
            "Missing database configuration. Set DATABASE_URL on this service, "
            "or provide PGHOST, PGPORT, PGDATABASE, PGUSER, and PGPASSWORD."
        )

settings = Settings()
