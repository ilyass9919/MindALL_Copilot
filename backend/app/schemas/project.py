from pydantic import BaseModel
from typing import Optional

class ProjectCreate(BaseModel):
    title: str
    industry: str
    description: str

class ProjectResponse(ProjectCreate):
    id: int
    # NEW: Let the frontend see the saved analysis
    ai_analysis: Optional[str] = None

    class Config:
        from_attributes = True