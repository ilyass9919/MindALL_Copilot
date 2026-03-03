from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    role = Column(String, nullable=False)     
    content = Column(Text, nullable=False)
    agent_type = Column(String, nullable=True)  # "marketing" | "finance" | "strategy"
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="messages")