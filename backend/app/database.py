from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# 1. Create the engine
# check_same_thread=False is only needed for SQLite, but good to know
engine = create_engine(settings.DATABASE_URL)

# 2. Create a SessionLocal class (the factory for DB sessions)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Create a Base class for our models to inherit from
Base = declarative_base()

# 4. Dependency to get the DB session in our routes (Common Interview Question!)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()