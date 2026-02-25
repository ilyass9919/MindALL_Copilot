import os
from pydantic_settings import BaseSettings, SettingsConfigDict

base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(base_dir, ".env")

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "MindAll Copilot"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # These MUST exist in your .env file
    OPENAI_API_KEY: str
    PINECONE_API_KEY: str
    DATABASE_URL: str
    OPENAI_BASE_URL: str

    model_config = SettingsConfigDict(
        env_file=env_path,  # Use the absolute path we calculated
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()