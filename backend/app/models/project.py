from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)

    # Owner
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="projects")

    # Basic info
    title = Column(String, index=True)
    industry = Column(String)
    description = Column(Text)

    # Onboarding
    vision = Column(Text, nullable=True)
    target_market = Column(Text, nullable=True)
    value_proposition = Column(Text, nullable=True)
    business_model = Column(Text, nullable=True)
    main_challenges = Column(Text, nullable=True)
    priorities = Column(JSON, nullable=True)

    # AI output
    ai_analysis = Column(Text, nullable=True)

    # Chat history
    messages = relationship("ChatMessage", back_populates="project", 
                           cascade="all, delete-orphan",
                           order_by="ChatMessage.created_at")