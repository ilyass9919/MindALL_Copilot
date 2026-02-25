from sqlalchemy import Column, Integer, String, Text
from app.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    industry = Column(String)
    description = Column(Text)
    vision = Column(Text, nullable=True)
    
    # NEW: A place to save the AI's strategic analysis
    ai_analysis = Column(Text, nullable=True)