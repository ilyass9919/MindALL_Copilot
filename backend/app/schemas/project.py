from pydantic import BaseModel, Field
from typing import Optional, List


class ProjectCreate(BaseModel):
    """Used when first creating a project — only essentials required."""
    title: str
    industry: str
    description: str


class ProjectOnboarding(BaseModel):
    """Enrich the project with full entrepreneur context."""
    vision: Optional[str] = Field(None, example="Become the #1 premium coffee brand for Gen Z in Europe")
    target_market: Optional[str] = Field(None, example="Gen Z, 18-28, urban, coffee enthusiasts")
    value_proposition: Optional[str] = Field(None, example="Specialty coffee delivered to your door")
    business_model: Optional[str] = Field(None, example="Monthly subscription, $22/month")
    main_challenges: Optional[str] = Field(None, example="Low brand awareness, tight margins")
    priorities: Optional[List[str]] = Field(None, example=["Launch MVP", "Get first 10 subscribers"])


class ProjectResponse(BaseModel):
    """Returned by all project endpoints."""
    id: int
    title: str
    industry: str
    description: str
    vision: Optional[str] = None
    target_market: Optional[str] = None
    value_proposition: Optional[str] = None
    business_model: Optional[str] = None
    main_challenges: Optional[str] = None
    priorities: Optional[List[str]] = None
    ai_analysis: Optional[str] = None

    class Config:
        from_attributes = True

