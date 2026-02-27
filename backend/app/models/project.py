from sqlalchemy import Column, Integer, String, Text, JSON
from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)

    # Basic info
    title = Column(String, index=True)
    industry = Column(String)
    description = Column(Text)

    # ── Onboarding fields
    vision = Column(Text, nullable=True)            # "Where do you want to be in 3 years?"
    target_market = Column(Text, nullable=True)     # "Who is your ideal customer?"
    value_proposition = Column(Text, nullable=True) # "What problem do you solve?"
    business_model = Column(Text, nullable=True)    # "How do you make money?"
    main_challenges = Column(Text, nullable=True)   # "What are your top 3 challenges?"
    priorities = Column(JSON, nullable=True)        # ["Launch MVP", "Find first 10 clients", ...]

    # AI output
    ai_analysis = Column(Text, nullable=True)

