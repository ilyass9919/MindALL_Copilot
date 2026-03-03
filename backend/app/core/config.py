import os
from pydantic_settings import BaseSettings, SettingsConfigDict

base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(base_dir, ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "MindAll Copilot"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    OPENAI_API_KEY: str
    OPENAI_BASE_URL: str
    PINECONE_API_KEY: str = ""
    TAVILY_API_KEY: str
    DATABASE_URL: str

    # JWT
    JWT_SECRET: str = "we-should-change-this-to-a-secure-random-string"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 48

    model_config = SettingsConfigDict(
        env_file=env_path,
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

