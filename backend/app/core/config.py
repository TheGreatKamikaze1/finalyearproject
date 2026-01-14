from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Accessible E-Learning API"
    ENV: str = "dev"
    DEBUG: bool = True

    DATABASE_URL: str

    JWT_SECRET: str = Field(min_length=16)
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    CORS_ORIGINS: str = "http://localhost:3000"

settings = Settings()
