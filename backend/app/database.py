from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create the engine
engine = create_engine(settings.DATABASE_URL)

# Create a SessionLocal class for creating DB sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class for our models to inherit from
Base = declarative_base()

# Dependency to get the DB session in our routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()